'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { HeroCanvas } from '@/components/HeroCanvas';
import { ProductCard } from '@/components/ProductCard';
import { formatMVR } from '@/lib/pricing';
import { INITIAL_TRUST_ITEMS, INITIAL_STATS, INITIAL_FAQ } from '@/lib/data';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, Gift, Filter } from 'lucide-react';

export default function HomePage() {
  const {
    products,
    categories,
    activeCampaign,
    user,
    reviews,
    addToCart,
    userOwnsProduct,
    setIsSignInModalOpen,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all'); // all, free, paid, 4plus
  const [sortBy, setSortBy] = useState<string>('popular'); // popular, newest, rating, price_asc

  const published = products.filter((p) => p.status === 'Published');
  const featured = published.filter((p) => p.featured);
  const freePacks = published.filter((p) => p.price === 0);

  // Filtered resources for the "All Resources" section
  const filteredProducts = published
    .filter((p) => {
      if (selectedCat !== 'all' && p.cat !== selectedCat) return false;
      if (selectedGrade !== 'all' && p.grade !== selectedGrade) return false;
      if (filterType === 'free' && p.price !== 0) return false;
      if (filterType === 'paid' && p.price === 0) return false;
      if (filterType === '4plus' && p.rating < 4) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.short.toLowerCase().includes(query) ||
          p.curr.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.sales - a.sales;
      if (sortBy === 'newest') return (b.created || '').localeCompare(a.created || '');
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price - b.price;
      return 0;
    });

  const featuredReviews = reviews.filter((r) => r.home && r.status === 'approved');

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION WITH INTERACTIVE CANVAS & COVER COLLAGE */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E9F7F4] via-[#F4FAF8] to-[#FFF4EE] border-b border-line">
        <HeroCanvas mode="network" />

        <div className="wrap relative z-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border border-line px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-ink shadow-xs">
                <span>🏝️</span>
                <span>Made by Maldivian Teachers for Maldivian Classrooms</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-ink tracking-tight leading-[1.08]">
                Teach brilliant lessons <em className="not-italic text-pri underline decoration-[#FFD7C9] decoration-wavy decoration-4">tonight</em>, not next week.
              </h1>

              <p className="text-base sm:text-lg text-mut max-w-xl leading-relaxed">
                Ready-to-use worksheets, slide decks, and unit plans aligned to the Maldives National Curriculum. Preview free, download instantly, or request high-quality printed copies delivered to any island.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a href="#all" className="btn acc py-3 px-6 text-sm font-bold shadow-md">
                  <span>Browse 1,200+ Resources</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#free" className="btn ghost py-3 px-6 text-sm font-bold shadow-xs">
                  See Free Packs
                </a>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 pt-6 border-t border-line/60">
                {INITIAL_STATS.map(([stat, label]) => (
                  <div key={label}>
                    <b className="text-2xl sm:text-3xl font-extrabold text-ink block">{stat}</b>
                    <span className="text-xs text-mut font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Cover Collage (3D Hover Cards) */}
            <div className="lg:col-span-5 relative h-96 hidden md:block">
              {featured.slice(0, 3).map((prod, idx) => {
                const tilts = ['-rotate-6 translate-x-2 -translate-y-4', 'rotate-3 translate-x-20 translate-y-6', '-rotate-3 translate-x-10 translate-y-28'];
                return (
                  <div
                    key={prod.id}
                    className={`absolute w-64 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:z-30 cursor-pointer ${tilts[idx]}`}
                    style={{
                      background: `linear-gradient(135deg, ${prod.color} 0%, #14213D 100%)`,
                      zIndex: 10 + idx,
                    }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-3xl">{prod.ic}</span>
                      <span className="badge b-free text-[10px]">
                        {prod.price === 0 ? 'FREE' : formatMVR(prod.price)}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm line-clamp-2 leading-snug">{prod.title}</p>
                    <div className="mt-3 text-xs opacity-80 flex items-center justify-between">
                      <span>{prod.grade}</span>
                      <span>★ {prod.rating}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap space-y-16">
        {/* 2. TRUST STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-24 relative z-20">
          {INITIAL_TRUST_ITEMS.map(([icon, title, desc]) => (
            <div
              key={title}
              className="bg-white border border-line rounded-card p-4 sm:p-5 flex items-center gap-3.5 shadow-md"
            >
              <span className="text-3xl flex-none">{icon}</span>
              <div>
                <b className="text-ink text-sm font-bold block">{title}</b>
                <small className="text-mut text-xs">{desc}</small>
              </div>
            </div>
          ))}
        </div>

        {/* 3. WELCOME OFFER BANNER (P1-AUT-01, P1-LP-01) */}
        {user?.welcome?.status === 'active' && (
          <div className="bg-gradient-to-r from-[#FFEDE6] to-[#FFF8E6] border-2 border-dashed border-acc rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <span className="text-4xl">🎁</span>
              <div>
                <h3 className="font-extrabold text-ink text-lg">
                  Welcome to LessonLagoon! Enjoy 20% off your first paid order.
                </h3>
                <p className="text-xs text-mut">
                  Applied automatically at checkout for the next 7 days · Plus +50 points already in your balance!
                </p>
              </div>
            </div>
            <a href="#all" className="btn sm acc whitespace-nowrap">
              Shop With 20% Off →
            </a>
          </div>
        )}

        {/* 4. FEATURED RESOURCES */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Featured Resources
              </h2>
              <p className="text-sm text-mut mt-1">
                Hand-picked, highly-rated packs used across schools this term.
              </p>
            </div>
            <a href="#all" className="text-sm font-bold text-pri hover:underline flex items-center gap-1">
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 5. LIVE CAMPAIGN BANNER BLOCK (P1-CMP-03) */}
        {activeCampaign && (
          <div
            className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${activeCampaign.accent || '#DB2777'} 0%, #14213D 100%)`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-8 space-y-3">
                <span className="inline-block bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  {activeCampaign.type}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {activeCampaign.name}
                </h2>
                <p className="text-slate-100 text-sm sm:text-base max-w-xl">
                  {activeCampaign.banner}. Double points on all eligible resource purchases!
                </p>
              </div>

              <div className="md:col-span-4 flex flex-col items-center md:items-end gap-4">
                <div className="flex gap-2 text-center">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl min-w-[56px]">
                    <b className="block text-2xl font-extrabold">02</b>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Days</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl min-w-[56px]">
                    <b className="block text-2xl font-extrabold">14</b>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Hours</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl min-w-[56px]">
                    <b className="block text-2xl font-extrabold">45</b>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Mins</span>
                  </div>
                </div>

                <a href="#all" className="btn ghost py-2.5 px-6 font-bold text-sm shadow-md">
                  Explore Campaign Packs
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 6. FREE TEACHING RESOURCES (P1-CHK-01) */}
        <section id="free" className="bg-[#EBF7F5] rounded-3xl p-8 sm:p-10 border border-[#BFE8E2]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="badge b-free font-bold mb-2">Instant Downloads</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                100% Free Resources
              </h2>
              <p className="text-sm text-mut mt-1">
                Zero cost for all Maldivian educators. Sign in with Google and download in 2 taps.
              </p>
            </div>
            <span className="text-xs font-semibold text-pri bg-white px-3 py-1.5 rounded-full border border-[#BFE8E2]">
              ⚡ No payment details needed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {freePacks.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-5 border border-line shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{prod.ic}</span>
                    <div>
                      <span className="text-xs font-bold text-mut uppercase">{prod.grade}</span>
                      <h4 className="font-bold text-sm text-ink">{prod.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-mut line-clamp-2">{prod.short}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-line flex items-center justify-between">
                  <span className="font-extrabold text-ok text-sm">FREE</span>
                  {userOwnsProduct(prod.id) ? (
                    <Link href="/library" className="btn sm ghost text-xs">
                      In Library ✓
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          setIsSignInModalOpen(true);
                        } else {
                          addToCart({ pid: prod.id, format: 'digital' });
                        }
                      }}
                      className="btn sm"
                    >
                      Get it Free
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SHOP BY SUBJECT */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Shop by Subject
            </h2>
            <p className="text-sm text-mut mt-1">
              Curriculum-aligned packs for every key stage in your school.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCat(cat.id);
                  const el = document.getElementById('all');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`bg-white border rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:border-pri shadow-xs ${
                  selectedCat === cat.id ? 'border-pri ring-2 ring-pri/20 bg-teal-50/20' : 'border-line'
                }`}
              >
                <span className="text-4xl block mb-2">{cat.ic}</span>
                <b className="block text-sm text-ink font-bold">{cat.name}</b>
                <small className="text-mut text-xs">
                  {published.filter((p) => p.cat === cat.id).length} packs
                </small>
              </button>
            ))}
          </div>
        </section>

        {/* 8. ALL RESOURCES WITH ADVANCED FILTERS (P1-CAT-08) */}
        <section id="all" className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                All Resources
              </h2>
              <p className="text-sm text-mut mt-0.5">
                Showing {filteredProducts.length} worksheets, slides, and exam mock papers.
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-line rounded-xl px-3 py-2 text-ink focus:outline-pri"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Top Rated (★)</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Subject Filter */}
            <button
              onClick={() => setSelectedCat('all')}
              className={`chip ${selectedCat === 'all' ? 'on' : ''}`}
            >
              All Subjects
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`chip ${selectedCat === c.id ? 'on' : ''}`}
              >
                <span>{c.ic}</span>
                <span>{c.name}</span>
              </button>
            ))}

            <span className="h-4 w-px bg-line mx-1" />

            {/* Type Filter */}
            <button
              onClick={() => setFilterType('all')}
              className={`chip ${filterType === 'all' ? 'on' : ''}`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`chip ${filterType === 'free' ? 'on' : ''}`}
            >
              Free Only
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`chip ${filterType === 'paid' ? 'on' : ''}`}
            >
              Paid Only
            </button>
            <button
              onClick={() => setFilterType('4plus')}
              className={`chip ${filterType === '4plus' ? 'on' : ''}`}
            >
              ★ 4.0 & Up
            </button>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-line p-8 space-y-3">
              <span className="text-4xl block">🔍</span>
              <p className="font-bold text-ink text-lg">No matching resources found</p>
              <p className="text-xs text-mut max-w-sm mx-auto">
                Try clearing your filters or submit a quick request for what you need.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCat('all');
                    setSelectedGrade('all');
                    setFilterType('all');
                    setSearchQuery('');
                  }}
                  className="btn sm ghost"
                >
                  Reset Filters
                </button>
                <Link href="/request" className="btn sm">
                  Request this Resource
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 9. VERIFIED REVIEWS & TESTIMONIALS (P1-REV-00 & P1-REV-05) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-line">
          <div className="max-w-xl mb-8">
            <span className="badge b-wait font-bold mb-2">⭐ Real Teacher Feedback</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Loved by Teachers Across 8 Atolls
            </h2>
            <p className="text-sm text-mut mt-1">
              Read how our lesson packs help teachers save preparation time every week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="bg-bg rounded-2xl p-6 border border-line flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-gold text-sm tracking-widest">
                      {rev.rating > 0 ? '★'.repeat(rev.rating) : '⭐️ Testimonial'}
                    </div>
                    <span className="text-[11px] font-semibold text-mut">
                      {rev.verifiedType === 'paid'
                        ? '✓ Verified Purchase'
                        : rev.verifiedType === 'free'
                        ? '✓ Verified Download'
                        : 'Teacher Experience'}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="font-bold text-ink text-sm leading-snug">{rev.title}</h4>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-line/60">
                  <div className="w-8 h-8 rounded-full bg-acc text-white font-bold text-xs flex items-center justify-center">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <b className="text-ink text-xs block">{rev.name}</b>
                    <span className="text-[10px] text-mut">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. HOW IT WORKS */}
        <section className="text-center py-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
            How LessonLagoon Works
          </h2>
          <p className="text-sm text-mut max-w-md mx-auto mb-10">
            From search to classroom download in three effortless steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-line shadow-xs">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-pri font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                1
              </div>
              <h3 className="font-bold text-ink text-base mb-1.5">Choose & Preview</h3>
              <p className="text-xs text-mut leading-relaxed">
                Browse by subject and grade. Inspect watermarked sample pages to ensure it fits your lesson objectives.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-line shadow-xs">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-pri font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                2
              </div>
              <h3 className="font-bold text-ink text-base mb-1.5">Pay via BML Transfer</h3>
              <p className="text-xs text-mut leading-relaxed">
                Free items download immediately. For paid packs, transfer the exact total and upload your slip in seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-line shadow-xs">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-pri font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                3
              </div>
              <h3 className="font-bold text-ink text-base mb-1.5">Download & Print</h3>
              <p className="text-xs text-mut leading-relaxed">
                Files are stored permanently in your personal Library. If you requested printing, we deliver straight to you.
              </p>
            </div>
          </div>
        </section>

        {/* 11. POINTS PROMO (P1-PTS) */}
        <div className="bg-gradient-to-r from-ink to-[#22335C] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="badge b-wait text-xs font-bold">🪙 Always-On Loyalty</span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Earn Points on Every Purchase, Review & Share
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Collect points as you teach. Spend your points at checkout to pay up to 80% of any digital teaching resource.
              </p>
              <div className="pt-2">
                <Link href="/points" className="btn acc text-sm font-bold shadow-md">
                  Check My Points Balance →
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <b className="text-amber-400 text-xl block">+50 pts</b>
                <span className="text-xs text-slate-200">On first Google sign-up</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <b className="text-amber-400 text-xl block">1 pt / MVR</b>
                <span className="text-xs text-slate-200">On all paid orders</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <b className="text-amber-400 text-xl block">+20 pts</b>
                <span className="text-xs text-slate-200">Per verified review</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <b className="text-amber-400 text-xl block">+100 pts</b>
                <span className="text-xs text-slate-200">On your birthday every year</span>
              </div>
            </div>
          </div>
        </div>

        {/* 12. REQUEST A RESOURCE BLOCK (P1-RQR-01) */}
        <div className="bg-gradient-to-r from-[#FFF1EC] to-[#FFF9F5] border border-orange-200 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="badge b-off font-bold">Need a custom pack?</span>
            <h3 className="text-2xl font-extrabold text-ink">
              Can't find what you need for this week's lesson?
            </h3>
            <p className="text-xs sm:text-sm text-mut max-w-xl">
              Ask our teacher-creators directly. Simply provide your email and the topic you want. We'll build it and notify you when ready!
            </p>
          </div>
          <Link href="/request" className="btn acc whitespace-nowrap shadow-md">
            Request a Resource 📝
          </Link>
        </div>

        {/* 13. FAQ ACCORDION */}
        <section id="faq" className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-mut mt-1">
              Everything you need to know about purchasing, printing, and licences.
            </p>
          </div>

          <div className="space-y-3">
            {INITIAL_FAQ.map(([q, a], idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-line p-5 cursor-pointer shadow-xs open:ring-1 open:ring-pri/20"
              >
                <summary className="font-bold text-ink text-sm sm:text-base flex items-center justify-between list-none">
                  <span>{q}</span>
                  <span className="text-mut group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-mut leading-relaxed border-t border-line/60 pt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

