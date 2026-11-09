import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="wrap py-12 max-w-3xl space-y-6 text-sm text-slate-800 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-ink tracking-tight">Privacy Notice</h1>
      <p className="text-xs text-mut">Last updated: November 2026</p>

      <div className="space-y-4 pt-4 border-t border-line text-xs">
        <h2 className="text-base font-bold text-ink">1. Data We Collect</h2>
        <p>
          We sign you in using Google OAuth (scopes: openid, email, profile). We collect your name and email address. If you voluntarily save details in your progressive profile (such as teaching grade, subject interests, or birthday month), that data is solely used to personalize your recommendations and birthday reward.
        </p>

        <h2 className="text-base font-bold text-ink">2. Marketing Consent</h2>
        <p>
          Marketing emails are strictly opt-in via a separate unticked consent box. You may withdraw marketing consent anytime with one click in your email footer or account preferences.
        </p>

        <h2 className="text-base font-bold text-ink">3. Delivery Information</h2>
        <p>
          Physical delivery addresses and phone numbers collected for printed delivery orders are restricted to authorized admins and erased after fulfillment in compliance with data privacy standards.
        </p>
      </div>
    </div>
  );
}

