import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface FFmpegCommandOptions {
  ffmpegPath?: string;
  ffprobePath?: string;
  timeoutMs?: number;
}

export interface IFFmpegService {
  execute(args: string[], onProgress?: (percent: number) => void): Promise<{ stdout: string; stderr: string }>;
  probe(filePath: string): Promise<Record<string, unknown>>;
  getFfmpegPath(): string;
  getFfprobePath(): string;
}

export class MediaProbeError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MediaProbeError';
  }
}

/**
 * Resolves binary path with fallback for common Windows or custom host paths
 */
function resolveBinary(configured: string | undefined, envVar: string, binaryName: string): string {
  if (configured) return configured;
  if (process.env[envVar]) return process.env[envVar]!;

  // Check known standard installation locations on Windows
  if (process.platform === 'win32') {
    const kdenliveBin = `C:\\Program Files\\Kdenlive\\bin\\${binaryName}.exe`;
    if (fs.existsSync(kdenliveBin)) {
      return kdenliveBin;
    }
  }

  return binaryName;
}

/**
 * FFmpeg Command Builder and abstraction
 * Ensures FFmpeg commands are executed safely via execFile (avoiding shell injection)
 */
export class FFmpegService implements IFFmpegService {
  private ffmpegPath: string;
  private ffprobePath: string;
  private timeoutMs: number;

  constructor(options?: FFmpegCommandOptions) {
    this.ffmpegPath = resolveBinary(options?.ffmpegPath, 'FFMPEG_PATH', 'ffmpeg');
    this.ffprobePath = resolveBinary(options?.ffprobePath, 'FFPROBE_PATH', 'ffprobe');
    this.timeoutMs = options?.timeoutMs || 300000; // 5 min default
  }

  getFfmpegPath(): string {
    return this.ffmpegPath;
  }

  getFfprobePath(): string {
    return this.ffprobePath;
  }

  async execute(args: string[], _onProgress?: (percent: number) => void): Promise<{ stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await execFileAsync(this.ffmpegPath, args, {
        timeout: this.timeoutMs,
        maxBuffer: 20 * 1024 * 1024,
      });
      return { stdout, stderr };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`FFmpeg execution failed (${this.ffmpegPath} ${args.slice(0, 3).join(' ')}...): ${msg}`);
    }
  }

  async probe(filePath: string): Promise<Record<string, unknown>> {
    try {
      const { stdout } = await execFileAsync(
        this.ffprobePath,
        ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath],
        { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );
      return JSON.parse(stdout);
    } catch (err: unknown) {
      throw new MediaProbeError(
        `Failed to probe media file '${filePath}'. The file may be corrupted, an unsupported container, or ffprobe execution failed.`,
        err
      );
    }
  }
}
