import { Queue } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from './constants';
import { TranscriptionJobData, ThumbnailJobData, ExportJobData } from './types';
import { getRedisConnection } from './connection';

let transcriptionQueue: Queue<TranscriptionJobData> | null = null;
let thumbnailQueue: Queue<ThumbnailJobData> | null = null;
let exportQueue: Queue<ExportJobData> | null = null;

export function getTranscriptionQueue(): Queue<TranscriptionJobData> {
  if (!transcriptionQueue) {
    transcriptionQueue = new Queue<TranscriptionJobData>(QUEUE_NAMES.TRANSCRIPTION, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
  }
  return transcriptionQueue;
}

export function getThumbnailQueue(): Queue<ThumbnailJobData> {
  if (!thumbnailQueue) {
    thumbnailQueue = new Queue<ThumbnailJobData>(QUEUE_NAMES.THUMBNAIL, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
  }
  return thumbnailQueue;
}

export function getExportQueue(): Queue<ExportJobData> {
  if (!exportQueue) {
    exportQueue = new Queue<ExportJobData>(QUEUE_NAMES.EXPORT, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
  }
  return exportQueue;
}

