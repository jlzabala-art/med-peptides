import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import crypto from 'crypto';
import { generateDoctorWelcomeWhatsApp } from '@/data/doctorOnboardingTemplates';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctorSlug = '',
      phone = '',
      email = '',
      rememberDevice = true,
      expiresInHours = 24
    } = body;

    if (!doctorSlug) {
      return NextResponse.json(
        { error: 'Doctor slug is required.' },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'A valid WhatsApp phone number or registered email is required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Clinical database temporarily unavailable.' },
        { status: 503 }
      );
    }

    const durationHours = Number(expiresInHours) || 24;
    const magicToken = `mag_${crypto.randomBytes(20).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();

    const cleanSlug = String(doctorSlug).trim();
    const norm = cleanSlug.replace(/^dr[-.]?/, '');
    const tokenDoc = {
      token: magicToken,
      doctorSlug: cleanSlug,
      alternateSlugs: [cleanSlug, `dr-${norm}`, norm],
      phone: String(phone).trim(),
      email: String(email).toLowerCase().trim(),
      rememberDevice: Boolean(rememberDevice),
      used: false,
      durationHours,
      createdAt: now.toISOString(),
      expiresAt
    };

    await adminDb.collection('doctor_magic_tokens').doc(magicToken).set(tokenDoc);

    const accessUrl = `https://www.atlashealth-services.com/dr/${tokenDoc.doctorSlug}?magic_token=${magicToken}`;

    // If phone is provided, enqueue WhatsApp message to the doctor
    if (tokenDoc.phone) {
      const cleanPhone = tokenDoc.phone.replace(/[^0-9+]/g, '');
      const doctorWhatsAppMsg = generateDoctorWelcomeWhatsApp({
        doctorName: tokenDoc.doctorName || tokenDoc.doctorSlug || 'Physician',
        accessUrl,
        durationHours: tokenDoc.durationHours || 24
      });

      const queueId = `outbox_magic_${magicToken}`;
      const outboxDoc = {
        id: queueId,
        topic: 'send_whatsapp_notification',
        idempotencyKey: `notif_magic_${magicToken}`,
        payload: {
          to: cleanPhone,
          phone: cleanPhone,
          message: doctorWhatsAppMsg,
          type: 'doctor_magic_login',
          doctorSlug: tokenDoc.doctorSlug,
          timestamp: now.toISOString()
        },
        status: 'pending',
        attempts: 0,
        maxRetries: 3,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      try {
        await adminDb.collection('operations_queue').doc(queueId).set(outboxDoc);
      } catch (qErr) {
        console.warn('Could not enqueue magic link WhatsApp:', qErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: '1-Tap Access Link generated and dispatched.'
    });
  } catch (error) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch access link.' },
      { status: 500 }
    );
  }
}
