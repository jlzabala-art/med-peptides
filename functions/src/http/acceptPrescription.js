const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.acceptPrescription = functions.https.onCall(async (data, context) => {
  // Authentication checking can be added if needed
  // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const { queueItemId, patientName, patientDOB, doctorName, products } = data;
  if (!queueItemId) throw new functions.https.HttpsError('invalid-argument', 'Missing queueItemId');

  const db = admin.firestore();

  try {
    // 1. Fetch queue item
    const queueDocRef = db.collection('operations_queue').doc(queueItemId);
    const queueDoc = await queueDocRef.get();
    if (!queueDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Queue item not found');
    }
    const itemData = queueDoc.data();

    // 2. Resolve Doctor
    let doctorId = null;
    if (doctorName && doctorName.trim() !== '') {
      const doctorsSnap = await db.collection('doctors').where('fullName', '==', doctorName.trim()).limit(1).get();
      if (!doctorsSnap.empty) {
        doctorId = doctorsSnap.docs[0].id;
      } else {
        const newDoctorRef = db.collection('doctors').doc();
        await newDoctorRef.set({
          fullName: doctorName.trim(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'System Generated - Prescription'
        });
        doctorId = newDoctorRef.id;
      }
    }

    // 3. Resolve Patient
    let patientId = null;
    if (patientName && patientName.trim() !== '') {
      let query = db.collection('patients').where('fullName', '==', patientName.trim());
      if (patientDOB && patientDOB.trim() !== '') {
        query = query.where('dateOfBirth', '==', patientDOB.trim());
      }
      const patientsSnap = await query.limit(1).get();
      if (!patientsSnap.empty) {
        patientId = patientsSnap.docs[0].id;
      } else {
        const newPatientRef = db.collection('patients').doc();
        await newPatientRef.set({
          fullName: patientName.trim(),
          dateOfBirth: patientDOB || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'System Generated - Prescription'
        });
        patientId = newPatientRef.id;
      }
    }

    // 4. Create Prescription Record
    const newPrescriptionRef = db.collection('prescriptions').doc();
    await newPrescriptionRef.set({
      doctorId: doctorId,
      patientId: patientId,
      doctorName: doctorName || 'Unknown',
      patientName: patientName || 'Unknown',
      products: products || [],
      sourceQueueId: queueItemId,
      dateIssued: itemData.prescriptionDetails?.date || new Date().toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Active'
    });

    // 5. Check for Compounding Products & Generate RFQ
    const compoundingProducts = (products || []).filter(p => p.type === 'supplement_compounding' || p.sku === 'MAGISTRAL');
    let rfqId = null;

    if (compoundingProducts.length > 0) {
      const newRfqRef = db.collection('purchase_rfqs').doc();
      await newRfqRef.set({
        prescriptionId: newPrescriptionRef.id,
        doctorId: doctorId,
        patientId: patientId,
        doctorName: doctorName || 'Unknown',
        patientName: patientName || 'Unknown',
        supplier: 'Fagron Genomics / Compounding Lab',
        status: 'Draft',
        items: compoundingProducts,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Generated automatically from approved prescription ${newPrescriptionRef.id}`
      });
      rfqId = newRfqRef.id;

      // Also update prescription to link the RFQ
      await newPrescriptionRef.update({
        rfqId: rfqId,
        logisticsStatus: 'RFQ Generated'
      });
    }

    // 6. Update Queue Item
    await queueDocRef.update({
      status: 'Completed',
      outcome: 'Prescription Created',
      linkedRecord: newPrescriptionRef.id,
      rfqId: rfqId || null,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      prescriptionId: newPrescriptionRef.id,
      doctorId,
      patientId
    };

  } catch (error) {
    console.error("Error accepting prescription:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
