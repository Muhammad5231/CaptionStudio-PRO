import { z } from 'zod';

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: UserProfile;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  expiresAt: Date;
}

export interface JWTPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  workspaceId: string;
  iat: number;
  exp: number;
}

export const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

// Zod validation schemas
export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z
    .string()
    .regex(GMAIL_REGEX, 'Only @gmail.com email addresses are allowed'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export type SignUpDto = z.infer<typeof SignUpSchema>;

export const LoginSchema = z.object({
  email: z
    .string()
    .regex(GMAIL_REGEX, 'Only @gmail.com email addresses are allowed'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginDto = z.infer<typeof LoginSchema>;

