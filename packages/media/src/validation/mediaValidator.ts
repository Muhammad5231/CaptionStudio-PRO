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
  detectedFormat?: string;
}

/**
 * Validates the raw binary buffer header to verify container magic numbers
 * and reject executables or disguised files.
 */
export function validateContainerSignature(headerBuffer: Buffer): FileValidationResult {
  if (headerBuffer.length < 12) {
    return { valid: false, error: 'File buffer too short to determine media container header.' };
  }

  // 1. Block executables and scripts
  // Windows PE MZ header: 0x4D 0x5A ("MZ")
  if (headerBuffer[0] === 0x4d && headerBuffer[1] === 0x5a) {
    return { valid: false, error: 'Disguised executable detected (MZ header).' };
  }

  // Linux ELF: 0x7F 'E' 'L' 'F'
  if (headerBuffer[0] === 0x7f && headerBuffer[1] === 0x45 && headerBuffer[2] === 0x4c && headerBuffer[3] === 0x46) {
    return { valid: false, error: 'Disguised executable detected (ELF header).' };
  }

  // Shell script '#!' (0x23 0x21)
  if (headerBuffer[0] === 0x23 && headerBuffer[1] === 0x21) {
    return { valid: false, error: 'Disguised script file detected (shebang).' };
  }

  // 2. Check for MP4 / QuickTime: "ftyp" signature at offset 4..8
  const offset4to8 = headerBuffer.subarray(4, 8).toString('ascii');
  if (offset4to8 === 'ftyp') {
    const majorBrand = headerBuffer.subarray(8, 12).toString('ascii');
    return { valid: true, detectedFormat: `mp4 (${majorBrand.trim()})` };
  }

  // Check QuickTime (moov / wide / mdat at offset 4)
  if (['moov', 'wide', 'mdat'].includes(offset4to8)) {
    return { valid: true, detectedFormat: 'quicktime' };
  }

  // 3. Check for WebM / Matroska (EBML header: 0x1A 0x45 0xDF 0xA3)
  if (
    headerBuffer[0] === 0x1a &&
    headerBuffer[1] === 0x45 &&
    headerBuffer[2] === 0xdf &&
    headerBuffer[3] === 0xa3
  ) {
    return { valid: true, detectedFormat: 'webm/matroska' };
  }

  // 4. Check for AVI / RIFF (0x52 0x49 0x46 0x46 "RIFF" ... "AVI ")
  if (
    headerBuffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    headerBuffer.length >= 12 &&
    headerBuffer.subarray(8, 12).toString('ascii') === 'AVI '
  ) {
    return { valid: true, detectedFormat: 'avi' };
  }

  return {
    valid: false,
    error: 'Unrecognized or invalid media container signature. File does not appear to be a supported MP4, QuickTime, WebM, or MKV video.',
  };
}

/**
 * Deep stream validation on FFprobe probed streams
 */
export function validateProbedMedia(probedData: {
  format?: { duration?: string; size?: string };
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
    avg_frame_rate?: string;
  }>;
}): {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  fps?: number;
  hasAudio?: boolean;
} {
  const streams = probedData.streams || [];
  const videoStream = streams.find((s) => s.codec_type === 'video');

  if (!videoStream) {
    return { valid: false, error: 'No video stream detected in container (audio-only or empty container).' };
  }

  const width = videoStream.width || 0;
  const height = videoStream.height || 0;

  if (width <= 0 || height <= 0) {
    return { valid: false, error: `Invalid video dimensions: ${width}x${height}.` };
  }

  const durationStr = probedData.format?.duration;
  const durationSeconds = durationStr ? parseFloat(durationStr) : 0;

  if (!durationSeconds || isNaN(durationSeconds) || durationSeconds <= 0) {
    return { valid: false, error: 'Media container missing valid positive duration.' };
  }

  // Parse FPS safely
  let fps = 30;
  const fpsStr = videoStream.avg_frame_rate || videoStream.r_frame_rate;
  if (fpsStr && fpsStr.includes('/')) {
    const [num, den] = fpsStr.split('/').map(Number);
    if (den > 0 && num > 0) {
      fps = Math.round((num / den) * 100) / 100;
    }
  }

  const hasAudio = streams.some((s) => s.codec_type === 'audio');

  return {
    valid: true,
    width,
    height,
    durationSeconds,
    fps,
    hasAudio,
  };
}

export function validateVideoFile(mimeType: string, sizeBytes: number, maxSizeBytes = 500 * 1024 * 1024): FileValidationResult {
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(mimeType.toLowerCase())) {
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
