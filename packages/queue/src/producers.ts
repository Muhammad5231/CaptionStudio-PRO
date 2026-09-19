import { Queue } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from './constants';
import { TranscriptionJobData, ThumbnailJobData, ExportJobData, MediaAnalysisJobData } from './types';
import { getRedisConnection } from './connection';

let transcriptionQueue: Queue<TranscriptionJobData> | null = null;
let thumbnailQueue: Queue<ThumbnailJobData> | null = null;
let exportQueue: Queue<ExportJobData> | null = null;
let mediaAnalysisQueue: Queue<MediaAnalysisJobData> | null = null;

export function getTranscriptionQueue(): Queue<TranscriptionJobData> {
  if (!transcriptionQueue) {
    transcriptionQueue = new Queue<TranscriptionJobData>(QUEUE_NAMES.TRANSCRIPTION, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    transcriptionQueue.on('error', () => {});
  }
  return transcriptionQueue;
}

export function getThumbnailQueue(): Queue<ThumbnailJobData> {
  if (!thumbnailQueue) {
    thumbnailQueue = new Queue<ThumbnailJobData>(QUEUE_NAMES.THUMBNAIL, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    thumbnailQueue.on('error', () => {});
  }
  return thumbnailQueue;
}

export function getMediaAnalysisQueue(): Queue<MediaAnalysisJobData> {
  if (!mediaAnalysisQueue) {
    mediaAnalysisQueue = new Queue<MediaAnalysisJobData>(QUEUE_NAMES.MEDIA_ANALYSIS, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    mediaAnalysisQueue.on('error', () => {});
  }
  return mediaAnalysisQueue;
}

export function getExportQueue(): Queue<ExportJobData> {
  if (!exportQueue) {
    exportQueue = new Queue<ExportJobData>(QUEUE_NAMES.EXPORT, {
      connection: getRedisConnection(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    exportQueue.on('error', () => {});
  }
  return exportQueue;
}

export async function addMediaAnalysisJob(data: MediaAnalysisJobData) {
  const queue = getMediaAnalysisQueue();
  // Idempotent Job ID
  const jobId = data.jobId || `media-analysis:${data.assetId}`;
  return queue.add('analyze-media', data, {
    jobId,
  });
}

export async function addTranscriptionJob(data: TranscriptionJobData) {
  const queue = getTranscriptionQueue();
  // Idempotent Job ID
  const jobId = data.jobId || `transcription:${data.projectId}:${Date.now()}`;
  return queue.add('transcribe-speech', data, {
    jobId,
  });
}

export async function addExportJob(data: ExportJobData) {
  const queue = getExportQueue();
  const jobId = data.jobId || `export:${data.projectId}:${Date.now()}`;
  return queue.add('export-render', data, {
    jobId,
  });
}
