import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateContainerSignature } from '../packages/media/src/validation/mediaValidator';

describe('Part 9 & 10: Upload Intent & Memory Optimization', () => {
  it('should validate container signature from small 12-byte header buffer (zero memory bloat)', () => {
    // Construct fake MP4 header: 4 bytes length, 'ftyp', 'isom'
    const mp4Header = Buffer.alloc(16);
    mp4Header.writeUInt32BE(16, 0);
    mp4Header.write('ftyp', 4, 'ascii');
    mp4Header.write('isom', 8, 'ascii');

    const result = validateContainerSignature(mp4Header);
    assert.strictEqual(result.valid, true);
    assert.ok(result.detectedFormat?.includes('mp4'));
  });

  it('should reject disguised Windows executables even if given video extension', () => {
    // MZ header: 0x4D 0x5A
    const exeHeader = Buffer.alloc(16);
    exeHeader[0] = 0x4d;
    exeHeader[1] = 0x5a;

    const result = validateContainerSignature(exeHeader);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error?.includes('Disguised executable detected'));
  });

  it('should reject disguised Linux ELF binaries', () => {
    // ELF header: 0x7F 'E' 'L' 'F'
    const elfHeader = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x01, 0x01, 0x01, 0x00, 0, 0, 0, 0]);

    const result = validateContainerSignature(elfHeader);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error?.includes('Disguised executable detected'));
  });
});
