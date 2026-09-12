import { algoliasearch } from 'algoliasearch';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'b3a78c3cf33841e6676a0da714800e0f';

if (!getApps().length) {
  const sa = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
  initializeApp({ credential: cert(sa) });
}
const db = getFirestore();
const client = algoliasearch(APP_ID, ADMIN_KEY);

const SENSITIVE_FINANCIAL_KEYS = [
  'supplierCost', 'supplierUnitCostUSD', 'cost', 'costUSD', 'unitCost',
  'wholesalePrice', 'margin', 'marginPercent', 'markup', 'profit',
  'supplierKitCostUSD', 'price_per_kit_10', 'price_per_kit_50', 'price_per_kit_100',
  'zoho_item_id', 'zoho_vendor_id', 'internalNotes'
];

async function asyncPool(limit, items, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function runAudit() {
  console.log('=== AUDITORÍA INTEGRAL: FIRESTORE, ESQUEMA Y ALGOLIA ===\n');

  // 1. Audit Firestore Products
  const snap = await db.collection('products').get();
  console.log(`[Firestore] Total productos encontrados: ${snap.size}`);

  const productsBySlug = new Map();
  const productsByCanonicalKey = new Map();
  const duplicateSlugs = [];
  const statusCounts = {};
  const productsWithVariantsSummary = [];
  const sensitiveFieldLeaks = [];
  const draftOrUnpublishedWithPublishedFlag = [];

  // Parallel fetch variants for all docs with concurrency 25
  const docVariantMap = new Map();
  console.log('📦 Obteniendo subcolecciones de variantes en paralelo...');
  await asyncPool(25, snap.docs, async (doc) => {
    try {
      const varSnap = await doc.ref.collection('variants').get();
      docVariantMap.set(doc.id, varSnap.docs.map(v => ({ id: v.id, ...v.data() })));
    } catch (e) {
      docVariantMap.set(doc.id, []);
    }
  });
  console.log('✅ Variantes obtenidas.\n');

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;
    const slug = data.slug || id;
    const canonicalKey = data.canonicalKey || slug;
    const status = data.status || 'unknown';

    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // Check slug duplicates
    if (productsBySlug.has(slug)) {
      duplicateSlugs.push({ slug, ids: [productsBySlug.get(slug), id] });
    } else {
      productsBySlug.set(slug, id);
    }

    // Check canonicalKey duplicates
    if (!productsByCanonicalKey.has(canonicalKey)) {
      productsByCanonicalKey.set(canonicalKey, []);
    }
    productsByCanonicalKey.get(canonicalKey).push({ id, slug, status, name: data.name });

    // Check variants
    const rawVariants = Array.isArray(data.variants) ? data.variants : [];
    const subVariants = docVariantMap.get(id) || [];
    const allVariants = subVariants.length > 0 ? subVariants : rawVariants;
    
    // Check variant duplicates inside this product
    const variantKeys = new Map();
    const variantDuplicates = [];
    allVariants.forEach(v => {
      const vKey = `${v.supplierId || v.supplier || 'unk'}::${v.format || v.presentation || 'unk'}::${v.dosage || v.dose || v.strength || 'unk'}`;
      if (variantKeys.has(vKey)) {
        variantDuplicates.push({ key: vKey, v1: variantKeys.get(vKey).id, v2: v.id });
      } else {
        variantKeys.set(vKey, v);
      }
    });

    if (variantDuplicates.length > 0) {
      productsWithVariantsSummary.push({
        id,
        slug,
        name: data.name || data.canonicalName,
        status,
        variantsCount: allVariants.length,
        duplicateVariants: variantDuplicates,
      });
    }

    // Check for draft/inactive with published: true or conflicting published flags
    if (data.status === 'draft' || data.status === 'inactive' || data.isActive === false) {
      if (data.isPublished === true || data.published === true) {
        draftOrUnpublishedWithPublishedFlag.push({ id, name: data.name, status: data.status, isActive: data.isActive });
      }
    }
  }

  console.log('--- 1. Resumen de Estados en Firestore ---');
  console.log(JSON.stringify(statusCounts, null, 2));

  console.log('\n--- 2. Slugs Duplicados en Firestore ---');
  if (duplicateSlugs.length === 0) {
    console.log('✅ Ningún slug duplicado en Firestore.');
  } else {
    console.log(`⚠️ Se encontraron ${duplicateSlugs.length} slugs duplicados:`, duplicateSlugs);
  }

  console.log('\n--- 3. CanonicalKeys con múltiples documentos Firestore ---');
  let duplicateCanonicalCount = 0;
  for (const [key, docs] of productsByCanonicalKey.entries()) {
    if (docs.length > 1) {
      duplicateCanonicalCount++;
      console.log(`⚠️ CanonicalKey "${key}" tiene ${docs.length} productos:`, docs);
    }
  }
  if (duplicateCanonicalCount === 0) {
    console.log('✅ Ningún canonicalKey con documentos duplicados.');
  }

  console.log('\n--- 4. Variantes Duplicadas dentro de un mismo producto en Firestore ---');
  if (productsWithVariantsSummary.length === 0) {
    console.log('✅ Ningún producto con variantes duplicadas internamente.');
  } else {
    console.log(`⚠️ ${productsWithVariantsSummary.length} productos con variantes duplicadas internamente:`);
    console.log(JSON.stringify(productsWithVariantsSummary, null, 2));
  }

  // 2. Audit Algolia `products` Index
  console.log('\n--- 5. Auditoría de Algolia (Índice `products`) ---');
  let algoliaHits = [];
  try {
    const searchRes = await client.searchSingleIndex({
      indexName: 'products',
      searchParams: {
        query: '',
        hitsPerPage: 1000,
        distinct: false, // Don't collapse, inspect every single record
      }
    });
    algoliaHits = searchRes.hits || [];
    console.log(`[Algolia] Total registros indexados: ${algoliaHits.length}`);
  } catch (err) {
    console.error('Error al consultar Algolia:', err.message);
  }

  const algoliaByObjectId = new Map();
  const algoliaByCanonicalKey = new Map();
  const orphanAlgoliaRecords = [];
  const algoliaSensitiveLeaks = [];
  const algoliaDraftRecords = [];

  algoliaHits.forEach(h => {
    algoliaByObjectId.set(h.objectID, h);
    
    // Check if exists in Firestore
    const fsDoc = snap.docs.find(d => d.id === h.objectID);
    if (!fsDoc) {
      orphanAlgoliaRecords.push({
        objectID: h.objectID,
        name: h.name,
        canonicalKey: h.canonicalKey,
        supplier: h.supplier || h.supplierName,
      });
    }

    // Check if draft/inactive in Algolia
    if (h.status === 'draft' || h.status === 'inactive' || h.isActive === false) {
      algoliaDraftRecords.push({ objectID: h.objectID, name: h.name, status: h.status, isActive: h.isActive });
    }

    // Check for sensitive fields in Algolia
    const leakedKeys = SENSITIVE_FINANCIAL_KEYS.filter(k => h[k] !== undefined && h[k] !== null);
    if (leakedKeys.length > 0) {
      algoliaSensitiveLeaks.push({ objectID: h.objectID, name: h.name, leakedKeys });
    }

    const cKey = h.canonicalKey || h.objectID;
    if (!algoliaByCanonicalKey.has(cKey)) algoliaByCanonicalKey.set(cKey, []);
    algoliaByCanonicalKey.get(cKey).push(h);
  });

  console.log('\n--- 6. Huérfanos en Algolia (no existen en Firestore) ---');
  if (orphanAlgoliaRecords.length === 0) {
    console.log('✅ Cero registros huérfanos en Algolia.');
  } else {
    console.log(`⚠️ ${orphanAlgoliaRecords.length} registros huérfanos en Algolia:`);
    console.log(JSON.stringify(orphanAlgoliaRecords, null, 2));
  }

  console.log('\n--- 7. Registros Duplicados por canonicalKey en Algolia ---');
  let algoliaCanonicalDupes = 0;
  for (const [key, hits] of algoliaByCanonicalKey.entries()) {
    if (hits.length > 1) {
      algoliaCanonicalDupes++;
      console.log(`⚠️ Algolia canonicalKey "${key}" (${hits.length} hits):`, hits.map(h => ({ objectID: h.objectID, name: h.name, supplier: h.supplierName })));
    }
  }
  if (algoliaCanonicalDupes === 0) {
    console.log('✅ Cero canonicalKeys duplicados en Algolia.');
  }

  console.log('\n--- 8. Registros Draft o Inactivos en Algolia ---');
  if (algoliaDraftRecords.length === 0) {
    console.log('✅ Ningún producto draft o inactivo en Algolia.');
  } else {
    console.log(`⚠️ ${algoliaDraftRecords.length} productos draft o inactivos en Algolia:`);
    console.log(JSON.stringify(algoliaDraftRecords, null, 2));
  }

  console.log('\n--- 9. Fugas de Datos Financieros/Privados en Algolia ---');
  if (algoliaSensitiveLeaks.length === 0) {
    console.log('✅ CERO fugas de datos sensibles (costos, márgenes, notas) en Algolia.');
  } else {
    console.log(`⚠️ FUGAS ENCONTRADAS en Algolia:`, algoliaSensitiveLeaks);
  }

  console.log('\n=== AUDITORÍA FINALIZADA CON ÉXITO ===');
}

runAudit().catch(err => {
  console.error('Error fatal en auditoría:', err);
  process.exit(1);
});
