const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

// Ensure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Trigger: onOrderCreated
 * Automatically feeds the Timeline (activities collection) when an order is created.
 */
exports.onOrderCreated = onDocumentCreated(
  'orders/{orderId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const orderData = snap.data();
    const orderId = event.params.orderId;

    const patientId = orderData.patientId;
    const clinicId = orderData.clinicId;
    const physicianId = orderData.physicianId;

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // The universal timeline relies on relatedEntityId.
    // Create an activity for the Patient
    if (patientId) {
      const activityRefPatient = db.collection('activities').doc(`order_${orderId}_pat_${patientId}`);
      batch.set(activityRefPatient, {
        entityType: 'patient',
        relatedEntityId: patientId,
        type: 'order',
        title: 'Order Placed',
        description: `Order ${orderId} was placed.`,
        amount: orderData.totalAmount || 0,
        status: 'completed',
        timestamp: now,
      });
    }

    // Create an activity for the Clinic
    if (clinicId) {
      const activityRefClinic = db.collection('activities').doc(`order_${orderId}_clin_${clinicId}`);
      batch.set(activityRefClinic, {
        entityType: 'clinic',
        relatedEntityId: clinicId,
        type: 'order',
        title: 'New Order Associated',
        description: `Order ${orderId} placed for a patient at this clinic.`,
        amount: orderData.totalAmount || 0,
        status: 'completed',
        timestamp: now,
      });
    }

    // Create an activity for the Physician
    if (physicianId) {
      const activityRefPhysician = db.collection('activities').doc(`order_${orderId}_phys_${physicianId}`);
      batch.set(activityRefPhysician, {
        entityType: 'physician',
        relatedEntityId: physicianId,
        type: 'order',
        title: 'Order Placed by Patient',
        description: `Order ${orderId} placed for one of your patients.`,
        amount: orderData.totalAmount || 0,
        status: 'completed',
        timestamp: now,
      });
    }

    await batch.commit();
    console.log(`Timeline feeds created for Order ${orderId}`);
  });

/**
 * Trigger: onPatientCreated
 * Maintains the relationship graph counters (e.g., patientCount on clinics).
 */
exports.onPatientCreated = onDocumentCreated(
  'patients/{patientId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    
    if (data.clinicId) {
      const clinicRef = db.collection('clinics').doc(data.clinicId);
      await clinicRef.update({
        patientsCount: admin.firestore.FieldValue.increment(1)
      });
    }

    if (data.physicianId) {
      const physicianRef = db.collection('physicians').doc(data.physicianId);
      await physicianRef.update({
        patientsCount: admin.firestore.FieldValue.increment(1)
      });
    }
  });

/**
 * Trigger: onTaskCompleted
 * Automatically feeds the Timeline when a task is completed.
 */
exports.onTaskCompleted = onDocumentUpdated(
  'tasks/{taskId}',
  async (event) => {
    const change = event.data;
    if (!change) return;
    const before = change.before.data();
    const after = change.after.data();
    const taskId = event.params.taskId;

    if (before.status !== 'completed' && after.status === 'completed') {
      if (after.relatedEntityId) {
        await db.collection('activities').add({
          entityType: after.entityType || 'unknown',
          relatedEntityId: after.relatedEntityId,
          type: 'task',
          title: 'Task Completed',
          description: after.title,
          status: 'completed',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });
