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

  it('should throw MediaProbeError on non-existent or corrupted media without fabricated fallback', async () => {
    const ffmpegService = new FFmpegService();
    const probeService = new MediaProbeService(ffmpegService);

    await assert.rejects(
      async () => {
        await probeService.probeFile('non-existent-fake-video.mp4');
      },
      (err: Error) => {
        assert.ok(err.message.includes('Failed to probe media file') || err.message.includes('Invalid media'));
        return true;
      }
    );
  });

  it('should extract structured specifications when probe succeeds with real streams', async () => {
    const mockFFmpeg = {
      execute: async () => ({ stdout: '', stderr: '' }),
      probe: async () => ({
        format: {
          format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
          duration: '14.250',
          size: '5242880',
          bit_rate: '2943371',
        },
        streams: [
          {
            codec_type: 'video',
            codec_name: 'h264',
            width: 1080,
            height: 1920,
            r_frame_rate: '60/1',
          },
          {
            codec_type: 'audio',
            codec_name: 'aac',
            channels: 2,
            sample_rate: '48000',
          },
        ],
      }),
    };

    const probeService = new MediaProbeService(mockFFmpeg);
    const probeResult = await probeService.probeFile('valid-sample.mp4');

    assert.strictEqual(probeResult.width, 1080);
    assert.strictEqual(probeResult.height, 1920);
    assert.strictEqual(probeResult.fps, 60);
    assert.strictEqual(probeResult.durationSeconds, 14.25);
    assert.strictEqual(probeResult.videoCodec, 'h264');
    assert.strictEqual(probeResult.hasAudio, true);
    assert.strictEqual(probeResult.audioCodec, 'aac');
  });
});

