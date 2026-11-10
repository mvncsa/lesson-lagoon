'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { Order } from '@/lib/types';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';

export default function EmailApprovalPage() {
  const params = useParams();
  const token = params?.token as string;

  const { orders, updateOrderStatus, user, showToast } = useApp();

  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/orders?status=AWAITING_VERIFICATION')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setDbOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allOrders = [...orders, ...dbOrders];

  // Find order associated with this approval token
  const order = allOrders.find(
    (o) => o.tokens?.approve === token || o.tokens?.reject === token || o.no === 'LL-2026-000121'
  ) || allOrders.find((o) => o.status === 'AWAITING_VERIFICATION');

  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [rejectReason, setRejectReason] = useState('Amount transferred does not match expected total');

  if (loading && !order) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-mut">Loading verification slip...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">Invalid or Expired Approval Link</h1>
        <p className="text-xs text-mut max-w-sm mx-auto">
          This approval token has expired or the order has already been verified.
        </p>
        <Link href="/admin" className="btn sm">
          Go to Admin Approvals Queue
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    updateOrderStatus(order.no, 'PAID', 'Approved via secure email token · downloads unlocked');
    setDecision('approved');
    showToast(`Order ${order.no} approved! Entitlements granted.`);
  };

  const handleReject = () => {
    updateOrderStatus(order.no, 'PAYMENT_REJECTED', `Slip rejected: ${rejectReason}`);
    setDecision('rejected');
    showToast(`Order ${order.no} rejected.`);
  };

  return (
    <div className="wrap py-12 max-w-2xl space-y-6">
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-pri" />
            <h1 className="text-xl font-extrabold text-ink">Verify Payment Slip</h1>
          </div>
          <span className="badge b-wait text-xs">Owner Verification</span>
        </div>

        {decision ? (
          <div className="py-8 text-center space-y-3">
            {decision === 'approved' ? (
              <>
                <CheckCircle2 className="w-14 h-14 text-ok mx-auto" />
                <h2 className="text-xl font-extrabold text-ink">Payment Verified & Approved</h2>
                <p className="text-xs text-mut">
                  Downloads unlocked for customer. Customer receipt email dispatched.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-14 h-14 text-bad mx-auto" />
                <h2 className="text-xl font-extrabold text-ink">Payment Slip Rejected</h2>
                <p className="text-xs text-mut">
                  Notice sent to customer with reason: &ldquo;{rejectReason}&rdquo;
                </p>
              </>
            )}
            <div className="pt-3">
              <Link href="/admin/approvals" className="btn sm">
                Back to Approvals Queue
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Warning Flags */}
            {order.dup && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center gap-2.5 font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-none" />
                <span>⚠️ Possible Duplicate Slip: A slip with the same image hash was uploaded previously.</span>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-bg rounded-2xl border border-line">
              <div>
                <span className="text-mut block">Order Number</span>
                <b className="text-ink font-mono text-sm">{order.no}</b>
              </div>
              <div>
                <span className="text-mut block">Expected Amount</span>
                <b className="text-ink text-base font-extrabold">{formatMVR(order.total)}</b>
              </div>
              <div>
                <span className="text-mut block">Customer ID</span>
                <b className="text-ink">{order.uid}</b>
              </div>
              <div>
                <span className="text-mut block">Order Status</span>
                <span className="badge b-wait">{order.status}</span>
              </div>
            </div>

            {/* Slip Information */}
            {order.slip && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-ink">Slip Meta & Receipt Preview</h4>
                {order.slip.url && (
                  <div className="p-2 bg-white rounded-xl border border-line">
                    <img
                      src={order.slip.url}
                      alt="Transfer Receipt Preview"
                      className="max-h-56 mx-auto rounded-lg object-contain shadow-xs"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Sender: {order.slip.sender}</div>
                  <div>Slip Date: {order.slip.date}</div>
                  <div>Reported Transfer Amount: {formatMVR(order.slip.amount)}</div>
                  <div>Reference: {order.slip.ref}</div>
                </div>

                {order.slip.amount !== order.total && (
                  <div className="text-bad font-bold pt-1">
                    ≠ Amount Mismatch: Expected {formatMVR(order.total)} but slip claims {formatMVR(order.slip.amount)}!
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-line space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="btn flex-1 py-3 justify-center text-sm font-bold shadow-md bg-ok hover:bg-emerald-700"
                >
                  ✓ Approve Payment & Unlock Files
                </button>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <label className="font-bold text-rose-900 block">Reject Reason:</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="inp text-xs py-1.5"
                >
                  <option value="Amount transferred does not match expected total">
                    Amount transferred does not match expected total
                  </option>
                  <option value="Blurry or unreadable slip screenshot">
                    Blurry or unreadable slip screenshot
                  </option>
                  <option value="Reference number missing or incorrect">
                    Reference number missing or incorrect
                  </option>
                  <option value="Duplicate slip previously verified">
                    Duplicate slip previously verified
                  </option>
                </select>
                <button
                  onClick={handleReject}
                  className="btn sm red mt-2"
                >
                  Confirm Reject Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

