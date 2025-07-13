// app/register/no/success/page.tsx

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterFailedContent() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get('error') || 'Unknown error occurred';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/register');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold mb-2 text-red-400">Registration Failed</h1>
        <p className="text-lg text-gray-300 mb-2">Something went wrong</p>
        <p className="text-sm text-gray-400 max-w-md">
          {error}
        </p>
        <div className="mt-6">
          <p className="text-sm text-yellow-400 animate-pulse">
            🔄 Redirecting to registration page...
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterFailedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-2 text-red-400">Registration Failed</h1>
          <p className="text-sm text-yellow-400 animate-pulse">
            🔄 Loading...
          </p>
        </div>
      </div>
    }>
      <RegisterFailedContent />
    </Suspense>
  );
}
