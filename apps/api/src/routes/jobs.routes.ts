import { Router, Request, Response } from 'express';
import { prisma, JobStatus } from '@captionstudio/database';
import { authenticate } from '../middlewares/auth.middleware';

export const jobsRouter = Router();

jobsRouter.use(authenticate);

/**
 * GET /api/v1/jobs/:id
 * Returns current job status, progress, stage, and errors
 */
jobsRouter.get('/:id', async (req: Request, res: Response) => {
  const job = await prisma.exportJob.findUnique({
    where: { id: req.params.id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
    },
  });

  if (!job) {
    return res.status(404).json({
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found.',
      },
    });
  }

  // Workspace verification
  const isMember = req.user!.workspaceMembers.some((m) => m.workspaceId === job.project.workspaceId);
  if (!isMember) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have access to this job.',
      },
    });
  }

  res.json({
    success: true,
    data: {
      id: job.id,
      projectId: job.projectId,
      type: job.type,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt?.toISOString() || null,
      completedAt: job.completedAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/jobs/:id/events
 * Server-Sent Events (SSE) stream for real-time progress updates
 */
jobsRouter.get('/:id/events', async (req: Request, res: Response) => {
  const jobId = req.params.id;

  const job = await prisma.exportJob.findUnique({
    where: { id: jobId },
    include: {
      project: true,
    },
  });

  if (!job) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
  }

  const isMember = req.user!.workspaceMembers.some((m) => m.workspaceId === job.project.workspaceId);
  if (!isMember) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } });
  }

  // Establish SSE stream
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Immediate initial snapshot
  sendEvent({
    id: job.id,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    errorMessage: job.errorMessage,
  });

  // If already done, close
  if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED || job.status === JobStatus.CANCELLED) {
    res.end();
    return;
  }

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  // Poll database every 1 second for progress until job concludes
  const interval = setInterval(async () => {
    if (closed) {
      clearInterval(interval);
      return;
    }

    try {
      const current = await prisma.exportJob.findUnique({
        where: { id: jobId },
      });

      if (!current) {
        clearInterval(interval);
        res.end();
        return;
      }

      sendEvent({
        id: current.id,
        status: current.status,
        progress: current.progress,
        stage: current.stage,
        errorMessage: current.errorMessage,
      });

      if (
        current.status === JobStatus.COMPLETED ||
        current.status === JobStatus.FAILED ||
        current.status === JobStatus.CANCELLED
      ) {
        clearInterval(interval);
        res.end();
      }
    } catch {
      clearInterval(interval);
      res.end();
    }
  }, 1000);
});
