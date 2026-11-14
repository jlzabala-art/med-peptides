/**
 * seedGenomicReportsToFirestore.mjs
 * Seeds canonical 24Genetics genomic & ancestry records into Firestore /genomic_reports
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

  if (privateKey && clientEmail) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });
  }
  return null;
}

const app = initAdmin();
if (!app) {
  console.log('Firebase Admin could not initialize (no credentials). Skipping direct script seed.');
  process.exit(0);
}

const db = getFirestore(app);

const SEED_DATA = [
  {
    sampleId: 'G001321423',
    sampleCode: 'G001321423',
    patientName: 'Arshiya',
    gender: 'Female',
    age: 32,
    clinic: 'Transcend Healthcare',
    doctor: 'Dr. Sajid Burud',
    doctorId: 'dr-sajid-burud',
    doctorZohoId: '7006116000001150188',
    analysisDate: '2026-11-14',
    testType: '24Genetics Nutrition 2.0 (CE-IVD)',
    platform: 'Illumina Infinium GSA-24 BeadChip',
    specimen: 'Saliva CE-IVD (2.0 mL)',
    status: 'ready',
    snps: {
      MTHFR_C677T: 'GG',
      MTHFR_A1298C: 'TG',
      MCM6_rs4988235: 'GG',
      ADORA2A_rs5751876: 'TT',
      CYP1A2_rs762551: 'AA',
      IRS1_rs1801278: 'CC',
      TCF7L2_rs7903146: 'TC',
      FTO_rs9939609: 'AT',
      MC4R_rs17782313: 'TC',
      TAS2R38_rs713598: 'AG',
      FUT1_rs601338: 'AG',
      PPARG_rs1801282: 'CC',
      CLOCK: 'GG',
      GCKR: 'CC',
      LPL: 'TT',
      FUT2: 'GG',
      SLC23A1: 'CC',
      GC: 'TT',
      VKORC1: 'CC',
      CASR: 'GG',
      TMPRSS6: 'AA',
      MUC1: 'TC',
      CA1: 'AA',
      ZPR1_rs964184: 'CG',
      SCARB1: 'GG',
      APOC1: 'AA',
      LIPC: 'GG',
      CETP: 'TT',
      ABCG8: 'TC',
      LDLR: 'GG',
      APOB: 'CC',
      HMGCR: 'TT',
      FADS1: 'TT',
      FADS2: 'CC',
      PCSK9: 'TC',
      ELOVL2: 'CG',
      ABCG2: 'AA',
      AGT: 'GG',
      AGTR1: 'AA',
      ADD1: 'GG',
      SLC4A5: 'AA',
      TAS1R2: 'GG',
      NBPF3: 'TT',
      AOC1: 'GG',
      BACH2: 'CG'
    },
    ancestry: {
      sampleCode: 'G001321423',
      maternalHaplogroup: "M2a'b",
      maternalHaplogroupRoot: 'M (Eurasian Out-of-Africa Lineage)',
      neanderthalPercent: 1.6,
      primaryRegion: 'South Asia / Indian Subcontinent',
      primaryRegionPercent: 82.50,
      regionalBreakdown: [
        { region: 'South Asia (Dravidian & Indo-Aryan)', percentage: 82.50 },
        { region: 'Middle East & Arabian Peninsula', percentage: 10.50 },
        { region: 'Central Asia', percentage: 7.00 }
      ],
      archaeologicalAffinities: [
        { period: 'Bronze Age (5000–1300 BC)', culture: 'Indus Valley Civilization & Ancient Native', affinityPercent: 94.5 }
      ]
    }
  },
  {
    sampleId: 'G000943568',
    sampleCode: 'G000943568',
    patientName: 'Ms. Wafa Burud',
    gender: 'Female',
    age: 38,
    clinic: 'Transcend Healthcare',
    doctor: 'Dr. Sajid Burud',
    doctorId: 'dr-sajid-burud',
    doctorZohoId: '7006116000001150188',
    analysisDate: '2026-11-13',
    testType: '24Genetics Nutrition 2.0 & Ancestry CE-IVD',
    platform: 'Illumina Infinium GSA-24 BeadChip',
    specimen: 'Saliva CE-IVD (2.0 mL)',
    status: 'ready',
    snps: {
      MTHFR_C677T: 'GG',
      MTHFR_A1298C: 'AA',
      MTR_A2756G: 'AA',
      MTRR_A66G: 'AG',
      COMT_V158M: 'GA',
      MCM6_rs4988235: 'GG',
      ADORA2A_rs5751876: 'TT',
      CYP1A2_rs762551: 'AC',
      IRS1_rs1801278: 'TC',
      TCF7L2_rs7903146: 'CC',
      FTO_rs9939609: 'AC',
      MC4R_rs17782313: 'TC',
      TAS2R38_rs713598: 'AA',
      FUT1_rs601338: 'GG',
      VDR_BsmI: 'CC',
      CYP2R1: 'GG',
      ZPR1_rs964184: 'CC',
      CYP4F2_rs2108622: 'TT',
      IL6_rs1800795: 'GG',
      TNFa_rs1800629: 'GG',
      SOD2_rs4880: 'CT',
      GPX1_rs1050450: 'CC'
    },
    ancestry: {
      sampleCode: 'G000943568',
      maternalHaplogroup: "M2a'b",
      maternalHaplogroupRoot: 'M (Eurasian Out-of-Africa Southern Coastal Route ~49,590 BP)',
      neanderthalPercent: 1.5,
      primaryRegion: 'South Asia / Indian Subcontinent',
      primaryRegionPercent: 80.61,
      regionalBreakdown: [
        { region: 'Andhra Pradesh (Telugu / Dravidian)', percentage: 60.20 },
        { region: 'Sri Lanka (Tamil / Vellalar)', percentage: 9.70 },
        { region: 'Visakhapatnam (Coastal Andhra)', percentage: 6.06 },
        { region: 'Pakistan (Indus Valley / Sindh / Lahore)', percentage: 5.86 },
        { region: 'Gujarat (Western India)', percentage: 5.05 },
        { region: 'Bangladesh', percentage: 2.63 }
      ],
      archaeologicalAffinities: [
        { period: 'Metal & Bronze Age (5000–1300 BC)', culture: 'Iranian Bronze Age & Indus Valley Civilization', affinityPercent: 93.2 },
        { period: 'Iron Age (1300–500 BC)', culture: 'Pakistani Iron Age (Indus Valley Metallurgy)', affinityPercent: 99.2 },
        { period: 'Neolithic (10000–5000 BC)', culture: 'Hoabinhian & Iranian Neolithic Farmers', affinityPercent: 73.0 },
        { period: 'Historical / Medieval (1000–1300 AD)', culture: 'Pakistani Medieval & Northern Indian Ancient Native', affinityPercent: 100.0 }
      ]
    },
    updatedAt: new Date().toISOString()
  },
  {
    sampleId: '24G-QA-90421',
    sampleCode: '24G-QA-90421',
    patientName: 'Hossam Ahmed',
    gender: 'Male',
    age: 42,
    clinic: 'Ryhanh Medical Company · Doha',
    doctor: 'Dr. Hassan Al-Kuwari',
    doctorId: 'dr-hassan-alkuwari',
    doctorZohoId: '',
    analysisDate: '2026-11-10',
    testType: '24Genetics Nutrition 2.0 CE-IVD',
    platform: 'Illumina Infinium GSA-24 BeadChip',
    specimen: 'Saliva CE-IVD (2.0 mL)',
    status: 'ready',
    snps: {
      MTHFR_C677T: 'CT',
      MTHFR_A1298C: 'AC',
      MTR_A2756G: 'AG',
      MTRR_A66G: 'GG',
      COMT_V158M: 'AA',
      MCM6_rs4988235: 'GG',
      ADORA2A_rs5751876: 'TT',
      CYP1A2_rs762551: 'AA',
      IRS1_rs1801278: 'TC',
      TCF7L2_rs7903146: 'CT',
      FTO_rs9939609: 'AA',
      MC4R_rs17782313: 'CC',
      TAS2R38_rs713598: 'GG',
      FUT1_rs601338: 'AA',
      VDR_BsmI: 'TT',
      CYP2R1: 'AA',
      ZPR1_rs964184: 'CG',
      CYP4F2_rs2108622: 'CT',
      IL6_rs1800795: 'CC',
      TNFa_rs1800629: 'GA',
      SOD2_rs4880: 'TT',
      GPX1_rs1050450: 'CT'
    },
    ancestry: {
      sampleCode: '24G-QA-90421',
      maternalHaplogroup: 'J1b',
      maternalHaplogroupRoot: 'J (Fertile Crescent / Levantine Neolithic)',
      neanderthalPercent: 1.8,
      primaryRegion: 'Middle East & Arabian Peninsula',
      primaryRegionPercent: 88.40,
      regionalBreakdown: [
        { region: 'Levant & Arabian Gulf', percentage: 74.20 },
        { region: 'North Africa & Nile Valley', percentage: 14.20 },
        { region: 'Anatolia & Caucasus', percentage: 11.60 }
      ],
      archaeologicalAffinities: [
        { period: 'Bronze Age', culture: 'Canaanite & Levantine Coastal Agrarians', affinityPercent: 91.5 }
      ]
    },
    updatedAt: new Date().toISOString()
  }
];

async function run() {
  console.log('Seeding genomic_reports to Firestore...');
  for (const item of SEED_DATA) {
    await db.collection('genomic_reports').doc(item.sampleId).set(item, { merge: true });
    console.log(`✓ Seeded ${item.sampleId} (${item.patientName})`);
  }
  console.log('Done.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
