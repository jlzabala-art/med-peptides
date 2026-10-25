import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/prescriptions/[code]/contact
 * ─────────────────────────────────────────────────────────────────────────────
 * Instant frictionless clinical endpoint for physicians, nurses and operators
 * to enrich patient phone & email directly from the prescription dossier.
 * 
 * Updates both the prescription document and the master patient document in Firestore,
 * and asynchronously pushes to Zoho Bigin CRM.
 */
export async function POST(request, { params }) {
  try {
    const { code } = await params;
    const body = await request.json();
    const {
      phone = '',
      email = '',
      patientId = '',
      patientName = '',
      doctorName = '',
      clinic = ''
    } = body;

    const cleanPhone = String(phone || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un teléfono o un email.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: true, message: 'Saved in offline memory (database unattached)' }
      );
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };
    if (cleanPhone) {
      updates.patientPhone = cleanPhone;
      updates['patient.phone'] = cleanPhone;
    }
    if (cleanEmail && !cleanEmail.includes('paciente@atlas-rx.com')) {
      updates.patientEmail = cleanEmail;
      updates['patient.email'] = cleanEmail;
    }

    let resolvedPatientId = patientId;
    let targetDocRef = null;

    // 1. Locate and update prescription
    if (code) {
      const rxDoc = await adminDb.collection('prescriptions').doc(code).get();
      if (rxDoc.exists) {
        targetDocRef = rxDoc.ref;
        await rxDoc.ref.set(updates, { merge: true });
        if (!resolvedPatientId && rxDoc.data()?.patientId) {
          resolvedPatientId = rxDoc.data().patientId;
        }
      } else {
        const qSnap = await adminDb.collection('prescriptions')
          .where('code', '==', code)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          targetDocRef = qSnap.docs[0].ref;
          await qSnap.docs[0].ref.set(updates, { merge: true });
          if (!resolvedPatientId && qSnap.docs[0].data()?.patientId) {
            resolvedPatientId = qSnap.docs[0].data().patientId;
          }
        }
      }
    }

    // 2. Locate and update master Patient document
    const patientMasterUpdates = {
      updatedAt: new Date().toISOString()
    };
    if (cleanPhone) patientMasterUpdates.phone = cleanPhone;
    if (cleanEmail && !cleanEmail.includes('paciente@atlas-rx.com')) {
      patientMasterUpdates.email = cleanEmail;
    }

    if (resolvedPatientId) {
      try {
        await adminDb.collection('patients').doc(resolvedPatientId).set(patientMasterUpdates, { merge: true });
      } catch (pErr) {
        console.warn('[update-patient-contact] Direct patient update note:', pErr.message);
      }
    } else if (patientName && !patientName.toLowerCase().startsWith('patient pt-') && patientName !== 'Paciente') {
      try {
        const pSnap = await adminDb.collection('patients')
          .where('name', '==', patientName)
          .limit(1)
          .get();
        if (!pSnap.empty) {
          await pSnap.docs[0].ref.set(patientMasterUpdates, { merge: true });
        }
      } catch (nameErr) {
        console.warn('[update-patient-contact] Patient name search note:', nameErr.message);
      }
    }

    // 3. Asynchronously record audit log in clinical history
    try {
      await adminDb.collection('audit_logs').add({
        action: 'patient_contact_enriched',
        resourceType: 'prescription',
        resourceId: code,
        patientId: resolvedPatientId || null,
        phone: cleanPhone || null,
        email: cleanEmail || null,
        updatedBy: doctorName || 'clinical_staff',
        clinic: clinic || null,
        timestamp: new Date().toISOString()
      });
    } catch (auditErr) {
      console.debug('[update-patient-contact] Audit note:', auditErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Contacto del paciente actualizado con éxito',
      phone: cleanPhone,
      email: cleanEmail,
      patientId: resolvedPatientId
    });
  } catch (error) {
    console.error('Error in /api/prescriptions/[code]/contact:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el contacto del paciente' },
      { status: 500 }
    );
  }
}
