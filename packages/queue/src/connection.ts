import { Redis, RedisOptions } from 'ioredis';

let redisClient: Redis | null = null;
let hasLoggedRedisWarning = false;

export function getRedisConnection(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Reconnect with capped backoff to prevent connection loop spinning
      return Math.min(times * 200, 3000);
    },
  };

  redisClient = new Redis(redisUrl, options);

  // Suppress unhandled error event crashes and spam
  redisClient.on('error', (err) => {
    if (!hasLoggedRedisWarning) {
      console.warn(
        `⚠️ [Redis] Connection unavailable (${err.message || 'ECONNREFUSED'}). Operations requiring Redis will pause or fall back to memory.`
      );
      hasLoggedRedisWarning = true;
    }
  });

  redisClient.on('connect', () => {
    if (hasLoggedRedisWarning) {
      console.log('✅ [Redis] Connected successfully.');
      hasLoggedRedisWarning = false;
    }
  });

  return redisClient;
}

