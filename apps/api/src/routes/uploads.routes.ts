import { Router, Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { prisma, AssetType, JobType, JobStatus, ProjectStatus, WorkspaceRole } from '@captionstudio/database';
import { createStorageProvider, StoragePaths } from '@captionstudio/storage';
import { addMediaAnalysisJob } from '@captionstudio/queue';
import { parseSRT, parseVTT, parseASS } from '@captionstudio/captions';
import { authenticate } from '../middlewares/auth.middleware';
import { requireProjectAccess } from '../middlewares/project.middleware';
import { uploadRateLimiter } from '../middlewares/ratelimit.middleware';
import { recordAuditLog } from '../services/audit.service';

export const uploadsRouter = Router();

const storageProvider = createStorageProvider();

const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '500', 10);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv'];
const ALLOWED_SUBTITLE_EXTENSIONS = ['.srt', '.vtt', '.ass', '.ssa', '.txt', '.json'];

const AuthorizeUploadSchema = z.object({
  projectId: z.string(),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().positive(),
  mimeType: z.string(),
});

const CompleteUploadSchema = z.object({
  projectId: z.string(),
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().positive(),
  mimeType: z.string(),
  assetType: z.enum(['VIDEO', 'SUBTITLE']),
});

/**
 * POST /api/v1/uploads/authorize
 * Authorizes a direct upload and issues a signed upload URL with path isolation.
 */
