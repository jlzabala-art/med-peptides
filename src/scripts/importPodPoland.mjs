import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceKeyPath = join(__dirname, 'serviceAccountKey.json');

let credential;
try {
  const raw = readFileSync(serviceKeyPath, 'utf-8');
  credential = cert(JSON.parse(raw));
} catch {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } else {
    console.error('❌  No Firebase credentials found.');
    process.exit(1);
  }
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

const inputData = {
  "catalog_name": "POD Poland Prefilled Pen Peptide Price List",
  "supplier": {
    "name": "POD Poland",
    "country": "Poland"
  },
  "category": "Prefilled Peptide Pens",
  "market": "Dubai, UAE",
  "source_currency": "AED",
  "target_currency": "USD",
  "source_prices_include_vat": true,
  "vat_rate": 0.05,
  "exchange_rate_aed_per_usd": 3.6725,
  "conversion_formula": "USD net cost = (AED gross / 1.05) / 3.6725",
  "pricing_visibility": "internal_cost_only",
  "effective_date": "2026-06",
  "product_count": 25,
  "products": [
    {
      "supplier_sku": "POD-PEN-001",
      "supplier": "POD Poland",
      "product_name": "AOD-9604",
      "dose": "15 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1400,
      "supplier_price_aed_excluding_vat": 1333.33,
      "supplier_cost_usd_excluding_vat": 363.10
    },
    {
      "supplier_sku": "POD-PEN-002",
      "supplier": "POD Poland",
      "product_name": "BPC-157",
      "dose": "15 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 900,
      "supplier_price_aed_excluding_vat": 857.14,
      "supplier_cost_usd_excluding_vat": 233.42
    },
    {
      "supplier_sku": "POD-PEN-003",
      "supplier": "POD Poland",
      "product_name": "BPC-157 / TB-500 Blend",
      "dose": "15 mg / 15 mg",
      "presentation": "Prefilled Pen",
      "format": "Combination Blend",
      "supplier_price_aed_including_vat": 1600,
      "supplier_price_aed_excluding_vat": 1523.81,
      "supplier_cost_usd_excluding_vat": 414.97
    },
    {
      "supplier_sku": "POD-PEN-004",
      "supplier": "POD Poland",
      "product_name": "CJC-1295",
      "dose": "5 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1000,
      "supplier_price_aed_excluding_vat": 952.38,
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-005",
      "supplier": "POD Poland",
      "product_name": "CJC-1295 / Ipamorelin Blend",
      "dose": "5 mg / 10 mg",
      "presentation": "Prefilled Pen",
      "format": "Combination Blend",
      "supplier_price_aed_including_vat": 1600,
      "supplier_price_aed_excluding_vat": 1523.81,
      "supplier_cost_usd_excluding_vat": 414.97
    },
    {
      "supplier_sku": "POD-PEN-006",
      "supplier": "POD Poland",
      "product_name": "DSIP",
      "dose": "5 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 900,
      "supplier_price_aed_excluding_vat": 857.14,
      "supplier_cost_usd_excluding_vat": 233.42
    },
    {
      "supplier_sku": "POD-PEN-007",
      "supplier": "POD Poland",
      "product_name": "Epitalon",
      "dose": "50 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1500,
      "supplier_price_aed_excluding_vat": 1428.57,
      "supplier_cost_usd_excluding_vat": 389.03
    },
    {
      "supplier_sku": "POD-PEN-008",
      "supplier": "POD Poland",
      "product_name": "GHK-Cu",
      "dose": "60 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 800,
      "supplier_price_aed_excluding_vat": 761.90,
      "supplier_cost_usd_excluding_vat": 207.49
    },
    {
      "supplier_sku": "POD-PEN-009",
      "supplier": "POD Poland",
      "product_name": "GLOW (GHK-Cu / BPC-157 / TB-500)",
      "dose": "60 mg / 15 mg / 15 mg",
      "presentation": "Prefilled Pen",
      "format": "Combination Blend",
      "supplier_price_aed_including_vat": 2000,
      "supplier_price_aed_excluding_vat": 1904.76,
      "supplier_cost_usd_excluding_vat": 518.71
    },
    {
      "supplier_sku": "POD-PEN-010",
      "supplier": "POD Poland",
      "product_name": "HGH Fragment",
      "dose": "5 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 2700,
      "supplier_price_aed_excluding_vat": 2571.43,
      "supplier_cost_usd_excluding_vat": 700.26
    },
    {
      "supplier_sku": "POD-PEN-011",
      "supplier": "POD Poland",
      "product_name": "Ipamorelin",
      "dose": "5 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 800,
      "supplier_price_aed_excluding_vat": 761.90,
      "supplier_cost_usd_excluding_vat": 207.49
    },
    {
      "supplier_sku": "POD-PEN-012",
      "supplier": "POD Poland",
      "product_name": "Kisspeptin-10",
      "dose": "6 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1000,
      "supplier_price_aed_excluding_vat": 952.38,
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-013",
      "supplier": "POD Poland",
      "product_name": "KPV",
      "dose": "10 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1200,
      "supplier_price_aed_excluding_vat": 1142.86,
      "supplier_cost_usd_excluding_vat": 311.23
    },
    {
      "supplier_sku": "POD-PEN-014",
      "supplier": "POD Poland",
      "product_name": "MOTS-C",
      "dose": "30 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1300,
      "supplier_price_aed_excluding_vat": 1238.10,
      "supplier_cost_usd_excluding_vat": 337.16
    },
    {
      "supplier_sku": "POD-PEN-015",
      "supplier": "POD Poland",
      "product_name": "NAD+",
      "dose": "500 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1000,
      "supplier_price_aed_excluding_vat": 952.38,
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-016",
      "supplier": "POD Poland",
      "product_name": "PT-141",
      "dose": "20 mg",
      "presentation": "Prefilled Pen",
      "format": "Monotherapy",
      "supplier_price_aed_including_vat": 1000,
      "supplier_price_aed_excluding_vat": 952.38,
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-017",
      "product_name": "Retatrutide",
      "dose": "10 mg",
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-018",
      "product_name": "Retatrutide",
      "dose": "20 mg",
      "supplier_cost_usd_excluding_vat": 311.23
    },
    {
      "supplier_sku": "POD-PEN-019",
      "product_name": "Retatrutide",
      "dose": "40 mg",
      "supplier_cost_usd_excluding_vat": 363.10
    },
    {
      "supplier_sku": "POD-PEN-020",
      "product_name": "Retatrutide",
      "dose": "60 mg",
      "supplier_cost_usd_excluding_vat": 414.97
    },
    {
      "supplier_sku": "POD-PEN-021",
      "product_name": "SS-31",
      "dose": "40 mg",
      "supplier_cost_usd_excluding_vat": 285.29
    },
    {
      "supplier_sku": "POD-PEN-022",
      "product_name": "TB-500",
      "dose": "15 mg",
      "supplier_cost_usd_excluding_vat": 259.36
    },
    {
      "supplier_sku": "POD-PEN-023",
      "product_name": "Tesamorelin",
      "dose": "60 mg",
      "supplier_cost_usd_excluding_vat": 726.20
    },
    {
      "supplier_sku": "POD-PEN-024",
      "product_name": "Thymosin Alpha",
      "dose": "12.8 mg",
      "supplier_cost_usd_excluding_vat": 233.42
    },
    {
      "supplier_sku": "POD-PEN-025",
      "product_name": "Tirzepatide",
      "dose": "60 mg",
      "supplier_cost_usd_excluding_vat": 259.36
    }
  ]
};

