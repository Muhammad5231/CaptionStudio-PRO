import { CaptionLine, CaptionWord } from '@captionstudio/types';

/**
 * Parses ASS/SSA format time "1:23:45.67" into seconds
 */
export function assTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 3) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const sParts = parts[2].split('.');
  const s = parseInt(sParts[0], 10) || 0;
  const cs = parseInt(sParts[1] || '0', 10) || 0; // centiseconds (hundredths of a second)

  return h * 3600 + m * 60 + s + cs / 100;
}

export function parseASS(assContent: string): CaptionLine[] {
  const lines = assContent.split(/\r?\n/);
  const captions: CaptionLine[] = [];
  let inEvents = false;
  let counter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[Events]')) {
      inEvents = true;
      continue;
    }
    if (inEvents && trimmed.startsWith('[')) {
      inEvents = false;
      continue;
    }

    if (inEvents && trimmed.startsWith('Dialogue:')) {
      const payload = trimmed.replace(/^Dialogue:\s*/, '');
      const parts = payload.split(',');
      if (parts.length < 9) continue;

      const start = assTimeToSeconds(parts[1]);
      const end = assTimeToSeconds(parts[2]);
      // Text is all fields joined from index 9 onwards
      const rawText = parts.slice(9).join(',');
      // Strip ASS override tags like {\b1}, {\pos(x,y)}, \N (newline)
      const cleanText = rawText
        .replace(/\{[^}]+\}/g, '')
        .replace(/\\N/g, ' ')
        .replace(/\\n/g, ' ')
        .trim();

      const wordsRaw = cleanText.split(/\s+/).filter(Boolean);
      const duration = Math.max(end - start, 0.1);
      const wordDuration = duration / Math.max(wordsRaw.length, 1);

      const words: CaptionWord[] = wordsRaw.map((w, wIdx) => ({
        id: `ass-w-${counter}-${wIdx}`,
        text: w,
        start: Number((start + wIdx * wordDuration).toFixed(3)),
        end: Number((start + (wIdx + 1) * wordDuration).toFixed(3)),
      }));

      captions.push({
        id: `ass-line-${++counter}`,
        start,
        end,
        text: cleanText,
        words,
      });
    }
  }

  return captions;
}

