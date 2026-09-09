import { NextResponse } from 'next/server';
import { algoliasearch } from 'algoliasearch';
import { deriveCanonicalIdentity } from '@/utils/canonicalProductRegistry';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

/**
 * POST /api/algolia/sync
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time incremental synchronization endpoint from Firestore to Algolia.
 * Secures Algolia admin privileges entirely on the server side.
 *
 * Payload:
 * {
 *   action: 'upsert' | 'delete',
 *   indexName: 'products' | 'protocols' | 'atlas_patients' | 'prescriptions' | 'atlas_users',
 *   record: Object,
 *   objectID?: string
 * }
 */
export async function POST(request) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { error: 'ALGOLIA_ADMIN_KEY is not configured on server' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action = 'upsert', indexName, record, objectID } = body;

    if (!indexName) {
      return NextResponse.json({ error: 'Missing indexName' }, { status: 400 });
    }

    const client = algoliasearch(APP_ID, ADMIN_KEY);

    if (action === 'delete') {
      const targetId = objectID || record?.objectID || record?.id;
      if (!targetId) {
        return NextResponse.json({ error: 'Missing objectID for deletion' }, { status: 400 });
      }

      await client.deleteObject({
        indexName,
        objectID: String(targetId)
      });

      return NextResponse.json({ success: true, action: 'delete', indexName, objectID: targetId });
    }

    // Upsert
    if (!record || (!record.objectID && !record.id)) {
      return NextResponse.json({ error: 'Missing record or valid ID' }, { status: 400 });
    }

    const targetId = String(record.objectID || record.id);
    let formattedRecord = { ...record, objectID: targetId, id: targetId };

    if (indexName === 'products') {
      const allGoals = [
        ...(record.goals || []),
        ...(record.canonicalGoals || []),
        ...(record.tags || []),
        record.category
      ]
        .filter(Boolean)
        .map((g) => String(g).toLowerCase().replace(/_/g, '-'));

      const canonicalIdentity = deriveCanonicalIdentity(record);
      const variantsList = Array.isArray(record.variants) ? record.variants : [];

      formattedRecord = {
        objectID: targetId,
        id: targetId,
        name: record.name || record.title || '',
        // canonicalKey: Unique peptide slug used for native Algolia distinct deduplication
        canonicalKey: record.canonicalKey || canonicalIdentity.canonicalKey,
        // canonicalName: Standard clinical display title
        canonicalName: record.canonicalName || canonicalIdentity.canonicalName,
        category: record.category || '',
        description: record.description ? String(record.description).substring(0, 500) : '',
        goals: record.goals || [],
        canonicalGoals: record.canonicalGoals || [],
        tags: record.tags || [],
        searchableGoals: [...new Set(allGoals)],
        supplier: record.supplier || record.supplierName || '',
        supplierName: record.supplierName || record.supplier || '',
        stock: Number(record.stock ?? record.inventory ?? 0),
        price: Number(record.price || 0),
        variantsCount: Number(record.variantsCount ?? variantsList.length ?? 1),
        hasCoa: Boolean(record.hasCoa),
        hasGmp: Boolean(record.hasGmp),
        productType: record.productType || record.type || '',
        sku: record.sku || '',
        updatedAt_ts: getTimestamp(record.updatedAt || record.createdAt)
      };
    } else if (indexName === 'prescriptions') {
      const items = Array.isArray(record.items) ? record.items : [];
      const productNames = items.map((i) => i.name || i.productName).filter(Boolean);

      formattedRecord = {
        objectID: targetId,
        id: targetId,
        code: record.code || `RX-${targetId.slice(0, 6).toUpperCase()}`,
        patientName: record.patientName || record.patient?.name || '',
        patientId: record.patientId || '',
        doctorName: record.doctorName || record.doctor?.name || '',
        doctorId: record.doctorId || '',
        status: (record.status || 'pending').toLowerCase(),
        items: productNames,
        itemCount: items.length,
        total: Number(record.total || record.amount || 0),
        source: record.source || 'portal',
        createdAt_ts: getTimestamp(record.createdAt)
      };
    } else if (indexName === 'atlas_patients') {
      const doctorIds = new Set(record.doctorIds || []);
      if (record.physicianId) doctorIds.add(record.physicianId);
      if (record.doctorId) doctorIds.add(record.doctorId);

      formattedRecord = {
        objectID: targetId,
        id: targetId,
        name: (record.name || `${record.firstName || ''} ${record.lastName || ''}`).trim() || 'Patient',
        email: record.email || '',
        phone: record.phone || record.phoneNumber || '',
        status: (record.status || 'active').toLowerCase(),
        country: record.country || 'AE',
        physicianId: record.physicianId || record.doctorId || Array.from(doctorIds)[0] || '',
        doctorIds: Array.from(doctorIds),
        clinicIds: record.clinicIds || (record.clinicId ? [record.clinicId] : []),
        prescribedProductCategories: record.prescribedProductCategories || [],
        prescribingDoctorNames: record.prescribingDoctorNames || [],
        createdAt_ts: getTimestamp(record.createdAt),
        lastActivityDate: getTimestamp(record.lastActivityDate || record.updatedAt || record.createdAt)
      };
    }

    await client.saveObjects({
      indexName,
      objects: [formattedRecord]
    });

    return NextResponse.json({
      success: true,
      action: 'upsert',
      indexName,
      objectID: targetId
    });
  } catch (err) {
    console.error('[/api/algolia/sync] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
