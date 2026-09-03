import { db } from './lib/firebase-admin.mjs';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Merge "Semax + Selank" and "Selank + Semax" into one canonical product.
 * Strategy:
 *  - Keep the product with MORE variants as master.
 *  - Move all variants from the duplicate into the master's subcollection.
 *  - Update the master's variant count and summary fields.
 *  - Delete the duplicate product document.
 */
async function mergeSelankSemax() {
  console.log('--- SEARCHING FOR SEMAX+SELANK DUPLICATES ---\n');

  const snap = await db.collection('products').get();
  const candidates = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const name = (d.name || '').toLowerCase().replace(/\s+/g, '');
    // Match any ordering of semax+selank
    if (
      (name.includes('semax') && name.includes('selank')) ||
      (name.includes('selank') && name.includes('semax'))
    ) {
      candidates.push({ id: doc.id, name: d.name, data: d });
      console.log(`Found: [${doc.id}] "${d.name}"`);
    }
  }

  if (candidates.length < 2) {
    console.log('Less than 2 candidates found — nothing to merge.');
    return;
  }

  // Fetch variants for each candidate
  const withVariants = await Promise.all(
    candidates.map(async (p) => {
      const vSnap = await db.collection('products').doc(p.id).collection('variants').get();
      const variants = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log(`  [${p.id}] has ${variants.length} subcollection variant(s)`);
      variants.forEach(v => console.log(`    - ${v.id} | ${v.dosage || v.dose || v.strength} | ${v.presentation || v.format} | $${v.unit_price || v.price}`));
      return { ...p, variants };
    })
  );

  // Sort: most variants first → master; least variants → duplicate to merge
  withVariants.sort((a, b) => b.variants.length - a.variants.length);
  const master = withVariants[0];
  const duplicates = withVariants.slice(1);

  console.log(`\n✅ Master: [${master.id}] "${master.name}" (${master.variants.length} variants)`);
  duplicates.forEach(d => console.log(`🗑️  Duplicate: [${d.id}] "${d.name}" (${d.variants.length} variants)`));

  // Canonical name: prefer alphabetical first ingredient first ("Selank + Semax" or "Semax + Selank")
  // Use master's name as canonical
  const canonicalName = master.name;

  // Move variants from each duplicate into master subcollection
  for (const dup of duplicates) {
    for (const v of dup.variants) {
      const { id, ...vData } = v;
      // Check if a variant with same id or same dosage+presentation+supplier already exists in master
      const existingMatch = master.variants.find(mv =>
        mv.id === id ||
        (
          String(mv.dosage || mv.dose || '').toLowerCase() === String(vData.dosage || vData.dose || '').toLowerCase() &&
          String(mv.presentation || mv.format || '').toLowerCase() === String(vData.presentation || vData.format || '').toLowerCase() &&
          String(mv.supplierId || mv.supplier || '').toLowerCase() === String(vData.supplierId || vData.supplier || '').toLowerCase()
        )
      );

      if (existingMatch) {
        console.log(`  ⚠️  Skipping duplicate variant (already exists in master): ${id}`);
        continue;
      }

      const targetRef = db.collection('products').doc(master.id).collection('variants').doc(id);
      await targetRef.set({
        ...vData,
        movedFrom: dup.id,
        movedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Moved variant ${id} from [${dup.id}] → [${master.id}]`);
    }

    // Delete duplicate product document
    await db.collection('products').doc(dup.id).delete();
    console.log(`  🗑️  Deleted product document: [${dup.id}]`);
  }

  // Refresh master variant count
  const updatedVSnap = await db.collection('products').doc(master.id).collection('variants').get();
  const newCount = updatedVSnap.size;

  await db.collection('products').doc(master.id).update({
    name: canonicalName,
    variantCount: newCount,
    updatedAt: new Date().toISOString(),
  });

  console.log(`\n✅ DONE. Master product [${master.id}] "${canonicalName}" now has ${newCount} variant(s).`);
}

mergeSelankSemax()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
