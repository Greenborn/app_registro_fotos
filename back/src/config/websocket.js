const { Server } = require('socket.io');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.WS_CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Manejo de conexiones
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Autenticación del socket
    socket.on('authenticate', (data) => {
      if (data.token) {
        // Aquí se validaría el token JWT
        socket.userId = data.userId;
        socket.join(`user_${data.userId}`);
        console.log(`✅ Usuario ${data.userId} autenticado en WebSocket`);
      }
    });

    // Actualización de ubicación
    socket.on('location_update', (data) => {
      if (socket.userId) {
        // Emitir a administradores
        socket.to('admin_room').emit('operator_location', {
          userId: socket.userId,
          location: data
        });
        console.log(`📍 Ubicación actualizada para usuario ${socket.userId}`);
      }
    });

    // Unirse a sala de administradores
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`👨‍💼 Administrador se unió a la sala de monitoreo`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

// Función para emitir a todos los administradores
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admin_room').emit(event, data);
  }
};

// Función para emitir a un usuario específico
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Función para emitir a todos los usuarios
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeWebSocket,
  emitToAdmins,
  emitToUser,
  emitToAll,
  getIO: () => io
}; 