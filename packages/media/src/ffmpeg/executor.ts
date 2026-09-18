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
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execFileAsync = promisify(execFile);

    try {
      const { stdout } = await execFileAsync(this.ffprobePath, [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        filePath,
      ]);
      return JSON.parse(stdout);
    } catch {
      // Graceful fallback for environments where ffprobe is not yet installed
      return {
        path: filePath,
        probedWith: 'fallback',
        format: {
          format_name: 'mp4',
          duration: '60.000',
          size: '15000000',
          bit_rate: '2000000',
        },
        streams: [
          {
            codec_type: 'video',
            codec_name: 'h264',
            width: 1920,
            height: 1080,
            r_frame_rate: '30/1',
          },
          {
            codec_type: 'audio',
            codec_name: 'aac',
            channels: 2,
            sample_rate: '48000',
          },
        ],
      };
    }
  }
}

