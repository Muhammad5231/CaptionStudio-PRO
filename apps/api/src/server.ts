import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import dotenv from 'dotenv';

// Load root workspace .env first, then local API .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { apiV1Router, getSystemHealthState } from './routes/index';
import { errorHandler } from './middlewares/error.middleware';
import { checkRedisHealth } from '@captionstudio/queue';

function validateServerEnvironment() {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    missing.push('DATABASE_URL');
  }

  if (missing.length > 0) {
    console.error(`🚨 [Configuration Error] Missing required environment variables for current configuration: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

validateServerEnvironment();

const app = express();
const port = process.env.API_PORT || 4000;

app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root health check endpoints (Part 22)
app.get('/health', async (_req, res) => {
  const { state, isHealthy } = await getSystemHealthState();
  res.status(isHealthy ? 200 : 503).json(state);
});

app.get('/health/dependencies', async (_req, res) => {
  const { state, details, isHealthy } = await getSystemHealthState();
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    state,
    dependencies: details,
    timestamp: new Date().toISOString(),
  });
});

// Register Versioned API routes
app.use('/api/v1', apiV1Router);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`🚀 CaptionStudio PRO API Server listening on port ${port}`);
    console.log(`📡 Healthcheck available at http://localhost:${port}/health and http://localhost:${port}/api/v1/health`);

    // Verify Redis connection on startup
    const redisStatus = await checkRedisHealth();
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const maskedRedisUrl = redisUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');

    if (redisStatus.isConnected) {
      console.log(`✅ [Redis] Connected to ${maskedRedisUrl} (${redisStatus.latencyMs}ms latency)`);
    } else {
      console.warn(
        `⚠️ [Redis] Unavailable at ${maskedRedisUrl}: ${redisStatus.error}`
      );
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '👉 [Dev Tip] Configure REDIS_URL in .env to a managed Redis instance (Upstash, Redis Cloud) or run a local instance.'
        );
      }
    }
  });
}

export default app;
