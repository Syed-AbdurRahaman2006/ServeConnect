const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const { createRedisClient } = require('./src/config/redis');
const { port, clientUrl, nodeEnv } = require('./src/config/env');
const { initializeSocketServer } = require('./src/sockets');

/**
 * ServeConnect Server Entry Point
 * Initializes MongoDB, Redis, Express, and Socket.io
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create Express app
    const app = createApp();

    // 3. Create HTTP server
    const server = http.createServer(app);

    // 4. Initialize Socket.io with CORS
    const io = new Server(server, {
      cors: {
        origin: clientUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    // 5. Attach Redis adapter for scalability (optional, gracefully degrades)
    try {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const pubClient = createRedisClient();
      const subClient = pubClient.duplicate();
      subClient.on('error', (err) => console.error('❌ Redis error (sub):', err.message));

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.io Redis adapter connected');
    } catch (redisErr) {
      console.warn('⚠️  Redis not available. Socket.io running without adapter.');
      console.warn('   Real-time features will work in single-server mode.');
    }

    // 6. Initialize Socket.io event handlers
    initializeSocketServer(io);

    // 7. Make io accessible to controllers
    app.set('io', io);

    // 8. Start HTTP server
    server.listen(port, () => {
      console.log(`\n🚀 ServeConnect API Server`);
      console.log(`   Environment: ${nodeEnv}`);
      console.log(`   Port: ${port}`);
      console.log(`   Client: ${clientUrl}`);
      console.log(`   API: http://localhost:${port}/api`);
      console.log(`   Health: http://localhost:${port}/api/health\n`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('   HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
