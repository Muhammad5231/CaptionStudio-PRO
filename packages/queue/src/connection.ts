import { Redis, RedisOptions } from 'ioredis';

let redisClient: Redis | null = null;
let hasLoggedRedisWarning = false;

export function getRedisConnection(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTls = redisUrl.startsWith('rediss://');

  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 5000,
    tls: isTls ? { rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false' } : undefined,
    retryStrategy(times) {
      if (process.env.NODE_ENV === 'test' || times > 10) {
        return null; // Stop reconnecting during tests or after max retries
      }
      return Math.min(times * 200, 3000);
    },
  };

  const maskedUrl = redisUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  redisClient = new Redis(redisUrl, options);

  // Suppress unhandled error event crashes and spam
  redisClient.on('error', (err) => {
    if (!hasLoggedRedisWarning) {
      console.warn(
        `⚠️ [Redis] Connection unavailable at ${maskedUrl} (${err.message || 'ECONNREFUSED'}). Operations requiring Redis will fail-closed (auth) or pause.`
      );
      hasLoggedRedisWarning = true;
    }
  });

  redisClient.on('connect', () => {
    if (hasLoggedRedisWarning) {
      console.log(`✅ [Redis] Connected successfully to ${maskedUrl}.`);
      hasLoggedRedisWarning = false;
    }
  });

  return redisClient;
}

export function closeRedisConnection(): void {
  if (redisClient) {
    try {
      redisClient.disconnect(false);
    } catch {}
    redisClient = null;
  }
}

export interface RedisHealthStatus {
  isConnected: boolean;
  latencyMs: number | null;
  status: string;
  error: string | null;
}

export async function checkRedisHealth(): Promise<RedisHealthStatus> {
  const client = getRedisConnection();
  const start = Date.now();

  try {
    if (client.status === 'wait') {
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000)),
      ]);
    }

    const pong = await Promise.race([
      client.ping(),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 2000)),
    ]);

    const latencyMs = Date.now() - start;
    return {
      isConnected: pong === 'PONG',
      latencyMs,
      status: client.status,
      error: null,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Redis ping failed';
    return {
      isConnected: false,
      latencyMs: null,
      status: client.status,
      error: errorMsg,
    };
  }
}
