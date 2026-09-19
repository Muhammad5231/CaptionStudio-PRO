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
 * Retrieves real active subscription from database for the authenticated user.
 */
billingRouter.get('/subscription', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return res.json({
        success: true,
        data: null,
        message: 'No active paid subscription found.',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: {
        id: sub.id,
        planTier: sub.plan.tier,
        planName: sub.plan.name,
        status: sub.status,
        interval: sub.interval,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
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
