# Object Storage Architecture

## Storage Principles

1. **Zero Large Files in PostgreSQL**: Videos, audio streams, thumbnails, and rendered MP4 files are never stored in the relational database. Only metadata (storage keys, MIME types, byte sizes) are tracked in the database.
2. **Provider Abstraction**: All application code interacts with the `IStorageProvider` interface (`upload`, `download`, `delete`, `getSignedUploadUrl`, `getSignedDownloadUrl`), allowing seamless switching between local disk storage in development and AWS S3, Cloudflare R2, or MinIO in production.

## Storage Hierarchy

```
/users/{userId}/
  ├── avatar.webp

/workspaces/{workspaceId}/
  └── brand/
      └── logo.png

/projects/{projectId}/
  ├── source/
  │   └── original_video.mp4
  ├── audio/
  │   └── audio_16k_mono.wav
  ├── captions/
  │   └── track_en.ass
  ├── previews/
  │   └── thumbnail.webp
  └── exports/
      └── rendered_1080p_60fps.mp4
```

