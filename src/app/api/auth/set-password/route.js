import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing bearer token' }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Server authentication service unavailable' }, { status: 503 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Update password via Admin SDK (links password provider automatically to Google accounts!)
    await adminAuth.updateUser(decoded.uid, {
      password
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password successfully set and linked to this account.' 
    });
  } catch (err) {
    console.error('[API /api/auth/set-password] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update password' }, { status: 500 });
  }
}
