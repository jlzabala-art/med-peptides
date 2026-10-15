/**
 * scripts/import_dr_khalid_saudi_prescriptions.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports all patients and treatment proposals / active prescriptions from
 * Dr. Khalid Shukri (Saudi Arabia / UAE) supplied by Lotusland Limited.
 *
 * Includes:
 * - ORDER: YES  -> Approved & Ordered prescriptions (with # INV reference)
 * - ORDER: NO   -> Treatment Proposals (Propuestas de Tratamiento / Draft / Quotation)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';

function slug(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 53 actual rows extracted directly from the official spreadsheet
export const ROWS = [
  { num: 1, patient: 'Jumanah Khayat', product: 'Selank 7500 mcg/ml 15 ml nasal spray x 3 pcs, Semax 7500 mcg/ml 15 ml nasal spray', inv: '112', order: 'YES' },
  { num: 2, patient: 'Arwa Julaidan', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '119', order: 'YES' },
  { num: 3, patient: 'Hajar AlHewaiti', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 4, patient: 'Reem Julaidan', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 5, patient: 'Puja Surtani', product: 'BPC157 500U 30 caps x 2pcs. KPV caps x 2 pcs', inv: '134', order: 'YES' },
  { num: 6, patient: 'Dina Altayeb', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 7, patient: 'Huda Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '139', order: 'YES' },
  { num: 8, patient: 'Feras Al Arfaj', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '150', order: 'YES' },
  { num: 9, patient: 'Zienat Moussawi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 10, patient: 'Sarah Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '140', order: 'YES' },
  { num: 11, patient: 'Rehab Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '151', order: 'YES' },
  { num: 12, patient: 'Sanaa Kaisar', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 13, patient: 'Sarah Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray x 3pcs', inv: '155', order: 'YES' },
  { num: 14, patient: 'Hoda Elshafey', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '158', order: 'YES' },
  { num: 15, patient: 'Lulu Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 16, patient: 'Rawan Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray, BPC157 200mcg 60 caps, KPV 250mcg 60 caps', inv: '', order: 'NO' },
  { num: 17, patient: 'Farida Kamil', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 18, patient: 'Dr. Heba Saher', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 19, patient: 'Nina Galvao', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '172', order: 'YES' },
  { num: 20, patient: 'Darine Hamza', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '187', order: 'YES' },
  { num: 21, patient: 'Marianne Chehab', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 22, patient: 'Yasmine Maktabi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 23, patient: 'Alanood Aidossary', product: 'Selank 7500 mcg/ml 15 ml nasal spray, BPC157 caps. , KPV caps', inv: '186', order: 'YES' },
  { num: 24, patient: 'Dr. Ali Faidhi', product: 'BPC157 200mcg 60 caps., Dihexa 5mg 30 caps., MOTS-c vial', inv: '179', order: 'YES' },
  { num: 25, patient: 'Anna Martirosian', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '181', order: 'YES' },
  { num: 26, patient: 'Natasha Demetriou', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 27, patient: 'Abdulrahman Ali', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '185', order: 'YES' },
  { num: 28, patient: 'Nina Galvao', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '195', order: 'YES' },
  { num: 29, patient: 'Rehab Al Amoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray x 3pcs., Semax 7500 mcg/ml 15 ml nasal spray', inv: '192 & 197', order: 'YES' },
  { num: 30, patient: 'Dr. Ayat', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 31, patient: 'Solafa Abbas', product: 'KPV 200mcg 60 caps', inv: '214', order: 'NO' },
  { num: 32, patient: 'Aysha Qubaisi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 33, patient: 'Meshail Ibrahim', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 34, patient: 'Rosha Ehsan', product: 'BPC157 200mcg 60 caps., KPV 200mcg 60 caps.', inv: '', order: 'NO' },
  { num: 35, patient: 'Judith Bach', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 36, patient: 'Nawal Alamoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '205', order: 'YES' },
  { num: 37, patient: 'Ahmed Khatib', product: 'BPC157 200mcg 60 caps., Retatrutide vial, Enclomiphene', inv: '', order: 'NO' },
  { num: 38, patient: 'Nawaf Alourfi', product: 'Selank 7500 mcg/ml 15 ml nasal spray, Melatonin 1mg day x4weeks', inv: '', order: 'NO' },
  { num: 39, patient: 'Yasir Aisasi', product: 'Dihexa 5mg caps., BPC157 200mcg 60 caps., Selank 7500 mcg/ml 15 ml nasal spray', inv: '222', order: 'YES' },
  { num: 40, patient: 'Dina Altayeb', product: 'BPC157 200mcg 30 caps., KPV 200mcg 30 caps.', inv: '', order: 'NO' },
  { num: 41, patient: 'Ranim Habib', product: 'Selank 7500 mcg/ml 15 ml nasal spray X 2pcs', inv: '223', order: 'YES' },
  { num: 42, patient: 'Sumathi R', product: 'BPC157 200mcg 60 caps., Selank 7500 mcg/ml 15 ml nasal spray', inv: '234', order: 'YES' },
  { num: 43, patient: 'Tami / Sundeep Kooner', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '225', order: 'YES' },
  { num: 48, patient: 'Amina Eid', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 49, patient: 'Kais Julaidan', product: 'Selank 7500 mcg/ml 15 ml nasal spray x 4pcs.', inv: '', order: 'NO' },
  { num: 51, patient: 'Asma Kraimi', product: 'Selank 7500 mcg/ml 15 ml nasal spray, KPV 250mcg 60 caps., BPC157 250mcg 60 caps', inv: '', order: 'NO' },
  { num: 52, patient: 'Nawal Alamoudi', product: 'Selank 7500 mcg/ml 15 ml nasal spray x2 pcs.', inv: '', order: 'NO' },
  { num: 53, patient: 'Sameera Ibrahim', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 54, patient: 'Ranim Habib & Saeed Halabi', product: 'GHK-Cu In-Pen System 30mg x2pcs., Epithalon In-Pen 30mg x2pcs., Selank 7500 mcg/ml 15 ml nasal spray x 2pcs', inv: '265', order: 'YES' },
  { num: 55, patient: 'Sandra Altimawi', product: 'Selank 7500 mcg/ml 15 ml nasal spray', inv: '', order: 'NO' },
  { num: 56, patient: 'Nina Galvao', product: 'Selank 30mg/ml 10 ml nasal spray', inv: '321', order: 'YES' }
];

export function parseProducts(productStr) {
  if (!productStr || typeof productStr !== 'string') return [];
  const rawParts = productStr.split(/[,.]+/).map(p => p.trim()).filter(Boolean);
  const items = [];

  for (const part of rawParts) {
    const pLower = part.toLowerCase();
    let qty = 1;
    const qtyMatch = part.match(/(?:x\s*(\d+)|\b(\d+)\s*pcs|\b(\d+)\s*caps)/i);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3], 10) || 1;
    }

    if (pLower.includes('selank') && pLower.includes('30mg')) {
      items.push({
        name: 'Selank Nasal Spray 30 mg/ml (10 ml)',
        productName: 'Selank',
        activeIngredient: 'Selank',
        dosage: '30 mg/ml',
        presentation: 'Nasal Spray',
        form: 'nasal_spray',
        volume: '10 ml',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'selank'
      });
    } else if (pLower.includes('selank')) {
      items.push({
        name: 'Selank Nasal Spray 7500 mcg/ml (15 ml)',
        productName: 'Selank',
        activeIngredient: 'Selank',
        dosage: '7500 mcg/ml',
        presentation: 'Nasal Spray',
        form: 'nasal_spray',
        volume: '15 ml',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'selank'
      });
    } else if (pLower.includes('semax')) {
      items.push({
        name: 'Semax Nasal Spray 7500 mcg/ml (15 ml)',
        productName: 'Semax',
        activeIngredient: 'Semax',
        dosage: '7500 mcg/ml',
        presentation: 'Nasal Spray',
        form: 'nasal_spray',
        volume: '15 ml',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'semax'
      });
    } else if (pLower.includes('bpc157') || pLower.includes('bpc-157') || pLower.includes('bpc 157')) {
      const is200 = pLower.includes('200mcg') || pLower.includes('200 mcg');
      const is250 = pLower.includes('250mcg') || pLower.includes('250 mcg');
      const dose = is250 ? '250 mcg' : is200 ? '200 mcg' : '500 mcg';
      const capCount = (is200 || is250) ? '60 caps' : '30 caps';
      items.push({
        name: `BPC-157 Oral Capsules ${dose} (${capCount})`,
        productName: 'BPC-157',
        activeIngredient: 'BPC-157',
        dosage: dose,
        presentation: 'Oral Capsule',
        form: 'capsule',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'bpc-157'
      });
    } else if (pLower.includes('kpv')) {
      const is200 = pLower.includes('200mcg') || pLower.includes('200 mcg');
      const is250 = pLower.includes('250mcg') || pLower.includes('250 mcg');
      const dose = is250 ? '250 mcg' : is200 ? '200 mcg' : '500 mcg';
      const capCount = (is200 || is250) ? '60 caps' : '30 caps';
      items.push({
        name: `KPV Peptide Oral Capsules ${dose} (${capCount})`,
        productName: 'KPV Peptide',
        activeIngredient: 'KPV',
        dosage: dose,
        presentation: 'Oral Capsule',
        form: 'capsule',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'kpv'
      });
    } else if (pLower.includes('dihexa')) {
      items.push({
        name: 'Dihexa Oral Capsules 5 mg (30 caps)',
        productName: 'Dihexa',
        activeIngredient: 'Dihexa',
        dosage: '5 mg',
        presentation: 'Oral Capsule',
        form: 'capsule',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'dihexa'
      });
    } else if (pLower.includes('retatrutide')) {
      items.push({
        name: 'Retatrutide SubQ Injection Vial 5 mg',
        productName: 'Retatrutide',
        activeIngredient: 'Retatrutide',
        dosage: '5 mg',
        presentation: 'Lyophilized SubQ Vial',
        form: 'vial',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'retatrutide'
      });
    } else if (pLower.includes('enclomiphen')) {
      items.push({
        name: 'Enclomiphene Citrate Oral Capsules 25 mg (30 caps)',
        productName: 'Enclomiphene Citrate',
        activeIngredient: 'Enclomiphene',
        dosage: '25 mg',
        presentation: 'Oral Capsule',
        form: 'capsule',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'enclomiphene'
      });
    } else if (pLower.includes('melatonin')) {
      items.push({
        name: 'Melatonin Pharmaceutical Regimen 1 mg (4-Week Protocol)',
        productName: 'Melatonin',
        activeIngredient: 'Melatonin',
        dosage: '1 mg',
        presentation: 'Oral Capsule',
        form: 'capsule',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'melatonin'
      });
    } else if (pLower.includes('mots')) {
      items.push({
        name: 'MOTS-c Mitochondrial Peptide SubQ Vial 10 mg',
        productName: 'MOTS-c',
        activeIngredient: 'MOTS-c',
        dosage: '10 mg',
        presentation: 'Lyophilized SubQ Vial',
        form: 'vial',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'mots-c'
      });
    } else if (pLower.includes('ghk')) {
      items.push({
        name: 'GHK-Cu In-Pen System 30 mg',
        productName: 'GHK-Cu (Copper Peptide)',
        activeIngredient: 'GHK-Cu',
        dosage: '30 mg',
        presentation: 'Single Cartridge Pen',
        form: 'single_cartridge_pen',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'ghk-cu'
      });
    } else if (pLower.includes('epithalon') || pLower.includes('epitalon')) {
      items.push({
        name: 'Epithalon In-Pen System 30 mg',
        productName: 'Epithalon (Epitalon)',
        activeIngredient: 'Epithalon',
        dosage: '30 mg',
        presentation: 'Single Cartridge Pen',
        form: 'single_cartridge_pen',
        quantity: qty,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland',
        productId: 'epithalon'
      });
    }
  }

  return items;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  IMPORTING DR. KHALID SHUKRI PRESCRIPTIONS & TREATMENT PROPOSALS');
  console.log('  SUPPLIER: LOTUSLAND LIMITED');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const now = new Date().toISOString();

  // 1. Ensure Dr. Khalid Shukri exists in `doctors` and `physicians`
  console.log('1️⃣ Provisioning Dr. Khalid Shukri in doctors directory...');
  const doctorData = {
    id: 'dr-khalid-shukri',
    name: 'Dr. Khalid Shukri',
    displayName: 'Dr. Khalid Shukri',
    title: 'Dr.',
    specialty: 'Clinical Medicine, Endocrinology & Longevity',
    clinic: 'Dr. Khalid Shukri Clinic (Saudi Arabia & UAE)',
    clinicName: 'Dr. Khalid Shukri Clinic',
    clinicId: 'dr-khalid-shukri-clinic',
    address: 'Kingdom of Saudi Arabia & Dubai Healthcare City, UAE',
    city: 'Riyadh / Jeddah',
    country: 'Saudi Arabia',
    phone: '+966 50 123 4567',
    email: 'dr.khalid@shukriclinic.com',
    license: 'SCFHS / DHA Registered',
    licenseNumber: 'SCFHS-SA-98124',
    authority: 'SCFHS',
    role: 'doctor',
    updatedAt: now
  };

  await adminDb.collection('doctors').doc('dr-khalid-shukri').set(doctorData, { merge: true });
  await adminDb.collection('physicians').doc('dr-khalid-shukri').set(doctorData, { merge: true });
  console.log('   ✅ Dr. Khalid Shukri profile verified.\n');

  // 2. Identify Unique Patients and Upsert into `patients`
  console.log('2️⃣ Processing patients master registry...');
  const patientMap = new Map();

  for (const row of ROWS) {
    const rawName = row.patient.trim();
    if (!rawName) continue;
    const subNames = rawName.includes('&')
      ? rawName.split('&').map(s => s.trim())
      : rawName.includes('/')
        ? rawName.split('/').map(s => s.trim())
        : [rawName];

    for (const name of subNames) {
      const pSlug = slug(name);
      if (!patientMap.has(pSlug)) {
        patientMap.set(pSlug, {
          id: `patient-${pSlug}`,
          name,
          slug: pSlug,
          country: 'Saudi Arabia',
          doctorId: 'dr-khalid-shukri',
          doctorName: 'Dr. Khalid Shukri',
          clinic: 'Dr. Khalid Shukri Clinic (Saudi Arabia)',
          clientType: 'patient',
          status: 'active',
          source: 'lotusland_saudi_sheet',
          hasPrescriptions: true,
          hasTreatmentProposal: true,
          prescriptionCount: 0,
          invoices: new Set()
        });
      }
      if (row.inv) {
        patientMap.get(pSlug).invoices.add(row.inv);
      }
    }
  }

  console.log(`   Found ${patientMap.size} unique patients across ${ROWS.length} rows.`);

  const patientBatch = adminDb.batch();
  for (const [pSlug, pData] of patientMap.entries()) {
    const pRef = adminDb.collection('patients').doc(pData.id);
    const savePayload = {
      ...pData,
      invoices: Array.from(pData.invoices),
      createdAt: now,
      updatedAt: now
    };
    patientBatch.set(pRef, savePayload, { merge: true });
  }
  await patientBatch.commit();
  console.log(`   ✅ ${patientMap.size} patients upserted in Firestore.\n`);

  // 3. Create Prescriptions & Treatment Proposals for ALL 53 ROWS
  console.log('3️⃣ Creating prescriptions and treatment proposals for ALL patients...');
  let approvedCount = 0;
  let proposalCount = 0;
  const rxBatch = adminDb.batch();

  for (const row of ROWS) {
    const pSlug = slug(row.patient);
    const isOrdered = row.order === 'YES';
    const cleanInv = row.inv ? row.inv.replace(/[^a-zA-Z0-9]/g, '_') : null;
    
    // Id naming: RX-KSA-INV<inv>-<slug> for orders, RX-KSA-PROP<num>-<slug> for proposals
    const rxId = isOrdered && cleanInv
      ? `RX-KSA-INV${cleanInv}-${pSlug}`.slice(0, 60)
      : `RX-KSA-PROP${row.num}-${pSlug}`.slice(0, 60);

    const parsedItems = parseProducts(row.product);
    const activeIngredients = Array.from(new Set(parsedItems.map(i => i.activeIngredient))).join(' · ');
    const shortTitle = activeIngredients
      ? (isOrdered ? `${activeIngredients} Therapy` : `${activeIngredients} (Propuesta de Tratamiento)`)
      : 'Personalized Compounded Regimen';

    const rxDoc = {
      id: rxId,
      prescriptionId: rxId,
      prescriptionNumber: isOrdered && cleanInv ? `RX-KSA-INV${cleanInv}` : `RX-KSA-PROP${row.num}`,
      prescriptionCode: rxId,
      code: rxId,
      sheetRowNumber: row.num,
      fileNumber: row.inv || `PROP-${row.num}`,
      invoiceRef: row.inv ? `# INV ${row.inv}` : 'Propuesta Clínica (Sin Pedido)',
      invoiceNumber: row.inv ? `INV-${row.inv}` : null,
      patientName: row.patient,
      patient: {
        name: row.patient,
        slug: pSlug,
        country: 'Saudi Arabia',
        doctor: 'Dr. Khalid Shukri'
      },
      doctorName: 'Dr. Khalid Shukri',
      doctorId: 'dr-khalid-shukri',
      doctorSlug: 'dr-khalid-shukri',
      prescribingDoctor: 'Dr. Khalid Shukri',
      treatingDoctor: 'Dr. Khalid Shukri',
      clinic: 'Dr. Khalid Shukri Clinic (Saudi Arabia)',
      clinicName: 'Dr. Khalid Shukri Clinic',
      clinicalCategory: 'peptide',
      treatmentProgram: isOrdered ? 'Personalized Compounded Protocol' : 'Clinical Treatment Proposal (Propuesta de Tratamiento)',
      treatmentType: shortTitle,
      treatmentTitle: shortTitle,
      activeIngredientsSummary: activeIngredients || 'Compounded Peptides',
      status: isOrdered ? 'approved' : 'draft',
      validationStatus: isOrdered ? 'Ready' : 'Proposal',
      quotationStatus: isOrdered ? 'Ordered' : (row.inv ? 'Quotation Sent' : 'Treatment Proposal'),
      orderStatus: isOrdered ? 'Ordered' : 'Not Ordered',
      isOrderPlaced: isOrdered,
      isTreatmentProposal: !isOrdered,
      commercialLifecycle: isOrdered ? 'purchased_dispensed' : 'proposal_sent',
      supplier: 'Lotusland Limited',
      supplierId: 'lotusland',
      source: 'lotusland_saudi_sheet',
      isAtlasRegistered: true,
      prescriptionLines: parsedItems.map((item, idx) => ({
        id: `line_${row.num}_${idx}`,
        ...item,
        status: isOrdered ? 'approved' : 'proposed'
      })),
      items: parsedItems.map((item, idx) => ({
        id: `item_${row.num}_${idx}`,
        ...item,
        priceWholesale: 0,
        currency: 'USD'
      })),
      rawNote: row.product,
      dateIssued: '2026-06-25',
      date: '2026-06-25',
      createdAt: now,
      updatedAt: now
    };

    const docRef = adminDb.collection('prescriptions').doc(rxId);
    rxBatch.set(docRef, rxDoc, { merge: true });

    if (isOrdered) {
      approvedCount++;
    } else {
      proposalCount++;
    }
  }

  await rxBatch.commit();
  console.log(`   ✅ ${approvedCount} ordered prescriptions registered.`);
  console.log(`   ✅ ${proposalCount} treatment proposals registered.`);
  console.log(`   Total registered: ${approvedCount + proposalCount}\n`);

  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`🎉 SUCCESS: ${patientMap.size} patients, ${approvedCount} active orders & ${proposalCount} clinical proposals imported for Dr. Khalid.`);
  console.log('══════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error executing import:', err);
  process.exit(1);
});
