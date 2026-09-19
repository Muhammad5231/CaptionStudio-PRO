import { Router, Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  prisma,
  AssetType,
  JobType,
  JobStatus,
  ProjectStatus,
  WorkspaceRole,
  UploadIntentStatus,
} from '@captionstudio/database';
import { createStorageProvider, StoragePaths } from '@captionstudio/storage';
import { usageService } from '@captionstudio/billing';
import { OutboxDispatcher } from '@captionstudio/queue';
import { parseSRT, parseVTT, parseASS } from '@captionstudio/captions';
import {
  FFmpegService,
  MediaProbeService,
  validateContainerSignature,
  validateProbedMedia,
} from '@captionstudio/media';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadRateLimiter } from '../middlewares/ratelimit.middleware';
import { recordAuditLog } from '../services/audit.service';

export const uploadsRouter = Router();

const storageProvider = createStorageProvider();
const ffmpegService = new FFmpegService();
const probeService = new MediaProbeService(ffmpegService);
const outboxDispatcher = new OutboxDispatcher(prisma as any);

const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '500', 10);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv'];
const ALLOWED_SUBTITLE_EXTENSIONS = ['.srt', '.vtt', '.ass', '.ssa', '.txt', '.json'];

const CreateUploadIntentSchema = z.object({
  projectId: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().positive(),
  mimeType: z.string(),
  assetType: z.enum(['VIDEO', 'SUBTITLE']).optional(),
});

const CompleteUploadSchema = z.object({
  uploadIntentId: z.string().optional(),
  // Backward compatibility fields if older client hasn't updated yet
  projectId: z.string().optional(),
  storageKey: z.string().optional(),
  fileName: z.string().optional(),
  fileSizeBytes: z.number().positive().optional(),
  mimeType: z.string().optional(),
  assetType: z.enum(['VIDEO', 'SUBTITLE']).optional(),
});

/**
 * Common handler for creating server-managed UploadIntent
 */
