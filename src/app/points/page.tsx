'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import {
  Sparkles,
  Share2,
  Copy,
  Cake,
  Check,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function PointsPage() {
  const { user, setUser, showToast, setIsSignInModalOpen } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);

  // Progressive profile state
  const [roleInput, setRoleInput] = useState(user?.profileValues?.role || 'Teacher');
  const [islandInput, setIslandInput] = useState(user?.profileValues?.island || 'Malé');
  const [savedRole, setSavedRole] = useState(!!user?.profileValues?.role);
  const [savedIsland, setSavedIsland] = useState(!!user?.profileValues?.island);

  // Birthday state
  const [bDay, setBDay] = useState(user?.birthDay || 14);
  const [bMonth, setBMonth] = useState(user?.birthMonth || 11);
  const [bdaySaved, setBdaySaved] = useState(!!user?.birthDay);

  if (!user) {
    return (
      <div className="wrap py-24 text-center space-y-4">
        <span className="text-5xl block">🪙</span>
        <h1 className="text-2xl font-extrabold text-ink">Sign in to view your Loyalty Points</h1>
        <p className="text-xs text-mut max-w-sm mx-auto">
          Sign in with your Google account to check your balance and rewards.
        </p>
        <button onClick={() => setIsSignInModalOpen(true)} className="btn sm">
          Sign In with Google
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.code);
    setCopiedCode(true);
    showToast(`Referral code "${user.code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfileItem = async (itemKey: string, value: string) => {
    if (!user) return;
    setUser({
      ...user,
      points: user.points + 10,
      profileValues: {
        ...(user.profileValues || {}),
        [itemKey]: value,
      },
    });
    if (itemKey === 'role') setSavedRole(true);
    if (itemKey === 'island') setSavedIsland(true);
    showToast(`✅ Saved ${itemKey} · +10 points added to your balance!`, 'success');

    try {
      await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user.id,
          fieldKey: itemKey,
          fieldValue: value,
        }),
      });
    } catch (err) {
      console.warn('Could not persist profile value to database:', err);
    }
  };

  const handleSaveBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUser({
      ...user,
      points: user.points + (bdaySaved ? 0 : 10),
      birthDay: bDay,
      birthMonth: bMonth,
    });
    setBdaySaved(true);
    showToast('🎂 Birthday saved! Your annual gift is ready in your window (+10 points).', 'success');

    try {
      await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user.id,
          birthDay: bDay,
          birthMonth: bMonth,
        }),
      });
    } catch (err) {
      console.warn('Could not persist birthday to database:', err);
    }
  };

  return (
    <div className="wrap py-8 sm:py-12 space-y-10 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">My Points & Loyalty</h1>
        <p className="text-xs text-mut mt-1">
          Always-on points program · 10 points = MVR 1.00 · Pay up to 80% of any digital resource
        </p>
      </div>

      {/* Balance & Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-[#14213D] to-[#22335C] text-white rounded-3xl p-6 shadow-md">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
            Available Points
          </span>
          <b className="text-4xl font-black text-amber-400 block">{user.points}</b>
          <span className="text-xs text-slate-300 mt-2 block">
            Value: {formatMVR(user.points * 10)}
          </span>
        </div>

        <div className="bg-white border border-line rounded-3xl p-6 shadow-xs">
          <span className="text-xs font-semibold text-mut uppercase tracking-wider block mb-1">
            Pending Points
          </span>
          <b className="text-3xl font-extrabold text-ink block">{user.pending}</b>
          <span className="text-xs text-mut mt-2 block">
            Held for 7 days after purchase verification
          </span>
        </div>

        <div className="bg-white border border-line rounded-3xl p-6 shadow-xs">
          <span className="text-xs font-semibold text-mut uppercase tracking-wider block mb-1">
            Held in Checkout
          </span>
          <b className="text-3xl font-extrabold text-ink block">{user.held}</b>
          <span className="text-xs text-mut mt-2 block">
            Reserved on pending bank transfers
          </span>
        </div>
      </div>

      {/* Birthday Special Card (Section 15.6, P1-BDY) */}
      <div className="bg-gradient-to-r from-[#FFF4F0] to-[#FFF9F6] border border-orange-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎂</span>
          <div>
            <h3 className="font-extrabold text-lg text-ink">Annual Birthday Special</h3>
            <p className="text-xs text-mut">
              Add your birthday (day and month only) to receive 100 points + 25% coupon every year.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBirthday} className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold">Day:</label>
            <input
              type="number"
              min="1"
              max="31"
              value={bDay}
              onChange={(e) => setBDay(parseInt(e.target.value, 10))}
              className="inp text-xs w-20 py-1.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold">Month:</label>
            <select
              value={bMonth}
              onChange={(e) => setBMonth(parseInt(e.target.value, 10))}
              className="inp text-xs w-36 py-1.5"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn sm">
            {bdaySaved ? 'Update Birthday' : 'Save & Earn +10 pts'}
          </button>
        </form>

        {bdaySaved && (
          <div className="bg-white/80 p-3 rounded-xl border border-orange-100 text-xs text-amber-900 font-semibold flex items-center gap-2">
            <span>🎉 Birthday window active! Coupon BDAY25 ready to use at checkout.</span>
          </div>
        )}
      </div>

      {/* Progressive Profile & Rewards Card (Section 15.8, P1-PRF) */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-ink">Complete Your Profile</h3>
            <p className="text-xs text-mut">
              Earn 10 points for each detail you save to help us recommend tailored teaching packs.
            </p>
          </div>
          <span className="badge b-free text-xs">+10 pts per save</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          {/* Item 1: Role */}
          <div className="p-4 bg-bg rounded-2xl border border-line space-y-2">
            <div className="flex justify-between font-bold">
              <span>Your Role</span>
              {savedRole && <span className="text-ok font-semibold">✓ Saved (+10)</span>}
            </div>
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="inp text-xs py-1.5"
            >
              <option value="Teacher">Teacher</option>
              <option value="Parent">Parent / Homeschooler</option>
              <option value="Student">Student</option>
              <option value="Tutor">Private Tutor</option>
            </select>
            <button
              onClick={() => handleSaveProfileItem('role', roleInput)}
              className="btn xs ghost"
            >
              Save Role
            </button>
          </div>

          {/* Item 2: Island */}
          <div className="p-4 bg-bg rounded-2xl border border-line space-y-2">
            <div className="flex justify-between font-bold">
              <span>Your Island / Atoll</span>
              {savedIsland && <span className="text-ok font-semibold">✓ Saved (+10)</span>}
            </div>
            <input
              type="text"
              value={islandInput}
              onChange={(e) => setIslandInput(e.target.value)}
              placeholder="e.g. Malé, Addu, Kulhudhuffushi"
              className="inp text-xs py-1.5"
            />
            <button
              onClick={() => handleSaveProfileItem('island', islandInput)}
              className="btn xs ghost"
            >
              Save Island
            </button>
          </div>
        </div>
      </div>

      {/* Referral Code & Share (Section 15.4 & 15.5) */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-lg text-ink">Invite Teachers & Earn</h3>
        <p className="text-xs text-mut">
          Give 50 points to your friend. When they place their first paid order, you earn 100 points!
        </p>

        <div className="p-4 bg-bg rounded-2xl border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-mut block">Your Personal Referral Code</span>
            <b className="text-2xl font-mono text-ink tracking-widest">{user.code}</b>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="btn sm ghost flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/?ref=${user.code}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Join LessonLagoon with my code ' + user.code + ' for free teaching packs: ' + url)}`, '_blank');
              }}
              className="btn sm bg-[#25D366] hover:bg-[#20b857] text-white"
            >
              Share via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Points Ledger (P1-PTS-02) */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-lg text-ink">Points Activity History</h3>
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Status</th>
              <th className="text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{user.joined}</td>
              <td className="font-semibold text-ink">Sign-up Welcome Bonus</td>
              <td><span className="badge b-free">Available</span></td>
              <td className="text-right font-bold text-ok">+50</td>
            </tr>
            {user.points > 50 && (
              <tr>
                <td>{user.joined}</td>
                <td className="font-semibold text-ink">Profile completion & purchases</td>
                <td><span className="badge b-free">Available</span></td>
                <td className="text-right font-bold text-ok">+{user.points - 50}</td>
              </tr>
            )}
            {user.pending > 0 && (
              <tr>
                <td>2026-11-07</td>
                <td className="font-semibold text-ink">Purchase reward (Order LL-2026-000119)</td>
                <td><span className="badge b-wait">Pending (7d hold)</span></td>
                <td className="text-right font-bold text-amber-700">+{user.pending}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

