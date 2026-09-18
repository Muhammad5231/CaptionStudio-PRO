export enum JobType {
  TRANSCRIPTION = 'TRANSCRIPTION',
  MEDIA_ANALYSIS = 'MEDIA_ANALYSIS',
  THUMBNAIL = 'THUMBNAIL',
  RENDER = 'RENDER',
  EXPORT = 'EXPORT',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface JobProgressPayload {
  percentage: number;
  stage: string;
  processedSeconds?: number;
  totalSeconds?: number;
}

export interface JobDto {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  progress: number;
  stage?: string | null;
  userId: string;
  projectId?: string | null;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

