import { Router } from 'express';
import { z } from 'zod';
import { prisma, Prisma, ProjectStatus, WorkspaceRole, JobType, JobStatus } from '@captionstudio/database';
import { CreateProjectSchema, UpdateProjectSchema } from '@captionstudio/types';
import { OutboxDispatcher } from '@captionstudio/queue';
import { authenticate } from '../middlewares/auth.middleware';
import { requireWorkspace } from '../middlewares/workspace.middleware';
import { requireProjectAccess } from '../middlewares/project.middleware';
import { recordAuditLog } from '../services/audit.service';

const outboxDispatcher = new OutboxDispatcher(prisma as any);


export const projectsRouter = Router();

// All project endpoints require authentication
projectsRouter.use(authenticate);

/**
 * POST /api/v1/projects
 * Creates a new project in the active workspace.
 */
projectsRouter.post('/', requireWorkspace(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const data = CreateProjectSchema.parse(req.body);
    const workspaceId = req.workspace!.id;

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: ProjectStatus.DRAFT,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      action: 'PROJECT_CREATE',
      resource: `Project:${project.id}`,
      details: { name: project.name, workspaceId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        workspaceId: project.workspaceId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
      message: 'Project created successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/projects
 * Lists projects with pagination, search, status filtering, and sorting.
 * Strictly isolated to the authenticated user's workspace.
 */
projectsRouter.get('/', requireWorkspace(WorkspaceRole.VIEWER), async (req, res, next) => {
  try {
    const workspaceId = req.workspace!.id;

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 20));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const statusParam = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : '';
    const sortField = req.query.sort === 'name' ? 'name' : req.query.sort === 'createdAt' ? 'createdAt' : 'updatedAt';
    const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc';

    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      ...(statusParam && statusParam !== 'ALL' && Object.values(ProjectStatus).includes(statusParam as ProjectStatus)
        ? { status: statusParam as ProjectStatus }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          assets: {
            select: {
              id: true,
              type: true,
              url: true,
              sizeBytes: true,
              durationSeconds: true,
              width: true,
              height: true,
              fps: true,
              createdAt: true,
            },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
            select: {
              id: true,
              versionNumber: true,
              createdAt: true,
            },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Format items serializing BigInt values safely
    const formattedItems = items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      thumbnailUrl: p.thumbnailUrl,
      durationSeconds: p.durationSeconds,
      width: p.width,
      height: p.height,
      fps: p.fps,
      workspaceId: p.workspaceId,
      assets: p.assets.map((a) => ({
        ...a,
        sizeBytes: Number(a.sizeBytes),
      })),
      latestVersion: p.versions[0] || null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/projects/:id
 * Fetches a single project by ID with full metadata, assets, and version tracks.
 */
projectsRouter.get('/:id', requireProjectAccess(WorkspaceRole.VIEWER), async (req, res, next) => {
  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        assets: {
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        exportJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        thumbnailUrl: project.thumbnailUrl,
        durationSeconds: project.durationSeconds,
        width: project.width,
        height: project.height,
        fps: project.fps,
        activeTemplateId: project.activeTemplateId,
        workspaceId: project.workspaceId,
        assets: project.assets.map((a) => ({
          id: a.id,
          type: a.type,
          url: a.url,
          mimeType: a.mimeType,
          sizeBytes: Number(a.sizeBytes),
          durationSeconds: a.durationSeconds,
          width: a.width,
          height: a.height,
          fps: a.fps,
          createdAt: a.createdAt.toISOString(),
        })),
        versions: project.versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          captionPayload: v.captionPayload,
          changelog: v.changelog,
          createdAt: v.createdAt.toISOString(),
        })),
        recentJobs: project.exportJobs.map((j) => ({
          id: j.id,
          type: j.type,
          status: j.status,
          progress: j.progress,
          stage: j.stage,
          errorMessage: j.errorMessage,
          createdAt: j.createdAt.toISOString(),
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/projects/:id
 * Updates project details (name, description, activeTemplateId).
 */
projectsRouter.patch('/:id', requireProjectAccess(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const data = UpdateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.activeTemplateId ? { activeTemplateId: data.activeTemplateId } : {}),
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      action: 'PROJECT_UPDATE',
      resource: `Project:${project.id}`,
      details: data as Record<string, unknown>,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        updatedAt: project.updatedAt.toISOString(),
      },
      message: 'Project updated successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/projects/:id/archive
 * Toggles or sets archive status on the project.
 */
projectsRouter.post('/:id/archive', requireProjectAccess(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const current = req.project!;
    const newStatus = current.status === ProjectStatus.ARCHIVED ? ProjectStatus.DRAFT : ProjectStatus.ARCHIVED;

    const project = await prisma.project.update({
      where: { id: current.id },
      data: { status: newStatus },
    });

    await recordAuditLog({
      userId: req.user!.id,
      action: 'PROJECT_ARCHIVE',
      resource: `Project:${project.id}`,
      details: { status: newStatus },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        id: project.id,
        status: project.status,
      },
      message: newStatus === ProjectStatus.ARCHIVED ? 'Project archived.' : 'Project restored from archive.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/projects/:id/duplicate
 * Clones project metadata and configurations without duplicating physical video assets.
 */
projectsRouter.post('/:id/duplicate', requireProjectAccess(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const source = await prisma.project.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    const duplicateName = `${source.name} (Copy)`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const newProj = await tx.project.create({
        data: {
          workspaceId: source.workspaceId,
          name: duplicateName,
          description: source.description,
          status: ProjectStatus.DRAFT,
          activeTemplateId: source.activeTemplateId,
          durationSeconds: source.durationSeconds,
          width: source.width,
          height: source.height,
          fps: source.fps,
        },
      });

      // If source had a version track, copy latest version
      if (source.versions[0]) {
        await tx.projectVersion.create({
          data: {
            projectId: newProj.id,
            versionNumber: 1,
            captionPayload: source.versions[0].captionPayload,
            changelog: 'Cloned from project ' + source.id,
          },
        });
      }

      return newProj;
    });

    await recordAuditLog({
      userId: req.user!.id,
      action: 'PROJECT_DUPLICATE',
      resource: `Project:${duplicated.id}`,
      details: { sourceProjectId: source.id },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        id: duplicated.id,
        name: duplicated.name,
        status: duplicated.status,
        createdAt: duplicated.createdAt.toISOString(),
      },
      message: 'Project duplicated successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/projects/:id
 * Permanently deletes the project and cascades related records.
 */
projectsRouter.delete('/:id', requireProjectAccess(WorkspaceRole.ADMIN), async (req, res, next) => {
  try {
    const projectId = req.params.id;

    await prisma.project.delete({
      where: { id: projectId },
    });

    await recordAuditLog({
      userId: req.user!.id,
      action: 'PROJECT_DELETE',
      resource: `Project:${projectId}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Project deleted successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/projects/:id/transcribe
 * Triggers Whisper AI transcription for the project's primary video asset.
 */
projectsRouter.post('/:id/transcribe', requireProjectAccess(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { language = 'auto', whisperModel = 'tiny' } = req.body || {};

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { assets: true },
    });

    if (!project) {
      return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } });
    }

    const videoAsset = project.assets.find((a) => a.type === 'VIDEO');
    if (!videoAsset) {
      return res.status(400).json({
        error: {
          code: 'NO_VIDEO_ASSET',
          message: 'Project has no uploaded video asset to transcribe. Please upload a video first.',
        },
      });
    }

    // Create TRANSCRIPTION job and OutboxEvent atomically
    const job = await prisma.$transaction(async (tx) => {
      const createdJob = await tx.exportJob.create({
        data: {
          projectId: project.id,
          type: JobType.TRANSCRIPTION,
          status: JobStatus.PENDING,
          progress: 0,
          stage: 'Enqueued for transcription',
          metadata: JSON.stringify({
            language,
            whisperModel,
            assetId: videoAsset.id,
            storageKey: videoAsset.storageKey,
          }),
        },
      });

      await tx.outboxEvent.create({
        data: {
          type: 'TRANSCRIPTION',
          aggregateId: createdJob.id,
          payload: JSON.stringify({
            jobId: createdJob.id,
            userId: req.user!.id,
            workspaceId: project.workspaceId,
            projectId: project.id,
            type: JobType.TRANSCRIPTION,
            audioStorageKey: videoAsset.storageKey,
            language,
            whisperModel,
          }),
        },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: ProjectStatus.TRANSCRIBING },
      });

      return createdJob;
    });

    outboxDispatcher.processPendingEvents().catch((err) => {
      console.error('[Projects:Transcribe] Outbox dispatch error:', err);
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        projectId: project.id,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
      },
      message: 'Transcription job enqueued successfully.',
    });
  } catch (err) {
    next(err);
  }
});

const SaveVersionSchema = z.object({
  captionPayload: z.any(),
  changelog: z.string().optional(),
  expectedVersionNumber: z.number().optional(),
});

/**
 * POST /api/v1/projects/:id/versions
 * Creates a new version (autosave / user edit) with optimistic concurrency conflict detection.
 */
projectsRouter.post('/:id/versions', requireProjectAccess(WorkspaceRole.EDITOR), async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { captionPayload, changelog, expectedVersionNumber } = SaveVersionSchema.parse(req.body);

    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });

    const currentVersionNumber = latestVersion?.versionNumber || 0;

    // Optimistic concurrency conflict check
    if (expectedVersionNumber !== undefined && currentVersionNumber > expectedVersionNumber) {
      return res.status(409).json({
        error: {
          code: 'VERSION_CONFLICT',
          message: `Conflict: Your edit was based on version ${expectedVersionNumber}, but current version is ${currentVersionNumber}.`,
          currentVersion: {
            id: latestVersion!.id,
            versionNumber: currentVersionNumber,
            updatedAt: latestVersion!.createdAt.toISOString(),
          },
        },
      });
    }

    const nextVersionNum = currentVersionNumber + 1;

    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber: nextVersionNum,
        captionPayload: typeof captionPayload === 'string' ? captionPayload : JSON.stringify(captionPayload),
        changelog: changelog || `User edit (Version ${nextVersionNum})`,
      },
    });

    res.json({
      success: true,
      data: {
        id: version.id,
        versionNumber: version.versionNumber,
        createdAt: version.createdAt.toISOString(),
      },
      message: `Project version ${version.versionNumber} saved successfully.`,
    });
  } catch (err) {
    next(err);
  }
});

