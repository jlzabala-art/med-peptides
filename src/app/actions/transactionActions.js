"use server";

import { dbAdmin } from '../../lib/firebaseAdmin';

// Helper to generate a random ID
function generateId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 8; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

/**
 * 1. Create a Request for Quotation (RFQ)
 */
export async function serverCreateQuotationRequest({ requestedByUid, items, notes, tenantId = null, patientId = null, customer = null, shippingAddress = null, totals = null, source = null }) {
  if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

  try {
    const rfqId = `RFQ-${generateId()}`;
    const docRef = await dbAdmin.collection('rfqs').add({
      rfqId,
      requestedByUid,
      tenantId,
      patientId,
      customer,
      shippingAddress,
      totals,
      items,
      notes,
      source,
      status: 'pending',
      createdAt: new Date(),
    });
    return { id: docRef.id, rfqId };
  } catch (err) {
    console.error("Error creating RFQ server-side:", err);
    throw new Error(err.message);
  }
}

/**
 * 2. Create a Quotation
 */
export async function serverCreateQuotation({ rfqId = null, customerUid, items, subtotal, shipping, total, validityDays = 30, createdByAdminUid }) {
  if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

  try {
    const quoteId = `QT-${generateId()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    const docRef = await dbAdmin.collection('quotations').add({
      quoteId,
      rfqId,
      customerUid,
      createdByAdminUid,
      items,
      subtotal,
      shipping,
      total,
      status: 'draft',
      createdAt: new Date(),
      expiresAt,
    });

    return { id: docRef.id, quoteId };
  } catch (err) {
    console.error("Error creating Quotation server-side:", err);
    throw new Error(err.message);
  }
}

/**
 * Auto-Draft Quotation directly from a Prescription
 */
export async function serverAutoDraftQuotationFromPrescription({ rxId, createdByAdminUid }) {
  if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

  try {
    // 1. Check if a quotation already exists for this prescription
    const existingQ = await dbAdmin.collection('quotations').where('prescriptionId', '==', rxId).limit(1).get();
    if (!existingQ.empty) {
      const doc = existingQ.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    // 2. Fetch the prescription
    const rxSnap = await dbAdmin.collection('prescriptions').doc(rxId).get();
    if (!rxSnap.exists) throw new Error("Prescription not found");
    const rxData = rxSnap.data();
    const patientId = rxData.patientId;
    
    // 3. Process items and get pricing
    let subtotal = 0;
    const items = [];
    
    for (const item of (rxData.items || [])) {
      let unitPrice = 0;
      let title = item.name || 'Unknown Product';
      
      // Attempt to fetch price from catalog if productId is linked
      if (item.productId) {
        const prodSnap = await dbAdmin.collection('products').doc(item.productId).get();
        if (prodSnap.exists) {
          const prodData = prodSnap.data();
          // Phase 3: use canonical pricing.retail.perUnit, fall back to legacy fields
          unitPrice = prodData.pricing?.retail?.perUnit
                   ?? prodData.retailPrice
                   ?? prodData.price
                   ?? 0;
          title = prodData.name || title;
        }
      }
      
      const qty = item.amount ? parseFloat(item.amount) : 1;
      const total = qty * unitPrice;
      subtotal += total;
      
      items.push({
        productId: item.productId || null,
        name: title,
        quantity: qty,
        unitPrice,
        discount: 0,
        total
      });
    }

    const shipping = 0; // Default
    const total = subtotal + shipping;

    // 4. Create the Draft Quotation
    const quoteId = `QT-${generateId()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const docRef = await dbAdmin.collection('quotations').add({
      quoteId,
      prescriptionId: rxId, // explicitly link it
      customerUid: patientId, // assuming customerUid maps to patientId in quotes
      createdByAdminUid,
      items,
      subtotal,
      shipping,
      total,
      status: 'draft',
      createdAt: new Date(),
      expiresAt,
    });

    return { id: docRef.id, quoteId, status: 'draft', total };
  } catch (err) {
    console.error("Error auto-drafting quotation:", err);
    throw new Error(err.message);
  }
}

/**
 * 3. Convert Quotation to Order
 */
export async function serverConvertQuotationToOrder({ quotationDocId, paymentMethod, paymentOwnerId, patientId = null, shippingAddress = null }) {
  if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

  try {
    const quoteSnap = await dbAdmin.collection('quotations').doc(quotationDocId).get();
    if (!quoteSnap.exists) throw new Error("Quotation not found");
    const quoteData = quoteSnap.data();

    const orderId = `ORD-${generateId()}`;
    
    const orderRef = await dbAdmin.collection('orders').add({
      orderId,
      quoteId: quoteData.quoteId,
      customerUid: quoteData.customerUid,
      paymentOwnerId,
      patientId,
      items: quoteData.items,
      subtotal: quoteData.subtotal,
      shipping: quoteData.shipping,
      total: quoteData.total,
      paymentMethod,
      shippingAddress,
      status: 'pending',
      createdAt: new Date(),
    });

    await dbAdmin.collection('quotations').doc(quotationDocId).update({
      status: 'accepted',
      orderId
    });

    return { id: orderRef.id, orderId };
  } catch (err) {
    console.error("Error converting quotation to order server-side:", err);
    throw new Error(err.message);
  }
}

/**
 * 4. Create Invoice
 */
export async function serverCreateInvoice({ orderDocId, generatedByUid, dueDateDays = 30 }) {
  if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

  try {
    const orderRef = dbAdmin.collection('orders').doc(orderDocId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) throw new Error("Order not found");
    const orderData = orderSnap.data();

    const invoiceId = `INV-${generateId()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDateDays);

    const invoiceRef = await dbAdmin.collection('invoices').add({
      invoiceId,
      orderId: orderData.orderId,
      customerUid: orderData.customerUid,
      generatedByUid,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      status: 'unpaid',
      createdAt: new Date(),
      dueDate,
    });

    await orderRef.update({
      invoiceId,
      invoiceDocId: invoiceRef.id
    });

    return { id: invoiceRef.id, invoiceId };
  } catch (err) {
    console.error("Error creating Invoice server-side:", err);
    throw new Error(err.message);
  }
}
