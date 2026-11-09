'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User } from '@/lib/types';
import { formatMVR } from '@/lib/pricing';
import { INITIAL_USERS } from '@/lib/data';
import { Search, Users, Mail, Coins, ShieldAlert, Check, Plus, Edit } from 'lucide-react';

export default function AdminCustomersPage() {
  const { user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'customers' | 'subscribers'>('customers');
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Points adjustment state (P1-LST-06)
  const [adjustPoints, setAdjustPoints] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Community promotion bonus');

  const customers = usersList.filter((u) => u.role === 'CUSTOMER');

  const filteredCustomers = customers.filter((c) => {
    if (selectedSegment === 'consent' && !c.consent) return false;
    if (selectedSegment === 'nobuy' && c.paid) return false;
    if (selectedSegment === 'pts200' && c.points < 200) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApplyPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const updated = { ...selectedUser, points: selectedUser.points + adjustPoints };
    setUsersList((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    setSelectedUser(updated);
    showToast(`Adjusted ${adjustPoints} points for ${selectedUser.name}. Reason: ${adjustReason}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Customers & Email Contacts
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Profiles · Segmentation · Marketing consent · Loyalty adjustments.
          </p>
        </div>

        <div className="flex rounded-xl border border-line bg-white p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'customers' ? 'bg-ink text-white' : 'text-mut hover:text-ink'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'subscribers' ? 'bg-ink text-white' : 'text-mut hover:text-ink'
            }`}
          >
            Subscribers (Email Only)
          </button>
        </div>
      </div>

      {/* Segments Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-2xl border border-line text-xs">
        <span className="font-bold text-ink mr-2">Segments:</span>
        <button
          onClick={() => setSelectedSegment('all')}
          className={`chip ${selectedSegment === 'all' ? 'on' : ''}`}
        >
          All Customers
        </button>
        <button
          onClick={() => setSelectedSegment('consent')}
          className={`chip ${selectedSegment === 'consent' ? 'on' : ''}`}
        >
          Marketing Consented
        </button>
        <button
          onClick={() => setSelectedSegment('nobuy')}
          className={`chip ${selectedSegment === 'nobuy' ? 'on' : ''}`}
        >
          Signed Up, Never Bought
        </button>
        <button
          onClick={() => setSelectedSegment('pts200')}
          className={`chip ${selectedSegment === 'pts200' ? 'on' : ''}`}
        >
          Has 200+ Points
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs">
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Referral Code</th>
              <th>Points</th>
              <th>Joined</th>
              <th>Marketing Consent</th>
              <th>Tags</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-mut">
                  <div className="max-w-xs mx-auto space-y-2">
                    <span className="text-3xl block">👥</span>
                    <b className="text-ink font-bold block text-sm">No customers registered yet</b>
                    <p className="text-xs text-mut">
                      When teachers sign in with Gmail or place an order, their profiles and loyalty balances (1 MVR = 10 pts) will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="font-bold text-ink">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs"
                        style={{ background: c.color || '#0E8C7F' }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block">{c.name}</span>
                        <span className="text-[11px] text-mut font-normal">{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono font-bold text-slate-700">{c.code}</td>
                  <td className="font-extrabold text-ink">{c.points} pts</td>
                  <td className="text-mut">{c.joined}</td>
                  <td>
                    {c.consent ? (
                      <span className="badge b-free text-[10px]">Consented ✓</span>
                    ) : (
                      <span className="badge b-grey text-[10px]">No Consent</span>
                    )}
                  </td>
                  <td>
                    {c.tags && c.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map((t) => (
                          <span key={t} className="badge b-type text-[9px]">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedUser(c)}
                      className="btn xs ghost"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Drawer / Modal (P1-LST-06) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-line shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-acc text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-ink">{selectedUser.name}</h3>
                  <p className="text-mut">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn xs ghost"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-bg p-4 rounded-2xl border border-line">
              <div>
                <span className="text-mut block">Points Balance</span>
                <b className="text-lg text-ink font-extrabold">{selectedUser.points} pts</b>
              </div>
              <div>
                <span className="text-mut block">Referral Code</span>
                <b className="font-mono text-ink text-sm">{selectedUser.code}</b>
              </div>
            </div>

            {/* Adjust Points Form (P1-LST-06) */}
            <form onSubmit={handleApplyPoints} className="space-y-3 pt-2 border-t border-line">
              <h4 className="font-bold text-ink">Adjust Loyalty Points</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Points (+ or -)</label>
                  <input
                    type="number"
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(parseInt(e.target.value, 10) || 0)}
                    className="inp text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Required Reason *</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="inp text-xs py-1.5"
                  />
                </div>
              </div>
              <button type="submit" className="btn sm">
                Apply Points Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

