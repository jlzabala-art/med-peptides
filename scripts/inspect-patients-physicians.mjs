import { adminDb } from '../src/lib/firebaseAdmin.js';

async function run() {
  const rxSnap = await adminDb.collection('prescriptions').get();
  const erdmannRx = [];
  rxSnap.forEach(d => {
    const rx = d.data();
    const str = JSON.stringify(rx).toLowerCase();
    if (str.includes('erdmann') || str.includes('bedaya')) {
      erdmannRx.push({
        id: d.id,
        patientId: rx.patientId,
        patientName: rx.patientName,
        doctorName: rx.doctorName || rx.physician,
        protocolName: rx.protocolName,
        clinic: rx.clinic || rx.clinicName
      });
    }
  });
  console.log('Prescriptions for Dr. Erdmann/Bedaya:', JSON.stringify(erdmannRx, null, 2));

  const patientsSnap = await adminDb.collection('patients').get();
  const patientsWithErdmann = [];
  const hortmanPatients = [];
  patientsSnap.forEach(d => {
    const p = d.data();
    const str = JSON.stringify(p).toLowerCase();
    if (str.includes('erdmann') || str.includes('bedaya') || p.physicianId === 'dr-hanieh-erdmann') {
      patientsWithErdmann.push({
        id: d.id,
        name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        physician: p.physician,
        physicianId: p.physicianId,
        clinic: p.clinic
      });
    }
    if (str.includes('hortman')) {
      hortmanPatients.push({
        id: d.id,
        name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        physician: p.physician,
        physicianId: p.physicianId,
        clinic: p.clinic
      });
    }
  });

  console.log('Patients matching Erdmann/Bedaya:', JSON.stringify(patientsWithErdmann, null, 2));
  console.log('Total Hortman patients count:', hortmanPatients.length);
  console.log('Sample Hortman patients (first 5):', JSON.stringify(hortmanPatients.slice(0, 5), null, 2));
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
