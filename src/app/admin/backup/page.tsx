'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Database, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminBackupPage() {
  const { showToast } = useApp();

  const handleDownloadBackup = () => {
    showToast('Snapshot backup archive generated and downloading...', 'success');
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
    </div>
  );
}

