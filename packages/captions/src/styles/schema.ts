import { z } from 'zod';

export const TypographySchema = z.object({
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(12).max(120).default(36),
  fontWeight: z.union([z.number(), z.string()]).default(800),
  letterSpacing: z.number().default(0),
  lineHeight: z.number().default(1.2),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('uppercase'),
});

export const FillSchema = z.object({
  color: z.string().default('#FFFFFF'),
  opacity: z.number().min(0).max(1).default(1),
});

export const StrokeSchema = z.object({
  enabled: z.boolean().default(true),
  color: z.string().default('#000000'),
  width: z.number().min(0).max(20).default(3),
});

export const ShadowSchema = z.object({
  enabled: z.boolean().default(true),
  color: z.string().default('rgba(0, 0, 0, 0.8)'),
  blur: z.number().min(0).max(50).default(8),
  offsetX: z.number().default(0),
  offsetY: z.number().default(4),
});

export const BackgroundSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().default('#111827'),
  opacity: z.number().min(0).max(1).default(0.8),
  radius: z.number().min(0).max(50).default(8),
  padding: z.number().min(0).max(50).default(12),
});

export const PositionSchema = z.object({
  x: z.number().default(50), // percentage
  y: z.number().default(75), // percentage from top
  anchor: z.enum(['top', 'center', 'bottom']).default('bottom'),
});

export const AnimationConfigSchema = z.object({
  entrance: z.enum(['none', 'pop', 'fade', 'slide-up', 'slide-down', 'kinetic-bounce', 'elastic']).default('pop'),
  emphasis: z.enum(['none', 'scale', 'glow', 'karaoke', 'shake']).default('scale'),
  exit: z.enum(['none', 'fade']).default('fade'),
  durationMs: z.number().min(50).max(2000).default(200),
});

export const WordHighlightSchema = z.object({
  enabled: z.boolean().default(true),
  color: z.string().default('#FACC15'), // Vibrant yellow
  mode: z.enum(['current-word', 'karaoke-fill', 'scale', 'background']).default('current-word'),
  scaleMultiplier: z.number().min(1).max(2).default(1.15),
  backgroundColor: z.string().optional(),
});

export const LayoutSchema = z.object({
  maxWidth: z.number().min(20).max(100).default(85), // % of canvas
  maxLines: z.number().min(1).max(5).default(2),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  safeArea: z.number().default(10), // % margin
});

export const CaptionStyleSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  typography: TypographySchema.default({}),
  fill: FillSchema.default({}),
  stroke: StrokeSchema.default({}),
  shadow: ShadowSchema.default({}),
  background: BackgroundSchema.default({}),
  position: PositionSchema.default({}),
  animation: AnimationConfigSchema.default({}),
  wordHighlight: WordHighlightSchema.default({}),
  layout: LayoutSchema.default({}),
});

export type CaptionStyleTyped = z.infer<typeof CaptionStyleSchema>;

