const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${socket.user._id}`);

    // Join a board room
    socket.on('board:join', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`👤 ${socket.user.name} joined board: ${boardId}`);

      // Notify others in the board
      socket.to(`board:${boardId}`).emit('user:joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar
      });
    });

    // Leave a board room
    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`👤 ${socket.user.name} left board: ${boardId}`);

      socket.to(`board:${boardId}`).emit('user:left', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Handle typing indicators
    socket.on('task:typing', ({ boardId, taskId }) => {
      socket.to(`board:${boardId}`).emit('task:typing', {
        userId: socket.user._id,
        name: socket.user.name,
        taskId
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };