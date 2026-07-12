const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery').get();
  
  if (snapshot.empty) {
    console.log('Protocol not found.');
    return;
  }
  
  const docRef = snapshot.docs[0].ref;
  const data = snapshot.docs[0].data();
  
  // Create audit log entry
  const newAudit = {
    date: new Date().toISOString(),
    action: "Updated Clinical Data & Reconstitution Items",
    user: "System",
    details: "Updated clinical rationale, expected outcomes, contraindications, required labs. Standardized peptide names in items.",
    version: "1.1"
  };

  const auditLog = data.audit_log || [];
  auditLog.unshift(newAudit);

  // Update phases items
  const phases = data.phases || [];
  if (phases.length > 0 && phases[0].items && phases[0].items.length >= 2) {
    phases[0].items[0].name = "BPC-157";
    phases[0].items[1].name = "TB-500";
  }

  // Update data
  await docRef.update({
    clinical_rationale: "BPC-157 promotes angiogenesis and reduces inflammation, while TB-500 upregulates actin, accelerating cellular migration to the site of injury. Together, they offer unmatched systemic recovery for soft tissue and joint injuries.",
    expected_outcomes: "Accelerated healing of tendons and ligaments, reduced localized and systemic inflammation, enhanced cellular repair, improved joint mobility, and shorter overall recovery times following injury or surgery.",
    contraindications: "Active malignancies or history of cancer (due to pro-angiogenic effects of both peptides), autoimmune disorders without prior medical clearance, and pregnancy.",
    required_labs: ["CBC", "CMP", "Inflammatory Markers (CRP, ESR)", "Hormonal Panel", "Liver Function Tests"],
    version: "1.1",
    audit_log: auditLog,
    phases: phases
  });

  console.log('Protocol updated successfully. Version 1.1 created.');
}

run();
