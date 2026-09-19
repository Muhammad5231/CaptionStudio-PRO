import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { Worker, Job, QUEUE_NAMES, MediaAnalysisJobData, getRedisConnection } from '@captionstudio/queue';
import { prisma, Prisma, JobStatus, ProjectStatus } from '@captionstudio/database';
import { createStorageProvider } from '@captionstudio/storage';
import { FFmpegService, MediaProbeService } from '@captionstudio/media';

const connection = getRedisConnection();
const storage = createStorageProvider();
const ffmpegService = new FFmpegService();
const probeService = new MediaProbeService(ffmpegService);

async function updateJobState(
  jobId: string,
  data: {
    status?: JobStatus;
    progress?: number;
    stage?: string;
    errorMessage?: string | null;
    metadata?: any;
    completedAt?: Date;
    startedAt?: Date;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.metadata !== undefined) {
      updateData.metadata = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata);
    }
    await prisma.exportJob.update({
      where: { id: jobId },
      data: updateData,
    });
  } catch (err) {
    console.error(`[MediaAnalysis Worker] Failed to update DB state for job ${jobId}:`, err);
  }
}

export function createMediaAnalysisWorker() {
  return new Worker<MediaAnalysisJobData>(
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
      let filePath: string;

      try {
        // 1. Obtain local file path for probing
        await updateJobState(jobId, { progress: 30, stage: 'Retrieving media for analysis' });
        await job.updateProgress(30);

        const tempResult = await storage.downloadToTempFile(storageKey);
        filePath = tempResult.filePath;
        tempFilePath = tempResult.filePath;

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

        console.log(
          `[MediaAnalysis Worker] Successfully processed project ${projectId}: ${probeResult.width}x${probeResult.height} @ ${probeResult.fps}fps, ${probeResult.durationSeconds}s`
        );

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
}

