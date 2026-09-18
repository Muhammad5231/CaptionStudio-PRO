import { Request, Response, NextFunction } from 'express';
import { WorkspaceRole } from '@captionstudio/database';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.EDITOR]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

export function requireWorkspace(minimumRole: WorkspaceRole = WorkspaceRole.VIEWER) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required.',
        },
      });
    }

    const requestedWorkspaceId =
      (req.headers['x-workspace-id'] as string) ||
      (req.query.workspaceId as string) ||
      req.body?.workspaceId ||
      req.user.workspaceMembers[0]?.workspaceId;

    if (!requestedWorkspaceId) {
      return res.status(400).json({
        error: {
          code: 'WORKSPACE_REQUIRED',
          message: 'A workspace ID must be specified or associated with your account.',
        },
      });
    }

    const membership = req.user.workspaceMembers.find(
      (m) => m.workspaceId === requestedWorkspaceId
    );

    if (!membership) {
      return res.status(403).json({
        error: {
          code: 'WORKSPACE_ACCESS_DENIED',
          message: 'You do not have access to the requested workspace.',
        },
      });
    }

    const userLevel = ROLE_HIERARCHY[membership.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 1;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `This action requires ${minimumRole} workspace permission.`,
        },
      });
    }

    req.workspace = membership.workspace;
    req.membership = membership;
    next();
  };
}

