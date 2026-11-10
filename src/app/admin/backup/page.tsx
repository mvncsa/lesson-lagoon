'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Database, Download, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';

export default function AdminBackupPage() {
  const { showToast, clearTestData } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDownloadBackup = () => {
    showToast('Snapshot backup archive generated and downloading...', 'success');
    window.open('/api/admin/backup', '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Backup & Data Recovery
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Automated PostgreSQL snapshots · S3 object storage synchronization · Disaster recovery.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-pri" />
          <h3 className="font-extrabold text-base text-ink">Automated Backup Status</h3>
        </div>

        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-ok" />
            <div>
              <b className="text-ink font-bold block">Nightly Backup Verified</b>
              <span className="text-mut text-[11px]">Last run: Today at 04:00 MVT (Retention: 30 days)</span>
            </div>
          </div>
          <span className="badge b-free font-bold">Healthy</span>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={handleDownloadBackup}
            className="btn sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download Full Data Backup (.sql.gz)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h3 className="font-extrabold text-base text-rose-900">Purge Sandbox & Test Data</h3>
        </div>
        <p className="text-mut">
          Instantly clear all simulated orders, pending slip attachments, and active cart items from the current test environment.
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

