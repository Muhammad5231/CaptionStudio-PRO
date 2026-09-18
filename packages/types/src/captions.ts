import { z } from 'zod';

export interface CaptionWord {
  id: string;
  text: string;
  start: number; // in seconds, float with ms precision (e.g. 1.234)
  end: number;   // in seconds
  confidence?: number; // 0.0 - 1.0 from Whisper / ASR
  speaker?: string;
  highlighted?: boolean;
}

export interface CaptionLine {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  words: CaptionWord[];
  position?: {
    x: number; // percentage 0-100 or px
    y: number; // percentage 0-100 or px
  };
}

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextAlignment = 'left' | 'center' | 'right';
export type CaptionPositionPreset = 'top' | 'middle' | 'bottom' | 'custom';

export interface CaptionStyle {
  id?: string;
  fontFamily: string;
  fontSize: number; // in pt or px
  fontWeight: number | string; // 400, 600, 700, 800, 900
  color: string; // hex #FFFFFF
  backgroundColor?: string; // hex or rgba
  backgroundOpacity?: number; // 0-1
  backgroundPadding?: number;
  backgroundCornerRadius?: number;
  textTransform?: TextTransform;
  textAlign: TextAlignment;
  letterSpacing?: number;
  lineHeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  positionPreset: CaptionPositionPreset;
  customPositionY?: number; // % from top
  // Word highlighting / Karaoke styling
  activeWordColor?: string;
  activeWordBgColor?: string;
  activeWordScale?: number; // e.g. 1.15
  boxHighlightColor?: string;
}

export type AnimationType =
  | 'none'
  | 'pop'
  | 'fade'
  | 'typewriter'
  | 'slide-up'
  | 'slide-down'
  | 'kinetic-bounce'
  | 'karaoke-fill'
  | 'glow-pulse';

export interface CaptionAnimation {
  type: AnimationType;
  durationMs?: number;
  inTiming?: 'ease' | 'linear' | 'spring';
  staggerWords?: boolean;
}

export interface CaptionTrack {
  id: string;
  projectId: string;
  language: string;
  isOriginal: boolean;
  captions: CaptionLine[];
  defaultStyle: CaptionStyle;
  animation: CaptionAnimation;
  createdAt: Date;
  updatedAt: Date;
}

export type CaptionExportFormat = 'srt' | 'vtt' | 'ass' | 'txt' | 'json';

export const SubtitleImportSchema = z.object({
  format: z.enum(['srt', 'vtt', 'ass', 'ssa', 'txt', 'json']),
  content: z.string().min(1, 'Subtitle content cannot be empty'),
  targetLanguage: z.string().default('en'),
});

export type SubtitleImportDto = z.infer<typeof SubtitleImportSchema>;

