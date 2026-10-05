import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const env = readFileSync('.env.local', 'utf-8');
const appId = env.match(/NEXT_PUBLIC_ALGOLIA_APP_ID=([^\r\n]+)/)?.[1] || 'G722EVODUJ';
const apiKey = env.match(/ALGOLIA_ADMIN_KEY=([^\r\n]+)/)?.[1];
const client = algoliasearch(appId, apiKey);

function parseDate(dVal, createdVal) {
  let dt = null;
  if (dVal && typeof dVal === 'string') {
    const dmy = dVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      dt = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
    } else {
      const parsed = new Date(dVal);
      if (!isNaN(parsed.getTime())) dt = parsed;
    }
  }
  if (!dt && createdVal) {
    if (createdVal._seconds) dt = new Date(createdVal._seconds * 1000);
    else if (typeof createdVal.toDate === 'function') dt = createdVal.toDate();
    else if (typeof createdVal === 'string' || typeof createdVal === 'number') {
      const parsed = new Date(createdVal);
      if (!isNaN(parsed.getTime())) dt = parsed;
    }
  }
  if (!dt || isNaN(dt.getTime())) dt = new Date();

  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const year = dt.getFullYear();
  const dmyStr = `${day}/${month}/${year}`;
  const isoStr = dt.toISOString().slice(0, 10);
  const formattedStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ts = dt.getTime();

  return { dmy: dmyStr, iso: isoStr, formatted: formattedStr, ts };
}

