#!/usr/bin/env node
/**
 * phase6e_enrich_to_firestore.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: merges enrichment data from the 3 local JSON files
 * (clinicalData, researchData, safetyData) into Firestore product docs.
 *
 * Strategy:
 *   - For each product name in the JSON files, find the matching Firestore doc
 *     by normalised name comparison.
 *   - Only writes fields that are MISSING or empty in Firestore (idempotent).
 *   - DRY RUN by default. Pass --apply to actually write.
 *
 * Usage:
 *   node scripts/phase6e_enrich_to_firestore.mjs          # dry-run
 *   node scripts/phase6e_enrich_to_firestore.mjs --apply   # write to Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Firebase Admin init ──────────────────────────────────────────────────────
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── CLI flags ────────────────────────────────────────────────────────────────
const APPLY = process.argv.includes('--apply');

// ── Load local JSON files ────────────────────────────────────────────────────
const dataDir = resolve(__dirname, '..', 'src', 'data', 'v2');
const clinicalData = JSON.parse(readFileSync(resolve(dataDir, 'clinicalData.json'), 'utf8'));
const researchData = JSON.parse(readFileSync(resolve(dataDir, 'researchData.json'), 'utf8'));
const safetyData   = JSON.parse(readFileSync(resolve(dataDir, 'safetyData.json'), 'utf8'));

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalize(name) {
  return (name ?? '').toLowerCase().trim();
}

function stripDosage(name) {
  return normalize(name)
    .replace(/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml|g|kg|unit)s?\b/gi, '')
    .replace(/\s*\b(?:vial|vials|drops|pen|capsules?|tablets?|kit|pack|amp|amps)s?\b/gi, '')
    .replace(/\s*-\s*$/, '')
    .trim();
}

function isEmpty(val) {
  if (val === null || val === undefined || val === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Phase 6E — Migrate Local Enrichment → Firestore          ║');
  console.log(`║   Mode: ${APPLY ? '🔴 APPLY (WRITING)' : '🟢 DRY RUN (read-only)'}                          ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── 1. Fetch all Firestore products ────────────────────────────────────────
  const productsSnap = await db.collection('products').get();
  const firestoreProducts = [];
  productsSnap.forEach((doc) => {
    firestoreProducts.push({ id: doc.id, ...doc.data() });
  });
  console.log(`📦 Firestore products loaded: ${firestoreProducts.length}`);

  // Build lookup maps: normalised name → Firestore doc
  const byExactName = new Map();
  const byStrippedName = new Map();

  for (const p of firestoreProducts) {
    const exact = normalize(p.name);
    if (exact && !byExactName.has(exact)) {
      byExactName.set(exact, p);
    }
    const stripped = stripDosage(p.name);
    if (stripped && !byStrippedName.has(stripped)) {
      byStrippedName.set(stripped, p);
    }
  }

  // ── 2. Collect all unique product names from JSON files ────────────────────
  const allJsonNames = new Set([
    ...Object.keys(clinicalData),
    ...Object.keys(researchData),
    ...Object.keys(safetyData),
  ]);
  console.log(`📋 Unique product names in JSON files: ${allJsonNames.size}\n`);

  // ── 3. Match & merge ──────────────────────────────────────────────────────
  const stats = { matched: 0, unmatched: 0, fieldsWritten: 0, skipped: 0 };
  const unmatchedNames = [];
  const writeLog = [];

  for (const jsonName of allJsonNames) {
    const key = normalize(jsonName);
    const strippedKey = stripDosage(jsonName);

    // Try exact match first, then stripped name
    let fsProduct = byExactName.get(key)
      || byStrippedName.get(key)
      || byExactName.get(strippedKey)
      || byStrippedName.get(strippedKey);

    // Fallback: try prefix matching (JSON name starts with Firestore name or vice versa)
    if (!fsProduct) {
      for (const [fsName, fsProd] of byExactName) {
        if (fsName.startsWith(key) || key.startsWith(fsName)) {
          fsProduct = fsProd;
          break;
        }
      }
    }

    if (!fsProduct) {
      stats.unmatched++;
      unmatchedNames.push(jsonName);
      continue;
    }

    stats.matched++;

    // Build the update payload — only fill MISSING fields
    const update = {};
    const clinical = clinicalData[jsonName] || {};
    const research = researchData[jsonName] || {};
    const safety   = safetyData[jsonName]   || {};

    // ── scientificName ──
    if (isEmpty(fsProduct.scientificName) && clinical.scientificName) {
      update.scientificName = clinical.scientificName;
    }

    // ── mechanisms[] ──
    if (isEmpty(fsProduct.mechanisms) && clinical.mechanisms?.length) {
      update.mechanisms = clinical.mechanisms;
    }

    // ── pharmacology object (merge sub-fields) ──
    const existingPharma = fsProduct.pharmacology || {};
    const pharmaUpdate = {};

    if (isEmpty(existingPharma.pharmacokinetics) && clinical.pharmacokinetics) {
      pharmaUpdate.pharmacokinetics = clinical.pharmacokinetics;
    }
    if (isEmpty(existingPharma.storageConditions) && clinical.storage_conditions) {
      pharmaUpdate.storageConditions = clinical.storage_conditions;
    }
    if (isEmpty(existingPharma.molecularWeight) && clinical.molecular_weight) {
      pharmaUpdate.molecularWeight = clinical.molecular_weight;
    }
    if (isEmpty(existingPharma.molecularFormula) && clinical.molecular_formula) {
      pharmaUpdate.molecularFormula = clinical.molecular_formula;
    }
    if (isEmpty(existingPharma.researchStatus) && research.research_status) {
      pharmaUpdate.researchStatus = research.research_status;
    }
    if (isEmpty(existingPharma.referencePmids) && research.reference_pmids?.length) {
      pharmaUpdate.referencePmids = research.reference_pmids;
    }
    if (isEmpty(existingPharma.safetyNote) && safety.safetyNote) {
      pharmaUpdate.safetyNote = safety.safetyNote;
    }
    if (isEmpty(existingPharma.contraindications) && safety.contraindications?.length) {
      pharmaUpdate.contraindications = safety.contraindications;
    }

    // If there are pharmacology sub-fields to write, merge them
    if (Object.keys(pharmaUpdate).length > 0) {
      update.pharmacology = { ...existingPharma, ...pharmaUpdate };
    }

    // ── Skip if nothing to write ──
    if (Object.keys(update).length === 0) {
      stats.skipped++;
      continue;
    }

    // ── Write or log ──
    const fieldNames = Object.keys(update);
    if (update.pharmacology) {
      const pharmaFields = Object.keys(pharmaUpdate);
      fieldNames.push(...pharmaFields.map((f) => `pharmacology.${f}`));
    }

    stats.fieldsWritten += fieldNames.length;
    writeLog.push({
      jsonName,
      firestoreId: fsProduct.id,
      firestoreName: fsProduct.name,
      fields: fieldNames,
    });

    if (APPLY) {
      update.updatedAt = FieldValue.serverTimestamp();
      await db.collection('products').doc(fsProduct.id).update(update);
    }
  }

  // ── 4. Report ──────────────────────────────────────────────────────────────
  console.log('── Match Results ──────────────────────────────────────────────');
  console.log(`  ✅ Matched:      ${stats.matched}`);
  console.log(`  ❌ Unmatched:    ${stats.unmatched}`);
  console.log(`  ⏭️  Skipped (already enriched): ${stats.skipped}`);
  console.log(`  📝 Fields written: ${stats.fieldsWritten}`);
  console.log();

  if (unmatchedNames.length > 0) {
    console.log('── Unmatched JSON Names (no Firestore product found) ─────────');
    unmatchedNames.forEach((n) => console.log(`  ⚠️  "${n}"`));
    console.log();
  }

  if (writeLog.length > 0) {
    console.log('── Write Log ─────────────────────────────────────────────────');
    writeLog.forEach((entry) => {
      const action = APPLY ? '✅ WRITTEN' : '📋 WOULD WRITE';
      console.log(`  ${action}: "${entry.jsonName}" → ${entry.firestoreId}`);
      console.log(`           Fields: ${entry.fields.join(', ')}`);
    });
    console.log();
  }

  if (!APPLY && writeLog.length > 0) {
    console.log('💡 Run with --apply to write these changes to Firestore.');
  }

  if (APPLY) {
    console.log('🎉 Migration complete! All enrichment data written to Firestore.');
  }
}

main().catch(console.error);
