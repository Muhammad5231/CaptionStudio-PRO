import { Router } from 'express';
import { prisma } from '@captionstudio/database';

export const templatesRouter = Router();

/**
 * GET /api/v1/templates
 * Retrieves published video caption templates from database.
 */
templatesRouter.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where: any = { isPublished: true };

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = {
        OR: [
          { slug: category.toLowerCase() },
          { name: category },
        ],
      };
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { downloadsCount: 'desc' },
    });

    res.json({
      success: true,
      data: templates.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        category: t.category.name,
        categorySlug: t.category.slug,
        isPremium: t.isPremium,
        previewText: t.previewText,
        previewThumbnailUrl: t.previewThumbnailUrl,
        previewVideoUrl: t.previewVideoUrl,
        styleConfig: t.styleConfig,
        animationConfig: t.animationConfig,
        tags: t.tags,
        downloadsCount: t.downloadsCount,
        likesCount: t.likesCount,
        createdAt: t.createdAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/templates/:slug
 * Retrieves specific template with full styleConfig and animationConfig JSON payloads.
 */
templatesRouter.get('/:slug', async (req, res, next) => {
  try {
    const tpl = await prisma.template.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
      },
    });

    if (!tpl) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Template with slug "${req.params.slug}" not found.`, statusCode: 404 },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: {
        id: tpl.id,
        slug: tpl.slug,
        name: tpl.name,
        description: tpl.description,
        category: tpl.category.name,
        categorySlug: tpl.category.slug,
        isPremium: tpl.isPremium,
        previewText: tpl.previewText,
        previewThumbnailUrl: tpl.previewThumbnailUrl,
        previewVideoUrl: tpl.previewVideoUrl,
        styleConfig: tpl.styleConfig,
        animationConfig: tpl.animationConfig,
        tags: tpl.tags,
        downloadsCount: tpl.downloadsCount,
        likesCount: tpl.likesCount,
        createdAt: tpl.createdAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
