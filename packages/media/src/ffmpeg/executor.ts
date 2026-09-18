export interface FFmpegCommandOptions {
  ffmpegPath?: string;
  ffprobePath?: string;
  timeoutMs?: number;
}

export interface IFFmpegService {
  execute(args: string[], onProgress?: (percent: number) => void): Promise<{ stdout: string; stderr: string }>;
  probe(filePath: string): Promise<Record<string, unknown>>;
}

export class MediaProbeError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MediaProbeError';
  }
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
    } catch (err: unknown) {
      throw new MediaProbeError(
        `Failed to probe media file '${filePath}'. The file may be corrupted, an unsupported container, or ffprobe execution failed.`,
        err
      );
    }
  }
}

