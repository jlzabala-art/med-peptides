/**
 * auditSemanticFields.mjs
 *
 * Audits all products in Firestore (Med-Peptides-app) and reports
 * which semantic fields are missing or empty for each product.
 *
 * Fields checked (used by searchEngine.js for scoring):
 *   - goals[]          → +intentBoost (high impact)
 *   - searchAliases[]  → +10
 *   - semanticKeywords[] → +4
 *   - synonyms[]       → +4
 *   - secondaryFactors[] → +3
 *   - mechanisms[]     → +2
 *   - tags[]           → +2
 *
 * Run: node scripts/auditSemanticFields.mjs
 */

import { db } from './lib/firebase-admin.mjs';


// Fields to check and their search score weight
const SEMANTIC_FIELDS = [
  { field: 'goals',            weight: 'HIGH  (+intentBoost)' },
  { field: 'searchAliases',    weight: 'HIGH  (+10)'          },
  { field: 'semanticKeywords', weight: 'MED   (+4)'           },
  { field: 'synonyms',         weight: 'MED   (+4)'           },
  { field: 'secondaryFactors', weight: 'LOW   (+3)'           },
  { field: 'mechanisms',       weight: 'LOW   (+2)'           },
  { field: 'tags',             weight: 'LOW   (+2)'           },
];

function isEmpty(val) {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  return false;
}

async function runAudit() {
  console.log('🔍 Fetching products from Firestore...\n');

  const snap = await db.collection('products').get();
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`📦 Total products found: ${products.length}\n`);
  console.log('='.repeat(80));

  const summary = {
    fullyEnriched: [],
    partiallyMissing: [],
    fullyMissing: [],
  };

  const fieldMissingCount = {};
  SEMANTIC_FIELDS.forEach(({ field }) => { fieldMissingCount[field] = 0; });

  for (const product of products) {
    const name = product.displayName || product.name || product.id;
    const missingFields = [];
    const presentFields = [];

    for (const { field, weight } of SEMANTIC_FIELDS) {
      if (isEmpty(product[field])) {
        missingFields.push({ field, weight });
        fieldMissingCount[field]++;
      } else {
        presentFields.push(field);
      }
    }

    const totalFields = SEMANTIC_FIELDS.length;
    const missingCount = missingFields.length;

    if (missingCount === 0) {
      summary.fullyEnriched.push(name);
    } else if (missingCount === totalFields) {
      summary.fullyMissing.push({ name, id: product.id });
    } else {
      summary.partiallyMissing.push({ name, id: product.id, missingFields });
    }
  }

  // ── REPORT ─────────────────────────────────────────────────────────────────

  console.log('\n✅ FULLY ENRICHED (all semantic fields present):');
  if (summary.fullyEnriched.length === 0) {
    console.log('   (none)');
  } else {
    summary.fullyEnriched.forEach(n => console.log(`   • ${n}`));
  }

  console.log('\n⚠️  PARTIALLY MISSING:');
  if (summary.partiallyMissing.length === 0) {
    console.log('   (none)');
  } else {
    summary.partiallyMissing.forEach(({ name, id, missingFields }) => {
      console.log(`\n   📌 ${name}  [id: ${id}]`);
      missingFields.forEach(({ field, weight }) => {
        console.log(`      ✗ ${field.padEnd(20)} ${weight}`);
      });
    });
  }

  console.log('\n❌ FULLY MISSING (no semantic fields at all):');
  if (summary.fullyMissing.length === 0) {
    console.log('   (none)');
  } else {
    summary.fullyMissing.forEach(({ name, id }) => {
      console.log(`   • ${name}  [id: ${id}]`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 FIELD COVERAGE SUMMARY (how many products are missing each field):');
  console.log(`   Total products: ${products.length}\n`);
  for (const { field, weight } of SEMANTIC_FIELDS) {
    const missing = fieldMissingCount[field];
    const present = products.length - missing;
    const pct = ((present / products.length) * 100).toFixed(0);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`   ${field.padEnd(20)} [${bar}] ${pct}% present  (missing: ${missing})  ${weight}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 PRIORITY ACTIONS:');
  const priorityFields = ['goals', 'searchAliases', 'semanticKeywords', 'synonyms'];
  const highPriorityMissing = summary.fullyMissing.concat(
    summary.partiallyMissing.filter(p =>
      p.missingFields.some(f => priorityFields.includes(f.field))
    )
  );
  console.log(`   ${highPriorityMissing.length} products need high-impact semantic enrichment:`);
  highPriorityMissing.forEach(({ name }) => console.log(`   → ${name}`));

  process.exit(0);
}

runAudit().catch(err => {
  console.error('❌ Audit failed:', err.message);
  process.exit(1);
});
