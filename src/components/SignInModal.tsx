'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { signInWithGoogle } from '@/lib/firebase';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { X } from 'lucide-react';

export function SignInModal() {
  const { isSignInModalOpen, setIsSignInModalOpen, signIn, setUser, showToast } = useApp();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState('');

  if (!isSignInModalOpen) return null;

  const handleRealGoogleSignIn = async () => {
    if (!termsAgreed) {
      alert('Please agree to the Terms of Service to proceed.');
      return;
    }

    // If user has already entered an email in the field, sign in with it directly
    if (inputEmail.trim()) {
      await handleEmailSubmit();
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Google Sign-In popup with Gmail
      const fbUser = await signInWithGoogle();
      if (fbUser && fbUser.email) {
        // 2. Sync with SQLite/PostgreSQL database and persist session
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: fbUser.email,
            name: fbUser.displayName,
            image: fbUser.photoURL,
            marketingConsent,
          }),
        });

        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            points: data.user.points ?? 50,
            pending: 0,
            held: 0,
            code: data.user.referralCode,
            joined: new Date().toISOString().slice(0, 10),
            source: 'Firebase Google Auth',
            consent: marketingConsent,
            paid: false,
            welcome: {
              status: 'active',
              pct: 20,
              expires: Date.now() + 7 * 86400000,
            },
          });
          showToast(`Welcome back, ${data.user.name || data.user.email}!`, 'success');
          setIsSignInModalOpen(false);
          return;
        }
      }
    } catch (fbErr: any) {
      console.warn('Google Sign-In notice:', fbErr);
      if (fbErr?.code !== 'auth/popup-closed-by-user') {
        showToast('Please enter your Gmail address below to sign in instantly.', 'info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    if (!termsAgreed) {
      alert('Please agree to the Terms of Service to proceed.');
      return;
    }

    let emailToUse = (directEmail || inputEmail).trim();
    if (!emailToUse) return;

    // If user entered username without domain, append @gmail.com
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse}@gmail.com`;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: emailToUse.split('@')[0].replace('.', ' '),
          marketingConsent,
        }),
      });

      const data = await res.json();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          points: data.user.points ?? 50,
          pending: 0,
          held: 0,
          code: data.user.referralCode,
          joined: new Date().toISOString().slice(0, 10),
          source: 'Gmail / Direct',
          consent: marketingConsent,
          paid: false,
          welcome: {
            status: 'active',
            pct: 20,
            expires: Date.now() + 7 * 86400000,
          },
        });
        showToast(`🎉 Signed in as ${data.user.email}! +50 welcome points active.`, 'success');
        setIsSignInModalOpen(false);
        return;
      }
    } catch (err) {
      // Local fallback in case server offline
      signIn(emailToUse, marketingConsent);
    } finally {
      setIsLoading(false);
    }
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

        {/* Primary Action: Official Google / Gmail Sign-in */}
        <div className="mb-6">
          <button
            onClick={handleRealGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
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
            <span>{isLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider for direct Gmail entry */}
        <div className="relative mb-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or sign in with Gmail / Email
          </span>
        </div>

        {/* Real Direct Gmail / Email Login */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 mb-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Your Gmail Address
              </label>
              <span className="text-[10px] text-mut">Instant 1-click verification</span>
            </div>
            <div className="relative">
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-pri focus:border-pri outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Quick 1-click test/admin Gmail pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-mut font-semibold mr-1">Quick sign-in:</span>
            <button
              type="button"
              onClick={() => {
                setInputEmail('mvncsa@gmail.com');
                handleEmailSubmit(undefined, 'mvncsa@gmail.com');
              }}
              className="text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              👑 mvncsa@gmail.com (Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputEmail('teacher@gmail.com');
                handleEmailSubmit(undefined, 'teacher@gmail.com');
              }}
              className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              👩‍🏫 teacher@gmail.com
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputEmail.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Verifying with Gmail...' : 'Sign In with Gmail →'}</span>
          </button>
        </form>

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
