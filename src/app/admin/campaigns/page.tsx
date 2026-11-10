'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Campaign, Coupon } from '@/lib/types';
import { Tag, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function AdminCampaignsPage() {
  const { campaigns, coupons, showToast } = useApp();

  const [campaignList, setCampaignList] = useState<Campaign[]>(campaigns);
  const [couponList, setCouponList] = useState<Coupon[]>(coupons);

  // Load from database
  React.useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
            setCampaignList(data.campaigns);
          }
          if (Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCouponList(data.coupons);
          }
        }
      })
      .catch(() => {});
  }, []);

  // New coupon form state
  const [newCode, setNewCode] = useState('');
  const [newPct, setNewPct] = useState(15);
  const [newLimit, setNewLimit] = useState(100);

  const toggleCampaign = async (id: string) => {
    const target = campaignList.find((c) => c.id === id);
    const newActive = target ? !target.active : false;

    setCampaignList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
    );
    showToast('Campaign status toggled.');

    try {
      await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'campaign', id, active: newActive }),
      });
    } catch (err) {
      console.warn('Could not persist campaign toggle:', err);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    const added: Coupon = {
      code: newCode.toUpperCase(),
      pct: newPct,
      limit: newLimit,
      used: 0,
      expires: '2026-12-31',
      active: true,
    };
    setCouponList([added, ...couponList]);
    setNewCode('');
    showToast(`Coupon "${added.code}" created.`);

    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'coupon',
          code: added.code,
          pct: added.pct,
          limit: added.limit,
          expires: added.expires,
        }),
      });
    } catch (err) {
      console.warn('Could not save coupon to database:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Campaigns & Promotional Coupons
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Sitewide promotions · Occasion flash sales · Double points campaigns · Personal vouchers.
        </p>
      </div>

      {/* Campaigns Section (P1-CMP-01) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4">
        <h3 className="font-extrabold text-lg text-ink">Store Campaigns</h3>

        <div className="space-y-3">
          {campaignList.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <b className="text-sm font-bold text-ink">{c.name}</b>
                  <span className="badge b-off">{c.pct}% OFF</span>
                  {c.mult > 1 && (
                    <span className="badge b-wait font-bold">{c.mult}× Points Multiplier</span>
                  )}
                </div>
                <p className="text-slate-600">{c.banner}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${c.active ? 'b-free' : 'b-grey'} font-bold`}>
                  {c.active ? 'Active on Storefront' : 'Inactive'}
                </span>
                <button
                  onClick={() => toggleCampaign(c.id)}
                  className="btn xs ghost"
                >
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Section (P1-CMP-04) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-ink">Coupon Codes</h3>
          <span className="text-xs text-mut">Single-use or reusable teacher coupons</span>
        </div>

        {/* Add Coupon Form */}
        <form onSubmit={handleAddCoupon} className="p-4 bg-bg rounded-2xl border border-line flex flex-wrap items-end gap-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="e.g. RAMAZAN20"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="inp text-xs py-1.5 uppercase font-mono w-36"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Discount (%)</label>
            <input
              type="number"
              value={newPct}
              onChange={(e) => setNewPct(parseInt(e.target.value, 10) || 0)}
              className="inp text-xs py-1.5 w-24"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Usage Limit</label>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(parseInt(e.target.value, 10) || 0)}
              className="inp text-xs py-1.5 w-24"
            />
          </div>

          <button type="submit" className="btn sm">
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </form>

        {/* Coupons Table */}
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {couponList.map((cp) => (
              <tr key={cp.code}>
                <td className="font-mono font-bold text-ink">{cp.code}</td>
                <td>{cp.pct}% off</td>
                <td>
                  <span className="font-semibold text-slate-700">{cp.used}</span> / {cp.limit}
                </td>
                <td className="text-mut">{cp.expires}</td>
                <td>
                  <span className={`badge ${cp.active ? 'b-free' : 'b-grey'}`}>
                    {cp.active ? 'Active' : 'Expired'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

