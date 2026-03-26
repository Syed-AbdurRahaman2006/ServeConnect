const mongoose = require('mongoose');
const { mongoUri } = require('./env');

/**
 * Connect to MongoDB with retry logic.
 * Uses Mongoose connection events for lifecycle monitoring.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 8 uses sensible defaults; explicit options for clarity
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
