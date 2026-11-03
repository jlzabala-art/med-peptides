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
    pricingBasis: 'Delivered Duty Paid (DDP Doha / GCC)',
    title: '24GENETICS® CLINICAL NUTRIGENOMICS & DNA INTELLIGENCE SCHEDULE',
    subtitle: 'Complete Genomic Translation & Clinical Protocol Platform · State of Qatar',
    status: 'active',
    baseCurrency: 'AED',
    securedDiscountPct: 22,
    orderQuantity: 50,
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

