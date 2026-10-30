/**
 * prescriptions.js — Firestore triggers for the Prescription system
 *
 * Trigger 1: onPrescriptionOrdered
 *   Fires when prescriptions/{rxId}.status changes to 'ordered'.
 *   → Notifies the supervising doctor (in-app + email)
 *   → Updates orderId cross-reference on the Rx doc
 *
 * Trigger 2: onOrderCreatedForRx
 *   Fires when orders/{orderId} is CREATED and has a prescriptionId.
 *   → Updates the linked prescription status → 'ordered'
 *   → Creates a doctor notification doc
 *   → (Future) Webhook to Zoho Books
 */

const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue }              = require('firebase-admin/firestore');
const nodemailer                                = require('nodemailer');
const { gmailUser, gmailAppPass }              = require('../../src/config');

// ── Helper: build doctor notification email ───────────────────────────────────
function buildDoctorCheckoutEmail({ doctorEmail, doctorName, patientName, rxId, items = [], total }) {
  const itemList = items
    .slice(0, 5)
    .map(it => `<li style="margin:4px 0;">${it.quantity || 1}× <strong>${it.name}</strong>${it.pricePatient ? ` — ${it.currency || 'USD'} ${(it.pricePatient * (it.quantity || 1)).toFixed(2)}` : ''}</li>`)
    .join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
      <div style="background:#003666;color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h2 style="margin:0;font-size:18px;font-weight:900;">✅ Patient Completed Checkout</h2>
        <p style="margin:6px 0 0;opacity:0.75;font-size:14px;">Atlas Health · Clinical Prescription System</p>
      </div>
      <p style="font-size:15px;color:#1e293b;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
      <p style="font-size:14px;color:#475569;line-height:1.6;">
        Your patient <strong>${patientName || 'a patient'}</strong> has completed checkout 
        for your issued prescription and payment has been received.
      </p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
        <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
          Prescribed Medications & Formulations
        </div>
        <ul style="margin:0;padding:0 0 0 18px;font-size:14px;color:#1e293b;">${itemList}</ul>
        ${total ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;font-weight:800;font-size:15px;color:#003666;">
          Total: ${total}
        </div>` : ''}
      </div>
      <p style="font-size:12px;color:#94a3b8;">
        Prescription ID: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${rxId}</code><br>
        You can track preparation, compounding, and delivery live in your Physician Portal.
      </p>
      <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
        Cold-chain dispatch and courier tracking numbers will be automatically attached once dispatched.
      </p>
    </div>
  `;
  return {
    subject: `✅ ${patientName || 'Your patient'} completed checkout for your prescription`,
    html,
  };
}

// ── Trigger 1: Order created with prescriptionId → update Rx + notify doctor ──
module.exports.onOrderCreatedForRx = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    region: 'europe-west1',
    secrets: [gmailUser, gmailAppPass],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const orderId   = event.params.orderId;
    const orderData = snap.data();

    // Only process orders that came from a prescription
    const prescriptionId       = orderData.prescriptionId
      || orderData.cartOwnership?.recommendationId
      || orderData.metadata?.prescriptionId;
    const supervisingDoctorId  = orderData.supervisingPhysicianId
      || orderData.cartOwnership?.supervisingPhysicianId;

    if (!prescriptionId && !supervisingDoctorId) {
      console.log(`[onOrderCreatedForRx] Order ${orderId} has no prescription link — skipping.`);
      return;
    }

    const db = getFirestore();

    // ── A. Update prescription status → ordered ──────────────────────────────
    if (prescriptionId) {
      try {
        const rxRef = db.collection('prescriptions').doc(prescriptionId);
        const rxSnap = await rxRef.get();
        if (rxSnap.exists) {
          const rxData = rxSnap.data();
          await rxRef.update({
            status:    'ordered',
            orderId,
            updatedAt: FieldValue.serverTimestamp(),
            timeline: FieldValue.arrayUnion({
              event:     'ordered',
              actorId:   orderData.uid || orderData.customer?.uid || 'system',
              actorRole: 'patient',
              note:      `Order ${orderId} created from prescription`,
              timestamp: new Date().toISOString(),
            }),
          });
          console.log(`[onOrderCreatedForRx] Rx ${prescriptionId} → status: ordered`);

          // ── B. Create doctor notification in Firestore ───────────────────
          const doctorId = rxData.doctorId || supervisingDoctorId;
          if (doctorId) {
            await db.collection('notifications').add({
              recipientId:   doctorId,
              recipientRole: 'doctor',
              type:          'patient_checkout',
              title:         '✅ Patient completed checkout',
              body:          `${rxData.patient?.name || 'Your patient'} has completed checkout for prescription ${prescriptionId}.`,
              rxId:          prescriptionId,
              orderId,
              patientName:   rxData.patient?.name || rxData.patient?.email || null,
              read:          false,
              createdAt:     FieldValue.serverTimestamp(),
            });

            // ── C. Email to doctor ─────────────────────────────────────────
            const doctorSnap = await db.collection('users').doc(doctorId).get();
            const doctorData = doctorSnap.exists ? doctorSnap.data() : {};
            const doctorEmail = rxData.doctorEmail || doctorData.email;

            if (doctorEmail) {
              const transporter = nodemailer.createTransport({
                host:   'smtp.gmail.com',
                port:   587,
                secure: false,
                auth:   { user: gmailUser.value(), pass: gmailAppPass.value() },
              });

              const totalItems  = (rxData.items || []);
              const totalAmount = totalItems.reduce((s, it) =>
                s + ((it.pricePatient || 0) * (it.quantity || 1)), 0);
              const currency = totalItems[0]?.currency || 'USD';
              const totalStr = totalAmount > 0 ? `${currency} ${totalAmount.toFixed(2)}` : null;

              const { subject, html } = buildDoctorCheckoutEmail({
                doctorEmail,
                doctorName:  rxData.doctorName || doctorData.firstName,
                patientName: rxData.patient?.name || rxData.patient?.email,
                rxId:        prescriptionId,
                items:       rxData.items || [],
                total:       totalStr,
              });

              const { sanitizeTestEmail } = require('../lib/safetyEmailGuard');
              const safeDoctorMail = sanitizeTestEmail({
                from: `"Atlas Health" <${gmailUser.value()}>`,
                to:   doctorEmail,
                subject,
                html,
              }, 'doctor');

              await transporter.sendMail(safeDoctorMail);
              console.log(`[onOrderCreatedForRx] Safe email dispatched (originally for doctor ${doctorEmail})`);
            }
          }
        }
      } catch (err) {
        console.error('[onOrderCreatedForRx] Error updating Rx:', err);
      }
    }

    console.log(`✅ [onOrderCreatedForRx] Processed order ${orderId}`);
  }
);

