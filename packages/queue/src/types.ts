import { JobType, TranscodeOptions } from '@captionstudio/types';

export interface BaseJobData {
  jobId: string;
  userId: string;
  workspaceId: string;
  projectId: string;
}

export interface TranscriptionJobData extends BaseJobData {
  type: JobType.TRANSCRIPTION;
  audioStorageKey: string;
  language?: string;
  whisperModel?: 'tiny' | 'base' | 'small' | 'medium' | 'large-v3';
  detectSpeakers?: boolean;
}

export interface ThumbnailJobData extends BaseJobData {
  type: JobType.THUMBNAIL;
  videoStorageKey: string;
  timestampSeconds: number;
}

export interface ExportJobData extends BaseJobData {
  type: JobType.EXPORT;
  videoStorageKey: string;
  subtitleAssKey: string;
  options: TranscodeOptions;
}

export type AnyJobData = TranscriptionJobData | ThumbnailJobData | ExportJobData;

