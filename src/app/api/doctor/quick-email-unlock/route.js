import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getDoctorPortalData } from '@/lib/doctorCache';
import crypto from 'crypto';

/**
 * POST /api/doctor/quick-email-unlock
 * Simple 1-step activation for WhatsApp-invited physicians & assistants:
 * verifies that the entered email matches the doctor's registered email(s)
 * or assistant email on file, and issues a 90-day workstation token.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const doctorSlug = String(body?.doctorSlug || '').trim();
    const emailInput = String(body?.email || '').toLowerCase().trim();

    if (!doctorSlug || !emailInput || !emailInput.includes('@')) {
      return NextResponse.json(
        { authorized: false, error: 'Please enter a valid registered clinic email.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { authorized: false, error: 'Clinical database temporarily unavailable.' },
        { status: 503 }
      );
    }

    const portalData = await getDoctorPortalData(doctorSlug);
    const doc = portalData?.doctor;
    if (!portalData?.success || !doc) {
      return NextResponse.json(
        { authorized: false, error: 'Physician profile not found.' },
        { status: 404 }
      );
    }

    const allowedDoctorEmails = [
      doc.email,
      doc.secondaryEmail,
      ...(Array.isArray(doc.allowedEmails) ? doc.allowedEmails : []),
    ]
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim());

    const allowedAssistantEmails = [
      doc.assistantEmail,
      doc.assistant?.email,
      ...(Array.isArray(doc.assistantEmails) ? doc.assistantEmails : []),
    ]
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim());

    let viewerRole = null;
    if (allowedDoctorEmails.includes(emailInput)) {
      viewerRole = 'doctor';
    } else if (allowedAssistantEmails.includes(emailInput)) {
      viewerRole = 'assistant';
    } else if (doc.id) {
      // Fallback: check raw user document in Firestore for secondaryEmail / assistantEmail / array fields
      const userSnap = await adminDb.collection('users').doc(doc.id).get();
      if (userSnap.exists) {
        const u = userSnap.data() || {};
        const extraDocEmails = [
          u.email,
          u.secondaryEmail,
          ...(Array.isArray(u.allowedEmails) ? u.allowedEmails : []),
          ...(Array.isArray(u.additionalEmails) ? u.additionalEmails : []),
        ]
          .filter(Boolean)
          .map((e) => String(e).toLowerCase().trim());
        const extraAssistantEmails = [
          u.assistantEmail,
          u.assistant?.email,
          ...(Array.isArray(u.assistantEmails) ? u.assistantEmails : []),
        ]
          .filter(Boolean)
          .map((e) => String(e).toLowerCase().trim());

        if (extraDocEmails.includes(emailInput)) viewerRole = 'doctor';
        else if (extraAssistantEmails.includes(emailInput)) viewerRole = 'assistant';
      }
    }

    if (!viewerRole) {
      return NextResponse.json(
        { authorized: false, error: 'Email does not match the registered clinic or assistant email on file.' },
        { status: 403 }
      );
    }

    const now = new Date();
    const workstationToken = `ws_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    await adminDb.collection('doctor_workstations').doc(workstationToken).set({
      token: workstationToken,
      doctorSlug: doc.opaqueCode || doctorSlug,
      opaqueCode: doc.opaqueCode || '',
      email: emailInput,
      viewerRole,
      createdAt: now.toISOString(),
      expiresAt,
      activationMethod: 'quick_email_unlock',
    });

    return NextResponse.json({
      authorized: true,
      workstationToken,
      viewerRole,
      expiresAt,
      message: 'Practice portal unlocked for 90 days.',
    });
  } catch (error) {
    console.error('[quick-email-unlock] Error:', error);
    return NextResponse.json(
      { authorized: false, error: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
