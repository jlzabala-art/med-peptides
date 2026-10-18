import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      claimId = '',
      action = 'approve', // 'approve' | 'reject'
      notes = ''
    } = body;

    if (!claimId) {
      return NextResponse.json(
        { error: 'claimId is required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Clinical database temporarily unavailable.' },
        { status: 503 }
      );
    }

    const claimRef = adminDb.collection('doctor_claims').doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      return NextResponse.json(
        { error: `Claim record ${claimId} not found.` },
        { status: 404 }
      );
    }

    const claimData = claimDoc.data();
    const now = new Date().toISOString();

    if (action === 'reject') {
      await claimRef.update({
        status: 'rejected',
        notes: String(notes || 'Request rejected by Medical Operations').trim(),
        rejectedAt: now,
        updatedAt: now
      });

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: 'Doctor claim has been rejected.'
      });
    }

    // Approve Claim
    await claimRef.update({
      status: 'approved',
      approvedAt: now,
      updatedAt: now,
      notes: notes ? String(notes).trim() : ''
    });

    const accessUrl = `https://www.atlashealth-services.com/dr/${claimData.doctorSlug}?auth_token=${claimData.claimToken}`;

    // Dispatches approval WhatsApp message to the physician
    if (claimData.phone) {
      const cleanPhone = claimData.phone.replace(/[^0-9+]/g, '');
      const doctorWhatsAppMsg = `🩺 *Atlas Health Services — Medical Practice Verified*

Dear ${claimData.doctorName || 'Prescribing Physician'},

Your medical practice access has been officially APPROVED by Atlas Health Services Medical Operations.
Full nominal patient dossiers, reference titration protocols, and prescription analytics are now active for your consultation.

🔑 *Access your clinical practice portal here:*
👉 ${accessUrl}

💻 _Opening this link will automatically remember this clinical workstation for 90 days._

_Atlas Health Services — Clinical Operations Team_`;

      const queueId = `outbox_approve_${claimId}`;
      const outboxDoc = {
        id: queueId,
        topic: 'send_whatsapp_notification',
        idempotencyKey: `notif_approve_${claimId}`,
        payload: {
          to: cleanPhone,
          phone: cleanPhone,
          message: doctorWhatsAppMsg,
          type: 'doctor_claim_approved',
          claimId,
          doctorSlug: claimData.doctorSlug,
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
      } catch (qErr) {
        console.warn('Could not enqueue doctor approval WhatsApp:', qErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      status: 'approved',
      message: 'Physician practice authorized successfully. Access link and WhatsApp notification dispatched.'
    });
  } catch (error) {
    console.error('Error authorizing doctor claim:', error);
    return NextResponse.json(
      { error: error.message || 'Authorization failed.' },
      { status: 500 }
    );
  }
}
