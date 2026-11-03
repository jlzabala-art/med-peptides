import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { validateAndNormalizeAgreement } from '../repositories/agreementWriteGuard.js';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const rawGenomicsAgreement = {
  id: '24genomics-qatar-ryhanh',
  slug: '24genomics-qatar',
  documentRef: 'DOC-QA-24G-2026-V1',
  partnerName: 'Hossam Ahmed',
  organization: 'Ryhanh Medical Company',
  territory: 'State of Qatar (Exclusive B2B)',
  tier: 'Exclusive Clinical Partner',
  pricingBasis: 'Delivered Duty Paid (DDP Doha / GCC)',
  title: '24GENETICS® CLINICAL NUTRIGENOMICS & DNA INTELLIGENCE SCHEDULE',
  subtitle: 'Complete Genomic Translation & Clinical Protocol Platform · State of Qatar',
  status: 'active',
  baseCurrency: 'AED',
  orderQuantity: 50,
  securedDiscountPct: 22,
  pegRates: {
    EUR_AED: 4.40,
    EUR_QAR: 4.36,
    AED_QAR: 1.00,
    QAR_USD: 3.64,
    AED_USD: 3.6725
  },
  volumeTiers: [
    {
      id: 'tier-1',
      name: '1 Nutrition test + Ancestry Test + Kit Test',
      shortLabel: '1 Kit (Single)',
      quantity: 1,
      mediluxeCostEur: 169.00,
      costAed: 743.60,
      totalKitAed: 743.60,
      returnShippingAed: 200.00,
      totalCostAed: 943.60,
      perKitCostAed: 943.60,
      marginSalesPct: 10.0,
      marginSalesAed: 104.84,
      distributionPriceAed: 1048.44,
      distributionPriceQar: 1048.44,
      unitPriceQar: 1048.44,
      totalPriceQar: 1048.44,
      unitPriceUsd: 285.50,
      totalPriceUsd: 285.50
    },
    {
      id: 'tier-50',
      name: '50 Nutrition test + Ancestry Test + Kit Test',
      shortLabel: '50 Kits (Batch)',
      quantity: 50,
      mediluxeCostEur: 159.00,
      costAed: 699.60,
      totalKitAed: 34980.00,
      returnShippingAed: 1000.00,
      totalCostAed: 35980.00,
      perKitCostAed: 719.60,
      marginSalesPct: 10.0,
      marginSalesAed: 79.96,
      distributionPriceAed: 799.56,
      distributionPriceQar: 799.56,
      unitPriceQar: 799.56,
      totalPriceQar: 39977.78,
      unitPriceUsd: 217.75,
      totalPriceUsd: 10887.50
    },
    {
      id: 'tier-100',
      name: '100 Nutrition test + Ancestry Test + Kit Test',
      shortLabel: '100 Kits (Clinic Batch)',
      quantity: 100,
      mediluxeCostEur: 149.00,
      costAed: 655.60,
      totalKitAed: 65560.00,
      returnShippingAed: 2000.00,
      totalCostAed: 67560.00,
      perKitCostAed: 675.60,
      marginSalesPct: 10.0,
      marginSalesAed: 75.07,
      distributionPriceAed: 750.67,
      distributionPriceQar: 750.67,
      unitPriceQar: 750.67,
      totalPriceQar: 75066.67,
      unitPriceUsd: 204.43,
      totalPriceUsd: 20443.00
    }
  ],
  aiSubscription: {
    name: 'Monthly AI Subscription',
    costEur: 10.45,
    costAed: 45.98,
    marginSalesPct: 10.0,
    marginSalesAed: 5.11,
    priceAed: 51.09,
    priceQar: 51.09,
    priceEur: 11.61,
    billingPeriod: 'monthly'
  },
  items: [
    {
      id: '24g-nutrition-ancestry-kit',
      name: '1 Nutrition test + Ancestry Test + Kit Test',
      quantity: 50,
      unitPriceAed: 799.56,
      unitPriceQar: 799.56,
      unitPriceUsd: 217.75,
      actives: '700,000+ SNPs Illumina GSA Array · Saliva Buccal Swab · ISO 15189 European Core Lab'
    },
    {
      id: '24g-ai-subscription',
      name: 'Monthly Clinical AI Companion Subscription (Optional)',
      quantity: 1,
      unitPriceAed: 51.09,
      unitPriceQar: 51.09,
      unitPriceUsd: 13.90,
      actives: 'Julia AI Multimodal Video Translation + 24/7 Precision Nutrition Copilot'
    }
  ],
  keyConditions: [
    {
      title: 'European Laboratory Cost Anchor (@ 1 EUR = 4.40 AED)',
      text: 'Laboratory production cost is anchored in EUR (€149 - €169 per test based on volume tier) and converted to AED at a fixed reference rate of 1 EUR = 4.40 AED.'
    },
    {
      title: 'Prepaid Return Cold-Chain Logistics Included',
      text: 'Return shipping of biological saliva specimens to European CE-IVD Core Lab in Madrid is included (AED 200 for 1 kit, AED 1,000 for 50 kits, AED 2,000 for 100 kits).'
    },
    {
      title: 'Distributor Margin on Sales (10%)',
      text: 'Landed distribution cost includes an approved 10% margin on sales (AED 75.07 to AED 104.84 per test).'
    },
    {
      title: 'Prepayment Terms',
      text: '100% advance wire transfer payment with purchase order before laboratory kit dispatch from Europe.'
    },
    {
      title: 'Monthly AI Subscription at EUR 10.45',
      text: 'Optional recurring digital AI patient companion subscription available at EUR 10.45 (AED 45.98 cost / AED 51.09 distribution price per active monthly user).'
    }
  ]
};

async function run() {
  console.log('1. Validating 24Genetics agreement via agreementWriteGuard...');
  const validated = validateAndNormalizeAgreement(rawGenomicsAgreement);
  console.log('✓ Validation successful:', validated.id);

  console.log('2. Writing to Firestore collection commercial_agreements...');
  
  // Write primary doc
  const docRef = db.collection('commercial_agreements').doc(validated.id);
  await docRef.set({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  }, { merge: true });
  console.log(`✓ Seeded ${validated.id}`);

  // Also write slug alias doc so both IDs resolve immediately
  if (validated.slug && validated.slug !== validated.id) {
    const slugRef = db.collection('commercial_agreements').doc(validated.slug);
    await slugRef.set({
      ...validated,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`✓ Seeded slug alias ${validated.slug}`);
  }

  console.log('3. Updating Wholesaler Ryhanh Profile assignedGenomicsAgreementId...');
  const wholesalerRef = db.collection('wholesalers').doc('ryhanh-medical-qatar');
  await wholesalerRef.set({
    assignedGenomicsAgreement: validated.id,
    genomicsTierPricing: validated.volumeTiers,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  console.log('✓ Updated wholesaler ryhanh-medical-qatar');

  console.log('All 24Genetics Firestore data updated successfully!');
}

run().catch(err => {
  console.error('Failed to seed 24Genetics agreement in Firebase:', err);
  process.exit(1);
});

