import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/webhooks/zoho-books-bills
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time webhook listener for Zoho Books:
 * - Bill Created / Updated
 * - Bill Paid / Payment Made
 *
 * Keeps the public statement and internal ledger synchronized automatically.
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') || '';
    let payload = {};

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        try {
          payload[key] = JSON.parse(value);
        } catch {
          payload[key] = value;
        }
      });
    } else {
      payload = await request.json().catch(() => ({}));
    }

    const bill = payload.bill || payload;
    const billId = String(bill.bill_id || payload.bill_id || '').trim();
    const vendorId = String(bill.vendor_id || payload.vendor_id || '').trim();
    const status = (bill.status || payload.status || 'open').toLowerCase();
    const balance = Number(bill.balance ?? payload.balance ?? 0);
    const total = Number(bill.total ?? payload.total ?? 0);
    const now = new Date().toISOString();

    if (!billId || !vendorId) {
      return NextResponse.json({ message: 'No bill_id or vendor_id in payload, acknowledged' }, { status: 200 });
    }

    // Find wholesaler matching this vendorId
    let wholesalerId = null;
    const snapAED = await adminDb.collection('wholesellers')
      .where('zohoBooksVendorId', '==', vendorId)
      .limit(1)
      .get();

    if (!snapAED.empty) {
      wholesalerId = snapAED.docs[0].id;
    } else {
      const snapEUR = await adminDb.collection('wholesellers')
        .where('zohoBooksVendorIdEUR', '==', vendorId)
        .limit(1)
        .get();
      if (!snapEUR.empty) {
        wholesalerId = snapEUR.docs[0].id;
      }
    }

    if (!wholesalerId) {
      console.log(`[zoho-books-bills webhook] Vendor ID ${vendorId} not linked to any Atlas wholesaler. Skipping.`);
      return NextResponse.json({ success: true, linked: false });
    }

    const billRef = adminDb.collection('payables_statements').doc(wholesalerId).collection('bills').doc(billId);

    await billRef.set({
      id: billId,
      billId,
      billNumber: bill.bill_number || '',
      referenceNumber: bill.reference_number || '',
      date: bill.date || now.split('T')[0],
      dueDate: bill.due_date || '',
      status: balance === 0 ? 'paid' : status,
      currency: bill.currency_code || 'AED',
      total,
      balance,
      billType: bill.cf_cf_bill_type || 'Facilitator Commission',
      sourceInvoiceNumber: bill.cf_cf_source_invoice_number || '',
      updatedAt: now
    }, { merge: true });

    // Recalculate summary totals
    const billsSnap = await adminDb.collection('payables_statements').doc(wholesalerId).collection('bills').get();
    let totalPending = 0;
    let openCount = 0;
    let paidCount = 0;

    billsSnap.docs.forEach(d => {
      const b = d.data();
      if (b.status === 'paid' || b.balance === 0) {
        paidCount++;
      } else {
        openCount++;
        totalPending += b.balance > 0 ? b.balance : b.total;
      }
    });

    await adminDb.collection('payables_statements').doc(wholesalerId).set({
      openBillsCount: openCount,
      paidBillsCount: paidCount,
      totalPendingAmount: Math.round(totalPending * 100) / 100,
      lastSyncedAt: now
    }, { merge: true });

    return NextResponse.json({ success: true, updatedWholesaler: wholesalerId, billId, status });
  } catch (error) {
    console.error('[/api/webhooks/zoho-books-bills] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

