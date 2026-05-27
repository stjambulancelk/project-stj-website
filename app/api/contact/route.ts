import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendContactFormEmail } from "@/lib/mail";
import { extractIp } from "@/lib/audit";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, service, message } = await request.json();
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone and message are required" }, { status: 400 });
    }

    const rawIp = extractIp(request) ?? "unknown";
    const hashedIp = crypto.createHash("sha256").update(rawIp + (process.env.AUDIT_DAILY_SALT ?? "")).digest("hex").slice(0, 16);

    await prisma.contactSubmission.create({
      data: { name, phone, email: email || null, service: service || null, message, hashedIp },
    });

    await sendContactFormEmail({ name, phone, email, service, message }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
