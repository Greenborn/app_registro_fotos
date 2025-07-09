const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../config/rateLimit');
const { authenticateToken } = require('../middleware/auth');

// POST /auth/login - Login de usuario
router.post('/login', authLimiter, authController.login);

// POST /auth/logout - Logout de usuario
router.post('/logout', authenticateToken, authController.logout);

// POST /auth/refresh - Renovar token
router.post('/refresh', authController.refreshToken);

// GET /auth/verify - Verificar token
router.get('/verify', authenticateToken, authController.verifyToken);

// POST /auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router; 