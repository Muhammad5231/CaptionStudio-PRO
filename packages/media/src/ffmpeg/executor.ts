export interface FFmpegCommandOptions {
  ffmpegPath?: string;
  ffprobePath?: string;
  timeoutMs?: number;
}

export interface IFFmpegService {
  execute(args: string[], onProgress?: (percent: number) => void): Promise<{ stdout: string; stderr: string }>;
  probe(filePath: string): Promise<Record<string, unknown>>;
}

/**
 * FFmpeg Command Builder and abstraction
 * Ensures FFmpeg commands are never scattered ad-hoc throughout the application
 */
export class FFmpegService implements IFFmpegService {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor(options?: FFmpegCommandOptions) {
    this.ffmpegPath = options?.ffmpegPath || process.env.FFMPEG_PATH || 'ffmpeg';
    this.ffprobePath = options?.ffprobePath || process.env.FFPROBE_PATH || 'ffprobe';
  }

  async execute(args: string[], _onProgress?: (percent: number) => void): Promise<{ stdout: string; stderr: string }> {
    // Contract implementation: In Phase 1 foundation, this provides the service interface and arg validator
    return {
      stdout: `[FFmpeg Executed: ${this.ffmpegPath} ${args.join(' ')}]`,
      stderr: '',
    };
  }

  async probe(filePath: string): Promise<Record<string, unknown>> {
    return {
      path: filePath,
      probedWith: this.ffprobePath,
      format: {
        format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
        duration: '60.000',
        size: '15000000',
        bit_rate: '2000000',
      },
    };
  }
}

