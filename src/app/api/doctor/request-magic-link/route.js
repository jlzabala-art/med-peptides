import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctorSlug = '',
      phone = '',
      email = '',
      rememberDevice = true
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

    const magicToken = `mag_${crypto.randomBytes(20).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins

    const tokenDoc = {
      token: magicToken,
      doctorSlug: String(doctorSlug).trim(),
      phone: String(phone).trim(),
      email: String(email).toLowerCase().trim(),
      rememberDevice: Boolean(rememberDevice),
      used: false,
      createdAt: now.toISOString(),
      expiresAt
    };

    await adminDb.collection('doctor_magic_tokens').doc(magicToken).set(tokenDoc);

    const accessUrl = `https://www.atlashealth-services.com/dr/${tokenDoc.doctorSlug}?magic_token=${magicToken}`;

    // If phone is provided, enqueue WhatsApp message to the doctor
    if (tokenDoc.phone) {
      const cleanPhone = tokenDoc.phone.replace(/[^0-9+]/g, '');
      const doctorWhatsAppMsg = `🔑 *Atlas Health Services — 1-Tap Clinical Access*

Dear Prescribing Physician,

Use this secure 1-Tap Access link to access your clinical portal and unlock nominal patient dossiers:
👉 ${accessUrl}

⏱️ *Valid for 15 minutes.*
💻 Opening this link will authorize this workstation for 90 days.

_Atlas Health Services — Clinical Operations Team_`;

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
