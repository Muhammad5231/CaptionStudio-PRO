import { CaptionStyleTyped } from '../styles/schema';

export type EasingFunction = (t: number) => number;

/**
 * Standard deterministic easing curves
 */
export const EasingCurves: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
};

/**
 * Deterministic damped harmonic oscillator (Spring calculation)
 * Guarantees consistent frame calculation without drift or randomness.
 */
export function calculateSpring(
  tNormalized: number,
  damping = 12,
  stiffness = 150,
  mass = 1
): number {
  if (tNormalized <= 0) return 0;
  if (tNormalized >= 1) return 1;

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    // Underdamped
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * w0 * tNormalized);
    return 1 - decay * (Math.cos(wd * tNormalized) + ((zeta * w0) / wd) * Math.sin(wd * tNormalized));
  } else {
    // Overdamped or critically damped
    return 1 - (1 + w0 * tNormalized) * Math.exp(-w0 * tNormalized);
  }
}

export interface ComputedWordTransform {
  wordId: string;
  isCurrent: boolean;
  isPast: boolean;
  karaokeRatio: number; // 0.0 - 1.0
  scale: number;
  opacity: number;
  translateY: number;
  color: string;
  backgroundColor?: string;
}

export interface ComputedCaptionTransform {
  isVisible: boolean;
  opacity: number;
  scale: number;
  translateY: number;
  words: ComputedWordTransform[];
}

/**
 * Evaluates the exact frame transform for a caption at current playback time `currentTime`.
 */
export function evaluateCaptionFrame(
  caption: {
    start: number;
    end: number;
    words: Array<{ id: string; start: number; end: number; text: string }>;
  },
  currentTime: number,
  style: CaptionStyleTyped
): ComputedCaptionTransform {
  const isVisible = currentTime >= caption.start && currentTime <= caption.end;
  if (!isVisible) {
    return {
      isVisible: false,
      opacity: 0,
      scale: 1,
      translateY: 0,
      words: [],
    };
  }

  const durationMs = style.animation.durationMs || 200;
  const durationSec = durationMs / 1000;
  const elapsedFromStart = currentTime - caption.start;
  const progressIn = Math.min(1, Math.max(0, elapsedFromStart / durationSec));

  let scale = 1;
  let translateY = 0;
  let opacity = 1;

  switch (style.animation.entrance) {
    case 'pop': {
      const springVal = calculateSpring(progressIn, 14, 180, 1);
      scale = 0.7 + 0.3 * springVal;
      opacity = Math.min(1, progressIn * 2);
      break;
    }
    case 'kinetic-bounce': {
      const springVal = calculateSpring(progressIn, 10, 220, 1);
      scale = 0.8 + 0.2 * springVal;
      translateY = -8 * (1 - springVal);
      opacity = Math.min(1, progressIn * 2);
      break;
    }
    case 'elastic': {
      const elasticVal = EasingCurves.elastic(progressIn);
      scale = 0.6 + 0.4 * elasticVal;
      opacity = Math.min(1, progressIn * 3);
      break;
    }
    case 'slide-up': {
      const ease = EasingCurves.easeOutCubic(progressIn);
      translateY = 20 * (1 - ease);
      opacity = ease;
      break;
    }
    case 'slide-down': {
      const ease = EasingCurves.easeOutCubic(progressIn);
      translateY = -20 * (1 - ease);
      opacity = ease;
      break;
    }
    case 'fade': {
      opacity = EasingCurves.easeOutCubic(progressIn);
      break;
    }
    default:
      scale = 1;
      opacity = 1;
  }

  // Compute individual word transforms
  const words: ComputedWordTransform[] = caption.words.map((w) => {
    const isCurrent = currentTime >= w.start && currentTime <= w.end;
    const isPast = currentTime > w.end;

    let karaokeRatio = 0;
    if (isPast) {
      karaokeRatio = 1;
    } else if (isCurrent) {
      const wordDuration = Math.max(0.01, w.end - w.start);
      karaokeRatio = Math.max(0, Math.min(1, (currentTime - w.start) / wordDuration));
    }

    let wordScale = 1;
    let wordColor = style.fill.color;
    let wordBgColor: string | undefined = undefined;

    if (style.wordHighlight.enabled && isCurrent) {
      if (style.wordHighlight.mode === 'current-word') {
        wordColor = style.wordHighlight.color;
        wordScale = style.wordHighlight.scaleMultiplier || 1.15;
      } else if (style.wordHighlight.mode === 'karaoke-fill') {
        wordColor = style.wordHighlight.color;
        wordScale = 1.05;
      } else if (style.wordHighlight.mode === 'background') {
        wordColor = '#000000';
        wordBgColor = style.wordHighlight.color;
        wordScale = 1.05;
      }
    }

    return {
      wordId: w.id,
      isCurrent,
      isPast,
      karaokeRatio,
      scale: wordScale,
      opacity: 1,
      translateY: isCurrent && style.animation.emphasis === 'scale' ? -2 : 0,
      color: wordColor,
      backgroundColor: wordBgColor,
    };
  });

  return {
    isVisible: true,
    opacity,
    scale,
    translateY,
    words,
  };
}

