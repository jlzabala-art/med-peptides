import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

function calculateCompleteness(protocol) {
  const hasName = !!(protocol?.name || protocol?.protocol_name || protocol?.title);
  const hasCategory = !!(protocol?.therapeutic_category || protocol?.category || protocol?.primary_goal);
  const hasRationale = !!(protocol?.clinical_rationale || protocol?.summary || protocol?.description || protocol?.overview || protocol?.overview_summary);

  const checks = [
    { id: 'overview', label: 'Overview', done: hasName && (hasCategory || hasRationale) },
    { id: 'treatment', label: 'Treatment', done: !!(protocol?.phases?.length > 0 || protocol?.duration_weeks || protocol?.durationWeeks || protocol?.peptides?.length > 0 || protocol?.items?.length > 0) },
    { id: 'dosage', label: 'Dosage', done: !!(protocol?.dosage_schedule?.length > 0 || protocol?.weekly_doses || protocol?.dosing_instructions || (Array.isArray(protocol?.phases) && protocol.phases.some(p => (p.compounds && p.compounds.length > 0) || (p.drugs && p.drugs.length > 0)))) },
    { id: 'monitoring', label: 'Monitoring', done: !!(protocol?.monitoring_cadence || protocol?.check_in_weeks || protocol?.monitoring || protocol?.safetyGuidelines) },
    { id: 'labs', label: 'Labs', done: !!(protocol?.required_labs?.length > 0 || protocol?.biomarkers?.length > 0 || protocol?.labs) },
    { id: 'progress', label: 'Progress Tracker', done: !!(protocol?.clinical_biomarker_data || protocol?.progress_tracker || protocol?.kpis || protocol?.expected_outcomes) },
  ];
  const completed = checks.filter(c => c.done).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);

  const lastUpdateRaw = protocol?.updatedAt || protocol?.updated_at || protocol?.lastReviewedAt || protocol?.createdAt || protocol?.created_at || null;
  let isStale = false;
  let daysSinceUpdate = 0;

  if (lastUpdateRaw) {
    const timestamp = typeof lastUpdateRaw === 'object' && lastUpdateRaw._seconds 
      ? lastUpdateRaw._seconds * 1000 
      : new Date(lastUpdateRaw).getTime();
    if (!isNaN(timestamp)) {
      const now = Date.now();
      daysSinceUpdate = Math.max(0, Math.floor((now - timestamp) / (1000 * 60 * 60 * 24)));
      if (daysSinceUpdate > 90) {
        isStale = true;
      }
    }
  } else {
    isStale = true; // No date at all means old/legacy
  }

  return { pct, checks, isStale, daysSinceUpdate };
}

async function run() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols in Firestore.\n`);

  let complete100 = 0;
  let staleCount = 0;
  const missingBySection = {
    overview: 0,
    treatment: 0,
    dosage: 0,
    monitoring: 0,
    labs: 0,
    progress: 0
  };

  snapshot.docs.forEach((doc) => {
    const p = doc.data();
    const { pct, checks, isStale, daysSinceUpdate } = calculateCompleteness(p);
    if (pct === 100) complete100++;
    if (isStale) staleCount++;

    checks.forEach(c => {
      if (!c.done) missingBySection[c.id]++;
    });
  });

  console.log(`=== Audit Summary ===`);
  console.log(`Total Protocols: ${snapshot.size}`);
  console.log(`100% Complete: ${complete100} / ${snapshot.size} (${Math.round(complete100 / snapshot.size * 100)}%)`);
  console.log(`Stale (>90 days without update): ${staleCount} / ${snapshot.size}`);
  console.log(`Missing by Section:`, missingBySection);
}

run().catch(console.error).finally(() => process.exit(0));
