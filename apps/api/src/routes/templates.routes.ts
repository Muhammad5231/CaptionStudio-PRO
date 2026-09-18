import { Router } from 'express';
import { TemplateCategoryEnum } from '@captionstudio/types';

export const templatesRouter = Router();

const mockTemplates = [
  {
    id: 'tpl-1',
    slug: 'beast-mode-yellow',
    name: 'Beast Kinetic Yellow',
    description: 'High-contrast bold font with bright yellow active word highlights and kinetic pop animation.',
    category: TemplateCategoryEnum.TRENDING,
    isPremium: false,
    previewText: 'THIS IS HOW YOU HOOK VIEWERS IN 2 SECONDS!',
    tags: ['viral', 'shorts', 'youtube', 'bold'],
    downloadsCount: 14200,
    likesCount: 3820,
  },
  {
    id: 'tpl-2',
    slug: 'nordic-clean-sub',
    name: 'Nordic Clean Subtitle',
    description: 'Ultra-clean sans-serif subtitle with subtle semi-transparent dark backing bar.',
    category: TemplateCategoryEnum.MINIMAL,
    isPremium: false,
    previewText: 'Good design is as little design as possible.',
    tags: ['documentary', 'minimal', 'clean', 'subtle'],
    downloadsCount: 8900,
    likesCount: 2150,
  },
  {
    id: 'tpl-3',
    slug: 'hormozi-emerald',
    name: 'Hormozi Emerald Karaoke',
    description: 'Word-by-word emerald green fill with rounded background chip and bounce pulse.',
    category: TemplateCategoryEnum.PODCAST,
    isPremium: true,
    previewText: 'If you want to scale to eight figures, pay attention.',
    tags: ['podcast', 'business', 'talking-head', 'hormozi'],
    downloadsCount: 22400,
    likesCount: 6510,
  },
  {
    id: 'tpl-4',
    slug: 'cannes-cinema-gold',
    name: 'Cannes Classic Cinema',
    description: 'Timeless movie style serif subtitle with subtle drop shadow.',
    category: TemplateCategoryEnum.CINEMATIC,
    isPremium: false,
    previewText: 'In the end, we only regret the chances we did not take.',
    tags: ['cinematic', 'film', 'classic', 'yellow'],
    downloadsCount: 6100,
    likesCount: 1490,
  },
  {
    id: 'tpl-5',
    slug: 'cyber-neon-violet',
    name: 'Neon Cyber Pulse',
    description: 'Electric violet neon glow tailored for gaming highlights and tech podcasts.',
    category: TemplateCategoryEnum.GAMING,
    isPremium: true,
    previewText: 'INSANE 1v5 CLUTCH WITH ZERO SECONDS LEFT!',
    tags: ['gaming', 'neon', 'streamer', 'twitch'],
    downloadsCount: 11300,
    likesCount: 3100,
  },
];

templatesRouter.get('/', (req, res) => {
  const { category, search } = req.query;
  let result = [...mockTemplates];

  if (category && typeof category === 'string' && category !== 'ALL') {
    result = result.filter((t) => t.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)));
  }

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

templatesRouter.get('/:slug', (req, res) => {
  const tpl = mockTemplates.find((t) => t.slug === req.params.slug);
  if (!tpl) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found', statusCode: 404 },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    data: tpl,
    timestamp: new Date().toISOString(),
  });
});

