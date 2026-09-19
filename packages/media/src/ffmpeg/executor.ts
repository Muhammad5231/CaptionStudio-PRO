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
  getVersion(): Promise<string>;
  getFfmpegPath(): string;
  getFfprobePath(): string;
}

export class MediaProbeError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MediaProbeError';
  }
}

import path from 'node:path';

/**
 * Resolves binary path with fallback for workspace root, common Windows paths, or custom host paths
 */
function resolveBinary(configured: string | undefined, envVar: string, binaryName: string): string {
  if (configured && fs.existsSync(configured)) return configured;

  const envPath = process.env[envVar];
  if (envPath && fs.existsSync(envPath)) return envPath;

  const exeName = process.platform === 'win32' ? `${binaryName}.exe` : binaryName;

  // Check workspace root and parent directories
  const candidateDirs = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '../..'),
    path.resolve(__dirname, '../../../../'),
    path.resolve(__dirname, '../../../../../'),
  ];

  for (const dir of candidateDirs) {
    const directPath = path.resolve(dir, exeName);
    if (fs.existsSync(directPath)) return directPath;
  }

  // Check known standard installation locations on Windows
  if (process.platform === 'win32') {
    const kdenliveBin = `C:\\Program Files\\Kdenlive\\bin\\${exeName}`;
    if (fs.existsSync(kdenliveBin)) {
      return kdenliveBin;
    }
  }

  return configured || (envPath && !envPath.startsWith('/usr') ? envPath : exeName);
}

function parseFfmpegProbeOutput(output: string, filePath: string): Record<string, unknown> {
  const durationMatch = output.match(/Duration:\s*(\d+):(\d+):([\d\.]+)/);
  let duration = '0';
  if (durationMatch) {
    const hours = parseFloat(durationMatch[1]);
    const minutes = parseFloat(durationMatch[2]);
    const seconds = parseFloat(durationMatch[3]);
    duration = (hours * 3600 + minutes * 60 + seconds).toFixed(3);
  }

  const bitrateMatch = output.match(/bitrate:\s*(\d+)\s*kb\/s/);
  const bit_rate = bitrateMatch ? String(parseInt(bitrateMatch[1], 10) * 1000) : '0';

  const formatMatch = output.match(/Input #0,\s*([^,]+),/);
  const format_name = formatMatch ? formatMatch[1].trim() : 'unknown';

  let size = '0';
  try {
    size = String(fs.statSync(filePath).size);
  } catch {}

  const streams: Array<Record<string, unknown>> = [];

  const videoMatch = output.match(/Stream #\d+:\d+.*?: Video:\s*([^,\s]+).*?,\s*(\d+)x(\d+).*?,\s*([\d\.]+)\s*(?:fps|tbr)/);
  if (videoMatch) {
    streams.push({
      codec_type: 'video',
      codec_name: videoMatch[1],
      width: parseInt(videoMatch[2], 10),
      height: parseInt(videoMatch[3], 10),
      r_frame_rate: `${Math.round(parseFloat(videoMatch[4]))}/1`,
    });
  } else {
    const videoSimple = output.match(/Stream #\d+:\d+.*?: Video:\s*([^,\s]+).*?,\s*(\d+)x(\d+)/);
    if (videoSimple) {
      streams.push({
        codec_type: 'video',
        codec_name: videoSimple[1],
        width: parseInt(videoSimple[2], 10),
        height: parseInt(videoSimple[3], 10),
        r_frame_rate: '30/1',
      });
    }
  }

  const audioMatch = output.match(/Stream #\d+:\d+.*?: Audio:\s*([^,\s]+).*?,\s*(\d+)\s*Hz,\s*([^,]+)/);
  if (audioMatch) {
    const channelDesc = audioMatch[3].toLowerCase();
    const channels = channelDesc.includes('stereo') ? 2 : channelDesc.includes('mono') ? 1 : 2;
    streams.push({
      codec_type: 'audio',
      codec_name: audioMatch[1],
      sample_rate: audioMatch[2],
      channels,
    });
  }

  if (streams.length === 0) {
    throw new Error('No valid streams found in media container.');
  }

  return {
    format: {
      format_name,
      duration,
      size,
      bit_rate,
    },
    streams,
  };
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

  async getVersion(): Promise<string> {
    const { stdout } = await this.execute(['-version']);
    return stdout;
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
    // 1. Try ffprobe first
    try {
      const { stdout } = await execFileAsync(
        this.ffprobePath,
        ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath],
        { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );
      return JSON.parse(stdout);
    } catch (ffprobeErr: unknown) {
      // 2. Fallback: probe via ffmpeg -i if ffprobe executable is not available
      try {
        const probeResult = await this.probeViaFfmpeg(filePath);
        return probeResult;
      } catch {
        throw new MediaProbeError(
          `Failed to probe media file '${filePath}'. The file may be corrupted, an unsupported container, or media probe failed.`,
          ffprobeErr
        );
      }
    }
  }

  private async probeViaFfmpeg(filePath: string): Promise<Record<string, unknown>> {
    let output = '';
    try {
      const { stdout, stderr } = await execFileAsync(this.ffmpegPath, ['-i', filePath], {
        timeout: 15000,
        maxBuffer: 5 * 1024 * 1024,
      });
      output = stdout + stderr;
    } catch (err: unknown) {
      // FFmpeg exits with code 1 when no output file is given, but stderr contains full container/stream metadata
      const execErr = err as { stdout?: string; stderr?: string };
      output = (execErr.stdout || '') + (execErr.stderr || '');
    }

    if (!output || !output.includes('Input #0')) {
      throw new Error('FFmpeg probe failed to retrieve input stream metadata.');
    }

    return parseFfmpegProbeOutput(output, filePath);
  }
}
