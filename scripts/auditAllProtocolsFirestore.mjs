import { db } from './lib/firebase-admin.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORT_DIR = path.resolve(__dirname, '../export');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

async function auditCollection(collectionName) {
  console.log(`\n🔍 Fetching '${collectionName}' collection from Firestore...`);
  let snap;
  try {
    snap = await db.collection(collectionName).get();
  } catch (err) {
    console.error(`❌ Error fetching '${collectionName}':`, err.message);
    return null;
  }

  console.log(`📋 Found ${snap.docs.length} documents in '${collectionName}'.`);

  const results = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;
    const title = data.protocol_title || data.name || id;

    // Collect all drugs/peptides used in this protocol
    const phases = data.phases || data.phase_blueprints || [];
    const uniquePeptides = new Set();
    const drugIssues = [];

    phases.forEach((phase, phIdx) => {
      const drugs = phase.drugs_used || phase.drugs || phase.compounds || [];
      
      drugs.forEach((drug, dIdx) => {
        // Collect peptide identity
        const drugSlug = drug.product_slug || drug.product_id || drug.name || drug.product_title || `drug_${dIdx}`;
        // Normalize the name/slug for counting unique peptides
        const normSlug = drugSlug.toLowerCase().trim().replace(/^prd_/, '');
        if (normSlug) {
          uniquePeptides.add(normSlug);
        }

        const drugName = drug.product_title || drug.name || drug.product_slug || `Drug ${dIdx}`;

        // Check dosage
        const dosage = drug.weekly_dose || 
                       drug.dose_per_administration || 
                       drug.dosage || 
                       drug.selected_strength ||
                       drug.strength ||
                       (drug.dose_logic?.dose_per_administration) || 
                       (drug.dose_logic?.starting_weekly_dose) || 
                       (drug.dose_logic?.default_weekly_dose);

        // Check frequency
        const frequency = drug.dosing_frequency || 
                          drug.administration_frequency || 
                          drug.frequency || 
                          (drug.dose_logic?.administration_frequency);

        if (!dosage || !frequency) {
          drugIssues.push({
            phase: phase.phase_number || (phIdx + 1),
            phaseTitle: phase.phase_title || `Phase ${phIdx + 1}`,
            drug: drugName,
            missing: [!dosage && 'dosage', !frequency && 'frequency'].filter(Boolean)
          });
        }
      });
    });

    results.push({
      id,
      title,
      peptides: Array.from(uniquePeptides),
      peptideCount: uniquePeptides.size,
      hasIssues: drugIssues.length > 0,
      drugIssues
    });
  }

  return results;
}

async function run() {
  const auditTemplates = await auditCollection('protocol_templates');
  const auditProtocols = await auditCollection('protocols');

  const report = {
    generated_at: new Date().toISOString(),
    protocol_templates: auditTemplates,
    protocols: auditProtocols
  };

  // Save report to export
  fs.writeFileSync(
    path.join(EXPORT_DIR, 'firestore_protocols_audit.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log('\n==================================================');
  console.log('🎉 AUDIT COMPLETE. SAVED TO export/firestore_protocols_audit.json');
  console.log('==================================================\n');

  // Print templates summary
  if (auditTemplates) {
    printSummary('protocol_templates', auditTemplates);
  }

  // Print protocols summary
  if (auditProtocols) {
    printSummary('protocols', auditProtocols);
  }
}

function printSummary(name, results) {
  console.log(`\n📊 SUMMARY FOR '${name}' COLLECTION:`);
  console.log(`--------------------------------------------------`);
  console.log(`Total Protocols: ${results.length}`);

  // Single peptide protocols
  const singlePeptide = results.filter(r => r.peptideCount === 1);
  console.log(`Single Peptide Protocols (${singlePeptide.length}):`);
  if (singlePeptide.length > 0) {
    singlePeptide.forEach(p => {
      console.log(`  - 🧪 ${p.id} (${p.title}) -> Peptide: [${p.peptides.join(', ')}]`);
    });
  } else {
    console.log(`  None found.`);
  }

  // Protocols with missing dosage/frequency
  const missingData = results.filter(r => r.hasIssues);
  console.log(`\nProtocols with Missing Dosage or Frequency (${missingData.length}):`);
  if (missingData.length > 0) {
    missingData.forEach(p => {
      console.log(`  - ❌ ${p.id} (${p.title})`);
      p.drugIssues.forEach(di => {
        console.log(`       Phase ${di.phase} (${di.phaseTitle}), Drug: ${di.drug} -> Missing: ${di.missing.join(', ')}`);
      });
    });
  } else {
    console.log(`  None found.`);
  }
  console.log(`--------------------------------------------------\n`);
}

run().catch(console.error);
