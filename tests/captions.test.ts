import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSRT, parseVTT, serializeToSRT, serializeToVTT, groupWordsIntoLines } from '../packages/captions/src/index';
import { CaptionWord } from '../packages/types/src/index';

describe('Caption Parsing & Serialization Engine', () => {
  const sampleSRT = `1
00:00:01,000 --> 00:00:03,500
Hello world, this is CaptionStudio PRO.

2
00:00:04,000 --> 00:00:06,200
Creating captions that make videos impossible to ignore.
`;

  it('should parse SRT subtitles into lines and word tokens accurately', () => {
    const lines = parseSRT(sampleSRT);
    assert.strictEqual(lines.length, 2);

    assert.strictEqual(lines[0].start, 1.0);
    assert.strictEqual(lines[0].end, 3.5);
    assert.strictEqual(lines[0].text, 'Hello world, this is CaptionStudio PRO.');
    assert.ok(lines[0].words.length > 0);

    assert.strictEqual(lines[1].start, 4.0);
    assert.strictEqual(lines[1].end, 6.2);
  });

  it('should serialize parsed captions back to valid SRT format', () => {
    const lines = parseSRT(sampleSRT);
    const serialized = serializeToSRT(lines);

    assert.ok(serialized.includes('00:00:01,000 --> 00:00:03,500'));
    assert.ok(serialized.includes('Hello world, this is CaptionStudio PRO.'));
    assert.ok(serialized.includes('00:00:04,000 --> 00:00:06,200'));
  });

  it('should group continuous stream of words into readable lines based on maxWordsPerLine', () => {
    const words: CaptionWord[] = [
      { id: '1', text: 'This', start: 0.1, end: 0.4 },
      { id: '2', text: 'is', start: 0.4, end: 0.6 },
      { id: '3', text: 'a', start: 0.6, end: 0.8 },
      { id: '4', text: 'test', start: 0.8, end: 1.1 },
      { id: '5', text: 'for', start: 1.1, end: 1.3 },
      { id: '6', text: 'retention.', start: 1.3, end: 1.8 },
    ];

    const grouped = groupWordsIntoLines(words, { maxWordsPerLine: 3 });
    assert.strictEqual(grouped.length, 2);
    assert.strictEqual(grouped[0].words.length, 3);
    assert.strictEqual(grouped[1].words.length, 3);
    assert.strictEqual(grouped[0].text, 'This is a');
    assert.strictEqual(grouped[1].text, 'test for retention.');
  });
});

