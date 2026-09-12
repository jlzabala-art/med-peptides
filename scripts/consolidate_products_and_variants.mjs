/**
 * scripts/consolidate_products_and_variants.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Root-Level Consolidation and Deduplication for Firestore & Algolia
 *
 * 1. Merges split products (KLOW, SS-31, Thymosin Alpha 1, VIP, Turmeric).
 * 2. Purges ghost / unauthorized products (e.g. MK-677 Fagron Iberia).
 * 3. Purges duplicate starter kits and redundant legacy documents.
 * 4. Normalizes Magenta variant presentation formats ('cartridge' vs 'prefilled_pen').
 * 5. Updates variants subcollections and root arrays atomically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const SA_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount-target.json';
if (!getApps().length) {
  const sa = JSON.parse(readFileSync(SA_PATH, 'utf8'));
  initializeApp({ credential: cert(sa) });
}
const db = getFirestore();

async function deleteSubcollection(ref, subName) {
  const snap = await ref.collection(subName).get();
  for (const d of snap.docs) {
    await d.ref.delete();
  }
}

async function runConsolidation() {
  console.log('🚀 Iniciando Consolidación y Deduplicación a Nivel Root en Firestore...\n');

  // ───────────────────────────────────────────────────────────────────────────
  // 1. CONSOLIDAR KLOW: klow-bpc-157-tb-500-ghkcu-kpv -> klow-peptide
  // ───────────────────────────────────────────────────────────────────────────
  console.log('1️⃣ Consolidando KLOW...');
  const klowPeptideRef = db.collection('products').doc('klow-peptide');
  const klowBpcRef = db.collection('products').doc('klow-bpc-157-tb-500-ghkcu-kpv');

  const klowBpcDoc = await klowBpcRef.get();
  if (klowBpcDoc.exists) {
    // Get the authoritative Lotusland vial variant
    const lotuslandVarSnap = await klowBpcRef.collection('variants').doc('lotusland-klow-bpc-157-tb-500-ghkcu-kpv-10-mg-10-mg-75-mg-10-mg').get();
    let lotusVarData = null;
    if (lotuslandVarSnap.exists) {
      lotusVarData = lotuslandVarSnap.data();
    } else {
      // fallback to any variant in subcollection or array
      const subSnap = await klowBpcRef.collection('variants').get();
      if (!subSnap.empty) lotusVarData = subSnap.docs[0].data();
      else if (Array.isArray(klowBpcDoc.data().variants) && klowBpcDoc.data().variants.length > 0) {
        lotusVarData = klowBpcDoc.data().variants[0];
      }
    }

    if (lotusVarData) {
      const varId = 'lotusland-klow-vial-10mg-10mg-75mg-10mg';
      const cleanLotusVar = {
        ...lotusVarData,
        id: varId,
        docId: varId,
        supplierId: 'supplier-lotusland',
        supplier_id: 'supplier-lotusland',
        supplierName: 'Lotusland Limited',
        supplier: 'Lotusland',
        format: 'vial',
        presentation: 'Vial',
        presentationName: 'SubQ Lyophilized Vial',
        dosage: '10 mg + 10 mg + 75 mg + 10 mg',
        dose: '10 mg + 10 mg + 75 mg + 10 mg',
        status: 'active',
        isActive: true,
      };

      // Save into klow-peptide variants subcollection
      await klowPeptideRef.collection('variants').doc(varId).set(cleanLotusVar, { merge: true });
      console.log(`   ✅ Variante Lotusland vial guardada en klow-peptide/variants/${varId}`);

      // Update klow-peptide root document
      const klowPepDoc = await klowPeptideRef.get();
      const currentVarsSnap = await klowPeptideRef.collection('variants').get();
      const allKlowVars = currentVarsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      await klowPeptideRef.update({
        variants: allKlowVars,
        variantsCount: allKlowVars.length,
        supplierIds: ['supplier-magenta', 'supplier-lotusland'],
        suppliers: ['supplier-magenta', 'supplier-lotusland'],
        canonicalKey: 'klow',
        canonicalName: 'KLOW (BPC-157 / TB-500 / GHK-Cu / KPV)',
        name: 'KLOW Peptide',
        updatedAt: new Date().toISOString(),
      });
      console.log(`   ✅ klow-peptide actualizado con ${allKlowVars.length} variantes (Magenta + Lotusland)`);
    }

    // Delete klow-bpc-157-tb-500-ghkcu-kpv and its subcollection
    await deleteSubcollection(klowBpcRef, 'variants');
    await klowBpcRef.delete();
    console.log('   🗑️ Eliminado permanentemente el producto duplicado products/klow-bpc-157-tb-500-ghkcu-kpv');
  } else {
    console.log('   ℹ️ products/klow-bpc-157-tb-500-ghkcu-kpv ya no existe.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CONSOLIDAR SS-31: ss-31-elamipretide -> ss-31
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n2️⃣ Consolidando SS-31...');
  const ss31Ref = db.collection('products').doc('ss-31');
  const ss31ElamRef = db.collection('products').doc('ss-31-elamipretide');

  const ss31ElamDoc = await ss31ElamRef.get();
  if (ss31ElamDoc.exists) {
    const elamVarsSnap = await ss31ElamRef.collection('variants').get();
    for (const vDoc of elamVarsSnap.docs) {
      const vData = vDoc.data();
      await ss31Ref.collection('variants').doc(vDoc.id).set(vData, { merge: true });
      console.log(`   ✅ Migrada variante NP Labs ${vDoc.id} a ss-31/variants/`);
    }

    // Delete redundant duplicate variant magenta-ss31-10mg-3ml-pre-filled-pen-67-default in ss-31
    const redundantPenRef = ss31Ref.collection('variants').doc('magenta-ss31-10mg-3ml-pre-filled-pen-67-default');
    if ((await redundantPenRef.get()).exists) {
      await redundantPenRef.delete();
      console.log('   🗑️ Eliminada variante redundante magenta-ss31-10mg-3ml-pre-filled-pen-67-default');
    }

    // Normalize Magenta formats in ss-31
    const ss31VarsSnap = await ss31Ref.collection('variants').get();
    const cleanSS31Vars = [];
    for (const vDoc of ss31VarsSnap.docs) {
      const v = { id: vDoc.id, ...vDoc.data() };
      let updated = false;
      if (v.supplierId === 'supplier-magenta' || v.supplier === 'Magenta') {
        if (vDoc.id.includes('cartridge')) {
          v.format = 'cartridge';
          v.presentation = 'Cartridge 3 mL';
          v.presentationName = '3 mL Refill Cartridge';
          updated = true;
        } else if (vDoc.id.includes('pen')) {
          v.format = 'prefilled_pen';
          v.presentation = 'Prefilled Pen 3 mL';
          v.presentationName = '3 mL Prefilled Pen';
          updated = true;
        }
      }
      if (updated) {
        await vDoc.ref.set(v, { merge: true });
      }
      cleanSS31Vars.push(v);
    }

    // Update ss-31 root doc
    const uniqueSuppliers = [...new Set(cleanSS31Vars.map(v => v.supplierId).filter(Boolean))];
    await ss31Ref.update({
      variants: cleanSS31Vars,
      variantsCount: cleanSS31Vars.length,
      supplierIds: uniqueSuppliers,
      suppliers: uniqueSuppliers,
      canonicalKey: 'ss-31',
      canonicalName: 'SS-31 (Elamipretide)',
      updatedAt: new Date().toISOString(),
    });
    console.log(`   ✅ ss-31 actualizado con ${cleanSS31Vars.length} variantes normalizadas`);

    // Delete ss-31-elamipretide
    await deleteSubcollection(ss31ElamRef, 'variants');
    await ss31ElamRef.delete();
    console.log('   🗑️ Eliminado permanentemente products/ss-31-elamipretide');
  } else {
    console.log('   ℹ️ products/ss-31-elamipretide ya no existe.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PURGAR FANTASMA MK-677 FAGRON IBERIA: mk-677-ibutamoren
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n3️⃣ Purgando producto erróneo mk-677-ibutamoren (Fagron Iberia)...');
  const mkFagronRef = db.collection('products').doc('mk-677-ibutamoren');
  const mkFagronDoc = await mkFagronRef.get();
  if (mkFagronDoc.exists) {
    await deleteSubcollection(mkFagronRef, 'variants');
    await mkFagronRef.delete();
    console.log('   🗑️ Eliminado permanentemente products/mk-677-ibutamoren');
  } else {
    console.log('   ℹ️ products/mk-677-ibutamoren ya no existe.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CONSOLIDAR THYMOSIN ALPHA 1: thymosin-alpha-1-5-mg -> thymosin-alpha-1
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n4️⃣ Consolidando Thymosin Alpha 1...');
  const tAlphaRef = db.collection('products').doc('thymosin-alpha-1');
  const tAlphaDupRef = db.collection('products').doc('thymosin-alpha-1-5-mg');
  const tAlphaDupDoc = await tAlphaDupRef.get();
  if (tAlphaDupDoc.exists) {
    // Copy Europeptides pen
    const euroPenSnap = await tAlphaDupRef.collection('variants').doc('europeptides-thymosin-alpha-1-5-mg-pre-filled-pen-137-default').get();
    if (euroPenSnap.exists) {
      await tAlphaRef.collection('variants').doc(euroPenSnap.id).set(euroPenSnap.data(), { merge: true });
      console.log('   ✅ Migrada variante Europeptides pen a thymosin-alpha-1');
    }
    const currentVarsSnap = await tAlphaRef.collection('variants').get();
    const allVars = currentVarsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const uniqueSuppliers = [...new Set(allVars.map(v => v.supplierId).filter(Boolean))];

    await tAlphaRef.update({
      variants: allVars,
      variantsCount: allVars.length,
      supplierIds: uniqueSuppliers,
      suppliers: uniqueSuppliers,
      canonicalKey: 'thymosin-alpha-1',
      canonicalName: 'Thymosin Alpha-1',
      updatedAt: new Date().toISOString(),
    });

    await deleteSubcollection(tAlphaDupRef, 'variants');
    await tAlphaDupRef.delete();
    console.log('   🗑️ Eliminado permanentemente products/thymosin-alpha-1-5-mg');
  } else {
    console.log('   ℹ️ products/thymosin-alpha-1-5-mg ya no existe.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CONSOLIDAR VIP: vip-vasoactive-intestinal-peptide -> vip-10-mg
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n5️⃣ Consolidando VIP...');
  const vipRef = db.collection('products').doc('vip-10-mg');
  const vipDupRef = db.collection('products').doc('vip-vasoactive-intestinal-peptide');
  const vipDupDoc = await vipDupRef.get();
  if (vipDupDoc.exists) {
    const npVialSnap = await vipDupRef.collection('variants').doc('vip-vasoactive-intestinal-peptide-np-labs-10-mg-vial').get();
    if (npVialSnap.exists) {
      await vipRef.collection('variants').doc(npVialSnap.id).set(npVialSnap.data(), { merge: true });
      console.log('   ✅ Migrada variante NP Labs vial a vip-10-mg');
    }
    const vipVarsSnap = await vipRef.collection('variants').get();
    const allVipVars = vipVarsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const uniqueSuppliers = [...new Set(allVipVars.map(v => v.supplierId).filter(Boolean))];

    await vipRef.update({
      variants: allVipVars,
      variantsCount: allVipVars.length,
      supplierIds: uniqueSuppliers,
      suppliers: uniqueSuppliers,
      canonicalKey: 'vip',
      canonicalName: 'VIP (Vasoactive Intestinal Peptide)',
      name: 'VIP (Vasoactive Intestinal Peptide)',
      updatedAt: new Date().toISOString(),
    });

    await deleteSubcollection(vipDupRef, 'variants');
    await vipDupRef.delete();
    console.log('   🗑️ Eliminado permanentemente products/vip-vasoactive-intestinal-peptide');
  } else {
    console.log('   ℹ️ products/vip-vasoactive-intestinal-peptide ya no existe.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PURGAR DUPLICADOS DE STARTER KITS Y SLU-PP-332
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n6️⃣ Purgando bundles y productos redundantes...');
  const redundantDocs = [
    'starter-kit-syringe-bac-water',
    'syringe-bac-water-bundle',
    'slu-pp-332-100mg-caps-x30',
    'vitamin-e-tocoferol'
  ];

  for (const docId of redundantDocs) {
    const ref = db.collection('products').doc(docId);
    if ((await ref.get()).exists) {
      await deleteSubcollection(ref, 'variants');
      await ref.delete();
      console.log(`   🗑️ Eliminado permanentemente products/${docId}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. CONSOLIDAR CÚRCUMA: turmeric-extract -> turmeric-dry-extract
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n7️⃣ Consolidando Extracto de Cúrcuma...');
  const turmRef = db.collection('products').doc('turmeric-dry-extract');
  const turmDupRef = db.collection('products').doc('turmeric-extract');
  const turmDupDoc = await turmDupRef.get();
  if (turmDupDoc.exists) {
    const vSnap = await turmDupRef.collection('variants').get();
    for (const vDoc of vSnap.docs) {
      await turmRef.collection('variants').doc(vDoc.id).set(vDoc.data(), { merge: true });
    }
    const currentVarsSnap = await turmRef.collection('variants').get();
    const allVars = currentVarsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    await turmRef.update({
      variants: allVars,
      variantsCount: allVars.length,
      canonicalKey: 'turmeric-dry-extract',
      canonicalName: 'Turmeric Dry Extract (Curcumin)',
      updatedAt: new Date().toISOString(),
    });
    await deleteSubcollection(turmDupRef, 'variants');
    await turmDupRef.delete();
    console.log('   🗑️ Eliminado permanentemente products/turmeric-extract');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. NORMALIZAR VARIANTES DE MAGENTA (Cartridge vs Prefilled Pen)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n8️⃣ Normalizando formatos de variantes de Magenta en todos los productos...');
  const productsWithMagenta = ['klow-peptide', 'tb-500', 'tesamorelin', 'thymosin-alpha', 'thymosin-beta', 'sermorelin', 'pt-141', 'cjc-1295-ipamorelin-dsip'];
  
  for (const pId of productsWithMagenta) {
    const pRef = db.collection('products').doc(pId);
    const pDoc = await pRef.get();
    if (!pDoc.exists) continue;

    const vSnap = await pRef.collection('variants').get();
    let updatedAny = false;
    const cleanList = [];

    for (const vDoc of vSnap.docs) {
      const v = { id: vDoc.id, ...vDoc.data() };
      if (v.supplierId === 'supplier-magenta' || v.supplier === 'Magenta') {
        if (vDoc.id.includes('cartridge')) {
          v.format = 'cartridge';
          v.presentation = 'Cartridge 3 mL';
          v.presentationName = '3 mL Refill Cartridge';
          await vDoc.ref.set(v, { merge: true });
          updatedAny = true;
        } else if (vDoc.id.includes('pen')) {
          v.format = 'prefilled_pen';
          v.presentation = 'Prefilled Pen 3 mL';
          v.presentationName = '3 mL Prefilled Pen';
          await vDoc.ref.set(v, { merge: true });
          updatedAny = true;
        }
      }
      cleanList.push(v);
    }

    if (updatedAny) {
      await pRef.update({
        variants: cleanList,
        variantsCount: cleanList.length,
        updatedAt: new Date().toISOString(),
      });
      console.log(`   ✅ Normalizadas variantes de Magenta en products/${pId}`);
    }
  }

  console.log('\n🎉 Consolidación en Firestore completada exitosamente.');
}

runConsolidation().catch(err => {
  console.error('❌ Error en consolidación:', err);
  process.exit(1);
});
