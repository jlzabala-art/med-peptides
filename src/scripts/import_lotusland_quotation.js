/**
 * import_lotusland_quotation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports the Lotusland commercial quotation into Firestore:
 * 1. Adds Tirzepatide 20mg Double Cartridge variant to 'tirzepatide'.
 * 2. Creates the Reusable Dual-Chamber Pen Device under 'clinical_supplies'.
 * 3. Registers the supplier quotation document in 'supplier_quotations'.
 *
 * Quotation Details:
 *   - 20 x Tirzepatide 20mg double cartridge @ 100 USD/pcs = 2000 USD (EU)
 *   - 20 x Pen for double cartridge @ 20 USD/pcs = 400 USD (China)
 *   - Shipping cost = 160 USD
 *   - Total = 2560 USD
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

async function importLotuslandQuotation() {
  console.log(`\n======================================================`);
  console.log(`💼 IMPORT: Lotusland Quotation & Catalog Products`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no writes)' : '⚡ LIVE WRITE TO FIRESTORE'}`);
  console.log(`======================================================\n`);

  const now = new Date();

  // ── 1. Update Tirzepatide Product with Double Cartridge Variant ─────────────────
  const tirzRef = db.collection('products').doc('tirzepatide');
  const tirzSnap = await tirzRef.get();

  const tirzVariant = {
    id: 'tirzepatide-20mg-double-cartridge-lotusland',
    name: 'Tirzepatide 20mg Double Cartridge (Refill)',
    dosage: '20mg',
    dose: '20mg',
    unit: 'cartridge',
    presentation: '20mg / 3ml Double Cartridge',
    presentationName: 'Double Cartridge Refill (3ml)',
    format: 'refill_cartridge',
    supplier: 'Lotusland Limited',
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    stock: 0,
    inStock: true,
    moq: 20,
    originWarehouse: 'EU Warehouse (Ship from EU)',
    penConfig: {
      penType: 'disposable_prefilled',
      cartridgeIncluded: true,
      cartridgeType: 'double_cartridge',
      chamberCount: 2,
      totalVolumeMl: 3.0,
      chambers: [
        {
          chamberIndex: 1,
          role: 'lyophilized_powder',
          substanceName: 'Tirzepatide',
          strengthMg: 20,
          volumeMl: 1.5
        },
        {
          chamberIndex: 2,
          role: 'diluent_reconstitution',
          substanceName: 'Bacteriostatic Water',
          volumeMl: 1.5
        }
      ],
      dosingSpecs: {
        clicksPerMl: 100,
        unitsPerClick: 0.01,
        maxDosePerInjectionMl: 0.6,
        reconstitutionRequired: true
      }
    },
    pricing: {
      masterPrice: { base: 100.0, currency: 'USD' },
      wholesalePrice: { base: 140.0, currency: 'USD' },
      clinicPrice: { base: 195.0, currency: 'USD' },
      retailPrice: { base: 290.0, currency: 'USD' }
    },
    supplierPricing: {
      listPrice: 100.0,
      netCost: 100.0,
      currency: 'USD',
      unitOfMeasure: 'cartridge',
      supplierId: 'supplier-lotusland',
      supplierName: 'Lotusland Limited',
      moq: 20,
      originWarehouse: 'EU Warehouse',
      lastQuotationDate: now.toISOString()
    }
  };

  if (tirzSnap.exists) {
    const tirzData = tirzSnap.data();
    const currentVariants = Array.isArray(tirzData.variants) ? [...tirzData.variants] : [];
    const idx = currentVariants.findIndex(v => v.id === tirzVariant.id);
    if (idx >= 0) {
      currentVariants[idx] = tirzVariant;
    } else {
      currentVariants.push(tirzVariant);
    }

    console.log(`📦 [CATALOG] Adding variant '${tirzVariant.id}' to product 'tirzepatide'`);
    if (!isDryRun) {
      await tirzRef.update({
        variants: currentVariants,
        updatedAt: now
      });
      // Also update subcollection variant
      await tirzRef.collection('variants').doc(tirzVariant.id).set(tirzVariant);
    }
  }

  // ── 2. Create Reusable Dual-Chamber Pen Device Product ────────────────────────
  const deviceDocId = 'reusable-dual-chamber-pen-device';
  const deviceRef = db.collection('products').doc(deviceDocId);
  const deviceProductData = {
    id: deviceDocId,
    name: 'Lotusland Precision Reusable Injector Pen (Dual-Chamber)',
    displayName: 'Lotusland Dual-Chamber Injector Pen Device',
    canonicalName: 'Reusable Double Cartridge Injector Pen',
    category: 'clinical_supplies',
    categoryId: 'clinical_supplies',
    type: 'clinical_supplies',
    status: 'active',
    isActive: true,
    description: 'Precision mechanical injector pen engineered for dual-chamber (double cartridge) peptide delivery. Micro-dial mechanism (100 clicks/ml) with high dosage accuracy.',
    shortDesc: 'Precision mechanical injector pen engineered for dual-chamber peptide cartridges.',
    supplier: 'Lotusland Limited',
    supplierIds: ['supplier-lotusland'],
    tags: ['Injector Pen', 'Double Cartridge', 'Dual Chamber', 'Clinical Supplies', 'Lotusland', 'Medical Device'],
    searchAliases: ['Pen for double cartridge', 'Reusable double cartridge pen', 'Lotusland dual chamber pen'],
    dosage: '0.01ml / click',
    format: 'reusable_pen_device',
    originWarehouse: 'China Warehouse (Ship from China)',
    penConfig: {
      penType: 'reusable_injector_device',
      cartridgeIncluded: false,
      cartridgeType: 'no_cartridge',
      chamberCount: 2,
      totalVolumeMl: 3.0,
      compatibility: {
        compatibleCartridgeMl: [3.0],
        compatibleChambers: [2],
        threadStandard: 'standard_dual_chamber_iso'
      },
      dosingSpecs: {
        clicksPerMl: 100,
        unitsPerClick: 0.01,
        maxDosePerInjectionMl: 0.6,
        reconstitutionRequired: false
      }
    },
    pricing: {
      masterPrice: { base: 20.0, currency: 'USD' },
      wholesalePrice: { base: 30.0, currency: 'USD' },
      clinicPrice: { base: 45.0, currency: 'USD' },
      retailPrice: { base: 65.0, currency: 'USD' }
    },
    supplierPricing: {
      listPrice: 20.0,
      netCost: 20.0,
      currency: 'USD',
      unitOfMeasure: 'pcs',
      supplierId: 'supplier-lotusland',
      supplierName: 'Lotusland Limited',
      moq: 20,
      originWarehouse: 'China Warehouse',
      lastQuotationDate: now.toISOString()
    },
    variants: [
      {
        id: 'reusable-pen-device-dual-chamber',
        name: 'Lotusland Dual-Chamber Reusable Pen Device',
        presentation: 'Precision Mechanical Pen (No Cartridge)',
        format: 'reusable_pen_device',
        supplier: 'Lotusland Limited',
        supplierId: 'supplier-lotusland',
        supplierName: 'Lotusland Limited',
        stock: 0,
        inStock: true,
        moq: 20,
        penConfig: {
          penType: 'reusable_injector_device',
          cartridgeIncluded: false,
          cartridgeType: 'no_cartridge',
          chamberCount: 2,
          totalVolumeMl: 3.0
        },
        pricing: {
          masterPrice: { base: 20.0, currency: 'USD' },
          wholesalePrice: { base: 30.0, currency: 'USD' },
          clinicPrice: { base: 45.0, currency: 'USD' },
          retailPrice: { base: 65.0, currency: 'USD' }
        },
        supplierPricing: {
          listPrice: 20.0,
          netCost: 20.0,
          currency: 'USD',
          unitOfMeasure: 'pcs',
          supplierId: 'supplier-lotusland',
          supplierName: 'Lotusland Limited',
          moq: 20
        }
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  console.log(`💉 [CATALOG] Creating/Updating device product '${deviceDocId}'`);
  if (!isDryRun) {
    await deviceRef.set(deviceProductData, { merge: true });
    await deviceRef.collection('variants').doc('reusable-pen-device-dual-chamber').set(deviceProductData.variants[0]);
  }

  // ── 3. Register Supplier Quotation in Firestore ────────────────────────────────
  const quoteDocId = 'SQ-LOTUS-2026-001';
  const quoteRef = db.collection('supplier_quotations').doc(quoteDocId);

  const supplierQuotationPayload = {
    quotationNumber: quoteDocId,
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    status: 'received',
    currency: 'USD',
    recipientType: 'clinic',
    docType: 'quotation',
    lineItems: [
      {
        productId: 'tirzepatide',
        variantId: 'tirzepatide-20mg-double-cartridge-lotusland',
        name: 'Tirzepatide 20mg Double Cartridge',
        quantity: 20,
        unitPrice: 100.0,
        totalPrice: 2000.0,
        supplierCost: 100.0,
        originWarehouse: 'EU Warehouse (Ship from EU)',
        format: 'refill_cartridge'
      },
      {
        productId: deviceDocId,
        variantId: 'reusable-pen-device-dual-chamber',
        name: 'Reusable Pen Device for Double Cartridge',
        quantity: 20,
        unitPrice: 20.0,
        totalPrice: 400.0,
        supplierCost: 20.0,
        originWarehouse: 'China Warehouse (Ship from China)',
        format: 'reusable_pen_device'
      }
    ],
    subtotal: 2400.0,
    shippingCost: 160.0,
    grandTotal: 2560.0,
    logisticsNotes: 'Multi-origin split shipment: 20 Tirzepatide double cartridges shipped from EU warehouse; 20 pen devices shipped from China.',
    paymentTerms: 'due_on_receipt',
    createdAt: now,
    updatedAt: now
  };

  console.log(`📑 [QUOTATION] Registering Supplier Quotation '${quoteDocId}' ($2,560.00 USD total)`);
  if (!isDryRun) {
    await quoteRef.set(supplierQuotationPayload);
  }

  console.log(`\n======================================================`);
  console.log(`✅ Completed Lotusland Ingestion Successfully:`);
  console.log(`   - Tirzepatide 20mg Double Cartridge Variant Configured`);
  console.log(`   - Reusable Dual-Chamber Pen Device Registered`);
  console.log(`   - Supplier Quotation SQ-LOTUS-2026-001 Created ($2,560.00 USD)`);
  console.log(`======================================================\n`);
}

importLotuslandQuotation().catch(err => {
  console.error('Error importing Lotusland quotation:', err);
  process.exit(1);
});
