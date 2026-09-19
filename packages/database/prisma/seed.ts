import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, PlanTier, UserRole, UserStatus, WorkspaceRole, ProjectStatus, UsageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CaptionStudio PRO Database Seeding...');

  // 1. Seed Plans
  console.log('Creating Subscription Plans...');
  const plansData = [
    {
      tier: PlanTier.FREE,
      name: 'Free Starter',
      description: 'Ideal for trying out AI captions with watermarked exports.',
      monthlyPriceCents: 0,
      yearlyPriceCents: 0,
      maxProjects: 3,
      monthlyTranscribeMins: 15,
      monthlyRenderMins: 15,
      storageLimitBytes: BigInt(1024 * 1024 * 1024), // 1GB
      maxExportsPerMonth: 5,
      allow4kExport: false,
      allow60Fps: false,
      allowCustomFonts: false,
      allowTeamCollaboration: false,
      hasWatermark: true,
    },
    {
      tier: PlanTier.CREATOR,
      name: 'Creator',
      description: 'Perfect for individual content creators posting to Shorts, Reels & TikTok.',
      monthlyPriceCents: 1900, // $19/mo
      yearlyPriceCents: 18000, // $180/yr ($15/mo)
      maxProjects: 20,
      monthlyTranscribeMins: 120,
      monthlyRenderMins: 120,
      storageLimitBytes: BigInt(25 * 1024 * 1024 * 1024), // 25GB
      maxExportsPerMonth: 50,
      allow4kExport: false,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: false,
      hasWatermark: false,
    },
    {
      tier: PlanTier.PRO,
      name: 'Pro Studio',
      description: 'For power creators and video editors needing 4K and full brand kit tools.',
      monthlyPriceCents: 3900, // $39/mo
      yearlyPriceCents: 37200, // $372/yr ($31/mo)
      maxProjects: 100,
      monthlyTranscribeMins: 500,
      monthlyRenderMins: 500,
      storageLimitBytes: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      maxExportsPerMonth: 300,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      hasWatermark: false,
    },
    {
      tier: PlanTier.BUSINESS,
      name: 'Agency & Enterprise',
      description: 'Scale caption production across large teams with priority processing.',
      monthlyPriceCents: 9900, // $99/mo
      yearlyPriceCents: 95000, // $950/yr
      maxProjects: 1000,
      monthlyTranscribeMins: 2000,
      monthlyRenderMins: 2000,
      storageLimitBytes: BigInt(500 * 1024 * 1024 * 1024), // 500GB
      maxExportsPerMonth: 1000,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      hasWatermark: false,
    },
  ];

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  // 2. Seed Template Categories
  console.log('Creating Template Categories...');
  const categories = [
    { slug: 'trending', name: 'Trending', description: 'Viral social media caption styles' },
    { slug: 'minimal', name: 'Minimal', description: 'Clean, elegant, distraction-free subtitles' },
    { slug: 'bold', name: 'Bold & Punchy', description: 'Heavy typography with high contrast' },
    { slug: 'podcast', name: 'Podcast & Interview', description: 'Speaker-differentiated captions for talking heads' },
    { slug: 'gaming', name: 'Gaming & Streamer', description: 'Energetic animations, neon highlights' },
    { slug: 'business', name: 'Business & SaaS', description: 'Polished corporate presentation titles' },
    { slug: 'education', name: 'Education & Tutorials', description: 'Highlighted keywords and structured breakdown' },
    { slug: 'motivation', name: 'Motivation & Fitness', description: 'Dynamic kinetic text with word-by-word pulse' },
    { slug: 'shorts', name: 'Shorts / Reels / TikTok', description: 'Vertical 9:16 optimized center-aligned stacks' },
    { slug: 'cinematic', name: 'Cinematic', description: 'Letterboxed subtitles with classic golden font' },
    { slug: 'karaoke', name: 'Karaoke Fill', description: 'Smooth word color fill timed to speech' },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const created = await prisma.templateCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 3. Seed Realistic Templates
  console.log('Creating Realistic Templates...');
  const templates = [
    {
      slug: 'beast-mode-yellow',
      name: 'Beast Kinetic Yellow',
      description: 'High-contrast bold font with bright yellow active word highlights and kinetic pop animation.',
      categorySlug: 'trending',
      isPremium: false,
      previewText: 'THIS IS HOW YOU HOOK VIEWERS IN 2 SECONDS!',
      tags: ['viral', 'shorts', 'youtube', 'bold'],
      styleConfig: {
        fontFamily: 'Montserrat',
        fontSize: 38,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        strokeColor: '#000000',
        strokeWidth: 4,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 8,
        positionPreset: 'middle',
        activeWordColor: '#FACC15', // Bright yellow
        activeWordScale: 1.18,
      },
      animationConfig: {
        type: 'pop',
        durationMs: 180,
        inTiming: 'spring',
        staggerWords: true,
      },
    },
    {
      slug: 'minimal-editorial',
      name: 'Nordic Clean Subtitle',
      description: 'Ultra-clean sans-serif subtitle with subtle semi-transparent dark backing bar.',
      categorySlug: 'minimal',
      isPremium: false,
      previewText: 'Good design is as little design as possible.',
      tags: ['documentary', 'minimal', 'clean', 'subtle'],
      styleConfig: {
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: '500',
        color: '#F8FAFC',
        backgroundColor: 'rgba(9, 9, 11, 0.75)',
        backgroundPadding: 10,
        backgroundCornerRadius: 6,
        textTransform: 'none',
        textAlign: 'center',
        positionPreset: 'bottom',
        activeWordColor: '#FFFFFF',
      },
      animationConfig: {
        type: 'fade',
        durationMs: 150,
      },
    },
    {
      slug: 'podcast-karaoke-green',
      name: 'Hormozi Emerald Karaoke',
      description: 'Word-by-word emerald green fill with rounded background chip and bounce pulse.',
      categorySlug: 'podcast',
      isPremium: true,
      previewText: 'If you want to scale to eight figures, pay attention.',
      tags: ['podcast', 'business', 'talking-head', 'hormozi'],
      styleConfig: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 32,
        fontWeight: '800',
        color: '#E2E8F0',
        strokeColor: '#0F172A',
        strokeWidth: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
        positionPreset: 'middle',
        activeWordColor: '#10B981', // Emerald green
        activeWordBgColor: 'rgba(16, 185, 129, 0.18)',
        activeWordScale: 1.15,
      },
      animationConfig: {
        type: 'kinetic-bounce',
        durationMs: 220,
        staggerWords: true,
      },
    },
    {
      slug: 'cinematic-classic-gold',
      name: 'Cannes Classic Cinema',
      description: 'Timeless movie style serif subtitle with subtle drop shadow.',
      categorySlug: 'cinematic',
      isPremium: false,
      previewText: 'In the end, we only regret the chances we did not take.',
      tags: ['cinematic', 'film', 'classic', 'yellow'],
      styleConfig: {
        fontFamily: 'Playfair Display',
        fontSize: 26,
        fontWeight: '600',
        color: '#FEF08A', // Classic gold
        shadowColor: '#000000',
        shadowBlur: 6,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        textAlign: 'center',
        positionPreset: 'bottom',
      },
      animationConfig: {
        type: 'fade',
        durationMs: 200,
      },
    },
    {
      slug: 'cyber-neon-violet',
      name: 'Neon Cyber Pulse',
      description: 'Electric violet neon glow tailored for gaming highlights and tech podcasts.',
      categorySlug: 'gaming',
      isPremium: true,
      previewText: 'INSANE 1v5 CLUTCH WITH ZERO SECONDS LEFT!',
      tags: ['gaming', 'neon', 'streamer', 'twitch'],
      styleConfig: {
        fontFamily: 'Geist Mono',
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        strokeColor: '#7C3AED',
        strokeWidth: 3,
        shadowColor: '#8B5CF6',
        shadowBlur: 14,
        positionPreset: 'middle',
        activeWordColor: '#A78BFA',
        activeWordScale: 1.12,
      },
      animationConfig: {
        type: 'glow-pulse',
        durationMs: 250,
      },
    },
    {
      slug: 'corporate-executive',
      name: 'Executive Studio White',
      description: 'Prestigious corporate aesthetic designed for keynote speeches and company updates.',
      categorySlug: 'business',
      isPremium: false,
      previewText: 'Revenue grew forty percent year over year across all regions.',
      tags: ['corporate', 'conference', 'presentation', 'clean'],
      styleConfig: {
        fontFamily: 'Geist',
        fontSize: 24,
        fontWeight: '600',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        backgroundPadding: 12,
        backgroundCornerRadius: 8,
        textAlign: 'center',
        positionPreset: 'bottom',
      },
      animationConfig: {
        type: 'slide-up',
        durationMs: 180,
      },
    },
  ];

  for (const t of templates) {
    const catId = categoryMap.get(t.categorySlug);
    if (!catId) continue;
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        categoryId: catId,
        isPremium: t.isPremium,
        previewText: t.previewText,
        tags: t.tags,
        styleConfig: t.styleConfig,
        animationConfig: t.animationConfig,
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        categoryId: catId,
        isPremium: t.isPremium,
        previewText: t.previewText,
        tags: t.tags,
        styleConfig: t.styleConfig,
        animationConfig: t.animationConfig,
      },
    });
  }

  // 4. Optional: Seed initial system administrator only if explicitly requested
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPasswordHash = process.env.SEED_ADMIN_PASSWORD_HASH;

  if (adminEmail && adminPasswordHash) {
    console.log(`Creating initial system administrator: ${adminEmail}...`);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: adminEmail,
        name: process.env.SEED_ADMIN_NAME || 'System Administrator',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
    });
  }

  console.log('✅ CaptionStudio PRO System Database Seeding Completed Successfully! (Zero fake data seeded)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

