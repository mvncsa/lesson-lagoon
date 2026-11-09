'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { calculateOrderPricing, formatMVR, DEFAULT_DELIVERY_ZONES } from '@/lib/pricing';
import { Printer, ShieldCheck, CreditCard, Landmark, CheckCircle, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    products,
    user,
    activeCampaign,
    coupons,
    createOrder,
    setIsSignInModalOpen,
  } = useApp();

  const [deliveryZoneId, setDeliveryZoneId] = useState('male');
  const [recipient, setRecipient] = useState(user?.name || '');
  const [phone, setPhone] = useState('+960 ');
  const [island, setIsland] = useState('Malé');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isPickup, setIsPickup] = useState(false);

  // Coupon code
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Points slider
  const [pointsToUse, setPointsToUse] = useState(0);

  // Agreements
  const [agreedTerms, setAgreedTerms] = useState(true);

  const productsMap = new Map(products.map((p) => [p.id, p]));
  const hasPrintItem = cart.some((it) => it.format === 'print');

  const appliedCoupon = coupons.find(
    (c) => c.code.toUpperCase() === (appliedCouponCode || '').toUpperCase() && c.active
  );

  const pricing = calculateOrderPricing(cart, productsMap, {
    user: user
      ? {
          id: user.id,
          points: user.points,
          welcome: user.welcome,
        }
      : null,
    activeCampaign,
    coupon: appliedCoupon,
    pointsToUse,
    deliveryZoneId,
    isPickup,
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active
    );
    if (!found) {
      setCouponError('Invalid or expired coupon code.');
    } else {
      setAppliedCouponCode(found.code);
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }

    if (!agreedTerms) {
      alert('Please agree to the terms and licence to place your order.');
      return;
    }

    if (hasPrintItem && !isPickup) {
      if (!recipient || !address || phone.trim().length < 8) {
        alert('Please complete the delivery details (Recipient name, mobile number, and address).');
        return;
      }
    }

    const orderNo = `LL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const isFree = pricing.totalCash === 0;

    const orderItems = pricing.items.map((it) => ({
      pid: it.pid,
      title: it.product.title,
      list: it.listPrice,
      final: it.finalDigitalCash,
      format: it.format,
      printDetails:
        it.format === 'print' && it.printConfig
          ? {
              colour: it.printConfig.colour,
              binding: it.printConfig.binding,
              paper: it.printConfig.paper,
              qty: it.printConfig.qty,
              unitPrice: Math.round(it.printCost / it.printConfig.qty),
              lineTotal: it.printCost,
            }
          : undefined,
    }));

    const selectedZone = DEFAULT_DELIVERY_ZONES.find((z) => z.id === deliveryZoneId);

    createOrder({
      no: orderNo,
      uid: user.id,
      items: orderItems,
      subtotal: pricing.subtotal,
      discount: pricing.discountTotal,
      pointsUsed: pricing.pointsUsed,
      pointsDiscount: pricing.pointsDiscountTotal,
      printTotal: pricing.printSubtotal,
      deliveryFee: pricing.deliveryFee,
      deliveryDetails: hasPrintItem
        ? {
            zoneId: deliveryZoneId,
            zoneName: selectedZone?.name || 'Malé',
            fee: pricing.deliveryFee,
            recipient,
            phone,
            island,
            address,
            notes,
            isPickup,
            status: 'PRINT_QUEUED',
          }
        : undefined,
      total: pricing.totalCash,
      status: isFree ? 'COMPLETED_FREE' : 'AWAITING_TRANSFER',
      at: new Date().toISOString().slice(0, 16),
      method: isFree ? 'Free' : 'Bank transfer',
      earned: pricing.pointsToEarn,
      log: [
        {
          at: new Date().toISOString().slice(0, 16),
          ev: isFree ? 'Order completed free' : 'Order placed · awaiting bank transfer',
        },
      ],
    });

    if (isFree) {
      router.push('/library');
    } else {
      router.push(`/orders/${orderNo}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <span className="text-5xl block">🛒</span>
        <h1 className="text-2xl font-extrabold text-ink">Your cart is empty</h1>
        <p className="text-xs text-mut max-w-sm mx-auto">
          Add worksheets, flashcards, or slide decks to your cart before proceeding to checkout.
        </p>
        <Link href="/#all" className="btn sm">
          Browse Teaching Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Checkout</h1>
        <p className="text-xs text-mut mt-1">One-page secure checkout · Instant download on approval</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form Steps 1 to 5 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Account Section (P1-CHK-04 Step 1) */}
          <div className="box">
            <h3 className="font-extrabold text-base text-ink mb-3">1. Account Details</h3>
            {user ? (
              <div className="flex items-center justify-between p-3.5 bg-bg rounded-2xl border border-line">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-acc text-white font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink">{user.name}</p>
                    <p className="text-xs text-mut">{user.email}</p>
                  </div>
                </div>
                <span className="badge b-free text-xs">Signed In with Google</span>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                <p className="text-xs font-semibold text-amber-900">
                  Please sign in with your Google account to complete this order and unlock your library.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSignInModalOpen(true)}
                  className="btn sm"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          {/* 2. Format per Item (P1-CHK-04 Step 2) */}
          <div className="box space-y-3">
            <h3 className="font-extrabold text-base text-ink mb-3">2. Order Format</h3>
            {pricing.items.map((line) => (
              <div
                key={line.pid}
                className="flex items-center justify-between p-3 bg-bg rounded-xl border border-line text-xs"
              >
                <div>
                  <b className="text-ink font-bold block">{line.product.title}</b>
                  <span className="text-mut">
                    {line.format === 'print' ? '🖨️ Digital + Printed Copy' : '⚡ Digital Download Only'}
                  </span>
                </div>
                <span className="font-bold text-ink">
                  {formatMVR(line.discountedPrice + line.printCost)}
                </span>
              </div>
            ))}
          </div>

          {/* 3. Delivery Details (Shown ONLY if printed copy chosen) (P1-PRN-03) */}
          {hasPrintItem && (
            <div className="box space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-ink">
                  3. Printed Copy Delivery Details
                </h3>
                <span className="badge b-blue text-xs">Print Option Selected</span>
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                  Select Delivery Zone
                </label>
                <select
                  value={deliveryZoneId}
                  onChange={(e) => setDeliveryZoneId(e.target.value)}
                  className="inp text-xs font-medium"
                >
                  {DEFAULT_DELIVERY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatMVR(zone.fee)} ({zone.eta})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full recipient name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="inp text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Mobile Number (+960) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+960 7xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="inp text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Island / Atoll *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malé, Hulhumalé, Kulhudhuffushi"
                    value={island}
                    onChange={(e) => setIsland(e.target.value)}
                    className="inp text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Delivery Address / House / Boat Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M. Daisy Villa, 3rd Floor"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="inp text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-xs">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please leave at school reception or call on arrival"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="inp text-xs"
                />
              </div>
            </div>
          )}

          {/* 4. Payment Method (P1-CHK-04 Step 4) */}
          <div className="box space-y-3">
            <h3 className="font-extrabold text-base text-ink mb-3">
              {hasPrintItem ? '4' : '3'}. Payment Method
            </h3>

            {/* Bank Transfer (Active) */}
            <div className="p-4 rounded-2xl border-2 border-pri bg-[#F2FBF9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-pri" />
                <div>
                  <b className="font-bold text-sm text-ink block">Bank of Maldives (BML) Transfer</b>
                  <span className="text-xs text-mut">Transfer exact amount & upload slip on next page</span>
                </div>
              </div>
              <span className="badge b-free text-xs">Active</span>
            </div>

            {/* Card Gateway - Disabled "Coming Soon" (P1-CHK-04) */}
            <div className="p-4 rounded-2xl border border-line bg-slate-50 flex items-center justify-between opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <b className="font-bold text-sm text-slate-500 block">BML Gateway / Visa / Mastercard</b>
                  <span className="text-xs text-slate-400">Card payment integration coming in Phase 2</span>
                </div>
              </div>
              <span className="badge b-grey text-[10px]">Coming Soon</span>
            </div>
          </div>

          {/* 5. Agreement Checklist (P1-CHK-04 Step 5) */}
          <div className="box text-xs text-mut space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-pri focus:ring-pri"
              />
              <span className="text-slate-700 leading-relaxed">
                I agree to the <Link href="/terms" className="text-pri underline">Terms of Service</Link>, Single-Teacher Classroom Licence, and acknowledge that digital downloads are available immediately upon payment verification.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Order Summary & Points Slider (P1-CHK-04 Step 6) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-lg text-ink">Order Summary</h3>

            {/* Coupon Code Field */}
            <div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. TEACH10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="inp text-xs py-2 flex-1 uppercase"
                />
                <button type="submit" className="btn sm ghost">
                  Apply
                </button>
              </form>
              {appliedCouponCode && (
                <div className="mt-1.5 text-xs text-ok font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Coupon &ldquo;{appliedCouponCode}&rdquo; applied!
                </div>
              )}
              {couponError && (
                <div className="mt-1.5 text-xs text-bad">{couponError}</div>
              )}
            </div>

            {/* Points Slider (P1-PTS-03) */}
            {user && user.points >= 100 && pricing.maxPointsUsable > 0 && (
              <div className="p-4 bg-[#FFF8E1] border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    🪙 Redeem Points ({user.points} available)
                  </span>
                  <span className="font-extrabold text-amber-900">
                    -{formatMVR(pointsToUse * 10)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={Math.min(user.points, pricing.maxPointsUsable)}
                  step="10"
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(parseInt(e.target.value, 10))}
                  className="w-full accent-pri cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-amber-800">
                  <span>Using: {pointsToUse} pts</span>
                  <span>Max usable: {Math.min(user.points, pricing.maxPointsUsable)} pts</span>
                </div>
              </div>
            )}

            {/* Calculation Lines (P1-PRN-05) */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-line">
              <div className="flex justify-between text-mut">
                <span>Items Subtotal</span>
                <span>{formatMVR(pricing.subtotal)}</span>
              </div>

              {pricing.discountTotal > 0 && (
                <div className="flex justify-between text-acc font-semibold">
                  <span>Promotions & Coupons</span>
                  <span>-{formatMVR(pricing.discountTotal)}</span>
                </div>
              )}

              {pricing.pointsDiscountTotal > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Loyalty Points Discount ({pricing.pointsUsed} pts)</span>
                  <span>-{formatMVR(pricing.pointsDiscountTotal)}</span>
                </div>
              )}

              {pricing.printSubtotal > 0 && (
                <div className="flex justify-between text-mut">
                  <span>Printing Cost</span>
                  <span>+{formatMVR(pricing.printSubtotal)}</span>
                </div>
              )}

              {hasPrintItem && (
                <div className="flex justify-between text-mut">
                  <span>Delivery ({pricing.deliveryZoneName})</span>
                  <span>{formatMVR(pricing.deliveryFee)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-xl text-ink pt-3 border-t border-line">
                <span>Total Due</span>
                <span>{formatMVR(pricing.totalCash)}</span>
              </div>
            </div>

            {/* Points to Earn Badge */}
            {pricing.pointsToEarn > 0 && (
              <div className="bg-[#FFF8E1] text-amber-900 border border-amber-200 px-3 py-2 rounded-xl text-xs flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Points earned on cash:
                </span>
                <span>+{pricing.pointsToEarn} pts</span>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!agreedTerms || !user}
              className="btn acc block w-full py-3.5 text-center text-sm font-extrabold shadow-md disabled:opacity-50"
            >
              {pricing.totalCash === 0
                ? 'Claim Free Order'
                : `Place Order · ${formatMVR(pricing.totalCash)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

