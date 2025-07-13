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
      // 检查 diners 表
      const { data: diner, error: dinerError } = await supabase
        .from('diners')
        .select('role, created_at')
        .eq('wallet', address)
        .limit(1)
        .single();

      // 检查 restaurants 表
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('role, created_at')
        .eq('wallet', address)
        .limit(1)
        .single();

      const userData = diner || restaurant;
      
      if (!userData) {
        console.warn('⚠️ Wallet not registered:', address);
        router.push('/register');
        return;
      }

      // 检查注册时间，如果超过3天未访问则要求重新验证
      const registrationDate = new Date(userData.created_at);
      const now = new Date();
      const daysSinceRegistration = (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // 获取上次访问时间
      const lastVisit = localStorage.getItem('foodye_last_visit');
      const lastVisitDate = lastVisit ? new Date(lastVisit) : null;
      const daysSinceLastVisit = lastVisitDate 
        ? (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
        : daysSinceRegistration;

      // 更新最后访问时间
      localStorage.setItem('foodye_last_visit', now.toISOString());

      // 如果超过3天未访问，要求重新验证
      if (daysSinceLastVisit > 3) {
        console.warn('⚠️ More than 3 days since last visit, requiring re-verification:', address);
        router.push('/register');
        return;
      }

      // 根据角色跳转到对应的仪表板
      if (userData.role === 'diner') {
        console.log('✅ Diner logged in, redirecting to diner dashboard:', address);
        router.push('/dashboard-diner');
      } else if (userData.role === 'restaurant') {
        console.log('✅ Restaurant logged in, redirecting to restaurant dashboard:', address);
        // 这里可以创建 restaurant dashboard，现在先跳转到 diner dashboard
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
    if (!walletAddress || checking) return;

    console.log('📦 Current walletAddress:', walletAddress);
    localStorage.setItem('foodye_wallet', walletAddress);
    checkRegistration(walletAddress);
  }, [walletAddress, checkRegistration, checking]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to FoodyePay</h1>

      <ConnectWallet
        onConnect={(address) => {
          if (!address) return;
          localStorage.setItem('foodye_wallet', address);
          checkRegistration(address);
        }}
        disabled={checking}
      />

      {checking && (
        <div className="mt-4 text-center">
          <p className="text-yellow-400 animate-pulse">
            🔄 Checking your registration status...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            We're verifying your account and preparing your dashboard
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">
          🔒 <strong>Secure Access:</strong> Your wallet serves as your login
        </p>
        <p>
          ⏰ <strong>Auto Re-verification:</strong> Required after 3 days of inactivity for security
        </p>
      </div>
    </div>
  );
}









