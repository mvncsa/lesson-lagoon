'use client';

import React from 'react';
import { History, ShieldCheck } from 'lucide-react';

export default function AdminAuditPage() {
  const auditLogs = [
    { at: '2026-11-09 10:30', who: 'Shaina Ali (Owner)', action: 'Rule updated', detail: 'Pricing & rules centre: updated welcome offer' },
    { at: '2026-11-08 14:15', who: 'Shaina Ali (Owner)', action: 'Order approved', detail: 'Approved order LL-2026-000124 (MVR 247.75)' },
    { at: '2026-11-07 09:30', who: 'Shaina Ali (Owner)', action: 'Order approved', detail: 'Approved order LL-2026-000119 (MVR 33.75)' },
    { at: '2026-11-06 11:00', who: 'Shaina Ali (Owner)', action: 'Order approved', detail: 'Approved order LL-2026-000118 (MVR 102.00)' },
    { at: '2026-11-05 08:00', who: 'System Worker', action: 'Daily cron', detail: 'Nightly recommendation rebuild completed (11 products)' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Admin Audit Log
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Immutable event log of owner actions, approvals, pricing changes, and automated jobs.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs">
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, idx) => (
              <tr key={idx}>
                <td className="text-mut whitespace-nowrap">{log.at}</td>
                <td className="font-bold text-ink">{log.who}</td>
                <td>
                  <span className="badge b-type font-semibold">{log.action}</span>
                </td>
                <td className="text-slate-700">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

