import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load root workspace .env first, then local worker .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { getRedisConnection } from '@captionstudio/queue';
import { createMediaAnalysisWorker } from './workers/media-analysis.worker';
import { createTranscriptionWorker } from './workers/transcription.worker';
import { createThumbnailWorker } from './workers/thumbnail.worker';
import { createExportWorker } from './workers/export.worker';

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

console.log('⚡ Starting CaptionStudio PRO Background Processing Workers...');

// Dependency Verification
async function verifyWorkerDependencies() {
  console.log('🔍 [Worker:Diagnostics] Verifying system binaries...');

  const configuredFfmpeg = process.env.FFMPEG_PATH;
  let ffmpegCmd = 'ffmpeg';
  if (configuredFfmpeg && fs.existsSync(configuredFfmpeg)) {
    ffmpegCmd = `"${configuredFfmpeg}"`;
  } else {
    const rootExe = path.resolve(process.cwd(), '../../ffmpeg.exe');
    const localExe = path.resolve(process.cwd(), 'ffmpeg.exe');
    if (fs.existsSync(rootExe)) {
      ffmpegCmd = `"${rootExe}"`;
      process.env.FFMPEG_PATH = rootExe;
    } else if (fs.existsSync(localExe)) {
      ffmpegCmd = `"${localExe}"`;
      process.env.FFMPEG_PATH = localExe;
    } else if (configuredFfmpeg) {
      ffmpegCmd = `"${configuredFfmpeg}"`;
    }
  }

  const pythonCmd = process.env.PYTHON_PATH ? `"${process.env.PYTHON_PATH}"` : (process.platform === 'win32' ? 'python' : 'python3');

  try {
    await execAsync(`${ffmpegCmd} -version`);
    console.log(`  ✅ FFmpeg is installed and accessible (${ffmpegCmd}).`);
  } catch {
    console.warn('  ⚠️ FFmpeg was not found in PATH or configured path. Media processing may fail.');
  }

  try {
    await execAsync(`${pythonCmd} -c "import whisper"`);
    console.log('  ✅ Python + OpenAI Whisper is installed and ready.');
  } catch {
    console.warn('  ⚠️ Python or openai-whisper package not found. AI speech transcription will fail.');
  }
}

verifyWorkerDependencies().catch(() => {});

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
