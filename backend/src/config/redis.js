const Redis = require('ioredis');
const { redis: redisConfig } = require('./env');

/**
 * Create Redis client with reconnect strategy.
 * Used by Socket.io adapter for horizontal scaling.
 */
const createRedisClient = () => {
  const client = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  return client;
};

module.exports = { createRedisClient };
