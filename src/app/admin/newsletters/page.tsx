'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Send, Eye, Users, Plus } from 'lucide-react';

export default function AdminNewslettersPage() {
  const { newsletters, addNewsletter, showToast } = useApp();

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [segment, setSegment] = useState('all');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    addNewsletter({
      id: 'nws_' + Math.random().toString(36).slice(2, 7),
      subject,
      previewText,
      blocks: [{ type: 'text', text: bodyText }],
      segmentId: segment,
      status: 'Draft',
    });

    setSubject('');
    setPreviewText('');
    setBodyText('');
    showToast('Newsletter draft created!');
  };

  const handleSendTest = () => {
    showToast('Test email sent to owner@lessonlagoon.mv');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Newsletters & Dispatches
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Compose curriculum updates · Segment filters · Batch dispatch with one-click unsubscribe.
        </p>
      </div>

      {/* Composer Form (P1-NWS-02) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-base text-ink">Compose New Campaign</h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="font-bold block mb-1">Subject Line *</label>
            <input
              type="text"
              required
              placeholder="e.g. Free fractions workbook & term 2 lesson packs"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Preview / Preheader Text</label>
            <input
              type="text"
              placeholder="Summary text visible in email inbox preview"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Target Segment</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="inp text-xs py-1.5"
            >
              <option value="all">All Contacts with Marketing Consent (1,140)</option>
              <option value="primary">Primary Teachers (580)</option>
              <option value="pts">Teachers with 200+ Points (310)</option>
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Email Body Content</label>
            <textarea
              rows={5}
              placeholder="Write your email announcement here..."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="inp text-xs"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleSendTest}
              className="btn sm ghost"
            >
              Send Test to Owner
            </button>
            <button type="submit" className="btn sm">
              Save Newsletter Draft
            </button>
          </div>
        </form>
      </div>

      {/* Newsletters List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-ink">Past Newsletters</h3>
        <table className="t text-xs">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Open Rate</th>
              <th>Orders Attributed</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((n) => (
              <tr key={n.id}>
                <td className="font-bold text-ink">{n.subject}</td>
                <td>
                  <span className={`badge ${n.status === 'Sent' ? 'b-free' : 'b-wait'}`}>
                    {n.status}
                  </span>
                </td>
                <td>{n.stats?.recipients || '—'}</td>
                <td>
                  {n.stats ? `${Math.round((n.stats.opens / n.stats.recipients) * 100)}%` : '—'}
                </td>
                <td className="font-semibold text-ok">{n.stats?.orders || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

