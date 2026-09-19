import { Readable } from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IStorageProvider,
  StorageUploadOptions,
  StorageSignedUrlOptions,
} from './provider.interface';

export interface SupabaseStorageConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket?: string;
}

export class SupabaseStorageProvider implements IStorageProvider {
  private client: SupabaseClient;
  private bucket: string;
  private supabaseUrl: string;

  constructor(config: SupabaseStorageConfig) {
    if (!config.supabaseUrl) {
      throw new Error('SupabaseStorageProvider: supabaseUrl is required');
    }
    if (!config.serviceRoleKey) {
      throw new Error('SupabaseStorageProvider: serviceRoleKey is required');
    }

    this.supabaseUrl = config.supabaseUrl.replace(/\/+$/, '');
    this.bucket = config.bucket || process.env.SUPABASE_STORAGE_BUCKET || 'captionstudio-media';
    this.client = createClient(this.supabaseUrl, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  private cleanKey(key: string): string {
    return key.replace(/^[/\\]+/, '');
  }

  private toFullUrl(signedUrlOrPath: string): string {
    if (signedUrlOrPath.startsWith('http://') || signedUrlOrPath.startsWith('https://')) {
      return signedUrlOrPath;
    }
    const cleanPath = signedUrlOrPath.startsWith('/') ? signedUrlOrPath : `/${signedUrlOrPath}`;
    return `${this.supabaseUrl}/storage/v1${cleanPath}`;
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array | Readable,
    options?: StorageUploadOptions
  ): Promise<{ key: string; url: string; size: number }> {
    const cleanKey = this.cleanKey(key);
    let buffer: Buffer;

    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of data) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      buffer = Buffer.concat(chunks);
    }

    const { error } = await this.client.storage.from(this.bucket).upload(cleanKey, buffer, {
      contentType: options?.contentType || 'application/octet-stream',
      upsert: true,
    });

    if (error) {
      throw new Error(`Supabase Storage upload failed for '${cleanKey}': ${error.message}`);
    }

    return {
      key: cleanKey,
      url: this.getUrl(cleanKey),
      size: buffer.length,
    };
  }

  async download(key: string): Promise<Buffer> {
    const cleanKey = this.cleanKey(key);
    const { data, error } = await this.client.storage.from(this.bucket).download(cleanKey);

    if (error || !data) {
      throw new Error(`Supabase Storage download failed for '${cleanKey}': ${error?.message || 'Object not found'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async downloadStream(key: string): Promise<Readable> {
    const buffer = await this.download(key);
    return Readable.from(buffer);
  }

  async downloadToTempFile(key: string): Promise<{ filePath: string; cleanup: () => Promise<void> }> {
    const cleanKey = this.cleanKey(key);
    const ext = path.extname(cleanKey) || '.tmp';
    const tempFileName = `cs-supabase-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const tempPath = path.join(os.tmpdir(), tempFileName);

    const buffer = await this.download(cleanKey);
    await fs.promises.writeFile(tempPath, buffer);

    return {
      filePath: tempPath,
      cleanup: async () => {
        try {
          if (fs.existsSync(tempPath)) {
            await fs.promises.unlink(tempPath);
          }
        } catch (cleanupErr) {
          console.warn(`[SupabaseStorageProvider] Failed to clean up temp file ${tempPath}:`, cleanupErr);
        }
      },
    };
  }

  async delete(key: string): Promise<boolean> {
    const cleanKey = this.cleanKey(key);
    const { error } = await this.client.storage.from(this.bucket).remove([cleanKey]);
    return !error;
  }

  async exists(key: string): Promise<boolean> {
    const cleanKey = this.cleanKey(key);
    const dir = path.posix.dirname(cleanKey);
    const base = path.posix.basename(cleanKey);

    const searchDir = dir === '.' ? '' : dir;
    const { data, error } = await this.client.storage.from(this.bucket).list(searchDir, {
      search: base,
      limit: 10,
    });

    if (error || !data) {
      return false;
    }

    return data.some((item) => item.name === base);
  }

  getUrl(key: string): string {
    const cleanKey = this.cleanKey(key);
    return `${this.supabaseUrl}/storage/v1/object/authenticated/${this.bucket}/${cleanKey}`;
  }

  async getSignedUploadUrl(key: string, _options?: StorageSignedUrlOptions): Promise<string> {
    const cleanKey = this.cleanKey(key);
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(cleanKey);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create Supabase signed upload URL for '${cleanKey}': ${error?.message || 'Unknown error'}`);
    }

    return this.toFullUrl(data.signedUrl);
  }

  async getSignedDownloadUrl(key: string, options?: StorageSignedUrlOptions): Promise<string> {
    const cleanKey = this.cleanKey(key);
    const expiresIn = options?.expiresInSeconds || 3600;
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUrl(cleanKey, expiresIn);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create Supabase signed download URL for '${cleanKey}': ${error?.message || 'Unknown error'}`);
    }

    return this.toFullUrl(data.signedUrl);
  }
}

