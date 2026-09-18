import { describe, it } from 'node:test';
import assert from 'node:assert';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../packages/queue/src/constants';
import { MediaProbeService, FFmpegService } from '../packages/media/src/index';

describe('Queue & Media Analysis Worker Infrastructure', () => {
  it('should define distinct BullMQ queue names for async processing', () => {
    assert.strictEqual(QUEUE_NAMES.MEDIA_ANALYSIS, 'captionstudio-media-analysis');
    assert.strictEqual(QUEUE_NAMES.TRANSCRIPTION, 'captionstudio-transcription');
    assert.strictEqual(QUEUE_NAMES.EXPORT, 'captionstudio-export');
  });

  it('should specify exponential backoff retry configuration for worker resilience', () => {
    assert.strictEqual(DEFAULT_JOB_OPTIONS.attempts, 3);
    assert.strictEqual(DEFAULT_JOB_OPTIONS.backoff.type, 'exponential');
    assert.strictEqual(DEFAULT_JOB_OPTIONS.backoff.delay, 3000);
  });

  it('should probe media files and extract structured specifications', async () => {
    const ffmpegService = new FFmpegService();
    const probeService = new MediaProbeService(ffmpegService);

    const probeResult = await probeService.probeFile('test-video.mp4');

    assert.ok(probeResult.width > 0);
    assert.ok(probeResult.height > 0);
    assert.ok(probeResult.durationSeconds > 0);
    assert.ok(probeResult.fps > 0);
    assert.strictEqual(typeof probeResult.videoCodec, 'string');
  });
});

