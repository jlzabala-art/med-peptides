import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { getZohoAccessToken } from '@/lib/zoho/zohoClient';
import { authorize } from '@/lib/access/payablesAccessGuard';

/**
 * GET /api/payables/[token]/pdf/[billId]
 * Streams the authoritative binary PDF directly from Zoho Books.
 */
function getCacheFile(wholesalerId, billId, bill) {
  try {
    const bucketName = process.env.PAYABLES_PDF_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName || !admin?.apps?.length) return null;
    // Version key: any change in the cached bill invalidates the stored PDF.
    const version = crypto
      .createHash('sha256')
      .update([bill.updatedAt, bill.total, bill.balance, bill.status].join('|'))
      .digest('hex')
      .slice(0, 16);
    return admin.storage().bucket(bucketName).file(`payables-pdf/${wholesalerId}/${billId}-${version}.pdf`);
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams?.token;
    const billId = resolvedParams?.billId;

    if (!token || !billId) {
      return NextResponse.json({ error: 'Missing token or billId parameter' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Resolve share record
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
      return NextResponse.json({ error: 'Payables statement not found or expired' }, { status: 404 });
    }

    // 2. Authorization check (admin bearer / OTP session / legacy during grace period)
    const access = await authorize(request, token, shareDoc);
    if (!access.ok) {
      return NextResponse.json({ error: 'Unauthorized to view bill PDF' }, { status: 403 });
    }

    // 2b. Ownership: bill must belong to this wholesaler's statement
    const billSnap = await adminDb
      .collection('payables_statements')
      .doc(wholesalerId)
      .collection('bills')
      .doc(billId)
      .get();
    if (!billSnap.exists) {
      return NextResponse.json({ error: 'Bill not found for this statement' }, { status: 404 });
    }

    // 2c. Serve from private Storage cache when available (auth already enforced above)
    const cacheFile = getCacheFile(wholesalerId, billId, billSnap.data() || {});
    const pdfHeaders = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Bill-${billId}.pdf"`,
      'Cache-Control': 'private, max-age=300'
    };
    if (cacheFile) {
      try {
        const [exists] = await cacheFile.exists();
        if (exists) {
          const [cached] = await cacheFile.download();
          return new NextResponse(cached, { status: 200, headers: { ...pdfHeaders, 'X-PDF-Cache': 'HIT' } });
        }
      } catch (cacheErr) {
        console.warn('PDF cache read skipped:', cacheErr.message);
      }
    }

    // 3. Fetch PDF from Zoho Books
    const accessToken = await getZohoAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Could not obtain Zoho Books access token' }, { status: 502 });
    }

    const orgId = shareDoc.zohoOrgId || '662274409';
    const zohoUrl = `https://www.zohoapis.com/books/v3/bills/${encodeURIComponent(billId)}?organization_id=${orgId}&accept=pdf`;

    const res = await fetch(zohoUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Zoho Books PDF fetch failed:', res.status, errText);
      return NextResponse.json({ error: 'Failed to retrieve PDF from Zoho Books' }, { status: res.status });
    }

    const pdfBuffer = Buffer.from(await res.arrayBuffer());

    if (cacheFile) {
      cacheFile.save(pdfBuffer, { contentType: 'application/pdf', resumable: false })
        .catch((e) => console.warn('PDF cache write skipped:', e.message));
    }

    return new NextResponse(pdfBuffer, { status: 200, headers: { ...pdfHeaders, 'X-PDF-Cache': 'MISS' } });
  } catch (err) {
    console.error('Error streaming bill PDF:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

