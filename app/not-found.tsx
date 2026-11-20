import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0B0F] text-[#F5F3FF] p-6 text-center">
      <h1 className="text-4xl font-extrabold text-[#A78BFA] mb-2">404</h1>
      <h2 className="text-xl font-bold mb-3">Page Not Found</h2>
      <p className="text-sm text-[#A1A1AA] max-w-sm mb-6">
        The skincare page or consultation you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-purple-950/40"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
