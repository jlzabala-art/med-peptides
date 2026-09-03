/**
 * seed_ultraperson_apis.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches and tags all 72 Ultraperson Test active ingredients (APIs)
 * in Firestore with:
 *   - tags: ['Ultraperson', 'ultraperson', 'Ultraperson Test']
 *   - programs: [{ id: 'ultraperson', slug: 'ultraperson', name: 'Ultraperson Test', priority: 'A', ... }]
 *   - searchAliases: exact test string variants
 *
 * Usage:
 *   node src/scripts/seed_ultraperson_apis.js --dry-run
 *   node src/scripts/seed_ultraperson_apis.js --execute
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

export const ULTRAPERSON_API_LIST = [
  { raw: 'Acetylcysteine (N-Acetylcysteine)', preferredId: 'n-acetylcysteine', fallbackId: 'l-cysteine' },
  { raw: 'Arginine', preferredId: 'arginine' },
  { raw: 'Artichoke dry extract (Cynara scolymus)', preferredId: 'artichoke-extract' },
  { raw: 'Astaxanthin', preferredId: 'astaxanthin' },
  { raw: 'Bifidobacterium adolescentis', preferredId: 'bifidobacterium-adolescentis' },
  { raw: 'Bifidobacterium infantis', preferredId: 'bifidobacterium-infantis' },
  { raw: 'Bifidobacterium longum', preferredId: 'bifidobacterium-longum' },
  { raw: 'Biotin', preferredId: 'biotin' },
  { raw: 'Black Raphanus dry extract (Raphanus sativus L. var. niger)', preferredId: 'black-raphanus-extract' },
  { raw: 'CitrusiM®', preferredId: 'citrusim' },
  { raw: 'Coenzyme Q10', preferredId: 'ubiquinol', fallbackId: 'coenzyme-q10' },
  { raw: 'Colecalciferol (Vit. D3)', preferredId: 'vitamin-d3' },
  { raw: 'Cooper (as gluconate or chelate)', preferredId: 'copper-gluconate', fallbackId: 'copper-bisglycinate' },
  { raw: 'Cureit®a', preferredId: 'cureit' },
  { raw: 'D-Panthenol', preferredId: 'd-panthenol', fallbackId: 'calcium-pantothenate' },
  { raw: 'Ginkgo biloba', preferredId: 'ginkgo-biloba' },
  { raw: 'Ginseng', preferredId: 'panax-ginseng-extract', fallbackId: 'ginseng' },
  { raw: 'Ginseng dry extract (Panax ginseng)', preferredId: 'panax-ginseng-extract' },
  { raw: 'Glucosamine sulfate', preferredId: 'glucosamine-sulfate' },
  { raw: 'Glutamine (levoglutamine)', preferredId: 'l-glutamine' },
  { raw: 'Glutathione (Reduced glutathione)', preferredId: 'glutathione' },
  { raw: 'Horsetail dry extract (Equisetum arvense)', preferredId: 'horsetail-extract' },
  { raw: 'L-Carnitine L-tartrate', preferredId: 'l-carnitine-l-tartrate' },
  { raw: 'Lactobacillus lactis', preferredId: 'lactobacillus-lactis' },
  { raw: 'Lactobacillus plantarum', preferredId: 'lactobacillus-plantarum' },
  { raw: 'Lactobacillus salivarius', preferredId: 'lactobacillus-salivarius' },
  { raw: 'Magnesium', preferredId: 'magnesium' },
  { raw: 'Manganese', preferredId: 'manganese-gluconate' },
  { raw: 'Melatonin', preferredId: 'melatonin' },
  { raw: 'Methionine', preferredId: 'methionine', fallbackId: 'l-methionine' },
  { raw: 'Niacin (nicotinic acid)', preferredId: 'niacin' },
  { raw: 'Nicotinamide (niacinamide)', preferredId: 'nicotinamide' },
  { raw: 'Omega 3', preferredId: 'omega-3' },
  { raw: 'Oral Coenzyme Q10', preferredId: 'ubiquinol', fallbackId: 'coenzyme-q10' },
  { raw: 'Oral Ginkgo Biloba', preferredId: 'ginkgo-biloba' },
  { raw: 'Oral Green Tea (GreenSelect)', preferredId: 'greenselect-phytosome' },
  { raw: 'Oral Pomage', preferredId: 'pomage' },
  { raw: 'Oral SiliciuMax TM', preferredId: 'siliciumax' },
  { raw: 'Oral Vitamin C', preferredId: 'vitamin-c' },
  { raw: 'Oral Zinc sulfate', preferredId: 'zinc-sulfate' },
  { raw: 'Piperin', preferredId: 'piperin', fallbackId: 'piperine' },
  { raw: 'Pomage', preferredId: 'pomage' },
  { raw: 'Pycnogenol (Pinus pinaster)', preferredId: 'pycnogenol' },
  { raw: 'Pyridoxine HCl (Vit, B6)', preferredId: 'pyridoxine-hcl' },
  { raw: 'Resveratrol', preferredId: 'resveratrol' },
  { raw: 'Retinol (Vitamin A)', preferredId: 'retinol-vitamin-a' },
  { raw: 'Saw Palmetto', preferredId: 'saw-palmetto' },
  { raw: 'Selenium (Selenium yeast)', preferredId: 'selenium-yeast' },
  { raw: 'Selenium yeast', preferredId: 'selenium-yeast' },
  { raw: 'SiliciuMax TM', preferredId: 'siliciumax' },
  { raw: 'SiliciuMax® powder', preferredId: 'siliciumax' },
  { raw: 'Silimarin', preferredId: 'silimarin' },
  { raw: 'Sulfate iron', preferredId: 'iron-sulfate' },
  { raw: 'Taurine', preferredId: 'taurine' },
  { raw: 'Tocopherol (vit, E)', preferredId: 'vitamin-e' },
  { raw: 'Turmeric dry extract', preferredId: 'turmeric-extract', fallbackId: 'turmeric-dry-extract' },
  { raw: 'Ubiquinol', preferredId: 'ubiquinol' },
  { raw: 'Valerian dry extract (Valeriana officinalis)', preferredId: 'valerian-extract' },
  { raw: 'Vitamin A', preferredId: 'beta-carotene', fallbackId: 'retinol-vitamin-a' },
  { raw: 'Vitamin B1 (Thiamine hydrochloride)', preferredId: 'thiamine-hcl' },
  { raw: 'Vitamin B12', preferredId: 'vitamin-b12' },
  { raw: 'Vitamin B12 (Cianocobalamin)', preferredId: 'vitamin-b12' },
  { raw: 'Vitamin B2 (Riboflavine)', preferredId: 'riboflavin' },
  { raw: 'Vitamin B5 (as calcium Pantothenate)', preferredId: 'calcium-pantothenate' },
  { raw: 'Vitamin B6 (Pyridoxine hydrochloride)', preferredId: 'pyridoxine-hcl' },
  { raw: 'Vitamin B9 (Methylfolate)', preferredId: 'methylfolate' },
  { raw: 'Vitamin C (Ascorbic Acid)', preferredId: 'vitamin-c' },
  { raw: 'Vitamin D3 (Cholecalciferol)', preferredId: 'vitamin-d3' },
  { raw: 'Vitamin E', preferredId: 'vitamin-e' },
  { raw: 'Vitamin E (Tocoferol)', preferredId: 'vitamin-e' },
  { raw: 'Vitamin K2', preferredId: 'vitamin-k2' },
  { raw: 'Zinc gluconate', preferredId: 'zinc-gluconate' }
];

async function seedUltrapersonAPIs() {
  console.log(`\n======================================================`);
  console.log(`🧬 SEED & ENRICH: Ultraperson Test Active Ingredients`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no writes)' : '⚡ LIVE WRITE TO FIRESTORE'}`);
  console.log(`======================================================\n`);

  const allProductsSnap = await db.collection('products').get();
  const allDocs = allProductsSnap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  let updatedCount = 0;
  let createdCount = 0;
  const processedDocIds = new Set();

  for (const item of ULTRAPERSON_API_LIST) {
    const clean = item.raw.toLowerCase()
      .replace(/®|™|TM/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/^oral\s+/i, '')
      .trim();

    // Find document
    let doc = allDocs.find(d => d.id === item.preferredId);
    if (!doc && item.fallbackId) {
      doc = allDocs.find(d => d.id === item.fallbackId);
    }
    if (!doc) {
      doc = allDocs.find(d => d.id === clean.replace(/[^a-z0-9]+/g, '-'));
    }
    if (!doc) {
      doc = allDocs.find(d => (d.searchAliases || []).some(a => a.toLowerCase() === clean));
    }
    if (!doc) {
      doc = allDocs.find(d => (d.name || '').toLowerCase().includes(clean) || (d.canonicalName || '').toLowerCase().includes(clean));
    }

    if (!doc) {
      // Create new document if completely missing
      const newDocId = item.preferredId || clean.replace(/[^a-z0-9]+/g, '-');
      console.log(`✨ [CREATE NEW] Creating missing product: ${newDocId} (${item.raw})`);

      const newProductData = {
        name: item.raw,
        canonicalName: item.raw.split('(')[0].replace(/®|™|TM/g, '').trim(),
        category: 'raw_material',
        type: 'raw_material',
        status: 'active',
        isActive: true,
        supplier: 'Fagron Iberia',
        supplierIds: ['supplier-fagron-iberia'],
        tags: ['Ultraperson', 'ultraperson', 'Ultraperson Test', 'Nutritional Genomics', 'Compounding API'],
        searchAliases: [item.raw, clean],
        programs: [
          {
            id: 'ultraperson',
            slug: 'ultraperson',
            name: 'Ultraperson Test',
            priority: 'A',
            applicationRoute: item.raw.toLowerCase().startsWith('oral') ? 'Oral' : 'Oral',
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!isDryRun) {
        await db.collection('products').doc(newDocId).set(newProductData);
      }
      createdCount++;
      processedDocIds.add(newDocId);
    } else {
      // Update existing document
      const currentTags = Array.isArray(doc.tags) ? [...doc.tags] : [];
      const currentAliases = Array.isArray(doc.searchAliases) ? [...doc.searchAliases] : [];
      const currentPrograms = Array.isArray(doc.programs) ? [...doc.programs] : [];

      // Add Ultraperson tags
      const tagsToAdd = ['Ultraperson', 'ultraperson', 'Ultraperson Test'];
      for (const t of tagsToAdd) {
        if (!currentTags.includes(t)) {
          currentTags.push(t);
        }
      }

      // Add searchAliases
      if (!currentAliases.includes(item.raw)) {
        currentAliases.push(item.raw);
      }
      if (!currentAliases.includes(clean)) {
        currentAliases.push(clean);
      }

      // Add or update Ultraperson program entry with Priority A
      const existingProgIdx = currentPrograms.findIndex(p => p.id === 'ultraperson' || p.slug === 'ultraperson');
      const progObj = {
        id: 'ultraperson',
        slug: 'ultraperson',
        name: 'Ultraperson Test',
        priority: 'A',
        applicationRoute: item.raw.toLowerCase().startsWith('oral') ? 'Oral' : 'Oral',
        updatedAt: new Date()
      };

      if (existingProgIdx >= 0) {
        currentPrograms[existingProgIdx] = { ...currentPrograms[existingProgIdx], ...progObj };
      } else {
        currentPrograms.push(progObj);
      }

      console.log(`🔄 [ENRICH] ${doc.id}: tagged Ultraperson (Priority A) [Alias: "${item.raw}"]`);

      if (!isDryRun && !processedDocIds.has(doc.id)) {
        await doc.ref.update({
          tags: currentTags,
          searchAliases: currentAliases,
          programs: currentPrograms,
          updatedAt: new Date()
        });
      }

      updatedCount++;
      processedDocIds.add(doc.id);
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ Completed Ultraperson Ingestion:`);
  console.log(`   Unique Docs Enriched/Updated: ${processedDocIds.size}`);
  console.log(`   Total API Items Processed   : ${ULTRAPERSON_API_LIST.length}`);
  console.log(`======================================================\n`);
}

seedUltrapersonAPIs().catch(err => {
  console.error('Error seeding Ultraperson APIs:', err);
  process.exit(1);
});
