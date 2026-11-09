'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { Search, Download, Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.no.toLowerCase().includes(q) ||
        o.uid.toLowerCase().includes(q) ||
        (o.slip?.sender && o.slip.sender.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['OrderNo,Customer,Total_MVR,Status,Date,Method\n'];
    const rows = filtered.map((o) =>
      `${o.no},${o.uid},${(o.total / 100).toFixed(2)},${o.status},${o.at},${o.method}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Orders exported to CSV.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Monitor bank transfers, free downloads, and timeline audits.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn sm ghost flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export Orders CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-line">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-mut" />
            <input
              type="text"
              placeholder="Search order no, customer, sender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="inp text-xs pl-9 py-1.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="inp text-xs py-1.5 w-40"
          >
            <option value="all">All Statuses</option>
            <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
            <option value="AWAITING_TRANSFER">Awaiting Transfer</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED_FREE">Free Claim</option>
            <option value="PAYMENT_REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs">
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.no}>
                <td className="font-bold text-ink font-mono">
                  <Link href={`/orders/${o.no}`} className="hover:text-pri flex items-center gap-1">
                    <span>{o.no}</span>
                    <ArrowUpRight className="w-3 h-3 text-mut" />
                  </Link>
                </td>
                <td>{o.uid}</td>
                <td>
                  <span className="font-semibold text-slate-700">
                    {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                  </span>
                  {o.deliveryDetails && <span className="badge b-blue ml-2 text-[10px]">Print</span>}
                </td>
                <td className="font-extrabold text-ink">{formatMVR(o.total)}</td>
                <td>{o.method}</td>
                <td>
                  <span
                    className={`badge ${
                      o.status === 'PAID'
                        ? 'b-paid'
                        : o.status === 'COMPLETED_FREE'
                        ? 'b-free'
                        : o.status === 'AWAITING_VERIFICATION'
                        ? 'b-wait'
                        : 'b-rej'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="text-mut">{o.at}</td>
                <td className="text-right">
                  {o.status === 'AWAITING_VERIFICATION' && (
                    <Link
                      href="/admin/approvals"
                      className="btn xs bg-ok hover:bg-emerald-700 text-white"
                    >
                      Verify
                    </Link>
                  )}
                  {o.status === 'PAID' && (
                    <button
                      onClick={() => updateOrderStatus(o.no, 'REFUNDED', 'Refunded by owner')}
                      className="btn xs ghost text-bad"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

