import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getExpressCookieOptions,
} from '../packages/auth/src/index';
import { SignUpSchema, LoginSchema, GMAIL_REGEX } from '../packages/types/src/index';

describe('Local Authentication & Session Security', () => {
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

  it('should reject non-gmail emails and short passwords in SignUpSchema', () => {
    // Non-gmail address
    const nonGmail = SignUpSchema.safeParse({
      name: 'Alex',
      email: 'alex@captionstudio.io',
      password: 'password123',
    });
    assert.strictEqual(nonGmail.success, false);

    // Short password (< 8 chars)
    const shortPass = SignUpSchema.safeParse({
      name: 'Alex',
      email: 'alex@gmail.com',
      password: 'short',
    });
    assert.strictEqual(shortPass.success, false);
  });

  it('should accept valid @gmail.com signup and login payloads', () => {
    const validSignup = {
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      password: 'StrongPassword123!',
    };
    const signupResult = SignUpSchema.safeParse(validSignup);
    assert.strictEqual(signupResult.success, true);

    const validLogin = {
      email: 'alex.rivera@gmail.com',
      password: 'StrongPassword123!',
      rememberMe: true,
    };
    const loginResult = LoginSchema.safeParse(validLogin);
    assert.strictEqual(loginResult.success, true);
  });

  it('should strictly validate Gmail addresses via GMAIL_REGEX', () => {
    assert.ok(GMAIL_REGEX.test('user@gmail.com'));
    assert.ok(GMAIL_REGEX.test('user.name+tag@gmail.com'));
    assert.ok(GMAIL_REGEX.test('USER123@GMAIL.COM'));

    assert.strictEqual(GMAIL_REGEX.test('user@yahoo.com'), false);
    assert.strictEqual(GMAIL_REGEX.test('user@outlook.com'), false);
    assert.strictEqual(GMAIL_REGEX.test('user@company.io'), false);
    assert.strictEqual(GMAIL_REGEX.test('user@notgmail.com'), false);
  });
});
