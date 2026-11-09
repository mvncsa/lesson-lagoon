'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { INITIAL_AUTOMATIONS } from '@/lib/data';
import { Zap, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AdminAutomationsPage() {
  const { showToast } = useApp();
  const [journeys, setJourneys] = useState(INITIAL_AUTOMATIONS);

  const toggleJourney = (id: string) => {
    setJourneys((prev) =>
      prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
    );
    showToast('Automation journey toggled.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Automated Email Journeys
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Lifecycle triggers · Timed welcome offers · Abandoned cart recovery · Birthday reminders.
        </p>
      </div>

      <div className="space-y-4">
        {journeys.map((j) => (
          <div
            key={j.id}
            className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-sm font-extrabold text-ink">{j.name}</b>
                  <span className="badge b-grey text-[10px]">{j.id}</span>
                </div>
                <span className="text-mut text-[11px]">Trigger: {j.trigger}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-mut font-semibold">
                  {j.enabled ? 'Active' : 'Paused'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleJourney(j.id)}
                  className={`sw ${j.enabled ? 'on' : ''}`}
                />
              </div>
            </div>

            {/* Steps Sequence */}
            <div className="space-y-1.5 bg-bg p-3.5 rounded-2xl border border-line">
              <span className="font-bold text-ink uppercase text-[10px] tracking-wider block mb-1">
                Sequence Steps:
              </span>
              {j.steps.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-pri font-bold text-[10px] flex items-center justify-center flex-none">
                    {idx + 1}
                  </span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            {/* Performance Stats */}
            <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
              <div>Delay: <b className="text-ink">{j.delay}</b></div>
              <div>Entered: <b className="text-ink">{j.stats.entered}</b></div>
              <div>Sent: <b className="text-ink">{j.stats.sent}</b></div>
              <div>Converted: <b className="text-ok font-extrabold">{j.stats.converted}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