async function handleCreateUploadIntent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = CreateUploadIntentSchema.parse(req.body);

    // 1. Verify project exists
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

    // 2. Verify workspace permissions
    const membership = req.user!.workspaceMembers.find(
      (m) => m.workspaceId === project.workspaceId
    );

    if (
      !membership ||
      (membership.role !== WorkspaceRole.OWNER &&
        membership.role !== WorkspaceRole.ADMIN &&
        membership.role !== WorkspaceRole.EDITOR)
    ) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to upload files to this project.',
        },
      });
    }

    // 3. Validate requested file size limit
    if (data.fileSizeBytes > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `File size exceeds the maximum allowed limit of ${MAX_UPLOAD_SIZE_MB}MB.`,
        },
      });
    }

    // 4. Determine and validate asset type
    const ext = path.extname(data.fileName).toLowerCase();
    let assetType: AssetType;

    if (
      data.assetType === 'VIDEO' ||
      ALLOWED_VIDEO_EXTENSIONS.includes(ext) ||
      data.mimeType.startsWith('video/')
    ) {
      assetType = AssetType.VIDEO;
    } else if (
      data.assetType === 'SUBTITLE' ||
      ALLOWED_SUBTITLE_EXTENSIONS.includes(ext) ||
      data.mimeType.includes('subrip') ||
      data.mimeType.includes('vtt')
    ) {
      assetType = AssetType.SUBTITLE;
    } else {
      return res.status(422).json({
        error: {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: `Unsupported file type: "${ext}". Allowed video formats: MP4, MOV, WEBM, MKV. Allowed subtitles: SRT, VTT, ASS.`,
        },
      });
    }

    // 5. Server generates secure random fileId and storageKey (Client cannot choose arbitrary path)
    const fileId = `${Date.now()}-${crypto.randomUUID()}`;
    const cleanExt = ext.replace(/^\./, '') || (assetType === AssetType.VIDEO ? 'mp4' : 'srt');

    const storageKey =
      assetType === AssetType.VIDEO
        ? StoragePaths.projectVideoAsset(project.workspaceId, project.id, fileId, cleanExt)
        : StoragePaths.projectSubtitleAsset(project.workspaceId, project.id, fileId, cleanExt);

    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour TTL

    // 6. Create UploadIntent database record
    const intent = await prisma.uploadIntent.create({
      data: {
        userId: req.user!.id,
        workspaceId: project.workspaceId,
        projectId: project.id,
        storageKey,
        expectedFileSizeBytes: BigInt(data.fileSizeBytes),
        expectedMimeType: data.mimeType,
        assetType,
        status: UploadIntentStatus.PENDING,
        expiresAt,
      },
    });

    // 7. Generate Upload URL
    let uploadUrl: string;
    const isLocalDriver = !process.env.STORAGE_DRIVER || process.env.STORAGE_DRIVER === 'local';

    if (isLocalDriver) {
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
        uploadIntentId: intent.id,
        uploadUrl,
        storageKey,
        assetType: intent.assetType,
        maxSizeBytes: MAX_UPLOAD_BYTES,
        expiresAt: intent.expiresAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/uploads/intent
 * Preferred server-created Upload Intent endpoint
 */
uploadsRouter.post('/intent', authenticate, uploadRateLimiter, handleCreateUploadIntent);

/**
 * POST /api/v1/uploads/authorize
 * Backward-compatible alias for creating upload intent
 */
uploadsRouter.post('/authorize', authenticate, uploadRateLimiter, handleCreateUploadIntent);

/**
 * PUT /api/v1/uploads/storage/:key
 * Local streaming upload receiver (authenticated & workspace isolated)
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

    // Tenancy verification and Intent binding
    const intent = await prisma.uploadIntent.findUnique({
      where: { storageKey: key },
    });

    if (!intent) {
      return res.status(404).json({
        error: {
          code: 'UPLOAD_INTENT_NOT_FOUND',
          message: 'Upload intent required for this storage destination. Request an intent before uploading.',
        },
      });
    }

    if (intent.expiresAt < new Date()) {
      return res.status(410).json({
        error: {
          code: 'UPLOAD_INTENT_EXPIRED',
          message: 'Upload intent has expired. Please initiate a new upload.',
        },
      });
    }

    if (intent.status === UploadIntentStatus.COMPLETED) {
      return res.status(409).json({
        error: {
          code: 'INTENT_ALREADY_COMPLETED',
          message: 'This upload intent has already been finalized.',
        },
      });
    }

    const isOwner = intent.userId === req.user!.id;
    const isMember = req.user!.workspaceMembers.some((m) => m.workspaceId === intent.workspaceId);
    if (!isOwner && !isMember && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to upload files to this workspace.',
        },
      });
    }

    // Check Content-Length header against max upload size
    const contentLength = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : 0;
    if (contentLength > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Upload exceeds maximum allowed limit of ${MAX_UPLOAD_SIZE_MB}MB.`,
        },
      });
    }

    await prisma.uploadIntent.update({
      where: { id: intent.id },
      data: { status: UploadIntentStatus.UPLOADING },
    });

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

    // Verify user authorization
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
      const rangeParts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(rangeParts[0], 10);
      const end = rangeParts[1] ? parseInt(rangeParts[1], 10) : fileSize - 1;
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
 * Derives trusted values from server-side UploadIntent, validates storage object & media container,
 * and enqueues processing via transactional outbox.
 */
uploadsRouter.post('/complete', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CompleteUploadSchema.parse(req.body);

    // 1. Resolve UploadIntent
    let intent;
    if (data.uploadIntentId) {
      intent = await prisma.uploadIntent.findUnique({
        where: { id: data.uploadIntentId },
        include: { project: true },
      });
    } else if (data.storageKey) {
      intent = await prisma.uploadIntent.findUnique({
        where: { storageKey: data.storageKey },
        include: { project: true },
      });
    }

    if (!intent) {
      return res.status(404).json({
        error: {
          code: 'UPLOAD_INTENT_NOT_FOUND',
          message: 'No valid upload intent found for this upload. Upload authorization required before completing.',
        },
      });
    }

    // 2. Validate Ownership & Tenancy
    const isOwner = intent.userId === req.user!.id;
    const isWorkspaceMember = req.user!.workspaceMembers.some(
      (m) =>
        m.workspaceId === intent.workspaceId &&
        (m.role === WorkspaceRole.OWNER || m.role === WorkspaceRole.ADMIN || m.role === WorkspaceRole.EDITOR)
    );

    if (!isOwner && !isWorkspaceMember && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to finalize uploads for this project.',
        },
      });
    }

    // 3. Validate Status and Expiration
    if (intent.status === UploadIntentStatus.COMPLETED) {
      return res.status(409).json({
        error: {
          code: 'INTENT_ALREADY_COMPLETED',
          message: 'This upload intent has already been completed.',
        },
      });
    }

    if (intent.status === UploadIntentStatus.CANCELLED) {
      return res.status(400).json({
        error: {
          code: 'INTENT_CANCELLED',
          message: 'This upload intent was cancelled.',
        },
      });
    }

    if (intent.expiresAt < new Date()) {
      await prisma.uploadIntent.update({
        where: { id: intent.id },
        data: { status: UploadIntentStatus.EXPIRED },
      });
      return res.status(410).json({
        error: {
          code: 'UPLOAD_INTENT_EXPIRED',
          message: 'The upload window for this file has expired. Please request a new upload intent.',
        },
      });
    }

    // 4. Verify file presence and actual size in storage (Never trust client file size)
    const exists = await storageProvider.exists(intent.storageKey);
    if (!exists) {
      return res.status(400).json({
        error: {
          code: 'FILE_NOT_FOUND_IN_STORAGE',
          message: 'Uploaded file could not be found in storage. Please upload the file before completing.',
        },
      });
    }

    let actualSizeBytes = 0;
    let localFilePath: string | null = null;
    let tempFileCreated = false;

    if (typeof storageProvider.getLocalFilePath === 'function') {
      localFilePath = storageProvider.getLocalFilePath(intent.storageKey);
      const stat = await fs.promises.stat(localFilePath);
      actualSizeBytes = stat.size;
    } else {
      const tempResult = await storageProvider.downloadToTempFile(intent.storageKey);
      localFilePath = tempResult.filePath;
      tempFileCreated = true;
      const stat = await fs.promises.stat(localFilePath);
      actualSizeBytes = stat.size;
    }

    try {
      if (actualSizeBytes <= 0) {
        return res.status(422).json({
          error: {
            code: 'EMPTY_FILE',
            message: 'Uploaded file is 0 bytes.',
          },
        });
      }

      if (actualSizeBytes > MAX_UPLOAD_BYTES) {
        return res.status(413).json({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Actual file size (${Math.round(actualSizeBytes / (1024 * 1024))}MB) exceeds maximum limit of ${MAX_UPLOAD_SIZE_MB}MB.`,
          },
        });
      }

      const fileUrl = storageProvider.getUrl(intent.storageKey);

      // 5. Handle VIDEO vs SUBTITLE
      if (intent.assetType === AssetType.VIDEO) {
        // Read only the initial 8KB for container signature validation (zero RAM bloat)
        const fd = await fs.promises.open(localFilePath, 'r');
        const headerBuffer = Buffer.alloc(Math.min(8192, actualSizeBytes));
        await fd.read(headerBuffer, 0, headerBuffer.length, 0);
        await fd.close();

        const signatureResult = validateContainerSignature(headerBuffer);
        if (!signatureResult.valid) {
          return res.status(422).json({
            error: {
              code: 'INVALID_CONTAINER_SIGNATURE',
              message: signatureResult.error || 'Invalid or unrecognized video container signature.',
            },
          });
        }

        // Direct probe on file path without duplicating buffer or writing new temp files
        const rawProbe = await ffmpegService.probe(localFilePath);
        const probeCheck = validateProbedMedia(rawProbe);

        if (!probeCheck.valid) {
          return res.status(422).json({
            error: {
              code: 'MALFORMED_MEDIA',
              message: probeCheck.error || 'Video file failed stream validation.',
            },
          });
        }

        const probedMeta = {
          width: probeCheck.width,
          height: probeCheck.height,
          durationSeconds: probeCheck.durationSeconds,
          fps: probeCheck.fps,
        };

      // Execute atomic transaction: ProjectAsset, ExportJob, OutboxEvent, UploadIntent COMPLETED
      const result = await prisma.$transaction(async (tx) => {
        // Mark intent completed
        await tx.uploadIntent.update({
          where: { id: intent.id },
          data: {
            status: UploadIntentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        // Create ProjectAsset with trusted dimensions & duration
        const asset = await tx.projectAsset.create({
          data: {
            projectId: intent.projectId,
            type: AssetType.VIDEO,
            storageKey: intent.storageKey,
            url: fileUrl,
            mimeType: intent.expectedMimeType || 'video/mp4',
            sizeBytes: BigInt(actualSizeBytes),
            width: probedMeta.width,
            height: probedMeta.height,
            durationSeconds: probedMeta.durationSeconds,
            fps: probedMeta.fps,
          },
        });

        // Update Project specifications
        await tx.project.update({
          where: { id: intent.projectId },
          data: {
            width: probedMeta.width,
            height: probedMeta.height,
            durationSeconds: probedMeta.durationSeconds,
            fps: probedMeta.fps,
            status: ProjectStatus.PROCESSING,
          },
        });

        // Record storage usage with idempotent eventKey
        await tx.usageLedger.create({
          data: {
            userId: req.user!.id,
            workspaceId: intent.workspaceId,
            type: 'STORAGE_BYTES',
            amount: actualSizeBytes,
            projectId: intent.projectId,
            eventKey: `STORAGE_ASSET:${asset.id}`,
          },
        });

        // Create MEDIA_ANALYSIS job
        const job = await tx.exportJob.create({
          data: {
            projectId: intent.projectId,
            type: JobType.MEDIA_ANALYSIS,
            status: JobStatus.PENDING,
            progress: 0,
            stage: 'Enqueued for media analysis',
            metadata: {
              assetId: asset.id,
              storageKey: intent.storageKey,
              originalFileName: data.fileName || path.basename(intent.storageKey),
            },
          },
        });

        // Create Transactional Outbox Event
        const outboxEvent = await tx.outboxEvent.create({
          data: {
            type: 'MEDIA_ANALYSIS',
            aggregateId: job.id,
            payload: {
              jobId: job.id,
              userId: req.user!.id,
              workspaceId: intent.workspaceId,
              projectId: intent.projectId,
              assetId: asset.id,
              storageKey: intent.storageKey,
              originalFileName: data.fileName || path.basename(intent.storageKey),
              type: JobType.MEDIA_ANALYSIS,
            },
          },
        });

        return { asset, job, outboxEvent };
      });

      // Dispatch Outbox asynchronously (non-blocking)
      outboxDispatcher.processPendingEvents().catch((err) => {
        console.error('[Uploads:Outbox] Async dispatch error:', err);
      });

      await recordAuditLog({
        userId: req.user!.id,
        action: 'UPLOAD_COMPLETE',
        resource: `ProjectAsset:${result.asset.id}`,
        details: { storageKey: intent.storageKey, sizeBytes: actualSizeBytes, type: intent.assetType },
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        data: {
          asset: {
            id: result.asset.id,
            type: result.asset.type,
            url: result.asset.url,
            sizeBytes: Number(result.asset.sizeBytes),
            width: result.asset.width,
            height: result.asset.height,
            durationSeconds: result.asset.durationSeconds,
            fps: result.asset.fps,
            createdAt: result.asset.createdAt.toISOString(),
          },
          job: {
            id: result.job.id,
            type: result.job.type,
            status: result.job.status,
            progress: result.job.progress,
            stage: result.job.stage,
          },
        },
        message: 'Video upload verified and queued for processing.',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Subtitle Processing
      if (actualSizeBytes > 5 * 1024 * 1024) {
        return res.status(413).json({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Subtitle file exceeds maximum allowed limit of 5MB.',
          },
        });
      }

      const textContent = await fs.promises.readFile(localFilePath, 'utf-8');
      const ext = path.extname(intent.storageKey).toLowerCase();
      let track;

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
            message: 'The uploaded file does not contain valid subtitle cues.',
          },
        });
      }

      if (track.length > 10000) {
        return res.status(422).json({
          error: {
            code: 'SUBTITLE_CUE_LIMIT_EXCEEDED',
            message: `Subtitle file contains ${track.length} cues, exceeding the maximum permitted limit of 10,000 cues.`,
          },
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.uploadIntent.update({
          where: { id: intent.id },
          data: {
            status: UploadIntentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        const asset = await tx.projectAsset.create({
          data: {
            projectId: intent.projectId,
            type: AssetType.SUBTITLE,
            storageKey: intent.storageKey,
            url: fileUrl,
            mimeType: intent.expectedMimeType || 'text/plain',
            sizeBytes: BigInt(actualSizeBytes),
          },
        });

        // Record storage usage for subtitle
        await tx.usageLedger.create({
          data: {
            userId: req.user!.id,
            workspaceId: intent.workspaceId,
            type: 'STORAGE_BYTES',
            amount: actualSizeBytes,
            projectId: intent.projectId,
            eventKey: `STORAGE_ASSET:${asset.id}`,
          },
        });

        const latestVersion = await tx.projectVersion.findFirst({
          where: { projectId: intent.projectId },
          orderBy: { versionNumber: 'desc' },
        });

        const nextVersionNum = (latestVersion?.versionNumber || 0) + 1;

        const version = await tx.projectVersion.create({
          data: {
            projectId: intent.projectId,
            versionNumber: nextVersionNum,
            captionPayload: track as unknown as object,
            changelog: `Imported subtitle file: ${data.fileName || path.basename(intent.storageKey)}`,
          },
        });

        const updatedProject = await tx.project.update({
          where: { id: intent.projectId },
          data: { status: ProjectStatus.READY },
        });

        return { asset, version, updatedProject };
      });

      return res.json({
        success: true,
        data: {
          asset: {
            id: result.asset.id,
            type: result.asset.type,
            url: result.asset.url,
            sizeBytes: Number(result.asset.sizeBytes),
            createdAt: result.asset.createdAt.toISOString(),
          },
          version: {
            id: result.version.id,
            versionNumber: result.version.versionNumber,
            captionsCount: track.length,
          },
          project: {
            id: result.updatedProject.id,
            status: result.updatedProject.status,
          },
        },
        message: `Subtitle file successfully parsed (${track.length} captions) and project is READY.`,
        timestamp: new Date().toISOString(),
      });
    }
  } finally {
    if (tempFileCreated && localFilePath && fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath).catch(() => {});
    }
  }
} catch (err) {
  next(err);
}
});
