import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getZohoAccessToken } from '@/lib/zoho/zohoClient';
import { authorize } from '@/lib/access/payablesAccessGuard';

// Golden Rule #1: never read unbounded collections.
const MAX_BILLS = 1000;
// Billing cycle start: per-statement `billingCycleStart`, env override, or default.
const DEFAULT_CYCLE_START = process.env.PAYABLES_CYCLE_START || '2026-11-01';

async function autoSyncZohoBills(wholesalerId, force = false) {
  try {
    const parentRef = adminDb.collection('payables_statements').doc(wholesalerId);
    const parentSnap = await parentRef.get();
    const parentData = parentSnap.exists ? parentSnap.data() : {};

    const lastSyncTime = parentData.lastAutomatedSync ? new Date(parentData.lastAutomatedSync).getTime() : 0;
    const now = Date.now();
    // Cache for 3 minutes unless force === true
    // A Zoho webhook sets syncRequestedAt when a bill changes; honour it immediately.
    const webhookPending = Boolean(parentData.syncRequestedAt) &&
      new Date(parentData.syncRequestedAt).getTime() > lastSyncTime;
    if (!force && !webhookPending && (now - lastSyncTime < 180000)) {
      return;
    }

    const token = await getZohoAccessToken();
    if (!token) return;

    const vendorId = parentData.vendorId || '1183263000022818023';
    const orgId = parentData.zohoOrgId || '662274409';

    const url = `https://www.zohoapis.com/books/v3/bills?organization_id=${orgId}&vendor_id=${vendorId}&per_page=200`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const json = await res.json();
    if (json.code !== 0 || !json.bills) return;

    const rawBills = json.bills;
    const batch = adminDb.batch();
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    let totalPending = 0;
    let totalPaid = 0;
    let openCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    for (const b of rawBills) {
      const balance = Number(b.balance || 0);
      const total = Number(b.total || 0);
      const st = String(b.status || '').toLowerCase().trim();
      const isPaid = (st === 'paid') || (balance === 0);

      if (isPaid) {
        totalPaid += total;
        paidCount++;
      } else {
        totalPending += balance > 0 ? balance : total;
        openCount++;
        if (b.due_date && b.due_date <= todayStr) {
          overdueCount++;
        }
      }

      const billDocRef = parentRef.collection('bills').doc(b.bill_id);
      batch.set(billDocRef, {
        id: b.bill_id,
        billId: b.bill_id,
        billNumber: b.bill_number || '',
        referenceNumber: b.reference_number || '',
        date: b.date || '',
        dueDate: b.due_date || '',
        status: isPaid ? 'paid' : st,
        total,
        balance,
        currency: b.currency_code || 'AED',
        billType: 'Zoho Books Bill',
        sourceInvoiceNumber: b.reference_number || '',
        updatedAt: nowIso
      }, { merge: true });
    }

    batch.set(parentRef, {
      lastAutomatedSync: nowIso,
      openBillsCount: openCount,
      paidBillsCount: paidCount,
      overdueBillsCount: overdueCount,
      totalPendingAmount: Math.round(totalPending * 100) / 100,
      totalPaidAmount: Math.round(totalPaid * 100) / 100,
      currency: 'AED',
      updatedAt: nowIso
    }, { merge: true });

    await batch.commit();
  } catch (err) {
    console.warn('Auto-sync from Zoho Books skipped/failed:', err.message);
  }
}

