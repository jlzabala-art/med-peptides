import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { invalidateRxCache } from '@/lib/rxCache';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/prescriptions/update-treating-doctor
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates or assigns the treating physician (the doctor who examined the patient).
 * This doctor is strictly the one visible on the patient's QR code, label, and portal.
 * The production doctor (Dr. Miguel Ángel López Aranda) remains internal only.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { prescriptionId, prescriptionNumber, treatingDoctor } = body;

    const lookupCode = (prescriptionId || prescriptionNumber || '').trim();

    if (!lookupCode) {
      return NextResponse.json(
        { error: 'prescriptionId or prescriptionNumber is required' },
        { status: 400 }
      );
    }

    if (!treatingDoctor || !treatingDoctor.name) {
      return NextResponse.json(
        { error: 'treatingDoctor.name is required' },
        { status: 400 }
      );
    }

    // Locate document in Firestore
    let docRef = null;
    let docSnap = null;

    if (prescriptionId) {
      docRef = adminDb.collection('prescriptions').doc(prescriptionId);
      docSnap = await docRef.get();
    }

    if (!docSnap || !docSnap.exists) {
      // Try by prescriptionNumber
      const qSnap = await adminDb.collection('prescriptions')
        .where('prescriptionNumber', '==', lookupCode)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        docRef = qSnap.docs[0].ref;
        docSnap = qSnap.docs[0];
      }
    }

    if (!docSnap || !docSnap.exists) {
      // Try by prescriptionCode
      const qSnap2 = await adminDb.collection('prescriptions')
        .where('prescriptionCode', '==', lookupCode)
        .limit(1)
        .get();
      if (!qSnap2.empty) {
        docRef = qSnap2.docs[0].ref;
        docSnap = qSnap2.docs[0];
      }
    }

    if (!docSnap || !docSnap.exists) {
      // Try by fagronDetails.boxId
      const qSnap3 = await adminDb.collection('prescriptions')
        .where('fagronDetails.boxId', '==', lookupCode)
        .limit(1)
        .get();
      if (!qSnap3.empty) {
        docRef = qSnap3.docs[0].ref;
        docSnap = qSnap3.docs[0];
      }
    }

    if (!docSnap || !docSnap.exists) {
      return NextResponse.json(
        { error: 'Prescription document not found' },
        { status: 404 }
      );
    }

    const cleanTreatingDoc = {
      name: String(treatingDoctor.name).trim(),
      specialty: String(treatingDoctor.specialty || '').trim() || 'Physician Specialist',
      license: String(treatingDoctor.license || '').trim(),
      clinic: String(treatingDoctor.clinic || '').trim() || 'Licensed Clinical Practice',
      address: String(treatingDoctor.address || '').trim(),
      phone: String(treatingDoctor.phone || '').trim(),
      updatedAt: new Date().toISOString(),
      role: 'treating_physician'
    };

    const updatePayload = {
      treatingDoctor: cleanTreatingDoc,
      doctor: cleanTreatingDoc,
      doctorName: cleanTreatingDoc.name,
      prescribingDoctor: cleanTreatingDoc.name,
      doctorLicense: cleanTreatingDoc.license,
      doctorSpecialty: cleanTreatingDoc.specialty,
      hasTreatingDoctor: true,
      updatedAt: new Date().toISOString()
    };

    // Ensure production doctor is preserved / assigned as Dr. Miguel Ángel López Aranda
    const existingData = docSnap.data();
    if (!existingData.productionDoctor) {
      updatePayload.productionDoctor = {
        name: 'Dr. Miguel Ángel López Aranda',
        license: '282869584',
        specialty: 'Cirujano Capilar & Médico Prescriptor',
        clinic: 'Clínica Capilar Dr. López Aranda',
        country: 'España',
        hasDHA: false,
        isInternalOnly: true,
        purpose: 'compounding_production_order'
      };
      updatePayload.hasInternalProductionDoctor = true;
    }

    await docRef.update(updatePayload);

    // Invalidate caches
    try {
      if (typeof invalidateRxCache === 'function') {
        invalidateRxCache(docRef.id);
        if (prescriptionNumber) invalidateRxCache(prescriptionNumber);
        if (existingData.prescriptionNumber) invalidateRxCache(existingData.prescriptionNumber);
        if (existingData.prescriptionCode) invalidateRxCache(existingData.prescriptionCode);
        if (existingData.fagronDetails?.boxId) invalidateRxCache(existingData.fagronDetails.boxId);
      }
      const pCode = existingData.prescriptionNumber || existingData.prescriptionCode || existingData.fagronDetails?.boxId || docRef.id;
      revalidatePath(`/rx/${pCode}`);
      if (existingData.fagronDetails?.boxId) {
        revalidatePath(`/rx/${existingData.fagronDetails.boxId}`);
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      id: docRef.id,
      prescriptionNumber: existingData.prescriptionNumber || prescriptionNumber,
      treatingDoctor: cleanTreatingDoc,
      message: 'Treating physician updated successfully'
    });
  } catch (error) {
    console.error('[update-treating-doctor] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
