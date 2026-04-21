// Load environment variables from .env file into process.env
require('dotenv').config();

// Export configuration object so it can be used across the app
module.exports = {

  // Application port (use env value or default 5000)
  port: process.env.PORT || 5000,

  // Environment mode (development / production)
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB connection string (fallback to local DB if not provided)
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/serveconnect',

  // JWT (JSON Web Token) configuration
  jwt: {

    // Secret key used to sign and verify tokens
    secret: process.env.JWT_SECRET || 'dev-secret-key',

    // Token expiration time (e.g., 7 days)
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Redis configuration
  redis: {

    // Redis host (local or cloud)
    host: process.env.REDIS_HOST || 'localhost',

    // Redis port (convert string → number using parseInt)
    // 10 = base 10 (decimal)
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,

    // Redis password (optional, undefined if not provided)
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // Frontend URL (used for CORS or redirects)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Google Maps API key (no fallback, must be provided)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};