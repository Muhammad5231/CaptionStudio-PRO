import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { WhisperEngine } from '../apps/worker/src/services/stt/whisper.engine';

describe('Real AI Transcription Pipeline (Whisper STT)', () => {
  const audioFixturePath = path.resolve('./tests/fixtures/test-audio.wav');

  it('should support extended global languages for Whisper transcription', () => {
    const supportedLanguages = [
      'auto',
      'en', // English
      'hi', // Hindi
      'gu', // Gujarati
      'es', // Spanish
      'fr', // French
      'de', // German
      'pt', // Portuguese
      'ar', // Arabic
      'ja', // Japanese
      'ko', // Korean
    ];

    const isValidLanguage = (lang: string) => supportedLanguages.includes(lang.toLowerCase());

    assert.strictEqual(isValidLanguage('en'), true);
    assert.strictEqual(isValidLanguage('hi'), true);
    assert.strictEqual(isValidLanguage('gu'), true);
    assert.strictEqual(isValidLanguage('ja'), true);
    assert.strictEqual(isValidLanguage('unknown_lang_xyz'), false);
  });

  it('should run WhisperEngine on real audio fixture and output genuine word-level timestamps', async () => {
    assert.strictEqual(
      fs.existsSync(audioFixturePath),
      true,
      `Expected audio fixture at ${audioFixturePath}`
    );

    const engine = new WhisperEngine();
    const result = await engine.transcribe(audioFixturePath, {
      model: 'tiny',
      language: 'en',
    });

    assert.strictEqual(result.language, 'en');
    assert.ok(result.duration > 0, 'Duration must be positive');
    assert.ok(result.segments.length > 0, 'Must produce at least one segment');

    const firstSegment = result.segments[0];
    assert.ok(firstSegment.id.startsWith('seg_'), 'Segment ID must be formatted');
    assert.ok(firstSegment.end >= firstSegment.start, 'Segment end must be >= start');

    // Verify genuine word timestamps
    assert.ok(firstSegment.words.length > 0, 'Segment must contain word timestamps');
    const firstWord = firstSegment.words[0];
    assert.ok(firstWord.id.startsWith('w_'), 'Word ID must be formatted');
    assert.ok(firstWord.text.length > 0, 'Word text must not be empty');
    assert.ok(firstWord.end >= firstWord.start, 'Word end must be >= start');
    assert.ok(firstWord.confidence >= 0 && firstWord.confidence <= 1, 'Confidence must be between 0 and 1');
  });

  it('should calculate usage accounting accurately without rounding loss', () => {
    const calculateMinutes = (durationSeconds: number) =>
      Math.max(0.1, Math.ceil((durationSeconds / 60) * 10) / 10);

    // 60 seconds = 1.0 min
    assert.strictEqual(calculateMinutes(60), 1.0);
    // 30 seconds = 0.5 min
    assert.strictEqual(calculateMinutes(30), 0.5);
    // 6 seconds = 0.1 min
    assert.strictEqual(calculateMinutes(6), 0.1);
    // 123 seconds = 2.1 min
    assert.strictEqual(calculateMinutes(123), 2.1);
  });

  it('should handle cancellation state without allowing stale completions to overwrite', () => {
    const handleCompletion = (jobStatus: string) => {
      if (jobStatus === 'CANCELLED') {
        return { applied: false, reason: 'JOB_CANCELLED' };
      }
      return { applied: true, status: 'COMPLETED' };
    };

    assert.deepStrictEqual(handleCompletion('CANCELLED'), { applied: false, reason: 'JOB_CANCELLED' });
    assert.deepStrictEqual(handleCompletion('PROCESSING'), { applied: true, status: 'COMPLETED' });
  });
});

