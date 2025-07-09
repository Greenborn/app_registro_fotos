const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireOwnership } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// GET /users - Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await User.findAll(parseInt(page), parseInt(limit), filters);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al obtener los usuarios'
    });
  }
});

// GET /users/operators - Obtener solo operadores
router.get('/operators', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const operators = await User.findByRole('operator');

    res.json({
      success: true,
      data: {
        operators
      }
    });

  } catch (error) {
    console.error('Error al obtener operadores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al obtener los operadores'
    });
  }
});

// GET /users/stats - Obtener estadísticas de usuarios
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminCount = await User.countByRole('admin');
    const operatorCount = await User.countByRole('operator');

    res.json({
      success: true,
      data: {
        stats: {
          totalAdmins: adminCount,
          totalOperators: operatorCount,
          totalUsers: adminCount + operatorCount
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al obtener las estadísticas'
    });
  }
});

// POST /users - Crear nuevo usuario (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, email, full_name, role } = req.body;

    // Validar campos requeridos
    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Username, password y role son requeridos'
      });
    }

    // Verificar si el username ya existe
    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        error: 'Username duplicado',
        message: 'El username ya está en uso'
      });
    }

    // Verificar si el email ya existe (si se proporciona)
    if (email) {
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return res.status(400).json({
          error: 'Email duplicado',
          message: 'El email ya está en uso'
        });
      }
    }

    // Crear usuario
    const userData = {
      username,
      password,
      email,
      full_name,
      role
    };

    const newUser = await User.create(userData);

    // Log de auditoría
    await createAuditLog({
      userId: req.user.userId,
      action: 'create',
      tableName: 'users',
      recordId: newUser.id,
      newValues: { username, email, role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        user: newUser
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al crear el usuario'
    });
  }
});

// GET /users/:id - Obtener usuario por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Verificar permisos (operadores solo pueden ver su propio perfil)
    if (role === 'operator' && parseInt(id) !== userId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver este usuario'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al obtener el usuario'
    });
  }
});

// PUT /users/:id - Actualizar usuario
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const updateData = req.body;

    // Verificar permisos
    if (role === 'operator' && parseInt(id) !== userId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para actualizar este usuario'
      });
    }

    // Los operadores no pueden cambiar su rol
    if (role === 'operator' && updateData.role) {
      delete updateData.role;
    }

    // Verificar si el username ya existe (si se está actualizando)
    if (updateData.username) {
      const usernameExists = await User.usernameExists(updateData.username, id);
      if (usernameExists) {
        return res.status(400).json({
          error: 'Username duplicado',
          message: 'El username ya está en uso'
        });
      }
    }

    // Verificar si el email ya existe (si se está actualizando)
    if (updateData.email) {
      const emailExists = await User.emailExists(updateData.email, id);
      if (emailExists) {
        return res.status(400).json({
          error: 'Email duplicado',
          message: 'El email ya está en uso'
        });
      }
    }

    // Obtener usuario actual para auditoría
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    // Actualizar usuario
    const updatedUser = await User.update(id, updateData);

    // Log de auditoría
    await createAuditLog({
      userId: req.user.userId,
      action: 'update',
      tableName: 'users',
      recordId: id,
      oldValues: currentUser,
      newValues: updatedUser,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al actualizar el usuario'
    });
  }
});

// DELETE /users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        error: 'Operación no permitida',
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    // Eliminar usuario (soft delete)
    const deletedUser = await User.delete(id);

    // Log de auditoría
    await createAuditLog({
      userId: req.user.userId,
      action: 'delete',
      tableName: 'users',
      recordId: id,
      oldValues: user,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: {
        user: deletedUser
      }
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al eliminar el usuario'
    });
  }
});

// POST /users/:id/reset-password - Resetear contraseña (solo admin)
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: 'Contraseña requerida',
        message: 'La nueva contraseña es requerida'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    // Actualizar contraseña
    await User.update(id, { password: newPassword });

    // Log de auditoría
    await createAuditLog({
      userId: req.user.userId,
      action: 'reset_password',
      tableName: 'users',
      recordId: id,
      newValues: { password_reset: true },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contraseña reseteada exitosamente'
    });

  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al resetear la contraseña'
    });
  }
});

module.exports = router; 