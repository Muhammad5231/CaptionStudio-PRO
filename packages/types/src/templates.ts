import { CaptionStyle, CaptionAnimation } from './captions';

export enum TemplateCategoryEnum {
  TRENDING = 'TRENDING',
  MINIMAL = 'MINIMAL',
  BOLD = 'BOLD',
  PODCAST = 'PODCAST',
  GAMING = 'GAMING',
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  MOTIVATION = 'MOTIVATION',
  SHORTS = 'SHORTS',
  REELS = 'REELS',
  TIKTOK = 'TIKTOK',
  CINEMATIC = 'CINEMATIC',
  KARAOKE = 'KARAOKE',
  NEWS = 'NEWS',
  LUXURY = 'LUXURY',
  DYNAMIC = 'DYNAMIC',
}

export interface TemplateDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: TemplateCategoryEnum;
  isPremium: boolean;
  isOfficial: boolean;
  style: CaptionStyle;
  animation: CaptionAnimation;
  previewText?: string;
  previewVideoUrl?: string;
  previewThumbnailUrl?: string;
  downloadsCount: number;
  likesCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

