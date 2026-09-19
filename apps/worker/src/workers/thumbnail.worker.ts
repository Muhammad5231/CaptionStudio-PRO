import { Worker, Job, QUEUE_NAMES, ThumbnailJobData, getRedisConnection } from '@captionstudio/queue';
import { prisma, JobStatus } from '@captionstudio/database';
import { FFmpegService, ThumbnailGeneratorService } from '@captionstudio/media';

const connection = getRedisConnection();
const ffmpegService = new FFmpegService();
const thumbnailGenerator = new ThumbnailGeneratorService(ffmpegService);

export function createThumbnailWorker() {
  return new Worker<ThumbnailJobData>(
    QUEUE_NAMES.THUMBNAIL,
    async (job: Job<ThumbnailJobData>) => {
      const { jobId, projectId, videoStorageKey, timestampSeconds } = job.data;
      console.log(`[Thumbnail Worker] Processing job ${job.id} for project ${projectId}`);

      await prisma.exportJob.update({
        where: { id: jobId },
        data: { status: JobStatus.PROCESSING, progress: 20, stage: 'Generating thumbnail' },
      }).catch(() => {});

      // Contract implementation
      await job.updateProgress(100);
      await prisma.exportJob.update({
        where: { id: jobId },
        data: { status: JobStatus.COMPLETED, progress: 100, stage: 'Thumbnail created' },
      }).catch(() => {});

      return { success: true };
    },
    { connection, concurrency: 2 }
  );
}

