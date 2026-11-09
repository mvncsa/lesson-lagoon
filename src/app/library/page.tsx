'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getRecommendations } from '@/lib/recommender';
import { ProductCard } from '@/components/ProductCard';
import { Download, Star, BookOpen, Clock, Printer, CheckCircle } from 'lucide-react';

export default function LibraryPage() {
  const { user, products, orders, entitlements, showToast, setIsSignInModalOpen } = useApp();

  if (!user) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <span className="text-5xl block">📚</span>
        <h1 className="text-2xl font-extrabold text-ink">Sign in to view your Library</h1>
        <p className="text-xs text-mut max-w-sm mx-auto">
          Sign in with your Google account to access your claimed free resources and purchased files.
        </p>
        <button onClick={() => setIsSignInModalOpen(true)} className="btn sm">
          Sign In with Google
        </button>
      </div>
    );
  }

  const ownedProductIds = entitlements
    .filter((e) => e.uid === user.id)
    .map((e) => e.pid);

  const ownedProducts = products.filter((p) => ownedProductIds.includes(p.id));

  const handleDownload = (title: string, format: string) => {
    showToast(`Downloading stamped copy of "${title}" (${format})...`, 'success');
  };

  // Recommendations based on Library (Section 15.9)
  const recommendations = getRecommendations(products, orders, entitlements, {
    viewerOwnedIds: ownedProductIds,
    limit: 4,
  });

  return (
    <div className="wrap py-8 sm:py-12 space-y-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">My Library</h1>
          <p className="text-xs text-mut mt-1">
            Permanent access to your purchased and free curriculum resources · Single-Teacher Licence
          </p>
        </div>

        <div className="text-xs font-semibold text-mut bg-white border border-line px-3 py-1.5 rounded-full">
          {ownedProducts.length} {ownedProducts.length === 1 ? 'Resource' : 'Resources'} in Library
        </div>
      </div>

      {/* Owned Resources Grid */}
      {ownedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-line space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-lg text-ink">No resources in your library yet</h3>
          <p className="text-xs text-mut max-w-sm mx-auto">
            Browse our catalog and claim free packs or purchase classroom worksheets.
          </p>
          <Link href="/#all" className="btn sm">
            Explore Resources
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-line rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xs"
                    style={{ background: prod.color || '#0E8C7F' }}
                  >
                    {prod.ic || '📄'}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="badge b-type">{prod.type}</span>
                    {prod.ver > 1 && (
                      <span className="badge b-free text-[10px]">Updated v{prod.ver}.0</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-ink line-clamp-2">
                    <Link href={`/r/${prod.slug}`} className="hover:text-pri transition">
                      {prod.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-mut mt-0.5">{prod.grade} · {prod.curr}</p>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-line/60">
                  <span>Licence: Single-Teacher · {user.email}</span>
                </div>
              </div>

              {/* Download & Rate Footer */}
              <div className="p-4 bg-bg border-t border-line flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDownload(prod.title, prod.type)}
                  className="btn sm flex-1 justify-center shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download {prod.type}
                </button>

                <Link
                  href={`/r/${prod.slug}`}
                  className="btn sm ghost px-3"
                  title="Rate this resource"
                >
                  <Star className="w-3.5 h-3.5 text-gold" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Based on Your Library (Section 15.9, P1-REC-01) */}
      {recommendations.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-line">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Recommended Based on Your Library
            </h2>
            <p className="text-xs text-mut mt-0.5">
              Resources frequently paired with items you teach.
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

