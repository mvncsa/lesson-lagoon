'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin view caught error:', error);
  }, [error]);

  return (
    <div className="bg-white rounded-3xl border border-line p-8 max-w-lg mx-auto text-center space-y-4 shadow-sm my-12">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-bad flex items-center justify-center text-xl mx-auto">
        ⚠️
      </div>
      <h2 className="text-lg font-extrabold text-ink">Admin Dashboard Error</h2>
      <p className="text-xs text-mut">
        {error.message || 'An error occurred while loading this section of the admin panel.'}
      </p>
      <div className="flex gap-2 justify-center pt-2">
        <button onClick={() => reset()} className="btn sm acc text-xs font-bold">
          Reload Section
        </button>
        <Link href="/admin" className="btn sm ghost text-xs">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
