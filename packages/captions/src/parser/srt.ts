import { CaptionLine, CaptionWord } from '@captionstudio/types';

/**
 * Converts timestamp string "00:01:23,456" to seconds float (83.456)
 */
export function srtTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const secMs = parts[2].split(',');
  const seconds = parseInt(secMs[0], 10) || 0;
  const ms = parseInt(secMs[1] || '0', 10) || 0;

  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

/**
 * Parses raw SRT subtitle content into structured CaptionLine[]
 */
export function parseSRT(srtContent: string): CaptionLine[] {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  const blocks = normalized.split(/\n\n+/);
  const captions: CaptionLine[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Check if line 0 is sequence number or timestamp
    let timeLineIdx = 0;
    if (/^\d+$/.test(lines[0])) {
      timeLineIdx = 1;
    }

    if (!lines[timeLineIdx]) continue;
    const timeMatch = lines[timeLineIdx].match(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/
    );

    if (!timeMatch) continue;

    const start = srtTimeToSeconds(timeMatch[1].replace('.', ','));
    const end = srtTimeToSeconds(timeMatch[2].replace('.', ','));

    const textLines = lines.slice(timeLineIdx + 1).join(' ');
    const cleanedText = textLines.replace(/<[^>]*>/g, '').trim(); // Remove HTML formatting tags

    // Generate word tokens with interpolated timecodes
    const wordsRaw = cleanedText.split(/\s+/).filter(Boolean);
    const duration = Math.max(end - start, 0.1);
    const wordDuration = duration / Math.max(wordsRaw.length, 1);

    const words: CaptionWord[] = wordsRaw.map((w, wIdx) => ({
      id: `w-${i}-${wIdx}`,
      text: w,
      start: Number((start + wIdx * wordDuration).toFixed(3)),
      end: Number((start + (wIdx + 1) * wordDuration).toFixed(3)),
    }));

    captions.push({
      id: `line-${i + 1}`,
      start,
      end,
      text: cleanedText,
      words,
    });
  }

  return captions;
}

