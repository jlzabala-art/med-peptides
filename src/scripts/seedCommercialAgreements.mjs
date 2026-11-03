import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const agreements = [
  {
    id: 'colway-qatar-ryhanh',
    slug: 'colway-qatar',
    documentRef: 'DOC-QA-COL-2026-V1',
    partnerName: 'Hossam Ahmed',
    organization: 'Ryhanh Medical Company',
    territory: 'State of Qatar (Exclusive B2B)',
    tier: 'Authorized Commercial Distributor',
    pricingBasis: 'CIF Doha Port of Entry (excl. 5% local VAT)',
    title: 'COLWAY® CLINICAL HAIR CARE & TRICHOLOGY SCHEDULE',
    subtitle: 'Exclusive B2B Commercial Distribution Architecture · State of Qatar Territory',
    status: 'active',
    baseCurrency: 'PLN',
    securedDiscountPct: 18,
    orderQuantity: 80,
    pegRates: {
      QAR_USD: 3.6795,
      PLN_USD: 3.9268,
      QAR_PLN: 0.92098
    },
    pricing: {
      unitProductPricePln: 102.00,
      unitShippingPln: 19.73,
      unitTotalPln: 121.73,
      unitProductPriceUsd: 26.00,
      unitShippingUsd: 5.00,
      unitTotalUsd: 31.00,
      unitProductPriceQar: 93.94,
      unitShippingQar: 18.06,
      unitDistributorPriceQar: 112.00,
      unitRecommendedRetailQar: 187.00,
      distributorGrossMarginPerUnit: 75.00,
      distributorGrossMarginPct: 40.1,
      distributorOpexPerUnit: 28.05,
      distributorNetProfitPerUnit: 44.74,
      distributorNetProfitPct: 23.93
    },
    totals: {
      totalDistributorInvoicePln: 9738.40,
      totalDistributorInvoiceUsd: 2480.00,
      totalDistributorInvoiceQar: 8960.00,
      totalDistributorGrossProfit: 6000.00,
      totalDistributorNetProfit: 3579.25
    },
    items: [
      {
        id: 'colway-shampoo-250',
        name: 'Colway Strengthening Anti-Hair Loss Shampoo (250 mL)',
        quantity: 40,
        unitPriceQar: 112.00,
        unitPriceUsd: 31.00,
        unitPricePln: 121.73,
        actives: 'Baicapil™ 2.0%, Native Fish Tropocollagen, Micronized Diosmin, Caffeine'
      },
      {
        id: 'colway-conditioner-200',
        name: 'Colway Strengthening Hair Conditioner (200 mL)',
        quantity: 40,
        unitPriceQar: 112.00,
        unitPriceUsd: 31.00,
        unitPricePln: 121.73,
        actives: 'Baicapil™, Native Tropocollagen, Hydrolyzed Keratin, Argan Oil, D-Panthenol'
      }
    ],
    keyConditions: [
      {
        title: 'Prepayment',
        text: 'Full payment to Colway is required prior to the dispatch of any order.'
      },
      {
        title: 'Dynamic Shipping & Regional Impact',
        text: 'The shipping cost can change depending on the dimensions and weight of the shipment. The situation in the region can have an additional price impact.'
      },
      {
        title: 'Currency Exchange',
        text: 'The price is set in PLN, so any currency fluctuation risk between PLN and US$ / QAR will be assumed on your end.'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: '24genomics-qatar-ryhanh',
    slug: '24genomics-qatar',
    documentRef: 'DOC-QA-24G-2026-V1',
    partnerName: 'Hossam Ahmed',
    organization: 'Ryhanh Medical Company',
    territory: 'State of Qatar (Exclusive B2B)',
    tier: 'Exclusive Clinical Partner',
    pricingBasis: 'Delivered Duty Paid (DDP Doha)',
    title: '24GENETICS® CLINICAL NUTRIGENOMICS & DNA INTELLIGENCE SCHEDULE',
    subtitle: 'Complete Genomic Translation & Clinical Protocol Platform · State of Qatar',
    status: 'active',
    baseCurrency: 'USD',
    securedDiscountPct: 22,
    orderQuantity: 25,
    keyConditions: [
      {
        title: 'Clinical Accreditation',
        text: 'All genetic data sequenced and processed under ISO 15189 and GDPR-compliant European laboratory protocols.'
      },
      {
        title: 'Multimodal Video Translation',
        text: 'Includes Julia AI personal video translation and 24/7 AI All-in-One clinical companion support.'
      },
      {
        title: 'Atlas 3-Capsule Protocol',
        text: 'Direct digital bridge into Atlas Health customized 60-day nutrigenomic formulation and prescription schedule.'
      }
    ],
    updatedAt: new Date().toISOString()
  }
];

async function seed() {
  console.log('Seeding commercial agreements into Firestore...');
  for (const agreement of agreements) {
    const docRef = db.collection('commercial_agreements').doc(agreement.id);
    await docRef.set({
      ...agreement,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`✓ Seeded agreement: ${agreement.id} (${agreement.slug})`);
  }
  console.log('Done!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

