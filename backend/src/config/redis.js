// Import ioredis library (used to connect to Redis server)
const Redis = require('ioredis');

// Import Redis configuration from env file
const { redis: redisConfig } = require('./env');

/**
 * Create Redis client with reconnect strategy.
 * Used for caching and real-time scaling (Socket.io adapter)
 */
const createRedisClient = () => {

  // Create new Redis client instance with configuration
  const client = new Redis({

    // Redis server host (e.g., localhost or cloud)
    host: redisConfig.host,

    // Redis port (default 6379)
    port: redisConfig.port,

    // Redis password (if required)
    password: redisConfig.password,

    // Enable TLS (secure connection) only if using Upstash cloud Redis
    // .includes() checks if host string contains 'upstash.io'
    // Ternary operator: condition ? value1 : value2
    tls: redisConfig.host.includes('upstash.io') ? {} : undefined,

    // Retry strategy when connection fails
    retryStrategy: (times) => {

      // Increase delay with each retry (times * 50 ms)
      // Math.min ensures delay does not exceed 2000 ms (2 seconds)
      const delay = Math.min(times * 50, 2000);

      // Return delay for next retry attempt
      return delay;
    },

    // Maximum retries per request (prevents infinite retries)
    maxRetriesPerRequest: 3,

    // Do not connect immediately, connect only when needed
    lazyConnect: true,
  });

  // Event listener when Redis successfully connects
  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  // Event listener for Redis errors
  client.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  // Return Redis client instance
  return client;
};

// Export function so it can be used in other files
module.exports = { createRedisClient };