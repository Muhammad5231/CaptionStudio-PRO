import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'CaptionStudio PRO — AI Video Captions & Animated Subtitles',
  description:
    'Generate, edit, style, animate, and export professional captions from videos or subtitle files. Word-level timing, viral templates, and studio rendering.',
  keywords: [
    'video captions',
    'AI subtitles',
    'word level timestamps',
    'tiktok captions',
    'reels subtitles',
    'video editor',
  ],
  authors: [{ name: 'CaptionStudio PRO' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://captionstudio.io',
    title: 'CaptionStudio PRO — Professional Video Captions & Subtitles',
    description:
      'Generate, edit, style, animate, and export professional captions from videos or subtitle files.',
    siteName: 'CaptionStudio PRO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaptionStudio PRO — Professional Video Captions & Subtitles',
    description: 'Create captions that make videos impossible to ignore.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-[#09090B] font-sans antialiased text-slate-900 dark:text-zinc-100 selection:bg-[#635BFF] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