async function run() {
  console.log('🚀 Starting Deduplication and Root Standardization Migration...');

  // 1. DUPLICATE IDS TO DELETE
  const idsToDelete = [
    'RX-51861',              // Basma duplicate of RX-51861-A
    'RX-50957',              // Alan duplicate of RX-50957-B
    'RX-PHARM-2026-50957',   // Alan ghost batch
    'RX-51812',              // Abdulla duplicate of RX-51812-A
    'RX-51857',              // Amna duplicate of RX-51857-A
    'BOX03483AATRI',         // Mohammed Ahmad duplicate of RX-BOX03483AATRI
    'RX-BOX03483',           // Mohammed Ahmad duplicate of RX-BOX03483AATRI
    'JY6b6olvbMdxbksrQfFr',  // Alice Shamoon duplicate of 5PKxytmjVZduvXpIcJb7
    'rL8I8HEVtkmQ8VUJeJX4',  // Daria Grek duplicate of CfOwJCEFcnwmww0TjtZ5
    'w6zeUsWfoQYLz3lEMy8F',  // Daria Grek duplicate of CfOwJCEFcnwmww0TjtZ5
  ];

  console.log(`\n🗑 Deleting ${idsToDelete.length} duplicate / redundant records...`);
  for (const id of idsToDelete) {
    try {
      await db.collection('prescriptions').doc(id).delete();
      console.log(`  ✓ Deleted from Firestore: ${id}`);
    } catch (err) {
      console.warn(`  ⚠️ Could not delete Firestore doc ${id}:`, err.message);
    }

    try {
      await client.deleteObject({
        indexName: 'prescriptions',
        objectID: id
      });
      console.log(`  ✓ Deleted from Algolia: ${id}`);
    } catch (err) {
      console.warn(`  ⚠️ Could not delete Algolia object ${id}:`, err.message);
    }
  }

  // 2. MULTI-PART PRESCRIPTION SPECIFIC UPDATES
  const multiPartUpdates = [
    // Alan
    { id: 'RX-50957-A', rxGroupId: 'RXG-50957-ALAN', sessionId: 'RXG-50957-ALAN', partNumber: 1, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    { id: 'RX-50957-B', rxGroupId: 'RXG-50957-ALAN', sessionId: 'RXG-50957-ALAN', partNumber: 2, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    // Basma
    { id: 'RX-51861-A', rxGroupId: 'RXG-51861-BASMA', sessionId: 'RXG-51861-BASMA', partNumber: 1, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    { id: 'RX-51861-B', rxGroupId: 'RXG-51861-BASMA', sessionId: 'RXG-51861-BASMA', partNumber: 2, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    // Abdulla
    { id: 'RX-51812-A', rxGroupId: 'RXG-51812-ABDULLA', sessionId: 'RXG-51812-ABDULLA', partNumber: 1, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    { id: 'RX-51812-B', rxGroupId: 'RXG-51812-ABDULLA', sessionId: 'RXG-51812-ABDULLA', partNumber: 2, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    // Amna
    { id: 'RX-51857-A', rxGroupId: 'RXG-51857-AMNA', sessionId: 'RXG-51857-AMNA', partNumber: 1, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    { id: 'RX-51857-B', rxGroupId: 'RXG-51857-AMNA', sessionId: 'RXG-51857-AMNA', partNumber: 2, totalParts: 2, date: '15/09/2026', dateIssued: '2026-09-15', dateFormatted: 'Sep 15, 2026' },
    // Alice Shamoon survivor
    { id: '5PKxytmjVZduvXpIcJb7', prescriptionCode: 'RX-SHAMOON-0607', doctorName: 'Dr. Andrey Komissarov', date: '07/06/2026', dateIssued: '2026-06-07', dateFormatted: 'Jun 7, 2026' }
  ];

  console.log(`\n🔧 Updating ${multiPartUpdates.length} multi-part & survivor prescriptions with canonical root metadata...`);
  for (const upd of multiPartUpdates) {
    const { id, ...fields } = upd;
    await db.collection('prescriptions').doc(id).set(fields, { merge: true });
    console.log(`  ✓ Updated canonical root metadata on: ${id}`);
  }

  // 3. ROOT STANDARDIZATION ACROSS ALL REMAINING PRESCRIPTIONS IN FIRESTORE
  console.log('\n📅 Standardizing date and root attributes across all Firestore prescriptions...');
  const snap = await db.collection('prescriptions').get();
  console.log(`Found ${snap.size} total valid prescriptions in Firestore`);

  const batchSize = 100;
  let batch = db.batch();
  let count = 0;
  let totalUpdated = 0;

  snap.forEach(doc => {
    const d = doc.data();
    const parsed = parseDate(d.date || d.dateIssued, d.createdAt);

    const updates = {};
    if (!d.dateFormatted || d.dateFormatted !== parsed.formatted) updates.dateFormatted = parsed.formatted;
    if (!d.date) updates.date = parsed.dmy;
    if (!d.dateIssued) updates.dateIssued = parsed.iso;
    if (!d.createdAt_ts) updates.createdAt_ts = parsed.ts;

    // Ensure session IDs match rxGroupId if set
    if (d.rxGroupId && !d.sessionId) updates.sessionId = d.rxGroupId;
    if (d.sessionId && !d.rxGroupId) updates.rxGroupId = d.sessionId;

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
      totalUpdated++;
      if (count >= batchSize) {
        batch.commit();
        batch = db.batch();
        count = 0;
      }
    }
  });

  if (count > 0) {
    await batch.commit();
  }
  console.log(`✅ Standardized root fields on ${totalUpdated} Firestore prescriptions!`);

  // 4. FULL SYNC TO ALGOLIA WITH COMPLETE ROOT DATA
  console.log('\n⚡ Resyncing all cleaned prescriptions to Algolia index [prescriptions]...');
  const freshSnap = await db.collection('prescriptions').get();
  const algoliaObjects = [];

  freshSnap.forEach(doc => {
    const d = doc.data();
    const targetId = doc.id;
    const rawItems = Array.isArray(d.items) ? d.items : (Array.isArray(d.prescriptionLines) ? d.prescriptionLines : []);
    const cleanItems = rawItems.slice(0, 15).map(i => ({
      name: i.name || i.productName || i.title || '',
      activeIngredient: i.activeIngredient || '',
      dosage: i.dosage || i.dose || '',
      dose: i.dose || i.dosage || '',
      category: i.category || '',
      form: i.form || i.dosageForm || ''
    }));
    const productNames = rawItems.map(i => i.name || i.productName || i.product_title || i.activeIngredient).filter(Boolean);
    const patientName = d.patientName || d.patient?.name || d.patient?.fullName || '';
    const doctorName = d.doctorName || d.doctor?.name || d.treatingDoctor?.name || '';
    const code = d.prescriptionCode || d.prescriptionNumber || d.code || ('RX-' + targetId.slice(0, 6).toUpperCase());

    algoliaObjects.push({
      objectID: targetId,
      id: targetId,
      code,
      prescriptionCode: code,
      patientName,
      patientId: d.patientId || d.patient?.id || '',
      doctorName,
      doctorId: d.doctorId || d.doctor?.id || '',
      clinicName: d.clinicName || d.clinic?.name || '',
      status: (d.status || 'pending').toLowerCase(),
      date: d.date || '',
      dateIssued: d.dateIssued || '',
      dateFormatted: d.dateFormatted || '',
      rxGroupId: d.rxGroupId || d.sessionId || '',
      sessionId: d.sessionId || d.rxGroupId || '',
      partNumber: d.partNumber || null,
      totalParts: d.totalParts || null,
      items: cleanItems,
      searchableItems: productNames,
      itemCount: rawItems.length,
      treatmentProgram: d.treatmentProgram || d.program || '',
      treatmentType: d.treatmentType || d.type || '',
      boxId: d.fagron?.boxId || '',
      total: Number(d.total || d.amount || 0),
      source: d.source || 'portal',
      createdAt_ts: d.createdAt_ts || Date.now()
    });
  });

  console.log(`Pushing ${algoliaObjects.length} rich root objects to Algolia...`);
  await client.saveObjects({
    indexName: 'prescriptions',
    objects: algoliaObjects
  });
  console.log('🎉 Algolia sync complete! All prescriptions now have dates and full root data.');
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
