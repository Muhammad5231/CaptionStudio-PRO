export interface ApprovedFont {
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  weights: number[];
  googleFontUrl?: string;
  popularFor: string;
}

export const APPROVED_FONTS: ApprovedFont[] = [
  {
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800, 900],
    popularFor: 'Minimal, Tech, Podcast',
  },
  {
    name: 'Plus Jakarta Sans',
    family: '"Plus Jakarta Sans", sans-serif',
    category: 'sans-serif',
    weights: [600, 700, 800],
    popularFor: 'Modern SaaS, Hormozi style',
  },
  {
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    category: 'sans-serif',
    weights: [700, 800, 900],
    popularFor: 'Viral YouTube, MrBeast punchy',
  },
  {
    name: 'Outfit',
    family: 'Outfit, sans-serif',
    category: 'sans-serif',
    weights: [600, 700, 800, 900],
    popularFor: 'Trendy Shorts, TikTok',
  },
  {
    name: 'Bebas Neue',
    family: '"Bebas Neue", sans-serif',
    category: 'display',
    weights: [400],
    popularFor: 'Cinema, Sports, High Impact',
  },
  {
    name: 'Anton',
    family: 'Anton, sans-serif',
    category: 'display',
    weights: [400],
    popularFor: 'Ultra Bold, Viral hooks',
  },
  {
    name: 'Poppins',
    family: 'Poppins, sans-serif',
    category: 'sans-serif',
    weights: [600, 700, 800],
    popularFor: 'Clean Educational, Business',
  },
  {
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    weights: [500, 700, 900],
    popularFor: 'Universal, Neutral',
  },
  {
    name: 'Playfair Display',
    family: '"Playfair Display", serif',
    category: 'serif',
    weights: [600, 700],
    popularFor: 'Luxury, Storytelling, Cannes Cinema',
  },
  {
    name: 'Geist Mono',
    family: '"Geist Mono", monospace',
    category: 'monospace',
    weights: [600, 700, 800],
    popularFor: 'Coding, Cyberpunk, Gaming',
  },
];

export function isFontApproved(fontName: string): boolean {
  const clean = fontName.replace(/["']/g, '').split(',')[0].trim().toLowerCase();
  return APPROVED_FONTS.some((f) => f.name.toLowerCase() === clean);
}

