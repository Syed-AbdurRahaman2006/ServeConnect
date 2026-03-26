const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clientUrl } = require('./config/env');
const { errorHandler } = require('./middlewares/error.middleware');
const mountRoutes = require('./routes');

/**
 * Create and configure Express application
 */
const createApp = () => {
  const app = express();

  // ─── Security ──────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─── Body Parsing ──────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Logging ───────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // ─── Routes ────────────────────────────────────────────────────
  mountRoutes(app);

  // ─── 404 Handler ───────────────────────────────────────────────
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // ─── Error Handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
