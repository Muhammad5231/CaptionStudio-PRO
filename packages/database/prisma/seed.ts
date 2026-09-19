import dotenv from 'dotenv';
import path from 'path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus, WorkspaceRole, ProjectStatus } from '../src/index';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await promisify(crypto.scrypt)(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  console.log('🌱 Starting CaptionStudio PRO Local SQLite Database Seeding...');

  // 1. Seed Local Development Plans
  console.log('Creating Local Development Plans...');
  const plansData = [
    {
      tier: 'FREE',
      name: 'Free Local',
      description: 'Local development plan with full feature access for testing.',
      monthlyPriceCents: 0,
      yearlyPriceCents: 0,
      maxProjects: 100,
      monthlyTranscribeMins: 999999,
      monthlyRenderMins: 999999,
      storageLimitBytes: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      maxExportsPerMonth: 999999,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      hasWatermark: false,
    },
    {
      tier: 'LOCAL',
      name: 'Local Development Studio',
      description: 'Local development plan with unlimited features enabled.',
      monthlyPriceCents: 0,
      yearlyPriceCents: 0,
      maxProjects: 100,
      monthlyTranscribeMins: 999999,
      monthlyRenderMins: 999999,
      storageLimitBytes: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      maxExportsPerMonth: 999999,
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
    { slug: 'cinematic', name: 'Cinematic', description: 'Film-grade subtitles with atmospheric styling' },
    { slug: 'gaming', name: 'Gaming', description: 'High-energy, neon animations for streams and clips' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.templateCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 3. Seed Realistic System Templates
  console.log('Creating Realistic Templates...');
  const templates = [
    {
      slug: 'viral-beast-yellow',
      name: 'Viral Beast Yellow',
      description: 'High-energy yellow text with black stroke, inspired by top YouTube creators.',
      categorySlug: 'trending',
      isPremium: false,
      previewText: 'THIS TRICK CHANGED EVERYTHING I KNEW ABOUT EDITING!',
      tags: ['youtube', 'viral', 'yellow', 'bold', 'punchy'],
      styleConfig: {
        fontFamily: 'Montserrat',
        fontSize: 32,
        fontWeight: '900',
        color: '#FFE600',
        textTransform: 'uppercase',
        textAlign: 'center',
        strokeColor: '#000000',
        strokeWidth: 4,
        shadowColor: '#000000',
        shadowBlur: 10,
        positionPreset: 'middle',
        activeWordColor: '#FFFFFF',
        activeWordBgColor: '#000000',
        activeWordScale: 1.2,
      },
      animationConfig: {
        type: 'pop-in',
        durationMs: 150,
        highlightColor: '#FFFFFF',
      },
    },
    {
      slug: 'minimal-swiss-clean',
      name: 'Swiss Clean Typography',
      description: 'Modern sans-serif text with soft translucent pill background.',
      categorySlug: 'minimal',
      isPremium: false,
      previewText: 'Simplicity is the ultimate sophistication.',
      tags: ['clean', 'aesthetic', 'minimal', 'modern'],
      styleConfig: {
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: '500',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backgroundPadding: 10,
        backgroundCornerRadius: 6,
        textAlign: 'center',
        positionPreset: 'bottom',
        activeWordColor: '#10B981',
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
        color: '#FEF08A',
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
      isPremium: false,
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
      slug: 'bold-impact-white',
      name: 'Bold Impact White',
      description: 'High-contrast white lettering with deep black drop shadow for social clips.',
      categorySlug: 'bold',
      isPremium: false,
      previewText: 'STOP WASTING HOURS MANUAL CAPTIONING VIDEOS.',
      tags: ['bold', 'tiktok', 'reels', 'impact'],
      styleConfig: {
        fontFamily: 'Impact',
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        strokeColor: '#000000',
        strokeWidth: 3,
        positionPreset: 'middle',
      },
      animationConfig: {
        type: 'pop-in',
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
        tags: JSON.stringify(t.tags),
        styleConfig: JSON.stringify(t.styleConfig),
        animationConfig: JSON.stringify(t.animationConfig),
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        categoryId: catId,
        isPremium: t.isPremium,
        previewText: t.previewText,
        tags: JSON.stringify(t.tags),
        styleConfig: JSON.stringify(t.styleConfig),
        animationConfig: JSON.stringify(t.animationConfig),
      },
    });
  }

  // 4. Seed Local Development Users (Parts 12 & 26)
  console.log('Creating Local Development Users...');

  // Admin Account (admin@gmail.com / admin123456)
  const adminPasswordHash = await hashPassword('admin123456');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@gmail.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const adminWs = await prisma.workspace.upsert({
    where: { slug: 'admin-workspace' },
    update: {},
    create: {
      name: "Admin's Workspace",
      slug: 'admin-workspace',
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: adminWs.id, userId: adminUser.id } },
    update: { role: WorkspaceRole.OWNER },
    create: {
      workspaceId: adminWs.id,
      userId: adminUser.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await prisma.brandKit.upsert({
    where: { workspaceId: adminWs.id },
    update: {},
    create: {
      workspaceId: adminWs.id,
      primaryColor: '#635BFF',
      secondaryColor: '#111827',
      accentColor: '#10B981',
      fonts: JSON.stringify(['Inter', 'Montserrat']),
    },
  });

  // Regular Creator Account (user@gmail.com / user123456)
  const userPasswordHash = await hashPassword('user123456');
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      passwordHash: userPasswordHash,
    },
    create: {
      email: 'user@gmail.com',
      name: 'Local Creator',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  const userWs = await prisma.workspace.upsert({
    where: { slug: 'creator-workspace' },
    update: {},
    create: {
      name: "Creator's Workspace",
      slug: 'creator-workspace',
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: userWs.id, userId: regularUser.id } },
    update: { role: WorkspaceRole.OWNER },
    create: {
      workspaceId: userWs.id,
      userId: regularUser.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await prisma.brandKit.upsert({
    where: { workspaceId: userWs.id },
    update: {},
    create: {
      workspaceId: userWs.id,
      primaryColor: '#8B5CF6',
      secondaryColor: '#0F172A',
      accentColor: '#F59E0B',
      fonts: JSON.stringify(['Inter', 'Playfair Display']),
    },
  });

  // 5. Seed 3 Sample Local Projects
  console.log('Creating Sample Local Projects...');
  const sampleProjects = [
    {
      name: 'YouTube Shorts - 5 Editing Hacks',
      description: 'Quick tips video with pop kinetic styling.',
      status: ProjectStatus.READY,
      durationSeconds: 45.2,
      width: 1080,
      height: 1920,
      fps: 30,
    },
    {
      name: 'Podcast Episode 12 - Highlights',
      description: 'Audiogram clip formatted for Instagram Reels.',
      status: ProjectStatus.READY,
      durationSeconds: 62.0,
      width: 1080,
      height: 1920,
      fps: 30,
    },
    {
      name: 'Product Launch Teaser 4K',
      description: 'Widescreen announcement teaser with Swiss clean subtitles.',
      status: ProjectStatus.DRAFT,
      durationSeconds: 30.5,
      width: 3840,
      height: 2160,
      fps: 60,
    },
  ];

  for (const sp of sampleProjects) {
    const existing = await prisma.project.findFirst({
      where: { workspaceId: userWs.id, name: sp.name },
    });
    if (!existing) {
      await prisma.project.create({
        data: {
          workspaceId: userWs.id,
          ...sp,
        },
      });
    }
  }

  console.log('\n✅ CaptionStudio PRO Local SQLite Database Seeding Completed Successfully!');
  console.log('------------------------------------------------------------');
  console.log('Default Accounts Created:');
  console.log('  👑 Admin: admin@gmail.com / admin123456 (Role: ADMIN)');
  console.log('  👤 User:  user@gmail.com  / user123456  (Role: USER)');
  console.log('------------------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
