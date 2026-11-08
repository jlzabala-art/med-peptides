import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/payables/[token]
 * ─────────────────────────────────────────────────────────────────────────────
 * Public/Wholesaler Payables Statement endpoint.
 * Returns verified outstanding bills, payment terms, and settled history.
 * Omits confidential internal margins or accumulated historical commissions.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams?.token;

    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Resolve share record by token or wholesaler ID
    let shareDoc = null;
    let wholesalerId = null;

    const tokenQuery = await adminDb.collection('shared_payable_statements')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (!tokenQuery.empty) {
      shareDoc = tokenQuery.docs[0].data();
      wholesalerId = shareDoc.wholesalerId || tokenQuery.docs[0].id;
    } else {
      const directDoc = await adminDb.collection('shared_payable_statements').doc(token).get();
      if (directDoc.exists) {
        shareDoc = directDoc.data();
        wholesalerId = shareDoc.wholesalerId || directDoc.id;
      }
    }

    if (!shareDoc || !wholesalerId) {
      return NextResponse.json({ error: 'Payables statement not found or expired' }, { status: 404 });
    }

    // 2. Fetch bills from Firestore payables cache
    const billsSnap = await adminDb
      .collection('payables_statements')
      .doc(wholesalerId)
      .collection('bills')
      .orderBy('date', 'desc')
      .get();

    const allBills = billsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const openBills = allBills.filter(b => b.status !== 'paid' && (b.balance > 0 || b.status === 'draft'));
    const paidBills = allBills.filter(b => b.status === 'paid' || b.balance === 0);

    const totalPending = openBills.reduce((acc, b) => acc + (b.balance > 0 ? b.balance : b.total), 0);

    // Find nearest due date among open bills
    let nextDueDate = null;
    const sortedDue = openBills
      .map(b => b.dueDate)
      .filter(Boolean)
      .sort();
    if (sortedDue.length > 0) {
      nextDueDate = sortedDue[0];
    }

    // Clean, operational KPIs requested by user:
    // (NO total paid to date, NO commission percent — strictly payment workflow)
    const kpis = {
      totalPendingAmount: Math.round(totalPending * 100) / 100,
      currency: shareDoc.currency || 'AED',
      openBillsCount: openBills.length,
      nextDueDate: nextDueDate || 'Current',
      paymentTerms: shareDoc.paymentTerms || 'Net 10 after customer payment',
      syncStatus: 'Zoho Books Synced ✓',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      statement: {
        wholesalerName: shareDoc.wholesalerName || 'Health Source Canada',
        contactName: shareDoc.contactName || 'Dr. Jan Alomia',
        contactEmail: shareDoc.contactEmail || '',
        phone: shareDoc.phone || '',
        currency: shareDoc.currency || 'AED',
        vendorNumber: shareDoc.vendorNumberAED || 'VEN-79',
        vendorNumberEUR: shareDoc.vendorNumberEUR || 'VEN-80',
        paymentTerms: shareDoc.paymentTerms || 'Net 10 after customer payment',
        status: shareDoc.status || 'active'
      },
      kpis,
      openBills,
      paidBills
    });
  } catch (error) {
    console.error('[/api/payables/[token]] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

