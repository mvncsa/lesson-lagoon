'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, BookOpen, Search, UserCheck } from 'lucide-react';

export function Header() {
  const {
    user,
    cart,
    setIsCartOpen,
    activeCampaign,
    setIsSignInModalOpen,
    switchUserRole,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      {activeCampaign ? (
        <div className="bg-ink text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
          <span>⚡ {activeCampaign.banner}</span>
          <span className="ml-2 font-bold text-amber-300 underline cursor-pointer">
            <Link href="/#all">Browse Deals</Link>
          </span>
        </div>
      ) : (
        <div className="bg-ink text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
          <span>Free teaching resources every week · Sign in with Google</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[rgba(250,250,247,0.92)] backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pri to-[#38C6B3] flex items-center justify-center text-white text-lg shadow-sm">
              🏝️
            </div>
            <span className="text-ink">LessonLagoon</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-2.5 text-mut w-4 h-4" />
            <input
              type="text"
              placeholder="Search worksheets, slides, subjects..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pri/30 focus:border-pri"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Points Pill (if signed in) */}
            {user ? (
              <Link
                href="/points"
                className="flex items-center gap-1.5 bg-[#FFF7E0] border border-[#F8E3A6] text-amber-900 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-xs hover:bg-[#ffefc2] transition"
              >
                <span>🪙</span>
                <span>{user.points} pts</span>
              </Link>
            ) : null}

            {/* Library Link */}
            {user && (
              <Link
                href="/library"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-ink hover:text-pri transition"
              >
                <BookOpen className="w-4 h-4 text-pri" />
                <span>My Library</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:border-pri transition shadow-xs"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-acc text-white text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Admin Switcher / Profile */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full bg-acc text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer ring-2 ring-transparent hover:ring-pri transition">
                    {user.name.charAt(0)}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="btn sm"
                >
                  Sign In
                </button>
              )}

              {/* Role Switcher & Profile Dropdown */}
              {roleMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-line p-2 text-sm z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-line">
                    <p className="font-bold text-ink truncate">{user.name}</p>
                    <p className="text-xs text-mut truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pri/10 text-pri">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/library"
                      onClick={() => setRoleMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium"
                    >
                      📚 My Library
                    </Link>
                    <Link
                      href="/points"
                      onClick={() => setRoleMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium"
                    >
                      🪙 My Points & Rewards
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setRoleMenuOpen(false)}
                        className="block px-3 py-1.5 rounded-lg bg-teal-50 text-pri font-bold hover:bg-teal-100"
                      >
                        ⚙️ Owner Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t border-line">
                    <button
                      onClick={() => {
                        switchUserRole('guest');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

