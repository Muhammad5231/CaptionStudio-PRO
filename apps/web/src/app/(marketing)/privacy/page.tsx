import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose dark:prose-invert prose-slate text-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">Privacy Policy</h1>
        <p className="text-slate-500 text-xs">Last updated: September 18, 2026</p>
        <p>
          At CaptionStudio PRO, we take the confidentiality of your video media and personal data seriously. This Privacy Policy describes our practices regarding the collection, use, and disclosure of information.
        </p>
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when creating an account (such as name, email address, password hash), payment transaction metadata, and video files or subtitles you upload for processing.
        </p>
        <h2>2. Use of Video & Audio Media</h2>
        <p>
          Uploaded videos and extracted audio are used solely to perform requested transcription, subtitle generation, and rendering tasks. We do not use your private videos to train public AI foundation models without explicit contractual consent.
        </p>
        <h2>3. Data Retention & Deletion</h2>
        <p>
          You retain full ownership of all uploaded media and generated subtitles. You can delete projects, assets, or your entire account at any time from your settings panel.
        </p>
      </div>
    </div>
  );
}

