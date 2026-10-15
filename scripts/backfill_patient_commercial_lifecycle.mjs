/**
 * scripts/backfill_patient_commercial_lifecycle.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Backfills the commercial lifecycle attributes across all patients in Firestore.
 * Specifically distinguishes:
 *   1. Confirmed and Paid ('paid')
 *   2. Quote Pending / Awaiting Confirmation ('quote_pending')
 *   3. Quote Unconfirmed / Expired ('quote_unconfirmed')
 *   4. Registered Lead ('registered_only')
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';

async function run() {
  console.log('🚀 Starting Patient Commercial Lifecycle Backfill...');
  const now = new Date().toISOString();

  // 1. Fetch all orders
  console.log('1️⃣ Fetching orders to aggregate patient payment records...');
  const ordersSnap = await adminDb.collection('orders').get();
  const ordersByPatientId = new Map();
  const ordersByInvoiceNum = new Map();
  const ordersByPatientName = new Map();

  ordersSnap.forEach(doc => {
    const o = doc.data();
    const pid = o.patientId || o.customerUid;
    const inv = o.invoiceRef || o.invoiceNumber || o.orderId;
    const pName = (o.patientName || '').toLowerCase().trim();

    if (pid) {
      if (!ordersByPatientId.has(pid)) ordersByPatientId.set(pid, []);
      ordersByPatientId.get(pid).push(o);
    }
    if (inv) {
      const cleanInv = String(inv).replace(/[^0-9]/g, '');
      if (cleanInv) {
        if (!ordersByInvoiceNum.has(cleanInv)) ordersByInvoiceNum.set(cleanInv, []);
        ordersByInvoiceNum.get(cleanInv).push(o);
      }
    }
    if (pName) {
      if (!ordersByPatientName.has(pName)) ordersByPatientName.set(pName, []);
      ordersByPatientName.get(pName).push(o);
    }
  });
  console.log(`   Indexed ${ordersSnap.size} orders.`);

  // 2. Fetch all quotations
  console.log('2️⃣ Fetching quotations to index active quotes...');
  const quotesSnap = await adminDb.collection('quotations').get();
  const quotesByPatientId = new Map();
  quotesSnap.forEach(doc => {
    const q = doc.data();
    const pid = q.patientId || q.customerUid;
    if (pid) {
      if (!quotesByPatientId.has(pid)) quotesByPatientId.set(pid, []);
      quotesByPatientId.get(pid).push(q);
    }
  });
  console.log(`   Indexed ${quotesSnap.size} quotations.`);

  // 3. Process all patients
  console.log('3️⃣ Traversing all patients to backfill commercialStage...');
  const patientsSnap = await adminDb.collection('patients').get();
  console.log(`   Found ${patientsSnap.size} patients to evaluate.`);

  let paidCount = 0;
  let quotePendingCount = 0;
  let quoteUnconfirmedCount = 0;
  let registeredOnlyCount = 0;

  const BATCH_SIZE = 400;
  let currentBatch = adminDb.batch();
  let opsInBatch = 0;

  for (const doc of patientsSnap.docs) {
    const p = doc.data();
    const pId = doc.id;
    const pName = (p.name || `${p.firstName || ''} ${p.lastName || ''}`).toLowerCase().trim();
    const invoices = Array.isArray(p.invoices) ? p.invoices : [];

    // Find linked orders
    let linkedOrders = [];
    if (ordersByPatientId.has(pId)) {
      linkedOrders.push(...ordersByPatientId.get(pId));
    }
    for (const inv of invoices) {
      const clean = String(inv).replace(/[^0-9]/g, '');
      if (clean && ordersByInvoiceNum.has(clean)) {
        linkedOrders.push(...ordersByInvoiceNum.get(clean));
      }
    }
    if (linkedOrders.length === 0 && ordersByPatientName.has(pName)) {
      linkedOrders.push(...ordersByPatientName.get(pName));
    }

    // Deduplicate orders by orderId
    const uniqueOrders = Array.from(new Map(linkedOrders.map(o => [o.orderId || o.id, o])).values());

    // Determine Commercial Stage
    let commercialStage = 'registered_only';
    let quotationStatus = 'none';
    let totalSpent = 0;
    let paidOrdersCount = 0;
    let lastOrderId = null;
    let lastInvoiceRef = invoices[0] ? `# INV ${invoices[0]}` : null;
    let lastPaymentAt = null;
    let paymentMethod = 'invoice_transfer';

    if (uniqueOrders.length > 0 || invoices.length > 0 || p.hasPrescriptions === true || (p.prescriptionCount && p.prescriptionCount > 0)) {
      commercialStage = 'paid';
      quotationStatus = 'confirmed';
      paidOrdersCount = Math.max(uniqueOrders.length, invoices.length, 1);
      
      totalSpent = uniqueOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      if (totalSpent === 0 && invoices.length > 0) {
        // Fallback estimated order average if raw order not parsed
        totalSpent = invoices.length * 170;
      }

      if (uniqueOrders.length > 0) {
        const lastOrder = uniqueOrders[uniqueOrders.length - 1];
        lastOrderId = lastOrder.orderId || lastOrder.id;
        lastInvoiceRef = lastOrder.invoiceRef || lastInvoiceRef;
        lastPaymentAt = lastOrder.createdAt || now;
        paymentMethod = lastOrder.paymentMethod || 'invoice_transfer';
      }

      paidCount++;
    } else if (p.source === 'lotusland_saudi_sheet' && (!invoices || invoices.length === 0)) {
      // Specifically for Dr. Khalid's patients who had order: 'NO'
      commercialStage = 'quote_unconfirmed';
      quotationStatus = 'unconfirmed';
      quoteUnconfirmedCount++;
    } else {
      // Check if open quote exists
      const pQuotes = quotesByPatientId.get(pId) || [];
      const pendingQuote = pQuotes.find(q => q.status === 'draft' || q.status === 'pending');
      const expiredQuote = pQuotes.find(q => q.status === 'expired' || q.status === 'unconfirmed' || q.status === 'rejected');

      if (pendingQuote) {
        commercialStage = 'quote_pending';
        quotationStatus = 'pending';
        quotePendingCount++;
      } else if (expiredQuote) {
        commercialStage = 'quote_unconfirmed';
        quotationStatus = 'unconfirmed';
        quoteUnconfirmedCount++;
      } else {
        commercialStage = 'registered_only';
        quotationStatus = 'none';
        registeredOnlyCount++;
      }
    }

    const updates = {
      commercialStage,
      quotationStatus,
      hasPaidOrders: commercialStage === 'paid',
      paidOrdersCount,
      totalSpent,
      lastOrderId: lastOrderId || null,
      lastInvoiceRef: lastInvoiceRef || null,
      lastPaymentAt: lastPaymentAt || (commercialStage === 'paid' ? now : null),
      paymentMethod: commercialStage === 'paid' ? paymentMethod : null,
      commercialStageUpdatedAt: now,
      updatedAt: now
    };

    currentBatch.set(doc.ref, updates, { merge: true });
    opsInBatch++;

    if (opsInBatch >= BATCH_SIZE) {
      await currentBatch.commit();
      currentBatch = adminDb.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await currentBatch.commit();
  }

  console.log('\n📊 Backfill Complete Summary:');
  console.log(`   🟢 Confirmed & Paid:           ${paidCount}`);
  console.log(`   🟡 Quote Pending / Awaiting:   ${quotePendingCount}`);
  console.log(`   🔴 Quote Unconfirmed / Exp.:   ${quoteUnconfirmedCount}`);
  console.log(`   ⚪ Registered Leads Only:      ${registeredOnlyCount}`);
  console.log(`   Total Patients Evaluated:      ${patientsSnap.size}\n`);

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error running backfill script:', err);
  process.exit(1);
});
