import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { email, code, walletAddress } = await req.json();

  console.log('[Email API] Request received:', {
    email,
    code: code ? '***PROVIDED***' : 'MISSING',
    walletAddress: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'MISSING'
  });

  if (!email || !code || !walletAddress) {
    console.error('[Email API] Missing required fields:', { email: !!email, code: !!code, walletAddress: !!walletAddress });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 检查环境变量
  const emailUsername = process.env.EMAIL_USERNAME;
  const emailPassword = process.env.GMAIL_APP_PASSWORD;
  
  console.log('[Email API] Environment check:', {
    emailUsername: emailUsername ? '***SET***' : 'MISSING',
    emailPassword: emailPassword ? '***SET***' : 'MISSING'
  });

  if (!emailUsername || !emailPassword) {
    console.error('[Email API] Missing email credentials in environment');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUsername,
      pass: emailPassword,
    },
  });

  console.log('[Email API] Transporter created, attempting to send email...');

  const mailOptions = {
    from: emailUsername,
    to: email,
    subject: 'Your FoodyePay Verification Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background: #121212; color: #ffffff; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #1e1e1e; border-radius: 12px; overflow: hidden; box-shadow: 0 0 12px rgba(0,0,0,0.3);">
          <div style="padding: 20px 24px; text-align: center; background: #111827;">
        <img src="https://sshpxsgbebwmbuohkljv.supabase.co/storage/v1/object/public/public-assets/foodyepay-logo.png"
             alt="FoodyePay"
             width="64" height="64"
             style="border-radius: 12px; margin-bottom: 10px;" />
            <h1 style="font-size: 24px; color: #4f46e5; margin: 0;">🎉 Welcome to FoodyePay</h1>
          </div>

          <div style="padding: 24px;">
            <p style="margin-bottom: 10px;">Hi there,</p>
            <p style="margin-bottom: 10px;">Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #ef4444; text-align: center; letter-spacing: 2px; margin: 16px 0;">${code}</div>

            <p style="margin-top: 20px;">Connected Wallet Address:</p>
            <div style="background: #2c2c2c; padding: 10px; border-radius: 6px; font-family: monospace; word-break: break-all;">${walletAddress}</div>

            <a href="https://foodyepay-mvp.vercel.app/dashboard-diner" style="display: inline-block; margin-top: 30px; background-color: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Go to Dashboard</a>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
              ⚠️ This code is valid for 10 minutes. Please do not share it.
            </p>

            <p style="margin-top: 40px;">Bon Appétit!<br/>— The FoodyePay Team</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    console.log('[Email API] Sending email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('[Email API] ✅ Email sent successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Email API] ❌ Failed to send email:', error);
    return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 500 });
  }
}




