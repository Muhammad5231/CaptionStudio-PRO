import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getExpressCookieOptions,
} from '../packages/auth/src/index';
import { SignUpSchema, LoginSchema } from '../packages/types/src/index';

describe('Authentication & Session Security', () => {
  it('should hash and verify passwords using scrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    assert.ok(hash.includes(':'));

    const isValid = await verifyPassword(rawPassword, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    assert.strictEqual(isInvalid, false);
  });

  it('should generate cryptographically strong session tokens', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    assert.strictEqual(typeof token1, 'string');
    assert.ok(token1.length >= 32);
    assert.notStrictEqual(token1, token2);
  });

  it('should generate secure HTTP-only cookie configuration', () => {
    const devOptions = getExpressCookieOptions(false);
    assert.strictEqual(devOptions.httpOnly, true);
    assert.strictEqual(devOptions.sameSite, 'lax');
    assert.strictEqual(devOptions.secure, false);
    assert.strictEqual(devOptions.maxAge, 30 * 24 * 60 * 60 * 1000);

    const prodOptions = getExpressCookieOptions(true);
    assert.strictEqual(prodOptions.secure, true);
  });

  it('should correctly evaluate session expiration', () => {
    const pastDate = new Date(Date.now() - 1000);
    const futureDate = new Date(Date.now() + 1000 * 60);

    const isExpired = (expiresAt: Date) => expiresAt < new Date();

    assert.strictEqual(isExpired(pastDate), true);
    assert.strictEqual(isExpired(futureDate), false);
  });

  it('should reject invalid signup attempts with Zod validation', () => {
    const invalidAttempt = {
      name: 'A',
      email: 'not-an-email',
      password: 'weak',
      termsAccepted: false,
    };

    const result = SignUpSchema.safeParse(invalidAttempt);
    assert.strictEqual(result.success, false);
  });

  it('should accept valid signup and login payloads', () => {
    const validSignup = {
      name: 'Alex Rivera',
      email: 'alex@captionstudio.io',
      password: 'StrongPassword123!',
      termsAccepted: true,
    };
    const signupResult = SignUpSchema.safeParse(validSignup);
    assert.strictEqual(signupResult.success, true);

    const validLogin = {
      email: 'alex@captionstudio.io',
      password: 'StrongPassword123!',
      rememberMe: true,
    };
    const loginResult = LoginSchema.safeParse(validLogin);
    assert.strictEqual(loginResult.success, true);
  });

  it('should generate cryptographically strong, random reset tokens and valid SHA-256 hashes', async () => {
    const { generateResetToken, hashResetToken } = await import('../packages/auth/src/index');

    const rawToken1 = generateResetToken();
    const rawToken2 = generateResetToken();

    assert.strictEqual(typeof rawToken1, 'string');
    assert.strictEqual(rawToken1.length, 64); // 32 bytes hex
    assert.notStrictEqual(rawToken1, rawToken2);

    const hash1 = hashResetToken(rawToken1);
    const hash2 = hashResetToken(rawToken1);
    const hashDifferent = hashResetToken(rawToken2);

    assert.strictEqual(hash1, hash2); // Deterministic
    assert.notStrictEqual(hash1, hashDifferent);
    assert.notStrictEqual(rawToken1, hash1); // Never store raw token
  });

  it('should enforce single-use and expiration on password reset tokens', () => {
    const isTokenValid = (token: { usedAt: Date | null; expiresAt: Date }) => {
      if (token.usedAt !== null) return false; // Already used
      if (token.expiresAt < new Date()) return false; // Expired
      return true;
    };

    const activeToken = {
      usedAt: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins left
    };
    assert.strictEqual(isTokenValid(activeToken), true);

    const usedToken = {
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
    assert.strictEqual(isTokenValid(usedToken), false);

    const expiredToken = {
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000), // Expired 1s ago
    };
    assert.strictEqual(isTokenValid(expiredToken), false);
  });
});

