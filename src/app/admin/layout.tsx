'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  FolderTree,
  CheckSquare,
  ShoppingBag,
  Printer,
  Users,
  Mail,
  Zap,
  Tag,
  Coins,
  Star,
  Layers,
  HelpCircle,
  Sliders,
  Settings,
  History,
  Database,
  ArrowLeft,
  Trash2,
  LogOut,
  Lock,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, setUser, orders, reviews, resourceRequests, clearTestData, showToast } = useApp();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Secure admin check
  const isAdmin = user && user.role === 'ADMIN';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials');
        setIsSubmitting(false);
        return;
      }

      setUser({
        id: 'admin_owner',
        name: 'Store Administrator',
        email: 'owner@lessonlagoon.mv',
        role: 'ADMIN',
        points: 0,
        pending: 0,
        held: 0,
        code: 'ADMIN',
        joined: new Date().toISOString().slice(0, 10),
        source: 'Admin Portal',
        consent: true,
        paid: true,
      });

      showToast('Welcome to LessonLagoon Admin Backend!', 'success');
    } catch (err: any) {
      setLoginError('Could not connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    setUser(null);
    showToast('Signed out of admin portal.', 'info');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-line shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-ink text-white flex items-center justify-center text-2xl mx-auto shadow-md">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-ink tracking-tight">LessonLagoon Admin</h1>
            <p className="text-xs text-mut">
              Protected management backend. Enter your administrator credentials.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-ink block mb-1">Admin Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                className="inp text-xs py-2.5 w-full font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Admin Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="inp text-xs py-2.5 w-full font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn acc w-full py-3 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Unlock Admin Portal →'}
            </button>
          </form>

          <div className="pt-2 border-t border-line text-center">
            <Link href="/" className="text-xs text-mut hover:text-pri font-medium">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = orders.filter((o) => o.status === 'AWAITING_VERIFICATION').length;
  const pendingPrintCount = orders.filter((o) => o.deliveryDetails && o.status === 'PAID').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const newRequestsCount = resourceRequests.filter((r) => r.status === 'New').length;

  const navSections = [
    {
      title: 'Store Operations',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        {
          label: 'Approvals Queue',
          href: '/admin/approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount,
        },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        {
          label: 'Print Orders',
          href: '/admin/print',
          icon: Printer,
          badge: pendingPrintCount,
        },
      ],
    },
    {
      title: 'Catalogue & Uploads',
      items: [
        { label: 'Upload Resources', href: '/admin/upload', icon: UploadCloud },
        { label: 'Resources List', href: '/admin/resources', icon: FileText },
        { label: 'Subjects & Grades', href: '/admin/catalogue', icon: FolderTree },
      ],
    },
    {
      title: 'Marketing & Loyalty',
      items: [
        { label: 'Customers & CRM', href: '/admin/customers', icon: Users },
        { label: 'Newsletters', href: '/admin/newsletters', icon: Mail },
        { label: 'Automations', href: '/admin/automations', icon: Zap },
        { label: 'Campaigns & Coupons', href: '/admin/campaigns', icon: Tag },
        { label: 'Points & Referrals', href: '/admin/points', icon: Coins },
        {
          label: 'Reviews Moderation',
          href: '/admin/reviews',
          icon: Star,
          badge: pendingReviewsCount,
        },
      ],
    },
    {
      title: 'Content & Rules',
      items: [
        { label: 'Landing Page Editor', href: '/admin/landing', icon: Layers },
        {
          label: 'Resource Requests',
          href: '/admin/requests',
          icon: HelpCircle,
          badge: newRequestsCount,
        },
        { label: 'Pricing & Rules Centre', href: '/admin/pricing', icon: Sliders },
        { label: 'Email Templates', href: '/admin/emails', icon: Mail },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', href: '/admin/settings', icon: Settings },
        { label: 'Audit Log', href: '/admin/audit', icon: History },
        { label: 'Backup & Data', href: '/admin/backup', icon: Database },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-line px-3 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-1 rounded-xl text-ink hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close admin navigation' : 'Open admin navigation'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>

          <Link href="/" className="flex items-center gap-2 font-black text-ink text-sm sm:text-base tracking-tight">
            <span>🏝️</span>
            <span>LessonLagoon</span>
            <span className="badge b-wait text-[10px] font-extrabold">ADMIN</span>
          </Link>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <Link href="/" className="text-xs text-mut hover:text-pri hidden sm:flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> View Storefront
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Clear Test Data Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn xs ghost text-amber-700 hover:bg-amber-50 flex items-center gap-1"
            title="Purge test orders, test slips and reset localStorage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Test Data</span>
          </button>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <span className="font-semibold text-mut hidden sm:inline">Administrator</span>
          <div className="w-8 h-8 rounded-full bg-ink text-white font-bold flex items-center justify-center text-xs">
            A
          </div>

          <button
            onClick={handleAdminLogout}
            className="btn xs ghost text-bad hover:bg-rose-50 flex items-center gap-1"
            title="Sign out of admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Hamburger Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-ink text-slate-300 h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-black text-white text-base">
                  <span>🏝️</span>
                  <span>LessonLagoon</span>
                  <span className="badge b-wait text-[9px]">ADMIN</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick upload button */}
              <Link
                href="/admin/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="btn acc sm block w-full text-center font-bold text-xs shadow-xs"
              >
                ⬆️ Upload Resources (U)
              </Link>

              {/* Navigation sections */}
              <div className="space-y-4 text-xs font-medium">
                {navSections.map((sec) => (
                  <div key={sec.title} className="space-y-1">
                    <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {sec.title}
                    </span>
                    {sec.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                            isActive
                              ? 'bg-white/20 text-white font-bold'
                              : 'hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge ? (
                            <span className="badge b-off text-[10px] py-0 px-1.5">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom actions in drawer */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4" /> View Storefront
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowClearConfirm(true);
                }}
                className="w-full flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition text-left cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear Test Data
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAdminLogout();
                }}
                className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log Out Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Test Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-line shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto">
              🗑️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-ink">Clear All Test Data?</h3>
              <p className="text-xs text-mut mt-1">
                This will purge all mock orders, test slips, and reset browser state while preserving core catalog resources and categories.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn sm ghost flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearTestData();
                  setShowClearConfirm(false);
                }}
                className="btn sm bg-bad hover:bg-rose-700 text-white font-bold flex-1 text-xs"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Body Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr] items-start">
        {/* Sidebar */}
        <aside className="bg-ink text-slate-300 p-3 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto space-y-4 text-xs font-medium hidden md:block">
          {/* Quick upload button */}
          <Link
            href="/admin/upload"
            className="btn acc sm block w-full text-center font-bold text-xs shadow-xs"
          >
            ⬆️ Upload Resources (U)
          </Link>

          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                      isActive
                        ? 'bg-white/15 text-white font-bold'
                        : 'hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="badge b-off text-[10px] py-0 px-1.5">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="p-4 sm:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
