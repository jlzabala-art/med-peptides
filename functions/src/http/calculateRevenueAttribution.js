const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Calculates aggregated revenue for a given entity in the relationship graph.
 * Supports: 'clinic', 'physician', 'patient', 'account_manager'
 */
exports.calculateRevenueAttribution = functions.https.onCall(async (data, context) => {
  const { entityId, entityType } = data;

  if (!entityId || !entityType) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing entityId or entityType');
  }

  const db = getFirestore();
  let totalRevenue = 0;
  let orderCount = 0;

  try {
    if (entityType === 'patient') {
      // Direct orders for the patient
      const ordersSnap = await db.collection('orders').where('patientId', '==', entityId).get();
      ordersSnap.forEach(doc => {
        totalRevenue += (doc.data().total || 0);
        orderCount++;
      });
    } 
    else if (entityType === 'physician') {
      // Orders belonging to patients assigned to this physician
      const patientsSnap = await db.collection('patients').where('physicianId', '==', entityId).get();
      const patientIds = patientsSnap.docs.map(d => d.id);
      
      if (patientIds.length > 0) {
        // Firestore 'in' queries are limited to 10. For production scale, 
        // orders should ideally carry physicianId natively. For this implementation we chunk.
        const chunkedIds = chunkArray(patientIds, 10);
        for (const chunk of chunkedIds) {
          const ordersSnap = await db.collection('orders').where('patientId', 'in', chunk).get();
          ordersSnap.forEach(doc => {
            totalRevenue += (doc.data().total || 0);
            orderCount++;
          });
        }
      }
    }
    else if (entityType === 'clinic') {
      // Orders belonging to patients under this clinic
      const patientsSnap = await db.collection('patients').where('clinicId', '==', entityId).get();
      const patientIds = patientsSnap.docs.map(d => d.id);
      
      if (patientIds.length > 0) {
        const chunkedIds = chunkArray(patientIds, 10);
        for (const chunk of chunkedIds) {
          const ordersSnap = await db.collection('orders').where('patientId', 'in', chunk).get();
          ordersSnap.forEach(doc => {
            totalRevenue += (doc.data().total || 0);
            orderCount++;
          });
        }
      }
    }

    return {
      success: true,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      orderCount,
      entityId,
      entityType
    };

  } catch (error) {
    console.error("Error calculating revenue attribution:", error);
    throw new functions.https.HttpsError('internal', 'Failed to calculate revenue attribution');
  }
});

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
