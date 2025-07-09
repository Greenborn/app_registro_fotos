const rateLimit = require('express-rate-limit');

// Rate limiter general
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // máximo 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas peticiones',
      message: 'Has excedido el límite de peticiones. Intenta de nuevo más tarde.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000)
    });
  }
});

// Rate limiter para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_AUTH) || 5, // máximo 5 intentos de login
  message: {
    error: 'Demasiados intentos de autenticación',
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de autenticación',
      message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
      retryAfter: 900 // 15 minutos en segundos
    });
  }
});

// Rate limiter para subida de archivos
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 archivos por hora
  message: {
    error: 'Límite de subida de archivos excedido',
    message: 'Has excedido el límite de subida de archivos. Intenta de nuevo en una hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Límite de subida de archivos excedido',
      message: 'Has excedido el límite de subida de archivos. Intenta de nuevo en una hora.',
      retryAfter: 3600 // 1 hora en segundos
    });
  }
});

// Rate limiter para actualización de ubicación
const locationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // máximo 60 actualizaciones por minuto
  message: {
    error: 'Demasiadas actualizaciones de ubicación',
    message: 'Has excedido el límite de actualizaciones de ubicación.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas actualizaciones de ubicación',
      message: 'Has excedido el límite de actualizaciones de ubicación.',
      retryAfter: 60 // 1 minuto en segundos
    });
  }
});

// Rate limiter para administradores (más permisivo)
const adminLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: 500, // más permisivo para administradores
  message: {
    error: 'Demasiadas peticiones',
    message: 'Has excedido el límite de peticiones.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas peticiones',
      message: 'Has excedido el límite de peticiones.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000)
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  locationLimiter,
  adminLimiter
}; 