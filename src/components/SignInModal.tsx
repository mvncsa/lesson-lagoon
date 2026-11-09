'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { X } from 'lucide-react';

export function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn } = useApp();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isSignInModalOpen) return null;

  const handleRealGoogleSignIn = async () => {
    if (!termsAgreed) {
      alert('Please agree to the Terms of Service to proceed.');
      return;
    }
    setIsLoading(true);
    try {
      await nextAuthSignIn('google', {
        callbackUrl: window.location.href,
      });
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setIsLoading(false);
    }
  };

  const handleSimulate = (email: string) => {
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

        {/* Primary Action: Official Google OAuth */}
        <div className="mb-6">
          <button
            onClick={handleRealGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider for local dev quick-test */}
        <div className="relative mb-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or quick-test account (local dev)
          </span>
        </div>

        {/* Quick test accounts */}
        <div className="space-y-2 mb-5">
          <button
            onClick={() => handleSimulate('mariyam.shifa@gmail.com')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-8 h-8 rounded-full bg-acc text-white font-bold flex items-center justify-center text-xs flex-none">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink group-hover:text-pri">Mariyam Shifa</p>
              <p className="text-[11px] text-mut truncate">mariyam.shifa@gmail.com</p>
            </div>
            <span className="text-xs font-semibold text-pri opacity-0 group-hover:opacity-100 transition">
              Select →
            </span>
          </button>

          <button
            onClick={() => handleSimulate('ahmed.rasheed.mv@gmail.com')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs flex-none">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink group-hover:text-pri">Ahmed Rasheed</p>
              <p className="text-[11px] text-mut truncate">ahmed.rasheed.mv@gmail.com</p>
            </div>
            <span className="text-xs font-semibold text-pri opacity-0 group-hover:opacity-100 transition">
              Select →
            </span>
          </button>

          <button
            onClick={() => handleSimulate('owner@lessonlagoon.mv')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-pri hover:bg-teal-50/40 text-left transition group"
          >
            <div className="w-8 h-8 rounded-full bg-ink text-white font-bold flex items-center justify-center text-xs flex-none">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink group-hover:text-pri">Shaina Ali (Owner)</p>
              <p className="text-[11px] text-mut truncate">owner@lessonlagoon.mv</p>
            </div>
            <span className="badge b-wait text-[10px]">Admin</span>
          </button>
        </div>

        {/* Consents & Agreements (P1-AUTH-04) */}
        <div className="space-y-2.5 pt-3 border-t border-line text-xs text-mut">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded text-pri focus:ring-pri"
            />
            <span>
              I accept the{' '}
              <a href="/terms" target="_blank" className="text-pri underline">
                Terms of Service
              </a>{' '}
              and Single-Teacher Classroom Licence.
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
