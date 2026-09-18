import { PlanTier, BillingQuota, UsageLedgerDto, UsageType } from '@captionstudio/types';
import { PLAN_CONFIGS } from './plans';

export function calculateBillingQuota(
  planTier: PlanTier,
  usageEntries: UsageLedgerDto[],
  activeProjectsCount = 0
): BillingQuota {
  const plan = PLAN_CONFIGS[planTier] || PLAN_CONFIGS[PlanTier.FREE];
  const { quota } = plan;

  let transcriptionMinutesUsed = 0;
  let renderMinutesUsed = 0;
  let storageBytesUsed = 0;
  let exportsUsed = 0;

  for (const entry of usageEntries) {
    if (entry.type === UsageType.TRANSCRIPTION_MINUTES) {
      transcriptionMinutesUsed += entry.amount;
    } else if (entry.type === UsageType.RENDER_MINUTES) {
      renderMinutesUsed += entry.amount;
    } else if (entry.type === UsageType.STORAGE_BYTES) {
      storageBytesUsed += entry.amount;
    } else if (entry.type === UsageType.EXPORTS_COUNT) {
      exportsUsed += entry.amount;
    }
  }

  return {
    ...quota,
    transcriptionMinutesUsed: Number(transcriptionMinutesUsed.toFixed(1)),
    renderMinutesUsed: Number(renderMinutesUsed.toFixed(1)),
    storageBytesUsed,
    exportsUsed,
    maxProjects: quota.maxProjects,
  };
}

export function checkUsageLimit(
  quota: BillingQuota,
  type: UsageType,
  requestedAmount = 1
): { allowed: boolean; reason?: string } {
  switch (type) {
    case UsageType.TRANSCRIPTION_MINUTES:
      if (quota.transcriptionMinutesUsed + requestedAmount > quota.transcriptionMinutesTotal) {
        return {
          allowed: false,
          reason: `Transcription quota exceeded (${quota.transcriptionMinutesUsed}/${quota.transcriptionMinutesTotal} mins used). Please upgrade your plan.`,
        };
      }
      break;
    case UsageType.RENDER_MINUTES:
      if (quota.renderMinutesUsed + requestedAmount > quota.renderMinutesTotal) {
        return {
          allowed: false,
          reason: `Render quota exceeded (${quota.renderMinutesUsed}/${quota.renderMinutesTotal} mins used). Please upgrade your plan.`,
        };
      }
      break;
    case UsageType.EXPORTS_COUNT:
      if (quota.exportsUsed + requestedAmount > quota.exportsTotal) {
        return {
          allowed: false,
          reason: `Monthly export limit reached (${quota.exportsUsed}/${quota.exportsTotal} exports). Upgrade to continue exporting.`,
        };
      }
      break;
    case UsageType.STORAGE_BYTES:
      if (quota.storageBytesUsed + requestedAmount > quota.storageBytesTotal) {
        return {
          allowed: false,
          reason: 'Cloud storage capacity exceeded. Please delete old projects or upgrade your storage tier.',
        };
      }
      break;
  }

  return { allowed: true };
}

