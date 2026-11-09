import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/lookup?email=...
 * Looks up a registered client / clinic by email to autofill their contact details
 * and activate their dynamic role-based pricing tier.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json({ found: false, error: 'Valid email is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ found: false, error: 'Database unavailable' }, { status: 503 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query Firestore `users` collection by email
    const snap = await adminDb
      .collection('users')
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();

    if (snap.empty) {
      // Also check customers collection if exists as fallback
      try {
        const custSnap = await adminDb
          .collection('customers')
          .where('email', '==', cleanEmail)
          .limit(1)
          .get();

        if (!custSnap.empty) {
          const cData = custSnap.docs[0].data();
          return NextResponse.json({
            found: true,
            user: {
              id: custSnap.docs[0].id,
              name: cData.name || cData.contactName || '',
              clinicName: cData.clinicName || cData.practiceName || cData.company || '',
              phone: cData.phone || cData.whatsapp || '',
              country: cData.country || '',
              addressLine1: cData.address || cData.addressLine1 || '',
              city: cData.city || '',
              state: cData.state || '',
              postalCode: cData.postalCode || cData.zip || '',
              role: cData.role || 'clinic',
              pricingChannel: cData.pricingChannel || cData.tier || 'clinic_b2b',
              discountPercent: cData.discountPercent || 20
            }
          });
        }
      } catch (_e) {
        // Ignore fallback error
      }

      return NextResponse.json({ found: false });
    }

    const uData = snap.docs[0].data();
    return NextResponse.json({
      found: true,
      user: {
        id: snap.docs[0].id,
        name: uData.name || uData.displayName || uData.contactName || '',
        clinicName: uData.clinicName || uData.practiceName || uData.company || '',
        phone: uData.phone || uData.whatsapp || '',
        country: uData.country || (uData.shippingAddress && uData.shippingAddress.country) || '',
        addressLine1: uData.addressLine1 || uData.street || (uData.shippingAddress && uData.shippingAddress.street) || uData.address || '',
        city: uData.city || (uData.shippingAddress && uData.shippingAddress.city) || '',
        state: uData.state || (uData.shippingAddress && uData.shippingAddress.state) || '',
        postalCode: uData.postalCode || (uData.shippingAddress && uData.shippingAddress.postalCode) || uData.zip || '',
        role: uData.role || 'clinic',
        pricingChannel: uData.pricingChannel || (uData.role === 'wholeseller' ? 'wholesale_b2b' : 'clinic_b2b'),
        discountPercent: uData.discountPercent || (uData.role === 'wholeseller' ? 35 : 20)
      }
    });
  } catch (err) {
    console.error('[users/lookup GET]', err);
    return NextResponse.json({ found: false, error: err.message }, { status: 500 });
  }
}

