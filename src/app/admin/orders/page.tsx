'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { Order } from '@/lib/types';
import {
  Search,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Eye,
  Mail,
  RotateCcw,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmCashOrderNo, setConfirmCashOrderNo] = useState<string | null>(null);

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
    const headers = ['OrderNo,Customer,Total_MVR,Status,Date,Method,ItemsCount\n'];
    const rows = filtered.map(
      (o) =>
        `${o.no},${o.uid},${(o.total / 100).toFixed(2)},${o.status},${o.at},${o.method},${o.items.length}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Orders exported to CSV.');
  };

  const handleMarkAsPaidCash = (orderNo: string) => {
    updateOrderStatus(orderNo, 'PAID', 'Marked as paid in cash/other by admin');
    setConfirmCashOrderNo(null);
    if (selectedOrder?.no === orderNo) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'PAID' } : null));
    }
    showToast(`Order ${orderNo} marked as Paid (Cash/Other). Downloads unlocked!`, 'success');
  };

  const handleResendInstructions = (orderNo: string, email: string) => {
    showToast(`Payment instructions re-sent to ${email} for order ${orderNo}.`, 'info');
  };

  const handleExpireOverdue = (orderNo: string) => {
    updateOrderStatus(orderNo, 'EXPIRED', 'Marked expired due to overdue payment');
    if (selectedOrder?.no === orderNo) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
    }
    showToast(`Order ${orderNo} marked as Expired.`, 'info');
  };

  const handleRefund = (orderNo: string) => {
    if (confirm(`Are you sure you want to refund order ${orderNo}? Access will be revoked.`)) {
      updateOrderStatus(orderNo, 'REFUNDED', 'Order refunded by owner; access revoked');
      if (selectedOrder?.no === orderNo) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'REFUNDED' } : null));
      }
      showToast(`Order ${orderNo} refunded and access revoked.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Monitor bank transfers, free downloads, and timeline audits (P1-ORD-01).
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn sm ghost flex items-center gap-1.5 shadow-2xs">
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
            className="inp text-xs py-1.5 w-44"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
            <option value="AWAITING_TRANSFER">Awaiting Transfer</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED_FREE">Free Claim</option>
            <option value="PAYMENT_REJECTED">Rejected</option>
            <option value="REFUNDED">Refunded</option>
            <option value="EXPIRED">Expired</option>
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
              <tr key={o.no} className="hover:bg-slate-50/60 transition">
                <td className="font-bold text-ink font-mono">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="hover:text-pri font-bold flex items-center gap-1 text-left"
                    >
                      {o.no}
                    </button>
                    <Link
                      href={`/orders/${o.no}`}
                      target="_blank"
                      className="text-mut hover:text-pri"
                      title="View Customer Order Page"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
                <td className="text-mut">{o.uid}</td>
                <td>
                  <span className="font-semibold text-slate-700">
                    {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                  </span>
                  {o.deliveryDetails && (
                    <span className="badge b-blue ml-2 text-[10px]">Print</span>
                  )}
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
                        : o.status === 'REFUNDED'
                        ? 'b-rej'
                        : 'b-grey'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="text-mut">{o.at}</td>
                <td className="text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="btn xs ghost"
                    title="View details & timeline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {o.status === 'AWAITING_VERIFICATION' && (
                    <Link
                      href="/admin/approvals"
                      className="btn xs bg-ok hover:bg-emerald-700 text-white font-bold"
                    >
                      Verify
                    </Link>
                  )}

                  {o.status === 'AWAITING_TRANSFER' && (
                    <button
                      onClick={() => setConfirmCashOrderNo(o.no)}
                      className="btn xs acc"
                      title="Mark Paid in Cash"
                    >
                      Mark Paid
                    </button>
                  )}

                  {o.status === 'PAID' && (
                    <button
                      onClick={() => handleRefund(o.no)}
                      className="btn xs ghost text-bad hover:bg-rose-50"
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

      {/* Confirmation Modal: Mark Paid in Cash / Other */}
      {confirmCashOrderNo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-line shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mx-auto">
              💵
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-base text-ink">Confirm Cash / Other Payment</h3>
              <p className="text-xs text-mut mt-1">
                Mark order <b>{confirmCashOrderNo}</b> as paid? This will immediately unlock digital downloads and send the receipt email.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmCashOrderNo(null)}
                className="btn sm ghost flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkAsPaidCash(confirmCashOrderNo)}
                className="btn sm acc flex-1 text-xs font-bold"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Audit Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-line shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-[11px] font-bold text-mut uppercase tracking-wider block">
                  Order Details & Audit
                </span>
                <h2 className="text-xl font-extrabold text-ink font-mono">
                  {selectedOrder.no}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-bg rounded-2xl border border-line flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-mut block">Customer</span>
                <b className="text-ink">{selectedOrder.uid}</b>
              </div>
              <div>
                <span className="text-mut block">Order Status</span>
                <span className="badge b-wait">{selectedOrder.status}</span>
              </div>
              <div>
                <span className="text-mut block">Total Amount</span>
                <b className="text-ink font-extrabold text-sm">{formatMVR(selectedOrder.total)}</b>
              </div>
              <div>
                <span className="text-mut block">Date Placed</span>
                <span className="text-slate-700">{selectedOrder.at}</span>
              </div>
            </div>

            {/* Slip Thumbnail (if uploaded) */}
            {selectedOrder.slip && (
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-3 text-xs">
                <span className="font-bold text-pri uppercase tracking-wider block">
                  Transfer Slip & Sender Info
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1 text-slate-700">
                    <p><b>Sender Name:</b> {selectedOrder.slip.sender}</p>
                    <p><b>Reported Amount:</b> {formatMVR(selectedOrder.slip.amount)}</p>
                    <p><b>Transfer Ref:</b> <code className="bg-white px-1 py-0.5 rounded border">{selectedOrder.slip.ref}</code></p>
                    <p><b>Date:</b> {selectedOrder.slip.date}</p>
                  </div>
                  {selectedOrder.slip.url && (
                    <div className="bg-white p-2 rounded-xl border border-line text-center">
                      <img
                        src={selectedOrder.slip.url}
                        alt="Slip Receipt"
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchased Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-ink uppercase tracking-wider block">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-line border border-line rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <b className="text-ink block">{item.title}</b>
                      <span className="text-mut">
                        Format: {item.format === 'print' ? 'Printed Hardcopy' : 'Digital PDF'}
                      </span>
                    </div>
                    <b className="text-ink">{formatMVR(item.final)}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Audit Log */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-ink uppercase tracking-wider block">
                Order Timeline Audit (P1-ORD-01)
              </span>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
                {selectedOrder.log && selectedOrder.log.length > 0 ? (
                  selectedOrder.log.map((entry, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-mut">{entry.at}</span>
                      <span className="text-slate-800">→ {entry.ev}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-mut">
                    {selectedOrder.at} → Order created via {selectedOrder.method}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line text-xs">
              <button
                onClick={() =>
                  handleResendInstructions(selectedOrder.no, selectedOrder.uid)
                }
                className="btn xs ghost flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Resend Instructions
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'AWAITING_TRANSFER' && (
                  <>
                    <button
                      onClick={() => handleExpireOverdue(selectedOrder.no)}
                      className="btn xs ghost text-mut"
                    >
                      Expire Overdue
                    </button>
                    <button
                      onClick={() => setConfirmCashOrderNo(selectedOrder.no)}
                      className="btn xs acc font-bold"
                    >
                      Mark Paid (Cash)
                    </button>
                  </>
                )}

                {selectedOrder.status === 'PAID' && (
                  <button
                    onClick={() => handleRefund(selectedOrder.no)}
                    className="btn xs ghost text-bad"
                  >
                    Refund Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
