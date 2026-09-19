import { Readable } from 'node:stream';

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface StorageSignedUrlOptions {
  expiresInSeconds?: number;
  contentType?: string;
}

export interface IStorageProvider {
  upload(key: string, data: Buffer | Uint8Array | Readable, options?: StorageUploadOptions): Promise<{ key: string; url: string; size: number }>;
  download(key: string): Promise<Buffer>;
  downloadStream(key: string): Promise<Readable>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  getSignedUploadUrl(key: string, options?: StorageSignedUrlOptions): Promise<string>;
  getSignedDownloadUrl(key: string, options?: StorageSignedUrlOptions): Promise<string>;
  downloadToTempFile(key: string): Promise<{ filePath: string; cleanup: () => Promise<void> }>;
  getLocalFilePath?(key: string): string;
}

