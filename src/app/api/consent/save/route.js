import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/consent/save
 * Persists digital patient consent for health & genetic tests (Eterna Diagnostics, Fagron Genomics, 24Genetics, tellmeGen).
 * Complies with EU GDPR, Spanish LOPD-GDD, and UAE Federal Law No. 2/2019.
 * Stored in Firestore collection: `patient_consents`
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patient = {},
      authorizedTests = [],
      consentVersion = 'v5.0',
      signedBy = '',
      signedAt = new Date().toISOString(),
      signatureDate = ''
    } = body;

    const patientName = patient?.fullName?.trim() || signedBy?.trim();
    if (!patientName) {
      return NextResponse.json(
        { success: false, error: 'Patient full name or signatory is required.' },
        { status: 400 }
      );
    }

    if (!signedBy || !signedBy.trim()) {
      return NextResponse.json(
        { success: false, error: 'Electronic signature affirmation is required.' },
        { status: 400 }
      );
    }

    const consentId = `CONSENT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const consentRecord = {
      id: consentId,
      consentVersion,
      patient: {
        fullName: patientName,
        dob: patient?.dob || '',
        patientId: patient?.patientId || '',
        email: patient?.email?.trim().toLowerCase() || '',
        country: patient?.country || ''
      },
      authorizedTests: Array.isArray(authorizedTests) ? authorizedTests : [],
      status: 'signed',
      signedBy: signedBy.trim(),
      signedAt: signedAt || new Date().toISOString(),
      signatureDate: signatureDate || new Date().toISOString().split('T')[0],
      legalFramework: 'EU GDPR / Spanish LOPD-GDD / UAE Federal Law No. 2 of 2019',
      dataControllers: [
        'Atlas Health Solutions / Mediluxe Health Solutions LLC (UAE)',
        'Eterna Diagnostics / STARTQUAKE, S.L. (Spain)'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (adminDb) {
      await adminDb.collection('patient_consents').doc(consentId).set(consentRecord);
    } else {
      console.warn('[Consent Save] adminDb not initialized, returning mock confirmation');
    }

    return NextResponse.json({
      success: true,
      consentId,
      record: {
        id: consentId,
        patientName,
        signedAt: consentRecord.signedAt,
        testsCount: consentRecord.authorizedTests.length
      }
    });
  } catch (error) {
    console.error('[Consent Save Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while saving consent.' },
      { status: 500 }
    );
  }
}