uploadsRouter.post(
  '/authorize',
  authenticate,
  uploadRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = AuthorizeUploadSchema.parse(req.body);

      // Verify project access
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found.',
          },
        });
      }

      const membership = req.user!.workspaceMembers.find(
        (m) => m.workspaceId === project.workspaceId
      );

      if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.EDITOR)) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to upload files to this project.',
          },
        });
      }

      // Check file size
      if (data.fileSizeBytes > MAX_UPLOAD_BYTES) {
        return res.status(413).json({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `File size exceeds the maximum allowed limit of ${MAX_UPLOAD_SIZE_MB}MB.`,
          },
        });
      }

      const ext = path.extname(data.fileName).toLowerCase();
      let assetType: AssetType;

      if (ALLOWED_VIDEO_EXTENSIONS.includes(ext) || data.mimeType.startsWith('video/')) {
        assetType = AssetType.VIDEO;
      } else if (ALLOWED_SUBTITLE_EXTENSIONS.includes(ext) || data.mimeType.includes('subrip') || data.mimeType.includes('vtt')) {
        assetType = AssetType.SUBTITLE;
      } else {
        return res.status(422).json({
          error: {
            code: 'UNSUPPORTED_FILE_TYPE',
            message: `Unsupported file type: ${ext}. Supported video formats: MP4, MOV, WEBM, MKV. Supported subtitles: SRT, VTT, ASS.`,
          },
        });
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const cleanExt = ext.replace(/^\./, '') || (assetType === AssetType.VIDEO ? 'mp4' : 'srt');

      const storageKey =
        assetType === AssetType.VIDEO
          ? StoragePaths.projectVideoAsset(project.workspaceId, project.id, fileId, cleanExt)
          : StoragePaths.projectSubtitleAsset(project.workspaceId, project.id, fileId, cleanExt);

      let uploadUrl: string;
      const isLocalDriver = !process.env.STORAGE_DRIVER || process.env.STORAGE_DRIVER === 'local';

      if (isLocalDriver) {
        // In local development, the client PUTs to our local upload route
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        uploadUrl = `${protocol}://${host}/api/v1/uploads/storage/${encodeURIComponent(storageKey)}`;
      } else {
        uploadUrl = await storageProvider.getSignedUploadUrl(storageKey, {
          contentType: data.mimeType,
          expiresInSeconds: 3600,
        });
      }

      res.json({
        success: true,
        data: {
          uploadUrl,
          storageKey,
          assetType,
          maxSizeBytes: MAX_UPLOAD_BYTES,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/v1/uploads/storage/:key
 * Local development streaming upload receiver (authenticated & workspace isolated)
 */
uploadsRouter.put('/storage/:key(*)', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.params.key;
    if (!rawKey) {
      return res.status(400).json({ error: { code: 'KEY_REQUIRED', message: 'Storage key required.' } });
    }

    const key = decodeURIComponent(rawKey);
    const localUploadsPath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
    const safeFilePath = path.resolve(localUploadsPath, key);

    // Strictly prevent directory path traversal
    if (!safeFilePath.startsWith(localUploadsPath) || key.includes('..')) {
      return res.status(403).json({ error: { code: 'INVALID_PATH', message: 'Illegal path traversal attempt.' } });
    }

    // Workspace tenancy verification from key path ("workspaces/{workspaceId}/projects/{projectId}/...")
    const parts = key.split('/');
    if (parts[0] === 'workspaces' && parts[1]) {
      const workspaceId = parts[1];
      const isMember = req.user!.workspaceMembers.some((m) => m.workspaceId === workspaceId);
      if (!isMember && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to upload files to this workspace.',
          },
        });
      }
    }

    await storageProvider.upload(key, req, {
      contentType: req.headers['content-type'] || 'application/octet-stream',
    });

    res.json({ success: true, key });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/uploads/storage/:key
 * Serves private local storage files with authentication, workspace authorization, and HTTP 206 Range requests
 */
uploadsRouter.get('/storage/:key(*)', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.params.key;
    const key = decodeURIComponent(rawKey);

    const localUploadsPath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
    const safeFilePath = path.resolve(localUploadsPath, key);

    // Strictly prevent directory path traversal
    if (!safeFilePath.startsWith(localUploadsPath) || key.includes('..')) {
      return res.status(403).json({ error: { code: 'INVALID_PATH', message: 'Illegal path traversal attempt.' } });
    }

    if (!fs.existsSync(safeFilePath)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found in storage.' } });
    }

    // Verify user authorization for this asset
    const asset = await prisma.projectAsset.findFirst({
      where: { storageKey: key },
      include: {
        project: {
          select: { workspaceId: true },
        },
      },
    });

    if (asset) {
      const isMember = req.user!.workspaceMembers.some(
        (m) => m.workspaceId === asset.project.workspaceId
      );
      if (!isMember && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this media asset.',
          },
        });
      }
    } else {
      // If not yet committed to ProjectAsset, verify workspace path tenancy
      const parts = key.split('/');
      if (parts[0] === 'workspaces' && parts[1]) {
        const workspaceId = parts[1];
        const isMember = req.user!.workspaceMembers.some((m) => m.workspaceId === workspaceId);
        if (!isMember && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have access to files in this workspace.',
            },
          });
        }
      }
    }

    const stat = fs.statSync(safeFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const contentType = key.endsWith('.mp4')
      ? 'video/mp4'
      : key.endsWith('.webm')
      ? 'video/webm'
      : key.endsWith('.mov')
      ? 'video/quicktime'
      : 'application/octet-stream';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(safeFilePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      });
      fs.createReadStream(safeFilePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/uploads/complete
 * Verifies upload, registers ProjectAsset, and triggers media analysis or subtitle processing.
 */
uploadsRouter.post(
  '/complete',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = CompleteUploadSchema.parse(req.body);

      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found.',
          },
        });
      }

      const membership = req.user!.workspaceMembers.find(
        (m) => m.workspaceId === project.workspaceId
      );

      if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN && membership.role !== WorkspaceRole.EDITOR)) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to modify this project.',
          },
        });
      }

      // Verify file presence in storage
      const exists = await storageProvider.exists(data.storageKey);
      if (!exists) {
        return res.status(400).json({
          error: {
            code: 'FILE_NOT_FOUND_IN_STORAGE',
            message: 'Uploaded file could not be verified in object storage. Please retry upload.',
          },
        });
      }

      const fileUrl = storageProvider.getUrl(data.storageKey);

      // Idempotency: Check if asset already registered for this storageKey
      let asset = await prisma.projectAsset.findFirst({
        where: { storageKey: data.storageKey },
      });

      if (!asset) {
        asset = await prisma.projectAsset.create({
          data: {
            projectId: project.id,
            type: data.assetType as AssetType,
            storageKey: data.storageKey,
            url: fileUrl,
            mimeType: data.mimeType,
            sizeBytes: BigInt(data.fileSizeBytes),
          },
        });

        // Record storage usage in ledger
        await prisma.usageLedger.create({
          data: {
            userId: req.user!.id,
            workspaceId: project.workspaceId,
            type: 'STORAGE_BYTES',
            amount: data.fileSizeBytes,
            projectId: project.id,
          },
        });
      }

      await recordAuditLog({
        userId: req.user!.id,
        action: 'UPLOAD_COMPLETE',
        resource: `ProjectAsset:${asset.id}`,
        details: { fileName: data.fileName, sizeBytes: data.fileSizeBytes, type: data.assetType },
        ipAddress: req.ip,
      });

      // Handle VIDEO vs SUBTITLE
      if (data.assetType === 'VIDEO') {
        // Create MEDIA_ANALYSIS job in database
        const job = await prisma.exportJob.create({
          data: {
            projectId: project.id,
            type: JobType.MEDIA_ANALYSIS,
            status: JobStatus.PENDING,
            progress: 0,
            stage: 'Enqueued for analysis',
            metadata: {
              assetId: asset.id,
              storageKey: data.storageKey,
              originalFileName: data.fileName,
            },
          },
        });

        // Dispatch to BullMQ queue with reliable failure handling
        try {
          await addMediaAnalysisJob({
            jobId: job.id,
            userId: req.user!.id,
            workspaceId: project.workspaceId,
            projectId: project.id,
            assetId: asset.id,
            storageKey: data.storageKey,
            originalFileName: data.fileName,
            type: JobType.MEDIA_ANALYSIS,
          });

          await prisma.project.update({
            where: { id: project.id },
            data: { status: ProjectStatus.PROCESSING },
          });
        } catch (queueErr: unknown) {
          const errMsg = queueErr instanceof Error ? queueErr.message : 'Queue dispatch failed';
          console.error('[Uploads:Complete] Queue dispatch failed:', errMsg);

          await prisma.exportJob.update({
            where: { id: job.id },
            data: {
              status: JobStatus.FAILED,
              errorMessage: 'Failed to dispatch media analysis job. Redis queue broker may be offline.',
              metadata: {
                errorCode: 'QUEUE_DISPATCH_FAILED',
                dispatchError: errMsg,
                failedAt: new Date().toISOString(),
              },
            },
          });

          return res.status(503).json({
            error: {
              code: 'QUEUE_DISPATCH_FAILED',
              message: 'Failed to enqueue media analysis. Please retry the operation in a moment.',
            },
          });
        }

        return res.json({
          success: true,
          data: {
            asset: {
              id: asset.id,
              type: asset.type,
              url: asset.url,
              sizeBytes: Number(asset.sizeBytes),
              createdAt: asset.createdAt.toISOString(),
            },
            job: {
              id: job.id,
              type: job.type,
              status: job.status,
              progress: job.progress,
              stage: job.stage,
            },
          },
          message: 'Video upload completed and enqueued for media analysis.',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Enforce maximum subtitle file size (5MB)
        if (data.fileSizeBytes > 5 * 1024 * 1024) {
          return res.status(413).json({
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: 'Subtitle file exceeds maximum allowed limit of 5MB.',
            },
          });
        }

        // Parse SUBTITLE file and normalize
        const buffer = await storageProvider.download(data.storageKey);
        const textContent = buffer.toString('utf-8');

        let track;
        const ext = path.extname(data.fileName).toLowerCase();

        try {
          if (ext === '.vtt') {
            track = parseVTT(textContent);
          } else if (ext === '.ass' || ext === '.ssa') {
            track = parseASS(textContent);
          } else {
            track = parseSRT(textContent);
          }
        } catch (parseErr: unknown) {
          const msg = parseErr instanceof Error ? parseErr.message : 'Malformed subtitle file';
          return res.status(422).json({
            error: {
              code: 'INVALID_SUBTITLE_FORMAT',
              message: `Failed to parse subtitle file: ${msg}`,
            },
          });
        }

        if (!track || track.length === 0) {
          return res.status(422).json({
            error: {
              code: 'INVALID_SUBTITLE_FORMAT',
              message: 'The uploaded file does not contain valid subtitle cues. Supported formats: SRT, VTT, ASS.',
            },
          });
        }

        const latestVersion = await prisma.projectVersion.findFirst({
          where: { projectId: project.id },
          orderBy: { versionNumber: 'desc' },
        });

        const nextVersionNum = (latestVersion?.versionNumber || 0) + 1;

        const version = await prisma.projectVersion.create({
          data: {
            projectId: project.id,
            versionNumber: nextVersionNum,
            captionPayload: track as unknown as object,
            changelog: `Imported subtitle file: ${data.fileName}`,
          },
        });

        const updatedProject = await prisma.project.update({
          where: { id: project.id },
          data: { status: ProjectStatus.READY },
        });

        return res.json({
          success: true,
          data: {
            asset: {
              id: asset.id,
              type: asset.type,
              url: asset.url,
              sizeBytes: Number(asset.sizeBytes),
              createdAt: asset.createdAt.toISOString(),
            },
            version: {
              id: version.id,
              versionNumber: version.versionNumber,
              captionsCount: track.length,
            },
            project: {
              id: updatedProject.id,
              status: updatedProject.status,
            },
          },
          message: `Subtitle file successfully parsed (${track.length} captions) and project is READY.`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      next(err);
    }
  }
);
