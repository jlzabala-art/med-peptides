import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function auditAndFix() {
  console.log('=== AUDITING AND REFINING CENTRICO MATCHING ===');

  // Check pure BPC-157
  const bpcSnap = await db.collection('products').where('canonicalName', '==', 'BPC-157').get();
  console.log('BPC-157 matches:', bpcSnap.docs.map(d => ({ id: d.id, name: d.data().name, canonicalName: d.data().canonicalName })));

  // Check pure Ipamorelin
  const ipaSnap = await db.collection('products').where('canonicalName', '==', 'Ipamorelin').get();
  console.log('Ipamorelin matches:', ipaSnap.docs.map(d => ({ id: d.id, name: d.data().name, canonicalName: d.data().canonicalName })));

  // If pure BPC-157 exists (e.g. bpc-157 or similar), move variant from bioniq_bpc_157_kpv_capsule to bpc-157
  let pureBpcId = bpcSnap.docs.find(d => !d.id.includes('capsule') && !d.id.includes('kpv') && !d.id.includes('blend'))?.id;
  if (!pureBpcId) {
    const allBpc = await db.collection('products').get();
    const found = allBpc.docs.find(d => d.id === 'bpc-157' || d.data().canonicalName === 'BPC-157 (Body Protection Compound-157)' || d.data().name === 'BPC-157');
    if (found) pureBpcId = found.id;
  }

  console.log('Target Pure BPC-157 ID:', pureBpcId);

  // If pure Ipamorelin exists
  let pureIpaId = ipaSnap.docs.find(d => !d.id.includes('blend') && !d.id.includes('cjc'))?.id;
  if (!pureIpaId) {
    const allProds = await db.collection('products').get();
    const found = allProds.docs.find(d => d.id === 'ipamorelin' || d.data().canonicalName === 'Ipamorelin' || d.data().name === 'Ipamorelin');
    if (found) pureIpaId = found.id;
  }
  console.log('Target Pure Ipamorelin ID:', pureIpaId);

  // Fix BPC-157 if needed
  if (pureBpcId && pureBpcId !== 'bioniq_bpc_157_kpv_capsule') {
    const wrongVarRef = db.collection('products').doc('bioniq_bpc_157_kpv_capsule').collection('variants').doc('centrico-15mg-pen');
    const wrongVarSnap = await wrongVarRef.get();
    if (wrongVarSnap.exists) {
      console.log('Moving BPC-157 Centrico variant to', pureBpcId);
      await db.collection('products').doc(pureBpcId).collection('variants').doc('centrico-15mg-pen').set(wrongVarSnap.data());
      await wrongVarRef.delete();
    }
  }

  // Fix Ipamorelin if needed
  if (pureIpaId && pureIpaId !== 'cjc-1295-ipamorelin-blend') {
    const wrongVarRef = db.collection('products').doc('cjc-1295-ipamorelin-blend').collection('variants').doc('centrico-5mg-pen');
    const wrongVarSnap = await wrongVarRef.get();
    if (wrongVarSnap.exists) {
      console.log('Moving Ipamorelin Centrico variant to', pureIpaId);
      await db.collection('products').doc(pureIpaId).collection('variants').doc('centrico-5mg-pen').set(wrongVarSnap.data());
      await wrongVarRef.delete();
    }
  }

  // Separate Weight Loss (10mg, 20mg, 30mg) from Advanced Weight Loss (25mg, 50mg)
  const wlRef = db.collection('products').doc('weight-loss');
  const wlSnap = await wlRef.get();
  if (!wlSnap.exists) {
    console.log('Creating distinct product for Weight Loss (Standard)');
    await wlRef.set({
      name: 'Weight Loss',
      canonicalName: 'Weight Loss',
      slug: 'weight-loss',
      category: 'weight_loss',
      categoryId: 'weight_loss',
      productType: 'weight_loss',
      format: 'pre_filled_pen',
      status: 'active',
      isActive: true,
      currency: 'AED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastQuotationDate: '2026-08-20'
    });
  }

  // Move 10mg, 20mg, 30mg to weight-loss
  for (const dose of ['10mg', '20mg', '30mg']) {
    const vSlug = `centrico-${dose}-pen`;
    const oldRef = db.collection('products').doc('advanced-weight-loss').collection('variants').doc(vSlug);
    const vSnap = await oldRef.get();
    if (vSnap.exists) {
      console.log(`Moving ${vSlug} to weight-loss`);
      await db.collection('products').doc('weight-loss').collection('variants').doc(vSlug).set(vSnap.data());
      await oldRef.delete();
    }
  }

  console.log('=== AUDIT AND REFINEMENT COMPLETE ===');
}

auditAndFix().catch(console.error);
