import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { invalidateRxCache } from '@/lib/rxCache';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';

export const dynamic = 'force-dynamic';

const MAX_DOCS_PER_REQUEST = 6;
const MAX_PAYLOAD_BYTES = 400 * 1024; // 400 KB

/**
 * POST /api/labels/import
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side persistence for prescriptions imported from the public
 * Compounding Label Studio (/labels). Used by Atlas Account Managers, who do
 * not have an authenticated Atlas session in this public app.
 *
 * The AI extraction + catalog matching is done by the shared
 * `ImportPrescriptionModal` (same code path as the Admin import). This route
 * only writes the resulting docs with the Admin SDK, forcing safe defaults:
 *   - status: 'draft'           (never auto-approved)
 *   - atlasValidation: 'skipped' (explicitly bypasses the Atlas review gate)
 *   - importChannel: 'public_labels_account_manager'
 *
 * Body: { prescriptions: Array<Object> }
 * Returns: { success, created: [{ id, code, patientName }] }
 */
export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000, tier: 'labels-import' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }

    const body = JSON.parse(raw || '{}');
    const list = Array.isArray(body?.prescriptions) ? body.prescriptions : [];
    if (list.length === 0) {
      return NextResponse.json({ success: false, error: 'No prescriptions provided' }, { status: 400 });
    }
    if (list.length > MAX_DOCS_PER_REQUEST) {
      return NextResponse.json({ success: false, error: 'Too many prescriptions in one request' }, { status: 400 });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = adminDb.batch();
    const created = [];

    for (const rx of list) {
      if (!rx || typeof rx !== 'object') continue;
      // Strip any client-supplied identity / privileged fields
      const { id: _id, createdAt: _c, updatedAt: _u, approvedAt: _a, approvedBy: _b, ...safe } = rx;
      const ref = adminDb.collection('prescriptions').doc();
      const patientName = safe.patientName || safe.patient?.name || 'Unknown Patient';
      const code = String(safe.code || safe.rxCode || safe.fileNumber || ref.id).replace(/^#/, '').trim();

      batch.set(ref, {
        ...safe,
        status: 'draft',
        atlasValidation: 'skipped',
        importChannel: 'public_labels_account_manager',
        code,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ id: ref.id, code, patientName });
    }

    await batch.commit();
    created.forEach(c => {
      try { invalidateRxCache?.(c.id); } catch { /* noop */ }
    });

    // Fire-and-forget Algolia projection (server → server)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    created.forEach((c, idx) => {
      const rx = list[idx] || {};
      fetch(`${baseUrl}/api/algolia/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          indexName: 'prescriptions',
          record: { ...rx, id: c.id, status: 'draft', code: c.code }
        })
      }).catch(() => { /* non-blocking */ });
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('[api/labels/import] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
