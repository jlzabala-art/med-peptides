import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: rawPk.replace(/\\n/g, '\n')
  })
});
const adminDb = getFirestore(app);

async function main() {
  const content = fs.readFileSync('/Users/joseluiszabala/.gemini/antigravity/brain/5edd509d-fe53-4dde-8b26-290ae1188e5f/.system_generated/steps/22452/output.txt', 'utf8');
  const data = JSON.parse(content);
  const rawBills = data.data.bills || [];
  console.log(`Syncing ${rawBills.length} bills from Zoho Books for Health Source Canada...`);

  const batch = adminDb.batch();
  const parentRef = adminDb.collection('payables_statements').doc('health-source-canada-aed');

  let totalPending = 0;
  let totalPaid = 0;
  let openCount = 0;
  let paidCount = 0;

  for (const b of rawBills) {
    const isPaid = b.status === 'paid' && b.balance === 0;
    const balance = Number(b.balance || 0);
    const total = Number(b.total || 0);

    if (isPaid) {
      totalPaid += total;
      paidCount++;
    } else {
      totalPending += balance > 0 ? balance : total;
      openCount++;
    }

    const billDocRef = parentRef.collection('bills').doc(b.bill_id);
    batch.set(billDocRef, {
      id: b.bill_id,
      billId: b.bill_id,
      billNumber: b.bill_number || '',
      referenceNumber: b.reference_number || '',
      date: b.date || '',
      dueDate: b.due_date || '',
      status: b.status || (isPaid ? 'paid' : 'open'),
      currency: b.currency_code || 'AED',
      total,
      balance,
      billType: b.cf_cf_bill_type || 'Vendor Supply / Commission',
      commissionPercent: Number(b.cf_cf_facilitator_percent || 40),
      sourceInvoiceNumber: b.cf_cf_source_invoice_number || '',
      sourceInvoiceId: b.cf_cf_source_invoice_id || '',
      sourceInvoiceUrl: b.cf_cf_source_invoice_url || '',
      profitAed: Number(b.cf_cf_profit_aed || 0),
      commissionAed: Number(b.cf_cf_commission_aed || 0),
      commissionStage: b.cf_cf_commission_stage || '',
      createdTime: b.created_time || '',
      lastModifiedTime: b.last_modified_time || '',
      syncedAt: new Date().toISOString()
    }, { merge: true });
  }

  // Update statement summary
  batch.set(parentRef, {
    wholesalerId: 'health-source-canada-aed',
    vendorIdAED: '1183263000022818023',
    vendorNumberAED: 'VEN-79',
    vendorName: 'Health Source Canada AED',
    contactPerson: 'Dr. Jan Alomia',
    email: 'jia9156@gmail.com',
    phone: '+971-506167657',
    currency: 'AED',
    facilitatorCommissionPercent: 40.0,
    paymentTerms: 'Net 10 after customer payemnt',
    totalBillsCount: rawBills.length,
    openBillsCount: openCount,
    paidBillsCount: paidCount,
    totalPendingAmount: Math.round(totalPending * 100) / 100,
    totalPaidAmount: Math.round(totalPaid * 100) / 100,
    lastSyncedAt: new Date().toISOString()
  }, { merge: true });

  await batch.commit();
  console.log(`✅ Successfully synced summary: Total Pending = ${totalPending} AED (${openCount} bills), Total Paid = ${totalPaid} AED (${paidCount} bills)`);
}

main().catch(console.error);

