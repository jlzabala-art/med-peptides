import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  resolveShare, otpEnabled, sha256, issueSessionValue, cookieName,
  SESSION_MAX_AGE_S, OTP_MAX_ATTEMPTS,
} from '@/lib/access/payablesAccessGuard';

/**
 * POST /api/payables/[token]/otp/verify  { email, code }
 * Validates the code and sets a signed httpOnly session cookie.
 */
export async function POST(request, { params }) {
  const fail = (status = 401) => NextResponse.json({ error: 'Invalid or expired code' }, { status });
  try {
    if (!otpEnabled()) return NextResponse.json({ error: 'OTP verification is not configured' }, { status: 503 });
    const { token } = await params;
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) return fail(400);

    const share = await resolveShare(token);
    if (!share) return fail(404);

    const otpRef = adminDb.collection('payables_otp').doc(sha256(`${token}:${email}`));
    const snap = await otpRef.get();
    if (!snap.exists) return fail();
    const data = snap.data();
    if (data.expiresAt < Date.now() || data.attempts >= OTP_MAX_ATTEMPTS) {
      await otpRef.delete().catch(() => {});
      return fail();
    }

    const expected = Buffer.from(data.codeHash);
    const given = Buffer.from(sha256(`${code}:${process.env.PAYABLES_SESSION_SECRET}`));
    const match = expected.length === given.length && crypto.timingSafeEqual(expected, given);
    if (!match) {
      await otpRef.update({ attempts: (data.attempts || 0) + 1 });
      return fail();
    }

    await otpRef.delete().catch(() => {});
    const res = NextResponse.json({ success: true });
    res.cookies.set(cookieName(token), issueSessionValue(token, email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/payables',
      maxAge: SESSION_MAX_AGE_S,
    });
    return res;
  } catch (err) {
    console.error('[payables otp verify] error:', err);
    return fail(500);
  }
}
