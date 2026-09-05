import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function cleanDosageText(rawDosage) {
  if (!rawDosage || typeof rawDosage !== 'string') return rawDosage || '';
  return rawDosage
    .replace(/\s*\/\s*(vial|bottle|pen|single_cartridge_pen|cartridge|box|ampoule|gram|kg|g)/gi, '')
    .trim();
}

async function regularizeDatabase(dryRun = false) {
  console.log(`🚀 Starting LIVE Database Regularization (DryRun: ${dryRun})...`);
  const productsSnap = await adminDb.collection('products').get();
  console.log(`Loaded ${productsSnap.size} total product documents from Firestore.`);

  const chunks = chunkArray(productsSnap.docs, 20);
  let totalDuplicatesDeleted = 0;
  let totalDosagesCleaned = 0;
  let totalProductsUpdated = 0;
  let totalFagronReclassified = 0;

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunk = chunks[cIdx];
    await Promise.all(
      chunk.map(async (pDoc) => {
        const pData = pDoc.data();
        const subSnap = await pDoc.ref.collection('variants').get();
        const subVariants = subSnap.docs.map((d) => ({
          docId: d.id,
          ref: d.ref,
          isSub: true,
          ...d.data(),
        }));

        const inlineVariants = Array.isArray(pData.variants)
          ? pData.variants.map((v, idx) => ({
              docId: v.id || `inline_${idx}`,
              isSub: false,
              ...v,
            }))
          : [];

        const allVars = [...subVariants, ...inlineVariants];
        if (allVars.length === 0) return;

        let productNeedsUpdate = false;
        const canonicalSubVariantsToKeep = new Map();
        const subDocIdsToDelete = new Set();
        const cleanedInlineArray = [];
        const seenKeys = new Set();

        for (const v of allVars) {
          let updated = false;
          let dosage = v.dosage || '';
          let format = v.format || 'vial';
          let supplierName = v.supplierName || v.supplier || 'Lotusland Limited';
          let supplierId = v.supplierId || '';

          // 1. Clean Dosage (remove '/ vial', '/ bottle', '/ pen')
          const cleanedDosage = cleanDosageText(dosage);
          if (cleanedDosage !== dosage) {
            dosage = cleanedDosage;
            updated = true;
            totalDosagesCleaned++;
          }

          // 2. Fix Fagron Iberia format (raw materials / APIs are powder / bulk_api, not vials)
          const isFagron = supplierName.toLowerCase().includes('fagron') || supplierId.toLowerCase().includes('fagron');
          if (isFagron && format === 'vial') {
            format = 'powder';
            updated = true;
            totalFagronReclassified++;
          }

          // Build unique deduplication key
          const suppKey = supplierName.toLowerCase().trim();
          const dosageKey = dosage.toLowerCase().trim();
          const formatKey = format.toLowerCase().trim();
          const priceKey = v.price || v.unit_price || 0;
          const dedupKey = `${suppKey}::${dosageKey}::${formatKey}::${priceKey}`;

          if (seenKeys.has(dedupKey)) {
            // DUPLICATE DETECTED!
            totalDuplicatesDeleted++;
            productNeedsUpdate = true;
            if (v.isSub) {
              subDocIdsToDelete.add(v.docId);
            }
          } else {
            seenKeys.add(dedupKey);
            const cleanedVar = {
              ...v,
              dosage,
              format,
              supplierName,
            };
            delete cleanedVar.isSub;
            delete cleanedVar.ref;

            if (v.isSub) {
              canonicalSubVariantsToKeep.set(v.docId, {
                ref: v.ref,
                data: cleanedVar,
                needsSave: updated,
              });
            }
            cleanedInlineArray.push(cleanedVar);
          }
        }

        if (subDocIdsToDelete.size > 0 || productNeedsUpdate || canonicalSubVariantsToKeep.size > 0) {
          totalProductsUpdated++;
          if (!dryRun) {
            const batch = adminDb.batch();

            // Delete duplicate documents from Firestore subcollection
            subDocIdsToDelete.forEach((docId) => {
              batch.delete(pDoc.ref.collection('variants').doc(docId));
            });

            // Update canonical subcollection docs
            canonicalSubVariantsToKeep.forEach(({ ref, data, needsSave }) => {
              if (needsSave || subDocIdsToDelete.size > 0) {
                batch.set(ref, data, { merge: true });
              }
            });

            // Update parent product doc inline variants array
            batch.update(pDoc.ref, {
              variants: cleanedInlineArray,
              updatedAt: new Date().toISOString(),
            });

            await batch.commit();
          }
        }
      })
    );
  }

  console.log(`\n=== REGULARIZATION SUMMARY ===`);
  console.log(`DryRun Mode: ${dryRun}`);
  console.log(`Products Updated/Regularized: ${totalProductsUpdated}`);
  console.log(`Duplicate Variant Documents Removed: ${totalDuplicatesDeleted}`);
  console.log(`Dosage Strings Cleaned (removed '/ vial'): ${totalDosagesCleaned}`);
  console.log(`Fagron Iberia Formats Reclassified: ${totalFagronReclassified}`);
  console.log(`✅ DATABASE REGULARIZATION COMPLETE!`);
}

regularizeDatabase(false).catch(console.error);
