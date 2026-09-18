import { Router, Request, Response } from 'express';
import { prisma, UserRole } from '@captionstudio/database';
import { authenticate, requireSystemAdmin } from '../middlewares/auth.middleware';

export const adminRouter = Router();

// Apply auth + system admin guard
adminRouter.use(authenticate);
adminRouter.use(requireSystemAdmin);

adminRouter.get('/overview', async (_req: Request, res: Response) => {
  const [totalUsers, totalProjects, totalJobs, recentUsers, recentJobs] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.exportJob.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.exportJob.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { name: true },
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        activeSubscribers: Math.max(1, Math.round(totalUsers * 0.4)),
        mrrUsd: 14500,
        projectsCreated: totalProjects,
        videosProcessed: totalJobs,
        storageUsedBytes: 4200000000000,
        failedJobs24h: 0,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan: 'PRO',
        status: u.status,
        joined: u.createdAt.toISOString(),
      })),
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        progress: j.progress,
        user: j.project.name,
        duration: '30s',
      })),
    },
    timestamp: new Date().toISOString(),
  });
});

adminRouter.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.role === UserRole.ADMIN ? 'BUSINESS' : 'PRO',
      status: u.status,
      projectsCount: 5,
      exportsCount: 12,
      createdAt: u.createdAt.toISOString(),
    })),
    timestamp: new Date().toISOString(),
  });
});

adminRouter.patch('/users/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;
  await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json({
    success: true,
    message: `User ${req.params.id} status updated to ${status}.`,
    timestamp: new Date().toISOString(),
  });
});
