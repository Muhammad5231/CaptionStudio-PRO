import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose dark:prose-invert prose-slate text-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">Terms of Service</h1>
        <p className="text-slate-500 text-xs">Last updated: September 18, 2026</p>
        <p>
          By accessing or using CaptionStudio PRO, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
        </p>
        <h2>1. Account Responsibilities</h2>
        <p>
          You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.
        </p>
        <h2>2. Permitted Use & Content Restrictions</h2>
        <p>
          You retain all intellectual property rights to your uploaded videos. You agree not to upload content that infringes upon third-party copyrights, violates defamation laws, or contains malicious code.
        </p>
        <h2>3. Billing & Subscriptions</h2>
        <p>
          Paid subscriptions renew automatically unless canceled before the end of the billing period. Quota allocations and minutes expire at the conclusion of each billing cycle.
        </p>
      </div>
    </div>
  );
}

