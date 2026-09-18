import dotenv from 'dotenv';
import {
  Worker,
  Job,
  QUEUE_NAMES,
  getRedisConnection,
  TranscriptionJobData,
  ExportJobData,
  ThumbnailJobData,
} from '@captionstudio/queue';

dotenv.config();

console.log('⚡ Starting CaptionStudio PRO Background Processing Workers...');

const connection = getRedisConnection();

let hasLoggedRedisWarning = false;
connection.on('error', (err) => {
  if (!hasLoggedRedisWarning) {
    console.warn(`⚠️ [Worker] Redis is not connected (${err.message}). Background queue processing will be paused until Redis is available.`);
    hasLoggedRedisWarning = true;
  }
});
connection.on('connect', () => {
  console.log('✅ [Worker] Connected to Redis queue server successfully.');
  hasLoggedRedisWarning = false;
});

// 1. Transcription Worker
const transcriptionWorker = new Worker<TranscriptionJobData>(
  QUEUE_NAMES.TRANSCRIPTION,
  async (job: Job<TranscriptionJobData>) => {
    console.log(`[Worker] Starting transcription for project ${job.data.projectId} (Job: ${job.id})`);
    await job.updateProgress(25);
    // STT extraction pipeline simulation/interface
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.updateProgress(75);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.updateProgress(100);
    console.log(`[Worker] Finished transcription for project ${job.data.projectId}`);
    return { success: true, trackId: `track-${Date.now()}` };
  },
  { connection, concurrency: 2 }
);

// 2. Export / Render Worker
const exportWorker = new Worker<ExportJobData>(
  QUEUE_NAMES.EXPORT,
  async (job: Job<ExportJobData>) => {
    console.log(`[Worker] Starting export render for project ${job.data.projectId} (Job: ${job.id})`);
    await job.updateProgress(20);
    // Subtitle burn rendering pipeline
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.updateProgress(80);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.updateProgress(100);
    console.log(`[Worker] Finished export render for project ${job.data.projectId}`);
    return { success: true, exportUrl: 'https://example.com/exports/final.mp4' };
  },
  { connection, concurrency: 1 }
);

transcriptionWorker.on('error', () => {});
exportWorker.on('error', () => {});

// Graceful shutdown handling
const shutdown = async () => {
  console.log('🛑 Shutting down workers gracefully...');
  await transcriptionWorker.close();
  await exportWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
