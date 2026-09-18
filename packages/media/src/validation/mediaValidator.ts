export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
  'video/avi',
];

export const ALLOWED_SUBTITLE_EXTENSIONS = ['.srt', '.vtt', '.ass', '.ssa', '.txt', '.json'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateVideoFile(mimeType: string, sizeBytes: number, maxSizeBytes = 500 * 1024 * 1024): FileValidationResult {
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported video format "${mimeType}". Allowed formats: MP4, MOV, WEBM, MKV.`,
    };
  }

  if (sizeBytes > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