/**
 * GET /api/payables/[token]
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Trust B2B Payables Statement endpoint.
 * Protected by QuickLink email validation or verified session.
 * When locked: masks company name, contact, amounts and invoice numbers with lock indicators.
 * When unlocked: returns clean ledger without internal commission percentages or historical accumulated paid.
 * Zero references to Mediluxe — 100% Atlas Health Services.
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

    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('refresh') === 'true';
    await autoSyncZohoBills(wholesalerId, forceSync);

    // 2. Fetch bills from Firestore payables cache
    const billsSnap = await adminDb
      .collection('payables_statements')
      .doc(wholesalerId)
      .collection('bills')
      .orderBy('date', 'desc')
      .limit(MAX_BILLS)
      .get();

    const allBills = billsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // STRICT: Only include bills that have been APPROVED in Zoho Books (status: open, approved, overdue, partially_paid).
    // Under NO circumstance should 'draft' or 'void' bills be shown as outstanding.
    const isApprovedOpenBill = (b) => {
      const st = String(b.status || '').toLowerCase().trim();
      if (st === 'draft' || st === 'void' || st === 'pending_approval' || st === 'rejected') {
        return false;
      }
      return st !== 'paid' && Number(b.balance || 0) > 0;
    };

    // Filter bills: Active billing cycle from November 1, 2026 onwards by default
    const includeAllHistory = searchParams.get('include_all') === 'true';
    const cycleStartDate = /^\d{4}-\d{2}-\d{2}$/.test(shareDoc.billingCycleStart || '') ? shareDoc.billingCycleStart : DEFAULT_CYCLE_START;

    const activeCycleBills = includeAllHistory
      ? allBills
      : allBills.filter(b => (b.date || '') >= cycleStartDate);

    const openBills = activeCycleBills.filter(isApprovedOpenBill);
    const paidBills = activeCycleBills.filter(b => {
      const st = String(b.status || '').toLowerCase().trim();
      if (st === 'draft' || st === 'void') return false;
      return st === 'paid' || Number(b.balance || 0) === 0;
    });

    // ── ALL FINANCIAL KPIS CALCULATED AUTHORITATIVELY ON SERVER ──
    const totalPending = openBills.reduce((acc, b) => acc + (Number(b.balance) > 0 ? Number(b.balance) : Number(b.total || 0)), 0);
    const totalPaid = paidBills.reduce((acc, b) => acc + Number(b.total || 0), 0);

    // ── Precalculate Monthly Procurement & Settlement Evolution (Active cycle starting cycleStartDate) ──
    const chartBills = includeAllHistory
      ? allBills
      : allBills.filter(b => (b.date || '') >= cycleStartDate);

    const byMonth = {};
    for (const b of chartBills) {
      const st = String(b.status || '').toLowerCase().trim();
      if (st === 'draft' || st === 'void' || st === 'rejected') continue;
      const m = (b.date || '2026-00').slice(0, 7);
      if (!byMonth[m]) {
        byMonth[m] = { month: m, total: 0, paid: 0, pending: 0, count: 0 };
      }
      const tot = Number(b.total || 0);
      const bal = Number(b.balance || 0);
      byMonth[m].total += tot;
      byMonth[m].count += 1;
      if (st === 'paid' || bal === 0) {
        byMonth[m].paid += tot;
      } else {
        byMonth[m].pending += bal;
        byMonth[m].paid += Math.max(0, tot - bal);
      }
    }
    const monthlyEvolution = Object.values(byMonth)
      .map(item => ({
        ...item,
        total: Math.round(item.total * 100) / 100,
        paid: Math.round(item.paid * 100) / 100,
        pending: Math.round(item.pending * 100) / 100,
        isCurrentCycle: item.month >= cycleStartDate.slice(0, 7)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const todayStr = new Date().toISOString().slice(0, 10);
    const overdueBills = openBills.filter(b => b.dueDate && b.dueDate < todayStr);
    const overdueBillsCount = overdueBills.length;

    // Nearest due date or settled status
    let nextDueDate = 'Current / Up to Date';
    const sortedDue = openBills
      .map(b => b.dueDate)
      .filter(Boolean)
      .sort();
    if (sortedDue.length > 0) {
      nextDueDate = sortedDue[0];
    }

    const formalPaymentTerms = shareDoc.paymentTerms || 'Net 10th Prox. (Post-Settlement)';
    const formalPaymentTermsDetail = shareDoc.paymentTermsDetail || 'Payable within first 10 calendar days of the month following client payment (Paid-When-Paid Terms)';

    // 3. Access verification (admin bearer / OTP session / legacy during grace period)
    const access = await authorize(request, token, shareDoc);
    const providedEmail = access.email;
    const isMasterAdminEmail = access.isAdmin;
    const isAuthorized = access.ok;

    const automatedSyncTime = shareDoc.lastAutomatedSync || new Date().toISOString();

    if (!isAuthorized) {
      // 🔒 LOCKED / PROTECTED STATE
      return NextResponse.json({
        success: true,
        isLocked: true,
        statement: {
          wholesalerName: 'Protected Commercial Partner',
          contactName: 'Confidential Identity',
          contactEmail: '••••••••••••@partner-domain.com',
          phone: '••••••••••',
          currency: shareDoc.currency || 'AED',
          vendorNumber: shareDoc.vendorNumberAED || 'VEN-79',
          vendorNumberEUR: shareDoc.vendorNumberEUR || 'VEN-80',
          paymentTerms: formalPaymentTerms,
          paymentTermsDetail: formalPaymentTermsDetail,
          accountingPhone: '+971 52 129 0471',
          status: 'protected'
        },
        kpis: {
          totalPendingAmount: null,
          currency: shareDoc.currency || 'AED',
          openBillsCount: openBills.length,
          paidBillsCount: paidBills.length,
          overdueBillsCount,
          totalPaidAmount: null,
          nextDueDate: openBills.length === 0 ? 'Current / Up to Date' : nextDueDate,
          paymentTerms: formalPaymentTerms,
          paymentTermsDetail: formalPaymentTermsDetail,
          settlementStatus: openBills.length === 0 ? 'settled' : (overdueBillsCount > 0 ? 'overdue' : 'pending'),
          lastAutomatedSync: automatedSyncTime,
          cycleStartDate,
          cycleFilterActive: !includeAllHistory,
          totalHistoricalCount: allBills.length
        },
        openBills: openBills.map(b => {
          const hasProducts = Array.isArray(b.associatedProducts) && b.associatedProducts.length > 0;
          const hasSuppliers = Array.isArray(b.associatedSuppliers) && b.associatedSuppliers.length > 0;
          const hasNotes = Boolean(b.adminDescription && b.adminDescription.trim());

          const maskClinicalName = (str) => {
            if (!str) return '••••••••';
            const s = String(str).trim();
            return s.length <= 4 ? '••••••••' : `${s.slice(0, 4)}••••••••`;
          };

          const maskSku = (sku) => {
            if (!sku) return 'SKU-••••';
            const s = String(sku).trim();
            return s.length <= 4 ? `${s.slice(0, 2)}••••` : `${s.slice(0, 4)}••••`;
          };

          return {
            id: b.id,
            billNumber: 'FAC-••••••••',
            date: b.date || '—',
            dueDate: b.dueDate || '—',
            billType: 'Protected Commercial Billing',
            sourceInvoiceNumber: 'INV-••••',
            total: null,
            balance: null,
            currency: shareDoc.currency || 'AED',
            status: (b.dueDate && b.dueDate <= todayStr) ? 'overdue' : (b.status || 'pending'),
            // Masked Clinical & Administrative Traceability (Confirms data presence while preserving confidentiality)
            hasAdminDescription: hasNotes,
            adminDescription: hasNotes
              ? '•••••••••••••••••••••••••••••••••••••••• (Confidential Clinical & Financial Reconciliation Notes — Sign In to View)'
              : '',
            adminDescriptionUpdatedAt: b.adminDescriptionUpdatedAt || null,
            isAdminDescriptionMasked: hasNotes,
            hasAssociatedProducts: hasProducts,
            associatedProductsCount: hasProducts ? b.associatedProducts.length : 0,
            associatedProducts: hasProducts
              ? b.associatedProducts.map(p => ({
                  id: 'PROD-••••',
                  name: maskClinicalName(p.name || p.productName),
                  sku: maskSku(p.sku),
                  quantity: p.quantity || 1,
                  isMasked: true
                }))
              : [],
            hasAssociatedSuppliers: hasSuppliers,
            associatedSuppliersCount: hasSuppliers ? b.associatedSuppliers.length : 0,
            associatedSuppliers: hasSuppliers
              ? b.associatedSuppliers.map(s => ({
                  id: 'SUP-••••',
                  name: maskClinicalName(s.name || s.supplierName),
                  vendorNumber: s.vendorNumber ? 'VEN-••••' : null,
                  isMasked: true
                }))
              : []
          };
        }),
        paidBills: []
      });
    }

    // 🔓 UNLOCKED / AUTHORIZED STATE
    // Record non-blocking audit trail for authorized statement access
    if (adminDb && shareDoc) {
      const nowIso = new Date().toISOString();
      const docRef = (!tokenQuery.empty) ? tokenQuery.docs[0].ref : adminDb.collection('shared_payable_statements').doc(token);
      docRef.set({
        lastAccessedAt: nowIso,
        accessCount: (shareDoc.accessCount || 0) + 1,
        lastAccessEmail: providedEmail || 'quicklink_verified',
        lastAccessKind: access.kind
      }, { merge: true }).catch(e => console.warn('Audit access write skipped:', e));
    }

    return NextResponse.json({
      success: true,
      isLocked: false,
      isMasterAdmin: isMasterAdminEmail,
      statement: {
        wholesalerName: shareDoc.wholesalerName || 'Health Source Canada',
        contactName: shareDoc.contactName || 'Dr. Jan Alomia',
        contactEmail: shareDoc.contactEmail || 'jia9156@gmail.com',
        phone: shareDoc.phone || '+971 52 129 0471',
        accountingPhone: '+971 52 129 0471',
        currency: shareDoc.currency || 'AED',
        vendorNumber: shareDoc.vendorNumberAED || 'VEN-79',
        vendorNumberEUR: shareDoc.vendorNumberEUR || 'VEN-80',
        paymentTerms: formalPaymentTerms,
        paymentTermsDetail: formalPaymentTermsDetail,
        status: shareDoc.status || 'active'
      },
      kpis: {
        totalPendingAmount: Math.round(totalPending * 100) / 100,
        currency: shareDoc.currency || 'AED',
        openBillsCount: openBills.length,
        paidBillsCount: paidBills.length,
        overdueBillsCount,
        totalPaidAmount: Math.round(totalPaid * 100) / 100,
        nextDueDate: openBills.length === 0 ? 'Current / Up to Date' : nextDueDate,
        paymentTerms: formalPaymentTerms,
        paymentTermsDetail: formalPaymentTermsDetail,
        settlementStatus: openBills.length === 0 ? 'settled' : (overdueBillsCount > 0 ? 'overdue' : 'pending'),
        lastAutomatedSync: automatedSyncTime,
        cycleStartDate,
        cycleFilterActive: !includeAllHistory,
        totalHistoricalCount: allBills.length
      },
      monthlyEvolution,
      openBills,
      paidBills
    });
  } catch (error) {
    console.error('[/api/payables/[token]] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
