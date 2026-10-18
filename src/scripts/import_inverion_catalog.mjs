import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// ── 1. Init Firebase Admin ──────────────────────────────────────────────────
const SA_PATHS = [
  './src/scripts/serviceAccountKey.json',
  './serviceAccount-target.json',
  './serviceAccount.json',
  './serviceAccountKey.json',
];

let initialized = false;
for (const p of SA_PATHS) {
  if (existsSync(p)) {
    try {
      const sa = JSON.parse(readFileSync(p, 'utf-8'));
      if (getApps().length === 0) {
        initializeApp({ credential: cert(sa) });
      }
      initialized = true;
      console.log(`✅ Firebase Admin initialized using: ${p}`);
      break;
    } catch (e) {
      console.warn(`Failed reading ${p}:`, e.message);
    }
  }
}

if (!initialized && getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Helper to slugify
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function run() {
  console.log('🚀 Starting Inverion Healthcare 2026 API Catalog Import...');

  // ── 2. Read Catalog Data ────────────────────────────────────────────────────
  const catalogPath = path.resolve('src/data/inverion_catalog_2026.json');
  if (!existsSync(catalogPath)) {
    throw new Error(`Catalog file not found at ${catalogPath}`);
  }
  const catalogData = JSON.parse(readFileSync(catalogPath, 'utf-8'));
  const items = catalogData.items || [];
  console.log(`📦 Loaded ${items.length} items from Inverion 2026 API Catalog.`);

  // ── 3. Fetch Existing Products for Deduplication & Cross-Supplier Matching ─
  const productsSnap = await db.collection('products').get();
  console.log(`🔍 Existing database products: ${productsSnap.size}`);

  const productMap = new Map(); // key -> { id, ref, data }
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const names = [
      data.name,
      data.displayName,
      data.canonicalName,
      data.canonicalKey,
      doc.id
    ].filter(Boolean);

    for (const n of names) {
      const key = String(n).toLowerCase().trim();
      if (!productMap.has(key)) {
        productMap.set(key, { id: doc.id, ref: doc.ref, data });
      }
    }
  }

  let createdProducts = 0;
  let updatedExistingProducts = 0;
  let totalVariantsCreated = 0;

  // Process in batches
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let opCount = 0;

  async function commitBatchIfNeeded() {
    if (opCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`  💾 Committed batch (${opCount} ops)`);
      batch = db.batch();
      opCount = 0;
    }
  }

  const nowIso = new Date().toISOString();

  for (const item of items) {
    const itemName = item.name.trim();
    const itemKey = itemName.toLowerCase();
    const itemSlug = slugify(itemName);
    const primaryGrade = item.grades?.[0] || 'USP';
    const physicalForm = item.physicalForms ? item.physicalForms.join('/') : 'standard';

    const existing = productMap.get(itemKey) || productMap.get(itemSlug);

    let targetDocId;
    let targetDocRef;

    if (existing) {
      // ── Update existing product ──
      targetDocId = existing.id;
      targetDocRef = existing.ref;
      const currentSuppliers = Array.isArray(existing.data.supplierIds) ? existing.data.supplierIds : [];
      const updatedSuppliers = Array.from(new Set([...currentSuppliers, 'supplier-inverion']));
      const currentGrades = Array.isArray(existing.data.grades) ? existing.data.grades : [];
      const mergedGrades = Array.from(new Set([...currentGrades, ...(item.grades || [])]));

      batch.update(targetDocRef, {
        supplierIds: updatedSuppliers,
        grades: mergedGrades,
        pharmacopoeias: mergedGrades,
        'regulatoryDossier.dmfAvailable': true,
        'regulatoryDossier.cepAvailable': true,
        updatedAt: nowIso
      });
      opCount++;
      updatedExistingProducts++;
    } else {
      // ── Create new product ──
      targetDocId = `${itemSlug}_api`;
      targetDocRef = db.collection('products').doc(targetDocId);

      const newProductDoc = {
        name: itemName,
        displayName: itemName,
        canonicalName: itemName,
        canonicalKey: itemSlug,
        type: 'raw_material',
        productType: 'raw_material',
        primaryType: 'raw_material',
        availableTypes: ['raw_material'],
        isHybrid: false,
        categoryId: item.canonicalCategory || 'raw_material',
        category: item.canonicalCategory || 'raw_material',
        therapeuticCategory: item.category || 'API',
        status: 'active',
        isActive: true,
        supplierIds: ['supplier-inverion'],
        grades: item.grades || [],
        primaryGrade: primaryGrade,
        pharmacopoeias: item.grades || [],
        physicalForm: physicalForm,
        regulatoryDossier: {
          dmfAvailable: true,
          cepAvailable: true,
          batchTested: true,
          sourceCatalog: '2026 API STANDARD CATALOG',
          supplierId: 'supplier-inverion'
        },
        variantsCount: 1,
        _schemaVersion: 2,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      batch.set(targetDocRef, newProductDoc);
      opCount++;
      createdProducts++;

      // Register in local map to avoid double creates
      productMap.set(itemKey, { id: targetDocId, ref: targetDocRef, data: newProductDoc });
      productMap.set(targetDocId.toLowerCase(), { id: targetDocId, ref: targetDocRef, data: newProductDoc });
    }

    // ── Create variant in sub-collection ──
    const variantId = `var_inv_${itemSlug}`.slice(0, 50);
    const variantRef = targetDocRef.collection('variants').doc(variantId);

    const variantDoc = {
      id: variantId,
      productId: targetDocId,
      supplierId: 'supplier-inverion',
      supplier: 'Inverion Healthcare',
      sku: `INV-${itemSlug.toUpperCase().replace(/-/g, '').slice(0, 15)}-RAW`,
      presentation: `Bulk API (${item.grades?.join('/') || 'Standard'})`,
      type: 'raw_material',
      grade: primaryGrade,
      grades: item.grades || [],
      physicalForm: physicalForm,
      hasDmf: true,
      hasCep: true,
      stock: {
        available: true,
        quantity: null,
        minAlert: 5
      },
      pricing: {
        master: { perUnit: null, currency: 'USD' },
        wholesale: { perUnit: null, currency: 'USD' },
        clinic: { perUnit: null, currency: 'USD' },
        retail: { perUnit: null, currency: 'USD' }
      },
      isDefault: true,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    batch.set(variantRef, variantDoc, { merge: true });
    opCount++;
    totalVariantsCreated++;

    await commitBatchIfNeeded();
  }

  // ── 4. Update Supplier Doc Statistics ─────────────────────────────────────
  const supplierRef = db.collection('suppliers').doc('supplier-inverion');
  batch.update(supplierRef, {
    productsSupplied: items.length,
    variantsSupplied: totalVariantsCreated,
    catalogName: '2026 API STANDARD CATALOG',
    totalCatalogItems: items.length,
    lastCatalogImportAt: nowIso,
    updatedAt: nowIso
  });
  opCount++;

  // ── 5. Register in Atlas Ecosystem Knowledge Base ─────────────────────────
  const atlasKnowledgeRef = db.collection('atlas_knowledge').doc('supplier_inverion_healthcare');
  batch.set(atlasKnowledgeRef, {
    id: 'supplier_inverion_healthcare',
    supplierId: 'supplier-inverion',
    entityName: 'Inverion Healthcare',
    title: 'Inverion Healthcare — Global API & Raw Material Sourcing Intelligence',
    category: 'api_supplier_intelligence',
    verifiedSince: 2000,
    hubs: ['United States', 'Dubai (UAE)', 'Singapore', 'GIFT City (India)'],
    contact: 'engage@inverion.net',
    website: 'https://www.inverion.net',
    catalogTitle: '2026 API STANDARD CATALOG',
    totalReferences: items.length,
    coreCapabilities: [
      'Certified API & bulk raw materials sourcing',
      'Batch-tested compliance with IP, BP, USP, EP and Int Ph standards',
      'Full regulatory dossiers including Drug Master Files (DMF) and Certificates of Suitability (CEP)',
      'Temperature-controlled cold-chain international pharma logistics'
    ],
    distinctionNotes: 'Inverion Healthcare is a bulk API trading house & manufacturer partner, NOT a finished compounding pharmacy (unlike NP Labs which produces finished capsules/vials).',
    indexedAt: nowIso,
    tags: ['api', 'raw_material', 'excipient', 'pharma_grade', 'dmf', 'cep', 'inverion']
  }, { merge: true });
  opCount++;

  if (opCount > 0) {
    await batch.commit();
    console.log(`  💾 Final batch committed (${opCount} ops).`);
  }

  console.log('\n Import Completed Successfully!');
  console.log(`   - New Products Created: ${createdProducts}`);
  console.log(`   - Existing Products Updated: ${updatedExistingProducts}`);
  console.log(`   - Variants Created/Linked: ${totalVariantsCreated}`);
  console.log(`   - Supplier Record & Atlas Knowledge Synced.`);
}

run().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
