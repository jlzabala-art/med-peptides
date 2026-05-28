/**
 * probe_ai_fields.mjs — quick audit of AI content fields on sample products
 * node scripts/probe_ai_fields.mjs
 */
import { db } from './lib/firebase-admin.mjs';

const AI_KEYS = [
  'aiContent',
  'faqModalItems',
  'faqModalEnabled',
  'scientificModalEnabled',
  'summary',
  'beginnerExplanation',
  'scientificSummary',
];

async function main() {
  const snap = await db.collection('products').limit(10).get();

  for (const d of snap.docs) {
    const data = d.data();
    console.log('\n───', d.id);
    for (const k of AI_KEYS) {
      const v = data[k];
      if (v === undefined) {
        console.log(`  ${k.padEnd(26)}: (missing)`);
      } else if (Array.isArray(v)) {
        console.log(`  ${k.padEnd(26)}: [${v.length} items]`);
      } else if (v !== null && typeof v === 'object') {
        const keys = Object.keys(v);
        console.log(`  ${k.padEnd(26)}: {${keys.join(', ')}} → ${JSON.stringify(v).slice(0, 120)}`);
      } else {
        console.log(`  ${k.padEnd(26)}: ${String(v).slice(0, 100)}`);
      }
    }
  }

  // Also count coverage across all products
  console.log('\n\n══ Coverage across ALL products ══');
  const all = await db.collection('products').get();
  const total = all.size;
  const counts = {};
  for (const k of AI_KEYS) counts[k] = 0;

  for (const d of all.docs) {
    const data = d.data();
    for (const k of AI_KEYS) {
      const v = data[k];
      if (v !== undefined && v !== null && v !== '') {
        if (!Array.isArray(v) || v.length > 0) counts[k]++;
      }
    }
  }

  for (const k of AI_KEYS) {
    const pct = Math.round((counts[k] / total) * 100);
    const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
    console.log(`  ${k.padEnd(26)} [${bar}] ${pct}% (${counts[k]}/${total})`);
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
