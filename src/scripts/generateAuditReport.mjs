import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function normalizeName(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function runDetailedAudit() {
  const productsSnap = await db.collection('products').get();
  const allProducts = [];

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const id = doc.id;
    const name = data.canonicalName || data.name || data.displayName || id;
    const slug = data.slug || id;
    const normName = normalizeName(name);
    const variants = Array.isArray(data.variants) ? data.variants : [];
    allProducts.push({ id, name, slug, normName, status: data.status, variants });
  }

  // 1. Find exact duplicate product docs (same normalized name or slug)
  const byNormName = {};
  const bySlug = {};
  for (const p of allProducts) {
    if (!byNormName[p.normName]) byNormName[p.normName] = [];
    byNormName[p.normName].push({ id: p.id, name: p.name, slug: p.slug, status: p.status, variantsCount: p.variants.length });

    if (p.slug) {
      if (!bySlug[p.slug]) bySlug[p.slug] = [];
      bySlug[p.slug].push({ id: p.id, name: p.name, status: p.status, variantsCount: p.variants.length });
    }
  }

  const duplicateProductGroups = Object.entries(byNormName).filter(([k, v]) => v.length > 1 && k.length > 2);
  const duplicateSlugGroups = Object.entries(bySlug).filter(([k, v]) => v.length > 1);

  // 2. Find internal duplicate variants in each product
  const internalVariantDuplicates = [];

  for (const p of allProducts) {
    if (p.variants.length < 2) continue;
    const seen = new Map();
    const dups = [];

    p.variants.forEach((v, idx) => {
      const supp = (v.supplierId || v.supplierName || v.supplier || '').toLowerCase().trim();
      const fmt = (v.format || v.presentation || '').toLowerCase().trim();
      const dose = (v.dosage || v.dose || '').toLowerCase().trim();
      const price = Number(v.unit_price || v.price || 0).toFixed(2);
      const key = `${supp}:::${fmt}:::${dose}:::${price}`;

      if (seen.has(key)) {
        dups.push({ duplicateIdx: idx, originalIdx: seen.get(key), key });
      } else {
        seen.set(key, idx);
      }
    });

    if (dups.length > 0) {
      internalVariantDuplicates.push({
        id: p.id,
        name: p.name,
        totalVariants: p.variants.length,
        duplicateCount: dups.length,
        dups
      });
    }
  }

  const report = {
    totalProducts: allProducts.length,
    duplicateProductGroups,
    duplicateSlugGroups,
    internalVariantDuplicatesCount: internalVariantDuplicates.length,
    internalVariantDuplicates
  };

  fs.writeFileSync('./src/scripts/audit_report.json', JSON.stringify(report, null, 2));
  console.log(`Report written to ./src/scripts/audit_report.json`);
  console.log(`Duplicate product groups: ${duplicateProductGroups.length}`);
  console.log(`Duplicate slug groups: ${duplicateSlugGroups.length}`);
  console.log(`Products with internal duplicate variants: ${internalVariantDuplicates.length}`);
}

runDetailedAudit().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
