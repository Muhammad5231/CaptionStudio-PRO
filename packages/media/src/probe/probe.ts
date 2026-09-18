import { MediaProbeResult } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface IMediaProbeService {
  probeFile(filePath: string): Promise<MediaProbeResult>;
}

export class MediaProbeService implements IMediaProbeService {
  constructor(private ffmpegService: IFFmpegService) {}

  async probeFile(filePath: string): Promise<MediaProbeResult> {
    const raw = (await this.ffmpegService.probe(filePath)) as {
      format?: {
        format_name?: string;
        duration?: string;
        size?: string;
        bit_rate?: string;
      };
      streams?: Array<{
        codec_type?: string;
        codec_name?: string;
        width?: number;
        height?: number;
        r_frame_rate?: string;
        channels?: number;
        sample_rate?: string;
      }>;
    };

    const videoStream = raw.streams?.find((s) => s.codec_type === 'video');
    const audioStream = raw.streams?.find((s) => s.codec_type === 'audio');

    if (!videoStream) {
      throw new Error('Invalid media: No video stream detected in container.');
    }

    if (!videoStream.width || !videoStream.height) {
      throw new Error('Invalid media: Video stream missing valid width or height dimensions.');
    }

    let fps = 30;
    if (videoStream?.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      if (num && den && den > 0) fps = Math.round(num / den);
    }

    const durationRaw = raw.format?.duration || (videoStream as { duration?: string }).duration;
    if (!durationRaw || isNaN(parseFloat(durationRaw)) || parseFloat(durationRaw) <= 0) {
      throw new Error('Invalid media: Media container missing valid duration.');
    }
    const durationSeconds = parseFloat(durationRaw);

    const sizeBytes = raw.format?.size ? parseInt(raw.format.size, 10) : 0;
    const bitrateKbps = raw.format?.bit_rate ? Math.round(parseInt(raw.format.bit_rate, 10) / 1000) : 0;

    return {
      format: raw.format?.format_name?.split(',')[0] || 'unknown',
      durationSeconds,
      sizeBytes,
      bitrateKbps,
      width: videoStream.width,
      height: videoStream.height,
      fps: fps || 30,
      videoCodec: videoStream.codec_name || 'unknown',
      audioCodec: audioStream?.codec_name || 'none',
      audioChannels: audioStream?.channels || 0,
      audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate, 10) : 0,
      hasAudio: Boolean(audioStream),
    };
  }
}

