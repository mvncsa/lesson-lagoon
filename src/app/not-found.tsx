import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-line shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-pri flex items-center justify-center text-3xl mx-auto shadow-xs">
          🧭
        </div>
        <h1 className="text-2xl font-extrabold text-ink">Page Not Found</h1>
        <p className="text-xs text-mut leading-relaxed">
          The resource or page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="pt-2">
          <Link href="/" className="btn sm">
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
