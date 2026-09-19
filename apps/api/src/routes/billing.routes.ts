import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@captionstudio/database';
import { PLAN_CONFIGS } from '@captionstudio/billing';
import { authenticate } from '../middlewares/auth.middleware';

export const billingRouter = Router();

/**
 * GET /api/v1/billing/plans
 * Available plans and features.
 */
billingRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(PLAN_CONFIGS),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/billing/subscription
 * Returns local development subscription status without Stripe/database subscription model.
 */
billingRouter.get('/subscription', authenticate, async (_req: Request, res: Response) => {
  const now = new Date();
  const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const currentPeriodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)).toISOString();

  res.json({
    success: true,
    data: {
      id: 'sub_local_dev',
      planTier: 'LOCAL',
      planName: 'Local Development Mode',
      status: 'ACTIVE',
      interval: 'MONTHLY',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
    message: 'Local development mode active.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/billing/checkout-session
 * Stripe billing checkout endpoint (Phase 7).
 */
billingRouter.post('/checkout-session', authenticate, (_req: Request, res: Response) => {
  res.status(501).json({
    error: {
      code: 'BILLING_NOT_AVAILABLE',
      message: 'Stripe subscription checkout is scheduled for Phase 7 implementation.',
    },
    timestamp: new Date().toISOString(),
  });
});
