import { CaptionLine, CaptionWord } from '@captionstudio/types';
import { srtTimeToSeconds } from './srt';

export function parseVTT(vttContent: string): CaptionLine[] {
  const normalized = vttContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized.startsWith('WEBVTT')) {
    // Attempt fallback or parse anyway
  }

  const lines = normalized.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  const captions: CaptionLine[] = [];
  let blockCounter = 0;

  for (const block of blocks) {
    const bLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (bLines.length === 0) continue;
    if (bLines[0].startsWith('WEBVTT') || bLines[0].startsWith('NOTE') || bLines[0].startsWith('STYLE')) {
      continue;
    }

    let timeLineIdx = 0;
    if (!bLines[0].includes('-->') && bLines.length > 1 && bLines[1].includes('-->')) {
      timeLineIdx = 1;
    }

    const timeMatch = bLines[timeLineIdx]?.match(
      /((?:\d{2}:)?\d{2}:\d{2}\.\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2}\.\d{3})/
    );

    if (!timeMatch) continue;

    const formatTimestamp = (ts: string) => (ts.split(':').length === 2 ? `00:${ts}` : ts);
    const start = srtTimeToSeconds(formatTimestamp(timeMatch[1]).replace('.', ','));
    const end = srtTimeToSeconds(formatTimestamp(timeMatch[2]).replace('.', ','));

    const textLines = bLines.slice(timeLineIdx + 1).join(' ');
    const cleanedText = textLines.replace(/<[^>]*>/g, '').trim();

    const wordsRaw = cleanedText.split(/\s+/).filter(Boolean);
    const duration = Math.max(end - start, 0.1);
    const wordDuration = duration / Math.max(wordsRaw.length, 1);

    const words: CaptionWord[] = wordsRaw.map((w, wIdx) => ({
      id: `w-${blockCounter}-${wIdx}`,
      text: w,
      start: Number((start + wIdx * wordDuration).toFixed(3)),
      end: Number((start + (wIdx + 1) * wordDuration).toFixed(3)),
    }));

    captions.push({
      id: `vtt-line-${++blockCounter}`,
      start,
      end,
      text: cleanedText,
      words,
    });
  }

  return captions;
}

