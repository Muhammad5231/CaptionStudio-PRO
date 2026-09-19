import dotenv from 'dotenv';
import { getRedisConnection } from '@captionstudio/queue';
import { createMediaAnalysisWorker } from './workers/media-analysis.worker';
import { createTranscriptionWorker } from './workers/transcription.worker';
import { createThumbnailWorker } from './workers/thumbnail.worker';
import { createExportWorker } from './workers/export.worker';

dotenv.config();

console.log('⚡ Starting CaptionStudio PRO Background Processing Workers...');

const connection = getRedisConnection();

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

// Register Modular Workers
const mediaAnalysisWorker = createMediaAnalysisWorker();
const transcriptionWorker = createTranscriptionWorker();
const thumbnailWorker = createThumbnailWorker();
const exportWorker = createExportWorker();

mediaAnalysisWorker.on('error', () => {});
transcriptionWorker.on('error', () => {});
thumbnailWorker.on('error', () => {});
exportWorker.on('error', () => {});

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down workers gracefully...');
  await Promise.all([
    mediaAnalysisWorker.close(),
    transcriptionWorker.close(),
    thumbnailWorker.close(),
    exportWorker.close(),
  ]);
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
