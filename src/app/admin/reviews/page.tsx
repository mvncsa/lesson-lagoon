'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Star, CheckCircle, EyeOff, MessageCircle, Home } from 'lucide-react';

export default function AdminReviewsPage() {
  const { reviews, moderateReview, replyToReview, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'hidden'>('pending');
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});

  const filtered = reviews.filter((r) => r.status === activeTab);

  const handleReplySubmit = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text) return;
    replyToReview(reviewId, text);
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Reviews & Ratings Moderation
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Verified-buyer reviews · Moderation queue · Owner public replies.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-line bg-white p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'pending' ? 'bg-ink text-white' : 'text-mut hover:text-ink'
            }`}
          >
            Pending ({reviews.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'approved' ? 'bg-ink text-white' : 'text-mut hover:text-ink'
            }`}
          >
            Approved ({reviews.filter((r) => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('hidden')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'hidden' ? 'bg-ink text-white' : 'text-mut hover:text-ink'
            }`}
          >
            Hidden ({reviews.filter((r) => r.status === 'hidden').length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-line space-y-2">
          <Star className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-lg text-ink">No reviews in this status</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-acc text-white font-bold flex items-center justify-center text-xs">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <b className="text-ink block">{rev.name}</b>
                    <span className="text-mut text-[11px]">{rev.date} · PID: {rev.pid}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gold font-bold">{'★'.repeat(rev.rating)}</span>
                  <span className="badge b-grey text-[10px] uppercase">{rev.status}</span>
                </div>
              </div>

              {rev.title && <h4 className="font-bold text-sm text-ink">{rev.title}</h4>}
              <p className="text-slate-700 bg-bg p-3 rounded-xl border border-line leading-relaxed">
                &ldquo;{rev.text}&rdquo;
              </p>

              {rev.ownerReply && (
                <div className="pl-3 border-l-2 border-pri bg-teal-50 p-2.5 rounded-r-xl">
                  <b className="text-pri">Owner reply:</b> {rev.ownerReply}
                </div>
              )}

              {/* Reply Form */}
              <div className="pt-2 border-t border-line flex gap-2">
                <input
                  type="text"
                  placeholder="Type an owner reply..."
                  value={replyText[rev.id] || ''}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [rev.id]: e.target.value })
                  }
                  className="inp text-xs py-1.5 flex-1"
                />
                <button
                  onClick={() => handleReplySubmit(rev.id)}
                  className="btn xs ghost"
                >
                  Reply Publicly
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-line/60">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => moderateReview(rev.id, 'approved')}
                    className="btn xs bg-ok hover:bg-emerald-700 text-white font-bold"
                  >
                    ✓ Approve Review (+20 pts)
                  </button>
                )}
                {rev.status !== 'hidden' && (
                  <button
                    onClick={() => moderateReview(rev.id, 'hidden')}
                    className="btn xs ghost text-bad"
                  >
                    Hide Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

