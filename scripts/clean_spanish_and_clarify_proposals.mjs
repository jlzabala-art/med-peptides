import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function cleanSpanishAndClarifyProposals() {
  console.log('--- Cleaning Spanish Text and Updating Proposal Statuses for Dr. Khalid ---');

  const snap = await db.collection('prescriptions')
    .where('doctorId', '==', 'dr-khalid-shukri')
    .get();

  let count = 0;
  let batch = db.batch();
  let batchOps = 0;

  for (const doc of snap.docs) {
    const rx = doc.data();
    let needsUpdate = false;
    const updateData = {};

    // 1. Remove Spanish from treatmentTitle, treatmentType, treatmentProgram
    let title = rx.treatmentTitle || '';
    if (title.includes('Propuesta de Tratamiento')) {
      title = title.replace(/\(Propuesta de Tratamiento\)/gi, '').trim();
      updateData.treatmentTitle = title;
      updateData.treatmentType = title;
      needsUpdate = true;
    }

    let program = rx.treatmentProgram || '';
    if (program.includes('Propuesta de Tratamiento')) {
      updateData.treatmentProgram = 'Clinical Treatment Proposal (Unaccepted Offer)';
      needsUpdate = true;
    }

    let invRef = rx.invoiceRef || '';
    if (invRef.includes('Propuesta Clínica') || invRef.includes('Sin Pedido')) {
      updateData.invoiceRef = 'Treatment Proposal (Unaccepted Offer)';
      needsUpdate = true;
    }

    // 2. Mark explicit proposal fields
    const isUnacceptedProposal = rx.status === 'draft' || rx.orderStatus === 'Not Ordered' || rx.isTreatmentProposal === true || !rx.invoiceNumber;
    
    if (isUnacceptedProposal) {
      updateData.isTreatmentProposal = true;
      updateData.isOrderPlaced = false;
      updateData.orderStatus = 'Offer Not Accepted';
      updateData.quotationStatus = 'Treatment Proposal Pending Acceptance';
      updateData.commercialLifecycle = 'proposal_pending_acceptance';
      updateData.status = 'proposal_pending'; // specific status distinguishing it from doctor draft
      needsUpdate = true;
    } else {
      updateData.isTreatmentProposal = false;
      updateData.isOrderPlaced = true;
      updateData.orderStatus = 'Ordered';
      updateData.commercialLifecycle = 'purchased_dispensed';
    }

    if (needsUpdate) {
      batch.update(doc.ref, updateData);
      batchOps++;
      count++;
      if (batchOps >= 400) {
        await batch.commit();
        batch = db.batch();
        batchOps = 0;
      }
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  console.log(`Updated ${count} prescriptions for Dr. Khalid: Spanish removed, unaccepted offer status formalized.`);
}

cleanSpanishAndClarifyProposals().catch(console.error);
