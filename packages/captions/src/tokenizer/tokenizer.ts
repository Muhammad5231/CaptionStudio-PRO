import { CaptionWord } from '@captionstudio/types';

export interface TokenizedWord {
  text: string;
  cleanText: string;
  punctuationPrefix: string;
  punctuationSuffix: string;
  charStart: number;
  charEnd: number;
}

/**
 * Advanced word tokenizer with punctuation separation and index mapping
 */
export function tokenizeText(text: string): TokenizedWord[] {
  const tokens: TokenizedWord[] = [];
  const regex = /(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawWord = match[0];
    const charStart = match.index;
    const charEnd = match.index + rawWord.length;

    // Separate leading/trailing punctuation (e.g. '"Hello,"' -> prefix '"', clean 'Hello', suffix ',"')
    const prefixMatch = rawWord.match(/^[^a-zA-Z0-9]+/);
    const prefix = prefixMatch ? prefixMatch[0] : '';

    const suffixMatch = rawWord.match(/[^a-zA-Z0-9]+$/);
    const suffix = suffixMatch ? suffixMatch[0] : '';

    const clean = rawWord.slice(prefix.length, rawWord.length - suffix.length);

    tokens.push({
      text: rawWord,
      cleanText: clean || rawWord,
      punctuationPrefix: prefix,
      punctuationSuffix: suffix,
      charStart,
      charEnd,
    });
  }

  return tokens;
}

/**
 * Assigns word-level timestamps to tokenized words from Whisper raw ASR segments
 */
export function alignWordsWithTiming(
  words: string[],
  segmentStart: number,
  segmentEnd: number
): CaptionWord[] {
  if (words.length === 0) return [];
  const duration = Math.max(segmentEnd - segmentStart, 0.05);
  const wordDuration = duration / words.length;

  return words.map((w, i) => ({
    id: `w-${i}-${Date.now()}`,
    text: w,
    start: Number((segmentStart + i * wordDuration).toFixed(3)),
    end: Number((segmentStart + (i + 1) * wordDuration).toFixed(3)),
  }));
}

