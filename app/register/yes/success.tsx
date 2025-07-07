// app/register/yes/success.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function RegisterSuccess() {
  const params = useSearchParams();
  const role = params.get('role') || 'diner';

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-xl text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-400">🎉 Registration Successful</h1>
        <p className="text-sm text-zinc-300">Welcome to FoodyePay! Your Smart Wallet is now active.</p>
        <a
          href={role === 'restaurant' ? '/dashboard-restaurant' : '/dashboard-diner'}
          className="text-emerald-400 underline"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

