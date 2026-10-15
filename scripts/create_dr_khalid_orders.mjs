/**
 * scripts/create_dr_khalid_orders.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 4: Create financial tracking records in `orders` collection
 * for the 24 active prescriptions of Dr. Khalid Shukri (Saudi Arabia).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  PHASE 4: CREATING ORDERS IN ATLAS FOR DR. KHALID PRESCRIPTIONS');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const now = new Date().toISOString();

  // 1. Fetch the 24 prescriptions recently created
  const rxSnap = await adminDb.collection('prescriptions')
    .where('doctorId', '==', 'dr-khalid-shukri')
    .where('source', '==', 'lotusland_saudi_sheet')
    .get();

  console.log(`Found ${rxSnap.size} prescriptions to link into orders.`);

  const batch = adminDb.batch();
  let orderCount = 0;

  for (const doc of rxSnap.docs) {
    const rx = doc.data();
    const cleanInv = (rx.fileNumber || '').replace(/[^a-zA-Z0-9]/g, '_');
    const orderDocId = `ORD-KSA-INV${cleanInv}-${rx.id}`.slice(0, 60);

    // Estimate item prices from standard Lotusland pricing
    // Nasal spray ~ $120-$150, Caps ~ $90-$140, Pens ~ $180-$220
    const items = (rx.prescriptionLines || []).map(line => {
      let unitPrice = 120;
      const lLower = (line.name || '').toLowerCase();
      if (lLower.includes('30mg') && lLower.includes('nasal')) unitPrice = 180;
      else if (lLower.includes('caps') && lLower.includes('dihexa')) unitPrice = 160;
      else if (lLower.includes('caps')) unitPrice = 95;
      else if (lLower.includes('pen') || lLower.includes('single_cartridge')) unitPrice = 190;
      else if (lLower.includes('semax') || lLower.includes('selank')) unitPrice = 135;

      const qty = Number(line.quantity || 1);
      return {
        name: line.name || line.productName,
        productName: line.productName,
        variant: line.dosage || line.presentation || 'Standard',
        quantity: qty,
        unitPrice,
        lineTotal: qty * unitPrice,
        supplier: 'Lotusland Limited',
        supplierId: 'lotusland'
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const shipping = 35; // Standard international cold-chain to Saudi Arabia
    const total = subtotal + shipping;

    const orderData = {
      id: orderDocId,
      orderId: `ORD-KSA-INV${cleanInv}`,
      invoiceNumber: `INV-${rx.fileNumber}`,
      invoiceRef: rx.invoiceRef,
      prescriptionId: rx.id,
      prescriptionNumber: rx.prescriptionNumber,
      source: 'lotusland_saudi_sheet',
      clientType: 'b2c',
      isB2C: true,
      doctorId: 'dr-khalid-shukri',
      doctorName: 'Dr. Khalid Shukri',
      treatingDoctor: 'Dr. Khalid Shukri',
      clinic: 'Dr. Khalid Shukri Clinic (Saudi Arabia)',
      customer: {
        fullName: rx.patientName,
        firstName: rx.patientName.split(' ')[0] || rx.patientName,
        lastName: rx.patientName.split(' ').slice(1).join(' ') || '',
        country: 'Saudi Arabia',
        region: 'sa'
      },
      shippingAddress: {
        street: 'Private Residence',
        city: 'Riyadh / Jeddah',
        country: 'Saudi Arabia'
      },
      supplier: 'Lotusland Limited',
      supplierId: 'lotusland',
      items,
      subtotal,
      shipping,
      total,
      totalDisplay: `$${total}`,
      currency: 'USD',
      status: 'delivered',
      deliveryStatus: 'Delivered',
      fulfillmentStatus: 'Fulfilled',
      paymentMethod: 'invoice_transfer',
      paymentStatus: 'paid',
      createdAt: now,
      updatedAt: now
    };

    const oRef = adminDb.collection('orders').doc(orderDocId);
    batch.set(oRef, orderData, { merge: true });
    orderCount++;
  }

  await batch.commit();
  console.log(`✅ Successfully created ${orderCount} financial order records in 'orders' collection.\n`);
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎉 PHASE 4 COMPLETED: All Dr. Khalid prescriptions linked to orders.');
  console.log('══════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error creating orders:', err);
  process.exit(1);
});
