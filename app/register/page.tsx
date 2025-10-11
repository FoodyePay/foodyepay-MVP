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
  const isValidEmail = (v: string) => /.+@.+\..+/.test(v);
  
  // New verification states
  const [businessVerified, setBusinessVerified] = useState(false);
  const [verifiedBusiness, setVerifiedBusiness] = useState<Business | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const [sending, setSending] = useState(false);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<'pending'|'needs_more_info'|'verified'|'rejected'|null>(null);
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
    try { localStorage.setItem('selected_business', JSON.stringify(business)); } catch {}
    try { localStorage.setItem('register_role', 'restaurant'); } catch {}
  };

  // Handle phone verification completion
  const handlePhoneVerificationComplete = (phoneNumber: string) => {
    setVerifiedPhone(phoneNumber);
    setPhoneVerified(true);
  };

  // Start Stripe Connect Express onboarding
  const handleStartStripeVerification = async () => {
    try {
      if (!verifiedBusiness) {
        alert('Please select your restaurant first');
        return;
      }
      try { if (address) localStorage.setItem('connected_wallet', address); } catch {}
      const res = await fetch('/api/connect/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: verifiedBusiness?.name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start verification');
      setStripeAccountId(data.accountId);
      try { localStorage.setItem('stripe_account_id', data.accountId); } catch {}
      setStripeOnboardingUrl(data.onboardingUrl);
      window.location.href = data.onboardingUrl;
    } catch (e: any) {
      console.error('Stripe start error', e);
      alert(e.message || 'Failed to start Stripe verification');
    }
  };

  // Simple US address parser from formatted string like: "103 Essex St, New York, NY 10002, USA"
  const parseAddressParts = (formatted?: string) => {
    if (!formatted) return { city: null, state: null, postal_code: null, country: null, street_number: null, street_name: null } as any;
    const parts = formatted.split(',').map(s => s.trim());
    // parts[0] = street line, parts[1] = city, parts[2] = "NY 10002", parts[3] = country
    const street = parts[0] || '';
    const city = parts[1] || null;
    let state: string | null = null;
    let postal_code: string | null = null;
    const m = (parts[2] || '').match(/([A-Za-z]{2})\s+(\d{5}(-\d{4})?)/);
    if (m) { state = m[1]; postal_code = m[2]; }
    const country = parts[3] || null;
    const streetNum = (street.match(/^\s*(\d+)/) || [])[1] || null;
    const streetName = streetNum ? street.replace(/^\s*\d+\s*/, '') : street; // drop leading number
    return { city, state, postal_code, country, street_number: streetNum, street_name: streetName || null };
  };

  // Check Stripe status
  const handleRefreshStripeStatus = async () => {
    try {
      if (!stripeAccountId) return;
      const res = await fetch('/api/connect/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: stripeAccountId })
      });
      const data = await res.json();
      if (res.ok) {
        setStripeStatus(data.verification_status);
      }
    } catch (e) {
      console.error('Stripe status error', e);
    }
  };

  // Load any cached Stripe account from return/refresh bridge
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('register_role');
      if (savedRole === 'restaurant' || savedRole === 'diner') {
        setRole(savedRole as any);
      }

      const savedBiz = localStorage.getItem('selected_business');
      if (savedBiz) {
        try {
          const parsed = JSON.parse(savedBiz) as Business;
          setVerifiedBusiness(parsed);
          setBusinessVerified(true);
        } catch {}
      }

      const cached = localStorage.getItem('stripe_account_id');
      if (cached) {
        setStripeAccountId(cached);
        // auto refresh status once
        (async () => {
          try {
            const res = await fetch('/api/connect/status', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: cached })
            });
            const data = await res.json();
            if (res.ok) setStripeStatus(data.verification_status);
          } catch {}
        })();
      }
    } catch {}
  }, []);

  // Finalize restaurant registration without email/phone, relying on Stripe onboarding + Google data
  const handleFinalizeRestaurantRegistration = async () => {
    if (!address) return alert('Wallet not ready');
    if (!verifiedBusiness) return alert('Please select your restaurant first');
    if (!stripeAccountId) return alert('Please start Stripe onboarding');

    try {
      const payload: any = {
        name: verifiedBusiness?.name || 'Unknown Restaurant',
        // Store Google Maps data
        google_place_id: verifiedBusiness?.place_id,
        address: verifiedBusiness?.formatted_address,
        rating: verifiedBusiness?.rating || 0,
        user_ratings_total: verifiedBusiness?.user_ratings_total || 0,
        wallet_address: address,
        role: 'restaurant',
        stripe_account_id: stripeAccountId,
        stripe_status: stripeStatus,
      };

      const parts = parseAddressParts(verifiedBusiness?.formatted_address);
      payload.city = parts.city;
      payload.state = parts.state;
      payload.postal_code = parts.postal_code;
      payload.country = parts.country;
  if (parts.street_number) payload.street_number = parts.street_number;
  if (parts.street_name) payload.street_name = parts.street_name;
  if (parts.postal_code) payload.zip_code = parts.postal_code; // legacy column support

      let { data, error } = await supabase
        .from('restaurants')
        .insert([payload])
        .select();

      if (error) {
        // Fallback minimal insert if schema differs or NOT NULL constraints are present
        const minimal: any = {
          name: payload.name,
          address: payload.address || (verifiedBusiness?.formatted_address ?? 'Unknown Address'),
          wallet_address: payload.wallet_address,
          role: payload.role,
        };
        // include structured parts when available
        const parts2 = parseAddressParts(verifiedBusiness?.formatted_address);
  minimal.city = parts2.city;
  minimal.state = parts2.state;
  minimal.postal_code = parts2.postal_code;
  minimal.country = parts2.country;
  if (parts2.postal_code) minimal.zip_code = parts2.postal_code; // legacy column
  if (parts2.street_number) minimal.street_number = parts2.street_number;
  if (parts2.street_name) minimal.street_name = parts2.street_name;

        // If error indicates a specific NOT NULL column (e.g., street_number), try to derive from formatted address
        const errMsg = String(error.message || '');
        const m = errMsg.match(/column\s+"?(\w+)"?.*not-null/i);
        if (m) {
          const col = m[1];
          const formatted = verifiedBusiness?.formatted_address || '';
          if (col === 'street_number') {
            const sn = (formatted.match(/^\s*(\d+)/) || [])[1];
            if (sn) minimal.street_number = sn;
            const streetName = formatted.replace(/^\s*\d+\s*/, '').split(',')[0]?.trim();
            if (streetName) minimal.street_name = streetName;
          }
          if (col === 'street_name') {
            const streetName = formatted.replace(/^\s*\d+\s*/, '').split(',')[0]?.trim();
            if (streetName) minimal.street_name = streetName;
          }
          if (col === 'zip_code') {
            const mm = formatted.split(',').map(s => s.trim());
            const m2 = (mm[2] || '').match(/([A-Za-z]{2})\s+(\d{5}(-\d{4})?)/);
            if (m2) minimal.zip_code = m2[2];
          }
        }

        const retry = await supabase.from('restaurants').insert([minimal]).select();
        if (retry.error) {
          alert(`Database error: ${retry.error.message}`);
          return;
        }
        data = retry.data;
      }

      try { localStorage.setItem('foodye_wallet', address); } catch {}
      router.push(`/register/yes/success?role=restaurant`);
    } catch (err: any) {
      console.error('Finalize restaurant failed', err);
      alert('Registration error');
    }
  };

  const handleSendVerification = async () => {
    console.log('handleSendVerification called');
    console.log('Current form data:', {
      role,
      emailPreview: role === 'restaurant' ? restaurantEmail : `${emailLocal}@gmail.com`,
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
      const stripeReady = !!stripeAccountId && (stripeStatus === 'verified' || stripeStatus === 'needs_more_info');
      if (!restaurantEmail || !isValidEmail(restaurantEmail) || !businessVerified || !phoneVerified || !stripeReady) {
        console.log('Restaurant validation failed');
        console.log('Missing requirements:', {
          restaurantEmail: !restaurantEmail,
          restaurantEmailValid: !isValidEmail(restaurantEmail),
          businessVerified: !businessVerified,
          phoneVerified: !phoneVerified,
          stripeReady: !stripeReady
        });
        
        const missingItems: string[] = [];
        if (!restaurantEmail) missingItems.push('Restaurant Email');
        if (restaurantEmail && !isValidEmail(restaurantEmail)) missingItems.push('Valid Email Format');
        if (!businessVerified) missingItems.push('Business Verification');
        if (!phoneVerified) missingItems.push('Phone Verification');
        if (!stripeReady) missingItems.push('Stripe Onboarding (complete or needs more info)');
        
        alert(`Please complete the following verification steps:\n\n${missingItems.join('\n')}`);
        return;
      }
    }

    console.log('Validation passed, proceeding...');

  const email = role === 'restaurant' ? restaurantEmail : `${emailLocal}@gmail.com`;
    const code = generateVerificationCode();
    saveVerificationCode(email, code);

    setSending(true);
    try {
      const { echoedCode, echoMode } = await sendVerificationCodeEmail(email, code, address!);
      setVerificationSent(true);
      setCountdown(60);
      setCodeSentAt(Date.now());
      if (echoMode && echoedCode) {
        setInputCode(echoedCode);
        setSuccessMessage('Code sent (dev mode). Prefilled for convenience.');
      } else {
        setSuccessMessage('Code sent to email!');
      }
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

  const email = role === 'restaurant' ? restaurantEmail : `${emailLocal}@gmail.com`;
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
      
      const tableName = role === 'diner' ? 'diners' : 'restaurants';
      let { data, error } = await supabase
        .from(tableName)
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase insertion error:', error);
        // Fallback: if schema is older (e.g., missing google_place_id), retry minimal insert for restaurants
        const unknownColumn = typeof error.message === 'string' && /column|schema cache|relation|unknown/i.test(error.message);
        const isRestaurant = tableName === 'restaurants';
        if (isRestaurant && unknownColumn) {
          console.warn('Attempting fallback insert with minimal columns (email, phone, name, wallet_address, role)');
          const minimalPayload = {
            email: (payload as any).email,
            phone: (payload as any).phone,
            name: (payload as any).name,
            wallet_address: (payload as any).wallet_address,
            role: (payload as any).role,
          };
          const retry = await supabase
            .from('restaurants')
            .insert([minimalPayload])
            .select();
          if (retry.error) {
            console.error('Fallback insert failed:', retry.error);
            alert(`Database error: ${retry.error.message}`);
            return;
          }
          data = retry.data;
          console.info('Fallback insert succeeded');
        } else {
          alert(`Database error: ${error.message}`);
          return;
        }
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
            {/* Step 1: Business Verification */}
            <BusinessVerification 
              onVerificationComplete={handleBusinessVerificationComplete}
              isVerified={businessVerified}
              verifiedBusiness={verifiedBusiness}
            />

            {/* Step 2: Stripe Onboarding (only after Step 1) */}
            {businessVerified && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartStripeVerification}
                      disabled={!businessVerified}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        !businessVerified ? 'bg-gray-600 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      Start verification (Stripe Onboarding)
                    </button>
                    {stripeAccountId && (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/connect/relink', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: stripeAccountId }) });
                          const data = await res.json();
                          if (res.ok) window.location.href = data.onboardingUrl; else alert(data.error || 'Failed to open onboarding');
                        }}
                        className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
                      >
                        Return to onboarding
                      </button>
                    )}
                  </div>
                  {stripeAccountId && (
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Account: {stripeAccountId}</p>
                      <div className="flex gap-2">
                        <button onClick={handleRefreshStripeStatus} className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600">Refresh status</button>
                      </div>
                      {stripeStatus && (<p>Status: {stripeStatus}</p>)}
                    </div>
                  )}
                </div>

                {/* Finalize: show only when Stripe ready */}
                {(stripeAccountId && ['verified','needs_more_info'].includes(String(stripeStatus))) && (
                  <button
                    onClick={handleFinalizeRestaurantRegistration}
                    className="w-full py-2 px-4 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Finish Registration
                  </button>
                )}
              </div>
            )}
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

        {/* Banner removed to reduce visual noise; disabled buttons convey state */}

        {!verificationSent ? (
          // For diners only; restaurant flow finishes via Stripe
          (role === 'diner') ? (
            <button 
              onClick={handleSendVerification} 
              className={`w-full py-2 px-4 rounded font-semibold mb-3 transition-all duration-200 ${
                sending || countdown > 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
              }`}
              disabled={sending || countdown > 0}
            >
              {sending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send Verification Code'}
            </button>
          ) : null
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
