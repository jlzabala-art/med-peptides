/**
 * seed_logistics_rfq.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers the complete logistics Request For Quotation (RFQ) in Firestore:
 *   - Client Request: KM+ clinic / Magenta Health requesting cold-chain transport
 *   - Origin: Magenta Health (Dubai Healthcare City, UAE) - Full Pickup Details
 *   - Destination: KM+ clinic (Vilnius, Lithuania) - Full Delivery Details
 *   - Cargo: 6 prefilled single cartridge pens (2.0 kg, 2-8°C cold chain)
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

async function seedLogisticsRFQ() {
  console.log(`\n======================================================`);
  console.log(`📋 REGISTER LOGISTICS RFQ (Dubai → Vilnius Cold Chain)`);
  console.log(`======================================================\n`);

  const now = new Date();
  const rfqId = 'RFQ-LOG-2026-001';

  const rfqPayload = {
    id: rfqId,
    prfqId: rfqId,
    rfqNumber: rfqId,
    type: 'logistics_service',
    status: 'pending_supplier', // 'pending_supplier' | 'supplier_quoted' | 'client_quoted' | 'accepted'
    serviceType: 'cold_chain_express',
    
    // 👤 Client Request Information
    client: {
      id: 'CE0nXEryOPhBs4fkA80WtnoSBx83',
      name: 'Magenta Health / Lynn Iglesia',
      companyName: 'Magenta Health',
      email: 'procurement@magenta-health.ae',
      phone: '+971 4 222 2500',
      zohoContactId: '7006116000000593278',
      role: 'compounding_pharmacy'
    },

    // 📍 Puntos de Recogida (Full Origin Manifest)
    pickupLocation: {
      facilityName: 'Magenta Health Compounding Pharmacy & Logistics Hub',
      companyName: 'Magenta Health LLC',
      contactPerson: 'Lynn Iglesia (Procurement & Dispatch Officer)',
      phone: '+971 4 222 2500',
      mobileDirect: '+971 50 123 4567',
      email: 'procurement@magenta-health.ae',
      dispatchEmail: 'dispatch@magenta-health.ae',
      street: 'Building 64, Block A, Suite 302, Dubai Healthcare City (DHCC)',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'AE',
      countryName: 'United Arab Emirates',
      operatingHours: 'Monday - Friday, 09:00 - 17:00 (GST / UTC+4)',
      pickupInstructions: 'Pick up at DHCC Suite 302 reception. Temperature-controlled isothermal shipper (2°C–8°C) ready with calibrated USB temperature datalogger.'
    },

    // 🏁 Puntos de Entrega (Full Destination Manifest)
    deliveryLocation: {
      facilityName: 'KM+ clinic (UAB KM Plius)',
      companyName: 'KM+ clinic',
      contactPerson: 'Medical Reception & Pharmacy Storage Dock',
      phone: '+370 5 200 0000',
      email: 'reception@kmclinic.lt',
      street: 'Konstitucijos pr. 15',
      city: 'Vilnius',
      state: 'Vilnius County',
      postalCode: 'LT-09319',
      country: 'LT',
      countryName: 'Lithuania',
      operatingHours: 'Monday - Friday, 08:30 - 18:00 (EET / UTC+2)',
      deliveryInstructions: 'Deliver directly to KM+ clinic reception. Immediate transfer to medical refrigeration unit (2-8°C).'
    },

    // 📦 Especificaciones de la Carga (Cargo Manifest)
    cargoSpecs: {
      itemCount: 6,
      itemDescription: '6 × Prefilled Single-Cartridge Injector Pens (Peptide Biologicals for Subcutaneous Injection)',
      grossWeightKg: 2.0,
      netWeightKg: 0.9,
      dimensionsCm: {
        length: 25,
        width: 20,
        height: 15,
        volumeCm3: 7500
      },
      temperatureRequirement: '2°C to 8°C (Controlled Cold Chain - Do Not Freeze)',
      isothermalPackaging: '72-Hour Validated VIP Insulated Shipper with Phase Change Gel Packs',
      tempLoggerIncluded: true,
      customsDeclaration: 'Therapeutic Peptide Solution (Non-infectious, Non-hazardous Diagnostic & Research Formulation)'
    },

    // 🚚 Proveedores Logísticos a Solicitar Cotización
    targetSuppliers: [
      { id: 'supplier-lotusland', name: 'Lotusland Logistics Division' },
      { id: 'dhl-medical-express', name: 'DHL Express Medical Cold Chain' },
      { id: 'world-courier', name: 'World Courier Biological Logistics' }
    ],

    incoterm: 'DAP (Delivered at Place, Vilnius)',
    estimatedCost: 180.0,
    currency: 'EUR',
    marginTargetPercent: 6.0,

    notes: 'Client request for expedited door-to-door cold chain medical transport from Dubai DHCC to Vilnius clinic.',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  await db.collection('rfqs').doc(rfqId).set(rfqPayload);

  console.log(`✅ Logistics RFQ registered successfully in Firestore:`);
  console.log(`   - RFQ Number   : ${rfqId}`);
  console.log(`   - Origin       : Magenta Health (Dubai Healthcare City, Suite 302, Dubai, UAE)`);
  console.log(`   - Destination  : KM+ clinic (Konstitucijos pr. 15, LT-09319, Vilnius, Lithuania)`);
  console.log(`   - Cargo Weight : 2.0 kg (6 prefilled pens, 2°C–8°C cold chain)`);
  console.log(`   - Status       : pending_supplier`);
  console.log(`======================================================\n`);
}

seedLogisticsRFQ().catch(err => {
  console.error('Error seeding logistics RFQ:', err);
  process.exit(1);
});
