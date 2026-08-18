import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, subject, message, queryId, userQuery } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient email and message content are required" },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER || process.env.GA_CLIENT_EMAIL || "";
    const smtpPass = process.env.SMTP_PASS || "";

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          fallbackMailto: true,
          message: "SMTP credentials not fully configured in .env.local. Use mailto link or add SMTP_USER & SMTP_PASS.",
        },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailSubject = subject || `Re: Portfolio Inquiry regarding "${userQuery?.slice(0, 40) || 'your question'}"`;
    const emailBody = `${message}\n\n---\nIn response to your query:\n"${userQuery || ''}"\n\nSent from S V Lalitkishore Portfolio CMS (https://lalitkishore.is-a.dev)`;

    await transporter.sendMail({
      from: `"S V Lalitkishore" <${smtpUser}>`,
      to,
      subject: emailSubject,
      text: emailBody,
    });

    return NextResponse.json({ success: true, message: `Email sent to ${to}` });
  } catch (error: any) {
    console.error("[EMAIL API ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
