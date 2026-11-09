'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { createSliderChallenge, verifySliderResponse } from '@/lib/sliderCaptcha';
import { Send, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function RequestResourcePage() {
  const { user, categories, submitResourceRequest, showToast } = useApp();

  const [email, setEmail] = useState(user?.email || '');
  const [text, setText] = useState('');
  const [subjectId, setSubjectId] = useState('maths');
  const [grade, setGrade] = useState('Grade 4');
  const [type, setType] = useState('PDF');
  const [notify, setNotify] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Slider CAPTCHA state (P1-RQR-04)
  const [challenge, setChallenge] = useState<{ token: string; targetX: number } | null>(null);
  const [sliderPos, setSliderPos] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    resetChallenge();
  }, []);

  const resetChallenge = () => {
    const c = createSliderChallenge();
    setChallenge(c);
    setSliderPos(0);
    setStartTime(Date.now());
    setCaptchaPassed(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderPos(val);

    if (challenge) {
      const elapsed = Date.now() - startTime;
      const res = verifySliderResponse(challenge.token, val, elapsed);
      if (res.valid) {
        setCaptchaPassed(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Please provide your email address.');
      return;
    }

    if (!captchaPassed) {
      alert('Please complete the verification slider first.');
      return;
    }

    submitResourceRequest({
      email,
      text,
      subjectId,
      grade,
      type,
      notify,
      marketingConsent,
      status: 'New',
    });

    setSubmitted(true);
  };

  return (
    <div className="wrap py-12 max-w-2xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="badge b-free font-bold">✨ Teacher Request Form</span>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          Request a Custom Teaching Resource
        </h1>
        <p className="text-xs sm:text-sm text-mut max-w-md mx-auto">
          Need a specific topic, worksheet set, or exam drill for your school? Tell us what you need and we will create it!
        </p>
      </div>

      {submitted ? (
        <div className="bg-white border border-line rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm animate-in zoom-in-95">
          <div className="w-16 h-16 bg-teal-50 text-pri rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h2 className="text-xl font-extrabold text-ink">Thanks! Request Received.</h2>
          <p className="text-xs text-mut max-w-sm mx-auto">
            We will prioritize this topic with our curriculum authors and email you at <b className="text-ink">{email}</b> as soon as it is published in the store.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn sm">
              Back to Storefront
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-3xl p-6 sm:p-10 shadow-sm space-y-5 text-xs">
          <div>
            <label className="font-bold block mb-1 text-ink">Your Email Address *</label>
            <input
              type="email"
              required
              placeholder="name@school.mv"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1 text-ink">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="inp text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1 text-ink">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="inp text-xs"
              >
                {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1 text-ink">Resource Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="inp text-xs"
              >
                <option value="PDF">Worksheet (PDF)</option>
                <option value="PPTX">Lesson Slides (PPTX)</option>
                <option value="DOCX">Editable Plan (DOCX)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-ink">What specific topics or concepts do you need?</label>
            <textarea
              rows={4}
              placeholder="e.g. Grade 5 Dhivehi reading comprehension with local stories, or Grade 8 algebra word problems with step-by-step answer key."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="inp text-xs"
            />
          </div>

          {/* Slider CAPTCHA Verification (P1-RQR-04) */}
          <div className="p-4 bg-bg rounded-2xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pri" /> Verification: Drag the puzzle handle
              </span>
              <button
                type="button"
                onClick={resetChallenge}
                className="text-mut hover:text-ink flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {challenge && (
              <div className="relative h-12 bg-slate-200 rounded-xl overflow-hidden flex items-center px-2">
                {/* Target highlight */}
                <div
                  className="absolute top-1 bottom-1 w-10 border-2 border-dashed border-pri bg-teal-50/50 rounded-lg pointer-events-none"
                  style={{ left: `${challenge.targetX}%` }}
                />

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={handleSliderChange}
                  className="w-full accent-pri cursor-ew-resize relative z-10"
                />
              </div>
            )}

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-mut">Align the handle with the teal target marker.</span>
              {captchaPassed ? (
                <span className="text-ok font-bold flex items-center gap-1">
                  ✓ Verified
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Slide to align</span>
              )}
            </div>
          </div>

          {/* Consents */}
          <div className="space-y-2 pt-2 border-t border-line text-xs text-mut">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="mt-0.5 rounded text-pri"
              />
              <span className="text-slate-700 font-medium">
                Notify me by email when this resource is created and published.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 rounded text-pri"
              />
              <span>
                Email me offers and weekly new resource roundups (optional).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!captchaPassed}
            className="btn block w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50"
          >
            Submit Teaching Request
          </button>
        </form>
      )}
    </div>
  );
}

