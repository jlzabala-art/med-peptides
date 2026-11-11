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
      const acceptHeader = request.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        return new NextResponse(
          `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Documento Oficial Protegido · Atlas Health Services</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 28px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
      font-size: 22px;
    }
    .pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      color: #1e40af;
      background: #dbeafe;
      padding: 3px 10px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 0.84rem;
      color: #64748b;
      line-height: 1.55;
      margin: 0 0 20px 0;
    }
    .footer {
      font-size: 0.70rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <span class="pill">Acceso Restringido · Protected Document</span>
    <h2>Previsualización Protegida</h2>
    <p>Para visualizar o descargar este documento en PDF con su desglose fiscal completo, es necesario identificarse o registrarse con la cuenta autorizada del proveedor.</p>
    <div class="footer">Atlas Health Services · Zoho Books Official Settlement Record</div>
  </div>
</body>
</html>`,
          {
            status: 403,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      }
      return NextResponse.json({
        error: 'Unauthorized: Registration or sign in required to view bill PDF',
        message: 'Para consultar o descargar la factura oficial en PDF, identifícate o regístrate con tu correo autorizado.'
      }, { status: 403 });
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

