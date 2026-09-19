import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  FFmpegService,
  MediaProbeService,
  MediaProbeError,
  validateContainerSignature,
  validateProbedMedia,
} from '../packages/media/src/index';

describe('Real Media Analysis & FFprobe Integration', () => {
  const ffmpegService = new FFmpegService();
  const probeService = new MediaProbeService(ffmpegService);
  const fixturePath = path.resolve('./tests/fixtures/test-video.mp4');

  it('should probe a genuine FFmpeg-generated MP4 fixture and extract real stream metadata', async () => {
    // Verify fixture exists
    assert.strictEqual(
      fs.existsSync(fixturePath),
      true,
      `Expected real test fixture at ${fixturePath}. Run ffmpeg generation first if missing.`
    );

    const result = await probeService.probeFile(fixturePath);

    // Verify real video stream properties
    assert.strictEqual(result.width, 320, 'Width must match actual 320px');
    assert.strictEqual(result.height, 240, 'Height must match actual 240px');
    assert.strictEqual(result.fps, 30, 'Frame rate must match 30 FPS');
    assert.strictEqual(result.videoCodec, 'h264', 'Video codec must be h264');

    // Verify real audio stream properties
    assert.strictEqual(result.hasAudio, true, 'Audio stream must be detected');
    assert.strictEqual(result.audioCodec, 'aac', 'Audio codec must be aac');
    assert.strictEqual(result.audioChannels, 1, 'Audio channels must be 1 (mono)');
    assert.strictEqual(result.audioSampleRate, 48000, 'Audio sample rate must be 48000 Hz');

    // Verify duration and size
    assert.ok(result.durationSeconds >= 0.9 && result.durationSeconds <= 1.1, 'Duration must be ~1.0s');
    assert.ok(result.sizeBytes > 10000, 'File size must be greater than 10KB');
  });

  it('should validate container signatures accurately', () => {
    // 1. Valid MP4 header
    const validHeader = fs.readFileSync(fixturePath).subarray(0, 64);
    const validCheck = validateContainerSignature(validHeader);
    assert.strictEqual(validCheck.valid, true);
    assert.ok(validCheck.detectedFormat?.includes('mp4'));

    // 2. Disguised Windows PE executable (MZ)
    const fakeExecutable = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
    const exeCheck = validateContainerSignature(fakeExecutable);
    assert.strictEqual(exeCheck.valid, false);
    assert.ok(exeCheck.error?.includes('Disguised executable'));

    // 3. Disguised Linux ELF executable
    const fakeElf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const elfCheck = validateContainerSignature(fakeElf);
    assert.strictEqual(elfCheck.valid, false);
    assert.ok(elfCheck.error?.includes('Disguised executable'));

    // 4. Shell script disguised as video
    const fakeScript = Buffer.from('#!/bin/bash\necho "malicious"\n');
    const scriptCheck = validateContainerSignature(fakeScript);
    assert.strictEqual(scriptCheck.valid, false);
    assert.ok(scriptCheck.error?.includes('Disguised script'));
  });

  it('should reject malformed or truncated media with MediaProbeError', async () => {
    const malformedPath = path.resolve('./tests/fixtures/malformed-temp.mp4');
    // Write 32 bytes of random garbage
    fs.writeFileSync(malformedPath, Buffer.from('NOT_A_VALID_MP4_FILE_JUST_JUNK_12345678'));

    try {
      await assert.rejects(
        async () => {
          await probeService.probeFile(malformedPath);
        },
        (err: Error) => {
          assert.ok(
            err.name === 'MediaProbeError' || err.message.includes('Failed to probe media file'),
            `Expected MediaProbeError, got: ${err.message}`
          );
          return true;
        }
      );
    } finally {
      if (fs.existsSync(malformedPath)) {
        fs.unlinkSync(malformedPath);
      }
    }
  });

  it('should deeply validate probed stream specifications', () => {
    // Audio-only rejected when video required
    const audioOnly = validateProbedMedia({
      format: { duration: '10.0' },
      streams: [{ codec_type: 'audio', codec_name: 'aac' }],
    });
    assert.strictEqual(audioOnly.valid, false);
    assert.ok(audioOnly.error?.includes('No video stream'));

    // Zero dimensions rejected
    const zeroDim = validateProbedMedia({
      format: { duration: '10.0' },
      streams: [{ codec_type: 'video', codec_name: 'h264', width: 0, height: 0 }],
    });
    assert.strictEqual(zeroDim.valid, false);
    assert.ok(zeroDim.error?.includes('Invalid video dimensions'));

    // Missing/zero duration rejected
    const zeroDur = validateProbedMedia({
      format: { duration: '0' },
      streams: [{ codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080 }],
    });
    assert.strictEqual(zeroDur.valid, false);
    assert.ok(zeroDur.error?.includes('missing valid positive duration'));
  });
});
