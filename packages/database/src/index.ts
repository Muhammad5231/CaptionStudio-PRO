import path from 'node:path';
import { PrismaClient } from '@prisma/client';

// Ensure SQLite database URL points to workspace root data/captionstudio.db
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('captionstudio.db')) {
  const rootDir = path.resolve(__dirname, '../../..');
  const dbPath = path.resolve(rootDir, 'data/captionstudio.db').replace(/\\/g, '/');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// -----------------------------------------------------------------------------
// Domain Enums (exported for strong type safety with SQLite)
// -----------------------------------------------------------------------------

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum PlanTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  LOCAL = 'LOCAL',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  TRANSCRIBING = 'TRANSCRIBING',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  EXPORTED = 'EXPORTED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssetType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  SUBTITLE = 'SUBTITLE',
  THUMBNAIL = 'THUMBNAIL',
  RENDERED_VIDEO = 'RENDERED_VIDEO',
  CUSTOM_FONT = 'CUSTOM_FONT',
}

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

export enum UsageType {
  TRANSCRIPTION_MINUTES = 'TRANSCRIPTION_MINUTES',
  RENDER_MINUTES = 'RENDER_MINUTES',
  STORAGE_BYTES = 'STORAGE_BYTES',
  EXPORTS_COUNT = 'EXPORTS_COUNT',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  JOB_COMPLETED = 'JOB_COMPLETED',
  JOB_FAILED = 'JOB_FAILED',
  BILLING_NOTICE = 'BILLING_NOTICE',
  PROJECT_SHARED = 'PROJECT_SHARED',
}

export enum UploadIntentStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export * from '@prisma/client';
