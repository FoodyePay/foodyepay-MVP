'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ConnectWallet from '@/components/Wallet/ConnectWallet';
import { supabase } from '@/lib/supabase';
import { useFoodyeWallet } from '@/components/Wallet/WalletProvider';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const { walletAddress } = useFoodyeWallet();

  const checkRegistration = useCallback(async (address: string) => {
    setChecking(true);

    try {
      const { data: diners } = await supabase
        .from('diners')
        .select('role') // Optional: if you want to differentiate roles
        .eq('wallet', address)
        .limit(1)
        .single();

      const isNewUser = !diners;
      if (isNewUser) {
        console.warn('⚠️ New user detected, redirecting to registration:', address);
        router.push('/register');
      } else {
        console.log('✅ Existing user, redirecting to dashboard:', address);
        router.push('/dashboard-diner');
      }
    } catch (err) {
      console.error('❌ Error checking registration:', err);
      alert('Something went wrong while checking registration.');
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (walletAddress) {
      // Already connected, proceed to check
      localStorage.setItem('foodye_wallet', walletAddress);
      checkRegistration(walletAddress);
    }
  }, [walletAddress, checkRegistration]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 flex flex-col items-center justify-center sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Login with Wallet</h1>

      <ConnectWallet
        onConnect={(address) => {
          if (!address) return;
          localStorage.setItem('foodye_wallet', address);
          checkRegistration(address);
        }}
      />

      {checking && (
        <p className="mt-4 text-yellow-400 animate-pulse">
          🔄 Checking registration status...
        </p>
      )}
    </div>
  );
}

