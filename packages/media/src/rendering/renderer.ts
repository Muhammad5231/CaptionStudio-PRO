import { TranscodeOptions } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface IRenderingService {
  burnSubtitles(
    videoPath: string,
    subtitleAssPath: string,
    outputPath: string,
    options?: Partial<TranscodeOptions>
  ): Promise<string>;
}

export class RenderingService implements IRenderingService {
  constructor(private ffmpegService: IFFmpegService) {}

  async burnSubtitles(
    videoPath: string,
    subtitleAssPath: string,
    outputPath: string,
    options?: Partial<TranscodeOptions>
  ): Promise<string> {
    const fps = options?.fps || 30;
    const args = [
      '-y',
      '-i', videoPath,
      '-vf', `ass=${subtitleAssPath}`,
      '-r', String(fps),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '20',
      '-c:a', 'aac',
      '-b:a', '192k',
      outputPath,
    ];

    await this.ffmpegService.execute(args);
    return outputPath;
  }
}

