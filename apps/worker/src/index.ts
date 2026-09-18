import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {
  Worker,
  Job,
  QUEUE_NAMES,
  getRedisConnection,
  TranscriptionJobData,
  ExportJobData,
  MediaAnalysisJobData,
} from '@captionstudio/queue';
import { prisma, Prisma, JobStatus, ProjectStatus } from '@captionstudio/database';
import { createStorageProvider } from '@captionstudio/storage';
import { FFmpegService, MediaProbeService } from '@captionstudio/media';

dotenv.config();

console.log('⚡ Starting CaptionStudio PRO Background Processing Workers...');

const connection = getRedisConnection();
const storage = createStorageProvider();
const ffmpegService = new FFmpegService();
const probeService = new MediaProbeService(ffmpegService);

let hasLoggedRedisWarning = false;
connection.on('error', (err) => {
  if (!hasLoggedRedisWarning) {
    console.warn(
      `⚠️ [Worker] Redis is not connected (${err.message}). Background queue processing will be paused until Redis is available.`
    );
    hasLoggedRedisWarning = true;
  }
});
connection.on('connect', () => {
  console.log('✅ [Worker] Connected to Redis queue server successfully.');
  hasLoggedRedisWarning = false;
});

/**
 * Helper to update job status in the database
 */
async function updateJobState(
  jobId: string,
  data: {
    status?: JobStatus;
    progress?: number;
    stage?: string;
    errorMessage?: string | null;
    metadata?: Prisma.InputJsonValue;
    completedAt?: Date;
    startedAt?: Date;
  }
) {
  try {
    await prisma.exportJob.update({
      where: { id: jobId },
      data,
    });
  } catch (err) {
    console.error(`[Worker] Failed to update DB state for job ${jobId}:`, err);
  }
}

// -----------------------------------------------------------------------------
// 1. MEDIA ANALYSIS WORKER
// -----------------------------------------------------------------------------
const mediaAnalysisWorker = new Worker<MediaAnalysisJobData>(
  QUEUE_NAMES.MEDIA_ANALYSIS,
  async (job: Job<MediaAnalysisJobData>) => {
    const { jobId, projectId, assetId, storageKey } = job.data;
    console.log(`[MediaAnalysis Worker] Starting job ${job.id} for project ${projectId} (Asset: ${assetId})`);

    await updateJobState(jobId, {
      status: JobStatus.PROCESSING,
      startedAt: new Date(),
      progress: 10,
      stage: 'Locating media asset',
    });
    await job.updateProgress(10);

    let tempFilePath: string | null = null;

    try {
      // 1. Obtain local file path for probing
      let filePath: string;
      const localBasePath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
      const directLocalPath = path.join(localBasePath, storageKey);

      if (fs.existsSync(directLocalPath)) {
        filePath = directLocalPath;
      } else {
        // Download from storage to temporary file
        await updateJobState(jobId, { progress: 30, stage: 'Downloading media for analysis' });
        await job.updateProgress(30);

        const buffer = await storage.download(storageKey);
        const ext = path.extname(storageKey) || '.mp4';
        tempFilePath = path.join(os.tmpdir(), `probe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`);
        await fs.promises.writeFile(tempFilePath, buffer);
        filePath = tempFilePath;
      }

      // 2. Probe media with FFprobe
      await updateJobState(jobId, { progress: 60, stage: 'Extracting video and audio streams' });
      await job.updateProgress(60);

      const probeResult = await probeService.probeFile(filePath);

      // 3. Update database records
      await updateJobState(jobId, { progress: 85, stage: 'Saving media metadata' });
      await job.updateProgress(85);

      await prisma.$transaction([
        prisma.projectAsset.update({
          where: { id: assetId },
          data: {
            durationSeconds: probeResult.durationSeconds,
            width: probeResult.width,
            height: probeResult.height,
            fps: probeResult.fps,
          },
        }),
        prisma.project.update({
          where: { id: projectId },
          data: {
            durationSeconds: probeResult.durationSeconds,
            width: probeResult.width,
            height: probeResult.height,
            fps: probeResult.fps,
            status: ProjectStatus.READY,
          },
        }),
      ]);

      // 4. Mark job completed
      await updateJobState(jobId, {
        status: JobStatus.COMPLETED,
        progress: 100,
        stage: 'Media analysis complete',
        completedAt: new Date(),
      });
      await job.updateProgress(100);

      console.log(`[MediaAnalysis Worker] Successfully processed project ${projectId}: ${probeResult.width}x${probeResult.height} @ ${probeResult.fps}fps, ${probeResult.durationSeconds}s`);

      return {
        success: true,
        metadata: probeResult,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown media analysis error';
      console.error(`[MediaAnalysis Worker] Error on job ${jobId}:`, message);

      await updateJobState(jobId, {
        status: JobStatus.FAILED,
        errorMessage: "We couldn't analyze this media file. Please verify that the file is valid and try again.",
        metadata: {
          errorCode: 'MEDIA_PROBE_FAILED',
          errorDetails: message,
          failedAt: new Date().toISOString(),
        },
      });

      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      }).catch(() => {});

      throw err;
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath).catch(() => {});
      }
    }
  },
  { connection, concurrency: 2 }
);

// -----------------------------------------------------------------------------
// 2. TRANSCRIPTION WORKER (Foundation interface — Phase 3)
// -----------------------------------------------------------------------------
const transcriptionWorker = new Worker<TranscriptionJobData>(
  QUEUE_NAMES.TRANSCRIPTION,
  async (job: Job<TranscriptionJobData>) => {
    console.log(`[Transcription Worker] Job ${job.id} enqueued (Transcription engine deferred to Phase 3)`);
    await job.updateProgress(50);
    return { success: true, message: 'Transcription foundation ready — Whisper integration in Phase 3' };
  },
  { connection, concurrency: 1 }
);

// -----------------------------------------------------------------------------
// 3. EXPORT / RENDER WORKER (Foundation interface — Phase 6)
// -----------------------------------------------------------------------------
const exportWorker = new Worker<ExportJobData>(
  QUEUE_NAMES.EXPORT,
  async (job: Job<ExportJobData>) => {
    console.log(`[Export Worker] Job ${job.id} enqueued (FFmpeg rendering engine deferred to Phase 6)`);
    await job.updateProgress(50);
    return { success: true, message: 'Export foundation ready — GPU rendering in Phase 6' };
  },
  { connection, concurrency: 1 }
);

// Error suppression on workers
mediaAnalysisWorker.on('error', () => {});
transcriptionWorker.on('error', () => {});
exportWorker.on('error', () => {});

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down workers gracefully...');
  await mediaAnalysisWorker.close();
  await transcriptionWorker.close();
  await exportWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
