'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatMVR } from '@/lib/pricing';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { activeCampaign } = useApp();

  const isFree = product.price === 0;

  // Calculate campaign price if active
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

  return (
    <Link
      href={`/r/${product.slug}`}
      className="group bg-white border border-line rounded-card overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Cover / Image Box */}
      <div
        className="aspect-[4/3] relative flex items-center justify-center overflow-hidden transition group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${product.color} 0%, #14213D 100%)`,
        }}
      >
        {/* Subtle patterned circles */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-4 border-white" />
        </div>

        {/* Icon & Grade Centerpiece */}
        <div className="text-center z-10">
          <span className="text-5xl filter drop-shadow-md select-none">{product.ic || '📄'}</span>
          <div className="mt-2 text-white font-bold text-xs tracking-wider uppercase opacity-90">
            {product.grade} · {product.type}
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-20">
          {isFree ? (
            <span className="badge b-free shadow-xs">Free Pack</span>
          ) : struckPrice ? (
            <span className="badge b-off shadow-xs">-{activeCampaign?.pct}%</span>
          ) : null}

          {product.printOptions?.enabled && (
            <span className="badge b-blue shadow-xs">Print Option</span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 text-[11px] font-semibold bg-black/40 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
          {product.pages} {product.type === 'PPTX' ? 'slides' : 'pages'}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-bold text-ink text-[15.5px] leading-snug line-clamp-2 group-hover:text-pri transition-colors">
          {product.title}
        </h3>

        <div className="text-xs text-mut font-medium">
          {product.grade} · {product.curr}
        </div>

        {product.short && (
          <p className="text-xs text-mut line-clamp-2 mt-1">
            {product.short}
          </p>
        )}

        {/* Footer: Price & Stars */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-line/60">
          <div className="flex items-baseline gap-1.5">
            {isFree ? (
              <span className="font-extrabold text-base text-ok">FREE</span>
            ) : (
              <>
                <span className="font-extrabold text-base text-ink">
                  {formatMVR(displayPrice)}
                </span>
                {struckPrice && (
                  <s className="text-xs text-mut font-medium">{formatMVR(struckPrice)}</s>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-gold text-xs font-semibold">
            <span>★</span>
            <span className="text-ink font-bold">{product.rating.toFixed(1)}</span>
            <span className="text-mut text-[11px]">({product.rc})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

