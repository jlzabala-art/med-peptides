import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  resolveShare, expectedContactEmail, isAdminEmail, otpEnabled, sha256,
  OTP_TTL_MS, OTP_MIN_INTERVAL_MS,
} from '@/lib/access/payablesAccessGuard';

/**
 * POST /api/payables/[token]/otp  { email }
 * Sends a 6-digit one-time code to the supplier's registered email.
 * Always answers generically to avoid email enumeration.
 */
export async function POST(request, { params }) {
  const generic = NextResponse.json({ success: true, message: 'If the email is authorized, a code was sent.' });
  try {
    if (!otpEnabled()) {
      return NextResponse.json({ error: 'OTP verification is not configured' }, { status: 503 });
    }
    const { token } = await params;
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const share = await resolveShare(token);
    if (!share || !email) return generic;

    const allowed = email === expectedContactEmail(share.data) || isAdminEmail(email);
    if (!allowed) return generic;

    const otpRef = adminDb.collection('payables_otp').doc(sha256(`${token}:${email}`));
    const snap = await otpRef.get();
    const now = Date.now();
    if (snap.exists && now - (snap.data().sentAt || 0) < OTP_MIN_INTERVAL_MS) return generic;

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await otpRef.set({
      codeHash: sha256(`${code}:${process.env.PAYABLES_SESSION_SECRET}`),
      expiresAt: now + OTP_TTL_MS,
      sentAt: now,
      attempts: 0,
    });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;
    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailPass } });
      await transporter.sendMail({
        from: `"Atlas Health Accounting" <${gmailUser}>`,
        to: email,
        subject: 'Your verification code for the payables statement',
        html: `<p>Your one-time verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not request it, ignore this email.</p>`,
      });
    } else {
      console.error('[payables otp] GMAIL_USER / GMAIL_APP_PASS not configured; code not delivered');
    }
    return generic;
  } catch (err) {
    console.error('[payables otp] error:', err);
    return generic;
  }
}
