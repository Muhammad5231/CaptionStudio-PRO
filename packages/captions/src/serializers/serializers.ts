import { CaptionLine, CaptionStyle } from '@captionstudio/types';
import { formatSRTTime, formatVTTTime, formatASSTime } from '../timing/timing';

/**
 * Serializes CaptionLine[] into valid standard SRT format string
 */
export function serializeToSRT(lines: CaptionLine[]): string {
  return lines
    .map((line, idx) => {
      const start = formatSRTTime(line.start);
      const end = formatSRTTime(line.end);
      return `${idx + 1}\n${start} --> ${end}\n${line.text.trim()}\n`;
    })
    .join('\n');
}

/**
 * Serializes CaptionLine[] into valid standard WebVTT format string
 */
export function serializeToVTT(lines: CaptionLine[]): string {
  const header = 'WEBVTT\n\n';
  const body = lines
    .map((line, idx) => {
      const start = formatVTTTime(line.start);
      const end = formatVTTTime(line.end);
      return `${idx + 1}\n${start} --> ${end}\n${line.text.trim()}\n`;
    })
    .join('\n');

  return header + body;
}

/**
 * Serializes CaptionLine[] into valid ASS (Advanced SubStation Alpha v4.00+) format
 */
export function serializeToASS(lines: CaptionLine[], style?: Partial<CaptionStyle>): string {
  const fontName = style?.fontFamily || 'Arial';
  const fontSize = style?.fontSize || 24;

  const header = `[Script Info]
Title: CaptionStudio PRO Export
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = lines
    .map((line) => {
      const start = formatASSTime(line.start);
      const end = formatASSTime(line.end);
      // Clean special ASS characters
      const cleanText = line.text.replace(/[\r\n]+/g, ' ').trim();
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${cleanText}`;
    })
    .join('\n');

  return header + events + '\n';
}

/**
 * Serializes CaptionLine[] to plain transcript text
 */
export function serializeToPlainText(lines: CaptionLine[]): string {
  return lines.map((l) => l.text.trim()).join(' ');
}

