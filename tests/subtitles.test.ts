import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSRT, parseVTT, parseASS } from '../packages/captions/src/index';

describe('Subtitle File Import & Normalization', () => {
  it('should parse and normalize standard SRT file content', () => {
    const srtData = `1
00:00:01,000 --> 00:00:04,000
Welcome to CaptionStudio PRO.

2
00:00:04,500 --> 00:00:08,000
Create video subtitles with word-level animations.
`;
    const lines = parseSRT(srtData);

    assert.strictEqual(lines.length, 2);
    assert.strictEqual(lines[0]?.text, 'Welcome to CaptionStudio PRO.');
    assert.strictEqual(lines[0]?.start, 1);
    assert.strictEqual(lines[0]?.end, 4);

    assert.strictEqual(lines[1]?.text, 'Create video subtitles with word-level animations.');
    assert.strictEqual(lines[1]?.start, 4.5);
    assert.strictEqual(lines[1]?.end, 8);
  });

  it('should parse and normalize WebVTT file content', () => {
    const vttData = `WEBVTT

00:01.000 --> 00:03.500
This is a WebVTT test cue.

00:04.000 --> 00:07.000
Second cue with clean timing.
`;
    const lines = parseVTT(vttData);

    assert.strictEqual(lines.length, 2);
    assert.strictEqual(lines[0]?.text, 'This is a WebVTT test cue.');
    assert.strictEqual(lines[0]?.start, 1);
    assert.strictEqual(lines[0]?.end, 3.5);
  });

  it('should parse and normalize ASS file content', () => {
    const assData = `[Script Info]
Title: Test
ScriptType: v4.00+

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Advanced SubStation Alpha line.
`;
    const lines = parseASS(assData);

    assert.strictEqual(lines.length, 1);
    assert.strictEqual(lines[0]?.text, 'Advanced SubStation Alpha line.');
    assert.strictEqual(lines[0]?.start, 1);
    assert.strictEqual(lines[0]?.end, 4);
  });
});
