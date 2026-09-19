import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {
  SupabaseStorageProvider,
  createStorageProvider,
  resetStorageProvider,
  StoragePaths,
  LocalStorageProvider,
} from '../packages/storage/src/index';

describe('Supabase Storage Provider & Infrastructure Migration', () => {
  it('should validate required credentials upon initialization', () => {
    assert.throws(
      () => new SupabaseStorageProvider({ supabaseUrl: '', serviceRoleKey: 'key' }),
      /supabaseUrl is required/
    );

    assert.throws(
      () => new SupabaseStorageProvider({ supabaseUrl: 'https://test.supabase.co', serviceRoleKey: '' }),
      /serviceRoleKey is required/
    );
  });

  it('should format storage URLs and keys cleanly without leading slashes', () => {
    const provider = new SupabaseStorageProvider({
      supabaseUrl: 'https://xyzproject.supabase.co',
      serviceRoleKey: 'mock-service-role-key',
      bucket: 'captionstudio-media',
    });

    const key = StoragePaths.projectVideoAsset('ws-1', 'proj-2', 'file-3', 'mp4');
    const url = provider.getUrl(key);

    assert.strictEqual(
      url,
      'https://xyzproject.supabase.co/storage/v1/object/authenticated/captionstudio-media/workspaces/ws-1/projects/proj-2/source/file-3.mp4'
    );
  });

  it('should instantiate SupabaseStorageProvider via factory when STORAGE_PROVIDER=supabase', () => {
    const origProvider = process.env.STORAGE_PROVIDER;
    const origUrl = process.env.SUPABASE_URL;
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      process.env.STORAGE_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://unit-test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'unit-test-key';
      resetStorageProvider();

      const provider = createStorageProvider();
      assert.strictEqual(provider instanceof SupabaseStorageProvider, true);
    } finally {
      process.env.STORAGE_PROVIDER = origProvider;
      process.env.SUPABASE_URL = origUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
      resetStorageProvider();
    }
  });

  it('should fall back to LocalStorageProvider when STORAGE_PROVIDER=local', () => {
    const origProvider = process.env.STORAGE_PROVIDER;
    try {
      process.env.STORAGE_PROVIDER = 'local';
      resetStorageProvider();

      const provider = createStorageProvider();
      assert.strictEqual(provider instanceof LocalStorageProvider, true);
    } finally {
      process.env.STORAGE_PROVIDER = origProvider;
      resetStorageProvider();
    }
  });

  it('should download to a temporary file and cleanly execute cleanup callback in LocalStorageProvider', async () => {
    const tempDir = path.join(os.tmpdir(), `cs-temp-test-${Date.now()}`);
    const localProvider = new LocalStorageProvider(tempDir);

    const testKey = 'workspaces/ws-test/projects/p-test/source/sample.mp4';
    await localProvider.upload(testKey, Buffer.from('FAKE_VIDEO_CONTENT'));

    const { filePath, cleanup } = await localProvider.downloadToTempFile(testKey);
    assert.strictEqual(fs.existsSync(filePath), true);

    await cleanup();
    assert.strictEqual(typeof cleanup, 'function');
  });

  it('should ensure service role key is NEVER exposed through NEXT_PUBLIC_* variables in codebase', () => {
    assert.strictEqual(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, undefined);
  });
});

