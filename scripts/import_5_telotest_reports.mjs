/**
 * scripts/import_5_telotest_reports.mjs
 *
 * Imports 5 Fagron TeloTest™ reports into Firestore:
 *   1. BOX03531AATEL - Melissa Nel (Date: 27/04/2026) - Dr. Sobia Mirza, My London Skin Clinic
 *   2. BOX00621AATEL - Maria Nosal (Date: 06/09/2023) - Dr. Sobia Mirza, My London Skin Clinic
 *   3. BOX02171AATEL - Rehab Serafi (Date: 31/10/2024) - Dr. Rehab Serafi, Dr. Rehab Serafi Clinic
 *   4. BOX00623AATEL - Saeed Dalmook (Date: 06/09/2023) - Dr. Sobia Mirza, My London Skin Clinic
 *   5. BOX03533AATEL - Saeed Al Maktoum (Date: 27/04/2026) - Dr. Sobia Mirza, My London Skin Clinic
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sa = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccount-target.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

const reports = [
  // 1. Melissa Nel
  {
    code: 'BOX03531AATEL',
    patient: {
      id: 'patient-melissa-nel',
      name: 'Melissa Nel',
      fullName: 'Melissa Nel',
      dob: '1994-06-23',
      dateOfBirth: '23-06-1994',
      gender: 'Female',
      age: 31,
      heightCm: 171,
      weightKg: 61,
      stress: 'Little bit',
      activity: '20-30 min, moderate intensity, 3-5 days a week',
      sampleType: 'Oral mucosa buccal swab'
    },
    clinic: {
      id: 'IdDU1oK1VuAVVYrGz6E7',
      name: 'My London Skin Clinic',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    },
    doctor: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      email: 'mylondonskinclinicgenomics@gmail.com',
      specialty: 'Aesthetic Medicine & Regenerative Biology'
    },
    dates: {
      receptionDate: '2026-04-08',
      resultsDateISO: '2026-04-27',
      resultsDateSlash: '27/04/2026',
      resultsTimestamp: new Date('2026-04-27T00:00:00Z')
    },
    results: {
      telomereLengthKb: 0.89,
      realAge: 31,
      estimatedBiologicalAge: 41,
      agingDelta: 10,
      classification: 'Very aged',
      interpretation: 'Its biological age shows a marked aging with respect to its chronological age (+10 years). Its cells have a telomeric length much shorter than expected (0.89 kb).'
    },
    activeIngredients: ['Turmeric dry extract', 'Oral Astaxanthin', 'Oral Coenzyme Q10', 'Oral Vitamin C', 'Metformin', 'Testosterone', 'Pentravan'],
    items: [
      {
        name: 'Turmeric dry extract',
        dose: '250 mg',
        activeIngredient: 'Curcumin / Turmeric dry extract',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning (100 capsules, Hygrocaps)'
      },
      {
        name: 'Oral Astaxanthin',
        dose: '12 mg',
        activeIngredient: 'Astaxanthin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Coenzyme Q10',
        dose: '50 mg',
        activeIngredient: 'Coenzyme Q10 (Ubiquinone)',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Vitamin C',
        dose: '80 mg',
        activeIngredient: 'Ascorbic Acid (Vitamin C)',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Metformin',
        dose: '100 mg',
        activeIngredient: 'Metformin HCl',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas (Pentravan c.s.p 1 g)'
      },
      {
        name: 'Testosterone Micronized',
        dose: '3 mg',
        activeIngredient: 'Testosterone Micronized',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas'
      },
      {
        name: 'Pentravan™',
        dose: 'c.s.p 1 g',
        activeIngredient: 'Pentravan Transdermal Vanishing Cream Base',
        isVehicleOrBase: true,
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2
      }
    ],
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Antioxidant & Cellular Longevity Capsule',
        volume: '100 capsules',
        dispensingForm: 'Oral Capsule (Hygrocaps)',
        posology: 'One capsule daily in the morning',
        ingredients: [
          { name: 'Turmeric dry extract', dose: '250 mg' },
          { name: 'Oral Astaxanthin', dose: '12 mg' },
          { name: 'Oral Coenzyme Q10', dose: '50 mg' },
          { name: 'Oral Vitamin C', dose: '80 mg' }
        ]
      },
      {
        treatmentType: 'Transdermal treatment',
        treatmentProgram: 'Pentravan Transdermal Metabolic Matrix',
        volume: 'Pentravan c.s.p 1 g',
        dispensingForm: 'Transdermal Vanishing Cream',
        posology: 'Apply once per day in transdermal areas',
        ingredients: [
          { name: 'Metformin', dose: '100 mg' },
          { name: 'Testosterone', dose: '3 mg' },
          { name: 'Pentravan', dose: 'c.s.p 1 g', isVehicleOrBase: true }
        ]
      }
    ]
  },

  // 2. Maria Nosal
  {
    code: 'BOX00621AATEL',
    patient: {
      id: 'patient-maria-nosal',
      name: 'Maria Nosal',
      fullName: 'Maria Nosal',
      dob: '1992-09-25',
      dateOfBirth: '25-09-1992',
      gender: 'Female',
      age: 33,
      heightCm: 165,
      weightKg: 56,
      stress: 'A lot',
      activity: '30 min, moderate intensity, almost every day',
      sampleType: 'Oral mucosa buccal swab'
    },
    clinic: {
      id: 'IdDU1oK1VuAVVYrGz6E7',
      name: 'My London Skin Clinic',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    },
    doctor: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      email: 'mylondonskinclinicgenomics@gmail.com',
      specialty: 'Aesthetic Medicine & Regenerative Biology'
    },
    dates: {
      receptionDate: '2023-09-01',
      resultsDateISO: '2023-09-06',
      resultsDateSlash: '06/09/2023',
      resultsTimestamp: new Date('2023-09-06T00:00:00Z')
    },
    results: {
      telomereLengthKb: 2.36,
      realAge: 33,
      estimatedBiologicalAge: 31,
      agingDelta: -2,
      classification: 'Young',
      interpretation: 'Your biological age is less than your real age (-2 years). At the cellular level you are fine (2.36 kb).'
    },
    activeIngredients: ['Oral Ginkgo Biloba', 'Oral Astaxanthin', 'Oral Coenzyme Q10', 'Cyanocobalamin (Vitamin B12)', 'Folic Acid (Vitamin B9)'],
    items: [
      {
        name: 'Oral Ginkgo Biloba',
        dose: '175 mg',
        activeIngredient: 'Ginkgo Biloba Extract',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning (100 capsules, Hygrocaps)'
      },
      {
        name: 'Oral Astaxanthin',
        dose: '9 mg',
        activeIngredient: 'Astaxanthin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Coenzyme Q10',
        dose: '35 mg',
        activeIngredient: 'Coenzyme Q10',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Cyanocobalamin (Vitamin B12)',
        dose: '1 mg',
        activeIngredient: 'Cyanocobalamin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Folic Acid (Vitamin B9)',
        dose: '1 mg',
        activeIngredient: 'Folic Acid',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      }
    ],
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Neuro-Vascular & Cellular Protection Capsule',
        volume: '100 capsules',
        dispensingForm: 'Oral Capsule (Hygrocaps)',
        posology: 'One capsule daily in the morning',
        ingredients: [
          { name: 'Oral Ginkgo Biloba', dose: '175 mg' },
          { name: 'Oral Astaxanthin', dose: '9 mg' },
          { name: 'Oral Coenzyme Q10', dose: '35 mg' },
          { name: 'Cyanocobalamin (Vitamin B12)', dose: '1 mg' },
          { name: 'Folic Acid (Vitamin B9)', dose: '1 mg' }
        ]
      }
    ]
  },

  // 3. Rehab Serafi
  {
    code: 'BOX02171AATEL',
    patient: {
      id: 'patient-rehab-serafi',
      name: 'Rehab Serafi',
      fullName: 'Rehab Serafi',
      dob: '1973-11-01',
      dateOfBirth: '01-11-1973',
      gender: 'Male',
      age: 51,
      heightCm: 182,
      weightKg: 110,
      stress: 'A lot',
      activity: '60 min, high intensity, almost every day',
      sampleType: 'Oral mucosa buccal swab'
    },
    clinic: {
      id: 'clinic-dr-rehab-serafi',
      name: 'Dr. Rehab Serafi Clinic',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    },
    doctor: {
      id: 'dr-rehab-serafi',
      name: 'Dr. Rehab Serafi',
      email: 'rehab.serafi@mediluxeme.com',
      specialty: 'Clinical Medicine & Longevity Care'
    },
    dates: {
      receptionDate: '2024-10-24',
      resultsDateISO: '2024-10-31',
      resultsDateSlash: '31/10/2024',
      resultsTimestamp: new Date('2024-10-31T00:00:00Z')
    },
    results: {
      telomereLengthKb: 0.38,
      realAge: 51,
      estimatedBiologicalAge: 57,
      agingDelta: 6,
      classification: 'Very aged',
      interpretation: 'Its biological age shows a marked aging with respect to its chronological age (+6 years). Its cells have a telomeric length much shorter than expected (0.38 kb).'
    },
    activeIngredients: ['Oral Green Tea (GreenSelect)', 'Turmeric dry extract', 'Oral Astaxanthin', 'Oral Coenzyme Q10', 'Metformin', 'Testosterone', 'Astaxanthin', 'Pentravan'],
    items: [
      {
        name: 'Oral Green Tea (GreenSelect)',
        dose: '120 mg',
        activeIngredient: 'Green Tea Extract (EGCG)',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning (100 capsules, Hygrocaps)'
      },
      {
        name: 'Turmeric dry extract',
        dose: '250 mg',
        activeIngredient: 'Curcumin / Turmeric dry extract',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Astaxanthin',
        dose: '12 mg',
        activeIngredient: 'Astaxanthin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Coenzyme Q10',
        dose: '50 mg',
        activeIngredient: 'Coenzyme Q10',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Metformin',
        dose: '100 mg',
        activeIngredient: 'Metformin HCl',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas (Pentravan c.s.p 1 g)'
      },
      {
        name: 'Testosterone Micronized',
        dose: '3 mg',
        activeIngredient: 'Testosterone Micronized',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas'
      },
      {
        name: 'Astaxanthin Transdermal',
        dose: '20 mg',
        activeIngredient: 'Astaxanthin Micronized',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas'
      },
      {
        name: 'Pentravan™',
        dose: 'c.s.p 1 g',
        activeIngredient: 'Pentravan Transdermal Vanishing Cream Base',
        isVehicleOrBase: true,
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2
      }
    ],
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Polyphenol & Mitochondrial Capsule Formula',
        volume: '100 capsules',
        dispensingForm: 'Oral Capsule (Hygrocaps)',
        posology: 'One capsule daily in the morning',
        ingredients: [
          { name: 'Oral Green Tea (GreenSelect)', dose: '120 mg' },
          { name: 'Turmeric dry extract', dose: '250 mg' },
          { name: 'Oral Astaxanthin', dose: '12 mg' },
          { name: 'Oral Coenzyme Q10', dose: '50 mg' }
        ]
      },
      {
        treatmentType: 'Transdermal treatment',
        treatmentProgram: 'Metformin + Testosterone + Astaxanthin Transdermal Cream',
        volume: 'Pentravan c.s.p 1 g',
        dispensingForm: 'Transdermal Vanishing Cream',
        posology: 'Apply once per day in transdermal areas',
        ingredients: [
          { name: 'Metformin', dose: '100 mg' },
          { name: 'Testosterone', dose: '3 mg' },
          { name: 'Astaxanthin', dose: '20 mg' },
          { name: 'Pentravan', dose: 'c.s.p 1 g', isVehicleOrBase: true }
        ]
      }
    ]
  },

  // 4. Saeed Dalmook
  {
    code: 'BOX00623AATEL',
    patient: {
      id: 'patient-saeed-dalmook',
      name: 'Saeed Dalmook',
      fullName: 'Saeed Dalmook',
      dob: '1982-09-25',
      dateOfBirth: '25-09-1982',
      gender: 'Male',
      age: 43,
      heightCm: 169,
      weightKg: 74,
      stress: 'Chronic(+5 years)',
      activity: '30 min, moderate intensity, almost every day',
      sampleType: 'Oral mucosa buccal swab'
    },
    clinic: {
      id: 'IdDU1oK1VuAVVYrGz6E7',
      name: 'My London Skin Clinic',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    },
    doctor: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      email: 'mylondonskinclinicgenomics@gmail.com',
      specialty: 'Aesthetic Medicine & Regenerative Biology'
    },
    dates: {
      receptionDate: '2023-09-01',
      resultsDateISO: '2023-09-06',
      resultsDateSlash: '06/09/2023',
      resultsTimestamp: new Date('2023-09-06T00:00:00Z')
    },
    results: {
      telomereLengthKb: 0.97,
      realAge: 43,
      estimatedBiologicalAge: 55,
      agingDelta: 12,
      classification: 'Very aged',
      interpretation: 'Its biological age shows a marked aging with respect to its chronological age (+12 years). Its cells have a telomeric length much shorter than expected (0.97 kb).'
    },
    activeIngredients: ['Turmeric dry extract', 'Oral Astaxanthin', 'Oral Coenzyme Q10', 'Oral Vitamin C', 'Metformin', 'Testosterone', 'Pentravan'],
    items: [
      {
        name: 'Turmeric dry extract',
        dose: '250 mg',
        activeIngredient: 'Curcumin / Turmeric dry extract',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning (100 capsules, Hygrocaps)'
      },
      {
        name: 'Oral Astaxanthin',
        dose: '12 mg',
        activeIngredient: 'Astaxanthin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Coenzyme Q10',
        dose: '50 mg',
        activeIngredient: 'Coenzyme Q10',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Vitamin C',
        dose: '80 mg',
        activeIngredient: 'Ascorbic Acid (Vitamin C)',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Metformin',
        dose: '100 mg',
        activeIngredient: 'Metformin HCl',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas (Pentravan c.s.p 1 g)'
      },
      {
        name: 'Testosterone Micronized',
        dose: '3 mg',
        activeIngredient: 'Testosterone Micronized',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas'
      },
      {
        name: 'Pentravan™',
        dose: 'c.s.p 1 g',
        activeIngredient: 'Pentravan Transdermal Vanishing Cream Base',
        isVehicleOrBase: true,
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2
      }
    ],
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Antioxidant & Telomere Protection Capsule',
        volume: '100 capsules',
        dispensingForm: 'Oral Capsule (Hygrocaps)',
        posology: 'One capsule daily in the morning',
        ingredients: [
          { name: 'Turmeric dry extract', dose: '250 mg' },
          { name: 'Oral Astaxanthin', dose: '12 mg' },
          { name: 'Oral Coenzyme Q10', dose: '50 mg' },
          { name: 'Oral Vitamin C', dose: '80 mg' }
        ]
      },
      {
        treatmentType: 'Transdermal treatment',
        treatmentProgram: 'Pentravan Transdermal Hormone & Longevity Cream',
        volume: 'Pentravan c.s.p 1 g',
        dispensingForm: 'Transdermal Vanishing Cream',
        posology: 'Apply once per day in transdermal areas',
        ingredients: [
          { name: 'Metformin', dose: '100 mg' },
          { name: 'Testosterone', dose: '3 mg' },
          { name: 'Pentravan', dose: 'c.s.p 1 g', isVehicleOrBase: true }
        ]
      }
    ]
  },

  // 5. Saeed Al Maktoum
  {
    code: 'BOX03533AATEL',
    patient: {
      id: 'patient-saeed-al-maktoum',
      name: 'Saeed Al Maktoum',
      fullName: 'Saeed Al Maktoum',
      dob: '1982-09-27',
      dateOfBirth: '27-09-1982',
      gender: 'Male',
      age: 43,
      heightCm: 169,
      weightKg: 68,
      stress: 'Nothing',
      activity: '60 min, high intensity, almost every day',
      sampleType: 'Oral mucosa buccal swab'
    },
    clinic: {
      id: 'IdDU1oK1VuAVVYrGz6E7',
      name: 'My London Skin Clinic',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    },
    doctor: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      email: 'mylondonskinclinicgenomics@gmail.com',
      specialty: 'Aesthetic Medicine & Regenerative Biology'
    },
    dates: {
      receptionDate: '2026-04-08',
      resultsDateISO: '2026-04-27',
      resultsDateSlash: '27/04/2026',
      resultsTimestamp: new Date('2026-04-27T00:00:00Z')
    },
    results: {
      telomereLengthKb: 0.29,
      realAge: 43,
      estimatedBiologicalAge: 57,
      agingDelta: 14,
      classification: 'Very aged',
      interpretation: 'Its biological age shows a marked aging with respect to its chronological age (+14 years). Its cells have a telomeric length much shorter than expected (0.29 kb).'
    },
    activeIngredients: ['Turmeric dry extract', 'Oral Astaxanthin', 'Oral Coenzyme Q10', 'Oral Vitamin C', 'Metformin', 'Testosterone', 'Pentravan'],
    items: [
      {
        name: 'Turmeric dry extract',
        dose: '250 mg',
        activeIngredient: 'Curcumin / Turmeric dry extract',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning (100 capsules, Hygrocaps)'
      },
      {
        name: 'Oral Astaxanthin',
        dose: '12 mg',
        activeIngredient: 'Astaxanthin',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Coenzyme Q10',
        dose: '50 mg',
        activeIngredient: 'Coenzyme Q10',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Oral Vitamin C',
        dose: '80 mg',
        activeIngredient: 'Ascorbic Acid (Vitamin C)',
        formulationBlock: 'Oral treatment',
        formulationIndex: 1,
        posology: '1 capsule daily in the morning'
      },
      {
        name: 'Metformin',
        dose: '100 mg',
        activeIngredient: 'Metformin HCl',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas (Pentravan c.s.p 1 g)'
      },
      {
        name: 'Testosterone Micronized',
        dose: '3 mg',
        activeIngredient: 'Testosterone Micronized',
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2,
        posology: 'Apply once per day in transdermal areas'
      },
      {
        name: 'Pentravan™',
        dose: 'c.s.p 1 g',
        activeIngredient: 'Pentravan Transdermal Vanishing Cream Base',
        isVehicleOrBase: true,
        formulationBlock: 'Transdermal treatment',
        formulationIndex: 2
      }
    ],
    formulations: [
      {
        treatmentType: 'Oral treatment',
        treatmentProgram: 'Antioxidant & Telomere Protection Capsule',
        volume: '100 capsules',
        dispensingForm: 'Oral Capsule (Hygrocaps)',
        posology: 'One capsule daily in the morning',
        ingredients: [
          { name: 'Turmeric dry extract', dose: '250 mg' },
          { name: 'Oral Astaxanthin', dose: '12 mg' },
          { name: 'Oral Coenzyme Q10', dose: '50 mg' },
          { name: 'Oral Vitamin C', dose: '80 mg' }
        ]
      },
      {
        treatmentType: 'Transdermal treatment',
        treatmentProgram: 'Pentravan Transdermal Hormone & Longevity Cream',
        volume: 'Pentravan c.s.p 1 g',
        dispensingForm: 'Transdermal Vanishing Cream',
        posology: 'Apply once per day in transdermal areas',
        ingredients: [
          { name: 'Metformin', dose: '100 mg' },
          { name: 'Testosterone', dose: '3 mg' },
          { name: 'Pentravan', dose: 'c.s.p 1 g', isVehicleOrBase: true }
        ]
      }
    ]
  }
];

async function runImport() {
  console.log(`🚀 [Import 5 TeloTest Reports] Starting execution for ${reports.length} reports...`);

  for (const r of reports) {
    console.log(`\n─────────────────────────────────────────────────────────────────`);
    console.log(`📦 Processing ${r.code} - ${r.patient.name} (${r.dates.resultsDateSlash})`);

    // 1. Patient Record
    const patRef = db.collection('patients').doc(r.patient.id);
    await patRef.set({
      id: r.patient.id,
      name: r.patient.name,
      fullName: r.patient.fullName,
      dob: r.patient.dob,
      dateOfBirth: r.patient.dateOfBirth,
      gender: r.patient.gender,
      age: r.patient.age,
      heightCm: r.patient.heightCm,
      weightKg: r.patient.weightKg,
      stress: r.patient.stress,
      activity: r.patient.activity,
      fagronPatientId: r.code,
      sampleCode: r.code,
      sampleType: r.patient.sampleType,
      clinicId: r.clinic.id,
      clinicName: r.clinic.name,
      doctorId: r.doctor.id,
      doctorName: r.doctor.name,
      doctorEmail: r.doctor.email,
      wholesalerId: r.clinic.wholesalerId,
      wholeseller: r.clinic.wholeseller,
      status: 'active',
      createdAt: r.dates.resultsTimestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✅ Patient saved: ${r.patient.id}`);

    // 2. Lab Result Record
    const labId = `LAB-${r.code}`;
    const labRef = db.collection('lab_results').doc(labId);
    await labRef.set({
      id: labId,
      code: r.code,
      sampleCode: r.code,
      protocolNumber: r.code,
      patientCode: r.patient.id,
      patientName: r.patient.name,
      patientId: r.patient.id,
      patient: {
        name: r.patient.name,
        dob: r.patient.dateOfBirth,
        gender: r.patient.gender,
        age: r.patient.age
      },
      doctorId: r.doctor.id,
      doctorName: r.doctor.name,
      doctorEmail: r.doctor.email,
      doctorSpecialty: r.doctor.specialty,
      clinicId: r.clinic.id,
      clinicName: r.clinic.name,
      wholesalerId: r.clinic.wholesalerId,
      wholeseller: r.clinic.wholeseller,
      testName: 'Fagron TeloTest™ Genetic Telomeric Length & Biological Age Report',
      testType: 'telotest_genomics',
      shortName: 'TeloTest™ DNA Telomere Length',
      sampleType: 'Oral Mucosa Swab (Absolute qPCR)',
      date: r.dates.resultsDateISO,
      resultsDate: r.dates.resultsDateISO,
      analysisDate: r.dates.resultsDateISO,
      reportDate: r.dates.resultsDateISO,
      receiptDate: r.dates.receptionDate,
      value: r.results.telomereLengthKb,
      unit: 'kb',
      realAge: r.results.realAge,
      estimatedBiologicalAge: r.results.estimatedBiologicalAge,
      agingDelta: r.results.agingDelta,
      classification: r.results.classification,
      keyFindings: {
        telomereLength: `${r.results.telomereLengthKb} kb`,
        realAge: `${r.results.realAge} years`,
        estimatedBiologicalAge: `${r.results.estimatedBiologicalAge} ± 1 years`,
        agingDelta: `${r.results.agingDelta > 0 ? '+' : ''}${r.results.agingDelta} years`,
        status: r.results.classification,
        interpretation: r.results.interpretation
      },
      laboratory: {
        name: 'Fagron Genomics S.L.U.',
        address: 'C/ de les Cosidores, 150, 08226 Terrassa, Barcelona (Spain)',
        country: 'Spain',
        standards: 'Regulation (EU) 2017/746 / CE-IVD',
        license: 'SRN: ES-MF-000001092'
      },
      status: 'completed',
      createdAt: r.dates.resultsTimestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✅ Lab Result saved: ${labId}`);

    // 3. Prescription Record
    const rxId = `RX-${r.code}`;
    const rxRef = db.collection('prescriptions').doc(rxId);
    await rxRef.set({
      id: rxId,
      code: rxId,
      prescriptionCode: rxId,
      sampleCode: r.code,
      protocolNumber: r.code,
      protocolCode: r.code,
      date: r.dates.resultsDateSlash,
      prescriptionDate: r.dates.resultsDateSlash,
      resultsDate: r.dates.resultsDateISO,
      dateIssued: r.dates.resultsDateISO,
      mfgDate: r.dates.resultsDateISO,
      prodDate: r.dates.resultsDateISO,
      patientName: r.patient.name,
      patientId: r.patient.id,
      patient: {
        name: r.patient.name,
        dob: r.patient.dateOfBirth,
        gender: r.patient.gender,
        age: r.patient.age
      },
      doctorName: r.doctor.name,
      doctorId: r.doctor.id,
      doctorEmail: r.doctor.email,
      doctorSpecialty: r.doctor.specialty,
      doctor: {
        name: r.doctor.name,
        id: r.doctor.id,
        email: r.doctor.email,
        clinicName: r.clinic.name,
        clinicId: r.clinic.id
      },
      clinicName: r.clinic.name,
      clinicId: r.clinic.id,
      wholesalerId: r.clinic.wholesalerId,
      wholeseller: r.clinic.wholeseller,
      wholesellerName: r.clinic.wholeseller,
      treatmentProgram: 'Fagron TeloTest',
      treatmentTitle: 'TeloTest™ Personalized Cellular Longevity Protocol',
      regimenCategory: 'Micronutrient & Mitochondrial Vitality',
      regimenCategoryId: 'micronutrient_mito',
      regimenCategoryCode: 'NUTRI-RX',
      regimenShortTitle: 'TeloTest',
      regimenCategoryShort: 'Nutraceutical & Transdermal',
      activeIngredientsSummary: r.activeIngredients.slice(0, 5).join(' · '),
      items: r.items,
      formulations: r.formulations,
      status: 'approved',
      validationStatus: 'Ready',
      importSource: 'fagron_genomics',
      sourceType: 'fagron_genomics',
      createdAt: r.dates.resultsTimestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✅ Prescription saved: ${rxId} with date ${r.dates.resultsDateSlash}`);
  }

  console.log(`\n✨ [Import Complete] All 5 Fagron TeloTest reports imported successfully into Firestore.`);
}

runImport().catch(err => {
  console.error('❌ Error during import:', err);
  process.exit(1);
});
