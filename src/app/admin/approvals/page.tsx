'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ApprovalsQueuePage() {
  const { orders, updateOrderStatus, showToast } = useApp();

  const awaitingOrders = orders.filter((o) => o.status === 'AWAITING_VERIFICATION');

  const [rejectingOrderNo, setRejectingOrderNo] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Amount mismatch on transfer slip');

  const handleApprove = (orderNo: string) => {
    updateOrderStatus(orderNo, 'PAID', 'Approved in admin approvals queue · downloads unlocked');
    showToast(`Order ${orderNo} approved! Entitlements granted.`);
  };

  const handleReject = (orderNo: string) => {
    updateOrderStatus(orderNo, 'PAYMENT_REJECTED', `Rejected: ${rejectReason}`);
    setRejectingOrderNo(null);
    showToast(`Order ${orderNo} marked rejected.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Approvals Queue
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Review uploaded BML transfer slips, verify totals, and grant classroom access.
        </p>
      </div>

      {awaitingOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-line space-y-3">
          <CheckCircle2 className="w-12 h-12 text-ok mx-auto" />
          <h3 className="font-extrabold text-lg text-ink">All caught up!</h3>
          <p className="text-xs text-mut">There are currently no payment slips awaiting verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {awaitingOrders.map((o) => {
            const isMismatch = o.slip && o.slip.amount !== o.total;

            return (
              <div
                key={o.no}
                className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                      BML
                    </span>
                    <div>
                      <b className="font-extrabold text-base text-ink block font-mono">{o.no}</b>
                      <span className="text-xs text-mut">Placed by {o.uid} on {o.at}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {o.dup && (
                      <span className="badge b-off flex items-center gap-1 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" /> Duplicate Slip Warning
                      </span>
                    )}
                    {isMismatch && (
                      <span className="badge b-rej text-xs font-bold">
                        ≠ Amount Mismatch
                      </span>
                    )}
                    <span className="badge b-wait text-xs font-bold">
                      Awaiting Verification
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                  {/* Order & Items summary */}
                  <div className="md:col-span-6 space-y-2">
                    <span className="font-bold text-mut uppercase tracking-wider block">
                      Order Items
                    </span>
                    <div className="bg-bg rounded-2xl p-4 border border-line space-y-2">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-semibold text-ink">{it.title}</span>
                          <span className="font-bold">{formatMVR(it.final)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-line flex justify-between font-extrabold text-sm text-ink">
                        <span>Expected Total:</span>
                        <span>{formatMVR(o.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slip Meta */}
                  <div className="md:col-span-6 space-y-2">
                    <span className="font-bold text-mut uppercase tracking-wider block">
                      Transfer Slip Info
                    </span>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-mut">Sender Name:</span>
                        <b className="text-ink">{o.slip?.sender || 'Unknown'}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mut">Reported Amount:</span>
                        <b className={isMismatch ? 'text-bad font-black' : 'text-ink font-bold'}>
                          {o.slip ? formatMVR(o.slip.amount) : 'Not specified'}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mut">Slip Reference:</span>
                        <b className="font-mono">{o.slip?.ref || 'None'}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mut">Transfer Date:</span>
                        <span>{o.slip?.date || 'Today'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
                  {rejectingOrderNo === o.no ? (
                    <div className="flex items-center gap-2 text-xs">
                      <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="inp text-xs py-1.5"
                      >
                        <option value="Amount mismatch on transfer slip">Amount mismatch</option>
                        <option value="Blurry / unreadable screenshot">Blurry image</option>
                        <option value="Incorrect account transfer">Incorrect account</option>
                      </select>
                      <button
                        onClick={() => handleReject(o.no)}
                        className="btn sm red"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingOrderNo(null)}
                        className="btn sm ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRejectingOrderNo(o.no)}
                        className="btn sm ghost text-bad border-bad/30 hover:border-bad"
                      >
                        Reject Slip
                      </button>
                      <button
                        onClick={() => handleApprove(o.no)}
                        className="btn sm bg-ok hover:bg-emerald-700 text-white shadow-xs"
                      >
                        ✓ Approve & Unlock Files
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

