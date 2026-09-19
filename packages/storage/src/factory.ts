import { IStorageProvider } from './provider.interface';
import { LocalStorageProvider } from './local.provider';
import { SupabaseStorageProvider } from './supabase.provider';
import { S3StorageProvider } from './s3.provider';

let defaultStorageProvider: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (defaultStorageProvider) {
    return defaultStorageProvider;
  }

  const driver = (process.env.STORAGE_PROVIDER || process.env.STORAGE_DRIVER || '').toLowerCase();

  // If explicitly configured as supabase or if Supabase credentials are provided without explicit local override
  if (driver === 'supabase' || (!driver && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'captionstudio-media';

    defaultStorageProvider = new SupabaseStorageProvider({
      supabaseUrl,
      serviceRoleKey,
      bucket,
    });
  } else if (driver === 's3') {
    defaultStorageProvider = new S3StorageProvider({
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      region: process.env.STORAGE_REGION || 'us-east-1',
      bucket: process.env.STORAGE_BUCKET || 'captionstudio-media',
      accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
      publicBaseUrl: process.env.STORAGE_PUBLIC_URL,
    });
  } else {
    defaultStorageProvider = new LocalStorageProvider(
      process.env.STORAGE_LOCAL_PATH || './uploads',
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/uploads` : undefined
    );
  }

  return defaultStorageProvider!;
}

export function resetStorageProvider(): void {
  defaultStorageProvider = null;
}

export const createStorageProvider = getStorageProvider;
