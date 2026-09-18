import crypto from 'node:crypto';

export interface SessionCookieConfig {
  name: string;
  maxAgeDays: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function getSessionCookieOptions(isProduction = process.env.NODE_ENV === 'production'): SessionCookieConfig {
  return {
    name: process.env.AUTH_COOKIE_NAME || 'cs_session',
    maxAgeDays: 30,
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
  };
}

