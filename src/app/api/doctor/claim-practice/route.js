import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctorSlug = '',
      doctorName = '',
      clinic = '',
      licenseInput = '',
      emailInput = '',
      phoneInput = '',
      rememberDevice = true
    } = body;

    if (!doctorSlug && !doctorName) {
      return NextResponse.json(
        { error: 'Doctor slug or practice identification is required.' },
        { status: 400 }
      );
    }

    if (!licenseInput && !emailInput && !phoneInput) {
      return NextResponse.json(
        { error: 'Please provide at least a Medical License ID, Email, or Phone to verify.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Clinical database temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    const claimId = `claim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const claimToken = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    const claimDoc = {
      id: claimId,
      claimToken,
      doctorSlug: String(doctorSlug).trim(),
      doctorName: String(doctorName).trim() || 'Prescribing Physician',
      clinic: String(clinic).trim() || 'Specialized Clinic',
      licenseProvided: String(licenseInput).trim(),
      email: String(emailInput).toLowerCase().trim(),
      phone: String(phoneInput).trim(),
      rememberDevice: Boolean(rememberDevice),
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      createdAt: now,
      updatedAt: now
    };

    // Save claim in Firestore
    await adminDb.collection('doctor_claims').doc(claimId).set(claimDoc);

    // Enqueue Admin WhatsApp Notification in operations_queue
    const adminPhone = '+34654314490';
    const approvalUrl = `https://www.atlashealth-services.com/admin/approvals?claimId=${claimId}`;

    const adminWhatsAppMessage = `🚨 *ATLAS HEALTH SERVICES — NEW PHYSICIAN ACCESS REQUEST*

👨‍⚕️ *Physician:* ${claimDoc.doctorName}
🏥 *Practice:* ${claimDoc.clinic}
📜 *License / DHA:* ${claimDoc.licenseProvided || 'Provided on file'}
📱 *WhatsApp:* ${claimDoc.phone || 'Provided on file'}
✉️ *Email:* ${claimDoc.email || 'Provided on file'}
📂 *Dossier Requested:* /dr/${claimDoc.doctorSlug}

⚡ *Authorize with 1 Click:*
👉 ${approvalUrl}`;

    const queueId = `outbox_claim_${claimId}`;
    const outboxDoc = {
      id: queueId,
      topic: 'send_whatsapp_notification',
      idempotencyKey: `notif_claim_${claimId}`,
      payload: {
        to: adminPhone,
        phone: adminPhone,
        message: adminWhatsAppMessage,
        type: 'doctor_practice_claim',
        claimId,
        doctorSlug: claimDoc.doctorSlug,
        timestamp: now
      },
      status: 'pending',
      attempts: 0,
      maxRetries: 3,
      createdAt: now,
      updatedAt: now
    };

    try {
      await adminDb.collection('operations_queue').doc(queueId).set(outboxDoc);
    } catch (queueErr) {
      console.warn('Could not enqueue outbox WhatsApp alert:', queueErr.message);
    }

    return NextResponse.json({
      success: true,
      claimId,
      message: 'Practice verification request received and queued for authorization.'
    });
  } catch (error) {
    console.error('Error processing doctor claim:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit practice claim.' },
      { status: 500 }
    );
  }
}
