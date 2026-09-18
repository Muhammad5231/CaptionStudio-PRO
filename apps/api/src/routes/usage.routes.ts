import { Router } from 'express';
import { PlanTier } from '@captionstudio/types';
import { requireAuth } from '../middlewares/auth.middleware';

export const usageRouter = Router();

usageRouter.get('/', requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: {
      planTier: PlanTier.PRO,
      transcriptionMinutesTotal: 500,
      transcriptionMinutesUsed: 32.5,
      renderMinutesTotal: 500,
      renderMinutesUsed: 28.0,
      storageBytesTotal: 100 * 1024 * 1024 * 1024,
      storageBytesUsed: 4.8 * 1024 * 1024 * 1024,
      exportsTotal: 300,
      exportsUsed: 14,
      maxProjects: 100,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      removeWatermark: true,
    },
    timestamp: new Date().toISOString(),
  });
});

