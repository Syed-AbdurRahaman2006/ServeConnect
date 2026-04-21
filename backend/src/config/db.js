// Import mongoose (ODM library to interact with MongoDB)
const mongoose = require('mongoose');

// Import mongoUri from env config (database connection string)
const { mongoUri } = require('./env');

// Async function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using mongoose
    const conn = await mongoose.connect(mongoUri, {
      
      // Maximum time (ms) to wait for server selection before failing
      serverSelectionTimeoutMS: 5000,

      // Time (ms) before closing inactive socket
      socketTimeoutMS: 45000,

      // Force IPv4 instead of IPv6 (avoids network issues)
      family: 4,
    });

    // Log successful connection with host info
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Listen for disconnection event
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting reconnect...');
    });

    // Listen for reconnection event
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Listen for error event
    mongoose.connection.on('error', (err) => {
      // err.message || err → fallback if message is undefined
      console.error('❌ MongoDB connection error:', err.message || err);
    });

    // Return connection object
    return conn;

  } catch (error) {
    // Log connection failure error
    console.error('❌ MongoDB connection failed:', error.message);

    // Exit application if DB connection fails
    process.exit(1);
  }
};

// Export function so it can be used in server.js
module.exports = connectDB;