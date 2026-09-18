import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword } from '../packages/auth/src/index';
import { SignUpSchema } from '../packages/types/src/index';

describe('Authentication & Password Security', () => {
  it('should hash and verify passwords using scrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    assert.ok(hash.includes(':'));

    const isValid = await verifyPassword(rawPassword, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    assert.strictEqual(isInvalid, false);
  });

  it('should reject invalid signup attempts with Zod validation', () => {
    // Missing number and uppercase
    const invalidAttempt = {
      name: 'A',
      email: 'not-an-email',
      password: 'weak',
      termsAccepted: false,
    };

    const result = SignUpSchema.safeParse(invalidAttempt);
    assert.strictEqual(result.success, false);
  });
});

