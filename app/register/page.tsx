// app/register/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFoodyeWallet } from '@/components/Wallet/WalletProvider';
import { supabase } from '@/lib/supabase';
import {
  generateVerificationCode,
  saveVerificationCode,
  validateVerificationCode,
} from '@/lib/verificationCode';
import { sendVerificationCodeEmail, sendWelcomeEmail } from '@/lib/emailService';

export default function RegisterPage() {
  const router = useRouter();
  const { walletAddress } = useFoodyeWallet();

  const [role, setRole] = useState<'diner' | 'restaurant'>('diner');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [area, setArea] = useState('');
  const [prefix, setPrefix] = useState('');
  const [line, setLine] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 新增：自动识别用户状态
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const areaRef = useRef<HTMLInputElement>(null);
  const prefixRef = useRef<HTMLInputElement>(null);
  const lineRef = useRef<HTMLInputElement>(null);

  // 新增：钱包连接后自动检查用户注册状态
  useEffect(() => {
    const checkUserRegistration = async () => {
      if (!walletAddress) return;
      
      setIsCheckingUser(true);
      
      try {
        console.log('Checking user registration for wallet:', walletAddress);
        
        // 首先检查 diners 表
        const { data: dinerData, error: dinerError } = await supabase
          .from("diners")
          .select("first_name")
          .eq("wallet_address", walletAddress)
          .single();
        
        console.log('Diner query result:', { dinerData, dinerError });
        
        if (dinerData) {
          console.log('User is registered as diner, redirecting...');
          // 用户已注册为 diner，直接跳转到 dashboard
          router.push(`/dashboard-diner?welcome=${dinerData.first_name}`);
          return;
        }
        
        // 检查 restaurants 表
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("name")
          .eq("wallet_address", walletAddress)
          .single();
        
        console.log('Restaurant query result:', { restaurantData, restaurantError });
        
        if (restaurantData) {
          console.log('User is registered as restaurant, redirecting...');
          // 用户已注册为 restaurant，跳转到 restaurant dashboard
          router.push(`/dashboard-restaurant?welcome=${restaurantData.name}`);
          return;
        }
        
        console.log('User not registered, showing registration form');
        // 用户未注册，显示注册表单
        setShowRegistrationForm(true);
      } catch (error) {
        console.error('Error checking user registration:', error);
        // 出错时默认显示注册表单
        setShowRegistrationForm(true);
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUserRegistration();
  }, [walletAddress, router]);

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
    // 只验证邮箱字段，其他字段在最终注册时验证
    if (!emailLocal.trim()) {
      alert('Please enter your email address before sending code');
      return;
    }

    if (!walletAddress) {
      alert('Wallet not connected. Please connect your wallet first.');
      return;
    }

    // 防止重复提交
    if (sending || countdown > 0) {
      return;
    }

    const email = `${emailLocal}@gmail.com`;
    const code = generateVerificationCode();
    saveVerificationCode(email, code);

    setSending(true);
    try {
      await sendVerificationCodeEmail(email, code, walletAddress);

      setVerificationSent(true);
      setCountdown(60);
      setCodeSentAt(Date.now());
      setSuccessMessage('✅ Code sent to email!');
    } catch (err) {
      console.error('Email send error', err);
      alert('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress) return alert('Wallet not ready');

    // 防止重复提交
    if (verifying) {
      return;
    }

    // 验证所有必填字段
    if (!emailLocal.trim()) {
      return alert('Please enter your email address');
    }

    if (role === 'diner') {
      if (!firstName.trim() || !lastName.trim()) {
        return alert('Please enter your first and last name');
      }
    } else if (role === 'restaurant') {
      if (!restaurantName.trim()) {
        return alert('Please enter your restaurant name');
      }
      if (!address.trim()) {
        return alert('Please enter your restaurant address');
      }
    }

    // 验证电话号码（对所有用户都是必需的）
    if (!area.trim() || !prefix.trim() || !line.trim()) {
      return alert('Please enter your complete phone number');
    }

    if (!inputCode.trim()) {
      return alert('Please enter the verification code');
    }

    const email = `${emailLocal}@gmail.com`;
    const isValid = validateVerificationCode(email, inputCode);
    if (!isValid) return alert('Invalid or expired verification code');

    setVerifying(true);

    const payload =
      role === 'diner'
        ? {
            wallet_address: walletAddress,
            email,
            phone: `1-${area}-${prefix}-${line}`,
            first_name: firstName,
            last_name: lastName,
          }
        : {
            wallet_address: walletAddress,
            name: restaurantName,
            address,
            phone: `1-${area}-${prefix}-${line}`,
          };

    try {
      console.log('Inserting payload:', payload);
      const { data, error } = await supabase.from(role === 'diner' ? 'diners' : 'restaurants').insert([payload]);
      
      if (error) {
        console.error('Supabase insert error:', error);
        alert(`Registration error: ${error.message}`);
        return;
      }
      
      console.log('Insert successful:', data);
      await sendWelcomeEmail(email, walletAddress);
      localStorage.setItem('foodye_wallet', walletAddress);
      router.push(`/register/yes/success?role=${role}`);
    } catch (err) {
      console.error('Registration failed', err);
      alert('Registration error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold text-center">Register on FoodyePay</h1>
        
        {/* Wallet Connection Status */}
        {walletAddress && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-green-400 text-sm font-medium">✅ Wallet Connected</div>
            <div className="text-xs text-gray-300 mt-1 font-mono">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </div>
          </div>
        )}

        {/* Loading State - 检查用户注册状态 */}
        {isCheckingUser && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 text-center">
            <div className="text-blue-400 text-sm font-medium">🔍 Checking registration status...</div>
            <div className="text-xs text-gray-300 mt-2">
              Verifying if this wallet is already registered
            </div>
          </div>
        )}

        {/* Registration Form - 只有当用户未注册时才显示 */}
        {showRegistrationForm && (
          <>
            {/* Step Indicator */}
            <div className="text-center text-sm text-gray-400">
              Step {verificationSent ? '2' : '1'} of 2: {verificationSent ? 'Complete Registration' : 'Verify Email'}
            </div>

            {/* Role Switch */}
            <div className="flex space-x-2">
              <button
                onClick={() => setRole('diner')}
                className={`w-full py-2 rounded ${
                  role === 'diner' ? 'bg-[#4F46E5]' : 'bg-zinc-700'
                }`}
              >
                Diner
              </button>
              <button
                onClick={() => setRole('restaurant')}
                className={`w-full py-2 rounded ${
                  role === 'restaurant' ? 'bg-[#4F46E5]' : 'bg-zinc-700'
                }`}
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
                <input placeholder="Address *" value={address} onChange={e => setAddress(e.target.value)} className="input-base w-full" />
              </>
            )}

            {/* Email */}
            <div className="flex w-full">
              <input placeholder="Gmail (no @)" value={emailLocal} onChange={e => setEmailLocal(e.target.value)} className="input-base w-7/10 rounded-r-none" />
              <span className="input-base bg-zinc-700 rounded-l-none flex items-center justify-center w-3/10">@gmail.com</span>
            </div>

            {/* Phone */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1"><span className="font-bold">1</span><span>+</span></div>
              <input maxLength={3} ref={areaRef} value={area} onChange={e => { setArea(e.target.value); if (e.target.value.length === 3) prefixRef.current?.focus(); }} className="input-base w-1/3" />
              <input maxLength={3} ref={prefixRef} value={prefix} onChange={e => { setPrefix(e.target.value); if (e.target.value.length === 3) lineRef.current?.focus(); }} className="input-base w-1/3" />
              <input maxLength={4} ref={lineRef} value={line} onChange={e => setLine(e.target.value)} className="input-base w-1/3" />
            </div>

            {successMessage && <p className="text-green-400 text-center text-sm">{successMessage}</p>}

            {/* Verification + Submit */}
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
          </>
        )}

        {/* 如果没有钱包连接，显示提示 */}
        {!walletAddress && !isCheckingUser && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 text-center">
            <div className="text-yellow-400 text-sm font-medium">⚠️ Please connect your wallet first</div>
            <div className="text-xs text-gray-300 mt-2">
              You need to connect your wallet to register or check your account status
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
