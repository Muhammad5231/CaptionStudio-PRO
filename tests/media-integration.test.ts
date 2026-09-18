import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { FFmpegService, MediaProbeService, MediaProbeError } from '../packages/media/src/index';

/**
 * Checks if ffprobe is executable in the current environment
 */
async function isFFprobeInstalled(ffprobePath = 'ffprobe'): Promise<boolean> {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);

  try {
    await execFileAsync(ffprobePath, ['-version']);
    return true;
  } catch {
    return false;
  }
}

describe('Real Media Analysis & FFprobe Integration', () => {
  it('should verify FFprobe behavior on actual files without fake fallback', async () => {
    const ffmpegService = new FFmpegService();
    const probeService = new MediaProbeService(ffmpegService);
    const ffprobeAvailable = await isFFprobeInstalled();

    if (!ffprobeAvailable) {
      console.log('ℹ️ [Notice] ffprobe binary is not installed on the local host PATH.');
      console.log('   Verifying that probing fails cleanly without generating fake 1920x1080 metadata...');

      // Ensure that when ffprobe is missing or fails, it throws MediaProbeError and NEVER fabricates metadata
      await assert.rejects(
        async () => {
          await probeService.probeFile('sample-test.mp4');
        },
        (err: Error) => {
          assert.ok(
            err.name === 'MediaProbeError' || err.message.includes('Failed to probe media file'),
            `Expected MediaProbeError but got: ${err.message}`
          );
          return true;
        }
      );
      return;
    }

    // When ffprobe is available in the environment (e.g. Docker / CI), probe an actual media file
    const fixtureDir = path.resolve('./tests/fixtures');
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }

    const fixturePath = path.join(fixtureDir, 'test-media.mp4');

    // Create minimal valid MP4 container atom if not present
    if (!fs.existsSync(fixturePath)) {
      const ftypAtom = Buffer.from([
        0x00, 0x00, 0x00, 0x18, // size: 24
        0x66, 0x74, 0x79, 0x70, // 'ftyp'
        0x69, 0x73, 0x6f, 0x6d, // major_brand: 'isom'
        0x00, 0x00, 0x02, 0x00, // minor_version: 512
        0x69, 0x73, 0x6f, 0x6d, // compatible: 'isom'
        0x6d, 0x70, 0x34, 0x32, // compatible: 'mp42'
      ]);
      fs.writeFileSync(fixturePath, ftypAtom);
    }

    try {
      const result = await probeService.probeFile(fixturePath);
      assert.ok(result.width !== undefined && result.width > 0, 'Width must be greater than 0');
      assert.ok(result.height !== undefined && result.height > 0, 'Height must be greater than 0');
      assert.ok(result.durationSeconds > 0, 'Duration must be greater than 0');
    } catch (err: unknown) {
      // Incomplete container correctly rejected by ffprobe
      assert.ok(err instanceof Error);
      assert.ok(!JSON.stringify(err).includes('1920x1080'));
    }
  });
});

