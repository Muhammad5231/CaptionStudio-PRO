import { Router } from 'express';
import { SignUpSchema, LoginSchema, UserRole, WorkspaceRole } from '@captionstudio/types';
import { prisma } from '@captionstudio/database';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  generateResetToken,
  hashResetToken,
  getExpressCookieOptions,
  AUTH_COOKIE_NAME,
} from '@captionstudio/auth';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/ratelimit.middleware';
import { recordAuditLog } from '../services/audit.service';
import { emailService } from '../services/email.service';

export const authRouter = Router();

/**
 * POST /api/v1/auth/signup
 * Registers a new user, creates their default workspace and owner membership, and starts a session.
 */
authRouter.post('/signup', authRateLimiter, async (req, res, next) => {
  try {
    const data = SignUpSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    const passwordHash = await hashPassword(data.password);
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const rawSlug = (data.name || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const uniqueSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 7)}`;

    // Atomic transaction: User + Workspace + WorkspaceMember + BrandKit + Session
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name || email.split('@')[0],
          passwordHash,
          role: UserRole.CREATOR,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug: uniqueSlug,
        },
      });

      const member = await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      });

      await tx.brandKit.create({
        data: {
          workspaceId: workspace.id,
          primaryColor: '#635BFF',
          secondaryColor: '#111827',
          accentColor: '#10B981',
          fonts: ['Inter', 'Plus Jakarta Sans'],
        },
      });

      const session = await tx.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expiresAt,
          ipAddress: req.ip || req.socket.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
        },
      });

      return { user, workspace, member, session };
    });

    await recordAuditLog({
      userId: result.user.id,
      action: 'USER_REGISTER',
      resource: `User:${result.user.id}`,
      ipAddress: req.ip,
    });

    res.cookie(AUTH_COOKIE_NAME, sessionToken, getExpressCookieOptions());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          createdAt: result.user.createdAt.toISOString(),
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
          role: result.member.role,
        },
      },
      message: 'Account created successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login
 * Validates credentials, starts a new session, rotates cookie.
 */
authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaceMembers: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please try again.',
        },
      });
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please try again.',
        },
      });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + (data.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: `User:${user.id}`,
      ipAddress: req.ip,
    });

    res.cookie(AUTH_COOKIE_NAME, sessionToken, getExpressCookieOptions());

    const activeWorkspace = user.workspaceMembers[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        workspace: activeWorkspace
          ? {
              id: activeWorkspace.workspace.id,
              name: activeWorkspace.workspace.name,
              slug: activeWorkspace.workspace.slug,
              role: activeWorkspace.role,
            }
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/logout
 * Deletes current session and clears cookie.
 */
authRouter.post('/logout', authenticate, async (req, res, next) => {
  try {
    if (req.session) {
      await prisma.session.delete({ where: { id: req.session.id } }).catch(() => {});
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        resource: `User:${req.user.id}`,
        ipAddress: req.ip,
      });
    }

    res.clearCookie(AUTH_COOKIE_NAME);

    res.json({
      success: true,
      message: 'Successfully logged out.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/me
 * Returns authenticated user details, workspaces, and permissions.
 */
authRouter.get('/me', authenticate, async (req, res) => {
  const user = req.user!;
  const workspaces = user.workspaceMembers.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
  }));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      workspaces,
      activeWorkspace: workspaces[0] || null,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/auth/forgot-password
 * Triggers password reset email flow with secure hashed tokens.
 */
authRouter.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_EMAIL',
          message: 'Valid email address is required.',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Invalidate existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const rawToken = generateResetToken();
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes TTL

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const appBaseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;

      try {
        await emailService.sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailErr) {
        console.error(
          '[Auth:ForgotPassword] Password reset email dispatch failed:',
          emailErr instanceof Error ? emailErr.message : 'Unknown error'
        );
      }

      await recordAuditLog({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: `User:${user.id}`,
        ipAddress: req.ip,
      });
    }

    // Always respond with identical generic response to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Resets password using verification token, invalidates existing sessions, and audits the event.
 */
authRouter.post('/reset-password', authRateLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Token and new password (min 8 characters) are required.',
        },
      });
    }

    const tokenHash = hashResetToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Check if token exists, hasn't been used, and hasn't expired
    if (!resetRecord || resetRecord.usedAt !== null || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Password reset link is invalid or has expired. Please request a new one.',
        },
      });
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Atomic transaction: Update password, revoke ALL existing sessions, mark token used
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      await tx.session.deleteMany({
        where: { userId: resetRecord.userId },
      });

      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });
    });

    await recordAuditLog({
      userId: resetRecord.userId,
      action: 'PASSWORD_RESET_SUCCESS',
      resource: `User:${resetRecord.userId}`,
      ipAddress: req.ip,
    });

    await emailService.sendSecurityNotification(
      resetRecord.user.email,
      'Your CaptionStudio PRO account password was recently changed. If you did not make this change, please contact security immediately.'
    );

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

