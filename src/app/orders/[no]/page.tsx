'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatMVR, DEFAULT_DELIVERY_ZONES } from '@/lib/pricing';
import { INITIAL_BANK_DETAILS } from '@/lib/data';
import { Order } from '@/lib/types';
import {
  Copy,
  Check,
  Upload,
  CheckCircle,
  Clock,
  Printer,
  Package,
  Truck,
  Download,
} from 'lucide-react';

export default function OrderPage() {
  const params = useParams();
  const orderNo = params?.no as string;

  const { orders, uploadOrderSlip, showToast } = useApp();
  const contextOrder = orders.find((o) => o.no === orderNo);

  const [dbOrder, setDbOrder] = useState<Order | null>(null);
  const [loadingDb, setLoadingDb] = useState(!contextOrder);

  React.useEffect(() => {
    if (!contextOrder && orderNo) {
      setLoadingDb(true);
      fetch(`/api/orders?orderNo=${encodeURIComponent(orderNo)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            setDbOrder(data.orders[0]);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDb(false));
    }
  }, [contextOrder, orderNo]);

  const order = contextOrder || dbOrder;

  const [senderName, setSenderName] = useState('');
  const [transferRef, setTransferRef] = useState(orderNo || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  if (loadingDb) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-mut">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">Order Not Found</h1>
        <p className="text-xs text-mut">Could not find order number {orderNo}.</p>
        <Link href="/" className="btn sm">Return to Storefront</Link>
      </div>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSlipFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB limit.', 'error');
        return;
      }
      setSlipFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSlipPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setSlipPreview(null);
      }
    }
  };

  const handleSlipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      uploadOrderSlip(order.no, {
        amount: order.total,
        ref: transferRef,
        sender: senderName || 'Teacher Customer',
        date: new Date().toISOString().slice(0, 10),
        url: slipPreview || undefined,
      });
      setIsUploading(false);
      showToast('Slip uploaded! Our team has been notified.', 'success');
    }, 600);
  };

  const isPaid = order.status === 'PAID' || order.status === 'COMPLETED_FREE';
  const isAwaitingVerification = order.status === 'AWAITING_VERIFICATION';
  const hasPrint = !!order.deliveryDetails;

  return (
    <div className="wrap py-8 sm:py-12 max-w-4xl space-y-8">
      {/* Header & Status Banner */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-mut uppercase tracking-wider block">
              Order {order.no}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {isPaid
                ? 'Payment Approved · Resources Ready!'
                : isAwaitingVerification
                ? 'Slip Uploaded · Awaiting Verification'
                : 'Awaiting Bank Transfer'}
            </h1>
            <p className="text-xs text-mut mt-1">Placed on {order.at}</p>
          </div>

          <div>
            {order.status === 'PAID' ? (
              <span className="badge b-paid text-sm py-1.5 px-4 font-bold">
                ✓ Paid & Unlocked
              </span>
            ) : order.status === 'COMPLETED_FREE' ? (
              <span className="badge b-free text-sm py-1.5 px-4 font-bold">
                ✓ Free Claim
              </span>
            ) : order.status === 'AWAITING_VERIFICATION' ? (
              <span className="badge b-wait text-sm py-1.5 px-4 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin" /> Verifying Slip
              </span>
            ) : (
              <span className="badge b-off text-sm py-1.5 px-4 font-bold">
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Status Tracker Bar (Digital) */}
        <div className="pt-4 border-t border-line">
          <div className="flex items-center justify-between text-xs font-semibold mb-2 text-ink">
            <span>1. Order Placed</span>
            <span>2. Slip Uploaded</span>
            <span>3. Verified & Ready</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 flex overflow-hidden">
            <div className="bg-pri h-full w-1/3" />
            <div
              className={`h-full transition-all duration-300 ${
                isAwaitingVerification || isPaid ? 'bg-pri w-1/3' : 'bg-transparent w-1/3'
              }`}
            />
            <div
              className={`h-full transition-all duration-300 ${
                isPaid ? 'bg-pri w-1/3' : 'bg-transparent w-1/3'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Print Delivery Tracker (P1-PRN-07) */}
      {hasPrint && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-pri" />
            <h3 className="font-extrabold text-lg text-ink">Printed Copy Delivery Tracker</h3>
          </div>
          <p className="text-xs text-mut">
            Destination: {order.deliveryDetails?.recipient} · {order.deliveryDetails?.island},{' '}
            {order.deliveryDetails?.address} ({order.deliveryDetails?.phone})
          </p>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold pt-2">
            <div className="p-3 bg-white rounded-xl border border-[#BBF7D0] text-pri shadow-xs">
              <Package className="w-4 h-4 mx-auto mb-1" />
              <span>Print Queued</span>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-slate-200 text-mut">
              <Printer className="w-4 h-4 mx-auto mb-1" />
              <span>Printing</span>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-slate-200 text-mut">
              <Truck className="w-4 h-4 mx-auto mb-1" />
              <span>Out for Delivery</span>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-slate-200 text-mut">
              <CheckCircle className="w-4 h-4 mx-auto mb-1" />
              <span>Delivered</span>
            </div>
          </div>
        </div>
      )}

      {/* If Paid: Instant Download / Go to Library */}
      {isPaid ? (
        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <span className="text-5xl block">🎉</span>
          <h2 className="text-xl font-extrabold text-ink">Downloads Ready in Your Library</h2>
          <p className="text-xs text-mut max-w-md mx-auto">
            Your single-teacher classroom licence has been stamped. You can access and re-download your files anytime from your Library.
          </p>
          <div className="pt-2">
            <Link href="/library" className="btn sm">
              <Download className="w-4 h-4" /> Open My Library
            </Link>
          </div>
        </div>
      ) : (
        /* If Awaiting Transfer or Verification: Bank Details & Slip Upload (P1-PAY-01 & P1-PAY-02) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Bank Transfer Details with One-Tap Copy Buttons */}
          <div className="md:col-span-6 bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-ink">Bank Transfer Instructions</h3>
            <p className="text-xs text-mut">
              Please transfer the exact amount using your preferred BML mobile app or online banking.
            </p>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 bg-bg rounded-xl flex items-center justify-between border border-line">
                <div>
                  <span className="text-mut block">Bank Name</span>
                  <b className="text-ink text-sm">{INITIAL_BANK_DETAILS.bank}</b>
                </div>
              </div>

              <div className="p-3 bg-bg rounded-xl flex items-center justify-between border border-line">
                <div>
                  <span className="text-mut block">Account Name</span>
                  <b className="text-ink text-sm">{INITIAL_BANK_DETAILS.name}</b>
                </div>
              </div>

              <div className="p-3 bg-bg rounded-xl flex items-center justify-between border border-line">
                <div>
                  <span className="text-mut block">Account Number (MVR)</span>
                  <b className="text-ink text-sm font-mono">{INITIAL_BANK_DETAILS.number}</b>
                </div>
                <button
                  onClick={() => handleCopy(INITIAL_BANK_DETAILS.number, 'Account Number')}
                  className="btn xs ghost"
                >
                  {copiedKey === 'Account Number' ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-bg rounded-xl flex items-center justify-between border border-line">
                <div>
                  <span className="text-mut block">Exact Amount</span>
                  <b className="text-ink text-base font-extrabold">{formatMVR(order.total)}</b>
                </div>
                <button
                  onClick={() => handleCopy((order.total / 100).toFixed(2), 'Amount')}
                  className="btn xs ghost"
                >
                  {copiedKey === 'Amount' ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-bg rounded-xl flex items-center justify-between border border-line">
                <div>
                  <span className="text-mut block">Transfer Reference (Order Number)</span>
                  <b className="text-ink text-sm font-mono">{order.no}</b>
                </div>
                <button
                  onClick={() => handleCopy(order.no, 'Reference')}
                  className="btn xs ghost"
                >
                  {copiedKey === 'Reference' ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Slip Upload Box */}
          <div className="md:col-span-6 bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-ink">Upload Transfer Slip</h3>
            <p className="text-xs text-mut">
              Upload screenshot from BML App or payment confirmation slip (JPG, PNG, PDF up to 10MB).
            </p>

            {order.slip ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-3">
                <div className="flex items-center gap-2 text-pri font-bold">
                  <CheckCircle className="w-4 h-4" /> Slip Attached & In Review
                </div>
                {order.slip.url && (
                  <div className="p-2 bg-white rounded-xl border border-line">
                    <img
                      src={order.slip.url}
                      alt="Uploaded BML Slip"
                      className="max-h-48 mx-auto rounded-lg object-contain shadow-xs"
                    />
                  </div>
                )}
                <p className="text-slate-600">
                  Transferred MVR {(order.slip.amount / 100).toFixed(2)} on {order.slip.date} by {order.slip.sender}.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Our team is reviewing this slip. You will receive an email as soon as it is approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSlipSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Sender Name (as shown on BML)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mariyam Shifa"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Transfer Reference / Slip ID</label>
                  <input
                    type="text"
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    className="inp text-xs"
                  />
                </div>

                {/* Real file drop with instant thumbnail preview */}
                <label className="border-2 border-dashed border-slate-300 hover:border-pri rounded-2xl p-5 text-center bg-slate-50 hover:bg-teal-50/20 transition cursor-pointer block relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleSlipFileChosen}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {slipPreview ? (
                    <div className="space-y-2">
                      <img
                        src={slipPreview}
                        alt="Transfer Slip Preview"
                        className="max-h-40 mx-auto rounded-xl shadow-xs border border-line object-contain"
                      />
                      <span className="text-xs font-semibold text-pri block">
                        ✓ {slipFile?.name} (Click to change file)
                      </span>
                    </div>
                  ) : slipFile ? (
                    <div className="space-y-1">
                      <CheckCircle className="w-6 h-6 text-pri mx-auto" />
                      <span className="font-bold text-ink block">{slipFile.name}</span>
                      <span className="text-[11px] text-mut">Click to change file</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-mut mx-auto mb-1" />
                      <span className="font-bold text-ink block">Tap to select slip screenshot</span>
                      <span className="text-[11px] text-mut">Camera screenshot or PDF (up to 10MB)</span>
                    </div>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn block w-full py-3 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading slip...' : 'Submit Transfer Slip'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Item Details */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs text-xs">
        <h3 className="font-extrabold text-base text-ink">Order Items Summary</h3>
        <div className="divide-y divide-line">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <b className="text-ink font-bold block">{item.title}</b>
                <span className="text-mut">
                  {item.format === 'print' ? 'Digital + Printed Copy' : 'Digital Download'}
                </span>
              </div>
              <span className="font-bold text-ink">{formatMVR(item.final)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-line space-y-1 text-right text-mut">
          <div>Subtotal: {formatMVR(order.subtotal)}</div>
          {order.discount > 0 && <div className="text-acc">Discount: -{formatMVR(order.discount)}</div>}
          {order.pointsDiscount > 0 && <div className="text-amber-700">Points discount: -{formatMVR(order.pointsDiscount)}</div>}
          {order.printTotal > 0 && <div>Print total: +{formatMVR(order.printTotal)}</div>}
          {order.deliveryFee > 0 && <div>Delivery: +{formatMVR(order.deliveryFee)}</div>}
          <div className="font-extrabold text-base text-ink pt-1">Total: {formatMVR(order.total)}</div>
        </div>
      </div>
    </div>
  );
}

