import { withApiHandler } from '@/lib/api/withApiHandler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/supplier-quotations
 * Admin-only listing of inbound supplier quotations & revision history.
 */
export const GET = withApiHandler(
  async ({ db, searchParams }) => {
    const groupFilter = searchParams.get('quoteGroupId');
    let snap;
    if (groupFilter) {
      snap = await db
        .collection('supplier_quotations')
        .where('quoteGroupId', '==', groupFilter)
        .limit(30)
        .get();
    } else {
      snap = await db.collection('supplier_quotations').limit(100).get();
    }

    const items = snap.docs
      .map((doc) => {
        const d = doc.data() || {};
        const lineItems = Array.isArray(d.lineItems) ? d.lineItems : Array.isArray(d.items) ? d.items : [];
        return {
          id: doc.id,
          quotationNumber: d.quotationNumber || doc.id,
          supplierQuoteNumber: d.supplierQuoteNumber || d.quotationNumber || doc.id,
          quoteGroupId: d.quoteGroupId || null,
          revisionNumber: Number(d.revisionNumber || 1),
          isLatestRevision: d.isLatestRevision !== undefined ? Boolean(d.isLatestRevision) : true,
          supersedesQuotationId: d.supersedesQuotationId || null,
          supersededByQuotationId: d.supersededByQuotationId || null,
          supplierId: d.supplierId || '',
          supplierName: d.supplierName || '',
          documentDate: d.documentDate || d.quotationDate || null,
          status: d.status || 'active',
          currency: d.currency || 'EUR',
          unitPrice: d.unitPrice ?? lineItems[0]?.unitPrice ?? null,
          subtotal: d.subtotal ?? d.netSubtotal ?? d.grandTotal ?? 0,
          grandTotal: d.grandTotal ?? d.subtotal ?? 0,
          incoterm: d.incoterm || '',
          paymentTerms: d.paymentTerms || '',
          salesperson: d.salesperson || '',
          improvementSummary: d.improvementSummary || null,
          lineItems,
          sourceDocument: d.sourceDocument || null,
          hasPdf: Boolean(d.sourceDocument?.storagePath || d.sourceFile?.fileUrl || d.sourceDocumentUrl || d.pdfUrl),
          commercialNotes: d.commercialNotes || '',
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || null,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || null,
        };
      })
      .sort((a, b) => {
        const dateA = String(a.updatedAt || a.documentDate || a.createdAt || '');
        const dateB = String(b.updatedAt || b.documentDate || b.createdAt || '');
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return (b.revisionNumber || 1) - (a.revisionNumber || 1);
      });

    return { items };
  },
  { auth: 'admin', requireDb: true }
);
