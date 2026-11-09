'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Layers, Eye, CheckCircle2, RotateCcw } from 'lucide-react';

export default function AdminLandingEditorPage() {
  const { showToast } = useApp();

  const [activeVariant, setActiveVariant] = useState(0);
  const [kicker, setKicker] = useState('🏝️ Made by Maldivian teachers');
  const [headline, setHeadline] = useState('Teach brilliant lessons <em>tonight</em>, not next week.');
  const [subheadline, setSubheadline] = useState('Ready-to-use worksheets, slides and lesson plans aligned to the Maldives National Curriculum. Preview free, download instantly.');
  const [bgPreset, setBgPreset] = useState<'network' | 'shapes' | 'gradient'>('network');

  const [sections, setSections] = useState([
    { id: 'trust', name: 'Trust strip (stats & guarantees)', on: true },
    { id: 'welcome', name: 'Welcome-offer banner', on: true },
    { id: 'featured', name: 'Featured resources grid', on: true },
    { id: 'campaign', name: 'Occasion campaign banner block', on: true },
    { id: 'free', name: '100% Free resources section', on: true },
    { id: 'subjects', name: 'Shop by subject cards', on: true },
    { id: 'all', name: 'All resources catalogue with search', on: true },
    { id: 'reviews', name: 'Verified reviews & testimonials', on: true },
    { id: 'how', name: 'How it works steps', on: true },
    { id: 'points', name: 'Points & loyalty promotion', on: true },
    { id: 'request', name: 'Request a resource block', on: true },
    { id: 'faq', name: 'Frequently asked questions', on: true },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s))
    );
  };

  const handlePublish = () => {
    showToast('🎉 Landing page published! Version 1.4 is now live on storefront.', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Landing Page Editor
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Hero copy · Interactive background · Section toggles · Live preview · Instant publish.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => showToast('Draft saved to storage.')}
            className="btn sm ghost"
          >
            Save Draft
          </button>
          <button onClick={handlePublish} className="btn sm">
            Publish Changes
          </button>
        </div>
      </div>

      {/* Hero Content Editor (P1-LP-02 & P1-LP-03) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-base text-ink">Hero Copy & Interactive Background</h3>

        <div className="space-y-3">
          <div>
            <label className="font-bold block mb-1">Kicker Badge</label>
            <input
              type="text"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Main Headline (use &lt;em&gt; for highlighted word)</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Sub-headline</label>
            <textarea
              rows={3}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Interactive Canvas Preset</label>
            <select
              value={bgPreset}
              onChange={(e) => setBgPreset(e.target.value as any)}
              className="inp text-xs py-1.5 w-48"
            >
              <option value="network">Particle Network (Connected)</option>
              <option value="shapes">Floating Geometric Shapes</option>
              <option value="gradient">Subtle Gradient Mesh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sections On / Off Toggle (P1-LP-01) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-base text-ink">Landing Page Sections Visibility</h3>
        <p className="text-mut text-xs">
          Turn storefront sections on or off to adjust promotions or seasonal sales.
        </p>

        <div className="space-y-2">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-line bg-bg"
            >
              <span className="font-semibold text-ink">{sec.name}</span>
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className={`sw ${sec.on ? 'on' : ''}`}
                aria-label={`Toggle ${sec.name}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

