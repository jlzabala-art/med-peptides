/**
 * seed-jymed-supplier.mjs
 * Adds JYMed Peptide as a supplier in Firestore (admin data only, no products).
 * Data sourced from official company brochure (PDF, Sep 2026).
 *
 * Usage: node scripts/seed-jymed-supplier.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

if (!getApps().length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(resolve(serviceAccountPath), 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();
const SUPPLIER_ID = 'jymed-peptide';

const jymedData = {
  companyName:      'JYMed Peptide',
  legalName:        'Shenzhen JYMed Technology Co., Ltd.',
  displayName:      'JYMed Peptide',
  slug:             'jymed-peptide',
  type:             'manufacturer',
  category:         'peptide_api',

  email:            'sales@jymedtech.com',
  website:          'https://www.jymedtech.com',
  phone: {
    international:  '+1-229-805-9633',
    china:          '+86-755-86350868',
  },

  address: {
    street:   'Room 806-810, Building 1, Shenzhen Biopharm Innovating Industrial Park, No.14 Jinhui Road, Kengzi',
    city:     'Pingshan District',
    state:    'Shenzhen',
    province: 'Guangdong',
    country:  'China',
    zip:      '518118',
  },

  facilitySites: [
    { name: 'Hubei API Manufacturing Site',    type: 'API', country: 'China', notes: '13 cGMP production lines, 10 tons/year capacity' },
    { name: 'Shenzhen FDF Manufacturing Site', type: 'FDF', country: 'China', notes: '4 GMP lines, 30M units/year' },
    { name: 'Advanced GLP R&D Center',         type: 'R&D', country: 'China', notes: '7,000 m² R&D center in Shenzhen' },
  ],

  certifications: ['FDA cGMP', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'HALAL', 'CEP (EDQM)', 'ICH', 'NMPA'],
  regulatoryMilestones: {
    fdaInspections:   2,
    dmfsCepsFiled:    '20+',
    indsSupported:    '20+',
    compliance:       ['ICH', 'EDQM'],
  },

  capabilities: {
    scope:               ['Research', 'Process Development', 'Clinical Supply', 'Commercial Manufacturing'],
    technologyPlatforms: ['SPPS', 'CF-SPPS', 'complex modifications', 'peptide-drug conjugates', 'green chemistry'],
    regulatorySupport:   ['DMF', 'CEP', 'IND', 'NDA', 'global regulatory filings'],
    services:            ['Peptide APIs', 'CDMO Services', 'Cosmetic Peptides', 'Custom Synthesis'],
    synthesisScale:      'milligram-scale R&D to commercial-scale peptide API production',
  },

  capacity: {
    totalReactorVolumeLiters: 60000,
    cGMPProductionLinesAPI:   13,
    annualCapacityTonsAPI:    10,
    gmpLinesFDF:              4,
    annualUnitsFDF_M:         30,
    rdCenterM2:               7000,
  },

  yearsOfExpertise: 17,

  statusB2B:        'active',
  status:           'active',
  variantsSupplied: 0,
  productsCount:    0,

  internalNotes:    'Added 2026-09-24 from official company brochure. Products not yet linked — pending catalogue review.',

  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  createdBy: 'system/seed-jymed-supplier',
};

async function run() {
  const docRef = db.collection('suppliers').doc(SUPPLIER_ID);
  const existing = await docRef.get();

  if (existing.exists) {
    console.warn(`⚠️  Supplier "${SUPPLIER_ID}" already exists. Aborting to avoid overwrite.`);
    process.exit(0);
  }

  await docRef.set(jymedData);
  console.log(`✅  Supplier "${SUPPLIER_ID}" created in Firestore collection "suppliers".`);
  console.log(`    Legal name : ${jymedData.legalName}`);
  console.log(`    Status     : ${jymedData.statusB2B}`);
  console.log(`    Website    : ${jymedData.website}`);
  console.log(`    Products   : ${jymedData.variantsSupplied} (none — intentional)`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error seeding supplier:', err);
  process.exit(1);
});
