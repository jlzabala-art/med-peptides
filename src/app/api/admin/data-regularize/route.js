import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const SAMPLE_COMPOUND_SETS = [
  [
    { name: 'BPC-157 Injectable Solution', dosage: '5mg / 2mL Vial', quantity: 2, unitRate: 145.00, supplierCost: 75.00, supplierName: 'Fagron Compounding' },
    { name: 'TB-500 Lyophilized Peptide', dosage: '10mg Vial', quantity: 2, unitRate: 195.00, supplierCost: 95.00, supplierName: 'Fagron Compounding' },
    { name: 'Bacteriostatic Water USP', dosage: '30mL Multi-Dose', quantity: 1, unitRate: 25.00, supplierCost: 8.00, supplierName: 'Bacteriostatic Sterile' }
  ],
  [
    { name: 'CJC-1295 + Ipamorelin Blend', dosage: '5mg/5mg (10mg) Vial', quantity: 3, unitRate: 240.00, supplierCost: 110.00, supplierName: 'Medisca Specialty' },
    { name: 'Sermorelin Acetate', dosage: '9mg Multi-Dose Vial', quantity: 1, unitRate: 210.00, supplierCost: 98.00, supplierName: 'Medisca Specialty' }
  ],
  [
    { name: 'Tirzepatide Clinical Solution', dosage: '15mg / 3mL Solution', quantity: 2, unitRate: 380.00, supplierCost: 190.00, supplierName: 'Fagron Compounding' },
    { name: 'B12 Methylcobalamin', dosage: '10,000mcg/mL (10mL)', quantity: 1, unitRate: 65.00, supplierCost: 24.00, supplierName: 'Fagron Compounding' }
  ],
  [
    { name: 'NAD+ Cellular Infusion Solution', dosage: '500mg Lyophilized', quantity: 2, unitRate: 310.00, supplierCost: 145.00, supplierName: 'Olympia Compounding' },
    { name: 'Glutathione Buffered Solution', dosage: '200mg/mL (30mL)', quantity: 1, unitRate: 120.00, supplierCost: 55.00, supplierName: 'Olympia Compounding' }
  ],
  [
    { name: 'GHK-Cu Copper Peptide', dosage: '50mg Lyophilized Vial', quantity: 2, unitRate: 165.00, supplierCost: 78.00, supplierName: 'Empower Pharmacy' },
    { name: 'BPC-157 Sublingual Troches', dosage: '500mcg × 30 Troches', quantity: 1, unitRate: 180.00, supplierCost: 82.00, supplierName: 'Empower Pharmacy' }
  ]
];

const FALLBACK_CLINIC_CLIENTS = [
  { name: 'Elite Longevity Clinic', doctor: 'Dr. Sarah Jenkins', clinic: 'Elite Peptides Group', category: 'clinic' },
  { name: 'Apex Anti-Aging Medical Hub', doctor: 'Dr. Marcus Webb', clinic: 'Apex Longevity Miami', category: 'clinic' },
  { name: 'BioRegen Wellness Center', doctor: 'Dr. Elena Suarez', clinic: 'BioRegen Health Institute', category: 'clinic' },
  { name: 'Madrid Peptide Therapeutics', doctor: 'Dr. Roberto Gomez', clinic: 'Madrid Regenerative Clinic', category: 'clinic' },
  { name: 'Dubai Regenerative Clinic', doctor: 'Dr. Tariq Al-Mansoor', clinic: 'Emirates Wellness Hub', category: 'wholesaler' },
  { name: 'Global Peptide Distributors', doctor: 'David Vance, PharmD', clinic: 'Pan-Euro Specialty Labs', category: 'wholesaler' },
  { name: 'Carlos Méndez (Patient)', doctor: 'Dr. Sarah Jenkins', clinic: 'Elite Longevity Clinic', category: 'patient' },
  { name: 'Sofia Rodriguez (Patient)', doctor: 'Dr. Marcus Webb', clinic: 'Apex Anti-Aging Medical Hub', category: 'patient' },
  { name: 'Alexander Wright (Patient)', doctor: 'Dr. Elena Suarez', clinic: 'BioRegen Wellness Center', category: 'patient' }
];

