// app/register/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useFoodyeWallet } from '@/components/Wallet/WalletProvider';
import { supabase } from '@/lib/supabase';
import { checkUserExists, isDemoWalletAddress } from '@/lib/auth';
import {
  generateVerificationCode,
  saveVerificationCode,
  validateVerificationCode,
} from '@/lib/verificationCode';
import { sendVerificationCodeEmail, sendWelcomeEmail } from '@/lib/emailService';

export default function RegisterPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { } = useFoodyeWallet();

  const [role, setRole] = useState<'diner' | 'restaurant'>('diner');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [area, setArea] = useState('');
  const [prefix, setPrefix] = useState('');
  const [line, setLine] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const areaRef = useRef<HTMLInputElement>(null);
  const prefixRef = useRef<HTMLInputElement>(null);
  const lineRef = useRef<HTMLInputElement>(null);

  // 🚨 强制清理模拟钱包并重定向
  useEffect(() => {
    const cachedWallet = localStorage.getItem('foodye_wallet');

    if (cachedWallet && isDemoWalletAddress(cachedWallet)) {
      console.log('🧹 FORCE CLEARING demo wallet cache:', cachedWallet);
      localStorage.removeItem('foodye_wallet');
      alert('⚠️ Demo wallet detected! Please connect a real Coinbase Smart Wallet.');
      router.push('/');
      return;
    }

    if (address && isDemoWalletAddress(address)) {
      console.log('🚨 Detected demo wallet:', address);
      localStorage.removeItem('foodye_wallet');
      alert('⚠️ Demo wallet detected! Please connect a real Coinbase Smart Wallet.');
      router.push('/');
      return;
    }
  }, [address, router]);

  // 🔥 自动检查注册状态并重定�?
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!address) {
        console.log('�?No wallet connected, redirecting...');
        router.push('/');
        return;
      }

      if (isDemoWalletAddress(address)) {
        console.log('🚨 Demo wallet detected in check, redirecting');
        localStorage.removeItem('foodye_wallet');
        router.push('/');
        return;
      }

      try {
        console.log('🔍 Checking registration for:', address);
        const userRole = await checkUserExists(address);

        if (userRole === 'diner') {
          console.log('�?Found diner, redirecting...');
          router.push('/dashboard-diner');
          return;
        }

        if (userRole === 'restaurant') {
          console.log('�?Found restaurant, redirecting...');
          router.push('/dashboard-restaurant');
          return;
        }

        console.log('📝 Not registered yet, show form');
      } catch (error) {
        console.error('�?Error in registration check:', error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [address, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (codeSentAt && Date.now() - codeSentAt > 10 * 60 * 1000) {
      alert('Verification code expired');
      setVerificationSent(false);
      setInputCode('');
      setCodeSentAt(null);
      setSuccessMessage('');
    }
  }, [inputCode, codeSentAt]);

  const handleSendVerification = async () => {
    if (!emailLocal || (role === 'diner' && (!firstName || !lastName || !area || !prefix || !line))) {
      alert('Please complete required fields before sending code');
      return;
    }

    const email = `${emailLocal}@gmail.com`;
    const code = generateVerificationCode();
    saveVerificationCode(email, code);

    setSending(true);
    try {
      await sendVerificationCodeEmail(email, code, address!);
      setVerificationSent(true);
      setCountdown(60);
      setCodeSentAt(Date.now());
      setSuccessMessage('�?Code sent to email!');
    } catch (err) {
      console.error('Email send error', err);
      alert('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!address) return alert('Wallet not ready');

    const email = `${emailLocal}@gmail.com`;
    const phone = `1-${area}-${prefix}-${line}`;
    const isValid = validateVerificationCode(email, inputCode);
    if (!isValid) return alert('Invalid or expired verification code');

    setVerifying(true);

    // 🔥 Create payload matching actual Supabase schema
    const payload =
      role === 'diner'
        ? {
            email,
            phone,
            first_name: firstName,
            last_name: lastName,
            wallet_address: address,
            role,
          }
        : {
            email,
            phone,
            name: restaurantName, // restaurants table uses 'name'
            address: restaurantAddress, // restaurants table uses 'address'
            wallet_address: address, // ✅ Now restaurants table has wallet_address!
            role,
          };

    try {
      console.log('🔥 Attempting to insert into Supabase...');
      console.log('📝 Payload:', payload);
      console.log('🏢 Table:', role === 'diner' ? 'diners' : 'restaurants');
      
      const { data, error } = await supabase
        .from(role === 'diner' ? 'diners' : 'restaurants')
        .insert([payload])
        .select(); // 添加 select 来获取插入的数据
      
      if (error) {
        console.error('❌ Supabase insertion error:', error);
        alert(`Database error: ${error.message}`);
        return;
      }
      
      console.log('✅ Successfully inserted into Supabase:', data);
      
      await sendWelcomeEmail(email, address);
      localStorage.setItem('foodye_wallet', address);
      router.push(`/register/yes/success?role=${role}`);
    } catch (err) {
      console.error('Registration failed', err);
      alert('Registration error');
    } finally {
      setVerifying(false);
    }
  };

  if (checkingRegistration) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold">Checking Registration...</h2>
          <p className="text-gray-400">
            {address ? `Wallet: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Verifying...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold text-center">Register on FoodyePay</h1>

        {/* Role Switch */}
        <div className="flex space-x-2">
          <button
            onClick={() => setRole('diner')}
            className={`w-full py-2 rounded ${role === 'diner' ? 'bg-[#4F46E5]' : 'bg-zinc-700'}`}
          >
            Diner
          </button>
          <button
            onClick={() => setRole('restaurant')}
            className={`w-full py-2 rounded ${role === 'restaurant' ? 'bg-[#4F46E5]' : 'bg-zinc-700'}`}
          >
            Restaurant
          </button>
        </div>

        {role === 'diner' && (
          <>
            <input placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-base w-full" />
            <input placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} className="input-base w-full" />
          </>
        )}

        {role === 'restaurant' && (
          <>
            <input placeholder="Restaurant Name *" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className="input-base w-full" />
            <input placeholder="Address *" value={restaurantAddress} onChange={e => setRestaurantAddress(e.target.value)} className="input-base w-full" />
          </>
        )}

        <div className="flex w-full">
          <input placeholder="Gmail (no @)" value={emailLocal} onChange={e => setEmailLocal(e.target.value)} className="input-base w-7/10 rounded-r-none" />
          <span className="input-base bg-zinc-700 rounded-l-none flex items-center justify-center w-3/10">@gmail.com</span>
        </div>

        {role === 'diner' && (
          <div className="flex gap-2">
            <div className="flex items-center gap-1"><span className="font-bold">1</span><span>+</span></div>
            <input maxLength={3} ref={areaRef} value={area} onChange={e => { setArea(e.target.value); if (e.target.value.length === 3) prefixRef.current?.focus(); }} className="input-base w-1/3" />
            <input maxLength={3} ref={prefixRef} value={prefix} onChange={e => { setPrefix(e.target.value); if (e.target.value.length === 3) lineRef.current?.focus(); }} className="input-base w-1/3" />
            <input maxLength={4} ref={lineRef} value={line} onChange={e => setLine(e.target.value)} className="input-base w-1/3" />
          </div>
        )}

        {successMessage && <p className="text-green-400 text-center text-sm">{successMessage}</p>}

        {!verificationSent ? (
          <button onClick={handleSendVerification} className="w-full py-2 px-4 rounded bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold mb-3" disabled={sending || countdown > 0}>
            {sending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send Verification Code'}
          </button>
        ) : (
          <>
            <input placeholder="Enter Code" value={inputCode} onChange={e => setInputCode(e.target.value)} className="input-base w-full" />
            <button onClick={handleSubmit} className="btn-primary bg-[#4F46E5] w-full" disabled={verifying}>
              {verifying ? 'Verifying...' : 'Register'}
            </button>
          </>
        )}

        <p className="text-sm text-center text-zinc-500">Wallet: {address || 'Not connected'}</p>
      </div>
    </div>
  );
}
