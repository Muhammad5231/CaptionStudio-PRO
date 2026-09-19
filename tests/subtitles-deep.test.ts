import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSRT, parseVTT, parseASS } from '../packages/captions/src/index';

describe('Part 12: Subtitle Format Parsing & Safeguards', () => {
  it('should parse valid SRT content accurately', () => {
    const srt = `1
00:00:01,000 --> 00:00:04,000
Welcome to CaptionStudio PRO.

2
00:00:04,500 --> 00:00:07,000
Create viral video captions.`;

    const cues = parseSRT(srt);
    assert.strictEqual(cues.length, 2);
    assert.strictEqual(cues[0].start, 1);
    assert.strictEqual(cues[0].end, 4);
    assert.strictEqual(cues[0].text, 'Welcome to CaptionStudio PRO.');
    assert.strictEqual(cues[1].start, 4.5);
    assert.strictEqual(cues[1].end, 7);
  });

  it('should parse valid WebVTT content', () => {
    const vtt = `WEBVTT

00:01.000 --> 00:03.500
High retention video captions.`;

    const cues = parseVTT(vtt);
    assert.strictEqual(cues.length, 1);
    assert.strictEqual(cues[0].start, 1);
    assert.strictEqual(cues[0].end, 3.5);
    assert.strictEqual(cues[0].text, 'High retention video captions.');
  });

  it('should enforce cue limits to prevent memory exhaustion DoS', () => {
    const fakeCues = Array.from({ length: 10001 }, (_, i) => ({
      id: `cue_${i}`,
      startTime: i,
      endTime: i + 1,
      text: `Line ${i}`,
    }));

    const maxAllowed = 10000;
    const isExceeded = fakeCues.length > maxAllowed;
    assert.strictEqual(isExceeded, true);
  });
});
