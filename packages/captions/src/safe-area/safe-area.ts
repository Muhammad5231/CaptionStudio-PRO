export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export interface SafeAreaPreset {
  aspectRatio: AspectRatio;
  name: string;
  platformGuides: string;
  topPercent: number;
  bottomPercent: number;
  leftPercent: number;
  rightPercent: number;
}

export const SAFE_AREA_PRESETS: Record<AspectRatio, SafeAreaPreset> = {
  '9:16': {
    aspectRatio: '9:16',
    name: 'Vertical (9:16)',
    platformGuides: 'TikTok / Instagram Reels / YouTube Shorts',
    topPercent: 12,    // Account for top header / search
    bottomPercent: 20, // Account for bottom caption & audio title
    leftPercent: 6,
    rightPercent: 18,  // Account for right engagement buttons (Like, Share, Comment)
  },
  '16:9': {
    aspectRatio: '16:9',
    name: 'Landscape (16:9)',
    platformGuides: 'YouTube / Web Player',
    topPercent: 8,
    bottomPercent: 12, // Account for playback controls
    leftPercent: 8,
    rightPercent: 8,
  },
  '1:1': {
    aspectRatio: '1:1',
    name: 'Square (1:1)',
    platformGuides: 'Instagram Feed / LinkedIn',
    topPercent: 8,
    bottomPercent: 10,
    leftPercent: 8,
    rightPercent: 8,
  },
  '4:5': {
    aspectRatio: '4:5',
    name: 'Portrait (4:5)',
    platformGuides: 'Instagram Portrait Feed',
    topPercent: 10,
    bottomPercent: 12,
    leftPercent: 8,
    rightPercent: 8,
  },
};

/**
 * Clamps user custom positioning within the active platform safe area
 */
export function clampToSafeArea(
  xPercent: number,
  yPercent: number,
  aspectRatio: AspectRatio = '9:16'
): { x: number; y: number } {
  const safe = SAFE_AREA_PRESETS[aspectRatio] || SAFE_AREA_PRESETS['9:16'];

  const clampedX = Math.max(safe.leftPercent, Math.min(100 - safe.rightPercent, xPercent));
  const clampedY = Math.max(safe.topPercent, Math.min(100 - safe.bottomPercent, yPercent));

  return { x: clampedX, y: clampedY };
}

