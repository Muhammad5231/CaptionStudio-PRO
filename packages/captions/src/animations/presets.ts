import { CaptionAnimation, AnimationType } from '@captionstudio/types';

export const ANIMATION_PRESETS: Record<AnimationType, CaptionAnimation> = {
  none: {
    type: 'none',
  },
  pop: {
    type: 'pop',
    durationMs: 180,
    inTiming: 'spring',
    staggerWords: true,
  },
  fade: {
    type: 'fade',
    durationMs: 150,
    inTiming: 'ease',
  },
  typewriter: {
    type: 'typewriter',
    durationMs: 250,
    staggerWords: true,
  },
  'slide-up': {
    type: 'slide-up',
    durationMs: 200,
    inTiming: 'ease',
  },
  'slide-down': {
    type: 'slide-down',
    durationMs: 200,
    inTiming: 'ease',
  },
  'kinetic-bounce': {
    type: 'kinetic-bounce',
    durationMs: 240,
    inTiming: 'spring',
    staggerWords: true,
  },
  'karaoke-fill': {
    type: 'karaoke-fill',
    durationMs: 300,
    staggerWords: true,
  },
  'glow-pulse': {
    type: 'glow-pulse',
    durationMs: 300,
  },
};

/**
 * Helper to compute CSS animation classes or inline style transforms for React frontend
 */
export function getAnimationCss(animation: CaptionAnimation, isCurrentWord: boolean): string {
  if (!isCurrentWord) return 'transition-all duration-150';

  switch (animation.type) {
    case 'pop':
      return 'scale-115 transform transition-transform duration-150 font-bold';
    case 'kinetic-bounce':
      return 'scale-120 -translate-y-1 transform transition-all duration-150 drop-shadow-md';
    case 'glow-pulse':
      return 'brightness-125 scale-110 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)]';
    case 'slide-up':
      return 'translate-y-0 opacity-100 transition-all duration-150';
    case 'karaoke-fill':
      return 'text-emerald-400 scale-105 transition-colors duration-100';
    default:
      return 'transition-opacity duration-150';
  }
}

