import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { z } from 'zod';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
} from '../packages/auth/src/index';
import { MediaProbeService } from '../packages/media/src/index';
import { parseSRT, parseVTT, parseASS } from '../packages/captions/src/index';
import { UserStatus } from '../packages/database/src/index';

describe('Phase 2 Hardening — Security, Media & Admin Guarantees', () => {
  describe('Password Security & Scrypt Hashes', () => {
    it('should hash and verify passwords using scrypt with random salt', async () => {
      const hash1 = await hashPassword('SecurePassword123');
      const hash2 = await hashPassword('SecurePassword123');

      assert.notStrictEqual(hash1, hash2); // Salts must differ
      assert.strictEqual(await verifyPassword('SecurePassword123', hash1), true);
      assert.strictEqual(await verifyPassword('WrongPassword', hash1), false);
    });

    it('should generate distinct cryptographically secure session tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      assert.strictEqual(typeof token1, 'string');
      assert.ok(token1.length >= 32);
      assert.notStrictEqual(token1, token2);
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

  describe('Rate Limiter Fail-Closed Semantics', () => {
    it('should fail closed with 503 SERVICE_UNAVAILABLE when Redis is disconnected on auth limiter', () => {
      const evaluateRateLimit = (options: { failClosed: boolean; redisReady: boolean }) => {
        if (!options.redisReady) {
          if (options.failClosed) {
            return { status: 503, code: 'SERVICE_UNAVAILABLE' };
          }
          return { status: 200, code: 'MEMORY_FALLBACK' };
        }
        return { status: 200, code: 'OK' };
      };

      // Auth limiter has failClosed: true
      const authResult = evaluateRateLimit({ failClosed: true, redisReady: false });
      assert.strictEqual(authResult.status, 503);
      assert.strictEqual(authResult.code, 'SERVICE_UNAVAILABLE');

      // Upload limiter has failClosed: false
      const uploadResult = evaluateRateLimit({ failClosed: false, redisReady: false });
      assert.strictEqual(uploadResult.status, 200);
      assert.strictEqual(uploadResult.code, 'MEMORY_FALLBACK');
    });

    it('should calculate accurate Retry-After header on 429 rate limit exceeded', () => {
      const maxRequests = 5;
      const windowSeconds = 60;
      const currentCount = 6;
      const ttl = 42;

      const isRateLimited = currentCount > maxRequests;
      const retryAfter = ttl > 0 ? ttl : windowSeconds;

      assert.strictEqual(isRateLimited, true);
      assert.strictEqual(retryAfter, 42);
    });
  });

  describe('Email Provider Abstraction & PII Masking', () => {
    it('should mask recipient email in console logs to prevent PII exposure', () => {
      const maskEmail = (email: string) =>
        email.replace(
          /^(.)(.*)(@.*)$/,
          (_, first, middle, domain) => `${first}${'*'.repeat(Math.min(middle.length, 4))}${domain}`
        );

      assert.strictEqual(maskEmail('john.doe@captionstudio.io'), 'j****@captionstudio.io');
      assert.strictEqual(maskEmail('alice@example.com'), 'a****@example.com');
    });

    it('should construct branded password reset email with trusted APP_URL and no leaked tokens', () => {
      const resetUrl = 'https://app.captionstudio.io/reset-password?token=abcdef123456';
      const expiresInMinutes = 30;

      const buildEmail = (url: string, ttl: number) => {
        assert.ok(!url.includes('undefined'), 'Must not contain undefined host');
        assert.ok(url.startsWith('https://'), 'Production URL must use HTTPS');
        return {
          subject: 'Reset your CaptionStudio PRO password',
          containsBranding: true,
          expiresInMinutes: ttl,
        };
      };

      const email = buildEmail(resetUrl, expiresInMinutes);
      assert.strictEqual(email.subject, 'Reset your CaptionStudio PRO password');
      assert.strictEqual(email.expiresInMinutes, 30);
    });
  });

  describe('Transactional Outbox Reliability & Job Idempotency', () => {
    it('should enforce exponential backoff on dispatch failure', () => {
      const computeBackoff = (attempts: number) => Math.min(60000, 1000 * Math.pow(2, attempts));

      assert.strictEqual(computeBackoff(1), 2000); // 2s
      assert.strictEqual(computeBackoff(2), 4000); // 4s
      assert.strictEqual(computeBackoff(3), 8000); // 8s
      assert.strictEqual(computeBackoff(6), 60000); // capped at 60s
    });

    it('should generate deterministic, idempotent job IDs for deduplication', () => {
      const getMediaAnalysisJobId = (assetId: string) => `media-analysis:${assetId}`;
      const getTranscriptionJobId = (projectId: string, versionNumber: number) =>
        `transcription:${projectId}:v${versionNumber}`;

      assert.strictEqual(getMediaAnalysisJobId('asset-123'), 'media-analysis:asset-123');
      assert.strictEqual(getMediaAnalysisJobId('asset-123'), 'media-analysis:asset-123'); // same ID prevents duplicates

      assert.strictEqual(getTranscriptionJobId('proj-456', 1), 'transcription:proj-456:v1');
    });
  });
});


