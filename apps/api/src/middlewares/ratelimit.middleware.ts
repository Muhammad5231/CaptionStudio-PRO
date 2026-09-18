import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

const clientMap = new Map<string, ClientRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of clientMap.entries()) {
    if (record.resetTime < now) {
      clientMap.delete(key);
    }
  }
}, 60 * 1000).unref();

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Determine client identifier (IP or authenticated user ID)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const clientId = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;
    const key = `${req.baseUrl}${req.path}:${clientId}`;

    const now = Date.now();
    const record = clientMap.get(key);

    if (!record || record.resetTime < now) {
      clientMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds,
        },
      });
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - record.count);
    next();
  };
}

// Preset rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // 20 attempts
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 upload requests per min
  message: 'Upload rate limit reached. Please wait a moment before trying again.',
});

