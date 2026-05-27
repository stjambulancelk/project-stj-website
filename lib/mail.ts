// Email via SMTP — requires: npm install nodemailer @types/nodemailer

import { SITE } from "./constants";
import { formatLKR } from "./utils";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  // Dynamic import so build doesn't fail if nodemailer not yet installed
  const nodemailer = await import("nodemailer").catch(() => null);
  if (!nodemailer) {
    console.error("nodemailer not installed. Run: npm install nodemailer @types/nodemailer");
    return;
  }

  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `STJ Southern Ambulance <no-reply@stj.lk>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });
}

// ============================================================
// Email templates
// ============================================================

export async function sendInvoiceEmail(params: {
  to: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  description: string;
  invoiceUrl: string;
}): Promise<void> {
  const { to, customerName, invoiceId, amount, description, invoiceUrl } = params;
  await sendMail({
    to,
    subject: `Invoice ${invoiceId} — STJ Southern Ambulance`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:32px;border-radius:16px;">
        <div style="background:#0f172a;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#10b981;margin:0;font-size:24px;">STJ Southern Ambulance</h1>
          <p style="color:#94a3b8;margin:4px 0 0;">Your Trusted Partner in Emergency Care</p>
        </div>
        <h2 style="color:#0b1c30;">Dear ${customerName},</h2>
        <p style="color:#45464d;">Your invoice has been prepared. Please review the details and complete your payment.</p>
        <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e5eeff;">
          <p style="margin:0;color:#45464d;font-size:14px;">Invoice #</p>
          <p style="margin:4px 0 0;color:#0b1c30;font-weight:700;font-size:18px;">${invoiceId}</p>
          <p style="margin:16px 0 0;color:#45464d;font-size:14px;">Service</p>
          <p style="margin:4px 0 0;color:#0b1c30;">${description}</p>
          <p style="margin:16px 0 0;color:#45464d;font-size:14px;">Amount Due</p>
          <p style="margin:4px 0 0;color:#10b981;font-weight:700;font-size:22px;">${formatLKR(amount)}</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${invoiceUrl}" style="background:#10b981;color:#fff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
            Review & Pay Invoice
          </a>
        </div>
        <p style="color:#76777d;font-size:13px;text-align:center;">
          Questions? Call us: <a href="tel:+94772826946" style="color:#10b981;">077 282 6946</a>
        </p>
        <p style="color:#c6c6cd;font-size:11px;text-align:center;margin-top:16px;">
          ${SITE.address}
        </p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(params: {
  to: string;
  customerName: string;
  invoiceId: string;
  amount: number;
}): Promise<void> {
  const { to, customerName, invoiceId, amount } = params;
  await sendMail({
    to,
    subject: `Payment Confirmed — ${invoiceId}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:32px;border-radius:16px;">
        <div style="background:#0f172a;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#10b981;margin:0;">Payment Confirmed ✓</h1>
        </div>
        <h2 style="color:#0b1c30;">Thank you, ${customerName}!</h2>
        <p style="color:#45464d;">Your payment of <strong>${formatLKR(amount)}</strong> for invoice <strong>${invoiceId}</strong> has been received.</p>
        <p style="color:#45464d;">Our team will be in touch shortly to coordinate your transport.</p>
        <p style="color:#76777d;font-size:13px;">Need help? Call <a href="tel:+94772826946" style="color:#10b981;">077 282 6946</a> — we're available 24/7.</p>
      </div>
    `,
  });
}

export async function sendRefundEmail(params: {
  to: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  reason: string;
}): Promise<void> {
  const { to, customerName, invoiceId, amount, reason } = params;
  await sendMail({
    to,
    subject: `Refund Processed — ${invoiceId}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8f9ff;padding:32px;border-radius:16px;">
        <div style="background:#0f172a;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#10b981;margin:0;">Refund Processed</h1>
        </div>
        <h2 style="color:#0b1c30;">Dear ${customerName},</h2>
        <p style="color:#45464d;">A refund of <strong>${formatLKR(amount)}</strong> for invoice <strong>${invoiceId}</strong> has been processed.</p>
        <p style="color:#45464d;">Reason: ${reason}</p>
        <p style="color:#76777d;font-size:13px;">Refunds typically appear in your account within 5–7 business days depending on your bank or card issuer.</p>
        <p style="color:#76777d;font-size:13px;">Questions? Call <a href="tel:+94772826946" style="color:#10b981;">077 282 6946</a> or email <a href="mailto:info@stj.lk" style="color:#10b981;">info@stj.lk</a></p>
        <p style="color:#c6c6cd;font-size:11px;text-align:center;margin-top:24px;">${SITE.address}</p>
      </div>
    `,
  });
}

export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}): Promise<void> {
  const { name, email, phone, service, message } = params;
  const adminEmail = process.env.EMAIL_ADMIN_TO ?? "ambulance.stj@gmail.com";
  await sendMail({
    to: adminEmail,
    subject: `Website Enquiry — ${name} (${service})`,
    replyTo: email,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;">
        <h2>New Website Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${message}</p>
      </div>
    `,
  });
}
