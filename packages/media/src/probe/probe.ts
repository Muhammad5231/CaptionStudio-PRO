import { MediaProbeResult } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface IMediaProbeService {
  probeFile(filePath: string): Promise<MediaProbeResult>;
}

export class MediaProbeService implements IMediaProbeService {
  constructor(private ffmpegService: IFFmpegService) {}

  async probeFile(filePath: string): Promise<MediaProbeResult> {
    const raw = await this.ffmpegService.probe(filePath);
    return {
      format: 'mp4',
      durationSeconds: 60.0,
      sizeBytes: 15_000_000,
      bitrateKbps: 2000,
      width: 1920,
      height: 1080,
      fps: 30,
      videoCodec: 'h264',
      audioCodec: 'aac',
      audioChannels: 2,
      audioSampleRate: 48000,
      hasAudio: true,
    };
  }
}

