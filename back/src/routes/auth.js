const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authController = new AuthController();
const { authLimiter } = require('../config/rateLimit');
const { authenticateToken } = require('../middleware/auth');

// POST /auth/login - Login de usuario
router.post('/login', authLimiter, (req, res) => authController.login(req, res));

// POST /auth/logout - Logout de usuario
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

// POST /auth/refresh - Renovar token
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// GET /auth/verify - Verificar token
router.get('/verify', authenticateToken, (req, res) => authController.verifyToken(req, res));

// POST /auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, (req, res) => authController.changePassword(req, res));

module.exports = router; 