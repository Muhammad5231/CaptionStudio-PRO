import { CaptionLine, CaptionWord } from '@captionstudio/types';

export interface GroupingOptions {
  maxWordsPerLine?: number;
  maxCharsPerLine?: number;
  maxDurationSeconds?: number;
  splitOnPunctuation?: boolean;
  minGapSecondsToSplit?: number;
}

const DEFAULT_OPTIONS: Required<GroupingOptions> = {
  maxWordsPerLine: 4,
  maxCharsPerLine: 36,
  maxDurationSeconds: 3.5,
  splitOnPunctuation: true,
  minGapSecondsToSplit: 0.45,
};

/**
 * Groups a continuous stream of timed CaptionWord tokens into visually pleasing, readable subtitle lines
 */
export function groupWordsIntoLines(
  words: CaptionWord[],
  options?: GroupingOptions
): CaptionLine[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (words.length === 0) return [];

  const lines: CaptionLine[] = [];
  let currentGroup: CaptionWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = currentGroup[currentGroup.length - 1];

    let shouldBreak = false;

    if (currentGroup.length > 0) {
      // 1. Time gap split (speaker pause)
      if (word.start - prevWord.end >= opts.minGapSecondsToSplit) {
        shouldBreak = true;
      }

      // 2. Max words limit
      if (currentGroup.length >= opts.maxWordsPerLine) {
        shouldBreak = true;
      }

      // 3. Max chars limit
      const currentText = currentGroup.map((w) => w.text).join(' ');
      if (currentText.length + word.text.length + 1 > opts.maxCharsPerLine) {
        shouldBreak = true;
      }

      // 4. Max duration limit
      const currentDuration = word.end - currentGroup[0].start;
      if (currentDuration > opts.maxDurationSeconds) {
        shouldBreak = true;
      }

      // 5. Punctuation break (. ? !)
      if (opts.splitOnPunctuation && /[.?!]$/.test(prevWord.text)) {
        shouldBreak = true;
      }
    }

    if (shouldBreak && currentGroup.length > 0) {
      const lineStart = currentGroup[0].start;
      const lineEnd = currentGroup[currentGroup.length - 1].end;
      const text = currentGroup.map((w) => w.text).join(' ');

      lines.push({
        id: `line-${lines.length + 1}`,
        start: lineStart,
        end: lineEnd,
        text,
        words: [...currentGroup],
      });
      currentGroup = [];
    }

    currentGroup.push(word);
  }

  // Push remaining words
  if (currentGroup.length > 0) {
    const lineStart = currentGroup[0].start;
    const lineEnd = currentGroup[currentGroup.length - 1].end;
    const text = currentGroup.map((w) => w.text).join(' ');

    lines.push({
      id: `line-${lines.length + 1}`,
      start: lineStart,
      end: lineEnd,
      text,
      words: [...currentGroup],
    });
  }

  return lines;
}

