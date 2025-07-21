'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterSuccessPage() {
  const params = useSearchParams();
  const role = params.get('role');
  const router = useRouter();

  useEffect(() => {
    const delay = setTimeout(() => {
      if (role === 'diner') router.push('/dashboard-diner');
      else if (role === 'restaurant') router.push('/dashboard-restaurant');
    }, 2000);

    return () => clearTimeout(delay);
  }, [role, router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="bg-zinc-900 rounded-xl p-6 text-center shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-green-400">🎉 Registration Successful!</h1>
        <p className="text-zinc-300">Welcome to FoodyePay, {role === 'restaurant' ? 'Restaurant' : 'Diner'}!</p>
        <p className="text-sm text-zinc-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
