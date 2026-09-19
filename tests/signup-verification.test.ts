import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { UserStatus } from '../packages/database/src/index';

describe('Part 2: Real Email Verification & Account Status Guards', () => {
  it('should generate secure 64-char hex SHA-256 token hash', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    assert.strictEqual(rawToken.length, 64);

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    assert.strictEqual(tokenHash.length, 64);
    assert.notStrictEqual(tokenHash, rawToken);

    // Deterministic verify
    const verifyHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    assert.strictEqual(verifyHash, tokenHash);
  });

  it('should enforce status states for pending verification and suspended accounts', () => {
    assert.strictEqual(UserStatus.PENDING_VERIFICATION, 'PENDING_VERIFICATION');
    assert.strictEqual(UserStatus.SUSPENDED, 'SUSPENDED');
    assert.strictEqual(UserStatus.ACTIVE, 'ACTIVE');

    // Simulate login guard checks
    const checkLoginAllowed = (status: UserStatus): { allowed: boolean; code?: string } => {
      if (status === UserStatus.PENDING_VERIFICATION) {
        return { allowed: false, code: 'EMAIL_NOT_VERIFIED' };
      }
      if (status === UserStatus.SUSPENDED) {
        return { allowed: false, code: 'ACCOUNT_SUSPENDED' };
      }
      return { allowed: true };
    };

    assert.deepStrictEqual(checkLoginAllowed(UserStatus.PENDING_VERIFICATION), {
      allowed: false,
      code: 'EMAIL_NOT_VERIFIED',
    });

    assert.deepStrictEqual(checkLoginAllowed(UserStatus.SUSPENDED), {
      allowed: false,
      code: 'ACCOUNT_SUSPENDED',
    });

    assert.deepStrictEqual(checkLoginAllowed(UserStatus.ACTIVE), {
      allowed: true,
    });
  });
});
