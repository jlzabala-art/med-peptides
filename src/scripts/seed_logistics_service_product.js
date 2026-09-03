/**
 * seed_logistics_service_product.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers the initial Logistics Service product in Firestore according
 * to the new LogisticsSpecsSchema:
 *
 * Case:
 *   - Route: Dubai, UAE (Magenta Health) -> Vilnius, Lithuania (KM+ clinic)
 *   - Destination Address: Konstitucijos pr. 15, LT-09319, Vilnius, Lithuania
 *   - Cargo: 6 prefilled single cartridge pens
 *   - Weight: 2.0 kg
 *   - Temperature: 2-8°C Validated Cold-Chain with Temp Logger
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

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

async function seedLogisticsService() {
  console.log(`\n======================================================`);
  console.log(`🚚 SEED: Medical Cold-Chain Logistics Service Product`);
  console.log(`======================================================\n`);

  const now = new Date();
  const productId = 'logistics-magenta-dxb-to-km-vilnius';

  const logisticsSpecs = {
    serviceType: 'cold_chain_express',
    origin: {
      name: 'Magenta Health UAE',
      companyName: 'Magenta Health',
      contactPerson: 'Lynn Iglesia',
      phone: '04-2222500',
      street: 'Dubai Healthcare City',
      city: 'Dubai',
      country: 'AE',
      countryName: 'United Arab Emirates'
    },
    destination: {
      name: 'KM+ clinic (Vilnius)',
      companyName: 'KM+ clinic',
      street: 'Konstitucijos pr. 15',
      city: 'Vilnius',
      postalCode: 'LT-09319',
      country: 'LT',
      countryName: 'Lithuania',
      facilityNotes: 'Delivery to KM+ clinic reception / pharmaceutical delivery dock'
    },
    packageSpecs: {
      weightKg: 2.0,
      weightGrams: 2000,
      dimensions: {
        lengthCm: 25,
        widthCm: 20,
        heightCm: 15,
        volumeCm3: 7500,
        volumetricWeightKg: 1.5
      },
      totalUnits: 6,
      cargoDescription: '6 prefilled single cartridge pens'
    },
    coldChain: {
      required: true,
      temperatureRange: '2_8_c',
      tempLoggerIncluded: true,
      validatedHours: 72
    },
    carrierInfo: {
      carrierName: 'DHL Express Medical Cold Chain',
      serviceLevel: 'Medical Express (Next-Flight-Out 2-8°C)',
      estimatedDays: 3,
      incoterm: 'DAP'
    }
  };

  const productData = {
    id: productId,
    name: 'Medical Cold-Chain Logistics: Dubai → Vilnius (KM+ Clinic)',
    displayName: 'Express Cold-Chain Logistics: Dubai to Vilnius (KM+ Clinic)',
    canonicalName: 'Cold Chain Courier DXB to VNO (2.0kg / 6 pens)',
    productType: 'logistics_service',
    category: 'logistics_service',
    categoryId: 'logistics_service',
    type: 'service',
    status: 'active',
    isActive: true,
    featured: false,
    requiresColdChain: true,
    requiresPrescription: false,
    description: 'Temperature-controlled medical courier service (2-8°C) for 6 prefilled single cartridge pens (2.0 kg) shipped from Magenta Health in Dubai to KM+ clinic in Vilnius, Lithuania (Konstitucijos pr. 15, LT-09319). Includes 72h isothermal container and calibrated temperature datalogger.',
    shortDesc: 'Cold-chain express medical courier: Dubai (Magenta) → Vilnius, Lithuania (KM+ clinic, 2.0 kg).',
    supplier: 'DHL Express Medical / Magenta Logistics',
    supplierIds: ['supplier-lotusland', 'magenta-health'],
    tags: ['Logistics', 'Cold Chain', 'Medical Courier', 'Lithuania', 'Vilnius', 'Dubai', 'Prefilled Pens', 'KM+ Clinic'],
    searchAliases: ['Logistics Dubai to Vilnius', 'KM+ clinic delivery', '6 prefilled pens shipping', 'Lithuania medical courier'],
    route: 'Dubai (AE) → Vilnius (LT)',
    logisticsSpecs,
    pricing: {
      masterPrice: { base: 180.0, currency: 'EUR' },
      wholesalePrice: { base: 180.0, currency: 'EUR' },
      clinicPrice: { base: 210.0, currency: 'EUR' },
      retailPrice: { base: 250.0, currency: 'EUR' }
    },
    supplierPricing: {
      listPrice: 180.0,
      netCost: 180.0,
      currency: 'EUR',
      unitOfMeasure: 'shipment',
      supplierName: 'DHL Express Medical',
      originWarehouse: 'Dubai, UAE'
    },
    variants: [
      {
        id: 'logistics-dxb-vno-2kg-coldchain',
        name: 'Cold-Chain Express Shipping (2.0 kg / 6 Pens)',
        presentation: '72h Isothermal Shipper (2-8°C) with Temp Logger',
        format: 'medical_courier_service',
        supplier: 'DHL Express Medical',
        supplierName: 'DHL Express Medical',
        stock: 999,
        inStock: true,
        moq: 1,
        logisticsSpecs,
        pricing: {
          masterPrice: { base: 180.0, currency: 'EUR' },
          wholesalePrice: { base: 180.0, currency: 'EUR' },
          clinicPrice: { base: 210.0, currency: 'EUR' },
          retailPrice: { base: 250.0, currency: 'EUR' }
        }
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const docRef = db.collection('products').doc(productId);
  await docRef.set(productData, { merge: true });
  await docRef.collection('variants').doc('logistics-dxb-vno-2kg-coldchain').set(productData.variants[0]);

  console.log(`✅ Logistics Service Product created successfully:`);
  console.log(`   - Product ID    : ${productId}`);
  console.log(`   - Origin        : Dubai, UAE (Magenta Health)`);
  console.log(`   - Destination   : KM+ clinic, Konstitucijos pr. 15, Vilnius, Lithuania (LT-09319)`);
  console.log(`   - Cargo Weight  : 2.0 kg (6 prefilled pens)`);
  console.log(`   - Cold Chain    : 2-8°C with Temperature Data Logger`);
  console.log(`======================================================\n`);
}

seedLogisticsService().catch(err => {
  console.error('Error seeding logistics service:', err);
  process.exit(1);
});
