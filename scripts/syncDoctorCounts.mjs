import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function syncDoctorCounts() {
  console.log('--- RECALCULATING DOCTOR PRESCRIPTION AND PATIENT COUNTS ---');
  const usersSnap = await db.collection('users').get();
  const rxSnap = await db.collection('prescriptions').get();

  const rxList = [];
  rxSnap.forEach(d => rxList.push({ id: d.id, ...d.data() }));

  const docStats = {};

  usersSnap.forEach(doc => {
    const d = doc.data();
    if (d.role === 'doctor' || d.role === 'physician') {
      const docId = doc.id;
      const name = (d.displayName || (d.firstName ? d.firstName + ' ' + (d.lastName||'') : '') || d.name || '').toLowerCase().replace('dr.', '').replace('dr ', '').trim();
      docStats[docId] = {
        id: docId,
        displayName: d.displayName || d.name || docId,
        cleanName: name,
        actualRxCount: 0,
        uniquePatients: new Set()
      };
    }
  });

  rxList.forEach(rx => {
    const rxDocName = (rx.doctorName || rx.treatingDoctor?.name || rx.prescribingDoctor || '').toLowerCase().replace('dr.', '').replace('dr ', '').trim();
    const rxDocId = rx.doctorId || rx.treatingDoctor?.id || rx.physicianId;
    const patientKey = rx.patientId || rx.patient?.id || rx.patientName || rx.patient?.name;

    for (const [uid, st] of Object.entries(docStats)) {
      let match = false;
      if (rxDocId && (rxDocId === uid || rxDocId === st.id)) match = true;
      else if (st.cleanName && rxDocName && (rxDocName.includes(st.cleanName) || st.cleanName.includes(rxDocName))) match = true;

      if (match) {
        st.actualRxCount++;
        if (patientKey) st.uniquePatients.add(patientKey);
        break;
      }
    }
  });

  const batch = db.batch();
  let updatedCount = 0;

  for (const [uid, st] of Object.entries(docStats)) {
    const rxCount = st.actualRxCount;
    const patCount = st.uniquePatients.size;
    console.log(`Updating ${st.displayName} (${uid}): prescriptionCount=${rxCount}, patientCount=${patCount}`);
    const ref = db.collection('users').doc(uid);
    batch.update(ref, {
      prescriptionCount: rxCount,
      patientCount: patCount,
      lastStatsSyncedAt: new Date().toISOString()
    });
    updatedCount++;
  }

  await batch.commit();
  console.log('SYNC COMPLETE! Updated ' + updatedCount + ' doctors.');
}

syncDoctorCounts();
