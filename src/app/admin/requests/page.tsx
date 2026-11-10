'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { HelpCircle, CheckCircle, Link as LinkIcon, MessageSquare } from 'lucide-react';

export default function AdminRequestsPage() {
  const { resourceRequests, products, showToast } = useApp();

  const [requests, setRequests] = useState(resourceRequests);

  React.useEffect(() => {
    setRequests(resourceRequests);
  }, [resourceRequests]);

  const handleStatusChange = async (id: string, status: any) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`Request marked as ${status}`);

    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.warn('Failed to update request status in database:', err);
    }
  };

  const handleLinkResource = async (requestId: string, productId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, linkedProductId: productId, status: 'Published' }
          : r
      )
    );
    showToast('Resource linked! Automated email notice sent to requesters.');

    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, linkedProductId: productId, status: 'Published' }),
      });
    } catch (err) {
      console.warn('Failed to link resource in database:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Resource Requests & Demand
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Teacher topic requests · Grouped demand · Link newly published packs to alert teachers.
          </p>
        </div>

        <span className="badge b-wait text-xs font-bold py-1 px-3">
          {requests.filter((r) => r.status === 'New').length} New Requests
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-ink">{req.email}</span>
                  <span className="badge b-grey text-[10px]">{req.grade}</span>
                  <span className="badge b-type text-[10px]">{req.type}</span>
                </div>
                <span className="text-mut text-[11px]">Submitted on {req.createdAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge b-free text-xs font-bold">
                  Requested by {req.count} {req.count === 1 ? 'teacher' : 'teachers'}
                </span>
                <span
                  className={`badge ${
                    req.status === 'Published'
                      ? 'b-free'
                      : req.status === 'Planned'
                      ? 'b-blue'
                      : 'b-wait'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-800 bg-bg p-3.5 rounded-2xl border border-line">
              &ldquo;{req.text}&rdquo;
            </p>

            {/* Actions & Link Resource (P1-RQR-06) */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-mut">Change Status:</span>
                <select
                  value={req.status}
                  onChange={(e) => handleStatusChange(req.id, e.target.value)}
                  className="inp text-xs py-1 w-32"
                >
                  <option value="New">New</option>
                  <option value="Planned">Planned</option>
                  <option value="In progress">In Progress</option>
                  <option value="Published">Published</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-mut">Link Store Pack:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleLinkResource(req.id, e.target.value);
                  }}
                  className="inp text-xs py-1 max-w-xs"
                >
                  <option value="">Select published resource to link...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

