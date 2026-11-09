'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center max-w-[90vw]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-ink text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto border border-white/10"
        >
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

