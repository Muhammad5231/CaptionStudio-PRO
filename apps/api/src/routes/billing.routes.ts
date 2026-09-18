import { Router } from 'express';
import { PLAN_CONFIGS } from '@captionstudio/billing';
import { requireAuth } from '../middlewares/auth.middleware';

export const billingRouter = Router();

billingRouter.get('/plans', (_req, res) => {
  res.json({
    success: true,
    data: Object.values(PLAN_CONFIGS),
    timestamp: new Date().toISOString(),
  });
});

billingRouter.get('/subscription', requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: {
      planId: 'pro',
      planName: 'Pro Studio',
      status: 'ACTIVE',
      interval: 'monthly',
      priceUsd: 39,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
      cancelAtPeriodEnd: false,
    },
    timestamp: new Date().toISOString(),
  });
});

billingRouter.post('/checkout-session', requireAuth, (req, res) => {
  const { planTier } = req.body;
  res.json({
    success: true,
    data: {
      checkoutUrl: `https://checkout.stripe.com/c/pay/cs_test_mock_${planTier}`,
      sessionId: `cs_session_${Date.now()}`,
    },
    timestamp: new Date().toISOString(),
  });
});

