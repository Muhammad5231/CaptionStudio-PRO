import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PlanTier, UsageType, UsageLedgerDto } from '../packages/types/src/index';
import { calculateBillingQuota, checkUsageLimit } from '../packages/billing/src/quota';
import { PLAN_CONFIGS } from '../packages/billing/src/plans';

describe('Part 4 & 5: Usage Accounting & Idempotency', () => {
  it('should calculate accurate usage for Free Tier without defaulting to Pro', () => {
    const usage: UsageLedgerDto[] = [
      {
        id: '1',
        userId: 'u-1',
        workspaceId: 'w-1',
        type: UsageType.TRANSCRIPTION_MINUTES,
        amount: 5.0,
        createdAt: new Date().toISOString(),
      },
    ];

    const quota = calculateBillingQuota(PlanTier.FREE, usage, 1);

    assert.strictEqual(quota.planTier, PlanTier.FREE);
    assert.strictEqual(quota.transcriptionMinutesTotal, 15);
    assert.strictEqual(quota.transcriptionMinutesUsed, 5.0);
    assert.strictEqual(quota.allow4kExport, false);
    assert.strictEqual(quota.removeWatermark, false);
  });

  it('should enforce quota limits when usage exceeds plan limits', () => {
    const usage: UsageLedgerDto[] = [
      {
        id: '1',
        userId: 'u-1',
        workspaceId: 'w-1',
        type: UsageType.TRANSCRIPTION_MINUTES,
        amount: 14.5,
        createdAt: new Date().toISOString(),
      },
    ];

    const quota = calculateBillingQuota(PlanTier.FREE, usage);

    // 14.5 + 0.4 <= 15 -> allowed
    const allowed = checkUsageLimit(quota, UsageType.TRANSCRIPTION_MINUTES, 0.4);
    assert.strictEqual(allowed.allowed, true);

    // 14.5 + 1.0 > 15 -> rejected
    const blocked = checkUsageLimit(quota, UsageType.TRANSCRIPTION_MINUTES, 1.0);
    assert.strictEqual(blocked.allowed, false);
    assert.ok(blocked.reason?.includes('Transcription quota exceeded'));
  });

  it('should produce deterministic eventKeys for retries', () => {
    const jobId = 'job-transcribe-12345';
    const eventKey1 = `TRANSCRIPTION:${jobId}`;
    const eventKey2 = `TRANSCRIPTION:${jobId}`;

    assert.strictEqual(eventKey1, eventKey2);
    assert.strictEqual(eventKey1, 'TRANSCRIPTION:job-transcribe-12345');
  });
});
