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
        <h2 style="margin:0;font-size:18px;font-weight:900;">✅ Paciente completó el checkout</h2>
        <p style="margin:6px 0 0;opacity:0.75;font-size:14px;">Atlas Health · Sistema de Prescripciones</p>
      </div>
      <p style="font-size:15px;color:#1e293b;">Hola <strong>${doctorName || 'Doctor'}</strong>,</p>
      <p style="font-size:14px;color:#475569;line-height:1.6;">
        Tu paciente <strong>${patientName || 'un paciente'}</strong> ha añadido al carrito 
        los productos de tu prescripción y ha completado el proceso de pago.
      </p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
        <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
          Productos prescritos
        </div>
        <ul style="margin:0;padding:0 0 0 18px;font-size:14px;color:#1e293b;">${itemList}</ul>
        ${total ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;font-weight:800;font-size:15px;color:#003666;">
          Total: ${total}
        </div>` : ''}
      </div>
      <p style="font-size:12px;color:#94a3b8;">
        Rx ID: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${rxId}</code><br>
        Puedes ver el estado completo en tu Portal Médico.
      </p>
      <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
        Próximamente también recibirás notificación de pago confirmado cuando el sistema de facturación lo registre.
      </p>
    </div>
  `;
  return {
    subject: `✅ ${patientName || 'Tu paciente'} completó el checkout de tu prescripción`,
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
              note:      `Pedido ${orderId} creado desde prescripción`,
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
              title:         '✅ Paciente completó el checkout',
              body:          `${rxData.patient?.name || 'Tu paciente'} ha añadido al carrito los productos de tu prescripción.`,
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

              await transporter.sendMail({
                from: `"Atlas Health" <${gmailUser.value()}>`,
                to:   doctorEmail,
                subject,
                html,
              });
              console.log(`[onOrderCreatedForRx] Doctor email sent to ${doctorEmail}`);
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

// ── Trigger 2: onPrescriptionCreated → stamp server-side price snapshot ────────
module.exports.onPrescriptionCreated = onDocumentCreated(
  {
    document: 'prescriptions/{rxId}',
    region:   'europe-west1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rxId  = event.params.rxId;
    const rxData = snap.data();
    const items  = rxData.items || [];

    // Only process if any item is missing a server-verified price
    const needsPriceStamp = items.some(it => !it.pricePatientVerified);
    if (!needsPriceStamp) return;

    const db = getFirestore();

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
