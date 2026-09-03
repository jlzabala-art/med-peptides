import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const [productsSnap, protocolsSnap, prescriptionsSnap, quotationsSnap, suppliersSnap] = await Promise.all([
      adminDb.collection('products').get(),
      adminDb.collection('protocols').get(),
      adminDb.collection('prescriptions').get(),
      adminDb.collection('quotations').get(),
      adminDb.collection('suppliers').get()
    ]);

    const supplierIds = new Set(suppliersSnap.docs.map(d => d.id.toLowerCase()));
    const productIds = new Set(productsSnap.docs.map(d => d.id.toLowerCase()));
    const productNames = new Map();
    productsSnap.docs.forEach(d => {
      const data = d.data();
      const name = (data.canonicalName || data.name || '').toLowerCase().trim();
      if (name) productNames.set(name, d.id);
    });

    // 1. Audit Products
    let productValid = 0;
    const productIssues = [];
    productsSnap.docs.forEach(doc => {
      const data = doc.data();
      const issues = [];
      if (!data.canonicalName && !data.name) issues.push('Missing canonical name');
      if (!data.category) issues.push('Missing category');
      
      const variants = Array.isArray(data.variants) ? data.variants : [];
      if (variants.length === 0) {
        issues.push('No variants defined');
      } else {
        variants.forEach((v, idx) => {
          if (v.cost === undefined || isNaN(Number(v.cost))) issues.push(`Variant #${idx + 1} invalid cost`);
          if (!v.supplierId) issues.push(`Variant #${idx + 1} missing supplierId`);
        });
      }

      if (issues.length === 0) {
        productValid++;
      } else {
        productIssues.push({ id: doc.id, name: data.canonicalName || data.name || doc.id, issues });
      }
    });

    // 2. Audit Protocols
    let protocolValid = 0;
    const protocolIssues = [];
    protocolsSnap.docs.forEach(doc => {
      const data = doc.data();
      const issues = [];
      if (!data.title && !data.name) issues.push('Missing title');
      
      const meds = Array.isArray(data.medications || data.items || data.compounds) ? (data.medications || data.items || data.compounds) : [];
      if (meds.length === 0) {
        issues.push('No medications/compounds specified');
      } else {
        meds.forEach((m, idx) => {
          const medId = (m.productId || m.id || '').toLowerCase();
          const medName = (m.name || m.productName || '').toLowerCase().trim();
          if (!medId || !productIds.has(medId)) {
            if (!productNames.has(medName)) {
              issues.push(`Medication #${idx + 1} (${m.name || 'unnamed'}) unlinked to catalog`);
            }
          }
        });
      }

      if (issues.length === 0) {
        protocolValid++;
      } else {
        protocolIssues.push({ id: doc.id, title: data.title || data.name || doc.id, issues });
      }
    });

    // 3. Audit Prescriptions
    let prescriptionValid = 0;
    const prescriptionIssues = [];
    const VALID_RX_STATUSES = new Set(['draft', 'pending', 'approved', 'processing', 'delivered', 'cancelled']);
    prescriptionsSnap.docs.forEach(doc => {
      const data = doc.data();
      const issues = [];
      const status = String(data.status || '').toLowerCase();
      if (!VALID_RX_STATUSES.has(status)) issues.push(`Non-standard status: "${data.status}"`);
      if (!data.patientName && !data.patient?.name) issues.push('Missing patient name');
      
      const items = Array.isArray(data.items || data.medications) ? (data.items || data.medications) : [];
      if (items.length === 0) issues.push('Empty prescription items');

      if (issues.length === 0) {
        prescriptionValid++;
      } else {
        prescriptionIssues.push({ id: doc.id, patient: data.patientName || data.patient?.name || 'Unknown', issues });
      }
    });

    // 4. Audit Quotations
    let quotationValid = 0;
    const quotationIssues = [];
    quotationsSnap.docs.forEach(doc => {
      const data = doc.data();
      const issues = [];
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) issues.push('Empty line items (0 items)');
      if (!data.grandTotal || Number(data.grandTotal) <= 0) issues.push('Zero grand total ($0.00)');
      if (!data.clientName && !data.recipientName && !data.patientName && !data.clinicName) issues.push('Missing client name');

      if (issues.length === 0) {
        quotationValid++;
      } else {
        quotationIssues.push({ id: doc.id, refNumber: data.quotationNumber || data.refNumber || doc.id, issues });
      }
    });

    const totalProducts = productsSnap.size;
    const totalProtocols = protocolsSnap.size;
    const totalPrescriptions = prescriptionsSnap.size;
    const totalQuotations = quotationsSnap.size;

    const overallHealthScore = Math.round(
      ((productValid + protocolValid + prescriptionValid + quotationValid) /
      Math.max(1, totalProducts + totalProtocols + totalPrescriptions + totalQuotations)) * 100
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overallHealthScore,
      summary: {
        products: { total: totalProducts, valid: productValid, issueCount: productIssues.length, health: totalProducts ? Math.round((productValid / totalProducts) * 100) : 100 },
        protocols: { total: totalProtocols, valid: protocolValid, issueCount: protocolIssues.length, health: totalProtocols ? Math.round((protocolValid / totalProtocols) * 100) : 100 },
        prescriptions: { total: totalPrescriptions, valid: prescriptionValid, issueCount: prescriptionIssues.length, health: totalPrescriptions ? Math.round((prescriptionValid / totalPrescriptions) * 100) : 100 },
        quotations: { total: totalQuotations, valid: quotationValid, issueCount: quotationIssues.length, health: totalQuotations ? Math.round((quotationValid / totalQuotations) * 100) : 100 }
      },
      issues: {
        products: productIssues.slice(0, 10),
        protocols: protocolIssues.slice(0, 10),
        prescriptions: prescriptionIssues.slice(0, 10),
        quotations: quotationIssues.slice(0, 10)
      }
    });
  } catch (error) {
    console.error("[Data Audit Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
