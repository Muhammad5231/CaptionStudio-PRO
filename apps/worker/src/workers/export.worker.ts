import { Worker, Job, QUEUE_NAMES, ExportJobData, getRedisConnection } from '@captionstudio/queue';
import { prisma, JobStatus } from '@captionstudio/database';

const connection = getRedisConnection();

export function createExportWorker() {
  return new Worker<ExportJobData>(
    QUEUE_NAMES.EXPORT,
    async (job: Job<ExportJobData>) => {
      const { jobId, projectId } = job.data;
      console.log(`[Export Worker] Processing export job ${job.id} for project ${projectId}`);

      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PROCESSING,
          progress: 10,
          stage: 'Initializing video rendering pipeline',
        },
      }).catch(() => {});

      await job.updateProgress(50);
      return { success: true, message: 'Export foundation ready — Phase 6 consumption' };
    },
    { connection, concurrency: 1 }
  );
}

