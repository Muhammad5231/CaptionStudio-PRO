export interface MediaProbeResult {
  format: string;
  durationSeconds: number;
  sizeBytes: number;
  bitrateKbps: number;
  width?: number;
  height?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  hasAudio: boolean;
}

export interface AudioExtractionOptions {
  outputFormat: 'wav' | 'mp3' | 'aac';
  sampleRateHz: number; // e.g. 16000 for Whisper STT
  channels: 1 | 2;     // 1 for mono
  quality?: string;
}

export interface ThumbnailOptions {
  timeSeconds: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface TranscodeOptions {
  resolution: '720p' | '1080p' | '4k' | 'source';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'mov' | 'webm';
  preset?: 'fast' | 'medium' | 'slow';
  bitrateKbps?: number;
}

