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

/**
 * Basic liveness probe
 */
apiV1Router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Deep dependency health inspection
 */
apiV1Router.get('/health/dependencies', async (_req, res) => {
  const checks: Record<string, { status: 'healthy' | 'degraded' | 'unhealthy'; details?: any; error?: string }> = {};

  // 1. PostgreSQL Check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = {
      status: 'healthy',
      details: { latencyMs: Date.now() - start },
    };
  } catch (err: unknown) {
    checks.postgres = {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Database query failed',
    };
  }

  // 2. Redis Check
  const redisResult = await checkRedisHealth();
  checks.redis = {
    status: redisResult.isConnected ? 'healthy' : 'unhealthy',
    details: { latencyMs: redisResult.latencyMs, redisStatus: redisResult.status },
    error: redisResult.error || undefined,
  };

  // 3. Storage Check
  const storagePath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
  const storageExists = fs.existsSync(storagePath);
  checks.storage = {
    status: storageExists ? 'healthy' : 'degraded',
    details: { driver: process.env.STORAGE_DRIVER || 'local', path: storagePath },
    error: storageExists ? undefined : 'Local upload directory does not exist yet',
  };

  // 4. FFmpeg / FFprobe Check
  try {
    const ffmpegVer = await ffmpegService.getVersion();
    checks.ffmpeg = {
      status: 'healthy',
      details: { version: ffmpegVer.split('\n')[0] },
    };
  } catch (err: unknown) {
    checks.ffmpeg = {
      status: 'degraded',
      error: err instanceof Error ? err.message : 'FFmpeg execution check failed',
    };
  }

  // 5. Python / Whisper Environment Check
  const pythonPath = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
  try {
    const { stdout } = await execFileAsync(pythonPath, ['-c', 'import whisper; print("whisper_ok")'], {
      timeout: 4000,
    });
    checks.whisper = {
      status: stdout.includes('whisper_ok') ? 'healthy' : 'degraded',
      details: { pythonPath },
    };
  } catch (err: unknown) {
    checks.whisper = {
      status: 'degraded',
      details: { pythonPath },
      error: err instanceof Error ? err.message : 'Whisper python library import check failed',
    };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');
  const hasUnhealthy = Object.values(checks).some((c) => c.status === 'unhealthy');

  const statusCode = allHealthy ? 200 : hasUnhealthy ? 503 : 200;

  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : hasUnhealthy ? 'unhealthy' : 'degraded',
    dependencies: checks,
    timestamp: new Date().toISOString(),
  });
});
