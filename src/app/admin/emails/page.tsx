'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Send, Eye } from 'lucide-react';

export default function AdminEmailsPage() {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'templates' | 'outbox'>('templates');

  const templates = [
    {
      id: 'welcome',
      name: 'Welcome + First Order Offer',
      subject: "Welcome to LessonLagoon! Here's 20% off your first pack",
      body: 'Hi {name},\n\nWelcome to LessonLagoon. Your 20% welcome offer is applied automatically at checkout for the next 7 days, and 50 points are already in your account.\n\nHappy teaching!\nLessonLagoon',
    },
    {
      id: 'slipReceived',
      name: 'Slip Received Confirmation',
      subject: 'We received your transfer slip for {order}',
      body: 'Hi {name},\n\nThanks! We received your transfer slip for {order} ({amount}). We will verify it shortly and email you as soon as your downloads are ready.\n\nLessonLagoon',
    },
    {
      id: 'approved',
      name: 'Payment Approved (Downloads Ready)',
      subject: 'Payment approved – your downloads are ready ({order})',
      body: 'Hi {name},\n\nGreat news: your payment for {order} is verified. Your resources are now in your Library and ready to download.\n\nYou earned {earned} points with this purchase.\n\nLessonLagoon',
    },
    {
      id: 'printQueued',
      name: 'Printed Copy Queued & Producing',
      subject: 'Print order queued: {order} is in production',
      body: 'Hi {name},\n\nYour printed copies for {order} have entered production. We will update you as soon as your courier or boat dispatch is ready.\n\nLessonLagoon',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Email Templates & Outbox
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Transactional email placeholders · Automated notifications · Dispatch logs.
        </p>
      </div>

      <div className="space-y-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-3xl p-6 border border-line shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-line pb-2">
              <b className="text-sm font-bold text-ink">{tpl.name}</b>
              <span className="badge b-grey text-[10px] font-mono">{tpl.id}</span>
            </div>

            <div>
              <span className="text-mut font-semibold block mb-0.5">Subject Template:</span>
              <p className="font-bold text-ink">{tpl.subject}</p>
            </div>

            <div>
              <span className="text-mut font-semibold block mb-0.5">Body Preview:</span>
              <pre className="p-3 bg-bg rounded-xl border border-line text-[11px] text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                {tpl.body}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

