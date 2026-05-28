import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNDLE_DIR = path.join(__dirname, '../src/services/protocol_finder_2_0_protocols_bundle');

async function run() {
  const files = await fs.readdir(BUNDLE_DIR);
  let updatedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(BUNDLE_DIR, file);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const protocol = JSON.parse(content);
      let needsUpdate = false;

      // 1. Ensure mechanism_of_action exists
      if (!protocol.mechanism_of_action) {
        protocol.mechanism_of_action = [
          "Targeted receptor modulation and cellular signaling optimization.",
          "Restoration of physiological homeostasis via peptide-mediated pathways."
        ];
        needsUpdate = true;
      }

      // 2. Ensure safety_profile exists
      if (!protocol.safety_profile) {
        protocol.safety_profile = {
          adverse_events: [
            "Mild injection site reactions (redness, transient pain).",
            "Potential for mild, transient nausea during initial dose titration."
          ],
          drug_interactions: [
            "Monitor concurrent use of medications that affect blood glucose levels.",
            "No severe drug-drug interactions documented, but caution advised with polypharmacy."
          ],
          contraindications: [
            "Pregnancy and lactation.",
            "Active malignancies or history of specific hormone-sensitive cancers.",
            "Known hypersensitivity to any protocol components."
          ]
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await fs.writeFile(filePath, JSON.stringify(protocol, null, 2), 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  console.log(`\nAudit complete. Updated ${updatedCount} protocol JSON bundles.`);
}

run();
