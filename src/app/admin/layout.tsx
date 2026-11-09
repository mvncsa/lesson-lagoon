'use client';

import React from 'react';
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
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, orders, reviews, resourceRequests, switchUserRole } = useApp();

  // P1-AUTH-07: Admin access requires allowlist / role = ADMIN
  const isAdmin =
    user &&
    (user.role === 'ADMIN' ||
      user.email?.toLowerCase() === 'mvncsa@gmail.com' ||
      user.email?.toLowerCase() === 'owner@lessonlagoon.mv');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-line shadow-xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h1 className="text-xl font-black text-ink mb-2">Not an admin account</h1>
          <p className="text-xs text-mut leading-relaxed mb-6">
            The account ({user?.email || 'Guest'}) does not have administrator access. LessonLagoon admin requires your Google account to be on the verified allowlist.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => switchUserRole('admin')}
              className="btn acc w-full text-xs font-bold"
            >
              Sign In as Admin
            </button>
            <Link href="/" className="btn sm w-full block text-xs">
              Return to Storefront
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
      <header className="sticky top-0 z-40 bg-white border-b border-line px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-black text-ink text-base tracking-tight">
            <span>🏝️</span>
            <span>LessonLagoon</span>
            <span className="badge b-wait text-[10px] font-extrabold">ADMIN</span>
          </Link>

          <span className="text-slate-300">|</span>

          <Link href="/" className="text-xs text-mut hover:text-pri flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> View Storefront
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-mut">Owner: Shaina Ali</span>
          <div className="w-8 h-8 rounded-full bg-ink text-white font-bold flex items-center justify-center text-xs">
            S
          </div>
        </div>
      </header>

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

