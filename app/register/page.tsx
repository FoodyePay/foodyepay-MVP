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
import { BusinessVerification } from '@/components/BusinessVerification';
import { PhoneVerification } from '@/components/PhoneVerification';

interface Business {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  business_status?: string;
  price_level?: number;
  formatted_phone_number?: string | null;
  international_phone_number?: string | null;
}

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
  
  // Restaurant-specific fields - simplified for MVP
  const [restaurantEmail, setRestaurantEmail] = useState('');
  
  // New verification states
  const [businessVerified, setBusinessVerified] = useState(false);
  const [verifiedBusiness, setVerifiedBusiness] = useState<Business | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');

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

  // Force clear demo wallet and redirect
  useEffect(() => {
    const cachedWallet = localStorage.getItem('foodye_wallet');

    if (cachedWallet && isDemoWalletAddress(cachedWallet)) {
      console.log('FORCE CLEARING demo wallet cache:', cachedWallet);
      localStorage.removeItem('foodye_wallet');
      alert('Demo wallet detected! Please connect a real Coinbase Smart Wallet.');
      router.push('/');
      return;
    }

    if (address && isDemoWalletAddress(address)) {
      console.log('Detected demo wallet:', address);
      localStorage.removeItem('foodye_wallet');
      alert('Demo wallet detected! Please connect a real Coinbase Smart Wallet.');
      router.push('/');
      return;
    }
  }, [address, router]);

  // Auto check registration status and redirect
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!address) {
        console.log('No wallet connected, redirecting...');
        router.push('/');
        return;
      }

      if (isDemoWalletAddress(address)) {
        console.log('Demo wallet detected in check, redirecting');
        localStorage.removeItem('foodye_wallet');
        router.push('/');
        return;
      }

      try {
        console.log('Checking registration for:', address);
        const userRole = await checkUserExists(address);

        if (userRole === 'diner') {
          console.log('Found diner, redirecting...');
          router.push('/dashboard-diner');
          return;
        }

        if (userRole === 'restaurant') {
          console.log('Found restaurant, redirecting...');
          router.push('/dashboard-restaurant');
          return;
        }

        console.log('Not registered yet, show form');
      } catch (error) {
        console.error('Error in registration check:', error);
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

  // Handle business verification completion
  const handleBusinessVerificationComplete = (business: Business) => {
    setVerifiedBusiness(business);
    setBusinessVerified(true);
  };

  // Handle phone verification completion
  const handlePhoneVerificationComplete = (phoneNumber: string) => {
    setVerifiedPhone(phoneNumber);
    setPhoneVerified(true);
  };

  const handleSendVerification = async () => {
    console.log('handleSendVerification called');
    console.log('Current form data:', {
      role,
      emailLocal: role === 'restaurant' ? restaurantEmail : emailLocal,
      businessVerified,
      phoneVerified
    });

    // Validation for diner
    if (role === 'diner' && (!emailLocal || !firstName || !lastName || !area || !prefix || !line)) {
      console.log('Diner validation failed');
      alert('Please complete all required fields for diner registration');
      return;
    }
    
    // Validation for restaurant - NEW MVP requirements
    if (role === 'restaurant') {
      if (!restaurantEmail || !businessVerified || !phoneVerified) {
        console.log('Restaurant validation failed');
        console.log('Missing requirements:', {
          restaurantEmail: !restaurantEmail,
          businessVerified: !businessVerified,
          phoneVerified: !phoneVerified
        });
        
        const missingItems: string[] = [];
        if (!restaurantEmail) missingItems.push('Restaurant Email');
        if (!businessVerified) missingItems.push('Business Verification');
        if (!phoneVerified) missingItems.push('Phone Verification');
        
        alert(`Please complete the following verification steps:\n\n${missingItems.join('\n')}`);
        return;
      }
    }

    console.log('Validation passed, proceeding...');

    const email = role === 'restaurant' ? `${restaurantEmail}@gmail.com` : `${emailLocal}@gmail.com`;
    const code = generateVerificationCode();
    saveVerificationCode(email, code);

    setSending(true);
    try {
      await sendVerificationCodeEmail(email, code, address!);
      setVerificationSent(true);
      setCountdown(60);
      setCodeSentAt(Date.now());
      setSuccessMessage('Code sent to email!');
    } catch (err) {
      console.error('Email send error', err);
      alert('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!address) return alert('Wallet not ready');

    const email = role === 'restaurant' ? `${restaurantEmail}@gmail.com` : `${emailLocal}@gmail.com`;
    const phone = role === 'restaurant' ? verifiedPhone : `1-${area}-${prefix}-${line}`;
    const isValid = validateVerificationCode(email, inputCode);
    if (!isValid) return alert('Invalid or expired verification code');

    setVerifying(true);

    // Create payload matching actual Supabase schema
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
            name: verifiedBusiness?.name || 'Unknown Restaurant',
            // Store Google Maps data for future reference
            google_place_id: verifiedBusiness?.place_id,
            address: verifiedBusiness?.formatted_address,
            rating: verifiedBusiness?.rating || 0,
            user_ratings_total: verifiedBusiness?.user_ratings_total || 0,
            wallet_address: address,
            role,
          };

    try {
      console.log('Attempting to insert into Supabase...');
      console.log('Payload:', payload);
      console.log('Table:', role === 'diner' ? 'diners' : 'restaurants');
      
      const { data, error } = await supabase
        .from(role === 'diner' ? 'diners' : 'restaurants')
        .insert([payload])
        .select();
      
      if (error) {
        console.error('Supabase insertion error:', error);
        alert(`Database error: ${error.message}`);
        return;
      }
      
      console.log('Successfully inserted into Supabase:', data);
      
      await sendWelcomeEmail(email, address);
      
      // Diner registration reward logic
      if (role === 'diner') {
        try {
          console.log('Triggering Diner registration reward...');
          const rewardResponse = await fetch('/api/diner-reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: address,
              email: email
            })
          });
          
          if (rewardResponse.ok) {
            const rewardData = await rewardResponse.json();
            console.log('Diner reward issued successfully:', rewardData);
          } else {
            const errorData = await rewardResponse.json();
            console.warn('Diner reward failed:', errorData.error);
          }
        } catch (rewardError) {
          console.error('Error issuing Diner reward:', rewardError);
          // Don't block registration flow, just log error
        }
      }
      
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

        {/* Role Switch - Enhanced with icons and better UX */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 text-center">Choose your role</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setRole('diner')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                role === 'diner' 
                  ? 'bg-[#4F46E5] text-white shadow-lg transform scale-105' 
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🍽️</span>
                <span>Diner</span>
              </div>
            </button>
            <button
              onClick={() => setRole('restaurant')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                role === 'restaurant' 
                  ? 'bg-[#4F46E5] text-white shadow-lg transform scale-105' 
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🏪</span>
                <span>Restaurant</span>
              </div>
            </button>
          </div>
        </div>

        {/* Diner Fields */}
        {role === 'diner' && (
          <>
            <input placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-base w-full" />
            <input placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} className="input-base w-full" />
          </>
        )}

        {/* Restaurant Fields - NEW MVP APPROACH */}
        {role === 'restaurant' && (
          <div className="space-y-4">
            {/* Business Verification */}
            <BusinessVerification 
              onVerificationComplete={handleBusinessVerificationComplete}
              isVerified={businessVerified}
              verifiedBusiness={verifiedBusiness}
            />
            
            {/* Phone Verification */}
            <PhoneVerification 
              onVerificationComplete={handlePhoneVerificationComplete}
              isVerified={phoneVerified}
              verifiedPhone={verifiedPhone}
              autoFilledPhone={verifiedBusiness?.formatted_phone_number || verifiedBusiness?.international_phone_number || undefined}
            />

            {/* Restaurant Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Restaurant Contact Email *</label>
              <div className="flex w-full">
                <input 
                  placeholder="restaurant (no @)" 
                  value={restaurantEmail} 
                  onChange={e => setRestaurantEmail(e.target.value)} 
                  className="input-base w-7/10 rounded-r-none" 
                />
                <span className="input-base bg-zinc-700 rounded-l-none flex items-center justify-center w-3/10">@gmail.com</span>
              </div>
            </div>
          </div>
        )}

        {/* Diner Email and Phone */}
        {role === 'diner' && (
          <>
            <div className="flex w-full">
              <input placeholder="Gmail (no @)" value={emailLocal} onChange={e => setEmailLocal(e.target.value)} className="input-base w-7/10 rounded-r-none" />
              <span className="input-base bg-zinc-700 rounded-l-none flex items-center justify-center w-3/10">@gmail.com</span>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1"><span className="font-bold">1</span><span>+</span></div>
              <input maxLength={3} ref={areaRef} value={area} onChange={e => { setArea(e.target.value); if (e.target.value.length === 3) prefixRef.current?.focus(); }} className="input-base w-1/3" />
              <input maxLength={3} ref={prefixRef} value={prefix} onChange={e => { setPrefix(e.target.value); if (e.target.value.length === 3) lineRef.current?.focus(); }} className="input-base w-1/3" />
              <input maxLength={4} ref={lineRef} value={line} onChange={e => setLine(e.target.value)} className="input-base w-1/3" />
            </div>
          </>
        )}

        {successMessage && <p className="text-green-400 text-center text-sm">{successMessage}</p>}

        {/* Restaurant Verification Status */}
        {role === 'restaurant' && (!businessVerified || !phoneVerified) && (
          <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-3 text-center">
            <p className="text-yellow-300 text-sm">
              Please complete business verification and phone verification first
            </p>
          </div>
        )}

        {!verificationSent ? (
          <button 
            onClick={handleSendVerification} 
            className={`w-full py-2 px-4 rounded font-semibold mb-3 transition-all duration-200 ${
              (role === 'restaurant' && (!businessVerified || !phoneVerified)) || sending || countdown > 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
            }`}
            disabled={(role === 'restaurant' && (!businessVerified || !phoneVerified)) || sending || countdown > 0}
          >
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

        <p className="text-sm text-center text-zinc-500">Your Smart Wallet: {address || 'Not connected'}</p>
      </div>
    </div>
  );
}
