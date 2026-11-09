'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import {
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Users,
  Coins,
  Star,
  Printer,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  UploadCloud,
  CheckSquare,
  Mail,
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

const TUTORIAL_SLIDES = [
  {
    step: 'Store Overview',
    tag: 'Platform Model',
    icon: '🏝️',
    title: 'The LessonLagoon Store Model',
    subtitle: 'Admin-curated educational marketplace for Maldivian teachers & schools',
    description:
      'In LessonLagoon, you (the administrator) curate, create, and sell all educational resources. Customers (teachers, parents, and schools) browse the storefront, buy verified digital downloads, and request physical printing. Customers do not upload content—you have 100% control over quality, curriculum alignment, and pricing.',
    highlights: [
      'Admin-only uploads guarantee trusted syllabus alignment',
      'Instant digital downloads with stamped single-teacher licences',
      'Optional physical printing & dispatch across Malé & all atolls',
    ],
    ctaText: 'Next: How to Upload & Sell →',
    ctaAction: 'next',
  },
  {
    step: 'Step 1 of 4',
    tag: 'Upload & Sell',
    icon: '⬆️',
    title: 'Uploading & Publishing Educational Resources',
    subtitle: 'Fast 3-step publishing pipeline with automated WebP watermarking',
    description:
      'Navigate to Upload Resources (or press "U" anytime). Drop your master PDF, DOCX, or PPTX file (up to 10MB). LessonLagoon automatically counts pages, builds crisp watermarked preview samples, and generates thumbnails. Pick the subject & grade, set your digital price in MVR, and click Publish to immediately sell it online.',
    highlights: [
      'Automated thumbnail & sample watermark generation (zero AI lag)',
      'Deterministic 10MB limit validation with ephemeral temporary storage',
      'Flexible pricing: set digital price, minimum floor price, or 100% Free',
    ],
    ctaText: 'Go to Upload Centre',
    ctaHref: '/admin/upload',
  },
  {
    step: 'Step 2 of 4',
    tag: 'Fulfillment',
    icon: '✅',
    title: 'Bank Slip Approvals & Print Dispatch',
    subtitle: 'Streamlined BML transfer verification & physical booklet delivery',
    description:
      'Customers pay via BML Bank Transfer and upload their transfer slip. In the Approvals Queue, review and approve slips in one click to instantly unlock digital downloads in the customer\'s Library. When customers select print copies (color/B&W, spiral bound or stapled), manage production and atoll boat dispatch in Print Orders.',
    highlights: [
      '1-Click BML slip approval instantly emails the buyer & unlocks downloads',
      'Duplicate slip detection & amount mismatch alerts protect revenue',
      'Print dispatch workflow with pickup boat/ferry tracking notes',
    ],
    ctaText: 'View Approvals & Print Queues',
    ctaHref: '/admin/approvals',
  },
  {
    step: 'Step 3 of 4',
    tag: 'Customer Loyalty',
    icon: '🪙',
    title: 'Attracting Teachers via Points: 1 MVR = 10 Points',
    subtitle: 'Rewarding loyalty system designed to keep teachers coming back',
    description:
      'Every Maldivian Rufiyaa (MVR 1) spent in cash earns teachers 10 loyalty points (1 MVR = 10 points)! Teachers also receive 50 welcome points (+MVR 5.00) on first sign-in and 100 points for successful colleague referrals. Teachers can spend points to cover up to 80% of any digital resource purchase.',
    highlights: [
      'Conversion standard: 1 MVR = 10 points (every 10 points gives 1 MVR discount)',
      'Earn points on purchases, profile completion, and WhatsApp shares',
      'Track total points liability and top teacher ambassadors in Points & Referrals',
    ],
    ctaText: 'Check Points & Referrals',
    ctaHref: '/admin/points',
  },
  {
    step: 'Step 4 of 4',
    tag: 'Newsletters & Retention',
    icon: '📬',
    title: 'Newsletters & Curriculum Announcements',
    subtitle: 'Re-engage educators before exam seasons and new terms',
    description:
      'Keep teachers loyal and aware of new materials by sending targeted newsletters. Filter subscribers by grade (e.g. Primary vs Secondary) or marketing consent, compose your announcement, send a test email to yourself, and dispatch curriculum updates with one click.',
    highlights: [
      'Automatic GDPR/opt-in consent segmentation',
      'Preheader summary preview for high email open rates',
      'Attract repeat buyers with new term workbooks and revision packs',
    ],
    ctaText: 'Compose a Newsletter',
    ctaHref: '/admin/newsletters',
  },
];

