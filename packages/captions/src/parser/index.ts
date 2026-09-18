import { CaptionLine, CaptionWord } from '@captionstudio/types';
import { parseSRT } from './srt';
import { parseVTT } from './vtt';
import { parseASS } from './ass';

export * from './srt';
export * from './vtt';
export * from './ass';

/**
 * Parses plain text transcript into synthetic caption lines (default ~4 words per line, 2.5s duration)
 */
export function parsePlainText(text: string, wordsPerLine = 4, secondsPerWord = 0.35): CaptionLine[] {
  const words = text.split(/\s+/).filter(Boolean);
  const captions: CaptionLine[] = [];
  let currentTime = 0;

  for (let i = 0; i < words.length; i += wordsPerLine) {
    const chunk = words.slice(i, i + wordsPerLine);
    const lineStart = currentTime;
    const lineDuration = chunk.length * secondsPerWord;
    const lineEnd = lineStart + lineDuration;

    const captionWords: CaptionWord[] = chunk.map((w, idx) => ({
      id: `pt-w-${i + idx}`,
      text: w,
      start: Number((lineStart + idx * secondsPerWord).toFixed(3)),
      end: Number((lineStart + (idx + 1) * secondsPerWord).toFixed(3)),
    }));

    captions.push({
      id: `pt-line-${captions.length + 1}`,
      start: Number(lineStart.toFixed(3)),
      end: Number(lineEnd.toFixed(3)),
      text: chunk.join(' '),
      words: captionWords,
    });

    currentTime = lineEnd + 0.1; // 100ms breath gap
  }

  return captions;
}

/**
 * Universal Subtitle Parser: automatically detects format or parses by specified format.
 */
export function parseSubtitles(content: string, format?: string): CaptionLine[] {
  const clean = content.trim();
  const lowerFormat = format?.toLowerCase();

  if (lowerFormat === 'json') {
    try {
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : parsed.captions || [];
    } catch {
      throw new Error('Invalid JSON subtitle format');
    }
  }

  if (lowerFormat === 'vtt' || clean.startsWith('WEBVTT')) {
    return parseVTT(clean);
  }

  if (lowerFormat === 'ass' || lowerFormat === 'ssa' || clean.includes('[Script Info]') || clean.includes('[Events]')) {
    return parseASS(clean);
  }

  if (lowerFormat === 'srt' || /^\d+\r?\n\d{2}:\d{2}:\d{2}/.test(clean)) {
    return parseSRT(clean);
  }

  // Fallback to plain text transcript parser
  return parsePlainText(clean);
}