// ── Trigger 2: onPrescriptionCreated → stamp server-side price snapshot & notify jose@mediluxeme.com ──
module.exports.onPrescriptionCreated = onDocumentCreated(
  {
    document: 'prescriptions/{rxId}',
    region:   'europe-west1',
    secrets:  [gmailUser, gmailAppPass],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rxId  = event.params.rxId;
    const rxData = snap.data();
    const items  = rxData.items || [];
    const db = getFirestore();

    // ── A0. Notify jose@mediluxeme.com when a prescription is imported / created ──
    if (!rxData.importEmailNotifiedAt) {
      try {
        const userEmail = gmailUser.value();
        const userPass = gmailAppPass.value();
        if (userEmail && userPass) {
          const transporter = nodemailer.createTransport({
            host:   'smtp.gmail.com',
            port:   587,
            secure: false,
            auth:   { user: userEmail, pass: userPass },
          });

          const code = rxData.code || rxData.rxCode || rxData.prescriptionNumber || rxData.fileNumber || rxId;
          const patientName = rxData.patientName || rxData.patient?.name || 'Unknown Patient';
          const doctorName = rxData.doctorName || rxData.doctor?.name || 'Unknown Doctor';
          const clinicName = rxData.clinicName || rxData.clinic || rxData.doctor?.clinicName || 'Atlas Partner Clinic';
          const rawLines = Array.isArray(rxData.items) && rxData.items.length > 0
            ? rxData.items
            : (Array.isArray(rxData.prescriptionLines) ? rxData.prescriptionLines : []);
          const itemRows = rawLines.slice(0, 20).map((it, idx) => {
            const name = it.productName || it.drugName || it.name || it.activeIngredient || `Item ${idx + 1}`;
            const dose = it.dosage || it.dose || it.concentration || '—';
            const block = it.formulationBlock || `Formula ${it.formulationIndex || 1}`;
            return `<tr><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;">${block}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${name}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-family:monospace;">${dose}</td></tr>`;
          }).join('');

          const html = `
            <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
              <div style="background:#003666;color:#fff;padding:18px 22px;border-radius:10px;margin-bottom:18px;">
                <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#93c5fd;">Atlas Clinical Prescription Import Alert</div>
                <h2 style="margin:4px 0 0;font-size:18px;font-weight:800;">New Prescription Imported · #${code}</h2>
              </div>
              <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;font-size:13px;">
                <tr><td style="padding:8px 12px;color:#64748b;font-weight:700;width:36%;">Prescription Code</td><td style="padding:8px 12px;color:#0f172a;font-weight:800;font-family:monospace;">#${code} (${rxId})</td></tr>
                <tr><td style="padding:8px 12px;color:#64748b;font-weight:700;">Patient</td><td style="padding:8px 12px;color:#0f172a;font-weight:700;">${patientName}</td></tr>
                <tr><td style="padding:8px 12px;color:#64748b;font-weight:700;">Prescribing Physician</td><td style="padding:8px 12px;color:#0f172a;">${doctorName}</td></tr>
                <tr><td style="padding:8px 12px;color:#64748b;font-weight:700;">Clinic / Institution</td><td style="padding:8px 12px;color:#0f172a;">${clinicName}</td></tr>
                <tr><td style="padding:8px 12px;color:#64748b;font-weight:700;">Channel / Status</td><td style="padding:8px 12px;color:#0f172a;">${rxData.importChannel || rxData.sourceType || 'portal'} · ${(rxData.status || 'draft').toUpperCase()}</td></tr>
              </table>
              ${itemRows ? `
              <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;font-size:12px;">
                <thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:8px 10px;">Block</th><th style="padding:8px 10px;">Active Ingredient</th><th style="padding:8px 10px;">Dose</th></tr></thead>
                <tbody>${itemRows}</tbody>
              </table>` : ''}
              <div style="margin-top:14px;">
                <a href="https://www.atlashealth-services.com/rx/${encodeURIComponent(code)}" style="display:inline-block;padding:10px 16px;background:#003666;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;margin-right:8px;">Open Prescription Dossier</a>
                <a href="https://www.atlashealth-services.com/admin/labels?code=${encodeURIComponent(code)}" style="display:inline-block;padding:10px 16px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;">Open in Label Studio</a>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"Atlas Health Clinical Operations" <${userEmail}>`,
            to: 'jose@mediluxeme.com',
            subject: `[Atlas Rx Imported] #${code} · ${patientName} (${doctorName})`,
            html,
          });

          await snap.ref.set({
            importEmailNotifiedAt: FieldValue.serverTimestamp(),
            importEmailRecipient: 'jose@mediluxeme.com',
          }, { merge: true });
          console.log(`✅ [onPrescriptionCreated] Import email sent to jose@mediluxeme.com for Rx ${rxId}`);
        }
      } catch (emailErr) {
        console.warn(`[onPrescriptionCreated] Non-fatal email error for Rx ${rxId}:`, emailErr.message);
      }
    }

    // Only process if any item is missing a server-verified price
    const needsPriceStamp = items.some(it => !it.pricePatientVerified);
    if (!needsPriceStamp) return;

    try {
      // Look up canonical prices from the products collection
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          if (item.pricePatientVerified) return item; // already stamped

          // Try to find product by id or name
          let productData = null;
          if (item.id) {
            const pSnap = await db.collection('products').doc(item.id).get();
            if (pSnap.exists) productData = pSnap.data();
          }
          if (!productData && item.name) {
            const pQuery = await db.collection('products')
              .where('name', '==', item.name)
              .limit(1)
              .get();
            if (!pQuery.empty) productData = pQuery.docs[0].data();
          }

          if (!productData) return item; // can't find — keep as-is

          const variant = productData.variants?.[0] || {};
          return {
            ...item,
            // Stamp server-side verified prices — overrides any client manipulation
            pricePatient:         variant.priceUSD         || productData.priceUSD         || item.pricePatient || null,
            priceDoctor:          variant.professionalPrice || productData.professionalPrice || item.priceDoctor  || null,
            priceWholesale:       variant.wholesalePrice   || productData.wholesalePrice   || null,
            currency:             'USD',
            pricePatientVerified: true,
            priceCapturedAt:      new Date().toISOString(),
          };
        })
      );

      await snap.ref.update({
        items:     enrichedItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ [onPrescriptionCreated] Price snapshot stamped for Rx ${rxId}`);
    } catch (err) {
      console.error('[onPrescriptionCreated] Error stamping prices:', err);
    }
  }
);
