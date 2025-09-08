// app/api/send-phone-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

interface SendVerificationRequest {
  phoneNumber: string;
  channel: 'sms' | 'call';
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, channel }: SendVerificationRequest = await request.json();

    if (!phoneNumber || !channel) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Phone number and verification channel are required' 
        },
        { status: 400 }
      );
    }

    if (!['sms', 'call'].includes(channel)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid verification channel. Use "sms" or "call"' 
        },
        { status: 400 }
      );
    }

    console.log(`📞 Sending ${channel} verification to:`, phoneNumber);

    // Handle test phone numbers - define early
    const isTestNumber = phoneNumber.includes('5550000000') || phoneNumber.includes('+15550000000');
    const isMyNumber = phoneNumber.includes('2016736206') || phoneNumber.includes('+12016736206');

    // Always use test mode for now
    if (isTestNumber) {
      console.log('🧪 Using test number - simulating success');
      return NextResponse.json({ 
        success: true, 
        message: `Test verification code sent via Voice to ${phoneNumber}. Use code: 123456`,
        channel: channel,
        isTest: true
      });
    }

    if (isMyNumber) {
      console.log('🧪 Using your number - simulating success for testing');
      return NextResponse.json({ 
        success: true, 
        message: `Test verification code sent via Voice to your number ${phoneNumber}. Use code: 654321`,
        channel: channel,
        isTest: true
      });
    }

    // For all other numbers, use test mode for now
    return NextResponse.json({ 
      success: true, 
      message: `Test verification code sent via Voice to ${phoneNumber}. Use code: 999888`,
      channel: channel,
      isTest: true
    });

  } catch (error: any) {
    console.error('❌ Phone verification send error:', error);
    return NextResponse.json({
      success: false,
      message: 'Verification code send failed, please try again later'
    }, { status: 500 });
  }
}
