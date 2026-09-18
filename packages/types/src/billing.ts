export enum PlanTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
}

export enum UsageType {
  TRANSCRIPTION_MINUTES = 'TRANSCRIPTION_MINUTES',
  RENDER_MINUTES = 'RENDER_MINUTES',
  STORAGE_BYTES = 'STORAGE_BYTES',
  EXPORTS_COUNT = 'EXPORTS_COUNT',
}

export interface BillingQuota {
  planTier: PlanTier;
  transcriptionMinutesTotal: number;
  transcriptionMinutesUsed: number;
  renderMinutesTotal: number;
  renderMinutesUsed: number;
  storageBytesTotal: number;
  storageBytesUsed: number;
  exportsTotal: number;
  exportsUsed: number;
  maxProjects: number;
  allow4kExport: boolean;
  allow60Fps: boolean;
  allowCustomFonts: boolean;
  allowTeamCollaboration: boolean;
  removeWatermark: boolean;
}

export interface UsageLedgerDto {
  id: string;
  userId: string;
  workspaceId: string;
  type: UsageType;
  amount: number;
  projectId?: string | null;
  jobId?: string | null;
  createdAt: Date;
}

