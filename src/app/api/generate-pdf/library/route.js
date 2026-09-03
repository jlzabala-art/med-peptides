import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const docType = searchParams.get('docType');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!adminDb) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

    let query = adminDb.collection('quotations')
      .orderBy('generatedAt', 'desc');

    if (docType) {
      query = query.where('docType', '==', docType);
    }
    
    // Quick search logic: just filter in memory for 'q' if provided
    // since Firestore doesn't support generic full text search without an external service.
    // If 'q' is provided, we fetch more documents to allow in-memory filtering.
    const fetchLimit = q ? 100 : limit;
    
    query = query.limit(fetchLimit);

    if (cursor) {
      const cursorSnap = await adminDb.collection('quotations').doc(cursor).get();
      if (cursorSnap.exists) {
        query = query.startAfter(cursorSnap);
      }
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (q) {
      const lowerQ = q.toLowerCase();
      items = items.filter(item => 
        (item.refNumber && item.refNumber.toLowerCase().includes(lowerQ)) ||
        (item.recipientName && item.recipientName.toLowerCase().includes(lowerQ)) ||
        (item.clientId && item.clientId.toLowerCase().includes(lowerQ))
      );
      items = items.slice(0, limit);
    }

    const hasMore = snapshot.docs.length === fetchLimit;
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;

    return NextResponse.json({
      items,
      hasMore,
      lastDoc,
    });
  } catch (err) {
    console.error('[/api/generate-pdf/library] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
