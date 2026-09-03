import { adminDb } from '../lib/firebaseAdmin.js';

async function unifyDuplicates() {
  console.log('Starting Genomics Duplicate Unification & Cleanup...');

  // 1. Merge NAC -> n-acetylcysteine
  const nacSnap = await adminDb.collection('products').doc('nac').get();
  const nacCanSnap = await adminDb.collection('products').doc('n-acetylcysteine').get();
  if (nacCanSnap.exists) {
    const canData = nacCanSnap.data();
    const existingProgs = Array.isArray(canData.programs) ? canData.programs : [];
    
    // Add TeloTest if not present
    if (!existingProgs.some(p => p.slug === 'fagron-genomics-telotest')) {
      existingProgs.push({
        id: 'fagron-genomics-telotest',
        slug: 'fagron-genomics-telotest',
        name: 'Fagron Genomics | TeloTest',
        priority: 'A',
        applicationRoute: 'Oral / Compounding',
        metadata: {
          supplier: 'Fagron Iberia',
          recommendedDosage: '600mg - 1200mg daily'
        }
      });
    }

    const tags = Array.from(new Set([
      ...(Array.isArray(canData.tags) ? canData.tags : []),
      'fagron-genomics-telotest',
      'fagron-genomics-nutrigen',
      'TeloTest',
      'NutriGen',
      'Fagron Genomics',
      'NAC',
      'N-Acetylcysteine'
    ]));

    const aliases = Array.from(new Set([
      ...(Array.isArray(canData.aliases) ? canData.aliases : []),
      'NAC',
      'N-Acetyl-L-Cysteine',
      'Acetylcysteine'
    ]));

    await adminDb.collection('products').doc('n-acetylcysteine').update({
      programs: existingProgs,
      tags,
      aliases,
      casNumber: '616-91-1',
      cas: '616-91-1',
      updatedAt: new Date().toISOString()
    });
    console.log('[MERGED] nac -> n-acetylcysteine (Now has TeloTest + NutriGen)');

    if (nacSnap.exists) {
      await adminDb.collection('products').doc('nac').delete();
      console.log('[DELETED] Legacy duplicate doc: nac');
    }
  }

  // 2. Merge vitamin-d3-cholecalciferol -> vitamin-d3
  const d3Snap = await adminDb.collection('products').doc('vitamin-d3-cholecalciferol').get();
  const d3CanSnap = await adminDb.collection('products').doc('vitamin-d3').get();
  if (d3CanSnap.exists) {
    const canData = d3CanSnap.data();
    const existingProgs = Array.isArray(canData.programs) ? canData.programs : [];
    
    if (!existingProgs.some(p => p.slug === 'fagron-genomics-telotest')) {
      existingProgs.push({
        id: 'fagron-genomics-telotest',
        slug: 'fagron-genomics-telotest',
        name: 'Fagron Genomics | TeloTest',
        priority: 'A',
        applicationRoute: 'Oral / Compounding',
        metadata: {
          supplier: 'Fagron Iberia',
          recommendedDosage: '2000IU - 5000IU daily'
        }
      });
    }

    const tags = Array.from(new Set([
      ...(Array.isArray(canData.tags) ? canData.tags : []),
      'fagron-genomics-telotest',
      'fagron-genomics-nutrigen',
      'TeloTest',
      'NutriGen',
      'Fagron Genomics',
      'Cholecalciferol',
      'Vitamin D3'
    ]));

    const aliases = Array.from(new Set([
      ...(Array.isArray(canData.aliases) ? canData.aliases : []),
      'Cholecalciferol',
      'Colecalciferol',
      'Vitamin D',
      'Vit D3'
    ]));

    await adminDb.collection('products').doc('vitamin-d3').update({
      programs: existingProgs,
      tags,
      aliases,
      casNumber: '67-97-0',
      cas: '67-97-0',
      updatedAt: new Date().toISOString()
    });
    console.log('[MERGED] vitamin-d3-cholecalciferol -> vitamin-d3 (Now has TeloTest + NutriGen)');

    if (d3Snap.exists) {
      await adminDb.collection('products').doc('vitamin-d3-cholecalciferol').delete();
      console.log('[DELETED] Legacy duplicate doc: vitamin-d3-cholecalciferol');
    }
  }

  // 3. Merge vitamin-b12-cyanocobalamin -> vitamin-b12
  const b12Snap = await adminDb.collection('products').doc('vitamin-b12-cyanocobalamin').get();
  const b12CanSnap = await adminDb.collection('products').doc('vitamin-b12').get();
  if (b12CanSnap.exists) {
    const canData = b12CanSnap.data();
    const existingProgs = Array.isArray(canData.programs) ? canData.programs : [];
    
    if (!existingProgs.some(p => p.slug === 'fagron-genomics-telotest')) {
      existingProgs.push({
        id: 'fagron-genomics-telotest',
        slug: 'fagron-genomics-telotest',
        name: 'Fagron Genomics | TeloTest',
        priority: 'A',
        applicationRoute: 'Oral / Compounding',
        metadata: {
          supplier: 'Fagron Iberia',
          recommendedDosage: '1000mcg daily'
        }
      });
    }

    const tags = Array.from(new Set([
      ...(Array.isArray(canData.tags) ? canData.tags : []),
      'fagron-genomics-telotest',
      'fagron-genomics-nutrigen',
      'TeloTest',
      'NutriGen',
      'Fagron Genomics',
      'Cyanocobalamin',
      'Methylcobalamin',
      'Vitamin B12'
    ]));

    const aliases = Array.from(new Set([
      ...(Array.isArray(canData.aliases) ? canData.aliases : []),
      'Cyanocobalamin',
      'Cianocobalamin',
      'Methylcobalamin',
      'Cobalamin',
      'Vit B12'
    ]));

    await adminDb.collection('products').doc('vitamin-b12').update({
      programs: existingProgs,
      tags,
      aliases,
      updatedAt: new Date().toISOString()
    });
    console.log('[MERGED] vitamin-b12-cyanocobalamin -> vitamin-b12 (Now has TeloTest + NutriGen)');

    if (b12Snap.exists) {
      await adminDb.collection('products').doc('vitamin-b12-cyanocobalamin').delete();
      console.log('[DELETED] Legacy duplicate doc: vitamin-b12-cyanocobalamin');
    }
  }

  // 4. Merge folic-acid-vitamin-b9 -> methylfolate
  const b9Snap = await adminDb.collection('products').doc('folic-acid-vitamin-b9').get();
  const b9CanSnap = await adminDb.collection('products').doc('methylfolate').get();
  if (b9CanSnap.exists) {
    const canData = b9CanSnap.data();
    const existingProgs = Array.isArray(canData.programs) ? canData.programs : [];
    
    if (!existingProgs.some(p => p.slug === 'fagron-genomics-telotest')) {
      existingProgs.push({
        id: 'fagron-genomics-telotest',
        slug: 'fagron-genomics-telotest',
        name: 'Fagron Genomics | TeloTest',
        priority: 'A',
        applicationRoute: 'Oral / Compounding',
        metadata: {
          supplier: 'Fagron Iberia',
          recommendedDosage: '400mcg - 800mcg daily'
        }
      });
    }

    const tags = Array.from(new Set([
      ...(Array.isArray(canData.tags) ? canData.tags : []),
      'fagron-genomics-telotest',
      'fagron-genomics-nutrigen',
      'TeloTest',
      'NutriGen',
      'Fagron Genomics',
      'Folic Acid',
      'Folate',
      '5-MTHF'
    ]));

    const aliases = Array.from(new Set([
      ...(Array.isArray(canData.aliases) ? canData.aliases : []),
      'Folic Acid',
      'L-Methylfolate',
      '5-MTHF',
      'Folate',
      'Vitamin B9'
    ]));

    await adminDb.collection('products').doc('methylfolate').update({
      programs: existingProgs,
      tags,
      aliases,
      updatedAt: new Date().toISOString()
    });
    console.log('[MERGED] folic-acid-vitamin-b9 -> methylfolate (Now has TeloTest + NutriGen)');

    if (b9Snap.exists) {
      await adminDb.collection('products').doc('folic-acid-vitamin-b9').delete();
      console.log('[DELETED] Legacy duplicate doc: folic-acid-vitamin-b9');
    }
  }

  // 5. Delete empty/ghost duplicate docs
  const ghostsToDelete = [
    'vitamin-e-tocopherol',
    'a-lipoic-acid',
    'glutamine',
    'milk-thistle',
    'vitamin-b7-biotin',
    'cianocobalamin-vitamin-b12',
    'vitamin-b9-folate'
  ];

  for (const ghostId of ghostsToDelete) {
    const snap = await adminDb.collection('products').doc(ghostId).get();
    if (snap.exists) {
      await adminDb.collection('products').doc(ghostId).delete();
      console.log('[CLEANED] Deleted empty ghost doc:', ghostId);
    }
  }

  console.log('Genomics Duplicate Unification Completed Successfully!');
}

unifyDuplicates().catch(console.error).then(() => process.exit(0));