export default function AdminDashboardPage() {
  const { orders, products, reviews, resourceRequests } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Remember tutorial preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lessonlagoon_admin_tutorial_dismissed');
      if (saved === 'true') {
        setShowTutorial(false);
      }
    } catch {}
  }, []);

  const toggleTutorial = () => {
    const nextState = !showTutorial;
    setShowTutorial(nextState);
    try {
      localStorage.setItem('lessonlagoon_admin_tutorial_dismissed', (!nextState).toString());
    } catch {}
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TUTORIAL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + TUTORIAL_SLIDES.length) % TUTORIAL_SLIDES.length);
  };

  const slide = TUTORIAL_SLIDES[currentSlide];

  const pendingApprovals = orders.filter((o) => o.status === 'AWAITING_VERIFICATION');
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const printOrders = orders.filter((o) => o.deliveryDetails && o.status === 'PAID');
  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const newRequests = resourceRequests.filter((r) => r.status === 'New');

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const printRevenue = paidOrders.reduce((sum, o) => sum + (o.printTotal || 0) + (o.deliveryFee || 0), 0);
  const publishedProducts = products.filter((p) => p.status === 'Published');

  const salesBars = [
    { day: 'Mon', val: 1840 },
    { day: 'Tue', val: 2310 },
    { day: 'Wed', val: 1520 },
    { day: 'Thu', val: 2980 },
    { day: 'Fri', val: 3420 },
    { day: 'Sat', val: 2760 },
    { day: 'Sun', val: 3105 },
  ];
  const maxSale = Math.max(...salesBars.map((s) => s.val));

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <span>Dashboard</span>
            <span className="badge b-pri text-[11px] font-bold">Admin Portal</span>
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Store management, resource upload pipeline, orders, and customer marketing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTutorial}
            className="btn sm ghost flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-line hover:border-pri"
          >
            <HelpCircle className="w-3.5 h-3.5 text-pri" />
            <span>{showTutorial ? 'Hide Tutorial' : 'Show Tutorial & Sliders'}</span>
          </button>

          <Link href="/admin/upload" className="btn sm acc flex items-center gap-1.5 text-xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Resources</span>
          </Link>
        </div>
      </div>

      {/* Interactive Admin Tutorial Sliders */}
      {showTutorial && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-ink to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-white/10 animate-in fade-in duration-200">
          {/* Top Bar inside Tutorial */}
          <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-pri/20 text-pri-light font-bold text-sm">
                🎓
              </span>
              <div>
                <span className="font-extrabold text-white text-xs uppercase tracking-wider block">
                  Store Owner's Quick Guide
                </span>
                <span className="text-[11px] text-slate-400">
                  How LessonLagoon works & step-by-step store navigation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {slide.step}
              </span>
              <button
                onClick={toggleTutorial}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Dismiss tutorial"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{slide.icon}</span>
                <span className="badge b-off text-[10px] font-bold uppercase tracking-wider">
                  {slide.tag}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-pri-light mt-1">
                  {slide.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {slide.description}
              </p>

              {/* Bullet highlights */}
              <div className="space-y-1.5 pt-1">
                {slide.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-none" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button for this step */}
            <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end gap-3 pt-2 lg:pt-0">
              {slide.ctaHref ? (
                <Link
                  href={slide.ctaHref}
                  className="btn acc w-full sm:w-auto py-3 px-5 text-xs font-bold shadow-md hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={handleNextSlide}
                  className="btn acc w-full sm:w-auto py-3 px-5 text-xs font-bold shadow-md hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{slide.ctaText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <span className="text-[11px] text-slate-400">
                1 MVR = 10 Points · Admin Curated
              </span>
            </div>
          </div>

          {/* Slider Controls & Step Indicators */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            {/* Step navigation tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {TUTORIAL_SLIDES.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                    currentSlide === idx
                      ? 'bg-pri text-white shadow-xs'
                      : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {s.tag}
                </button>
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handlePrevSlide}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-300 font-mono px-2">
                {currentSlide + 1} / {TUTORIAL_SLIDES.length}
              </span>

              <button
                onClick={handleNextSlide}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Next step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Quick Launch Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <Link
          href="/admin/upload"
          className="bg-white p-4 rounded-2xl border border-line hover:border-pri shadow-xs transition group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-pri flex items-center justify-center font-bold text-lg flex-none group-hover:scale-105 transition">
            ⬆️
          </div>
          <div>
            <b className="text-ink font-bold block text-sm group-hover:text-pri">1. Upload Resources</b>
            <span className="text-mut text-[11px] leading-tight block mt-0.5">
              Add worksheets, tests & slides (up to 10MB)
            </span>
          </div>
        </Link>

        <Link
          href="/admin/approvals"
          className="bg-white p-4 rounded-2xl border border-line hover:border-pri shadow-xs transition group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg flex-none group-hover:scale-105 transition">
            ✅
          </div>
          <div>
            <b className="text-ink font-bold block text-sm group-hover:text-pri">2. Verify Bank Slips</b>
            <span className="text-mut text-[11px] leading-tight block mt-0.5">
              1-click BML approvals to unlock downloads
            </span>
          </div>
        </Link>

        <Link
          href="/admin/print"
          className="bg-white p-4 rounded-2xl border border-line hover:border-pri shadow-xs transition group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg flex-none group-hover:scale-105 transition">
            🖨️
          </div>
          <div>
            <b className="text-ink font-bold block text-sm group-hover:text-pri">3. Print & Ship</b>
            <span className="text-mut text-[11px] leading-tight block mt-0.5">
              Fulfill physical copies for Malé & atolls
            </span>
          </div>
        </Link>

        <Link
          href="/admin/newsletters"
          className="bg-white p-4 rounded-2xl border border-line hover:border-pri shadow-xs transition group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg flex-none group-hover:scale-105 transition">
            📬
          </div>
          <div>
            <b className="text-ink font-bold block text-sm group-hover:text-pri">4. Newsletters & Points</b>
            <span className="text-mut text-[11px] leading-tight block mt-0.5">
              Attract teachers · 1 MVR = 10 Points
            </span>
          </div>
        </Link>
      </div>

      {/* "Needs Your Attention" Section (P1-ADM-01) */}
      {(pendingApprovals.length > 0 || printOrders.length > 0 || pendingReviews.length > 0 || newRequests.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Needs Your Attention</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {pendingApprovals.length > 0 && (
              <Link
                href="/admin/approvals"
                className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between hover:border-pri transition shadow-2xs"
              >
                <div>
                  <b className="text-ink font-bold block">{pendingApprovals.length} Payment Slips</b>
                  <span className="text-mut text-[11px]">Awaiting your verification</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-pri" />
              </Link>
            )}

            {printOrders.length > 0 && (
              <Link
                href="/admin/print"
                className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between hover:border-pri transition shadow-2xs"
              >
                <div>
                  <b className="text-ink font-bold block">{printOrders.length} Print Orders</b>
                  <span className="text-mut text-[11px]">Ready for printing & delivery</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-pri" />
              </Link>
            )}

            {pendingReviews.length > 0 && (
              <Link
                href="/admin/reviews"
                className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between hover:border-pri transition shadow-2xs"
              >
                <div>
                  <b className="text-ink font-bold block">{pendingReviews.length} Reviews</b>
                  <span className="text-mut text-[11px]">Awaiting moderation</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-pri" />
              </Link>
            )}

            {newRequests.length > 0 && (
              <Link
                href="/admin/requests"
                className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between hover:border-pri transition shadow-2xs"
              >
                <div>
                  <b className="text-ink font-bold block">{newRequests.length} Custom Requests</b>
                  <span className="text-mut text-[11px]">New teacher topics requested</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-pri" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards (P1-ADM-01) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <small>Paid Revenue</small>
          <b>{formatMVR(totalPaidRevenue)}</b>
          <span className="text-[11px] text-ok font-semibold">Verified via BML</span>
        </div>

        <div className="kpi">
          <small>Pending Slips</small>
          <b className={pendingApprovals.length > 0 ? 'text-acc' : 'text-ink'}>
            {pendingApprovals.length}
          </b>
          <span className="text-[11px] text-mut">In approvals queue</span>
        </div>

        <div className="kpi">
          <small>Live Resources</small>
          <b>{publishedProducts.length}</b>
          <span className="text-[11px] text-mut">Published in catalog</span>
        </div>

        <div className="kpi">
          <small>Print Orders</small>
          <b>{formatMVR(printRevenue)}</b>
          <span className="text-[11px] text-mut">{printOrders.length} orders fulfilled</span>
        </div>
      </div>

      {/* Sales Graph & Top Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Sales Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-line shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink">7-Day Revenue Trend</h3>
            <span className="badge b-free text-xs font-bold">MVR 17,935 this week</span>
          </div>

          <div className="pt-6 pb-2 flex items-end gap-3 h-48 border-b border-line">
            {salesBars.map((s) => {
              const heightPct = Math.round((s.val / maxSale) * 100);
              return (
                <div key={s.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-mut opacity-0 group-hover:opacity-100 transition">
                    MVR {s.val}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-pri to-[#38C6B3] rounded-t-lg transition-all group-hover:from-pri-hover group-hover:to-pri"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-semibold text-mut">{s.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Resources */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-line shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-ink">Top Resources</h3>
            <Link href="/admin/resources" className="text-xs font-bold text-pri hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-line text-xs">
            {publishedProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-none">{p.ic}</span>
                  <div className="truncate">
                    <b className="text-ink truncate block">{p.title}</b>
                    <span className="text-mut text-[11px]">{p.grade} · {p.sales} sales</span>
                  </div>
                </div>
                <span className="font-bold text-ink whitespace-nowrap">
                  {p.price === 0 ? 'FREE' : formatMVR(p.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

