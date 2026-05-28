import { defineConfig } from 'cypress';
import admin from 'firebase-admin';

// Initialize firebase-admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
  });
}
const db = admin.firestore();

export default defineConfig({
  e2e: {
    // Local dev server URL for local testing
    baseUrl: 'http://localhost:5174',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        async cleanTestRecords() {
          const testEmails = [
            'admin@regenpept.test',
            'doctor@regenpept.test',
            'wholesaler@regenpept.test',
            'patient@regenpept.test',
            'guest@regenpept.test',
          ];
          const uids = [];
          for (const email of testEmails) {
            try {
              const user = await admin.auth().getUserByEmail(email);
              uids.push(user.uid);
            } catch (err) {
              console.log(`Could not find UID for ${email}:`, err.message);
            }
          }

          // Clean prescriptions
          const rxSnap = await db.collection('prescriptions').get();
          const rxDeletes = [];
          rxSnap.forEach(docSnap => {
            const data = docSnap.data();
            const matchesUid = uids.includes(data.doctorId) || uids.includes(data.patient?.uid) || uids.includes(data.delivery?.wholesalerId) || (data.wholesalerIds && data.wholesalerIds.some(id => uids.includes(id)));
            const matchesEmail = testEmails.includes(data.patient?.email) || testEmails.includes(data.doctorEmail);
            if (matchesUid || matchesEmail) {
              rxDeletes.push(docSnap.ref.delete());
            }
          });
          await Promise.all(rxDeletes);
          console.log(`Cleaned ${rxDeletes.length} test prescriptions.`);

          // Clean orders
          const orderSnap = await db.collection('orders').get();
          const orderDeletes = [];
          const deletedOrderIds = [];
          orderSnap.forEach(docSnap => {
            const data = docSnap.data();
            const matchesUid = uids.includes(data.paymentOwnerId) || uids.includes(data.uid) || uids.includes(data.patientId);
            const matchesEmail = testEmails.includes(data.customer?.email);
            if (matchesUid || matchesEmail) {
              orderDeletes.push(docSnap.ref.delete());
              deletedOrderIds.push(docSnap.id);
            }
          });
          await Promise.all(orderDeletes);
          console.log(`Cleaned ${orderDeletes.length} test orders.`);

          // Clean bulk orders
          const bulkSnap = await db.collection('bulk_orders').get();
          const bulkDeletes = [];
          bulkSnap.forEach(docSnap => {
            const data = docSnap.data();
            const matchesUid = uids.includes(data.wholesalerId);
            const matchesEmail = testEmails.includes(data.wholesalerEmail);
            if (matchesUid || matchesEmail) {
              bulkDeletes.push(docSnap.ref.delete());
            }
          });
          await Promise.all(bulkDeletes);
          console.log(`Cleaned ${bulkDeletes.length} test bulk orders.`);

          // Clean refill reminders matching deleted order IDs or test uids
          const reminderSnap = await db.collection('refill_reminders').get();
          const reminderDeletes = [];
          reminderSnap.forEach(docSnap => {
            const data = docSnap.data();
            const matchesUid = uids.includes(data.patientId) || uids.includes(data.doctorId) || uids.includes(data.wholesalerId) || (data.wholesalerIds && data.wholesalerIds.some(id => uids.includes(id)));
            const matchesOrderId = deletedOrderIds.includes(data.orderId) || deletedOrderIds.includes(docSnap.id);
            if (matchesUid || matchesOrderId) {
              reminderDeletes.push(docSnap.ref.delete());
            }
          });
          // Clean doctor_patient_relationships for test users
          const relSnap = await db.collection('doctor_patient_relationships').get();
          const relDeletes = [];
          relSnap.forEach(docSnap => {
            const data = docSnap.data();
            const matchesUid = uids.includes(data.doctorId) || uids.includes(data.patientId);
            if (matchesUid) {
              relDeletes.push(docSnap.ref.delete());
            }
          });
          await Promise.all(relDeletes);
          console.log(`Cleaned ${relDeletes.length} test relationships.`);

          // Re-create active profiles in Firestore for test users to ensure database state is correct
          const testProfiles = [
            {
              uid: '754OYGgejoelucER7ReDaGUbAJu2',
              email: 'doctor@regenpept.test',
              firstName: 'Test',
              lastName: 'Doctor',
              displayName: 'Test Doctor',
              role: 'doctor',
              professionalStatus: 'approved',
              approved: true,
            },
            {
              uid: '2cGrtl9bkcMcBajRtHAkmwPEa8U2',
              email: 'wholesaler@regenpept.test',
              firstName: 'Test',
              lastName: 'Wholesaler',
              displayName: 'Test Wholesaler',
              role: 'wholesaler',
              professionalStatus: 'approved',
              approved: true,
            },
            {
              uid: 'uPg6CQPv11bN0uMTAPGooiH4ibn1',
              email: 'patient@regenpept.test',
              firstName: 'Ana',
              lastName: 'Martínez',
              displayName: 'Ana Martínez',
              role: 'patient',
              professionalStatus: 'approved',
              approved: true,
            }
          ];

          for (const profile of testProfiles) {
            await db.collection('users').doc(profile.uid).set({
              ...profile,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`Re-created test profile: ${profile.email}`);
          }

          // Re-create active relationship between doctor@regenpept.test and patient@regenpept.test
          const doctorUser = await admin.auth().getUserByEmail('doctor@regenpept.test').catch(() => null);
          const patientUser = await admin.auth().getUserByEmail('patient@regenpept.test').catch(() => null);
          if (doctorUser && patientUser) {
            const relId = `${doctorUser.uid}_${patientUser.uid}`;
            await db.collection('doctor_patient_relationships').doc(relId).set({
              doctorId: doctorUser.uid,
              patientId: patientUser.uid,
              patientEmail: 'patient@regenpept.test',
              patientName: 'Ana Martínez',
              status: 'active',
              initiatedByRole: 'doctor',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Re-created test relationship: ${doctorUser.uid} -> ${patientUser.uid} with patientName`);
          }

          return { success: true };
        },
        async deliverPrescriptionAndCreateReminder({ prescriptionId }) {
          if (!prescriptionId) throw new Error('prescriptionId is required');

          const rxRef = db.collection('prescriptions').doc(prescriptionId);
          const rxDoc = await rxRef.get();
          if (!rxDoc.exists) throw new Error(`Prescription ${prescriptionId} not found`);
          const rxData = rxDoc.data();

          // 1. Transition the prescription status to 'fulfilled'
          await rxRef.update({
            status: 'fulfilled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 2. Directly create the refill reminder document and a dummy delivered order
          const orderId = `test_order_${prescriptionId}`;
          const deliveredAt = new Date();
          const remindAt = new Date(deliveredAt);
          remindAt.setDate(remindAt.getDate() + 30);

          const orderPayload = {
            orderId,
            uid: rxData.patient?.uid || null,
            patientId: rxData.patient?.uid || null,
            doctorId: rxData.doctorId || null,
            supervisingDoctorId: rxData.doctorId || null,
            wholesalerId: rxData.delivery?.wholesalerId || null,
            wholesalerIds: rxData.wholesalerIds || [],
            patientName: rxData.patient?.name || null,
            customerName: rxData.patient?.name || null,
            supervisingDoctorName: rxData.doctorName || null,
            doctorName: rxData.doctorName || null,
            status: 'delivered',
            deliveredAt: admin.firestore.Timestamp.fromDate(deliveredAt),
            items: rxData.items || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          await db.collection('orders').doc(orderId).set(orderPayload);

          const reminderPayload = {
            orderId,
            patientId: rxData.patient?.uid || null,
            doctorId: rxData.doctorId || null,
            wholesalerId: rxData.delivery?.wholesalerId || null,
            wholesalerIds: rxData.wholesalerIds || [],
            productName: rxData.items?.[0]?.name || 'Protocol',
            itemCount: rxData.items?.length || 1,
            patientName: rxData.patient?.name || null,
            doctorName: rxData.doctorName || null,
            deliveredAt: admin.firestore.Timestamp.fromDate(deliveredAt),
            remindAt: admin.firestore.Timestamp.fromDate(remindAt),
            notified: {
              patient: false,
              doctor: false,
              wholesaler: false,
              admin: false,
            },
            notifiedAt: {
              patient: null,
              doctor: null,
              wholesaler: null,
              admin: null,
            },
            createdAt: admin.firestore.Timestamp.now(),
          };
          await db.collection('refill_reminders').doc(orderId).set(reminderPayload);

          console.log(`Directly created delivered order & refill reminder for prescription ${prescriptionId}`);
          return { success: true };
        },
        logPrescriptions: async () => {
          const snaps = await db.collection('prescriptions').get();
          console.log(`--- FIRESTORE PRESCRIPTIONS (${snaps.size}) ---`);
          snaps.forEach(s => {
            const d = s.data();
            console.log(`Rx: ${s.id} ->`, JSON.stringify({
              status: d.status,
              wholesalerIds: d.wholesalerIds,
              patientName: d.patient?.name,
              shareWithPatient: d.shareWithPatient
            }));
          });
          return null;
        }
      });
    },
    // Re-enable support file so cy.loginAs() command is available
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 30000,
  },
});


