import { TranscodeOptions } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface ITranscodingService {
  transcode(inputPath: string, outputPath: string, options: TranscodeOptions): Promise<string>;
}

export class TranscodingService implements ITranscodingService {
  constructor(private ffmpegService: IFFmpegService) {}

  async transcode(inputPath: string, outputPath: string, options: TranscodeOptions): Promise<string> {
    const scale =
      options.resolution === '4k'
        ? 'scale=3840:2160'
        : options.resolution === '1080p'
        ? 'scale=1920:1080'
        : options.resolution === '720p'
        ? 'scale=1280:720'
        : 'null';

    const args = [
      '-y',
      '-i', inputPath,
      '-vf', scale,
      '-r', String(options.fps),
      '-c:v', 'libx264',
      outputPath,
    ];

    await this.ffmpegService.execute(args);
    return outputPath;
  }
}

