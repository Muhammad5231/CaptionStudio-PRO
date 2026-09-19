import { ThumbnailOptions } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface IThumbnailService {
  generateThumbnail(inputVideoPath: string, outputImagePath: string, options?: Partial<ThumbnailOptions>): Promise<string>;
}

export class ThumbnailService implements IThumbnailService {
  constructor(private ffmpegService: IFFmpegService) {}

  async generateThumbnail(
    inputVideoPath: string,
    outputImagePath: string,
    options?: Partial<ThumbnailOptions>
  ): Promise<string> {
    const time = options?.timeSeconds || 1.0;
    const width = options?.width || 640;

    const args = [
      '-y',
      '-ss', String(time),
      '-i', inputVideoPath,
      '-vframes', '1',
      '-vf', `scale=${width}:-1`,
      outputImagePath,
    ];

    await this.ffmpegService.execute(args);
    return outputImagePath;
  }
}

export { ThumbnailService as ThumbnailGeneratorService };
