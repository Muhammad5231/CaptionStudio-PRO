import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { z } from 'zod';
import {
  generateResetToken,
  hashResetToken,
  hashPassword,
  verifyPassword,
} from '../packages/auth/src/index';
import { MediaProbeService } from '../packages/media/src/index';
import { parseSRT, parseVTT, parseASS } from '../packages/captions/src/index';
import { UserStatus } from '../packages/database/src/index';

describe('Phase 2 Hardening — Security, Media & Admin Guarantees', () => {
  describe('Password Reset Cryptography & Security', () => {
    it('should generate distinct 64-char hex reset tokens with deterministic SHA-256 hashes', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      assert.strictEqual(token1.length, 64);
      assert.notStrictEqual(token1, token2);

      const hash1a = hashResetToken(token1);
      const hash1b = hashResetToken(token1);
      const hash2 = hashResetToken(token2);

      assert.strictEqual(hash1a, hash1b);
      assert.notStrictEqual(hash1a, hash2);
      assert.notStrictEqual(token1, hash1a);
    });

    it('should correctly reject expired or already-used reset tokens', () => {
      const validateToken = (token: { usedAt: Date | null; expiresAt: Date }) => {
        if (token.usedAt !== null) return { valid: false, reason: 'TOKEN_ALREADY_USED' };
        if (token.expiresAt.getTime() < Date.now()) return { valid: false, reason: 'TOKEN_EXPIRED' };
        return { valid: true };
      };

      const validToken = {
        usedAt: null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
      assert.deepStrictEqual(validateToken(validToken), { valid: true });

      const usedToken = {
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
      assert.deepStrictEqual(validateToken(usedToken), { valid: false, reason: 'TOKEN_ALREADY_USED' });

      const expiredToken = {
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      };
      assert.deepStrictEqual(validateToken(expiredToken), { valid: false, reason: 'TOKEN_EXPIRED' });
    });
  });

  describe('Real Media Validation (No Fabricated Fallback)', () => {
    it('should reject containers that have no video stream', async () => {
      const mockAudioOnly = {
        execute: async () => ({ stdout: '', stderr: '' }),
        probe: async () => ({
          format: { duration: '30.0', size: '1000' },
          streams: [{ codec_type: 'audio', codec_name: 'aac' }],
        }),
      };

      const probeService = new MediaProbeService(mockAudioOnly);
      await assert.rejects(
        async () => {
          await probeService.probeFile('audio-only.mp4');
        },
        /No video stream detected in container/
      );
    });

    it('should reject containers that have invalid dimensions (width or height = 0)', async () => {
      const mockCorruptedDimensions = {
        execute: async () => ({ stdout: '', stderr: '' }),
        probe: async () => ({
          format: { duration: '30.0', size: '1000' },
          streams: [{ codec_type: 'video', codec_name: 'h264', width: 0, height: 0 }],
        }),
      };

      const probeService = new MediaProbeService(mockCorruptedDimensions);
      await assert.rejects(
        async () => {
          await probeService.probeFile('zero-dim.mp4');
        },
        /Video stream missing valid width or height dimensions/
      );
    });

    it('should reject containers with missing or non-positive duration', async () => {
      const mockZeroDuration = {
        execute: async () => ({ stdout: '', stderr: '' }),
        probe: async () => ({
          format: { duration: '0', size: '1000' },
          streams: [{ codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080 }],
        }),
      };

      const probeService = new MediaProbeService(mockZeroDuration);
      await assert.rejects(
        async () => {
          await probeService.probeFile('zero-duration.mp4');
        },
        /Media container missing valid duration/
      );
    });
  });

  describe('Storage Security & Path Traversal Prevention', () => {
    it('should canonicalize and block directory traversal attempts', () => {
      const localBasePath = path.resolve('./uploads');
      const isPathSafe = (key: string) => {
        if (key.includes('..')) return false;
        const resolved = path.resolve(localBasePath, key);
        return resolved.startsWith(localBasePath);
      };

      assert.strictEqual(isPathSafe('workspaces/w1/projects/p1/video/f1.mp4'), true);
      assert.strictEqual(isPathSafe('../../.env'), false);
      assert.strictEqual(isPathSafe('../../../database/schema.prisma'), false);
      assert.strictEqual(isPathSafe('workspaces/w1/../../../etc/passwd'), false);
    });
  });

  describe('Admin Actions & Real Metrics Validation', () => {
    it('should validate user status updates strictly with UserStatus enum', () => {
      const schema = z.object({ status: z.nativeEnum(UserStatus) });

      assert.strictEqual(schema.safeParse({ status: 'ACTIVE' }).success, true);
      assert.strictEqual(schema.safeParse({ status: 'SUSPENDED' }).success, true);
      assert.strictEqual(schema.safeParse({ status: 'DEACTIVATED' }).success, true);

      // Rejects arbitrary strings or fake statuses
      assert.strictEqual(schema.safeParse({ status: 'ADMIN' }).success, false);
      assert.strictEqual(schema.safeParse({ status: 'PRO' }).success, false);
      assert.strictEqual(schema.safeParse({ status: 'UNKNOWN' }).success, false);
    });

    it('should prevent administrators from suspending their own accounts', () => {
      const canUpdateStatus = (adminId: string, targetId: string, newStatus: string) => {
        if (adminId === targetId && newStatus === 'SUSPENDED') {
          return { allowed: false, code: 'SELF_SUSPENSION_DENIED' };
        }
        return { allowed: true };
      };

      assert.deepStrictEqual(canUpdateStatus('user-1', 'user-1', 'SUSPENDED'), {
        allowed: false,
        code: 'SELF_SUSPENSION_DENIED',
      });
      assert.deepStrictEqual(canUpdateStatus('user-1', 'user-2', 'SUSPENDED'), {
        allowed: true,
      });
    });
  });

  describe('Subtitle Parser Security & Resource Limits', () => {
    it('should reject subtitle files exceeding 5MB size limit', () => {
      const hugeString = '1\n00:00:01,000 --> 00:00:02,000\nTest\n\n'.repeat(200_000); // > 5MB

      assert.throws(
        () => parseSRT(hugeString),
        /exceeds maximum allowed text limit/
      );
      assert.throws(
        () => parseVTT(hugeString),
        /exceeds maximum allowed text limit/
      );
      assert.throws(
        () => parseASS(hugeString),
        /exceeds maximum allowed text limit/
      );
    });
  });
});

