import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateBillingQuota, checkUsageLimit } from '../packages/billing/src/index';
import { PlanTier, UsageType, UsageLedgerDto } from '../packages/types/src/index';

describe('Billing & Usage Quota Calculations', () => {
  it('should accurately calculate used and total quotas for Pro tier', () => {
    const usage: UsageLedgerDto[] = [
      {
        id: '1',
        userId: 'u-1',
        workspaceId: 'w-1',
        type: UsageType.TRANSCRIPTION_MINUTES,
        amount: 25.5,
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: 'u-1',
        workspaceId: 'w-1',
        type: UsageType.TRANSCRIPTION_MINUTES,
        amount: 10.0,
        createdAt: new Date(),
      },
    ];

    const quota = calculateBillingQuota(PlanTier.PRO, usage);

    assert.strictEqual(quota.transcriptionMinutesTotal, 500);
    assert.strictEqual(quota.transcriptionMinutesUsed, 35.5);
    assert.strictEqual(quota.allow4kExport, true);
    assert.strictEqual(quota.allowTeamCollaboration, true);
  });

  it('should block usage requests when quota would be exceeded', () => {
    const usage: UsageLedgerDto[] = [
      {
        id: '1',
        userId: 'u-1',
        workspaceId: 'w-1',
        type: UsageType.TRANSCRIPTION_MINUTES,
        amount: 14.5,
        createdAt: new Date(),
      },
    ];

    // Free plan has 15 total minutes
    const quota = calculateBillingQuota(PlanTier.FREE, usage);

    const allowedCheck = checkUsageLimit(quota, UsageType.TRANSCRIPTION_MINUTES, 0.4);
    assert.strictEqual(allowedCheck.allowed, true);

    const blockedCheck = checkUsageLimit(quota, UsageType.TRANSCRIPTION_MINUTES, 1.0);
    assert.strictEqual(blockedCheck.allowed, false);
    assert.ok(blockedCheck.reason?.includes('quota exceeded'));
  });
});

