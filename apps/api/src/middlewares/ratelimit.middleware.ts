import { Request, Response, NextFunction } from 'express';
import { getRedisConnection } from '@captionstudio/queue';

export interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  message?: string;
  prefix?: string;
  failClosed?: boolean;
}

// In-memory fallback map if Redis is temporarily unreachable
const memoryFallbackMap = new Map<string, { count: number; resetTime: number }>();

function executeMemoryFallback(
  key: string,
  windowSeconds: number,
  maxRequests: number,
  message: string,
  res: Response,
  next: NextFunction
) {
  const now = Date.now();
  const record = memoryFallbackMap.get(key);

  if (!record || record.resetTime < now) {
    memoryFallbackMap.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return next();
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfterSeconds,
      },
    });
  }

  record.count++;
  return next();
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowSeconds,
    maxRequests,
    message = 'Too many requests, please try again later.',
    prefix = 'rl',
    failClosed = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const clientId = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;
    const sanitizedPath = (req.baseUrl + req.path).replace(/[^a-zA-Z0-9_-]/g, '_');
    const redisKey = `ratelimit:${prefix}:${sanitizedPath}:${clientId}`;

    const redis = getRedisConnection();
    const isDev = process.env.NODE_ENV === 'development';
    const unavailableMessage = isDev
      ? 'Redis is unavailable. Start Docker/Redis and try again.'
      : 'Rate limiting service is temporarily unavailable. Please try again shortly.';

    // Attempt connection if client is in initial wait state
    if (redis.status === 'wait') {
      try {
        await Promise.race([
          redis.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connect timeout')), 1000)),
        ]);
      } catch {
        // Handled below
      }
    }

    // If Redis is not currently ready, check failClosed configuration
    if (redis.status !== 'ready') {
      if (failClosed) {
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: unavailableMessage,
          },
        });
      }
      return executeMemoryFallback(redisKey, windowSeconds, maxRequests, message, res, next);
    }

    try {
      // Execute atomic counter increment with a timeout safeguard
      const currentCount = await Promise.race([
        redis.incr(redisKey),
        new Promise<number>((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 1000)),
      ]);

      if (currentCount === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      const ttl = await redis.ttl(redisKey);
      const remaining = Math.max(0, maxRequests - currentCount);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if (currentCount > maxRequests) {
        const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds;
        res.setHeader('Retry-After', retryAfterSeconds);

        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            retryAfterSeconds,
          },
        });
      }

      next();
    } catch {
      if (failClosed) {
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: unavailableMessage,
          },
        });
      }

      return executeMemoryFallback(redisKey, windowSeconds, maxRequests, message, res, next);
    }
  };
}

// Configurable window & request limits via environment variables
const AUTH_WINDOW = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS || '900', 10); // 15 mins
const AUTH_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '20', 10);

const UPLOAD_WINDOW = parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_SECONDS || '60', 10); // 1 min
const UPLOAD_MAX = parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS || '30', 10);

// Preset rate limiters
export const authRateLimiter = createRateLimiter({
  prefix: 'auth',
  windowSeconds: AUTH_WINDOW,
  maxRequests: AUTH_MAX,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  failClosed: true, // Security-critical: fail closed if Redis is unavailable or times out
});

export const uploadRateLimiter = createRateLimiter({
  prefix: 'upload',
  windowSeconds: UPLOAD_WINDOW,
  maxRequests: UPLOAD_MAX,
  message: 'Upload rate limit reached. Please wait a moment before trying again.',
  failClosed: false,
});

