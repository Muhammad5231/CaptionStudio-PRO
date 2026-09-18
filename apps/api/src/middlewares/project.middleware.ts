import { Request, Response, NextFunction } from 'express';
import { prisma, WorkspaceRole, Project } from '@captionstudio/database';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.EDITOR]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

declare global {
  namespace Express {
    interface Request {
      project?: Project;
    }
  }
}

export function requireProjectAccess(minimumRole: WorkspaceRole = WorkspaceRole.VIEWER) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.',
          },
        });
      }

      const projectId = req.params.id || req.params.projectId;
      if (!projectId) {
        return res.status(400).json({
          error: {
            code: 'PROJECT_ID_REQUIRED',
            message: 'Project ID is required.',
          },
        });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          workspace: true,
        },
      });

      if (!project) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'The requested project could not be found.',
          },
        });
      }

      // Check workspace membership
      const membership = req.user.workspaceMembers.find(
        (m) => m.workspaceId === project.workspaceId
      );

      if (!membership) {
        return res.status(403).json({
          error: {
            code: 'PROJECT_ACCESS_DENIED',
            message: 'You do not have permission to access this project.',
          },
        });
      }

      const userLevel = ROLE_HIERARCHY[membership.role] || 0;
      const requiredLevel = ROLE_HIERARCHY[minimumRole] || 1;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `This action requires ${minimumRole} permissions on this project.`,
          },
        });
      }

      req.project = project;
      req.workspace = project.workspace;
      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