async function seed() {
  console.log('🚀 Starting POD Poland Import...');

  // 1. Create Supplier Document
  const supplierId = 'pod-poland';
  const supplierRef = db.collection('wholesellers').doc(supplierId);
  await supplierRef.set({
    name: 'POD Poland',
    country: 'Poland',
    status: 'active',
    currency: 'AED',
    category: 'Prefilled Peptide Pens',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`✅ Upserted supplier: ${supplierId}`);

  // 2. Insert Products
  const batch = db.batch();
  let count = 0;

  for (const item of inputData.products) {
    const isBlend = item.format === 'Combination Blend' || item.product_name.includes('/');
    
    // Some items might be missing AED prices, calculating from USD cost for Internal Purchase Price if needed.
    // The prompt says "Internal Purchase Price = Price in AED"
    // Wait, the prompt says "Internal Purchase Price = Price in AED".
    // "Preserve the original supplier price"
    const internalCostAed = item.supplier_price_aed_excluding_vat || (item.supplier_cost_usd_excluding_vat * 3.6725 * 1.05); // AED gross
    
    // Safe parse of tags
    const tags = [
      'peptide',
      'prefilled pen',
      isBlend ? 'blend' : 'monotherapy',
      'weight management',
      'longevity',
      'regenerative medicine',
      'aesthetics',
      'sexual health',
      'growth hormone',
      'NAD'
    ];

    const slug = item.supplier_sku.toLowerCase();
    const productRef = db.collection('products').doc(slug);

    const productData = {
      name: item.product_name,
      supplierId: supplierId,
      supplierName: 'POD Poland',
      productType: 'Prefilled Pen',
      presentation: 'Prefilled Pen',
      category: 'Prefilled Peptide Pens',
      status: 'active',
      dose: item.dose,
      sku: item.supplier_sku,
      pricing: {
        internalCostAed: item.supplier_price_aed_excluding_vat || null,
        supplierCostUsd: item.supplier_cost_usd_excluding_vat || null,
        publicPrice: null,
        margin: null,
        currency: 'AED',
        pricingVisibility: 'internal_cost_only' // "Do NOT display these prices to customers."
      },
      stock: 'Unknown',
      moq: 1,
      tags: tags,
      format: isBlend ? 'Combination Blend' : 'Monotherapy',
      blend: isBlend ? item.product_name.split('/').map(s => s.trim()) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    batch.set(productRef, productData, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`✅ Committed ${count} products to Firestore.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Error during import:', err);
  process.exit(1);
});
