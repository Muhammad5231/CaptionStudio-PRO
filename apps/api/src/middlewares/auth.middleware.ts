import { Request, Response, NextFunction } from 'express';
import { prisma, UserRole } from '@captionstudio/database';
import { AUTH_COOKIE_NAME } from '@captionstudio/auth';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies?.[AUTH_COOKIE_NAME] || 
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (!sessionToken) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required. Please sign in.',
        },
      });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            workspaceMembers: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      res.clearCookie(AUTH_COOKIE_NAME);
      return res.status(401).json({
        error: {
          code: 'INVALID_SESSION',
          message: 'Session has expired or is invalid. Please sign in again.',
        },
      });
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      res.clearCookie(AUTH_COOKIE_NAME);
      return res.status(401).json({
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      });
    }

    if (session.user.status === 'SUSPENDED') {
      res.clearCookie(AUTH_COOKIE_NAME);
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'This account has been suspended by an administrator.',
        },
      });
    }

    req.session = session;
    req.user = session.user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies?.[AUTH_COOKIE_NAME] || 
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              workspaceMembers: {
                include: {
                  workspace: true,
                },
              },
            },
          },
        },
      });

      if (session && session.expiresAt > new Date()) {
        req.session = session;
        req.user = session.user;
      }
    }
    next();
  } catch {
    next();
  }
}

export function requireSystemAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      },
    });
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'System administrator access required.',
      },
    });
  }

  next();
}

export const requireAuth = authenticate;
export const requireAdmin = requireSystemAdmin;
