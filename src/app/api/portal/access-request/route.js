import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/portal/access-request
 * Handles institutional/clinic account registration applications from shared portals.
 * Fully secured with sanitization and Firestore persistence.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      clinicName,
      contactName,
      email,
      phone,
      country,
      practiceType = 'clinical_practice',
      specialty = '',
      licenseNumber = '',
      estimatedMonthlyVolume = '',
      notes = '',
      referralSource = 'shared_catalog_portal'
    } = body;

    if (!clinicName || !contactName || !email) {
      return NextResponse.json(
        { error: 'Clinic name, contact name, and professional email are required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const applicationRecord = {
      clinicName: String(clinicName).trim(),
      contactName: String(contactName).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone || '').trim(),
      country: String(country || '').trim(),
      practiceType: String(practiceType).trim(),
      specialty: String(specialty || practiceType || '').trim(),
      licenseNumber: String(licenseNumber || '').trim(),
      estimatedMonthlyVolume: String(estimatedMonthlyVolume || '').trim(),
      notes: String(notes || '').trim(),
      referralSource: String(referralSource).trim(),
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('access_requests').add(applicationRecord);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Application received successfully.'
    });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application.' },
      { status: 500 }
    );
  }
}
