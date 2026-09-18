import { Router, Request, Response } from 'express';
import { prisma, PlanTier } from '@captionstudio/database';
import { authenticate } from '../middlewares/auth.middleware';

export const usageRouter = Router();

usageRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const activeWorkspace = req.user!.workspaceMembers[0];
  const workspaceId = activeWorkspace?.workspaceId;

  // Aggregate real usage from UsageLedger
  const usageRecords = workspaceId
    ? await prisma.usageLedger.findMany({
        where: { workspaceId },
      })
    : [];

  let totalStorageBytes = 0;
  let totalTranscriptionMins = 0;
  let totalRenderMins = 0;
  let totalExports = 0;

  for (const record of usageRecords) {
    if (record.type === 'STORAGE_BYTES') totalStorageBytes += record.amount;
    if (record.type === 'TRANSCRIPTION_MINUTES') totalTranscriptionMins += record.amount;
    if (record.type === 'RENDER_MINUTES') totalRenderMins += record.amount;
    if (record.type === 'EXPORTS_COUNT') totalExports += record.amount;
  }

  const projectsCount = workspaceId
    ? await prisma.project.count({ where: { workspaceId } })
    : 0;

  res.json({
    success: true,
    data: {
      planTier: PlanTier.PRO,
      transcriptionMinutesTotal: 500,
      transcriptionMinutesUsed: totalTranscriptionMins || 0,
      renderMinutesTotal: 500,
      renderMinutesUsed: totalRenderMins || 0,
      storageBytesTotal: 100 * 1024 * 1024 * 1024,
      storageBytesUsed: totalStorageBytes || 0,
      exportsTotal: 300,
      exportsUsed: totalExports || 0,
      projectsCount,
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
