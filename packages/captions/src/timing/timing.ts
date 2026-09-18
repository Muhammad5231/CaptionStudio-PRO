import { CaptionLine } from '@captionstudio/types';

/**
 * Format seconds float (e.g. 83.456) to standard SRT timecode (00:01:23,456)
 */
export function formatSRTTime(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec - Math.floor(safeSec)) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

/**
 * Format seconds float to standard WebVTT timecode (00:01:23.456)
 */
export function formatVTTTime(seconds: number): string {
  return formatSRTTime(seconds).replace(',', '.');
}

/**
 * Format seconds float to ASS timecode (0:01:23.45)
 */
export function formatASSTime(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const cs = Math.floor(((safeSec - Math.floor(safeSec)) * 100));

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${hrs}:${pad(mins)}:${pad(secs)}.${pad(cs, 2)}`;
}

/**
 * Shifts all caption lines and words by an offset in seconds (+/-)
 */
export function shiftCaptions(lines: CaptionLine[], offsetSeconds: number): CaptionLine[] {
  return lines.map((line) => {
    const newStart = Math.max(0, line.start + offsetSeconds);
    const newEnd = Math.max(newStart + 0.1, line.end + offsetSeconds);

    return {
      ...line,
      start: Number(newStart.toFixed(3)),
      end: Number(newEnd.toFixed(3)),
      words: line.words.map((w) => ({
        ...w,
        start: Math.max(0, Number((w.start + offsetSeconds).toFixed(3))),
        end: Math.max(0.05, Number((w.end + offsetSeconds).toFixed(3))),
      })),
    };
  });
}

