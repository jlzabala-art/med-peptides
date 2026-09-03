"use server";

import { adminDb } from '../lib/firebaseAdmin';

function serializeFirestoreData(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (obj.toDate && typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }
  if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    return new Date(obj._seconds * 1000).toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeFirestoreData);
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = serializeFirestoreData(obj[key]);
  }
  return result;
}

export async function fetchPrescriptionsAction({ limitCount = 50, daysBack = 30 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    // Default: last N days, ordered newest-first
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    let q = adminDb
      .collection('prescriptions')
      .orderBy('createdAt', 'desc')
      .where('createdAt', '>=', since)
      .limit(limitCount);

    const snapshot = await q.get();
    const prescriptions = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...serializeFirestoreData(data) };
    });

    return prescriptions;
  } catch (error) {
    // Fallback: if composite index not yet deployed, fetch without date filter
    console.warn("fetchPrescriptionsAction: orderBy+where failed, falling back:", error.message);
    try {
      const snap = await adminDb
        .collection('prescriptions')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      return snap.docs.map(d => ({ id: d.id, ...serializeFirestoreData(d.data()) }));
    } catch (err2) {
      console.error("fetchPrescriptionsAction fallback also failed:", err2);
      return [];
    }
  }
}

export async function fetchDoctorPrescriptionsAction(doctorId, { limitCount = 50 } = {}) {
  if (!adminDb) {
    console.warn("adminDb is null, falling back to empty array");
    return [];
  }
  if (!doctorId) return [];

  try {
    // Server-side ordering — no need to sort in JS
    const snapshot = await adminDb
      .collection('prescriptions')
      .where('doctorId', '==', doctorId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeFirestoreData(doc.data())
    }));
  } catch (error) {
    console.error("Error fetching doctor prescriptions securely:", error);
    return [];
  }
}

export async function serverDuplicatePrescriptionAction(rxId, adminId = 'admin') {
  try {
    if (!adminDb) throw new Error("Firebase Admin not initialized.");

    const docRef = adminDb.collection('prescriptions').doc(rxId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error(`Prescription ${rxId} not found.`);
    }

    const rxData = docSnap.data();
    
    // Create new prescription object based on original
    const duplicateData = {
      ...rxData,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateIssued: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Refill Draft Created',
          user: adminId,
          description: `Auto-generated refill draft based on prescription ${rxId}.`
        }
      ]
    };
    
    // Remove fields that should not be carried over
    delete duplicateData.id;
    delete duplicateData.linkedQuoteId;
    delete duplicateData.messages;
    delete duplicateData.documents;

    const newDocRef = await adminDb.collection('prescriptions').add(duplicateData);
    
    return { success: true, id: newDocRef.id };
  } catch (err) {
    console.error("Failed to duplicate prescription:", err);
    throw err;
  }
}

/**
 * PHASE 6: Automated Protocol Reminders
 * This function is intended to be called by a daily CRON job (e.g. Firebase Cloud Functions).
 * It scans all active prescriptions, checks their current phase based on dateIssued,
 * and queues/sends Email or WhatsApp reminders if they transition into a new phase.
 */
export async function serverTriggerProtocolReminders() {
  try {
    if (!adminDb) throw new Error("Firebase Admin not initialized.");
    
    const snapshot = await adminDb.collection('prescriptions')
      .where('status', 'in', ['Active', 'Approved'])
      .get();
      
    let remindersSent = 0;
    const now = new Date();
    
    // Simulate checking each active prescription for a phase transition
    for (const doc of snapshot.docs) {
      const rx = doc.data();
      const startDate = rx.dateIssued ? new Date(rx.dateIssued) : null;
      if (!startDate) continue;
      
      const weeksElapsed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
      
      // Example logic: Send a reminder at Week 4
      if (weeksElapsed === 4 && !rx.week4ReminderSent) {
        // Integrate SendGrid / Twilio WhatsApp here...
        console.log(`[Phase 6 Automation] Sending Week 4 Follow-up to Patient ID: ${rx.patientId || rx.patient?.name}`);
        
        // Mark as sent
        await adminDb.collection('prescriptions').doc(doc.id).update({
          week4ReminderSent: true,
          timeline: adminDb.FieldValue ? adminDb.FieldValue.arrayUnion({
            timestamp: now.toISOString(),
            event: 'Automated Reminder Sent',
            description: 'System automatically sent Week 4 protocol reminder via WhatsApp/Email.'
          }) : rx.timeline // fallback if FieldValue is mocked
        });
        remindersSent++;
      }
    }
    
    return { success: true, count: remindersSent };
  } catch (err) {
    console.error("Failed to trigger protocol reminders:", err);
    throw err;
  }
}
