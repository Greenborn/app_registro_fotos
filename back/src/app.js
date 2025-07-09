require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');

// Configuraciones
const { testConnection } = require('./config/database');
const { initializeWebSocket } = require('./config/websocket');
const { generalLimiter, adminLimiter } = require('./config/rateLimit');

// Rutas
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const userRoutes = require('./routes/users');

// Utilidades
const { cleanOldAuditLogs } = require('./utils/auditLogger');

const app = express();
const server = http.createServer(app);

// Inicializar WebSocket
const io = initializeWebSocket(server);

// Middleware de seguridad
if (process.env.HELMET_ENABLED !== 'false') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    }
  }));
}

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Compresión
if (process.env.COMPRESSION_ENABLED !== 'false') {
  app.use(compression({
    level: parseInt(process.env.COMPRESSION_LEVEL) || 6
  }));
}

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware para agregar io a req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'App Registro Fotos API',
    version: '1.0.0',
    description: 'API para aplicación de registro de fotos con geolocalización',
    endpoints: {
      auth: '/api/auth',
      photos: '/api/photos',
      users: '/api/users'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Error de multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Archivo demasiado grande',
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Archivo inesperado',
      message: 'Se recibió un archivo no esperado'
    });
  }

  // Error de validación de archivo
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      error: 'Tipo de archivo no permitido',
      message: err.message
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token de autenticación es inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado'
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error interno'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    const port = process.env.PORT || 3000;
    const wsPort = process.env.WS_PORT || 3001;

    server.listen(port, () => {
      console.log(`🚀 Servidor HTTP iniciado en puerto ${port}`);
      console.log(`🔌 Servidor WebSocket iniciado en puerto ${wsPort}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });

    // Programar limpieza de logs antiguos (cada día a las 2 AM)
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        cleanOldAuditLogs().catch(error => {
          console.error('Error al limpiar logs antiguos:', error);
        });
      }
    }, 60 * 1000); // Verificar cada minuto

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer }; 