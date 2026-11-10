'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { Sliders, RefreshCw, CheckCircle2, Calculator } from 'lucide-react';

export default function PricingRulesCentrePage() {
  const { pricingSettings, updatePricingSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'defaults' | 'points' | 'printing' | 'delivery' | 'offers'>('defaults');

  // Working copy state
  const [settings, setSettings] = useState(pricingSettings);

  React.useEffect(() => {
    setSettings(pricingSettings);
  }, [pricingSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingSettings(settings);
    showToast('Pricing rules saved and live on storefront!');
  };

  const handleResetToDefault = (key: keyof typeof settings, defaultVal: any) => {
    setSettings((prev) => ({ ...prev, [key]: defaultVal }));
    showToast(`Reset ${key} to default value.`);
  };

  // Live recalculator simulation
  const sampleResourcePriceMvr = 100;
  const sampleCampaignDiscountPct = 15;
  const sampleDiscounted = sampleResourcePriceMvr * (1 - sampleCampaignDiscountPct / 100);
  const sampleMaxPointsAllowed = Math.floor((sampleDiscounted * (settings.maxPointsPct / 100)) * settings.ptsPerMVRValue);
  const samplePointsDiscountMvr = sampleMaxPointsAllowed / settings.ptsPerMVRValue;
  const sampleCustomerPaysMvr = sampleDiscounted - samplePointsDiscountMvr;
  const samplePointsEarned = Math.floor(sampleCustomerPaysMvr * settings.ptsPerMVR);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Pricing & Rules Centre
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Single control centre for all prices, points values, print fees, delivery rates, and reward rules.
          </p>
        </div>

        <button onClick={handleSave} className="btn sm">
          Save All Rules Now
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'defaults', label: 'Resource Defaults' },
          { id: 'points', label: 'Points & Loyalty' },
          { id: 'printing', label: 'Print Rates' },
          { id: 'delivery', label: 'Delivery Zones' },
          { id: 'offers', label: 'Offers & Birthday' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 transition whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-pri text-pri'
                : 'border-transparent text-mut hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* TAB 1: RESOURCE DEFAULTS */}
          {activeTab === 'defaults' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-ink">New Upload Defaults</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Default Price for New Uploads (MVR)</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('defaultPrice', 50)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (50)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.defaultPrice}
                    onChange={(e) => setSettings({ ...settings, defaultPrice: parseFloat(e.target.value) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Used as the suggested price on file drop.</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Default Min Price Floor (%)</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('defaultMinPct', 20)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (20%)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.defaultMinPct}
                    onChange={(e) => setSettings({ ...settings, defaultMinPct: parseFloat(e.target.value) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Discounts and coupons cannot reduce price below this floor.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Free Claims Daily Limit</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('freeDailyLimit', 20)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (20)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.freeDailyLimit}
                    onChange={(e) => setSettings({ ...settings, freeDailyLimit: parseInt(e.target.value, 10) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Max free downloads per teacher account per day.</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Default Preview Pages Count</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('defaultPreviewPages', 3)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (3)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.defaultPreviewPages}
                    onChange={(e) => setSettings({ ...settings, defaultPreviewPages: parseInt(e.target.value, 10) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Number of sample pages stamped with watermark.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POINTS & LOYALTY */}
          {activeTab === 'points' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-ink">Loyalty Points Valuation & Caps</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Points per MVR 1 of Value</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('ptsPerMVRValue', 10)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (10)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.ptsPerMVRValue}
                    onChange={(e) => setSettings({ ...settings, ptsPerMVRValue: parseInt(e.target.value, 10) || 10 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">10 points = MVR 1.00 at checkout redemption.</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Max % Payable with Points</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('maxPointsPct', 80)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (80%)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.maxPointsPct}
                    onChange={(e) => setSettings({ ...settings, maxPointsPct: parseInt(e.target.value, 10) || 80 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Customer always pays at least 20% in cash.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Google Sign-up Bonus (pts)</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('signupPts', 50)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (50)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.signupPts}
                    onChange={(e) => setSettings({ ...settings, signupPts: parseInt(e.target.value, 10) || 50 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-ink">Approved Review Reward (pts)</label>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault('reviewPts', 20)}
                      className="text-[10px] text-pri underline"
                    >
                      Reset (20)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings.reviewPts}
                    onChange={(e) => setSettings({ ...settings, reviewPts: parseInt(e.target.value, 10) || 20 })}
                    className="inp text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINT RATES */}
          {activeTab === 'printing' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-ink">Printing Charge Rates</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">B&W Rate Per Page (MVR)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.bwPageRate}
                    onChange={(e) => setSettings({ ...settings, bwPageRate: parseFloat(e.target.value) || 1.0 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Colour Rate Per Page (MVR)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.colourPageRate}
                    onChange={(e) => setSettings({ ...settings, colourPageRate: parseFloat(e.target.value) || 3.0 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Spiral Binding Surcharge (MVR)</label>
                  <input
                    type="number"
                    value={settings.spiralRate}
                    onChange={(e) => setSettings({ ...settings, spiralRate: parseFloat(e.target.value) || 25.0 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Minimum Charge Per Copy (MVR)</label>
                  <input
                    type="number"
                    value={settings.minPrintCharge}
                    onChange={(e) => setSettings({ ...settings, minPrintCharge: parseFloat(e.target.value) || 20.0 })}
                    className="inp text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY ZONES */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-ink">Island Delivery Zones & Fees</h3>

              <div className="space-y-3">
                <div className="p-3 bg-bg rounded-2xl flex items-center justify-between border border-line">
                  <div>
                    <b className="text-ink block">Pick up (Owner Address)</b>
                    <span className="text-mut">When ready</span>
                  </div>
                  <span className="font-bold text-ok">FREE</span>
                </div>

                <div className="p-3 bg-bg rounded-2xl flex items-center justify-between border border-line">
                  <div>
                    <b className="text-ink block">Malé, Villimalé</b>
                    <span className="text-mut">1–2 days after printing</span>
                  </div>
                  <b className="text-ink">MVR 30.00</b>
                </div>

                <div className="p-3 bg-bg rounded-2xl flex items-center justify-between border border-line">
                  <div>
                    <b className="text-ink block">Hulhumalé</b>
                    <span className="text-mut">1–2 days</span>
                  </div>
                  <b className="text-ink">MVR 40.00</b>
                </div>

                <div className="p-3 bg-bg rounded-2xl flex items-center justify-between border border-line">
                  <div>
                    <b className="text-ink block">Greater Malé (Thilafushi, Gulhifalhu)</b>
                    <span className="text-mut">2–3 days</span>
                  </div>
                  <b className="text-ink">MVR 60.00</b>
                </div>

                <div className="p-3 bg-bg rounded-2xl flex items-center justify-between border border-line">
                  <div>
                    <b className="text-ink block">Other Atolls (Ferry / Boat Cargo Pickup)</b>
                    <span className="text-mut">3–7 days</span>
                  </div>
                  <b className="text-ink">MVR 100.00</b>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFERS & BIRTHDAY */}
          {activeTab === 'offers' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-ink">Welcome Offer & Annual Birthday Special</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Welcome Discount (%)</label>
                  <input
                    type="number"
                    value={settings.welcomePct}
                    onChange={(e) => setSettings({ ...settings, welcomePct: parseInt(e.target.value, 10) || 20 })}
                    className="inp text-xs"
                  />
                  <span className="text-[11px] text-mut">Applied to customer's first paid order.</span>
                </div>

                <div>
                  <label className="font-bold block mb-1">Birthday Bonus Points</label>
                  <input
                    type="number"
                    value={settings.birthdayBonusPts}
                    onChange={(e) => setSettings({ ...settings, birthdayBonusPts: parseInt(e.target.value, 10) || 100 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Birthday Coupon Discount (%)</label>
                  <input
                    type="number"
                    value={settings.birthdayCouponPct}
                    onChange={(e) => setSettings({ ...settings, birthdayCouponPct: parseInt(e.target.value, 10) || 25 })}
                    className="inp text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Birthday Window (Days either side)</label>
                  <input
                    type="number"
                    value={settings.birthdayWindowDays}
                    onChange={(e) => setSettings({ ...settings, birthdayWindowDays: parseInt(e.target.value, 10) || 7 })}
                    className="inp text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn sm">
            Save Changes
          </button>
        </form>

        {/* Live Example Recalculator Box (P1-PRC-03) */}
        <div className="lg:col-span-4 bg-[#F2FBF9] border border-[#BFE8E2] rounded-3xl p-6 space-y-4 shadow-xs sticky top-24">
          <div className="flex items-center gap-2 text-pri font-extrabold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Live Recalculator Example</span>
          </div>

          <p className="text-xs text-mut leading-relaxed">
            See how your rules calculate for a customer purchasing an MVR 100 resource during a 15% campaign:
          </p>

          <div className="space-y-2 text-xs pt-2 border-t border-[#BFE8E2]">
            <div className="flex justify-between">
              <span className="text-mut">List Price:</span>
              <b>MVR {sampleResourcePriceMvr}.00</b>
            </div>
            <div className="flex justify-between text-acc font-semibold">
              <span>15% Campaign Discount:</span>
              <span>-MVR {(sampleResourcePriceMvr - sampleDiscounted).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mut">Price after discount:</span>
              <b>MVR {sampleDiscounted.toFixed(2)}</b>
            </div>
            <div className="flex justify-between text-amber-800 font-semibold">
              <span>Max Points Allowed ({settings.maxPointsPct}%):</span>
              <span>{sampleMaxPointsAllowed} pts (-MVR {samplePointsDiscountMvr.toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-ink pt-2 border-t border-[#BFE8E2]">
              <span>Customer Pays Cash:</span>
              <span>MVR {sampleCustomerPaysMvr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ok font-bold pt-1">
              <span>Points Earned on Cash:</span>
              <span>+{samplePointsEarned} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

