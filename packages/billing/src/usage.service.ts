import { prisma, PlanTier as DbPlanTier, UsageType as DbUsageType, UsageLedger } from '@captionstudio/database';
import { BillingQuota, UsageLedgerDto, PlanTier as BillingPlanTier, UsageType as BillingUsageType } from '@captionstudio/types';
import { PLAN_CONFIGS } from './plans';
import { calculateBillingQuota, checkUsageLimit } from './quota';

export interface RecordUsageParams {
  userId: string;
  workspaceId: string;
  type: DbUsageType;
  amount: number;
  projectId?: string;
  jobId?: string;
  eventKey?: string;
}

export interface WorkspaceQuotaResult {
  quota: BillingQuota;
  tier: DbPlanTier;
  periodStart: Date;
  periodEnd: Date;
  subscriptionId?: string;
}

export class QuotaExceededError extends Error {
  public readonly code = 'QUOTA_EXCEEDED';
  public readonly status = 402;
  constructor(public readonly reason: string) {
    super(reason);
    this.name = 'QuotaExceededError';
  }
}

export class UsageService {
  /**
   * Records usage into UsageLedger with strict DB-level idempotency via eventKey.
   */
  async recordUsage(params: RecordUsageParams): Promise<{ record: UsageLedger; duplicate: boolean }> {
    if (params.eventKey) {
      const existing = await prisma.usageLedger.findUnique({
        where: { eventKey: params.eventKey },
      });
      if (existing) {
        return { record: existing, duplicate: true };
      }
    }

    try {
      const record = await prisma.usageLedger.create({
        data: {
          userId: params.userId,
          workspaceId: params.workspaceId,
          type: params.type,
          amount: params.amount,
          projectId: params.projectId,
          jobId: params.jobId,
          eventKey: params.eventKey,
        },
      });
      return { record, duplicate: false };
    } catch (err: unknown) {
      if (params.eventKey && typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
        const existing = await prisma.usageLedger.findUnique({
          where: { eventKey: params.eventKey },
        });
        if (existing) {
          return { record: existing, duplicate: true };
        }
      }
      throw err;
    }
  }

  /**
   * Retrieves accurate, non-mocked quota and usage for a given workspace in local development.
   */
  async getWorkspaceQuota(workspaceId: string, _userId?: string): Promise<WorkspaceQuotaResult> {
    const tier: DbPlanTier = (process.env.DEFAULT_PLAN_TIER as DbPlanTier) || DbPlanTier.LOCAL;

    // Determine cycle start and end dates (current month)
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Aggregate period ledger entries
    const ledgerEntries = await prisma.usageLedger.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const activeProjectsCount = await prisma.project.count({
      where: { workspaceId },
    });

    // Map to Dtos for calculateBillingQuota
    const mappedEntries: UsageLedgerDto[] = ledgerEntries.map((e) => ({
      id: e.id,
      userId: e.userId,
      workspaceId: e.workspaceId,
      type: e.type as unknown as BillingUsageType,
      amount: e.amount,
      createdAt: e.createdAt,
    }));

    const quota = calculateBillingQuota(tier as unknown as BillingPlanTier, mappedEntries, activeProjectsCount);

    return {
      quota,
      tier,
      periodStart,
      periodEnd,
    };
  }

  /**
   * Asserts that requested usage does not exceed current plan limits.
   */
  async assertQuotaAvailable(
    workspaceId: string,
    type: DbUsageType,
    amount = 1,
    userId?: string
  ): Promise<void> {
    const { quota } = await this.getWorkspaceQuota(workspaceId, userId);
    const check = checkUsageLimit(quota, type as unknown as BillingUsageType, amount);
    if (!check.allowed) {
      throw new QuotaExceededError(check.reason || 'Plan usage quota exceeded.');
    }
  }

  /**
   * Lists usage history entries with pagination.
   */
  async getWorkspaceLedger(params: {
    workspaceId: string;
    limit?: number;
    offset?: number;
    type?: DbUsageType;
  }) {
    const limit = Math.min(params.limit || 50, 100);
    const offset = params.offset || 0;

    const where: any = { workspaceId: params.workspaceId };
    if (params.type) {
      where.type = params.type;
    }

    const [entries, total] = await Promise.all([
      prisma.usageLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.usageLedger.count({ where }),
    ]);

    return {
      entries,
      total,
      limit,
      offset,
    };
  }
}

export const usageService = new UsageService();
