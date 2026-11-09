'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { calculateOrderPricing, formatMVR } from '@/lib/pricing';
import { X, Trash2, Printer, Sparkles } from 'lucide-react';

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateCartItem,
    isCartOpen,
    setIsCartOpen,
    products,
    user,
    activeCampaign,
  } = useApp();

  if (!isCartOpen) return null;

  const productsMap = new Map(products.map((p) => [p.id, p]));

  const pricing = calculateOrderPricing(cart, productsMap, {
    user: user
      ? {
          id: user.id,
          points: user.points,
          welcome: user.welcome,
        }
      : null,
    activeCampaign,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-ink">Your Cart</h2>
            <span className="badge b-grey">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-ink transition"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-mut space-y-3">
              <span className="text-5xl block">🛒</span>
              <p className="font-semibold text-ink">Your cart is empty</p>
              <p className="text-xs">Explore worksheets and lesson plans to get started.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn sm ghost mt-2"
              >
                Browse Resources
              </button>
            </div>
          ) : (
            pricing.items.map((line) => {
              const prod = line.product;
              return (
                <div
                  key={line.pid}
                  className="bg-bg rounded-xl p-3.5 border border-line flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-none shadow-xs text-white"
                      style={{ background: prod.color || '#0E8C7F' }}
                    >
                      {prod.ic || '📄'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-ink truncate">{prod.title}</h4>
                      <p className="text-xs text-mut">{prod.grade} · {prod.type} ({prod.pages} pages)</p>

                      <div className="mt-1 flex items-center gap-2">
                        {prod.price === 0 ? (
                          <span className="font-bold text-ok text-xs">FREE</span>
                        ) : (
                          <span className="font-bold text-ink text-xs">
                            {formatMVR(line.discountedPrice)}
                          </span>
                        )}
                        {line.discountAmount > 0 && (
                          <span className="text-[11px] text-acc font-semibold">
                            -{line.appliedOfferPct}% {line.appliedOfferName}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.pid)}
                      className="text-slate-400 hover:text-bad p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Format Switcher (Digital vs Print) if print available */}
                  {prod.printOptions?.enabled && (
                    <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-mut flex items-center gap-1">
                        <Printer className="w-3.5 h-3.5 text-pri" /> Format:
                      </span>
                      <div className="flex rounded-lg border border-line overflow-hidden">
                        <button
                          onClick={() => updateCartItem(line.pid, { format: 'digital' })}
                          className={`px-2.5 py-1 text-xs font-semibold ${
                            line.format === 'digital'
                              ? 'bg-ink text-white'
                              : 'bg-white text-mut hover:bg-slate-50'
                          }`}
                        >
                          Digital
                        </button>
                        <button
                          onClick={() =>
                            updateCartItem(line.pid, {
                              format: 'print',
                              printConfig: line.printConfig || {
                                colour: 'colour',
                                binding: 'stapled',
                                paper: 'standard',
                                qty: 1,
                                unitPrice: 7700,
                              },
                            })
                          }
                          className={`px-2.5 py-1 text-xs font-semibold ${
                            line.format === 'print'
                              ? 'bg-ink text-white'
                              : 'bg-white text-mut hover:bg-slate-50'
                          }`}
                        >
                          Digital + Print
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Print summary if print selected */}
                  {line.format === 'print' && (
                    <div className="bg-white rounded-lg p-2.5 text-xs border border-teal-100 flex items-center justify-between">
                      <span className="text-pri font-medium">
                        Printed copy ({line.printConfig?.colour}, {line.printConfig?.binding})
                      </span>
                      <span className="font-bold text-ink">
                        +{formatMVR(line.printCost)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Call-to-Action */}
        {cart.length > 0 && (
          <footer className="p-4 sm:p-5 border-t border-line bg-white space-y-3">
            {/* Loyalty Points Earning Badge */}
            {pricing.pointsToEarn > 0 && (
              <div className="bg-[#FFF8E1] border border-amber-200/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> You will earn:
                </span>
                <span className="font-extrabold text-amber-900">
                  +{pricing.pointsToEarn} points
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-mut">
                <span>Items Subtotal</span>
                <span>{formatMVR(pricing.subtotal)}</span>
              </div>
              {pricing.discountTotal > 0 && (
                <div className="flex justify-between text-acc font-semibold">
                  <span>Discounts</span>
                  <span>-{formatMVR(pricing.discountTotal)}</span>
                </div>
              )}
              {pricing.printSubtotal > 0 && (
                <div className="flex justify-between text-mut">
                  <span>Printing charges</span>
                  <span>+{formatMVR(pricing.printSubtotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-lg text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatMVR(pricing.totalCash)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn block w-full py-3 text-center text-sm font-bold"
            >
              Checkout · {formatMVR(pricing.totalCash)}
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

