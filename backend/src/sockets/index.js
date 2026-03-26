const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const userRepository = require('../repositories/user.repository');
const { SOCKET_EVENTS } = require('../utils/constants');

/**
 * Socket.io Server Setup
 * Handles authentication, room management, and event delegation.
 * Integrates with Redis adapter for horizontal scaling.
 */
const initializeSocketServer = (io) => {
  // ─── Authentication Middleware ─────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await userRepository.findById(decoded.id);
      if (!user || user.status === 'blocked') {
        return next(new Error('Authentication failed'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ────────────────────────────────────────
  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${socket.user.name} (${userId})`);

    // Join personal room for targeted events
    socket.join(`user:${userId}`);

    // Mark user as online
    await userRepository.setOnlineStatus(socket.user._id, true);

    // Broadcast online status to others
    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId,
      name: socket.user.name,
    });

    // ─── Chat Events ───────────────────────────────────────────
    // Join conversation room
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`💬 ${socket.user.name} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Real-time message (primary flow handled via REST + emit)
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
      const { conversationId, message } = data;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, {
        message,
      });
    });

    // Typing indicators
    socket.on(SOCKET_EVENTS.TYPING, (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING, {
        userId,
        name: socket.user.name,
      });
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.STOP_TYPING, {
        userId,
      });
    });

    // Message delivery confirmation
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (data) => {
      const { messageId, conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        messageId,
        userId,
      });
    });

    // Message seen
    socket.on(SOCKET_EVENTS.MESSAGE_SEEN, (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_SEEN, {
        conversationId,
        userId,
      });
    });

    // ─── Request Events ────────────────────────────────────────
    // Provider joins a broadcast room for their area
    socket.on('join:broadcast', () => {
      if (socket.user.role === 'PROVIDER') {
        socket.join(`providers:broadcast`);
      }
    });

    // ─── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      await userRepository.setOnlineStatus(socket.user._id, false);
      socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId,
        name: socket.user.name,
      });
    });
  });

  return io;
};

module.exports = { initializeSocketServer };
