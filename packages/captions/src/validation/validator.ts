import { CaptionLine } from '@captionstudio/types';

export interface CaptionValidationError {
  lineIndex: number;
  code: 'NEGATIVE_TIME' | 'INVALID_DURATION' | 'OVERLAPPING_TIME' | 'EMPTY_TEXT' | 'EXCESSIVE_LENGTH';
  message: string;
}

export function validateCaptions(lines: CaptionLine[]): CaptionValidationError[] {
  const errors: CaptionValidationError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.start < 0) {
      errors.push({
        lineIndex: i,
        code: 'NEGATIVE_TIME',
        message: `Caption start time (${line.start}s) cannot be negative.`,
      });
    }

    if (line.end <= line.start) {
      errors.push({
        lineIndex: i,
        code: 'INVALID_DURATION',
        message: `Caption end time (${line.end}s) must be strictly greater than start time (${line.start}s).`,
      });
    }

    if (!line.text || line.text.trim().length === 0) {
      errors.push({
        lineIndex: i,
        code: 'EMPTY_TEXT',
        message: 'Caption text cannot be empty.',
      });
    }

    if (line.text.length > 200) {
      errors.push({
        lineIndex: i,
        code: 'EXCESSIVE_LENGTH',
        message: `Caption length (${line.text.length} chars) exceeds 200 characters limit.`,
      });
    }

    // Check overlap with previous line
    if (i > 0) {
      const prevLine = lines[i - 1];
      if (line.start < prevLine.end) {
        errors.push({
          lineIndex: i,
          code: 'OVERLAPPING_TIME',
          message: `Caption overlaps with previous caption by ${(prevLine.end - line.start).toFixed(3)}s.`,
        });
      }
    }
  }

  return errors;
}

