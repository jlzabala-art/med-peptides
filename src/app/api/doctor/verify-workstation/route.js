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
    const norm = (s) => String(s || '').toLowerCase().replace(/^dr[-.]?/, '').trim();
    if (workstationToken) {
      const wsDoc = await adminDb.collection('doctor_workstations').doc(workstationToken).get();
      if (wsDoc.exists) {
        const data = wsDoc.data();
        const matchesWs =
          data.doctorSlug === doctorSlug ||
          norm(data.doctorSlug) === norm(doctorSlug) ||
          (data.opaqueCode && String(data.opaqueCode).toUpperCase() === String(doctorSlug).toUpperCase());
        if (matchesWs && new Date(data.expiresAt) > now) {
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

    // 2. Check Magic Token (24-hour / single-use)
    if (magicToken) {
      const magicDocRef = adminDb.collection('doctor_magic_tokens').doc(magicToken);
      const magicDoc = await magicDocRef.get();

      if (magicDoc.exists) {
        const data = magicDoc.data();
        const matchesSlug =
          !data.doctorSlug ||
          data.doctorSlug.toLowerCase() === doctorSlug.toLowerCase() ||
          norm(data.doctorSlug) === norm(doctorSlug) ||
          (Array.isArray(data.alternateSlugs) && data.alternateSlugs.some(as => norm(as) === norm(doctorSlug) || as.toUpperCase() === String(doctorSlug).toUpperCase())) ||
          (data.opaqueCode && String(data.opaqueCode).toUpperCase() === String(doctorSlug).toUpperCase());

        if (matchesSlug && !data.used && new Date(data.expiresAt) > now) {
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

          // Update doctor profile engagement in users collection & emit notification
          try {
            let docUserRef = null;
            if (data.email) {
              const uSnap = await adminDb.collection('users').where('email', '==', data.email.toLowerCase().trim()).limit(1).get();
              if (!uSnap.empty) docUserRef = uSnap.docs[0].ref;
            }
            if (!docUserRef && doctorSlug) {
              const uSnap2 = await adminDb.collection('users').where('slug', '==', doctorSlug).limit(1).get();
              if (!uSnap2.empty) docUserRef = uSnap2.docs[0].ref;
            }
            if (docUserRef) {
              const userSnap = await docUserRef.get();
              const existingVisits = (userSnap.data()?.lastAssetViewCount || 0) + 1;
              await docUserRef.set({
                lastLoginAt: now.toISOString(),
                lastActiveAt: now.toISOString(),
                lastAssetViewCount: existingVisits,
                lastAssetViewedAt: now.toISOString(),
                lastAssetReadStatus: 'read',
              }, { merge: true });

              await adminDb.collection('notifications').add({
                title: 'Acceso Clínico 1-Tap Activado',
                message: `El Dr. ${userSnap.data()?.displayName || doctorSlug} ha activado su portal médico.`,
                type: 'doctor_login',
                link: `/dr/${doctorSlug}`,
                targetRoles: ['admin', 'medical_director'],
                read: false,
                createdAt: now.toISOString(),
                metadata: {
                  doctorSlug,
                  email: data.email,
                }
              });
            }
          } catch (profileErr) {
            console.warn('[verify-workstation] Could not update doctor profile engagement:', profileErr.message);
          }

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

/**
 * DELETE — "Forget this device": clears the trusted-workstation cookie so the
 * next visit requires a fresh magic link / sign-in.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'This device is no longer trusted.'
  });
  response.cookies.set('atlas_workstation_session', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return response;
}
