import { adminDb } from '@/lib/firebaseAdmin';

const TARGET_NOTIFICATION_EMAIL = 'jose@mediluxeme.com';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

/**
 * Builds the HTML and plain-text email payload for a newly imported prescription.
 */
export function buildPrescriptionImportEmail({ prescriptionId, rxData = {}, importChannel = 'portal' }) {
  const code = String(rxData.code || rxData.rxCode || rxData.fileNumber || prescriptionId || 'RX-NEW').replace(/^#/, '').trim();
  const patientName = rxData.patientName || rxData.patient?.name || 'Unspecified Patient';
  const patientDob = rxData.patientDob || rxData.patient?.dob || '—';
  const doctorName = rxData.doctorName || rxData.doctor?.name || 'Prescribing Physician';
  const clinicName = rxData.clinicName || rxData.doctor?.clinic || rxData.patient?.clinic || 'Partner Clinic';
  const treatmentType = rxData.treatmentType || rxData.treatmentTitle || rxData.treatmentProgram || 'Compounding Formulation';
  const prescriptionDate = rxData.prescriptionDate || new Date().toISOString().split('T')[0];

  const items = Array.isArray(rxData.items) && rxData.items.length > 0
    ? rxData.items
    : (Array.isArray(rxData.prescriptionLines) ? rxData.prescriptionLines : []);

  const parts = Array.isArray(rxData.parts) && rxData.parts.length > 0
    ? rxData.parts
    : [];

  const rxUrl = `${APP_BASE_URL}/rx/${encodeURIComponent(code)}`;
  const adminLabelsUrl = `${APP_BASE_URL}/admin/labels?rx=${encodeURIComponent(code)}`;
  const publicLabelsUrl = `${APP_BASE_URL}/labels?rx=${encodeURIComponent(code)}`;

  const itemsHtml = items.length > 0
    ? items.map((it, idx) => {
        const name = it.name || it.productName || it.activeIngredient || `Ingredient #${idx + 1}`;
        const dose = it.dosage || it.dose || '';
        const partTag = it.partLabel ? `<span style="background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-right:6px;">${it.partLabel}</span>` : '';
        return `<li style="margin:6px 0;color:#1e293b;font-size:13px;">${partTag}<strong>${name}</strong>${dose ? ` — <span style="color:#0f766e;font-weight:700;">${dose}</span>` : ''}</li>`;
      }).join('')
    : '<li style="color:#64748b;font-size:13px;">See digital dossier for full formulation breakdown.</li>';

  const partsSummaryHtml = parts.length > 1
    ? `<div style="margin-top:12px;padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:12px;color:#166534;">
         <strong>Multi-Phase Regimen (${parts.length} Formulations):</strong> ${parts.map(p => `${p.partLabel || p.partNumber}: ${p.treatmentType || p.dispensingForm || 'Formula'}`).join(' • ')}
       </div>`
    : '';

  const subject = `📋 [Prescription Imported] #${code} — ${patientName} (${doctorName})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #003666 0%, #0d9488 100%); color: #ffffff; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; margin-bottom: 4px;">
          Atlas Health Platform • Clinical Prescription Alert
        </div>
        <h2 style="margin: 0; font-size: 20px; font-weight: 800;">
          📋 New Prescription Imported (#${code})
        </h2>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b; width: 150px;">Prescription Code:</td>
            <td style="padding: 6px 0; font-weight: 800; color: #003666;">#${code}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Patient Name:</td>
            <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">${patientName} ${patientDob && patientDob !== '—' ? `<span style="font-weight:500;color:#64748b;">(DOB: ${patientDob})</span>` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Prescribing Doctor:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0d9488;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Medical Center / Clinic:</td>
            <td style="padding: 6px 0; color: #1e293b;">${clinicName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Treatment Type:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${treatmentType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Prescription Date:</td>
            <td style="padding: 6px 0; color: #475569;">${prescriptionDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700; color: #64748b;">Import Channel:</td>
            <td style="padding: 6px 0; color: #475569;"><code>${importChannel}</code></td>
          </tr>
        </table>
        ${partsSummaryHtml}
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">
          Active Ingredients & Compounded Formulations (${items.length} APIs)
        </div>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.5;">
          ${itemsHtml}
        </ul>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
        <a href="${rxUrl}" style="display: inline-block; background-color: #003666; color: #ffffff; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-right: 8px;">
          View Digital Dossier (/rx/${code})
        </a>
        <a href="${adminLabelsUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-size: 13px; font-weight: 700;">
          Open B2B Label Studio
        </a>
      </div>

      <div style="font-size: 11px; color: #94a3b8; text-align: center; padding-top: 12px; border-top: 1px solid #e2e8f0;">
        Automated notification dispatched to <strong>${TARGET_NOTIFICATION_EMAIL}</strong> • Kiosk Label Studio: <a href="${publicLabelsUrl}" style="color: #64748b;">${publicLabelsUrl}</a>
      </div>
    </div>
  `;

  const text = [
    `NEW PRESCRIPTION IMPORTED (#${code})`,
    `Patient: ${patientName} (DOB: ${patientDob})`,
    `Doctor: ${doctorName} (${clinicName})`,
    `Treatment: ${treatmentType}`,
    `Channel: ${importChannel}`,
    `Active Ingredients (${items.length}): ${items.map(i => `${i.name || i.productName} ${i.dosage || i.dose || ''}`.trim()).join(', ')}`,
    `Digital Dossier: ${rxUrl}`,
    `B2B Label Studio: ${adminLabelsUrl}`
  ].join('\n');

  return { subject, html, text, code, patientName, doctorName, clinicName, rxUrl, adminLabelsUrl };
}

/**
 * Dispatches an email notification to jose@mediluxeme.com and logs an admin notification
 * in Firestore whenever a prescription is imported.
 */
export async function notifyPrescriptionImported({ prescriptionId, rxData = {}, importChannel = 'portal' }) {
  const emailData = buildPrescriptionImportEmail({ prescriptionId, rxData, importChannel });
  const nowIso = new Date().toISOString();
  let smtpSent = false;
  let transportChannel = 'firestore_trigger_and_notification';

  // 1. Direct SMTP dispatch if credentials are present in Next.js server environment
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Atlas Health Operations" <${smtpUser}>`,
        to: TARGET_NOTIFICATION_EMAIL,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      smtpSent = true;
      transportChannel = 'direct_smtp';
    } catch (smtpErr) {
      console.warn('[prescriptionImportNotifier] Direct SMTP notice:', smtpErr.message);
    }
  }

  // 2. Persist Firestore Notification & Cloud Functions Email Dispatch Queue
  if (adminDb) {
    try {
      await Promise.all([
        // A. In-App Notification for Admin & jose@mediluxeme.com
        adminDb.collection('notifications').add({
          title: `📋 Prescription Imported: #${emailData.code}`,
          message: `${emailData.patientName} • Prescribed by ${emailData.doctorName} (${emailData.clinicName})`,
          type: 'prescription_imported',
          severity: 'info',
          prescriptionId: prescriptionId || null,
          prescriptionCode: emailData.code,
          recipientEmail: TARGET_NOTIFICATION_EMAIL,
          targetEmail: TARGET_NOTIFICATION_EMAIL,
          targetRoles: ['admin'],
          link: `/rx/${emailData.code}`,
          secondaryLink: `/admin/labels?rx=${emailData.code}`,
          read: false,
          smtpSent,
          createdAt: nowIso
        }),
        // B. Mail audit / dispatch record in mail_notifications
        adminDb.collection('mail_notifications').add({
          to: TARGET_NOTIFICATION_EMAIL,
          type: 'prescription_import_alert',
          prescriptionId: prescriptionId || null,
          prescriptionCode: emailData.code,
          patientName: emailData.patientName,
          doctorName: emailData.doctorName,
          clinicName: emailData.clinicName,
          importChannel,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          smtpSent,
          transportChannel,
          createdAt: nowIso
        }),
        // C. Stamp prescription document if direct SMTP already succeeded so Cloud Function trigger doesn't duplicate
        ...(smtpSent && prescriptionId
          ? [adminDb.collection('prescriptions').doc(prescriptionId).set({
              importEmailNotifiedAt: nowIso,
              importEmailRecipient: TARGET_NOTIFICATION_EMAIL
            }, { merge: true })]
          : [])
      ]);
    } catch (dbErr) {
      console.warn('[prescriptionImportNotifier] Firestore log warning:', dbErr.message);
    }
  }

  return {
    success: true,
    recipient: TARGET_NOTIFICATION_EMAIL,
    prescriptionCode: emailData.code,
    smtpSent,
    transportChannel
  };
}

