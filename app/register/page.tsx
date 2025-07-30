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
import { verifyRestaurantRegistration, type VerificationResult } from '@/lib/restaurantVerification';
import { verifyEIN, formatEIN, validateEINFormat } from '@/utils/verifyEIN';

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
  const [ein, setEin] = useState(''); // Employer Identification Number
  // USPS Standard Address Fields
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [suiteApt, setSuiteApt] = useState(''); // Optional
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  // Business Phone for restaurants
  const [businessArea, setBusinessArea] = useState('');
  const [businessPrefix, setBusinessPrefix] = useState('');
  const [businessLine, setBusinessLine] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [einVerified, setEinVerified] = useState(false);
  const [einVerificationError, setEinVerificationError] = useState('');

  const areaRef = useRef<HTMLInputElement>(null);
  const prefixRef = useRef<HTMLInputElement>(null);
  const lineRef = useRef<HTMLInputElement>(null);
  const streetNameRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const businessAreaRef = useRef<HTMLInputElement>(null);
  const businessPrefixRef = useRef<HTMLInputElement>(null);
  const businessLineRef = useRef<HTMLInputElement>(null);

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

  // 🔍 独立的 EIN 验证函数
  const handleVerifyEIN = async () => {
    if (!ein || !restaurantName) {
      alert('Please enter both EIN and Restaurant Name before verifying');
      return;
    }

    if (!validateEINFormat(ein)) {
      setEinVerificationError('Invalid EIN format. Please use XX-XXXXXXX format.');
      alert('❌ Invalid EIN format. Please use XX-XXXXXXX format (e.g., 12-3456789)');
      return;
    }

    setSending(true);
    setEinVerificationError('');

    try {
      console.log('🔍 Starting EIN verification...', { ein, restaurantName });
      
      const einResult = await verifyEIN(ein, restaurantName);
      
      if (!einResult.valid) {
        setEinVerificationError(einResult.error || 'EIN verification failed');
        const errorMessage = einResult.registeredName 
          ? `❌ EIN 与餐厅名称不匹配\n\nIRS 记录显示:\nEIN: ${ein}\n注册名称: "${einResult.registeredName}"\n您输入的名称: "${restaurantName}"\n\n请检查信息是否正确。`
          : `❌ EIN 验证失败\n\n${einResult.error}\n\n请检查您的 EIN 是否正确。`;
        
        alert(errorMessage);
        setEinVerified(false);
      } else {
        console.log('✅ EIN verification successful:', einResult);
        setEinVerified(true);
        setEinVerificationError('');
        alert(`✅ EIN 验证成功！\n\n注册名称: ${einResult.registeredName}\nEIN: ${einResult.ein}`);
      }
    } catch (error) {
      console.error('💥 EIN verification error:', error);
      setEinVerificationError('Network error during EIN verification');
      alert('❌ 网络错误，请稍后重试');
      setEinVerified(false);
    } finally {
      setSending(false);
    }
  };

  const handleSendVerification = async () => {
    console.log('🔄 handleSendVerification called');
    console.log('📋 Current form data:', {
      role,
      emailLocal,
      restaurantName,
      ein,
      streetNumber,
      streetName,
      city,
      state,
      zipCode,
      businessArea,
      businessPrefix,
      businessLine
    });

    // Validation for diner
    if (role === 'diner' && (!emailLocal || !firstName || !lastName || !area || !prefix || !line)) {
      console.log('❌ Diner validation failed');
      alert('Please complete all required fields for diner registration');
      return;
    }
    
    // Validation for restaurant
    if (role === 'restaurant' && (!emailLocal || !restaurantName || !ein || !streetNumber || !streetName || !city || !state || !zipCode || !businessArea || !businessPrefix || !businessLine)) {
      console.log('❌ Restaurant validation failed');
      console.log('Missing fields:', {
        emailLocal: !emailLocal,
        restaurantName: !restaurantName,
        ein: !ein,
        streetNumber: !streetNumber,
        streetName: !streetName,
        city: !city,
        state: !state,
        zipCode: !zipCode,
        businessArea: !businessArea,
        businessPrefix: !businessPrefix,
        businessLine: !businessLine
      });
      alert('Please complete all required fields for restaurant registration including EIN and business phone');
      return;
    }

    // 🔍 餐厅必须先通过 EIN 验证
    if (role === 'restaurant' && !einVerified) {
      alert('❌ Please verify your EIN first by clicking the "Verify" button next to the EIN field.');
      return;
    }

    console.log('✅ Validation passed, proceeding...');

    // 🔍 餐厅的其他验证流程 (EIN 已经单独验证过了)
    if (role === 'restaurant') {
      setSending(true);
      
      try {
        const verificationData = {
          name: restaurantName,
          ein: ein,
          address: `${streetNumber} ${streetName}${suiteApt ? `, ${suiteApt}` : ''}, ${city}, ${state} ${zipCode}`,
          streetNumber,
          streetName,
          city,
          state,
          zipCode,
          phone: `1-${businessArea}-${businessPrefix}-${businessLine}`,
          email: `${emailLocal}@gmail.com`
        };

        console.log('🔍 Running restaurant verification...');
        const result = await verifyRestaurantRegistration(verificationData);
        setVerificationResult(result);

        if (!result.isValid) {
          setSending(false);
          alert(`❌ Verification Failed (Score: ${result.score}/100)\n\nIssues:\n${result.issues.join('\n')}\n\nPlease correct the issues and try again.`);
          return;
        }

        if (result.warnings.length > 0) {
          const proceed = confirm(`⚠️ Verification Warnings (Score: ${result.score}/100)\n\n${result.warnings.join('\n')}\n\nDo you want to proceed anyway?`);
          if (!proceed) {
            setSending(false);
            return;
          }
        }

        console.log('✅ Restaurant verification passed:', result);
      } catch (error) {
        console.error('Verification error:', error);
        setSending(false);
        alert('Verification service unavailable. Please try again later.');
        return;
      }
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
            phone: `1-${businessArea}-${businessPrefix}-${businessLine}`, // Business phone for restaurants
            name: restaurantName,
            ein: ein, // Store EIN for business verification
            // Format address in USPS standard format
            address: `${streetNumber} ${streetName}${suiteApt ? `, ${suiteApt}` : ''}, ${city}, ${state} ${zipCode}`.trim(),
            // Store detailed address components for future use
            street_number: streetNumber,
            street_name: streetName,
            suite_apt: suiteApt,
            city: city,
            state: state,
            zip_code: zipCode,
            wallet_address: address,
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

        {role === 'diner' && (
          <>
            <input placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-base w-full" />
            <input placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} className="input-base w-full" />
          </>
        )}

        {role === 'restaurant' && (
          <>
            <input 
              placeholder="Restaurant Name *" 
              value={restaurantName} 
              onChange={e => setRestaurantName(e.target.value)} 
              className="input-base w-full" 
            />
            
            {/* EIN Field with Verify Button */}
            <div className="space-y-2">
              <label htmlFor="ein" className="text-sm font-medium text-gray-400">
                Employer Identification Number (EIN) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="ein"
                  name="ein"
                  required
                  placeholder="xx-xxxxxxx"
                  value={ein}
                  onChange={e => {
                    const formattedValue = formatEIN(e.target.value);
                    setEin(formattedValue);
                    // Reset verification status when EIN changes
                    setEinVerified(false);
                    setEinVerificationError('');
                  }}
                  pattern="\d{2}-\d{7}"
                  maxLength={10}
                  className={`input-base flex-1 ${einVerificationError ? 'border-red-500' : einVerified ? 'border-green-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={handleVerifyEIN}
                  disabled={!ein || !restaurantName || sending}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    einVerified 
                      ? 'bg-green-600 text-white cursor-default' 
                      : (!ein || !restaurantName)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {sending ? '...' : einVerified ? '✓' : 'Verify'}
                </button>
              </div>
              
              {einVerificationError && (
                <div className="p-3 bg-red-900 border border-red-500 rounded-lg">
                  <p className="text-xs text-red-300">
                    ❌ {einVerificationError}
                  </p>
                </div>
              )}
              
              {einVerified && (
                <div className="p-3 bg-green-900 border border-green-500 rounded-lg">
                  <p className="text-xs text-green-300">
                    ✅ EIN 已通过 IRS 验证
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                🔒 我们将使用 IRS 注册信息验证您的餐厅身份
              </p>
            </div>
            
            {/* USPS Standard Address Fields */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Restaurant Address (USPS Format)</h4>
              
              {/* Street Number and Name */}
              <div className="flex space-x-2">
                <input 
                  placeholder="Street # *" 
                  value={streetNumber} 
                  onChange={e => setStreetNumber(e.target.value)} 
                  className="input-base w-1/3" 
                  onKeyDown={(e) => e.key === 'Enter' && streetNameRef.current?.focus()}
                />
                <input 
                  ref={streetNameRef}
                  placeholder="Street Name *" 
                  value={streetName} 
                  onChange={e => setStreetName(e.target.value)} 
                  className="input-base flex-1" 
                />
              </div>
              
              {/* Suite/Apt (Optional) */}
              <input 
                placeholder="Suite/Apt/Unit (Optional)" 
                value={suiteApt} 
                onChange={e => setSuiteApt(e.target.value)} 
                className="input-base w-full" 
                onKeyDown={(e) => e.key === 'Enter' && cityRef.current?.focus()}
              />
              
              {/* City, State, ZIP */}
              <div className="flex space-x-2">
                <input 
                  ref={cityRef}
                  placeholder="City *" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  className="input-base flex-1" 
                />
                <select 
                  value={state} 
                  onChange={e => setState(e.target.value)} 
                  className="input-base w-20"
                >
                  <option value="">State</option>
                  <option value="AL">AL</option>
                  <option value="AK">AK</option>
                  <option value="AZ">AZ</option>
                  <option value="AR">AR</option>
                  <option value="CA">CA</option>
                  <option value="CO">CO</option>
                  <option value="CT">CT</option>
                  <option value="DE">DE</option>
                  <option value="FL">FL</option>
                  <option value="GA">GA</option>
                  <option value="HI">HI</option>
                  <option value="ID">ID</option>
                  <option value="IL">IL</option>
                  <option value="IN">IN</option>
                  <option value="IA">IA</option>
                  <option value="KS">KS</option>
                  <option value="KY">KY</option>
                  <option value="LA">LA</option>
                  <option value="ME">ME</option>
                  <option value="MD">MD</option>
                  <option value="MA">MA</option>
                  <option value="MI">MI</option>
                  <option value="MN">MN</option>
                  <option value="MS">MS</option>
                  <option value="MO">MO</option>
                  <option value="MT">MT</option>
                  <option value="NE">NE</option>
                  <option value="NV">NV</option>
                  <option value="NH">NH</option>
                  <option value="NJ">NJ</option>
                  <option value="NM">NM</option>
                  <option value="NY">NY</option>
                  <option value="NC">NC</option>
                  <option value="ND">ND</option>
                  <option value="OH">OH</option>
                  <option value="OK">OK</option>
                  <option value="OR">OR</option>
                  <option value="PA">PA</option>
                  <option value="RI">RI</option>
                  <option value="SC">SC</option>
                  <option value="SD">SD</option>
                  <option value="TN">TN</option>
                  <option value="TX">TX</option>
                  <option value="UT">UT</option>
                  <option value="VT">VT</option>
                  <option value="VA">VA</option>
                  <option value="WA">WA</option>
                  <option value="WV">WV</option>
                  <option value="WI">WI</option>
                  <option value="WY">WY</option>
                </select>
                <input 
                  placeholder="ZIP *" 
                  value={zipCode} 
                  onChange={e => setZipCode(e.target.value)} 
                  className="input-base w-24" 
                  pattern="[0-9]{5}(-[0-9]{4})?"
                  maxLength={10}
                />
              </div>
              
              {/* Address Preview */}
              {(streetNumber || streetName || city || state || zipCode) && (
                <div className="text-xs text-gray-400 bg-zinc-800 p-2 rounded">
                  <strong>Address Preview:</strong><br />
                  {streetNumber} {streetName}{suiteApt ? `, ${suiteApt}` : ''}<br />
                  {city}, {state} {zipCode}
                </div>
              )}
            </div>
            
            {/* Business Phone */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Business Phone *</h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold">1</span>
                  <span>+</span>
                </div>
                <input 
                  maxLength={3} 
                  ref={businessAreaRef} 
                  placeholder="XXX"
                  value={businessArea} 
                  onChange={e => { 
                    setBusinessArea(e.target.value); 
                    if (e.target.value.length === 3) businessPrefixRef.current?.focus(); 
                  }} 
                  className="input-base w-1/3" 
                />
                <input 
                  maxLength={3} 
                  ref={businessPrefixRef} 
                  placeholder="XXX"
                  value={businessPrefix} 
                  onChange={e => { 
                    setBusinessPrefix(e.target.value); 
                    if (e.target.value.length === 3) businessLineRef.current?.focus(); 
                  }} 
                  className="input-base w-1/3" 
                />
                <input 
                  maxLength={4} 
                  ref={businessLineRef} 
                  placeholder="XXXX"
                  value={businessLine} 
                  onChange={e => setBusinessLine(e.target.value)} 
                  className="input-base w-1/3" 
                />
              </div>
              {(businessArea || businessPrefix || businessLine) && (
                <div className="text-xs text-gray-400">
                  Preview: +1-{businessArea}-{businessPrefix}-{businessLine}
                </div>
              )}
            </div>
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

        {/* 🔍 Verification Results for Restaurants */}
        {role === 'restaurant' && verificationResult && (
          <div className="space-y-2">
            <button
              onClick={() => setShowVerificationDetails(!showVerificationDetails)}
              className="w-full text-left flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${verificationResult.isValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium">
                  Verification Score: {verificationResult.score}/100
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {showVerificationDetails ? '▼' : '▶'}
              </span>
            </button>
            
            {showVerificationDetails && (
              <div className="p-3 bg-zinc-800 rounded-lg text-xs space-y-2">
                {verificationResult.issues.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-400 mb-1">Issues:</h5>
                    <ul className="text-red-300 space-y-1">
                      {verificationResult.issues.map((issue: string, index: number) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {verificationResult.warnings.length > 0 && (
                  <div>
                    <h5 className="font-medium text-yellow-400 mb-1">Warnings:</h5>
                    <ul className="text-yellow-300 space-y-1">
                      {verificationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {verificationResult.isValid && (
                  <p className="text-green-400">✅ All verifications passed!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🔍 EIN 验证提示 */}
        {role === 'restaurant' && !einVerified && ein && restaurantName && (
          <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-3 text-center">
            <p className="text-yellow-300 text-sm">
              ⚠️ Please verify your EIN first by clicking the &quot;Verify&quot; button
            </p>
          </div>
        )}

        {!verificationSent ? (
          <button 
            onClick={handleSendVerification} 
            className={`w-full py-2 px-4 rounded font-semibold mb-3 transition-all duration-200 ${
              (role === 'restaurant' && !einVerified) || sending || countdown > 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
            }`}
            disabled={(role === 'restaurant' && !einVerified) || sending || countdown > 0}
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
