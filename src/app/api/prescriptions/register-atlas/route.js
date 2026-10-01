import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';

export const dynamic = 'force-dynamic';

/**
 * POST /api/prescriptions/register-atlas
 *
 * Marks an already-published prescription as officially registered in Atlas.
 * Writes the registration event to Firestore under:
 *   - prescriptions/{prescriptionId}.atlasRegistration  (structured object)
 *   - prescriptions/{prescriptionId}/events  (subcollection audit trail)
 */
export async function POST(request) {
  const rateInfo = checkRateLimit(request, {
    limit: 30,
    windowMs: 60 * 1000,
    tier: 'atlas-registration',
  });
  if (!rateInfo.allowed) return rateLimitExceededResponse(rateInfo);

  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      prescriptionId,
      prescriptionNumber,
      registeredBy = null,
      reviewSatisfied = true,
      notes = '',
    } = body || {};

    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'prescriptionId is required.' },
        { status: 400 }
      );
    }

    const isoNow = new Date().toISOString();

    // Verify document exists
    const prescRef = adminDb.collection('prescriptions').doc(prescriptionId);
    const prescSnap = await prescRef.get();

    if (!prescSnap.exists) {
      // Fallback: query by prescriptionNumber
      if (prescriptionNumber) {
        const snap = await adminDb
          .collection('prescriptions')
          .where('prescriptionNumber', '==', prescriptionNumber)
          .limit(1)
          .get();
        if (!snap.empty) {
          return await _registerOnRef(snap.docs[0].ref, {
            prescriptionNumber,
            registeredBy,
            reviewSatisfied,
            notes,
            isoNow,
          });
        }
      }
      return NextResponse.json(
        { error: `Prescription '${prescriptionId}' not found.` },
        { status: 404 }
      );
    }

    return await _registerOnRef(prescRef, {
      prescriptionNumber,
      registeredBy,
      reviewSatisfied,
      notes,
      isoNow,
    });
  } catch (err) {
    console.error('[register-atlas] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

async function _registerOnRef(ref, { prescriptionNumber, registeredBy, reviewSatisfied, notes, isoNow }) {
  await ref.update({
    atlasRegistration: {
      registeredAt: isoNow,
      registeredBy: registeredBy || null,
      reviewSatisfied,
      notes: notes || '',
      status: 'registered',
    },
    atlasRegisteredAt: isoNow,
    updatedAt: isoNow,
  });

  await ref.collection('events').add({
    type: 'atlas_registration',
    timestamp: isoNow,
    performedBy: registeredBy || null,
    reviewSatisfied,
    notes: notes || '',
    source: 'public_intake_page',
  });

  const updatedSnap = await ref.get();
  const data = updatedSnap.data() || {};

  return NextResponse.json({
    success: true,
    message: 'Prescription successfully registered in Atlas.',
    prescriptionId: ref.id,
    prescriptionNumber: data.prescriptionNumber || prescriptionNumber || ref.id,
    atlasRegistration: data.atlasRegistration,
  });
}
