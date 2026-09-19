import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { IStorageProvider, StorageUploadOptions, StorageSignedUrlOptions } from './provider.interface';

export class LocalStorageProvider implements IStorageProvider {
  private basePath: string;
  private publicBaseUrl: string;

  constructor(basePath = './uploads', publicBaseUrl = 'http://localhost:3000/api/v1/uploads') {
    this.basePath = path.resolve(basePath);
    this.publicBaseUrl = publicBaseUrl;

    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private resolveKey(key: string): string {
    const safeKey = key.replace(/^[/\\]+/, '');
    return path.join(this.basePath, safeKey);
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array | Readable,
    _options?: StorageUploadOptions
  ): Promise<{ key: string; url: string; size: number }> {
    const fullPath = this.resolveKey(key);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
      await fs.promises.writeFile(fullPath, data);
      const stat = await fs.promises.stat(fullPath);
      return {
        key,
        url: this.getUrl(key),
        size: stat.size,
      };
    } else {
      // Readable stream
      const writeStream = fs.createWriteStream(fullPath);
      await new Promise<void>((resolve, reject) => {
        data.pipe(writeStream);
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });
      const stat = await fs.promises.stat(fullPath);
      return {
        key,
        url: this.getUrl(key),
        size: stat.size,
      };
    }
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.resolveKey(key);
    return fs.promises.readFile(fullPath);
  }

  async downloadStream(key: string): Promise<Readable> {
    const fullPath = this.resolveKey(key);
    return fs.createReadStream(fullPath);
  }

  async delete(key: string): Promise<boolean> {
    const fullPath = this.resolveKey(key);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.resolveKey(key);
    return fs.existsSync(fullPath);
  }

  getUrl(key: string): string {
    const cleanKey = key.replace(/^[/\\]+/, '');
    return `${this.publicBaseUrl}/${cleanKey}`;
  }

  async getSignedUploadUrl(key: string, _options?: StorageSignedUrlOptions): Promise<string> {
    return `${this.getUrl(key)}?signed_upload=true`;
  }

  async getSignedDownloadUrl(key: string, _options?: StorageSignedUrlOptions): Promise<string> {
    return `${this.getUrl(key)}?signed_download=true`;
  }

  async downloadToTempFile(key: string): Promise<{ filePath: string; cleanup: () => Promise<void> }> {
    const fullPath = this.resolveKey(key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found in local storage: ${key}`);
    }
    return {
      filePath: fullPath,
      cleanup: async () => {}, // Local files are managed in storage directory
    };
  }

  getLocalFilePath(key: string): string {
    return this.resolveKey(key);
  }
}

