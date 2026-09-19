import path from 'node:path';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ISTTEngine, STTOptions, STTResult } from './stt.interface';

const execFileAsync = promisify(execFile);

export class WhisperEngineError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'WhisperEngineError';
  }
}

/**
 * Resolves the Python executable to invoke OpenAI Whisper
 */
function resolvePythonPath(): string {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }

  return process.platform === 'win32' ? 'python' : 'python3';
}

/**
 * Real Speech-to-Text engine using OpenAI Whisper
 */
export class WhisperEngine implements ISTTEngine {
  readonly name = 'whisper';
  private pythonPath: string;
  private bridgeScriptPath: string;

  constructor(pythonPath?: string) {
    this.pythonPath = pythonPath || resolvePythonPath();
    this.bridgeScriptPath = path.resolve(__dirname, 'whisper.bridge.py');
  }

  async transcribe(audioPath: string, options?: STTOptions): Promise<STTResult> {
    if (!fs.existsSync(audioPath)) {
      throw new WhisperEngineError(`Audio file does not exist: ${audioPath}`, 'FILE_NOT_FOUND');
    }

    const model = options?.model || process.env.WHISPER_MODEL || 'tiny';
    const language = options?.language || 'auto';
    const temperature = options?.temperature !== undefined ? String(options.temperature) : '0.0';

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
    };

    // Prepend custom ffmpeg directory if configured via environment
    if (process.env.FFMPEG_PATH) {
      const ffmpegDir = path.dirname(process.env.FFMPEG_PATH);
      const existingPath = env.PATH || env.Path || '';
      if (fs.existsSync(ffmpegDir) && !existingPath.includes(ffmpegDir)) {
        env.PATH = `${ffmpegDir}${path.delimiter}${existingPath}`;
      }
    }

    try {
      const { stdout, stderr } = await execFileAsync(
        this.pythonPath,
        [this.bridgeScriptPath, audioPath, model, language, temperature],
        {
          env,
          timeout: 600000, // 10 minutes max
          maxBuffer: 20 * 1024 * 1024,
        }
      );

      // Locate the JSON line in stdout (in case python warnings precede it)
      const lines = stdout.trim().split('\n');
      const jsonLine = lines.reverse().find((l) => l.trim().startsWith('{') && l.trim().endsWith('}'));

      if (!jsonLine) {
        throw new WhisperEngineError(
          `Whisper bridge did not return valid JSON output. Stderr: ${stderr.slice(-300)}`,
          'INVALID_OUTPUT'
        );
      }

      const parsed = JSON.parse(jsonLine.trim());

      if (parsed.error) {
        throw new WhisperEngineError(parsed.message || 'Whisper transcription failed', parsed.error);
      }

      return {
        language: parsed.language || 'en',
        duration: parsed.duration || 0.0,
        text: parsed.text || '',
        segments: parsed.segments || [],
      };
    } catch (err: unknown) {
      if (err instanceof WhisperEngineError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new WhisperEngineError(`Whisper execution failed: ${msg}`, 'EXECUTION_FAILED');
    }
  }
}

