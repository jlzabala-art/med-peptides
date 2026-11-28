import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { admin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/supplier-quotations/[id]/document
 * Admin-only secure inline PDF stream from Firebase Storage (Rule #73 compliant).
 */
export const GET = withApiHandler(
  async ({ params, db }) => {
    const id = decodeURIComponent(String(params?.id || '').trim());
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Quotation ID required' }, { status: 400 });
    }

    const snap = await db.collection('supplier_quotations').doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: 'Quotation not found' }, { status: 404 });
    }

    const data = snap.data() || {};
    const storagePath = data.sourceDocument?.storagePath || null;

    if (storagePath) {
      const bucketName =
        data.sourceDocument?.bucket ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        'med-peptides-app.firebasestorage.app';

      const [buffer] = await admin.storage().bucket(bucketName).file(storagePath).download();
      const safeFileName = (data.sourceDocument?.fileName || `${id}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': data.sourceDocument?.mimeType || 'application/pdf',
          'Content-Disposition': `inline; filename="${safeFileName}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    const externalUrl = data.sourceFile?.fileUrl || data.sourceDocumentUrl || data.pdfUrl || null;
    if (externalUrl && /^https?:\/\//i.test(externalUrl)) {
      const upstream = await fetch(externalUrl);
      if (!upstream.ok) {
        return NextResponse.json({ ok: false, error: 'Upstream document fetch failed' }, { status: 502 });
      }
      const arrBuf = await upstream.arrayBuffer();
      const safeFileName = (data.sourceFile?.fileName || `${id}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
      return new Response(arrBuf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeFileName}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'No source PDF attached to this quotation' }, { status: 404 });
  },
  { auth: 'admin', requireDb: true }
);
