'use client';

import React, { useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR, calculatePrintCost } from '@/lib/pricing';
import { getRecommendations } from '@/lib/recommender';
import { ProductCard } from '@/components/ProductCard';
import {
  Printer,
  Share2,
  Check,
  Sparkles,
  Lock,
  ThumbsUp,
  MessageCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const {
    products,
    user,
    orders,
    entitlements,
    userOwnsProduct,
    addToCart,
    activeCampaign,
    reviews,
    addReview,
    voteReviewHelpful,
    showToast,
    setIsSignInModalOpen,
  } = useApp();

  const product = products.find((p) => p.slug === slug);

  // Gallery viewer state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Format selection
  const [format, setFormat] = useState<'digital' | 'print'>('digital');
  const [colour, setColour] = useState<'colour' | 'bw'>('colour');
  const [binding, setBinding] = useState<'none' | 'stapled' | 'spiral'>('stapled');
  const [paper, setPaper] = useState<'standard' | 'card'>('standard');
  const [qty, setQty] = useState(1);

  // New review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewTag, setReviewTag] = useState('Saved me time');

  if (!product) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-2xl font-bold">Resource Not Found</h1>
        <p className="text-mut text-sm mt-2">The resource you requested could not be located.</p>
        <Link href="/" className="btn sm mt-4">
          Back to Home
        </Link>
      </div>
    );
  }

  const isFree = product.price === 0;
  const isOwned = userOwnsProduct(product.id);

  // Calculate pricing
  let displayPrice = product.price;
  let struckPrice: number | null = null;
  if (!isFree && activeCampaign?.active) {
    if (activeCampaign.scope === 'all' || activeCampaign.scope === product.cat) {
      const discount = Math.round((product.price * activeCampaign.pct) / 100);
      const discounted = Math.max(product.min || 0, product.price - discount);
      if (discounted < product.price) {
        struckPrice = product.price;
        displayPrice = discounted;
      }
    }
  }

  // Print cost per copy
  const printConfig = { colour, binding, paper, qty, unitPrice: 0 };
  const printCostTotal = calculatePrintCost(product.pages, printConfig);
  const printCostPerCopy = Math.round(printCostTotal / qty);

  // Recommendations (Section 15.9)
  const recommendations = getRecommendations(products, orders, entitlements, {
    currentProductId: product.id,
    viewerOwnedIds: user ? entitlements.filter((e) => e.uid === user.id).map((e) => e.pid) : [],
    limit: 4,
  });

  const productReviews = reviews.filter((r) => r.pid === product.id && r.status === 'approved');

  const previewPagesCount = product.pv || 3;
  // Total slides = preview pages + 1 final lock card
  const totalSlides = previewPagesCount + 1;

  const handleAddToCart = (buyNow = false) => {
    if (isFree && !user) {
      setIsSignInModalOpen(true);
      return;
    }

    addToCart({
      pid: product.id,
      format,
      printConfig:
        format === 'print'
          ? {
              colour,
              binding,
              paper,
              qty,
              unitPrice: printCostPerCopy,
            }
          : undefined,
    });

    if (buyNow) {
      router.push('/checkout');
    }
  };

  const handleShare = (channel: string) => {
    const code = user?.code || 'SHARE';
    const shareUrl = `${window.location.origin}/r/${product.slug}?ref=${code}`;
    const message = `Check out "${product.title}" on LessonLagoon: ${shareUrl}`;

    if (channel === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      showToast('🔗 Personal link copied! Share with colleagues to earn points.');
    } else if (channel === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    } else if (channel === 'viber') {
      window.open(`viber://forward?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }
    addReview({
      pid: product.id,
      uid: user.id,
      name: user.name,
      rating: reviewRating,
      title: reviewTitle,
      text: reviewText,
      home: false,
      status: 'pending',
      verifiedType: isFree ? 'free' : 'paid',
      tags: [reviewTag],
    });
    setIsReviewModalOpen(false);
  };

  return (
    <div className="wrap py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-mut flex items-center gap-2">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/#all" className="hover:text-ink capitalize">{product.cat}</Link>
        <span>/</span>
        <span className="text-ink font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Grid: Gallery & Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery & Previews (Section 8) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative bg-[#EEF0F3] rounded-3xl p-6 sm:p-10 flex items-center justify-center min-h-[460px] sm:min-h-[540px] select-none overflow-hidden shadow-inner border border-line">
            {/* Slide Viewer */}
            {currentSlide < previewPagesCount ? (
              <div className="relative bg-white shadow-2xl rounded-lg p-6 sm:p-10 max-w-md w-full aspect-[1/1.35] flex flex-col justify-between overflow-hidden border border-slate-200">
                {/* Burned-in Watermark Overlay (P1-PRV-04) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 rotate-[-35deg] text-ink font-black text-3xl sm:text-4xl tracking-widest text-center select-none leading-loose">
                  LESSONLAGOON · PREVIEW · LESSONLAGOON · PREVIEW
                </div>

                {/* Sample Document Page Mock */}
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                    <span className="font-extrabold text-xs text-pri uppercase">
                      {product.grade} · {product.title}
                    </span>
                    <span className="text-[11px] font-bold text-mut">
                      Page {currentSlide + 1} of {product.pages}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-ink mb-3">
                    Section {currentSlide + 1}: Key Classroom Activity
                  </h3>

                  <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
                    <p className="bg-slate-100 h-3 w-4/5 rounded-xs" />
                    <p className="bg-slate-100 h-3 w-full rounded-xs" />
                    <p className="bg-slate-100 h-3 w-2/3 rounded-xs" />
                  </div>

                  {/* Visual diagram representation */}
                  <div className="my-6 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                    <span className="text-4xl block mb-2">{product.ic}</span>
                    <p className="text-xs font-semibold text-slate-600">
                      Sample Activity Illustration & Worked Problems
                    </p>
                  </div>
                </div>

                {/* Footer strip on preview */}
                <div className="text-[10px] text-mut text-center border-t border-slate-200 pt-2">
                  LessonLagoon © · Single-Teacher Classroom Licence
                </div>
              </div>
            ) : (
              /* Final Lock Card (P1-PRV-09) */
              <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl border border-line space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl text-ink">
                  You have previewed {previewPagesCount} of {product.pages} {product.type === 'PPTX' ? 'slides' : 'pages'}
                </h3>
                <p className="text-xs text-mut leading-relaxed">
                  Unlock the complete resource, high-resolution printable PDF, and editable files with instant download.
                </p>
                <button
                  onClick={() => handleAddToCart(true)}
                  className="btn acc block w-full py-2.5 text-sm font-bold shadow-md"
                >
                  Get Full Resource
                </button>
              </div>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-ink disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-ink disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 transition"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: previewPagesCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-16 h-20 rounded-xl bg-white border-2 flex flex-col items-center justify-center text-xs font-bold transition shadow-xs flex-none ${
                  currentSlide === idx ? 'border-pri ring-2 ring-pri/20' : 'border-line text-mut'
                }`}
              >
                <span>P.{idx + 1}</span>
              </button>
            ))}
            <button
              onClick={() => setCurrentSlide(previewPagesCount)}
              className={`w-16 h-20 rounded-xl bg-ink text-white border-2 flex flex-col items-center justify-center text-[11px] font-bold transition shadow-xs flex-none ${
                currentSlide === previewPagesCount ? 'border-amber-400' : 'border-ink'
              }`}
            >
              <Lock className="w-4 h-4 mb-1 text-amber-300" />
              <span>Full ({product.pages})</span>
            </button>
          </div>
        </div>

        {/* Right Column: Buy Box & Options (P1-PRN-02) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            {/* Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="badge b-type">{product.type}</span>
                <span className="badge b-grey">{product.grade}</span>
                {isFree ? (
                  <span className="badge b-free">Free Pack</span>
                ) : struckPrice ? (
                  <span className="badge b-off">Sale -{activeCampaign?.pct}%</span>
                ) : null}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Star Rating Overview */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-gold">
                  {'★'.repeat(Math.round(product.rating))}
                </div>
                <span className="font-bold text-ink">{product.rating.toFixed(1)}</span>
                <span className="text-mut">({product.rc} verified reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-bg rounded-2xl border border-line flex items-baseline justify-between">
              <div>
                <span className="text-xs text-mut font-semibold block mb-0.5">Resource Price</span>
                <div className="flex items-baseline gap-2">
                  {isFree ? (
                    <span className="text-3xl font-extrabold text-ok">FREE</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-ink">
                        {formatMVR(displayPrice)}
                      </span>
                      {struckPrice && (
                        <s className="text-sm text-mut font-medium">{formatMVR(struckPrice)}</s>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!isFree && (
                <div className="text-right text-xs">
                  <span className="text-amber-800 bg-[#FFF7E0] border border-[#F8E3A6] px-2.5 py-1 rounded-full font-bold">
                    🪙 Earn +{Math.floor(displayPrice / 100)} pts
                  </span>
                </div>
              )}
            </div>

            {/* Format Selector: Digital vs Printed (P1-PRN-02) */}
            {product.printOptions?.enabled && (
              <div className="space-y-3 pt-2 border-t border-line">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Select Format
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('digital')}
                    className={`p-3 rounded-2xl border-2 text-left transition ${
                      format === 'digital'
                        ? 'border-pri bg-teal-50/30'
                        : 'border-line hover:border-slate-300'
                    }`}
                  >
                    <b className="text-sm font-bold block text-ink">Digital Download</b>
                    <span className="text-[11px] text-mut">PDF & editable files</span>
                  </button>

                  <button
                    onClick={() => setFormat('print')}
                    className={`p-3 rounded-2xl border-2 text-left transition ${
                      format === 'print'
                        ? 'border-pri bg-teal-50/30'
                        : 'border-line hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-pri" />
                      <b className="text-sm font-bold text-ink">Digital + Print</b>
                    </div>
                    <span className="text-[11px] text-pri font-semibold">
                      +{formatMVR(printCostPerCopy)}/copy
                    </span>
                  </button>
                </div>

                {/* Print Customizer Options */}
                {format === 'print' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-ink">Color option:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setColour('colour')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs border ${
                            colour === 'colour' ? 'bg-pri text-white border-pri' : 'bg-white border-line'
                          }`}
                        >
                          Full Colour
                        </button>
                        <button
                          onClick={() => setColour('bw')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs border ${
                            colour === 'bw' ? 'bg-pri text-white border-pri' : 'bg-white border-line'
                          }`}
                        >
                          Black & White
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-ink">Binding:</span>
                      <select
                        value={binding}
                        onChange={(e) => setBinding(e.target.value as any)}
                        className="bg-white border border-line rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        <option value="none">No binding</option>
                        <option value="stapled">Stapled (+MVR 5.00)</option>
                        <option value="spiral">Spiral binding (+MVR 25.00)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-ink">Copies:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-md bg-white border border-line font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-bold text-ink w-6 text-center">{qty}</span>
                        <button
                          onClick={() => setQty((q) => Math.min(30, q + 1))}
                          className="w-6 h-6 rounded-md bg-white border border-line font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-mut flex justify-between">
                      <span>Printing cost ({qty} copies):</span>
                      <b className="text-ink">{formatMVR(printCostTotal)}</b>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {isOwned ? (
                <Link href="/library" className="btn block w-full py-3 text-center text-sm font-bold">
                  View in My Library →
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="btn block w-full py-3 text-sm font-bold shadow-md"
                  >
                    {isFree ? 'Claim Free Pack' : 'Add to Cart'}
                  </button>
                  {!isFree && (
                    <button
                      onClick={() => handleAddToCart(true)}
                      className="btn acc block w-full py-3 text-sm font-bold shadow-xs"
                    >
                      Buy Now · {formatMVR(displayPrice + (format === 'print' ? printCostTotal : 0))}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Fact Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-line text-mut">
              <div className="bg-bg p-2 rounded-xl">
                <span className="block font-bold text-ink">{product.curr}</span>
                <span>Curriculum</span>
              </div>
              <div className="bg-bg p-2 rounded-xl">
                <span className="block font-bold text-ink">{product.pages} {product.type === 'PPTX' ? 'slides' : 'pages'}</span>
                <span>Length</span>
              </div>
              <div className="bg-bg p-2 rounded-xl">
                <span className="block font-bold text-ink">Version {product.ver}.0</span>
                <span>Latest Update</span>
              </div>
              <div className="bg-bg p-2 rounded-xl">
                <span className="block font-bold text-ink">Single-Teacher</span>
                <span>Classroom Licence</span>
              </div>
            </div>

            {/* Share & Earn Box (P1-SHR-01) */}
            <div className="bg-[#F2FBF9] border border-[#BFE8E2] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pri">
                  <Share2 className="w-3.5 h-3.5" /> Share & Earn Points
                </div>
                <span className="text-[11px] font-semibold text-teal-800">
                  +10 pts per sign-up
                </span>
              </div>
              <p className="text-[11px] text-mut leading-tight">
                Send this resource to your fellow teachers. When they sign up or buy, you earn loyalty points!
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex-1 py-1.5 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('viber')}
                  className="flex-1 py-1.5 bg-[#7360F2] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  Viber
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-3 py-1.5 bg-white border border-line rounded-xl text-xs font-bold flex items-center justify-center hover:bg-slate-50 transition"
                  title="Copy share link"
                >
                  <Copy className="w-3.5 h-3.5 text-mut" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Description */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-line space-y-4">
        <h2 className="text-xl font-extrabold text-ink">About this resource</h2>
        <div className="text-sm text-slate-700 leading-relaxed max-w-3xl space-y-3">
          <p>{product.long || product.short}</p>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((t) => (
                <span key={t} className="badge b-grey text-xs">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Verified Reviews Section (Section 15.7, P1-REV-05) */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-line space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">Teacher Reviews</h2>
            <p className="text-xs text-mut mt-0.5">
              Verified buyers share their classroom experiences with this pack.
            </p>
          </div>

          {isOwned && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="btn sm"
            >
              Write a Review (+20 pts)
            </button>
          )}
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-bg p-6 rounded-2xl border border-line">
          <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-line pb-4 md:pb-0">
            <b className="text-5xl font-black text-ink block">{product.rating.toFixed(1)}</b>
            <div className="text-gold text-lg tracking-widest my-1">
              {'★'.repeat(Math.round(product.rating))}
            </div>
            <span className="text-xs text-mut">Based on {productReviews.length} reviews</span>
          </div>

          <div className="md:col-span-8 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = productReviews.filter((r) => r.rating === stars).length;
              const pct = productReviews.length ? Math.round((count / productReviews.length) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-10 font-bold text-ink">{stars} stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-mut">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {productReviews.length === 0 ? (
            <p className="text-xs text-mut text-center py-8">
              No reviews yet for this resource. Be the first to share your classroom experience!
            </p>
          ) : (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-line/80 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-acc text-white font-bold text-xs flex items-center justify-center">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <b className="text-xs text-ink block">{rev.name}</b>
                      <span className="text-[10px] text-mut">{rev.date}</span>
                    </div>
                  </div>

                  <span className="text-xs text-gold">{'★'.repeat(rev.rating)}</span>
                </div>

                {rev.title && (
                  <h4 className="font-bold text-sm text-ink">{rev.title}</h4>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{rev.text}</p>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex gap-1.5">
                    {rev.tags.map((t) => (
                      <span key={t} className="badge b-grey text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Helpful Button */}
                <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
                  <button
                    onClick={() => voteReviewHelpful(rev.id)}
                    className="flex items-center gap-1.5 text-mut hover:text-pri font-medium transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>

                  <span className="text-[11px] text-ok font-semibold">
                    ✓ Verified purchase
                  </span>
                </div>

                {/* Owner Reply if present */}
                {rev.ownerReply && (
                  <div className="mt-3 pl-4 border-l-2 border-pri bg-teal-50/50 p-3 rounded-r-xl text-xs space-y-1">
                    <b className="text-pri font-bold">Teacher-Creator Reply</b>
                    <p className="text-slate-600">{rev.ownerReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Modal Form */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-line shadow-2xl space-y-4">
            <h3 className="font-extrabold text-xl text-ink">Write a Verified Review</h3>
            <p className="text-xs text-mut">
              Earn 20 loyalty points when your review is verified. Reviews never depend on star rating!
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Your Star Rating</label>
                <div className="flex gap-2 text-2xl text-gold cursor-pointer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      onClick={() => setReviewRating(s)}
                      className={s <= reviewRating ? 'opacity-100' : 'opacity-30'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Grade 4s loved the fractions bar models!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="inp text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Detailed Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share how you used this in class, how learners responded, or tips for other teachers."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="inp text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="btn sm ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn sm">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recommendations ("Customers who bought this also bought") (P1-REC-01) */}
      {recommendations.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-line">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Customers Who Bought This Also Bought
            </h2>
            <p className="text-xs text-mut mt-0.5">
              Popular companion worksheets and lesson slide decks based on verified purchases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

