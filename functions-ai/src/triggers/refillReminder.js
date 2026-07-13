/**
 * refillReminder.js — Cloud Function trigger
 *
 * Fires when an order document is UPDATED and its status changes to 'delivered'.
 * Creates a /refill_reminders/{orderId} document with all viewer IDs so that:
 *
 *   - The PATIENT sees it if refill_reminders.patientId == their uid
 *   - The DOCTOR sees it if refill_reminders.doctorId == their uid
 *   - The WHOLESALER sees it if refill_reminders.wholesalerIds array-contains their uid
 *     OR refill_reminders.wholesalerId == their uid (legacy)
 *   - The ADMIN always sees all reminders
 *
 * Fields written:
 *   patientId       — order.uid || order.patientId
 *   doctorId        — order.supervisingDoctorId || order.doctorId
 *   wholesalerId    — order.wholesalerId (legacy single-share)
 *   wholesalerIds   — order.wholesalerIds (multi-share array)
 */

const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const REFILL_DAYS = 30;

module.exports = onDocumentUpdated(
  {
    document: 'orders/{orderId}',
    region: 'europe-west1',
  },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();
    const orderId = event.params.orderId;

    // Only act when status transitions TO 'delivered'
    if (before.status === after.status) return;
    if (after.status !== 'delivered')   return;

    // ── Resolve all viewer IDs ────────────────────────────────────────────────
    const patientId = after.uid || after.patientId || after.userId || null;

    if (!patientId) {
      console.warn(`[refillReminder] Order ${orderId} has no patientId — skipping.`);
      return;
    }

    // Doctor: supervisingDoctorId is the canonical field (set by prescription flow)
    const doctorId = after.supervisingDoctorId || after.doctorId || null;

    // Wholesaler: support both legacy single-share and new multi-share array
    const wholesalerId  = after.wholesalerId || after.delivery?.wholesalerId || null;
    const wholesalerIds = Array.isArray(after.wholesalerIds) && after.wholesalerIds.length > 0
      ? after.wholesalerIds
      : (wholesalerId ? [wholesalerId] : []);

    // ── Timing ───────────────────────────────────────────────────────────────
    const deliveredAt = after.deliveredAt
      ? (after.deliveredAt.toDate ? after.deliveredAt.toDate() : new Date(after.deliveredAt))
      : new Date();

    const remindAt = new Date(deliveredAt);
    remindAt.setDate(remindAt.getDate() + REFILL_DAYS);

    // ── Build the reminder document ───────────────────────────────────────────
    const reminder = {
      orderId,

      // ── Viewer IDs — used by useRefillReminders() queries per role ─────────
      patientId,
      doctorId,
      wholesalerId,
      wholesalerIds,

      // ── Display info ───────────────────────────────────────────────────────
      productName:    after.items?.[0]?.name || after.productName || 'Protocol',
      itemCount:      after.items?.length || 1,
      patientName:    after.patientName || after.customerName || null,
      doctorName:     after.supervisingDoctorName || after.doctorName || null,
      totalDisplay:   after.totalDisplay || null,

      // ── Timing ────────────────────────────────────────────────────────────
      deliveredAt: Timestamp.fromDate(deliveredAt),
      remindAt:    Timestamp.fromDate(remindAt),

      // ── State per viewer (each dismisses independently) ───────────────────
      notified: {
        patient:    false,
        doctor:     false,
        wholesaler: false,
        admin:      false,
      },
      notifiedAt: {
        patient:    null,
        doctor:     null,
        wholesaler: null,
        admin:      null,
      },

      createdAt: Timestamp.now(),
    };

    try {
      await getFirestore().collection('refill_reminders').doc(orderId).set(reminder);
      console.log(
        `[refillReminder] ✅ Created reminder for order ${orderId}`,
        `patient=${patientId}`,
        `doctor=${doctorId}`,
        `wholesalerIds=${wholesalerIds.join(',')}`,
        `remindAt=${remindAt.toISOString()}`
      );
    } catch (err) {
      console.error(`[refillReminder] ❌ Failed for order ${orderId}:`, err);
    }
  }
);
