/**
 * scripts/homogenizeProtocolsFirestore.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Homogenizes `protocols` in Firestore to match AGENTS.md Rule #28 and
 * canonical `categoryId` / `evidence_level` taxonomies, then reindexes Algolia.
 *
 * Usage:
 *   node scripts/homogenizeProtocolsFirestore.mjs --dry-run
 *   node scripts/homogenizeProtocolsFirestore.mjs --apply
 */
import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import {
  normalizeProtocolStatus,
  normalizeProtocolCategory,
  normalizeEvidenceLevel,
} from '../src/utils/firestoreModelGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  try {
    const svc = require(path.resolve(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({ credential: admin.credential.cert(svc) });
  } catch {
    admin.initializeApp();
  }
}

const db = admin.firestore();
const isApply = process.argv.includes('--apply');

async function main() {
  const snap = await db.collection('protocols').get();
  const backup = {};
  const updates = [];
  const algoliaRecords = [];

  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const patch = {};

    const isCustom =
      d.isCustomTemplate === true ||
      String(d.protocol_id || '').startsWith('custom_') ||
      d.metadata?.primary_goal === 'custom_prescription' ||
      (Array.isArray(d.goals) && d.goals.includes('custom_prescription'));

    const targetStatus = isCustom ? 'draft' : normalizeProtocolStatus(d.status);
    if (d.status !== targetStatus) patch.status = targetStatus;

    const targetCat = normalizeProtocolCategory(d.categoryId || d.category || d.therapeutic_category);
    if (d.categoryId !== targetCat) patch.categoryId = targetCat;

    const targetEvidence = normalizeEvidenceLevel(d.evidence_level);
    if (d.evidence_level !== targetEvidence) patch.evidence_level = targetEvidence;

    if (!d.name && (d.protocol_title || d.title)) {
      patch.name = d.protocol_title || d.title;
    }
    if (!d.slug && (d.protocol_slug || doc.id)) {
      patch.slug = d.protocol_slug || doc.id;
    }
    if (isCustom && !d.isCustomTemplate) {
      patch.isCustomTemplate = true;
    }
    if (isCustom && (!Array.isArray(d.goals) || d.goals.length === 0)) {
      patch.goals = ['custom_prescription'];
    }
    if (!d.duration_weeks) {
      patch.duration_weeks = 4;
    }
    if (!d._schemaVersion) {
      patch._schemaVersion = 1;
    }
    if (Array.isArray(d.phases) && d.phases.some((p) => Array.isArray(p?.drugs_used) && !Array.isArray(p?.drugs))) {
      patch.phases = d.phases.map((p) => ({
        ...p,
        drugs: Array.isArray(p.drugs) ? p.drugs : (p.drugs_used || []),
      }));
    }

    if (Object.keys(patch).length > 0) {
      backup[doc.id] = d;
      updates.push({ id: doc.id, ref: doc.ref, patch });
    }

    const merged = { ...d, ...patch, id: doc.id };
    algoliaRecords.push({
      objectID: doc.id,
      id: doc.id,
      name: merged.name || merged.protocol_title || 'Untitled Protocol',
      slug: merged.slug || merged.protocol_slug || doc.id,
      status: merged.status || 'draft',
      categoryId: merged.categoryId || 'Recovery & Tissue Repair',
      evidence_level: merged.evidence_level || 'Tier 2 - Clinical Trial / Cohort',
      duration_weeks: Number(merged.duration_weeks || 4),
      goals: Array.isArray(merged.goals) ? merged.goals : [],
      primary_goal: Array.isArray(merged.goals) && merged.goals[0] ? merged.goals[0] : (merged.metadata?.primary_goal || ''),
      isCustomTemplate: Boolean(merged.isCustomTemplate),
      overview_summary: merged.overview_summary || merged.description || '',
      tags: Array.isArray(merged.tags) ? merged.tags : [],
    });
  }

  console.log(`Scanned ${snap.size} protocols. Planned Firestore updates: ${updates.length}`);
  if (updates.length > 0) {
    console.log('Sample updates:', updates.slice(0, 5).map((u) => ({ id: u.id, patchKeys: Object.keys(u.patch), status: u.patch.status, categoryId: u.patch.categoryId, evidence_level: u.patch.evidence_level })));
  }

  if (!isApply) {
    console.log('Dry run complete. Run with --apply to commit.');
    return;
  }

  const backupDir = '/Users/joseluiszabala/.gemini/antigravity/brain/c5bb77dc-1727-42d1-9f81-8fe8796cb501/scratch';
  mkdirSync(backupDir, { recursive: true });
  const backupPath = `${backupDir}/protocols_homogenize_backup_${Date.now()}.json`;
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`Backup written to ${backupPath}`);

  const batch = db.batch();
  for (const u of updates) {
    batch.update(u.ref, u.patch);
  }
  await batch.commit();
  console.log(`✅ Applied ${updates.length} Firestore protocol updates.`);

  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  if (adminKey) {
    const client = algoliasearch(appId, adminKey);
    await client.setSettings({
      indexName: 'protocols',
      indexSettings: {
        searchableAttributes: ['name', 'slug', 'categoryId', 'goals', 'tags', 'overview_summary', 'evidence_level'],
        attributesForFaceting: [
          'filterOnly(status)',
          'filterOnly(isCustomTemplate)',
          'searchable(categoryId)',
          'searchable(evidence_level)',
          'searchable(goals)',
          'searchable(primary_goal)',
        ],
      },
    });
    await client.saveObjects({ indexName: 'protocols', objects: algoliaRecords });
    console.log(`✅ Reindexed ${algoliaRecords.length} protocols in Algolia "protocols".`);
  } else {
    console.log('⚠️ ALGOLIA_ADMIN_KEY not set; skipped Algolia protocols reindex.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
