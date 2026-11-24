import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { resolvePrescriptionDocAdmin } from '@/lib/labels/resolvePrescriptionAdmin';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { invalidateRxCache } from '@/lib/rxCache';
import { computeRefillSchedule, formatShortDate } from '@/utils/refillSchedule';

export const dynamic = 'force-dynamic';

const ATLAS_REFILL_ALERT_EMAIL = 'jose@mediluxeme.com';

/**
 * POST /api/prescriptions/[code]/request-refill
 * Zero-friction patient refill request triggered by scanning the bottle QR ("SCAN FOR REFILL").
 * Logs the request on the prescription, fires an in-app Atlas notification for Admin & Doctor,
 * and sends an immediate email alert via SMTP + mail_notifications.
 */
export async function POST(request, { params }) {
  const rateInfo = checkRateLimit(request, { limit: 15, windowMs: 60 * 1000, tier: 'patient-refill' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  if (!adminDb) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const resolvedParams = await params;
    const rawCode = String(resolvedParams?.code || '').trim();
    if (!rawCode) {
      return NextResponse.json({ success: false, error: 'Prescription code is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(10, Number(body?.quantity) || 1));
    const partNumber = body?.partNumber ? Number(body.partNumber) : null;
    const productName = String(body?.productName || 'Personalized Treatment').trim().slice(0, 140);
    const phone = String(body?.phone || '').trim().slice(0, 40);
    const email = String(body?.email || '').trim().slice(0, 100);
    const contactInfo = String(body?.contactInfo || [phone, email].filter(Boolean).join(' · ') || '').trim().slice(0, 160);
    const notes = String(body?.notes || '').trim().slice(0, 400);
    const source = String(body?.source || 'direct').trim().slice(0, 40);

    const { data: rxData, id: rxDocId } = await resolvePrescriptionDocAdmin(rawCode);
    const rxCode = String(rxData?.code || rxData?.rxCode || rxData?.fileNumber || rawCode).replace(/^#/, '').trim();
    const patientName = rxData?.patientName || rxData?.patient?.name || 'Patient';
    const doctorName = rxData?.doctorName || rxData?.doctor?.name || 'Prescribing Physician';
    const schedule = computeRefillSchedule(rxData || {}, rxData?.items || []);
    const dispensedStr = schedule.purchaseDate ? formatShortDate(schedule.purchaseDate, false) : '—';
    const tentativeRefillStr = schedule.tentativeRefillDate ? formatShortDate(schedule.tentativeRefillDate, false) : '—';
    const lotStr = rxData?.lotNumber || rxData?.lote || rxData?.batchCode || '—';
    const budStr = rxData?.expDate || rxData?.bud || '—';
    const nowIso = new Date().toISOString();
    const requestId = `RF-${Date.now().toString(36).toUpperCase()}`;

    const requestRecord = {
      requestId,
      source,
      partNumber,
      productName,
      quantity,
      phone,
      email,
      contactInfo,
      notes,
      status: 'pending_atlas_review',
      requestedAt: nowIso,
    };

    // 1. Update prescription record
    await adminDb.collection('prescriptions').doc(rxDocId).set(
      {
        refillAlertStatus: 'patient_requested',
        lastRefillRequestedAt: nowIso,
        refillRequests: admin.firestore.FieldValue.arrayUnion(requestRecord),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Direct SMTP email alert (best-effort)
    let smtpSent = false;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const subject = `🔄 [Patient Refill Request] #${rxCode} — ${productName} (${patientName})`;
    const textBody = [
      `Patient Refill Request (${source})`,
      `Request ID: ${requestId}`,
      `Requested At: ${nowIso}`,
      `Prescription: #${rxCode}`,
      `Patient: ${patientName}`,
      `Physician: ${doctorName}`,
      `Product: ${productName}${partNumber ? ` (Part ${partNumber})` : ''}`,
      `Quantity: ${quantity}`,
      `Dispensed Date: ${dispensedStr}`,
      `Tentative Refill Date: ${tentativeRefillStr}`,
      `Lot / BUD: ${lotStr} / ${budStr}`,
      `Mobile / WhatsApp: ${phone || '—'}`,
      `Email: ${email || '—'}`,
      notes ? `Notes: ${notes}` : '',
      `Open in Atlas: https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}`,
    ]
      .filter(Boolean)
      .join('\n');

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:10px;">
        <h2 style="margin:0 0 12px 0;color:#003666;">🔄 Patient Refill Request</h2>
        <p style="margin:0 0 14px 0;color:#334155;font-size:14px;">A patient submitted a refill request (source: <strong>${source}</strong>).</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:6px 0;color:#64748b;">Request ID</td><td style="padding:6px 0;font-weight:700;">${requestId}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Requested At</td><td style="padding:6px 0;">${nowIso}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Prescription</td><td style="padding:6px 0;font-weight:700;">#${rxCode}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Patient</td><td style="padding:6px 0;font-weight:700;">${patientName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Physician</td><td style="padding:6px 0;">${doctorName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Product</td><td style="padding:6px 0;font-weight:700;color:#0284c7;">${productName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Quantity</td><td style="padding:6px 0;font-weight:700;">${quantity}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Dispensed / Tentative Refill</td><td style="padding:6px 0;">${dispensedStr} → ${tentativeRefillStr}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Lot / BUD</td><td style="padding:6px 0;">${lotStr} / ${budStr}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Mobile / WhatsApp</td><td style="padding:6px 0;font-weight:700;">${phone || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;">${email || '—'}</td></tr>
          ${notes ? `<tr><td style="padding:6px 0;color:#64748b;">Notes</td><td style="padding:6px 0;">${notes}</td></tr>` : ''}
        </table>
        <div style="margin-top:18px;">
          <a href="https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}" style="display:inline-block;background:#003666;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:700;font-size:13px;">
            Open Prescription in Atlas →
          </a>
        </div>
      </div>
    `;

    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({
          from: `"Atlas Health Operations" <${smtpUser}>`,
          to: ATLAS_REFILL_ALERT_EMAIL,
          subject,
          text: textBody,
          html: htmlBody,
        });
        smtpSent = true;
      } catch (smtpErr) {
        console.warn('[request-refill] SMTP warning:', smtpErr.message);
      }
    }

    // Resend API fallback if SMTP was not configured or failed
    if (!smtpSent && process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Atlas Health Operations <notifications@atlashealth-services.com>',
            to: [ATLAS_REFILL_ALERT_EMAIL],
            subject,
            text: textBody,
            html: htmlBody,
          }),
        });
        if (resendRes.ok) {
          smtpSent = true;
        }
      } catch (resendErr) {
        console.warn('[request-refill] Resend fallback warning:', resendErr.message);
      }
    }

    // 3. Fire in-app Atlas notifications + mail_notifications audit
    await Promise.all([
      adminDb.collection('notifications').add({
        title: `🔄 Refill Request: #${rxCode}`,
        message: `${patientName} requested ${quantity}× ${productName}${contactInfo ? ` (${contactInfo})` : ''}`,
        type: 'refill_request',
        severity: 'warning',
        prescriptionId: rxDocId,
        prescriptionCode: rxCode,
        productName,
        quantity,
        targetRoles: ['admin', 'doctor'],
        targetEmail: ATLAS_REFILL_ALERT_EMAIL,
        link: `/rx/${rxCode}`,
        read: false,
        smtpSent,
        createdAt: nowIso,
      }),
      adminDb.collection('mail_notifications').add({
        to: ATLAS_REFILL_ALERT_EMAIL,
        type: 'patient_refill_request',
        prescriptionId: rxDocId,
        prescriptionCode: rxCode,
        patientName,
        productName,
        quantity,
        contactInfo,
        subject,
        text: textBody,
        html: htmlBody,
        smtpSent,
        createdAt: nowIso,
      }),
    ]);

    invalidateRxCache();

    return NextResponse.json({
      success: true,
      requestId,
      prescriptionCode: rxCode,
      productName,
      quantity,
      smtpSent,
    });
  } catch (err) {
    console.error('[POST /api/prescriptions/[code]/request-refill] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Could not submit refill request' },
      { status: 500 }
    );
  }
}
