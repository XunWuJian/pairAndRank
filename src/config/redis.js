// redis config placeholder
const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createClient({ url: redisUrl });

redis.on('error', (err) => {
  console.error('[redis] error:', err);
});

async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log('[redis] connected:', redisUrl);
  }
  return redis;
}

module.exports = { redis, initRedis };