import { Readable } from 'node:stream';
import { IStorageProvider, StorageUploadOptions, StorageSignedUrlOptions } from './provider.interface';

export interface S3ProviderConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
}

export class S3StorageProvider implements IStorageProvider {
  private config: S3ProviderConfig;

  constructor(config: S3ProviderConfig) {
    this.config = config;
  }

  async upload(
    key: string,
    _data: Buffer | Uint8Array | Readable,
    _options?: StorageUploadOptions
  ): Promise<{ key: string; url: string; size: number }> {
    return {
      key,
      url: this.getUrl(key),
      size: 0,
    };
  }

  async download(_key: string): Promise<Buffer> {
    return Buffer.from('');
  }

  async downloadStream(_key: string): Promise<Readable> {
    return Readable.from([]);
  }

  async delete(_key: string): Promise<boolean> {
    return true;
  }

  async exists(_key: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl}/${key}`;
    }
    return `${this.config.endpoint}/${this.config.bucket}/${key}`;
  }

  async getSignedUploadUrl(key: string, _options?: StorageSignedUrlOptions): Promise<string> {
    return `${this.getUrl(key)}?X-Amz-Signature=placeholder_presigned_url`;
  }

  async getSignedDownloadUrl(key: string, _options?: StorageSignedUrlOptions): Promise<string> {
    return `${this.getUrl(key)}?X-Amz-Signature=placeholder_presigned_url`;
  }

  async downloadToTempFile(_key: string): Promise<{ filePath: string; cleanup: () => Promise<void> }> {
    return {
      filePath: '',
      cleanup: async () => {},
    };
  }
}

