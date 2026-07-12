import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function generateReport() {
  const protocolSnap = await db.collection('protocols').limit(3).get();
  const productSnap = await db.collection('products').where('isClinical', '==', true).limit(3).get();

  let md = `# Clinical Audit Verification Report\n\n`;
  md += `This report provides a sample of the updated database entries after running the clinical enrichment engine.\n\n`;

  md += `## Sample Updated Protocols\n\n`;
  protocolSnap.docs.forEach(doc => {
    const data = doc.data();
    md += `### ${data.protocol_name || doc.id}\n`;
    md += `- **Description**: ${data.description}\n`;
    if (data.clinical_evidence) {
      md += `- **Mechanism of Action**: ${data.clinical_evidence.mechanism_of_action || 'N/A'}\n`;
      md += `- **Efficacy Summary**: ${data.clinical_evidence.efficacy_summary || 'N/A'}\n`;
    } else {
      md += `- **Clinical Evidence**: (Did not require override)\n`;
    }
    
    if (data.phase_blueprints && data.phase_blueprints[0]) {
      const p1 = data.phase_blueprints[0];
      if (p1.drugs && p1.drugs.length > 0) {
        md += `- **Phase 1 Drugs Sample**:\n`;
        p1.drugs.forEach(d => {
          const dose = d.dose_logic ? `${d.dose_logic.starting_weekly_dose} ${d.dose_logic.dose_unit} / ${d.dose_logic.administration_frequency}` : 'N/A';
          md += `  - ${d.compound_name}: ${dose}\n`;
        });
      }
    }
    md += `\n`;
  });

  md += `## Sample Updated Products (Fichas de Producto)\n\n`;
  productSnap.docs.forEach(doc => {
    const data = doc.data();
    md += `### ${data.name || data.title}\n`;
    md += `- **Category**: ${data.category || 'N/A'}\n`;
    md += `- **Description**: ${data.description || 'N/A'}\n`;
    if (data.indications) {
      md += `- **Indications**: ${data.indications.join(', ')}\n`;
    }
    md += `\n`;
  });

  fs.writeFileSync('/Users/joseluiszabala/.gemini/antigravity/brain/c748273b-4b73-4262-b18b-5dddda12a212/audit_report.md', md);
  console.log(`Generated audit_report.md artifact`);
}

generateReport().catch(console.error).finally(() => process.exit(0));
