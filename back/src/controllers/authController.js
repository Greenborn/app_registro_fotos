const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { emitToUser } = require('../config/websocket');
const { createAuditLog } = require('../utils/auditLogger');

class AuthController {
  // Login de usuario
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validar campos requeridos
      if (!username || !password) {
        return res.status(400).json({
          error: 'Campos requeridos',
          message: 'Username y password son requeridos'
        });
      }

      // Buscar usuario
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Username o password incorrectos'
        });
      }

      // Verificar contraseña
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Username o password incorrectos'
        });
      }

      // Verificar si el usuario está activo
      if (user.status !== 'active') {
        return res.status(403).json({
          error: 'Usuario inactivo',
          message: 'Tu cuenta está inactiva. Contacta al administrador.'
        });
      }

      // Generar tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Actualizar último login
      await User.updateLastLogin(user.id);

      // Crear sesión
      await this.createSession(user.id, accessToken, refreshToken, req);

      // Log de auditoría
      await createAuditLog({
        userId: user.id,
        action: 'login',
        tableName: 'users',
        recordId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emitir evento de login exitoso
      emitToUser(user.id, 'login_success', {
        userId: user.id,
        username: user.username,
        role: user.role
      });

      // Retornar respuesta
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error durante el login'
      });
    }
  }

  // Logout de usuario
  async logout(req, res) {
    try {
      const { userId } = req.user;
      const { refreshToken } = req.body;

      // Invalidar sesión
      await this.invalidateSession(userId, refreshToken);

      // Log de auditoría
      await createAuditLog({
        userId,
        action: 'logout',
        tableName: 'users',
        recordId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emitir evento de logout
      emitToUser(userId, 'logout_success', { userId });

      res.json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error durante el logout'
      });
    }
  }

  // Renovar token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Token requerido',
          message: 'Refresh token es requerido'
        });
      }

      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Verificar si la sesión existe y está activa
      const session = await this.getSessionByRefreshToken(refreshToken);
      if (!session || !session.is_active) {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'Refresh token inválido o expirado'
        });
      }

      // Obtener usuario
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          error: 'Usuario inválido',
          message: 'Usuario no encontrado o inactivo'
        });
      }

      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Actualizar sesión
      await this.updateSession(session.id, newAccessToken);

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      console.error('Error en refresh token:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'Refresh token inválido'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          message: 'Refresh token expirado'
        });
      }

      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al renovar el token'
      });
    }
  }

  // Verificar token
  async verifyToken(req, res) {
    try {
      const { userId } = req.user;
      
      const user = await User.findById(userId);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          error: 'Usuario inválido',
          message: 'Usuario no encontrado o inactivo'
        });
      }

      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: userWithoutPassword
        }
      });

    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al verificar el token'
      });
    }
  }

  // Crear sesión
  async createSession(userId, accessToken, refreshToken, req) {
    const { db } = require('../config/database');
    
    await db('user_sessions').insert({
      user_id: userId,
      session_token: accessToken,
      refresh_token: refreshToken,
      device_info: req.get('User-Agent'),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      is_active: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      created_at: new Date(),
      last_activity: new Date()
    });
  }

  // Invalidar sesión
  async invalidateSession(userId, refreshToken) {
    const { db } = require('../config/database');
    
    await db('user_sessions')
      .where('user_id', userId)
      .where('refresh_token', refreshToken)
      .update({
        is_active: false,
        last_activity: new Date()
      });
  }

  // Obtener sesión por refresh token
  async getSessionByRefreshToken(refreshToken) {
    const { db } = require('../config/database');
    
    return await db('user_sessions')
      .where('refresh_token', refreshToken)
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .first();
  }

  // Actualizar sesión
  async updateSession(sessionId, accessToken) {
    const { db } = require('../config/database');
    
    await db('user_sessions')
      .where('id', sessionId)
      .update({
        session_token: accessToken,
        last_activity: new Date()
      });
  }

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      // Validar campos
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Campos requeridos',
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      // Obtener usuario con password hash
      const user = await User.findByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await User.verifyPassword(user, currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Contraseña incorrecta',
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Actualizar contraseña
      await User.update(userId, { password: newPassword });

      // Log de auditoría
      await createAuditLog({
        userId,
        action: 'change_password',
        tableName: 'users',
        recordId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error en cambio de contraseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al cambiar la contraseña'
      });
    }
  }
}

module.exports = new AuthController(); 