export async function POST() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const results = {
      productsUpdated: 0,
      protocolsUpdated: 0,
      prescriptionsUpdated: 0,
      quotationsUpdated: 0
    };

    // ──────────────────────────────────────────────────────────────────────────
    // 1. PRODUCTS REGULARIZATION
    // ──────────────────────────────────────────────────────────────────────────
    const productsSnap = await adminDb.collection('products').get();
    let productBatch = adminDb.batch();
    let productOpCount = 0;

    for (const doc of productsSnap.docs) {
      const data = doc.data();
      let modified = false;
      const updates = {};

      // Standardize dosage format (e.g. 5 MG -> 5mg)
      if (data.dosage && typeof data.dosage === 'string') {
        const cleanDosage = data.dosage.trim().replace(/\s+/g, '').toLowerCase();
        if (cleanDosage !== data.dosage) {
          updates.dosage = cleanDosage;
          modified = true;
        }
      }

      // Ensure variants array numbers & fields
      if (Array.isArray(data.variants)) {
        let variantsModified = false;
        const cleanVariants = data.variants.map((v, vIdx) => {
          const vUpdates = { ...v };
          if (typeof v.cost === 'string') {
            vUpdates.cost = parseFloat(v.cost) || 0;
            variantsModified = true;
          }
          if (typeof v.price === 'string') {
            vUpdates.price = parseFloat(v.price) || 0;
            variantsModified = true;
          }
          if (v.requiresColdChain === undefined) {
            vUpdates.requiresColdChain = true;
            variantsModified = true;
          }
          return vUpdates;
        });

        if (variantsModified) {
          updates.variants = cleanVariants;
          modified = true;
        }
      }

      if (modified) {
        updates.updatedAt = new Date();
        productBatch.update(doc.ref, updates);
        productOpCount++;
        results.productsUpdated++;

        if (productOpCount >= 400) {
          await productBatch.commit();
          productBatch = adminDb.batch();
          productOpCount = 0;
        }
      }
    }
    if (productOpCount > 0) {
      await productBatch.commit();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. PROTOCOLS REGULARIZATION
    // ──────────────────────────────────────────────────────────────────────────
    const protocolsSnap = await adminDb.collection('protocols').get();
    let protocolBatch = adminDb.batch();
    let protocolOpCount = 0;

    for (const doc of protocolsSnap.docs) {
      const data = doc.data();
      let modified = false;
      const updates = {};

      // Standardize status
      const currentStatus = String(data.status || 'active').toLowerCase();
      const validStatuses = ['draft', 'active', 'paused', 'archived'];
      if (!validStatuses.includes(currentStatus)) {
        updates.status = 'active';
        modified = true;
      }

      // Ensure total calculations
      const meds = Array.isArray(data.medications) ? data.medications : (Array.isArray(data.items) ? data.items : []);
      if (meds.length > 0 && (!data.totalProtocolCost || !data.suggestedClinicPrice)) {
        let costSum = 0;
        let priceSum = 0;
        meds.forEach(m => {
          const qty = Number(m.quantity || 1);
          const rate = Number(m.unitPrice || m.price || m.unitRate || 140);
          const cost = Number(m.cost || m.supplierCost || rate * 0.52);
          costSum += cost * qty;
          priceSum += rate * qty;
        });

        updates.totalProtocolCost = Math.round(costSum * 100) / 100;
        updates.suggestedClinicPrice = Math.round(priceSum * 100) / 100;
        updates.marginPercent = priceSum > 0 ? Math.round(((priceSum - costSum) / priceSum) * 1000) / 10 : 48.0;
        modified = true;
      }

      if (modified) {
        updates.updatedAt = new Date();
        protocolBatch.update(doc.ref, updates);
        protocolOpCount++;
        results.protocolsUpdated++;

        if (protocolOpCount >= 400) {
          await protocolBatch.commit();
          protocolBatch = adminDb.batch();
          protocolOpCount = 0;
        }
      }
    }
    if (protocolOpCount > 0) {
      await protocolBatch.commit();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. PRESCRIPTIONS REGULARIZATION
    // ──────────────────────────────────────────────────────────────────────────
    const prescriptionsSnap = await adminDb.collection('prescriptions').get();
    let rxBatch = adminDb.batch();
    let rxOpCount = 0;

    for (const doc of prescriptionsSnap.docs) {
      const data = doc.data();
      let modified = false;
      const updates = {};

      // Standardize status to strict lowercase (Rule #28)
      const currentStatus = String(data.status || 'pending').toLowerCase();
      const statusMap = {
        'draft': 'draft',
        'pending': 'pending',
        'approved': 'approved',
        'processing': 'processing',
        'delivered': 'delivered',
        'completed': 'delivered',
        'cancelled': 'cancelled',
        'rejected': 'cancelled'
      };
      const normalizedStatus = statusMap[currentStatus] || 'pending';
      if (data.status !== normalizedStatus) {
        updates.status = normalizedStatus;
        modified = true;
      }

      // Ensure cold chain flag
      if (data.requiresColdChain === undefined) {
        updates.requiresColdChain = true;
        modified = true;
      }

      if (modified) {
        updates.updatedAt = new Date();
        rxBatch.update(doc.ref, updates);
        rxOpCount++;
        results.prescriptionsUpdated++;

        if (rxOpCount >= 400) {
          await rxBatch.commit();
          rxBatch = adminDb.batch();
          rxOpCount = 0;
        }
      }
    }
    if (rxOpCount > 0) {
      await rxBatch.commit();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. QUOTATIONS REGULARIZATION & BACKFILL
    // ──────────────────────────────────────────────────────────────────────────
    const quotationsSnap = await adminDb.collection('quotations').get();
    let quoteBatch = adminDb.batch();
    let quoteOpCount = 0;
    let quoteIdx = 0;

    for (const doc of quotationsSnap.docs) {
      const data = doc.data();
      let modified = false;
      const updates = {};

      const fallbackClient = FALLBACK_CLINIC_CLIENTS[quoteIdx % FALLBACK_CLINIC_CLIENTS.length];
      const fallbackItems = SAMPLE_COMPOUND_SETS[quoteIdx % SAMPLE_COMPOUND_SETS.length];
      quoteIdx++;

      // Check if items array is missing or empty
      const hasItems = Array.isArray(data.items) && data.items.length > 0;
      if (!hasItems) {
        const enrichedItems = fallbackItems.map(it => ({
          ...it,
          totalPrice: it.quantity * it.unitRate
        }));

        let subtotal = 0;
        let costTotal = 0;
        enrichedItems.forEach(it => {
          subtotal += it.totalPrice;
          costTotal += (it.supplierCost || it.unitRate * 0.52) * it.quantity;
        });

        const taxTotal = Math.round(subtotal * 0.05 * 100) / 100;
        const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;
        const marginPercent = subtotal > 0 ? Math.round(((subtotal - costTotal) / subtotal) * 1000) / 10 : 48.5;

        updates.items = enrichedItems;
        updates.subtotal = subtotal;
        updates.taxTotal = taxTotal;
        updates.grandTotal = grandTotal;
        updates.marginPercent = marginPercent;
        modified = true;
      }

      // Check client / recipient fields
      if (!data.clientName || data.clientName === 'Direct Client') {
        updates.clientName = fallbackClient.name;
        updates.doctorName = fallbackClient.doctor;
        updates.clinicName = fallbackClient.clinic;
        updates.category = fallbackClient.category;
        updates.recipientType = fallbackClient.category;
        modified = true;
      }

      // Generate publicToken if missing
      if (!data.publicToken) {
        updates.publicToken = `quote_${doc.id.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).slice(2, 8)}`;
        modified = true;
      }

      // Ensure cold chain metadata
      if (data.requiresColdChain === undefined) {
        updates.requiresColdChain = true;
        updates.coldChainSpecs = {
          requiresColdChain: true,
          storageCondition: 'refrigerated',
          storageTemp: '2-8°C'
        };
        modified = true;
      }

      if (modified) {
        updates.updatedAt = new Date();
        quoteBatch.update(doc.ref, updates);
        quoteOpCount++;
        results.quotationsUpdated++;

        if (quoteOpCount >= 400) {
          await quoteBatch.commit();
          quoteBatch = adminDb.batch();
          quoteOpCount = 0;
        }
      }
    }
    if (quoteOpCount > 0) {
      await quoteBatch.commit();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error("[Data Regularize Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
