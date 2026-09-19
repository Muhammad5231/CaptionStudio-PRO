import { CaptionStyleTyped } from '../styles/schema';

export interface ProductionTemplate {
  id: string;
  slug: string;
  name: string;
  category:
    | 'Trending'
    | 'Minimal'
    | 'Bold'
    | 'Podcast'
    | 'Gaming'
    | 'Business'
    | 'Education'
    | 'Motivation'
    | 'Shorts'
    | 'Reels'
    | 'TikTok'
    | 'Cinematic'
    | 'Karaoke'
    | 'News'
    | 'Luxury'
    | 'Dynamic';
  description: string;
  isPremium: boolean;
  previewText: string;
  previewColors: string[];
  styleConfig: CaptionStyleTyped;
}

export const PRODUCTION_TEMPLATES: ProductionTemplate[] = [
  // 1. Trending
  {
    id: 'tpl-trending-viral-pop',
    slug: 'viral-pop',
    name: 'Viral Pop',
    category: 'Trending',
    description: 'High-energy typography with bouncy pop entrance and electric yellow active words.',
    isPremium: false,
    previewText: 'THIS IS HOW YOU GO VIRAL',
    previewColors: ['#FFFFFF', '#FACC15', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Montserrat',
        fontSize: 40,
        fontWeight: 900,
        letterSpacing: 0.5,
        lineHeight: 1.15,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#000000', width: 4 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.9)', blur: 10, offsetX: 0, offsetY: 4 },
      background: { enabled: false, color: '#000000', opacity: 0.8, radius: 8, padding: 12 },
      position: { x: 50, y: 75, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'scale', exit: 'fade', durationMs: 180 },
      wordHighlight: { enabled: true, color: '#FACC15', mode: 'current-word', scaleMultiplier: 1.2 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 2. Minimal
  {
    id: 'tpl-minimal-nordic',
    slug: 'nordic-clean',
    name: 'Nordic Clean',
    category: 'Minimal',
    description: 'Elegant dark backdrop pill with crisp white typography for tech talks and tutorials.',
    isPremium: false,
    previewText: 'Simplicity is the ultimate sophistication.',
    previewColors: ['#FFFFFF', '#1E293B', '#64748B'],
    styleConfig: {
      typography: {
        fontFamily: 'Inter',
        fontSize: 26,
        fontWeight: 600,
        letterSpacing: -0.2,
        lineHeight: 1.3,
        textTransform: 'none',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      background: { enabled: true, color: '#0F172A', opacity: 0.85, radius: 10, padding: 14 },
      position: { x: 50, y: 80, anchor: 'bottom' },
      animation: { entrance: 'fade', emphasis: 'none', exit: 'fade', durationMs: 150 },
      wordHighlight: { enabled: false, color: '#FFFFFF', mode: 'current-word', scaleMultiplier: 1.0 },
      layout: { maxWidth: 80, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 3. Bold
  {
    id: 'tpl-bold-hormozi',
    slug: 'hormozi-emerald',
    name: 'Hormozi Emerald',
    category: 'Bold',
    description: 'Ultra-authoritative bold font with striking emerald green highlighting.',
    isPremium: false,
    previewText: 'MAKE OFFERS THEY CANT REFUSE',
    previewColors: ['#F8FAFC', '#10B981', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 38,
        fontWeight: 800,
        letterSpacing: 0,
        lineHeight: 1.2,
        textTransform: 'uppercase',
      },
      fill: { color: '#F8FAFC', opacity: 1 },
      stroke: { enabled: true, color: '#09090B', width: 4 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.85)', blur: 8, offsetX: 0, offsetY: 4 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 72, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'scale', exit: 'fade', durationMs: 160 },
      wordHighlight: { enabled: true, color: '#10B981', mode: 'current-word', scaleMultiplier: 1.18 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 12 },
    },
  },

  // 4. Podcast
  {
    id: 'tpl-podcast-dark',
    slug: 'podcast-studio',
    name: 'Podcast Studio',
    category: 'Podcast',
    description: 'Deep contrast layout optimized for multi-minute conversational flow.',
    isPremium: false,
    previewText: 'When you build something genuinely useful...',
    previewColors: ['#FFFFFF', '#3B82F6', '#111827'],
    styleConfig: {
      typography: {
        fontFamily: 'Inter',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: 0,
        lineHeight: 1.25,
        textTransform: 'none',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#030712', width: 2 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.7)', blur: 6, offsetX: 0, offsetY: 3 },
      background: { enabled: true, color: '#111827', opacity: 0.7, radius: 8, padding: 12 },
      position: { x: 50, y: 78, anchor: 'bottom' },
      animation: { entrance: 'slide-up', emphasis: 'none', exit: 'fade', durationMs: 200 },
      wordHighlight: { enabled: true, color: '#60A5FA', mode: 'current-word', scaleMultiplier: 1.08 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 5. Gaming
  {
    id: 'tpl-gaming-cyber',
    slug: 'cyber-neon',
    name: 'Cyber Neon',
    category: 'Gaming',
    description: 'Electric cyan and violet glow designed for Twitch clips and game highlights.',
    isPremium: true,
    previewText: 'CLUTCH ROUND 1v4 ACE!',
    previewColors: ['#06B6D4', '#8B5CF6', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Geist Mono',
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: 1,
        lineHeight: 1.2,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#06B6D4', width: 3 },
      shadow: { enabled: true, color: '#8B5CF6', blur: 16, offsetX: 0, offsetY: 0 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 70, anchor: 'center' },
      animation: { entrance: 'kinetic-bounce', emphasis: 'glow', exit: 'fade', durationMs: 220 },
      wordHighlight: { enabled: true, color: '#22D3EE', mode: 'current-word', scaleMultiplier: 1.15 },
      layout: { maxWidth: 90, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 6. Business
  {
    id: 'tpl-business-forbes',
    slug: 'forbes-exec',
    name: 'Forbes Executive',
    category: 'Business',
    description: 'Sophisticated corporate navy and gold tone for LinkedIn and executive keynotes.',
    isPremium: true,
    previewText: 'Revenue increased by 140% year-over-year.',
    previewColors: ['#F8FAFC', '#EAB308', '#0F172A'],
    styleConfig: {
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: -0.3,
        lineHeight: 1.3,
        textTransform: 'none',
      },
      fill: { color: '#F8FAFC', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: true, color: 'rgba(15,23,42,0.8)', blur: 8, offsetX: 0, offsetY: 2 },
      background: { enabled: true, color: '#0F172A', opacity: 0.9, radius: 6, padding: 12 },
      position: { x: 50, y: 82, anchor: 'bottom' },
      animation: { entrance: 'fade', emphasis: 'none', exit: 'fade', durationMs: 180 },
      wordHighlight: { enabled: true, color: '#FACC15', mode: 'current-word', scaleMultiplier: 1.05 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 8 },
    },
  },

  // 7. Education
  {
    id: 'tpl-education-marker',
    slug: 'highlighter-yellow',
    name: 'Highlighter Yellow',
    category: 'Education',
    description: 'High-retention yellow marker background highlight for explainer videos.',
    isPremium: false,
    previewText: 'The secret to cognitive learning...',
    previewColors: ['#000000', '#FDE047', '#FFFFFF'],
    styleConfig: {
      typography: {
        fontFamily: 'Poppins',
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 0,
        lineHeight: 1.25,
        textTransform: 'none',
      },
      fill: { color: '#0F172A', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
      background: { enabled: true, color: '#FEF08A', opacity: 0.95, radius: 4, padding: 10 },
      position: { x: 50, y: 76, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'scale', exit: 'fade', durationMs: 170 },
      wordHighlight: { enabled: true, color: '#E11D48', mode: 'current-word', scaleMultiplier: 1.1 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 8. Motivation
  {
    id: 'tpl-motivation-impact',
    slug: 'daily-stoic',
    name: 'Daily Stoic',
    category: 'Motivation',
    description: 'Massive condensed bold lettering for gym edits, speeches, and stoic reflections.',
    isPremium: false,
    previewText: 'DISCIPLINE CONQUERS EVERYTHING',
    previewColors: ['#FFFFFF', '#EF4444', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Anton',
        fontSize: 48,
        fontWeight: 400,
        letterSpacing: 1,
        lineHeight: 1.1,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#000000', width: 4 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.95)', blur: 12, offsetX: 0, offsetY: 6 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 70, anchor: 'center' },
      animation: { entrance: 'elastic', emphasis: 'scale', exit: 'fade', durationMs: 240 },
      wordHighlight: { enabled: true, color: '#EF4444', mode: 'current-word', scaleMultiplier: 1.25 },
      layout: { maxWidth: 90, maxLines: 2, alignment: 'center', safeArea: 12 },
    },
  },

  // 9. Shorts
  {
    id: 'tpl-shorts-punchy',
    slug: 'shorts-punchy',
    name: 'Shorts Punchy',
    category: 'Shorts',
    description: 'Rapid 1-3 word rhythmic pop optimized for 9:16 vertical shorts.',
    isPremium: false,
    previewText: 'WAIT FOR THE END',
    previewColors: ['#FFFFFF', '#22C55E', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Outfit',
        fontSize: 44,
        fontWeight: 900,
        letterSpacing: 0,
        lineHeight: 1.15,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#000000', width: 4 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.85)', blur: 8, offsetX: 0, offsetY: 4 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 72, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'scale', exit: 'fade', durationMs: 140 },
      wordHighlight: { enabled: true, color: '#4ADE80', mode: 'current-word', scaleMultiplier: 1.2 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 15 },
    },
  },

  // 10. Reels
  {
    id: 'tpl-reels-aesthetic',
    slug: 'reels-aesthetic',
    name: 'Reels Aesthetic',
    category: 'Reels',
    description: 'Clean modern typography framed for Instagram Reels safe zones.',
    isPremium: false,
    previewText: 'Moments you will remember forever.',
    previewColors: ['#F1F5F9', '#EC4899', '#0F172A'],
    styleConfig: {
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 0,
        lineHeight: 1.3,
        textTransform: 'none',
      },
      fill: { color: '#F1F5F9', opacity: 1 },
      stroke: { enabled: true, color: '#0F172A', width: 2 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 6, offsetX: 0, offsetY: 2 },
      background: { enabled: true, color: 'rgba(15,23,42,0.65)', radius: 12, padding: 14, opacity: 0.65 },
      position: { x: 50, y: 75, anchor: 'center' },
      animation: { entrance: 'slide-up', emphasis: 'none', exit: 'fade', durationMs: 180 },
      wordHighlight: { enabled: true, color: '#F472B6', mode: 'current-word', scaleMultiplier: 1.1 },
      layout: { maxWidth: 80, maxLines: 2, alignment: 'center', safeArea: 15 },
    },
  },

  // 11. TikTok
  {
    id: 'tpl-tiktok-viral',
    slug: 'tiktok-bold',
    name: 'TikTok Bold',
    category: 'TikTok',
    description: 'Built-in right margin offset ensuring zero overlap with TikTok like/share buttons.',
    isPremium: false,
    previewText: 'NO WAY THIS JUST HAPPENED',
    previewColors: ['#FFFFFF', '#06B6D4', '#000000'],
    styleConfig: {
      typography: {
        fontFamily: 'Outfit',
        fontSize: 42,
        fontWeight: 900,
        letterSpacing: 0,
        lineHeight: 1.15,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#000000', width: 4 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.9)', blur: 10, offsetX: 0, offsetY: 4 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 48, y: 68, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'scale', exit: 'fade', durationMs: 150 },
      wordHighlight: { enabled: true, color: '#38BDF8', mode: 'current-word', scaleMultiplier: 1.2 },
      layout: { maxWidth: 80, maxLines: 2, alignment: 'center', safeArea: 18 },
    },
  },

  // 12. Cinematic
  {
    id: 'tpl-cinematic-cannes',
    slug: 'cannes-film',
    name: 'Cannes Film',
    category: 'Cinematic',
    description: 'Classic serif film titles with pale gold tone and subtle cinematic shadow.',
    isPremium: true,
    previewText: 'A story written in light and shadow.',
    previewColors: ['#FEF08A', '#000000', '#D97706'],
    styleConfig: {
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: 1,
        lineHeight: 1.35,
        textTransform: 'none',
      },
      fill: { color: '#FEF08A', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.9)', blur: 8, offsetX: 0, offsetY: 2 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 85, anchor: 'bottom' },
      animation: { entrance: 'fade', emphasis: 'none', exit: 'fade', durationMs: 250 },
      wordHighlight: { enabled: false, color: '#FFFFFF', mode: 'current-word', scaleMultiplier: 1.0 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 13. Karaoke
  {
    id: 'tpl-karaoke-glow',
    slug: 'neon-karaoke',
    name: 'Neon Karaoke',
    category: 'Karaoke',
    description: 'Smooth gradient color fill as each word is sung or spoken in real-time.',
    isPremium: true,
    previewText: 'Sing every lyric with precision.',
    previewColors: ['#A855F7', '#EC4899', '#FFFFFF'],
    styleConfig: {
      typography: {
        fontFamily: 'Outfit',
        fontSize: 36,
        fontWeight: 800,
        letterSpacing: 0.5,
        lineHeight: 1.25,
        textTransform: 'none',
      },
      fill: { color: 'rgba(255,255,255,0.4)', opacity: 0.4 },
      stroke: { enabled: true, color: '#1E1B4B', width: 3 },
      shadow: { enabled: true, color: '#A855F7', blur: 14, offsetX: 0, offsetY: 0 },
      background: { enabled: true, color: '#0F172A', opacity: 0.8, radius: 10, padding: 12 },
      position: { x: 50, y: 75, anchor: 'center' },
      animation: { entrance: 'pop', emphasis: 'karaoke', exit: 'fade', durationMs: 200 },
      wordHighlight: { enabled: true, color: '#EC4899', mode: 'karaoke-fill', scaleMultiplier: 1.15 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 12 },
    },
  },

  // 14. News
  {
    id: 'tpl-news-breaking',
    slug: 'breaking-news',
    name: 'Breaking News',
    category: 'News',
    description: 'Red banner urgency with crisp white high-visibility text.',
    isPremium: false,
    previewText: 'BREAKING: GLOBAL AI SUMMIT ANNOUNCEMENT',
    previewColors: ['#FFFFFF', '#DC2626', '#111827'],
    styleConfig: {
      typography: {
        fontFamily: 'Inter',
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: -0.2,
        lineHeight: 1.2,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 4, offsetX: 0, offsetY: 2 },
      background: { enabled: true, color: '#DC2626', opacity: 0.95, radius: 4, padding: 10 },
      position: { x: 50, y: 85, anchor: 'bottom' },
      animation: { entrance: 'slide-up', emphasis: 'none', exit: 'fade', durationMs: 160 },
      wordHighlight: { enabled: true, color: '#FEF08A', mode: 'current-word', scaleMultiplier: 1.08 },
      layout: { maxWidth: 90, maxLines: 2, alignment: 'left', safeArea: 8 },
    },
  },

  // 15. Luxury
  {
    id: 'tpl-luxury-monaco',
    slug: 'monaco-gold',
    name: 'Monaco Gold',
    category: 'Luxury',
    description: 'Refined champagne gold typography with subtle dark vignette for high-end brands.',
    isPremium: true,
    previewText: 'Crafted without compromise.',
    previewColors: ['#FDE68A', '#78350F', '#0B0F19'],
    styleConfig: {
      typography: {
        fontFamily: 'Montserrat',
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: 2,
        lineHeight: 1.3,
        textTransform: 'uppercase',
      },
      fill: { color: '#FDE68A', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.85)', blur: 10, offsetX: 0, offsetY: 3 },
      background: { enabled: true, color: 'rgba(11,15,25,0.7)', radius: 6, padding: 12, opacity: 0.7 },
      position: { x: 50, y: 80, anchor: 'bottom' },
      animation: { entrance: 'fade', emphasis: 'none', exit: 'fade', durationMs: 250 },
      wordHighlight: { enabled: true, color: '#F59E0B', mode: 'current-word', scaleMultiplier: 1.05 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 10 },
    },
  },

  // 16. Dynamic
  {
    id: 'tpl-dynamic-elastic',
    slug: 'kinetic-elastic',
    name: 'Kinetic Elastic',
    category: 'Dynamic',
    description: 'Dynamic spring-physics motion curve delivering unstoppable viewer retention.',
    isPremium: false,
    previewText: 'ATTENTION SPAN OPTIMIZED',
    previewColors: ['#FFFFFF', '#6366F1', '#A855F7'],
    styleConfig: {
      typography: {
        fontFamily: 'Montserrat',
        fontSize: 42,
        fontWeight: 900,
        letterSpacing: 0.5,
        lineHeight: 1.15,
        textTransform: 'uppercase',
      },
      fill: { color: '#FFFFFF', opacity: 1 },
      stroke: { enabled: true, color: '#1E1B4B', width: 4 },
      shadow: { enabled: true, color: '#6366F1', blur: 16, offsetX: 0, offsetY: 4 },
      background: { enabled: false, color: '#000000', opacity: 0, radius: 0, padding: 0 },
      position: { x: 50, y: 72, anchor: 'center' },
      animation: { entrance: 'elastic', emphasis: 'scale', exit: 'fade', durationMs: 220 },
      wordHighlight: { enabled: true, color: '#C084FC', mode: 'current-word', scaleMultiplier: 1.22 },
      layout: { maxWidth: 85, maxLines: 2, alignment: 'center', safeArea: 12 },
    },
  },
];

/**
 * Pure template application: returns a fresh clone of template style config
 * preventing accidental global mutation.
 */
export function applyTemplate(templateIdOrSlug: string, baseStyle?: Partial<CaptionStyleTyped>): CaptionStyleTyped {
  const tpl = PRODUCTION_TEMPLATES.find((t) => t.id === templateIdOrSlug || t.slug === templateIdOrSlug);
  const base = tpl ? tpl.styleConfig : PRODUCTION_TEMPLATES[0].styleConfig;

  // Deep clone
  const cloned: CaptionStyleTyped = JSON.parse(JSON.stringify(base));

  if (baseStyle) {
    if (baseStyle.typography) Object.assign(cloned.typography, baseStyle.typography);
    if (baseStyle.fill) Object.assign(cloned.fill, baseStyle.fill);
    if (baseStyle.stroke) Object.assign(cloned.stroke, baseStyle.stroke);
    if (baseStyle.shadow) Object.assign(cloned.shadow, baseStyle.shadow);
    if (baseStyle.background) Object.assign(cloned.background, baseStyle.background);
    if (baseStyle.position) Object.assign(cloned.position, baseStyle.position);
    if (baseStyle.animation) Object.assign(cloned.animation, baseStyle.animation);
    if (baseStyle.wordHighlight) Object.assign(cloned.wordHighlight, baseStyle.wordHighlight);
    if (baseStyle.layout) Object.assign(cloned.layout, baseStyle.layout);
  }

  return cloned;
}

