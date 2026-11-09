'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { INITIAL_BANK_DETAILS } from '@/lib/data';
import { Settings, Landmark, ShieldCheck, Mail, Trash2, KeyRound, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast, clearTestData } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [storeName, setStoreName] = useState('LessonLagoon');
  const [tagline, setTagline] = useState('Teacher-made resources for Maldivian classrooms');
  const [supportEmail, setSupportEmail] = useState('hello@lessonlagoon.mv');
  const [watermark, setWatermark] = useState('LESSONLAGOON · PREVIEW');

  // Bank
  const [bank, setBank] = useState(INITIAL_BANK_DETAILS.bank);
  const [accountName, setAccountName] = useState(INITIAL_BANK_DETAILS.name);
  const [accountNo, setAccountNo] = useState(INITIAL_BANK_DETAILS.number);

  // Admin allowlist (P1-AUTH-07)
  const [admins, setAdmins] = useState(['owner@lessonlagoon.mv']);
  const [newAdmin, setNewAdmin] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Store settings and bank details updated.');
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin) return;
    setAdmins([...admins, newAdmin.toLowerCase()]);
    setNewAdmin('');
    showToast(`Added ${newAdmin} to admin allowlist.`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Store & Bank Settings
        </h1>
        <p className="text-xs text-mut mt-0.5">
          General profile · Bank details · Preview watermark · Admin allowlist.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-ink">Store Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="inp text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="inp text-xs"
              />
            </div>
          </div>
          <div>
            <label className="font-bold block mb-1">Preview Watermark Text</label>
            <input
              type="text"
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="inp text-xs uppercase"
            />
          </div>
        </div>

        {/* Bank Account */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-pri" />
            <h3 className="font-extrabold text-base text-ink">Bank Account for Customer Transfers</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold block mb-1">Bank Name</label>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="inp text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="inp text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Account Number (MVR)</label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="inp text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn sm">
          Save Settings
        </button>
      </form>

      {/* Admin Allowlist (P1-AUTH-07) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-pri" />
          <h3 className="font-extrabold text-base text-ink">Admin Allowlist (Google Emails)</h3>
        </div>
        <p className="text-mut">
          Only Google accounts on this list are granted access to the `/admin` backend.
        </p>

        <form onSubmit={handleAddAdmin} className="flex gap-2">
          <input
            type="email"
            placeholder="admin.email@school.mv"
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            className="inp text-xs flex-1"
          />
          <button type="submit" className="btn sm">
            Add Admin
          </button>
        </form>

        <div className="divide-y divide-line pt-2">
          {admins.map((adm) => (
            <div key={adm} className="py-2 flex items-center justify-between">
              <span className="font-semibold text-ink">{adm}</span>
              <span className="badge b-free text-[10px]">Owner / Admin</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Credentials & Authentication Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-pri" />
          <h3 className="font-extrabold text-base text-ink">Admin Portal Credentials</h3>
        </div>
        <p className="text-mut">
          Direct administrator access to the backend is guarded by server environment variables.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-mut font-medium">Configured Username:</span>
            <span className="font-mono font-bold text-ink bg-white px-2.5 py-1 rounded-md border border-line">admin</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-mut font-medium">Password Protection:</span>
            <span className="badge b-ok font-bold">Encrypted in .env (Active)</span>
          </div>
        </div>
      </div>

      {/* Data & Maintenance: Clear Test Data */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h3 className="font-extrabold text-base text-rose-900">Data & Maintenance</h3>
        </div>
        <p className="text-mut">
          Clear mock orders, test slips, cart sessions, and local storage state. Content catalogue and curricula remain intact.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="btn sm bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear Test Data
          </button>
        </div>
      </div>

      {/* Clear Test Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-line shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto">
              ⚠️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-ink">Clear All Test Data?</h3>
              <p className="text-xs text-mut mt-1">
                This will reset your local mock orders, pending slips, and test session data while keeping all educational resources and categories intact.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="btn sm ghost flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearTestData();
                  setShowClearConfirm(false);
                }}
                className="btn sm bg-rose-600 hover:bg-rose-700 text-white flex-1 text-xs font-bold"
              >
                Yes, Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

