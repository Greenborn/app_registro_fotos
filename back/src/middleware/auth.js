const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token requerido',
        message: 'Se requiere un token de autenticación'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si la sesión existe y está activa
    const session = await db('user_sessions')
      .where('session_token', token)
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .first();

    if (!session) {
      return res.status(401).json({
        error: 'Sesión inválida',
        message: 'La sesión ha expirado o es inválida'
      });
    }

    // Obtener información del usuario
    const user = await db('users')
      .where('id', decoded.userId)
      .where('status', 'active')
      .first();

    if (!user) {
      return res.status(401).json({
        error: 'Usuario inválido',
        message: 'El usuario no existe o está inactivo'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.full_name
    };

    // Actualizar última actividad de la sesión
    await db('user_sessions')
      .where('id', session.id)
      .update({ last_activity: new Date() });

    next();

  } catch (error) {
    console.error('Error en autenticación:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token de autenticación es inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token de autenticación ha expirado'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error durante la autenticación'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string|Array} roles - Rol o roles permitidos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Se requiere autenticación'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * @param {string|Array} permissions - Permiso o permisos requeridos
 */
const requirePermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Se requiere autenticación'
        });
      }

      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Obtener permisos del usuario
      const userPermissions = await db('user_permissions')
        .where('user_id', req.user.userId)
        .where('is_granted', true)
        .pluck('permission_key');

      // Verificar si el usuario tiene todos los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          error: 'Permisos insuficientes',
          message: 'No tienes los permisos necesarios para acceder a este recurso'
        });
      }

      next();

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar propiedad del recurso
 * @param {string} resourceField - Campo que contiene el ID del propietario
 */
const requireOwnership = (resourceField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Se requiere autenticación'
        });
      }

      // Los administradores pueden acceder a cualquier recurso
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id || req.body.id;
      if (!resourceId) {
        return res.status(400).json({
          error: 'ID de recurso requerido',
          message: 'Se requiere el ID del recurso'
        });
      }

      // Determinar la tabla basada en la ruta
      let tableName = 'photos'; // Por defecto
      if (req.path.includes('/users/')) {
        tableName = 'users';
      } else if (req.path.includes('/locations/')) {
        tableName = 'user_locations';
      }

      // Verificar propiedad del recurso
      const resource = await db(tableName)
        .where('id', resourceId)
        .where(resourceField, req.user.userId)
        .first();

      if (!resource) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();

    } catch (error) {
      console.error('Error al verificar propiedad:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const session = await db('user_sessions')
          .where('session_token', token)
          .where('is_active', true)
          .where('expires_at', '>', new Date())
          .first();

        if (session) {
          const user = await db('users')
            .where('id', decoded.userId)
            .where('status', 'active')
            .first();

          if (user) {
            req.user = {
              userId: user.id,
              username: user.username,
              role: user.role,
              email: user.email,
              fullName: user.full_name
            };

            // Actualizar última actividad
            await db('user_sessions')
              .where('id', session.id)
              .update({ last_activity: new Date() });
          }
        }
      } catch (error) {
        // Token inválido, pero no es un error crítico
        console.warn('Token inválido en autenticación opcional:', error.message);
      }
    }

    next();

  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    next(); // Continuar sin autenticación
  }
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar si el usuario es operador
 */
const requireOperator = requireRole('operator');

/**
 * Middleware para verificar si el usuario es administrador o operador
 */
const requireAdminOrOperator = requireRole(['admin', 'operator']);

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  optionalAuth,
  requireAdmin,
  requireOperator,
  requireAdminOrOperator
}; 