import { PlanTier, BillingQuota } from '@captionstudio/types';

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  badge?: string;
  description: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number; // per month billed annually
  quota: Omit<BillingQuota, 'transcriptionMinutesUsed' | 'renderMinutesUsed' | 'storageBytesUsed' | 'exportsUsed'>;
  features: string[];
  ctaLabel: string;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  [PlanTier.FREE]: {
    tier: PlanTier.FREE,
    name: 'Free Starter',
    description: 'Explore AI transcription and create watermarked captions.',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    quota: {
      planTier: PlanTier.FREE,
      transcriptionMinutesTotal: 15,
      renderMinutesTotal: 15,
      storageBytesTotal: 1024 * 1024 * 1024, // 1 GB
      exportsTotal: 5,
      maxProjects: 3,
      allow4kExport: false,
      allow60Fps: false,
      allowCustomFonts: false,
      allowTeamCollaboration: false,
      removeWatermark: false,
    },
    features: [
      '15 minutes AI transcription / month',
      'Export up to 720p 30 FPS',
      'Standard template library',
      '1 GB cloud storage',
      'CaptionStudio watermark',
    ],
    ctaLabel: 'Get Started Free',
  },
  [PlanTier.CREATOR]: {
    tier: PlanTier.CREATOR,
    name: 'Creator',
    badge: 'Most Popular',
    description: 'Designed for YouTubers, Reels & TikTok creators publishing weekly.',
    monthlyPriceUsd: 19,
    yearlyPriceUsd: 15, // $180/yr ($15/mo)
    quota: {
      planTier: PlanTier.CREATOR,
      transcriptionMinutesTotal: 120,
      renderMinutesTotal: 120,
      storageBytesTotal: 25 * 1024 * 1024 * 1024, // 25 GB
      exportsTotal: 50,
      maxProjects: 20,
      allow4kExport: false,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: false,
      removeWatermark: true,
    },
    features: [
      '120 minutes AI transcription / month',
      'No watermarks on exported videos',
      '1080p 60 FPS fast rendering',
      'All 50+ viral animated templates',
      'Custom font upload & brand colors',
      '25 GB cloud media storage',
    ],
    ctaLabel: 'Start Creator Plan',
  },
  [PlanTier.PRO]: {
    tier: PlanTier.PRO,
    name: 'Pro Studio',
    badge: 'Pro Editors',
    description: 'High-throughput studio suite with 4K exports and advanced timeline tools.',
    monthlyPriceUsd: 39,
    yearlyPriceUsd: 31, // $372/yr ($31/mo)
    quota: {
      planTier: PlanTier.PRO,
      transcriptionMinutesTotal: 500,
      renderMinutesTotal: 500,
      storageBytesTotal: 100 * 1024 * 1024 * 1024, // 100 GB
      exportsTotal: 300,
      maxProjects: 100,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      removeWatermark: true,
    },
    features: [
      '500 minutes AI transcription / month',
      'Crisp 4K 60 FPS video export',
      'Full Brand Kit presets & logo overlays',
      'Multi-track speaker separation',
      'Priority GPU rendering queues',
      '100 GB high-speed cloud storage',
      'Up to 3 team members',
    ],
    ctaLabel: 'Upgrade to Pro Studio',
  },
  [PlanTier.BUSINESS]: {
    tier: PlanTier.BUSINESS,
    name: 'Business Agency',
    description: 'Unlimited creative scale for marketing agencies and media studios.',
    monthlyPriceUsd: 99,
    yearlyPriceUsd: 79,
    quota: {
      planTier: PlanTier.BUSINESS,
      transcriptionMinutesTotal: 2000,
      renderMinutesTotal: 2000,
      storageBytesTotal: 500 * 1024 * 1024 * 1024, // 500 GB
      exportsTotal: 1000,
      maxProjects: 1000,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      removeWatermark: true,
    },
    features: [
      '2,000 minutes AI transcription / month',
      'Dedicated GPU worker instances',
      'Unlimited projects and team seats',
      'Custom webhook & API integrations',
      '500 GB media archive storage',
      'Dedicated account manager & SLA',
    ],
    ctaLabel: 'Contact Sales & Scale',
  },
  [PlanTier.LOCAL]: {
    tier: PlanTier.LOCAL,
    name: 'Local Development',
    badge: 'Local Mode',
    description: 'Unlimited local resources for offline development and testing.',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    quota: {
      planTier: PlanTier.LOCAL,
      transcriptionMinutesTotal: 9999,
      renderMinutesTotal: 9999,
      storageBytesTotal: 1024 * 1024 * 1024 * 1024, // 1 TB
      exportsTotal: 9999,
      maxProjects: 999,
      allow4kExport: true,
      allow60Fps: true,
      allowCustomFonts: true,
      allowTeamCollaboration: true,
      removeWatermark: true,
    },
    features: [
      'Unlimited local transcription (Whisper)',
      'High-speed local rendering (FFmpeg)',
      'All animated caption templates unlocked',
      'Custom fonts & brand kits',
      'Local disk storage',
      'No watermarks',
    ],
    ctaLabel: 'Local Mode Active',
  },
};

