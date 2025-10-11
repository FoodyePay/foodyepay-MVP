// components/PhoneVerification.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  isVerified: boolean;
  verifiedPhone?: string;
  autoFilledPhone?: string; // New prop for auto-filled phone number
}

export function PhoneVerification({ 
  onVerificationComplete, 
  isVerified, 
  verifiedPhone,
  autoFilledPhone 
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(autoFilledPhone || '');
  const [verificationChannel, setVerificationChannel] = useState<'call'>('call'); // Only voice verification
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Update phone number when autoFilledPhone changes
  useEffect(() => {
    if (autoFilledPhone && autoFilledPhone !== phoneNumber) {
      setPhoneNumber(e164ToDisplay(autoFilledPhone));
    }
  }, [autoFilledPhone]);

  // Helpers for phone formatting
  const formatDisplayFromDigits = (digits: string) => {
    // Remove leading country code for display if present
    if (digits.startsWith('1')) {
      // If user pasted 11 digits with leading 1
      if (digits.length > 10) digits = digits.slice(1);
    }
    const d = digits.slice(0, 10); // US 10 digits
    const len = d.length;
    if (len === 0) return '';
    if (len < 4) return d; // Do not show parentheses until 3 digits
    if (len < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const e164ToDisplay = (value: string) => {
    const match = value.match(/^\+1(\d{10})$/);
    if (match) {
      return formatDisplayFromDigits(match[1]);
    }
    return formatDisplayFromDigits(value.replace(/\D/g, ''));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    setPhoneNumber(formatDisplayFromDigits(cleaned));
  };

  const getCleanPhoneNumber = () => {
    let digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`; // already has country code
    }
    // Ensure exactly last 10 digits are used
    if (digits.length >= 10) {
      digits = digits.slice(-10);
      return `+1${digits}`;
    }
    return `+1${digits}`; // caller should validate length before sending
  };

  const handleSendCode = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      setError('Please enter a valid US phone number');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/send-phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: getCleanPhoneNumber(),
          channel: verificationChannel
        })
      });

      const data = await response.json();

      if (data.success) {
        setCodeSent(true);
        setSuccess(data.message);
        setCountdown(60);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Focus on code input
        setTimeout(() => codeRef.current?.focus(), 100);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setError('Failed to send verification code, please try again later');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/check-phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: getCleanPhoneNumber(),
          code: verificationCode
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setSuccess('Phone verification successful!');
        onVerificationComplete(getCleanPhoneNumber());
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setError('Verification failed, please try again later');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = () => {
    setCodeSent(false);
    setVerificationCode('');
    setCountdown(0);
    setError('');
    setSuccess('');
  };

  if (isVerified && verifiedPhone) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-900 border border-green-500 rounded-lg">
          <h4 className="text-green-300 font-medium mb-2">✅ Phone Number Verified</h4>
          <p className="text-green-200 text-sm">
            Verified number: {verifiedPhone}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
  <h4 className="text-sm font-medium text-gray-400 flex items-center">📞 Verify Restaurant Phone Number <InfoTooltip text="We’ll place a short automated call and read a 6‑digit code to confirm ownership." /></h4>
        
        {!codeSent ? (
          <>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Restaurant Phone Number *</label>
                <input
                  ref={phoneRef}
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="input-base w-full"
                  disabled={sending}
                  maxLength={14}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Please enter your restaurant's landline or mobile number
                  </p>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('(201) 673-6206')}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Use My Number
                  </button>
                </div>
              </div>

            <button
              onClick={handleSendCode}
              disabled={sending || phoneNumber.replace(/\D/g, '').length < 10}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                sending || phoneNumber.replace(/\D/g, '').length < 10
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {sending ? 'Sending...' : 'Send Voice Verification Code'}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Verification Code</label>
              <input
                ref={codeRef}
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setVerificationCode(value);
                  }
                }}
                className="input-base w-full text-center text-lg tracking-wider"
                disabled={verifying}
                maxLength={6}
              />
              <p className="text-xs text-gray-500">
                Verification code sent to {phoneNumber}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleVerifyCode}
                disabled={verifying || verificationCode.length !== 6}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  verifying || verificationCode.length !== 6
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
              
              <button
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  countdown > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'
                }`}
              >
                {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900 border border-green-500 rounded-lg">
            <p className="text-green-300 text-sm">✅ {success}</p>
          </div>
        )}
      </div>

      {/* Helper text removed in favor of tooltip */}
    </div>
  );
}
