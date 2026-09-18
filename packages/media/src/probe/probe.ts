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

    let fps = 30;
    if (videoStream?.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      if (num && den) fps = Math.round(num / den);
    }

    const durationSeconds = raw.format?.duration ? parseFloat(raw.format.duration) : 60;
    const sizeBytes = raw.format?.size ? parseInt(raw.format.size, 10) : 15_000_000;
    const bitrateKbps = raw.format?.bit_rate ? Math.round(parseInt(raw.format.bit_rate, 10) / 1000) : 2000;

    return {
      format: raw.format?.format_name?.split(',')[0] || 'mp4',
      durationSeconds,
      sizeBytes,
      bitrateKbps,
      width: videoStream?.width || 1920,
      height: videoStream?.height || 1080,
      fps,
      videoCodec: videoStream?.codec_name || 'h264',
      audioCodec: audioStream?.codec_name || 'aac',
      audioChannels: audioStream?.channels || 2,
      audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate, 10) : 48000,
      hasAudio: Boolean(audioStream),
    };
  }
}

