// app/register/yes/success/page.tsx

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role') || 'diner';

  useEffect(() => {
    const timer = setTimeout(() => {
      // 根据角色跳转到不同的仪表盘
      if (role === 'restaurant' || role === 'merchant') {
        router.push('/dashboard-restaurant');
      } else {
        router.push('/dashboard-diner');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, role]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2 text-green-400">Registration Successful!</h1>
        <p className="text-lg text-gray-300 mb-2">Welcome to FoodyePay!</p>
        <p className="text-sm text-gray-400">
          Your Smart Wallet is now active as a {role === 'restaurant' || role === 'merchant' ? 'Restaurant' : 'Diner'}
        </p>
        <div className="mt-6">
          <p className="text-sm text-yellow-400 animate-pulse">
            🔄 Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2 text-green-400">Registration Successful!</h1>
          <p className="text-sm text-yellow-400 animate-pulse">
            🔄 Loading...
          </p>
        </div>
      </div>
    }>
      <RegisterSuccessContent />
    </Suspense>
  );
}
