import { Router, Request, Response } from 'express';
import { prisma } from '@captionstudio/database';
import { authenticate } from '../middlewares/auth.middleware';

export const exportsRouter = Router();

exportsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const activeWorkspace = req.user!.workspaceMembers[0];
  const workspaceId = activeWorkspace?.workspaceId;

  const exportsList = workspaceId
    ? await prisma.export.findMany({
        where: {
          project: {
            workspaceId,
          },
        },
        include: {
          project: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  res.json({
    success: true,
    data: exportsList.map((e) => ({
      id: e.id,
      projectId: e.projectId,
      projectName: e.project.name,
      url: e.url,
      format: e.format,
      resolution: e.resolution,
      fps: e.fps,
      sizeBytes: Number(e.sizeBytes),
      durationSeconds: e.durationSeconds,
      status: 'COMPLETED',
      createdAt: e.createdAt.toISOString(),
    })),
    timestamp: new Date().toISOString(),
  });
});
