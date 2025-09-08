// components/PhoneVerification.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

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
      setPhoneNumber(autoFilledPhone);
    }
  }, [autoFilledPhone]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) {
      return cleaned;
    }
    if (cleaned.length <= 4) {
      return `(${cleaned.slice(1)})`;
    }
    if (cleaned.length <= 7) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    }
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 11) {
      setPhoneNumber(formatPhoneNumber(cleaned));
    }
  };

  const getCleanPhoneNumber = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
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
        <h4 className="text-sm font-medium text-gray-400">📞 Verify Restaurant Phone Number</h4>
        
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
              </div>            <div className="space-y-2">
              <label className="text-sm text-gray-400">Verification Method</label>
              <div className="flex justify-center">
                <div className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-medium">
                  📞 Voice Verification
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                You will receive a voice call with your verification code
              </p>
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

      <div className="text-xs text-gray-500 space-y-1">
        <p>📞 We will send a verification code to the provided number to confirm your ownership</p>
        <p>🔒 This helps ensure only genuine restaurant owners can register</p>
      </div>
    </div>
  );
}
