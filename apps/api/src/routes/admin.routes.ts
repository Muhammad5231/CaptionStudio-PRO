import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { UserRole } from '@captionstudio/types';

export const adminRouter = Router();

// Apply auth + admin guard
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.get('/overview', (_req, res) => {
  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers: 14820,
        activeSubscribers: 3410,
        mrrUsd: 112450,
        projectsCreated: 89400,
        videosProcessed: 142100,
        storageUsedBytes: 4200000000000, // 4.2 TB
        failedJobs24h: 3,
      },
      recentUsers: [
        { id: 'u-1', name: 'Sophia Chen', email: 'sophia@creatorhub.io', role: 'CREATOR', plan: 'PRO', status: 'ACTIVE', joined: '2 hours ago' },
        { id: 'u-2', name: 'Marcus Brody', email: 'marcus@brodymedia.com', role: 'CREATOR', plan: 'BUSINESS', status: 'ACTIVE', joined: '5 hours ago' },
        { id: 'u-3', name: 'Elena Rostova', email: 'elena@filmcraft.net', role: 'USER', plan: 'FREE', status: 'ACTIVE', joined: '1 day ago' },
      ],
      recentJobs: [
        { id: 'j-1', type: 'EXPORT', status: 'PROCESSING', progress: 68, user: 'marcus@brodymedia.com', duration: '45s' },
        { id: 'j-2', type: 'TRANSCRIPTION', status: 'COMPLETED', progress: 100, user: 'sophia@creatorhub.io', duration: '12s' },
        { id: 'j-3', type: 'RENDER', status: 'FAILED', progress: 14, user: 'elena@filmcraft.net', duration: '8s', error: 'Corrupt audio sample rate' },
      ],
    },
    timestamp: new Date().toISOString(),
  });
});

adminRouter.get('/users', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'u-1', name: 'Sophia Chen', email: 'sophia@creatorhub.io', role: 'CREATOR', plan: 'PRO', status: 'ACTIVE', projectsCount: 18, exportsCount: 42, createdAt: '2026-08-14' },
      { id: 'u-2', name: 'Marcus Brody', email: 'marcus@brodymedia.com', role: 'CREATOR', plan: 'BUSINESS', status: 'ACTIVE', projectsCount: 142, exportsCount: 390, createdAt: '2026-07-02' },
      { id: 'u-3', name: 'Elena Rostova', email: 'elena@filmcraft.net', role: 'USER', plan: 'FREE', status: 'ACTIVE', projectsCount: 3, exportsCount: 4, createdAt: '2026-09-01' },
      { id: 'u-4', name: 'David Kim', email: 'david@fluxstream.tv', role: 'CREATOR', plan: 'CREATOR', status: 'SUSPENDED', projectsCount: 12, exportsCount: 22, createdAt: '2026-06-11' },
    ],
    timestamp: new Date().toISOString(),
  });
});

adminRouter.patch('/users/:id/status', (req, res) => {
  const { status } = req.body;
  res.json({
    success: true,
    message: `User ${req.params.id} status updated to ${status}.`,
    timestamp: new Date().toISOString(),
  });
});

