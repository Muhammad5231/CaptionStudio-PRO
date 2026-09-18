import { AudioExtractionOptions } from '@captionstudio/types';
import { IFFmpegService } from '../ffmpeg/executor';

export interface IAudioExtractorService {
  extractWhisperAudio(inputVideoPath: string, outputWavPath: string, options?: Partial<AudioExtractionOptions>): Promise<string>;
}

export class AudioExtractorService implements IAudioExtractorService {
  constructor(private ffmpegService: IFFmpegService) {}

  /**
   * Generates optimal audio stream for Whisper STT:
   * 16kHz sample rate, 1 channel (mono), 16-bit PCM WAV
   */
  async extractWhisperAudio(
    inputVideoPath: string,
    outputWavPath: string,
    options?: Partial<AudioExtractionOptions>
  ): Promise<string> {
    const sampleRate = options?.sampleRateHz || 16000;
    const channels = options?.channels || 1;

    const args = [
      '-y',
      '-i', inputVideoPath,
      '-vn', // disable video
      '-acodec', 'pcm_s16le',
      '-ar', String(sampleRate),
      '-ac', String(channels),
      outputWavPath,
    ];

    await this.ffmpegService.execute(args);
    return outputWavPath;
  }
}

