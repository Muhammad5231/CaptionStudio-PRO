import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma, UserStatus, JobStatus } from '@captionstudio/database';
import {
  checkRedisHealth,
  getRedisConnection,
  getTranscriptionQueue,
  getThumbnailQueue,
  getMediaAnalysisQueue,
  getExportQueue,
} from '@captionstudio/queue';
import { authenticate, requireSystemAdmin } from '../middlewares/auth.middleware';
import { recordAuditLog } from '../services/audit.service';

export const adminRouter = Router();

// Apply auth + system admin guard
adminRouter.use(authenticate);
adminRouter.use(requireSystemAdmin);

const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

/**
 * GET /api/v1/admin/overview
 * Real database metrics for admin dashboard (no fabricated numbers).
 */
adminRouter.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalJobs,
      failedJobs24h,
      storageAggregate,
      pendingJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.project.count(),
      prisma.exportJob.count(),
      prisma.exportJob.count({
        where: {
          status: JobStatus.FAILED,
          createdAt: { gte: oneDayAgo },
        },
      }),
      prisma.projectAsset.aggregate({
        _sum: { sizeBytes: true },
      }),
      prisma.exportJob.count({ where: { status: JobStatus.PENDING } }),
      prisma.exportJob.count({ where: { status: JobStatus.PROCESSING } }),
      prisma.exportJob.count({ where: { status: JobStatus.COMPLETED } }),
      prisma.exportJob.count({ where: { status: JobStatus.FAILED } }),
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
          workspaceMembers: {
            take: 1,
            select: {
              workspace: {
                select: { name: true },
              },
            },
          },
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

    const storageUsedBytes = Number(storageAggregate._sum.sizeBytes || 0);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeUsers,
          projectsCreated: totalProjects,
          jobsDispatched: totalJobs,
          storageUsedBytes,
          failedJobs24h,
          jobsBreakdown: {
            pending: pendingJobs,
            processing: processingJobs,
            completed: completedJobs,
            failed: failedJobs,
          },
          // Clear indication for future billing metrics (Phase 7)
          billing: {
            status: 'NOT_IMPLEMENTED',
            activeSubscribers: 0,
            mrrUsd: 0,
            note: 'Stripe subscription billing is scheduled for Phase 7',
          },
        },
        recentUsers: recentUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          workspace: u.workspaceMembers[0]?.workspace.name || null,
          joined: u.createdAt.toISOString(),
        })),
        recentJobs: recentJobs.map((j) => ({
          id: j.id,
          type: j.type,
          status: j.status,
          progress: j.progress,
          project: j.project.name,
          stage: j.stage || null,
          createdAt: j.createdAt.toISOString(),
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/users
 * Real database user listing with actual project counts and workspace memberships.
 */
adminRouter.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
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
        updatedAt: true,
        workspaceMembers: {
          select: {
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                _count: {
                  select: { projects: true },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: users.map((u) => {
        const totalProjects = u.workspaceMembers.reduce(
          (sum, m) => sum + (m.workspace._count.projects || 0),
          0
        );

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          projectsCount: totalProjects,
          workspacesCount: u.workspaceMembers.length,
          primaryWorkspace: u.workspaceMembers[0]?.workspace.name || null,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      }),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/users/:id/status
 * Validates status enum, prevents self-suspension, and logs audit record.
 */
adminRouter.patch('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.id;
    const { status } = UpdateUserStatusSchema.parse(req.body);

    if (req.user?.id === targetUserId && status === UserStatus.SUSPENDED) {
      return res.status(400).json({
        error: {
          code: 'SELF_SUSPENSION_DENIED',
          message: 'Administrators cannot suspend their own account.',
        },
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, status: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: `User with ID ${targetUserId} not found.`,
        },
      });
    }

    const previousStatus = existingUser.status;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { status },
    });

    // If suspended or deactivated, revoke all their active sessions
    if (status === UserStatus.SUSPENDED || status === UserStatus.DEACTIVATED) {
      await prisma.session.deleteMany({
        where: { userId: targetUserId },
      });
    }

    await recordAuditLog({
      userId: req.user!.id,
      action: 'ADMIN_USER_STATUS_CHANGE',
      resource: `User:${targetUserId}`,
      details: {
        targetUserId,
        targetEmail: existingUser.email,
        previousStatus,
        newStatus: status,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        previousStatus,
        newStatus: status,
      },
      message: `User ${targetUserId} status updated from ${previousStatus} to ${status}.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/queues
 * Real BullMQ queue metrics and Redis health.
 */
adminRouter.get('/queues', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const redisHealth = await checkRedisHealth();
    if (!redisHealth.isConnected) {
      return res.json({
        success: true,
        data: {
          redis: redisHealth,
          queues: [],
          memory: null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    let memoryUsedHuman = 'N/A';
    try {
      const redis = getRedisConnection();
      const memInfo = await redis.info('memory');
      const match = memInfo.match(/used_memory_human:([^\r\n]+)/);
      if (match) {
        memoryUsedHuman = match[1];
      }
    } catch {
      // ignore
    }

    const queueList = [
      { name: 'transcription-queue', queue: getTranscriptionQueue() },
      { name: 'media-analysis-queue', queue: getMediaAnalysisQueue() },
      { name: 'thumbnail-queue', queue: getThumbnailQueue() },
      { name: 'export-queue', queue: getExportQueue() },
    ];

    const queues = await Promise.all(
      queueList.map(async ({ name, queue }) => {
        try {
          const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
          return {
            name,
            counts,
            status: counts.active > 0 ? 'ACTIVE' : 'IDLE',
          };
        } catch {
          return {
            name,
            counts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
            status: 'UNAVAILABLE',
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        redis: {
          ...redisHealth,
          memoryUsedHuman,
        },
        queues,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/jobs
 * Real database export jobs with associated project and user info.
 */
adminRouter.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as JobStatus | undefined;
    const where: any = {};
    if (status && Object.values(JobStatus).includes(status)) {
      where.status = status;
    }

    const jobs = await prisma.exportJob.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        exportRecord: {
          select: { url: true },
        },
        project: {
          select: {
            id: true,
            name: true,
            workspace: {
              select: {
                members: {
                  where: { role: 'OWNER' },
                  take: 1,
                  include: {
                    user: {
                      select: { email: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: jobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        progress: j.progress,
        stage: j.stage,
        errorMessage: j.errorMessage,
        outputUrl: j.exportRecord?.url || null,
        projectId: j.projectId,
        projectName: j.project?.name || 'Untitled Project',
        userEmail: j.project?.workspace?.members[0]?.user?.email || 'System',
        createdAt: j.createdAt.toISOString(),
        updatedAt: j.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/templates
 * Real global templates from database.
 */
adminRouter.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { downloadsCount: 'desc' },
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: templates.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        category: t.category.name,
        isPublished: t.isPublished,
        isPremium: t.isPremium,
        downloads: t.downloadsCount,
        likes: t.likesCount,
        createdAt: t.createdAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/templates/:id
 * Toggle published/premium status of a template.
 */
adminRouter.patch('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templateId = req.params.id;
    const { isPublished, isPremium } = req.body;

    const updated = await prisma.template.update({
      where: { id: templateId },
      data: {
        ...(typeof isPublished === 'boolean' ? { isPublished } : {}),
        ...(typeof isPremium === 'boolean' ? { isPremium } : {}),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `Template ${templateId} updated.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
