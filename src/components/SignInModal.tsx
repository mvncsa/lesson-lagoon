'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check } from 'lucide-react';

export function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn } = useApp();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [customEmail, setCustomEmail] = useState('');

  if (!isSignInModalOpen) return null;

  const handleGoogleSimulate = (email: string) => {
    if (!termsAgreed) {
      alert('Please agree to the Terms of Service to proceed.');
      return;
    }
    signIn(email, marketingConsent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsSignInModalOpen(false)}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-ink transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pri to-[#38C6B3] flex items-center justify-center text-2xl mx-auto shadow-md mb-3">
            🏝️
          </div>
          <h2 className="text-xl font-extrabold text-ink">Sign in to LessonLagoon</h2>
          <p className="text-xs text-mut mt-1">
            Access your resources, library, and earn loyalty points
          </p>
        </div>

        {/* Google One-Tap simulated accounts */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Choose a Google Account
          </p>

          <button
            onClick={() => handleGoogleSimulate('mariyam.shifa@gmail.com')}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-10 h-10 rounded-full bg-acc text-white font-bold flex items-center justify-center text-sm flex-none">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink group-hover:text-pri">Mariyam Shifa</p>
              <p className="text-xs text-mut truncate">mariyam.shifa@gmail.com</p>
            </div>
            <span className="text-xs font-semibold text-pri opacity-0 group-hover:opacity-100 transition">
              Select →
            </span>
          </button>

          <button
            onClick={() => handleGoogleSimulate('ahmed.rasheed.mv@gmail.com')}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm flex-none">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink group-hover:text-pri">Ahmed Rasheed</p>
              <p className="text-xs text-mut truncate">ahmed.rasheed.mv@gmail.com</p>
            </div>
            <span className="text-xs font-semibold text-pri opacity-0 group-hover:opacity-100 transition">
              Select →
            </span>
          </button>

          <button
            onClick={() => handleGoogleSimulate('owner@lessonlagoon.mv')}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-10 h-10 rounded-full bg-ink text-white font-bold flex items-center justify-center text-sm flex-none">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink group-hover:text-pri">Shaina Ali (Owner)</p>
              <p className="text-xs text-mut truncate">owner@lessonlagoon.mv</p>
            </div>
            <span className="badge b-wait text-[10px]">Admin</span>
          </button>
        </div>

        {/* Or enter any Google Email */}
        <div className="pt-2 border-t border-line mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customEmail) handleGoogleSimulate(customEmail);
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="Or enter other Google email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="inp text-xs py-2 flex-1"
            />
            <button type="submit" className="btn sm">
              Sign In
            </button>
          </form>
        </div>

        {/* Consents & Agreements (P1-AUTH-04) */}
        <div className="space-y-2.5 pt-2 border-t border-line text-xs text-mut">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded text-pri focus:ring-pri"
            />
            <span>
              I accept the <a href="/terms" className="text-pri underline">Terms of Service</a> and Single-Teacher Classroom Licence.
            </span>
          </label>

          {/* Marketing consent MUST BE SEPARATE AND UNTICKED BY DEFAULT (P1-AUTH-04) */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 rounded text-pri focus:ring-pri"
            />
            <span className="text-slate-600 font-medium">
              Email me offers, new resources, and lesson updates (optional).
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

