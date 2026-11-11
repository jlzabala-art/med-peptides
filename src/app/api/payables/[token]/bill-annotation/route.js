import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { authorize, isAdminEmail } from '@/lib/access/payablesAccessGuard';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payables/[token]/bill-annotation
 * PATCH /api/payables/[token]/bill-annotation
 * 
 * Saves administrative annotations, free-text descriptions, and associated product catalog links
 * to a specific bill within the payables statement in Firestore.
 * 
 * Target Firestore Path: payables_statements/{wholesalerId}/bills/{billId}
 * 
 * Security: Requires verified admin credentials (session cookie, Bearer token, or authorized admin email).
 */
async function handleSaveAnnotation(request, { params }) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams?.token;

    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const billId = String(body.billId || '').trim();

    if (!billId) {
      return NextResponse.json({ error: 'Missing billId' }, { status: 400 });
    }

    // 1. Resolve share record & wholesaler ID
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
      return NextResponse.json({ error: 'Payables statement not found' }, { status: 404 });
    }

    // 2. Authorize Admin
    const auth = await authorize(request, token, shareDoc);
    const callerEmail = String(body.email || auth.email || '').trim().toLowerCase();
    const hasAdminAccess = auth.isAdmin || isAdminEmail(callerEmail);

    if (!hasAdminAccess) {
      return NextResponse.json({
        error: 'Forbidden: Admin access required to update bill descriptions and product associations'
      }, { status: 403 });
    }

    // 3. Format and sanitize fields
    const nowIso = new Date().toISOString();
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    const associatedProducts = Array.isArray(body.associatedProducts)
      ? body.associatedProducts.map(p => ({
          id: String(p.id || p.productId || '').trim(),
          name: String(p.name || p.productName || '').trim(),
          sku: String(p.sku || '').trim(),
          category: String(p.category || '').trim(),
          quantity: Math.max(1, Number(p.quantity) || 1),
          allocatedCostAed: Math.max(0, Number(p.allocatedCostAed) || 0)
        })).filter(p => p.id || p.name)
      : [];

    const billRef = adminDb.collection('payables_statements').doc(wholesalerId).collection('bills').doc(billId);

    const updatePayload = {
      adminDescription: description,
      adminDescriptionUpdatedAt: nowIso,
      adminDescriptionUpdatedBy: callerEmail || 'admin@atlashealth-services.com',
      associatedProducts,
      updatedAt: nowIso
    };

    await billRef.set(updatePayload, { merge: true });

    return NextResponse.json({
      success: true,
      billId,
      ...updatePayload
    });
  } catch (error) {
    console.error('[/api/payables/[token]/bill-annotation] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, context) {
  return handleSaveAnnotation(request, context);
}

export async function PATCH(request, context) {
  return handleSaveAnnotation(request, context);
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams?.token;
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('billId');

    if (!token || !billId) {
      return NextResponse.json({ error: 'Missing token or billId' }, { status: 400 });
    }

    const tokenQuery = await adminDb.collection('shared_payable_statements')
      .where('token', '==', token)
      .limit(1)
      .get();

    let wholesalerId = null;
    if (!tokenQuery.empty) {
      wholesalerId = tokenQuery.docs[0].data().wholesalerId || tokenQuery.docs[0].id;
    } else {
      const directDoc = await adminDb.collection('shared_payable_statements').doc(token).get();
      if (directDoc.exists) {
        wholesalerId = directDoc.data().wholesalerId || directDoc.id;
      }
    }

    if (!wholesalerId) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 });
    }

    const billSnap = await adminDb.collection('payables_statements').doc(wholesalerId).collection('bills').doc(billId).get();
    if (!billSnap.exists) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const d = billSnap.data();
    return NextResponse.json({
      billId,
      adminDescription: d.adminDescription || '',
      adminDescriptionUpdatedAt: d.adminDescriptionUpdatedAt || null,
      adminDescriptionUpdatedBy: d.adminDescriptionUpdatedBy || null,
      associatedProducts: d.associatedProducts || []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

