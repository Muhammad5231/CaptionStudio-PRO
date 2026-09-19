import { Router, Request, Response } from 'express';
import { usageService } from '@captionstudio/billing/server';
import { authenticate } from '../middlewares/auth.middleware';

export const usageRouter = Router();

/**
 * GET /api/v1/usage
 * Retrieves accurate quota and current cycle usage for the active workspace.
 */
usageRouter.get('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const activeWorkspace = req.user!.workspaceMembers[0];
    const workspaceId = (req.query.workspaceId as string) || activeWorkspace?.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: {
          code: 'WORKSPACE_REQUIRED',
          message: 'No active workspace found for user.',
        },
      });
    }

    const { quota, tier, periodStart, periodEnd, subscriptionId } = await usageService.getWorkspaceQuota(
      workspaceId,
      req.user!.id
    );

    res.json({
      success: true,
      data: {
        ...quota,
        tier,
        subscriptionId: subscriptionId || null,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/usage/ledger
 * Retrieves paginated audit log of usage events (transcription minutes, exports, storage, renders).
 */
usageRouter.get('/ledger', authenticate, async (req: Request, res: Response, next) => {
  try {
    const activeWorkspace = req.user!.workspaceMembers[0];
    const workspaceId = (req.query.workspaceId as string) || activeWorkspace?.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: {
          code: 'WORKSPACE_REQUIRED',
          message: 'No active workspace found for user.',
        },
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const type = req.query.type as any;

    const result = await usageService.getWorkspaceLedger({
      workspaceId,
      limit,
      offset,
      type,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
