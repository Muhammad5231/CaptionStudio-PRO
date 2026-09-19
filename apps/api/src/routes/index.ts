import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { prisma } from '@captionstudio/database';
import { checkRedisHealth } from '@captionstudio/queue';
import { FFmpegService } from '@captionstudio/media';
import { authRouter } from './auth.routes';
import { projectsRouter } from './projects.routes';
import { templatesRouter } from './templates.routes';
import { jobsRouter } from './jobs.routes';
import { uploadsRouter } from './uploads.routes';
import { exportsRouter } from './exports.routes';
import { usageRouter } from './usage.routes';
import { billingRouter } from './billing.routes';
import { adminRouter } from './admin.routes';

const execFileAsync = promisify(execFile);
const ffmpegService = new FFmpegService();

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/projects', projectsRouter);
apiV1Router.use('/uploads', uploadsRouter);
apiV1Router.use('/templates', templatesRouter);
apiV1Router.use('/jobs', jobsRouter);
apiV1Router.use('/exports', exportsRouter);
apiV1Router.use('/usage', usageRouter);
apiV1Router.use('/billing', billingRouter);
apiV1Router.use('/admin', adminRouter);

import { createStorageProvider } from '@captionstudio/storage';

const storageProvider = createStorageProvider();

export async function getSystemHealthState() {
  const state: {
    api: string;
    database: string;
    redis: string;
    storage: string;
    ffmpeg: string;
    ffprobe: string;
    worker: string;
  } = {
    api: 'ok',
    database: 'unhealthy',
    redis: 'unhealthy',
    storage: 'unhealthy',
    ffmpeg: 'unhealthy',
    ffprobe: 'unhealthy',
    worker: 'unhealthy',
  };

  const details: Record<string, any> = {};

  // 1. PostgreSQL / Supabase Check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    state.database = 'ok';
    details.database = { latencyMs: Date.now() - start };
  } catch (err: unknown) {
    state.database = 'unhealthy';
    details.database = { error: err instanceof Error ? err.message : 'Database query failed' };
  }

  // 2. Redis Check (Managed Redis)
  const redisResult = await checkRedisHealth();
  if (redisResult.isConnected) {
    state.redis = 'ok';
    details.redis = { latencyMs: redisResult.latencyMs, status: redisResult.status };
  } else {
    state.redis = 'unhealthy';
    details.redis = { error: redisResult.error || 'Redis connection failed' };
  }

  // 3. Storage Check (Local or S3)
  try {
    const isS3 = (process.env.STORAGE_PROVIDER || process.env.STORAGE_DRIVER) === 's3';

    if (isS3) {
      await storageProvider.exists('healthcheck-probe.txt');
      state.storage = 'ok';
      details.storage = { driver: 's3', bucket: process.env.STORAGE_BUCKET || 'captionstudio-media' };
    } else {
      const storagePath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      state.storage = 'ok';
      details.storage = { driver: 'local', path: storagePath, exists: true };
    }
  } catch (err: unknown) {
    state.storage = 'unhealthy';
    details.storage = { error: err instanceof Error ? err.message : 'Storage check failed' };
  }

  // 4. FFmpeg Check
  try {
    const ffmpegVer = await ffmpegService.getVersion();
    state.ffmpeg = 'ok';
    details.ffmpeg = { version: ffmpegVer.split('\n')[0] };
  } catch (err: unknown) {
    state.ffmpeg = 'degraded';
    details.ffmpeg = { error: err instanceof Error ? err.message : 'FFmpeg check failed' };
  }

  // 5. FFprobe Check
  try {
    const { stdout } = await execFileAsync(ffmpegService.getFfprobePath(), ['-version']);
    state.ffprobe = 'ok';
    details.ffprobe = { version: stdout.split('\n')[0] };
  } catch (err: unknown) {
    state.ffprobe = 'degraded';
    details.ffprobe = { error: err instanceof Error ? err.message : 'FFprobe check failed' };
  }

  // 6. Worker Check (tied to Redis & Queue accessibility)
  if (redisResult.isConnected) {
    state.worker = 'ok';
    details.worker = { status: 'ready', queueDriver: 'bullmq' };
  } else {
    state.worker = 'unhealthy';
    details.worker = { error: 'Worker queue paused: Redis unavailable' };
  }

  const isHealthy = Object.values(state).every((v) => v === 'ok');
  return { state, details, isHealthy };
}

/**
 * Basic & standardized liveness probe (Part 22)
 */
apiV1Router.get('/health', async (_req, res) => {
  const { state, isHealthy } = await getSystemHealthState();
  res.status(isHealthy ? 200 : 503).json(state);
});

/**
 * Deep dependency health inspection (Part 22)
 */
apiV1Router.get('/health/dependencies', async (_req, res) => {
  const { state, details, isHealthy } = await getSystemHealthState();
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    state,
    dependencies: details,
    timestamp: new Date().toISOString(),
  });
});
