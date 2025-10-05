import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Very small bot protection
    if (typeof message === "string" && message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const user = process.env.EMAIL_USERNAME;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const to = "info@foodyepay.com";

    if (!user || !pass) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const subject = `New contact from foodyepay.com: ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    await transporter.sendMail({
      from: `FoodyePay Contact <${user}>`,
      to,
      replyTo: email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/contact error", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
