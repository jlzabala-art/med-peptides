import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctorSlug = '',
      magicToken = '',
      authToken = '',
      workstationToken = ''
    } = body;

    if (!doctorSlug) {
      return NextResponse.json(
        { authorized: false, error: 'Doctor slug is required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { authorized: false, error: 'Clinical database temporarily unavailable.' },
        { status: 503 }
      );
    }

    const now = new Date();

    // 1. Check Workstation Persistent Token (90-day session)
    if (workstationToken) {
      const wsDoc = await adminDb.collection('doctor_workstations').doc(workstationToken).get();
      if (wsDoc.exists) {
        const data = wsDoc.data();
        if (data.doctorSlug === doctorSlug && new Date(data.expiresAt) > now) {
          return NextResponse.json({
            authorized: true,
            workstationToken,
            doctorSlug,
            expiresAt: data.expiresAt,
            message: 'Clinical workstation session verified.'
          });
        }
      }
    }

    // 2. Check Magic Token (15-min single-use)
    if (magicToken) {
      const magicDocRef = adminDb.collection('doctor_magic_tokens').doc(magicToken);
      const magicDoc = await magicDocRef.get();

      if (magicDoc.exists) {
        const data = magicDoc.data();
        if (data.doctorSlug === doctorSlug && !data.used && new Date(data.expiresAt) > now) {
          // Mark magic token as used
          await magicDocRef.update({ used: true, usedAt: now.toISOString() });

          // Issue 90-day workstation session token
          const newWsToken = `ws_${crypto.randomBytes(24).toString('hex')}`;
          const wsExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

          await adminDb.collection('doctor_workstations').doc(newWsToken).set({
            token: newWsToken,
            doctorSlug,
            phone: data.phone || '',
            email: data.email || '',
            createdAt: now.toISOString(),
            expiresAt: wsExpiresAt
          });

          const response = NextResponse.json({
            authorized: true,
            workstationToken: newWsToken,
            doctorSlug,
            expiresAt: wsExpiresAt,
            message: '1-Tap link verified and workstation trusted for 90 days.'
          });

          // Set secure cookie for 90 days
          response.cookies.set('atlas_workstation_session', newWsToken, {
            path: '/',
            maxAge: 90 * 24 * 60 * 60,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });

          return response;
        }
      }
    }

    // 3. Check Admin Auth Token (issued upon claim approval)
    if (authToken) {
      const claimQuery = await adminDb
        .collection('doctor_claims')
        .where('claimToken', '==', authToken)
        .where('doctorSlug', '==', doctorSlug)
        .where('status', '==', 'approved')
        .limit(1)
        .get();

      if (!claimQuery.empty) {
        // Issue 90-day workstation session token
        const newWsToken = `ws_${crypto.randomBytes(24).toString('hex')}`;
        const wsExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

        await adminDb.collection('doctor_workstations').doc(newWsToken).set({
          token: newWsToken,
          doctorSlug,
          createdAt: now.toISOString(),
          expiresAt: wsExpiresAt
        });

        const response = NextResponse.json({
          authorized: true,
          workstationToken: newWsToken,
          doctorSlug,
          expiresAt: wsExpiresAt,
          message: 'Practice authorization token verified and workstation trusted for 90 days.'
        });

        response.cookies.set('atlas_workstation_session', newWsToken, {
          path: '/',
          maxAge: 90 * 24 * 60 * 60,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });

        return response;
      }
    }

    return NextResponse.json(
      { authorized: false, error: 'Invalid, expired, or unrecognized clinical authorization credentials.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error verifying workstation session:', error);
    return NextResponse.json(
      { authorized: false, error: error.message || 'Verification failure.' },
      { status: 500 }
    );
  }
}
