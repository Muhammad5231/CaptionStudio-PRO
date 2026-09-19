import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiV1Router } from './routes/index';
import { errorHandler } from './middlewares/error.middleware';

import { checkRedisHealth, getRedisConnection } from '@captionstudio/queue';

dotenv.config();

const app = express();
const port = process.env.API_PORT || 4000;

app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register Versioned API routes
app.use('/api/v1', apiV1Router);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`🚀 CaptionStudio PRO API Server listening on port ${port}`);
    console.log(`📡 Healthcheck available at http://localhost:${port}/api/v1/health`);

    // Verify Redis connection on startup
    const redisStatus = await checkRedisHealth();
    if (redisStatus.isConnected) {
      console.log(`✅ [Redis] Connected (${redisStatus.latencyMs}ms latency)`);
    } else {
      console.warn(
        `⚠️ [Redis] Unavailable at ${process.env.REDIS_URL || 'redis://localhost:6379'}: ${redisStatus.error}`
      );
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '👉 [Dev Tip] Auth rate limiting will fail closed until Redis is started. Start Redis with: docker compose up -d redis'
        );
      }
    }
  });
}

export default app;


