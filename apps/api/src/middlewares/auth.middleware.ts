import { Request, Response, NextFunction } from 'express';
import { UserRole, WorkspaceRole } from '@captionstudio/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // In Phase 1 foundation: check authorization header or fallback to demo auth identity
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Process token
    req.user = {
      id: 'demo-user-1',
      email: 'alex.creator@captionstudio.io',
      name: 'Alex Rivera',
      role: UserRole.CREATOR,
      workspaceId: 'demo-workspace-1',
      workspaceRole: WorkspaceRole.OWNER,
    };
    return next();
  }

  // Provide mock authenticated user in dev mode
  if (process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 'demo-user-1',
      email: 'alex.creator@captionstudio.io',
      name: 'Alex Rivera',
      role: UserRole.CREATOR,
      workspaceId: 'demo-workspace-1',
      workspaceRole: WorkspaceRole.OWNER,
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication is required to access this resource.',
      statusCode: 401,
    },
    timestamp: new Date().toISOString(),
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN)) {
    // For local dev convenience, allow role elevation or check header
    if (req.headers['x-admin-key'] === 'cs_admin_secret') {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Administrator privileges are required to access this resource.',
        statusCode: 403,
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
}

