import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma, UserStatus, JobStatus } from '@captionstudio/database';
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
