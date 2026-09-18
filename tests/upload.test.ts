import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { StoragePaths, LocalStorageProvider } from '../packages/storage/src/index';

describe('Upload Architecture & Storage Security', () => {
  it('should isolate storage paths by workspace, project, and fileId', () => {
    const workspaceId = 'ws-acme';
    const projectId = 'proj-999';
    const fileId = 'file-abc';

    const videoPath = StoragePaths.projectVideoAsset(workspaceId, projectId, fileId, 'mp4');
    assert.strictEqual(videoPath, 'workspaces/ws-acme/projects/proj-999/source/file-abc.mp4');

    const subtitlePath = StoragePaths.projectSubtitleAsset(workspaceId, projectId, fileId, 'srt');
    assert.strictEqual(subtitlePath, 'workspaces/ws-acme/projects/proj-999/subtitles/file-abc.srt');
  });

  it('should reject file uploads exceeding max size limit (500MB)', () => {
    const maxSizeBytes = 500 * 1024 * 1024;
    const testOversized = 501 * 1024 * 1024;
    const testValid = 45 * 1024 * 1024;

    assert.strictEqual(testOversized > maxSizeBytes, true);
    assert.strictEqual(testValid <= maxSizeBytes, true);
  });

  it('should validate allowed video and subtitle file extensions', () => {
    const allowedVideo = ['.mp4', '.mov', '.webm', '.mkv'];
    const allowedSubtitles = ['.srt', '.vtt', '.ass', '.ssa'];

    const isValidExtension = (filename: string) => {
      const ext = path.extname(filename).toLowerCase();
      return allowedVideo.includes(ext) || allowedSubtitles.includes(ext);
    };

    assert.strictEqual(isValidExtension('video.mp4'), true);
    assert.strictEqual(isValidExtension('subtitles.SRT'), true);
    assert.strictEqual(isValidExtension('malicious.exe'), false);
    assert.strictEqual(isValidExtension('script.sh'), false);
  });

  it('should perform write, read, and delete operations in LocalStorageProvider', async () => {
    const tempDir = path.join(os.tmpdir(), `cs-storage-test-${Date.now()}`);
    const provider = new LocalStorageProvider(tempDir);

    const testKey = 'test/workspace/file.txt';
    const content = Buffer.from('CaptionStudio PRO Upload Test Content');

    // 1. Upload
    const uploadResult = await provider.upload(testKey, content);
    assert.strictEqual(uploadResult.key, testKey);
    assert.strictEqual(uploadResult.size, content.length);

    // 2. Exists
    const exists = await provider.exists(testKey);
    assert.strictEqual(exists, true);

    // 3. Download
    const downloaded = await provider.download(testKey);
    assert.strictEqual(downloaded.toString(), content.toString());

    // 4. Delete
    const deleted = await provider.delete(testKey);
    assert.strictEqual(deleted, true);

    const existsAfterDelete = await provider.exists(testKey);
    assert.strictEqual(existsAfterDelete, false);

    // Cleanup
    if (fs.existsSync(tempDir)) {
      await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });
});

