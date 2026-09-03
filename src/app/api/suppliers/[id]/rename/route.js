/**
 * POST /api/suppliers/[id]/rename
 *
 * Server-side cascade for supplier name changes.
 * Uses Firebase Admin SDK (server-side) so we don't download thousands of
 * variant docs to the client.
 *
 * Body: { name: string }  — the new canonical display name
 *
 * Steps:
 *  1. Update the supplier doc: name, companyName, displayName
 *  2. collectionGroup('variants').where('supplierId', '==', id)
 *     → batch-update supplierName on every variant (Phase 7 schema)
 *  3. Invalidate _meta/supplier_coverage so KPI tile re-computes
 */
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebaseAdmin';

const BATCH_LIMIT = 450; // Firestore batch cap is 500 — leave headroom

export async function POST(request, { params }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing supplier id' }, { status: 400 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const newName = (body.name || '').trim();
  if (!newName) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  if (!adminDb) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

  try {
    const now = new Date().toISOString();

    // ── 1. Update supplier doc ────────────────────────────────────────────────
    await adminDb.collection('suppliers').doc(id).update({
      name:        newName,
      companyName: newName,
      displayName: newName,
      updatedAt:   now,
    });

    // ── 2. Cascade to all variants with supplierId === id ────────────────────
    const variantsQuery = adminDb.collectionGroup('variants').where('supplierId', '==', id);
    const variantsSnap  = await variantsQuery.get();

    let batch     = adminDb.batch();
    let opCount   = 0;
    let totalCascaded = 0;

    for (const varDoc of variantsSnap.docs) {
      batch.update(varDoc.ref, { supplierName: newName, updatedAt: now });
      opCount++;
      totalCascaded++;
      if (opCount >= BATCH_LIMIT) {
        await batch.commit();
        batch   = adminDb.batch();
        opCount = 0;
      }
    }
    if (opCount > 0) await batch.commit();

    // ── 3. Invalidate _meta/supplier_coverage ─────────────────────────────────
    try {
      await adminDb.collection('_meta').doc('supplier_coverage').update({
        lastInvalidatedAt: now,
        invalidatedBy:     `rename:${id}`,
      });
    } catch {
      // Non-fatal — _meta doc may not exist yet
    }

    return NextResponse.json({
      success:        true,
      supplierId:     id,
      newName,
      variantsCascaded: totalCascaded,
    });
  } catch (err) {
    console.error('[/api/suppliers/[id]/rename] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
