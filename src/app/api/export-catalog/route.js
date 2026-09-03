/* global Buffer, process */
import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRESENTATION_LABELS } from '@/constants/presentationTypes';
import { exportCatalogSchema } from '@/schemas/apiSchemas';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBody = await request.json().catch(() => ({}));
  const parseResult = exportCatalogSchema.safeParse(rawBody);
  const {
    format = 'xlsx',
    priceTier = 'retail',
    onlyActive = true,
  } = parseResult.success ? { ...rawBody, ...parseResult.data } : rawBody;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      try {
        emit({ type: 'progress', step: 'validating', message: 'Validating export parameters...', progress: 10 });

        if (!adminDb) {
          throw new Error('Firebase Admin DB is not initialized');
        }

        // Fetch products
        emit({ type: 'progress', step: 'fetching_products', message: 'Loading products and variants...', progress: 30 });
        let q = adminDb.collection('products');
        if (onlyActive) {
          q = q.where('isActive', '==', true);
        }
        const snap = await q.get();
        emit({ type: 'progress', step: 'processing', message: `Found ${snap.docs.length} products. Fetching SKU variants...`, progress: 50 });

        const rows = [];
        for (const docSnap of snap.docs) {
          const product = { id: docSnap.id, ...docSnap.data() };
          const varSnap = await docSnap.ref.collection('variants').get();
          const variants = varSnap.docs.map(v => ({ id: v.id, ...v.data() }));
          const items = variants.length > 0 ? variants : [product];

          items.forEach(v => {
            const resolved = resolveVariantPrice(v, { tier: priceTier });
            rows.push({
              'Product ID': product.id,
              'Variant ID': v.id || product.id,
              'Product Name': product.name || v.name || 'Unknown',
              'Category': product.category || 'Other',
              'Dosage / Spec': v.dosage || v.dose || product.dosage || '-',
              'Presentation': PRESENTATION_LABELS[v.presentation] || v.presentationName || v.presentation || 'Vial',
              'Supplier': v.supplierName || v.supplier || product.supplier || 'Unassigned',
              'Stock': v.stock ?? product.stock ?? 0,
              'In Stock': (v.stock ?? product.stock ?? 0) > 0 ? 'Yes' : 'No',
              'Price (USD)': resolved.perUnit != null ? `$${resolved.perUnit.toFixed(2)}` : 'N/A',
              'Purity (%)': v.purity || product.purity || '-',
              'Status': product.status || 'published',
            });
          });
        }

        emit({ type: 'progress', step: 'building_workbook', message: `Building ${format.toUpperCase()} spreadsheet (${rows.length} rows)...`, progress: 75 });

        // Build Excel Workbook
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog');

        let fileBuffer;
        let mimeType;
        const filename = `ATLAS_SOLUTIONS_Catalog_${priceTier.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.${format}`;

        if (format === 'csv') {
          fileBuffer = Buffer.from(XLSX.utils.sheet_to_csv(worksheet), 'utf-8');
          mimeType = 'text/csv';
        } else {
          fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        emit({ type: 'progress', step: 'saving_storage', message: 'Saving file to Cloud Storage...', progress: 90 });

        // Save to Firebase Storage if available
        let downloadUrl = null;
        try {
          const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'med-peptides-app.firebasestorage.app';
          const bucket = getStorage().bucket(bucketName);
          const file = bucket.file(`exports/${filename}`);
          await file.save(fileBuffer, { metadata: { contentType: mimeType } });
          const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 7 });
          downloadUrl = signedUrl;
        } catch (storageErr) {
          console.warn('Storage save fallback to base64:', storageErr);
        }

        const base64 = fileBuffer.toString('base64');
        emit({
          type: 'done',
          step: 'done',
          message: 'Export complete!',
          progress: 100,
          filename,
          url: downloadUrl,
          base64: downloadUrl ? null : base64,
          mimeType,
          rowCount: rows.length,
        });

        controller.close();
      } catch (err) {
        console.error('[/api/export-catalog] error:', err);
        try {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: err.message }) + '\n'));
        } catch (ctrlErr) {
          console.warn('Controller enqueue error:', ctrlErr);
        }
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  });
}
