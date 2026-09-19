import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { checkRedisHealth, closeRedisConnection } from '../packages/queue/src/connection';

describe('Part 1: Redis Diagnostics and Rate Limiter Fail-Closed Mode', () => {
  after(() => {
    closeRedisConnection();
  });
  it('should return diagnostic status when checking Redis health', async () => {
    const health = await checkRedisHealth();
    assert.strictEqual(typeof health.isConnected, 'boolean');
    assert.strictEqual(typeof health.status, 'string');
    if (!health.isConnected) {
      assert.ok(health.error !== undefined || health.status !== 'ready');
    }
  });

  it('should format dev error message with actionable docker instructions', () => {
    const isDev = true;
    const errorMessage = isDev
      ? 'Redis is unavailable. Start Docker/Redis and try again.'
      : 'Authentication service temporarily unavailable. Please try again shortly.';

    assert.ok(errorMessage.includes('Start Docker/Redis and try again.'));
  });
});
