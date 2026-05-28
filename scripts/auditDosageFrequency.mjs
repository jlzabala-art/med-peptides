/**
 * auditDosageFrequency.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Audits all protocols in 'protocol_templates' to identify missing
 * dosage or frequency fields in their drug lists.
 *
 * Usage: node scripts/auditDosageFrequency.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
  } catch {
    initializeApp();
  }
}
const db = getFirestore();

async function main() {
  const snap = await db.collection('protocol_templates').get();
  console.log(`\n📦 Total protocols: ${snap.docs.length}\n`);

  const issues = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;
    const name = data.protocol_title || data.name || id;

    const phases = data.phases || data.phase_blueprints || [];
    if (phases.length === 0) {
      issues.push({ id, name, reason: 'No phases found' });
      continue;
    }

    let protocolHasIssues = false;
    const drugIssues = [];

    phases.forEach((phase, phIdx) => {
      const drugs = phase.drugs_used || phase.drugs || phase.compounds || [];
      drugs.forEach((drug, dIdx) => {
        const drugName = drug.product_title || drug.name || drug.product_slug || `Drug ${dIdx}`;
        
        // Check for dosage
        const dosage = drug.weekly_dose || drug.dose_per_administration || drug.dosage || (drug.dose_logic?.dose_per_administration) || (drug.dose_logic?.starting_weekly_dose);
        
        // Check for frequency
        const frequency = drug.dosing_frequency || drug.administration_frequency || drug.frequency || (drug.dose_logic?.administration_frequency);

        if (!dosage || !frequency) {
          protocolHasIssues = true;
          drugIssues.push({
            phase: phIdx + 1,
            drug: drugName,
            missing: [!dosage && 'dosage', !frequency && 'frequency'].filter(Boolean).join(', ')
          });
        }
      });
    });

    if (protocolHasIssues) {
      issues.push({ id, name, drugIssues });
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log(`  Protocols with missing data: ${issues.length}`);
  console.log('═══════════════════════════════════════════\n');

  issues.forEach(issue => {
    console.log(`❌ ${issue.id} (${issue.name})`);
    if (issue.reason) {
      console.log(`   - ${issue.reason}`);
    } else {
      issue.drugIssues.forEach(di => {
        console.log(`   - Phase ${di.phase}, Drug: ${di.drug} -> Missing: ${di.missing}`);
      });
    }
    console.log('');
  });
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
