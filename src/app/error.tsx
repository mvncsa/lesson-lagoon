'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Graceful error logging
    console.error('Gracefully caught application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-line shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mx-auto shadow-xs">
          🏝️
        </div>
        <h2 className="text-xl font-extrabold text-ink">Something went wrong</h2>
        <p className="text-xs text-mut leading-relaxed">
          An unexpected error occurred, but don&apos;t worry—your cart and account are safe.
        </p>
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="btn sm acc flex-1 text-xs font-bold"
          >
            Try Again
          </button>
          <Link href="/" className="btn sm ghost flex-1 text-xs">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

