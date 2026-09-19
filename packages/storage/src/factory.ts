import path from 'node:path';
import fs from 'node:fs';
import { IStorageProvider } from './provider.interface';
import { LocalStorageProvider } from './local.provider';
import { S3StorageProvider } from './s3.provider';

let defaultStorageProvider: IStorageProvider | null = null;

function resolveUploadsPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }
  // Try to find monorepo root by locating pnpm-workspace.yaml upwards
  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return path.join(current, 'uploads');
    }
    current = path.dirname(current);
  }
  return path.resolve(process.cwd(), 'uploads');
}

export function getStorageProvider(): IStorageProvider {
  if (defaultStorageProvider) {
    return defaultStorageProvider;
  }

  const driver = (process.env.STORAGE_PROVIDER || process.env.STORAGE_DRIVER || 'local').toLowerCase();

  if (driver === 's3') {
    defaultStorageProvider = new S3StorageProvider({
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      region: process.env.STORAGE_REGION || 'us-east-1',
      bucket: process.env.STORAGE_BUCKET || 'captionstudio-media',
      accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
      publicBaseUrl: process.env.STORAGE_PUBLIC_URL,
    });
  } else {
    const uploadDir = resolveUploadsPath(process.env.STORAGE_LOCAL_PATH);
    defaultStorageProvider = new LocalStorageProvider(
      uploadDir,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/uploads` : 'http://localhost:3000/api/v1/uploads'
    );
  }

  return defaultStorageProvider;
}

export function resetStorageProvider(): void {
  defaultStorageProvider = null;
}

export const createStorageProvider = getStorageProvider;
