const authRoutes = require('./auth.routes');
const serviceRoutes = require('./service.routes');
const requestRoutes = require('./request.routes');
const chatRoutes = require('./chat.routes');

/**
 * Mount all API routes
 * @param {Express} app - Express application instance
 */
const mountRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/chat', chatRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'ServeConnect API is running',
      timestamp: new Date().toISOString(),
    });
  });
};

module.exports = mountRoutes;
