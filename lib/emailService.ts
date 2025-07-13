// lib/emailService.ts

// 发送验证码邮件
export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  walletAddress: string
): Promise<void> {
  console.log('[EmailService] Sending verification code to:', email);
  
  try {
    const res = await fetch('/api/email/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, walletAddress }),
    });

    console.log('[EmailService] API Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('[EmailService] API Error Response:', errorData);
      throw new Error(`❌ Failed to send verification code email: ${res.status} - ${errorData}`);
    }
    
    const responseData = await res.json();
    console.log('[EmailService] ✅ Email sent successfully:', responseData);
  } catch (error) {
    console.error('[EmailService] ❌ Error sending email:', error);
    throw error;
  }
}

// 发送欢迎邮件
export async function sendWelcomeEmail(email: string, walletAddress: string): Promise<void> {
  const res = await fetch('/api/email/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, walletAddress }),
  });

  if (!res.ok) {
    throw new Error('❌ Failed to send welcome email');
  }
}



