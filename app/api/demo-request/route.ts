import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // --- Input Validation ---
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // --- Nodemailer Transporter Setup ---
    // Using the Gmail credentials from your .env.local file
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // --- Email Content ---
    const mailOptions = {
      from: `"FoodyePay Website" <${process.env.EMAIL_USERNAME}>`,
      to: 'info@foodyepay.com', // Sending to your info@foodyepay.com address
      subject: `New Demo Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">New Demo Request Received</h2>
          <p>You have received a new demo request from the website.</p>
          <hr>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <p style="padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
            ${message}
          </p>
          <hr>
          <p style="font-size: 0.9em; color: #888;">This email was sent automatically from the FoodyePay website.</p>
        </div>
      `,
    };

    // --- Send Email ---
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Your demo request has been submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('API Demo Request Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
