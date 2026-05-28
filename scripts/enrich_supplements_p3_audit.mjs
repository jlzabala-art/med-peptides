#!/usr/bin/env node
/**
 * enrich_supplements_p3_audit.mjs  —  Phase 3 (Read-Only Audit)
 *
 * Reads every document in Firestore `supplements/` and produces a
 * coverage report showing:
 *   - Which canonical goals each supplement covers
 *   - Supplements with NO canonical goals (need attention)
 *   - Distribution across the 7 goals
 *
 * No writes — safe to run at any time.
 *
 * Usage:
 *   node scripts/enrich_supplements_p3_audit.mjs
 *   node scripts/enrich_supplements_p3_audit.mjs --show-all   # verbose
 *
 * Run AFTER Phase 2 (enrich_supplements_p2_goals.mjs).
 */

import { db } from './lib/firebase-admin.mjs';

const SHOW_ALL = process.argv.includes('--show-all');

const CANONICAL_LABELS = {
  cognitive_mood:       '🧠  Cognitive & Mood',
  hormonal_optimization:'⚡  Hormonal Optimization',
  immune_support:       '🛡️  Immune Support',
  longevity_anti_aging: '⏳  Longevity & Anti-Aging',
  metabolic_weight:     '🔥  Metabolic & Weight',
  recovery_repair:      '💪  Recovery & Repair',
  sleep_circadian:      '🌙  Sleep & Circadian',
};

async function run() {
  console.log('\n📊  Supplement Goals — Phase 3 Audit');
  console.log('─────────────────────────────────────────────────\n');

  const snap = await db.collection('supplements').get();
  if (snap.empty) {
    console.error('❌  supplements/ is empty — run Phase 1 and Phase 2 first.');
    process.exit(1);
  }

  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`📋  Total supplements in Firestore: ${docs.length}\n`);

  // ── Counters ──────────────────────────────────────────────────────────────
  const goalCount   = Object.fromEntries(Object.keys(CANONICAL_LABELS).map(k => [k, 0]));
  const noGoals     = [];
  const covered     = [];

  for (const doc of docs) {
    const canonical = Array.isArray(doc.canonicalGoals) ? doc.canonicalGoals : [];
    if (canonical.length === 0) {
      noGoals.push(doc);
    } else {
      covered.push(doc);
      for (const g of canonical) {
        if (g in goalCount) goalCount[g]++;
      }
    }
  }

  // ── Per-supplement detail ─────────────────────────────────────────────────
  if (SHOW_ALL || noGoals.length > 0) {
    console.log('── Supplement Detail ─────────────────────────────');
    for (const doc of docs) {
      const canonical = Array.isArray(doc.canonicalGoals) ? doc.canonicalGoals : [];
      const legacy    = Array.isArray(doc.goals) ? doc.goals : [];
      const status    = canonical.length ? '✅' : '❌';
      if (SHOW_ALL || canonical.length === 0) {
        console.log(`  ${status}  ${doc.name || doc.id}`);
        console.log(`       category      : ${doc.category || '—'}`);
        console.log(`       legacy goals  : [${legacy.join(', ') || 'none'}]`);
        console.log(`       canonicalGoals: [${canonical.join(', ') || 'NONE — needs Phase 2'}]`);
      }
    }
    console.log();
  }

  // ── Goal distribution ─────────────────────────────────────────────────────
  console.log('── Canonical Goal Distribution ───────────────────');
  const maxCount = Math.max(...Object.values(goalCount), 1);
  for (const [goal, label] of Object.entries(CANONICAL_LABELS)) {
    const count = goalCount[goal];
    const bar   = '█'.repeat(Math.round((count / maxCount) * 20));
    console.log(`  ${label.padEnd(28)} ${String(count).padStart(3)}  ${bar}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n── Summary ───────────────────────────────────────');
  console.log(`  ✅  With canonical goals   : ${covered.length}`);
  console.log(`  ❌  Missing canonical goals: ${noGoals.length}`);
  if (noGoals.length) {
    console.log('\n  Supplements needing Phase 2:');
    for (const d of noGoals) console.log(`    - ${d.name || d.id} (${d.category || 'no category'})`);
    console.log('\n  ▶  Run: node scripts/enrich_supplements_p2_goals.mjs');
  } else {
    console.log('\n  🎉  All supplements have canonical goals — migration complete!');
  }
  console.log('\n  Tip: re-run with --show-all to see every supplement detail.\n');
}

run().catch(err => { console.error('❌  Fatal:', err); process.exit(1); });
