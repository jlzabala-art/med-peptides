/**
 * seed-presentations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to seed the `presentations` Firestore collection
 * from the static PRODUCT_FORMATS config.
 * 
 * HOW TO RUN (from the project root):
 *   node scripts/seed-presentations.js
 * 
 * Requires: firebase-admin, GOOGLE_APPLICATION_CREDENTIALS env var set,
 * OR run via the in-app "Seed" button in Admin > Settings > Presentaciones.
 */

const PRODUCT_FORMATS = [
  { id: 'vial', label: 'Vial' },
  { id: 'prefilled_pen', label: 'Pre-filled Pen' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'cream', label: 'Cream' },
  { id: 'nasal_spray', label: 'Nasal Spray' },
  { id: 'troche', label: 'Troche' },
  { id: 'sublingual', label: 'Sublingual Drops' },
  { id: 'patch', label: 'Patch' },
  { id: 'gummy', label: 'Gummy' },
  { id: 'powder', label: 'Powder' },
];

// --- For use in-browser (via Firebase client SDK) ---
// Import this function and call it once from the browser console or a dev tool
export async function seedPresentations(db) {
  const { collection, getDocs, setDoc, doc, serverTimestamp } = await import('firebase/firestore');
  
  console.log('🌱 Seeding presentations collection...');
  const existingSnap = await getDocs(collection(db, 'presentations'));
  const existingIds = new Set(existingSnap.docs.map(d => d.id));

  let created = 0;
  let skipped = 0;
  
  for (const format of PRODUCT_FORMATS) {
    if (existingIds.has(format.id)) {
      console.log(`  ⚡ Skip (exists): ${format.id}`);
      skipped++;
      continue;
    }
    await setDoc(doc(db, 'presentations', format.id), {
      name: format.label,
      legacyId: format.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'seed-script',
    });
    console.log(`  ✅ Created: ${format.label}`);
    created++;
  }
  
  console.log(`\n✅ Done! Created: ${created} | Skipped (already exists): ${skipped}`);
  return { created, skipped };
}
