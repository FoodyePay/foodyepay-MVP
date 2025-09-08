// app/api/check-phone-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

interface CheckVerificationRequest {
  phoneNumber: string;
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code }: CheckVerificationRequest = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Phone number and verification code are required' 
        },
        { status: 400 }
      );
    }

    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error('❌ Twilio credentials not configured');
      return NextResponse.json(
        { 
          success: false,
          message: 'Phone verification service temporarily unavailable' 
        },
        { status: 500 }
      );
    }

    const twilioClient = twilio(accountSid, authToken);

    console.log('🔍 Verifying code for phone:', phoneNumber);

    // Handle test phone numbers - keep old test number logic
    const isTestNumber = phoneNumber.includes('5550000000') || phoneNumber.includes('+15550000000');
    const isMyNumber = phoneNumber.includes('2016736206') || phoneNumber.includes('+12016736206');
    
    if (isTestNumber) {
      console.log('🧪 Using test number verification');
      if (code === '123456') {
        return NextResponse.json({ 
          success: true, 
          verified: true,
          message: 'Test verification successful!',
          isTest: true
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          verified: false,
          message: 'Invalid test code. Use: 123456'
        }, { status: 400 });
      }
    }

    if (isMyNumber) {
      console.log('🧪 Using your number verification - test mode');
      if (code === '654321') {
        return NextResponse.json({ 
          success: true, 
          verified: true,
          message: 'Your number verification successful!',
          isTest: true
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          verified: false,
          message: 'Invalid code for your number. Use: 654321'
        }, { status: 400 });
      }
    }

    // For all other numbers, use actual Twilio verification
    const verificationCheck = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ 
        to: phoneNumber, 
        code: code 
      });

    if (verificationCheck.status === 'approved') {
      console.log('✅ Phone verification successful');
      return NextResponse.json({ 
        success: true, 
        message: '电话号码验证成功！',
        verified: true
      });
    } else {
      console.log('❌ Phone verification failed:', verificationCheck.status);
      return NextResponse.json({ 
        success: false, 
        message: '验证码错误或已过期，请重新获取',
        verified: false
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Phone verification check error:', error);
    
    // Handle specific Twilio errors
    if (error.code) {
      switch (error.code) {
        case 20404:
          return NextResponse.json({
            success: false,
            message: '验证码已过期或无效，请重新获取',
            verified: false
          }, { status: 400 });
        
        case 60202:
          return NextResponse.json({
            success: false,
            message: '验证尝试次数过多，请重新发送验证码',
            verified: false
          }, { status: 400 });
        
        default:
          console.error('Twilio verification error code:', error.code, error.message);
      }
    }

    return NextResponse.json({
      success: false,
      message: '验证失败，请稍后重试',
      verified: false
    }, { status: 500 });
  }
}
