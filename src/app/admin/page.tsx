'use client';

import React from 'react';
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
  ArrowUpRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, products, reviews, resourceRequests } = useApp();

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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Store performance, fulfillment alerts, and daily sales metrics.
          </p>
        </div>

        <Link href="/admin/upload" className="btn sm acc">
          ⬆️ Upload New Resources
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

