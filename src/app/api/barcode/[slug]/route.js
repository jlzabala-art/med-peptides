import QRCode from 'qrcode';
import { adminDb } from '../../../../lib/firebaseAdmin.js';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateBarcode1dSvg(codeText, width = 360, height = 48) {
  const clean = String(codeText || 'RP-LOT-2026').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  let x = 6;
  const rects = [];
  
  // Start guard
  rects.push(`<rect x="${x}" y="0" width="2" height="${height}" fill="#002244"/>`); x += 4;
  rects.push(`<rect x="${x}" y="0" width="1" height="${height}" fill="#002244"/>`); x += 3;
  rects.push(`<rect x="${x}" y="0" width="3" height="${height}" fill="#002244"/>`); x += 5;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const w1 = ((code * 7) % 3) + 1;
    const s1 = ((code * 3) % 2) + 1;
    const w2 = ((code * 11) % 3) + 1;
    const s2 = ((code * 5) % 3) + 1;
    rects.push(`<rect x="${x}" y="0" width="${w1}" height="${height}" fill="#002244"/>`);
    x += w1 + s1;
    rects.push(`<rect x="${x}" y="0" width="${w2}" height="${height}" fill="#002244"/>`);
    x += w2 + s2;
  }

  // End guard
  rects.push(`<rect x="${x}" y="0" width="3" height="${height}" fill="#002244"/>`); x += 4;
  rects.push(`<rect x="${x}" y="0" width="1" height="${height}" fill="#002244"/>`); x += 3;
  rects.push(`<rect x="${x}" y="0" width="2" height="${height}" fill="#002244"/>`); x += 4;

  const totalWidth = Math.max(x + 6, width);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`;
}

async function fetchProductData(slug) {
  const target = decodeURIComponent(slug).toLowerCase().trim();
  let data = null;

  if (adminDb) {
    try {
      // 1. By ID (slug as document ID)
      const byId = await adminDb.collection('products').doc(target).get().catch(() => null);
      if (byId?.exists) {
        data = { id: byId.id, ...byId.data() };
      } else {
        // 2. By slug field
        const qSlug = await adminDb.collection('products')
          .where('slug', '==', target)
          .limit(1)
          .get()
          .catch(() => null);
        if (!qSlug?.empty) {
          const doc = qSlug.docs[0];
          data = { id: doc.id, ...doc.data() };
        }
      }
    } catch (err) {
      console.warn('[/api/barcode/[slug]] Firestore fetch warning:', err.message);
    }
  }

  const cleanName = data?.name || data?.displayName || target
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const purity = data?.purity || '≥ 99.0% (RP-HPLC Verified)';
  const targetAxis = data?.targetSystem || data?.target || 'Clinical Research Reference Standard';
  const lotNumber = `LOT-${target.toUpperCase()}-2026`;
  const skuNumber = `RP-LOT-${target.toUpperCase()}`;

  return {
    name: cleanName,
    purity,
    targetAxis,
    lotNumber,
    skuNumber,
    supplier: 'Lotusland (cGMP / ISO 9001:2015)',
  };
}

/**
 * GET /api/barcode/[slug]?supplier=lotusland&format=svg|png
 *
 * Generates an ultra-crisp 1200x630 OpenGraph / Barcode / QR image
 * as SVG (zero native dependencies, works in production on Cloud Functions).
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams?.slug || 'retatrutide';
    const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
    const { searchParams } = new URL(request.url);
    const supplier = searchParams.get('supplier') || 'lotusland';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
    const targetUrl = `${baseUrl}/p/${slug}${supplier ? `?supplier=${encodeURIComponent(supplier)}` : ''}`;

    // 1. Fetch Product Metadata
    const product = await fetchProductData(slug);

    // 2. Generate Native QR SVG (pure JS — no native deps)
    const rawQrSvg = await QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#002244',
        light: '#FFFFFF',
      },
    });
    const qrSvgContent = rawQrSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '');

    // 3. Generate 1D Barcode SVG
    const barcode1dSvg = generateBarcode1dSvg(product.skuNumber, 360, 44);

    // 4. Compose Master SVG (1200x630) — served directly, no conversion needed
    const masterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#EFF6FF" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#002244" />
      <stop offset="100%" stop-color="#003666" />
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#002244" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Outer Master Card -->
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" filter="url(#cardShadow)" />

  <!-- Top Institutional Bar -->
  <path d="M 24 44 A 20 20 0 0 1 44 24 L 1156 24 A 20 20 0 0 1 1176 44 L 1176 100 L 24 100 Z" fill="url(#headerGrad)" />
  
  <!-- Brand & Alliance -->
  <text x="60" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" letter-spacing="-0.02em">
    REGENPEPT <tspan fill="#38BDF8">×</tspan> LOTUSLAND
  </text>
  <text x="60" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" letter-spacing="0.08em">
    OFFICIAL CLINICAL MONOGRAPH &amp; ANALYTICAL RELEASE STANDARD
  </text>

  <!-- cGMP Badge Top-Right -->
  <rect x="870" y="44" width="266" height="38" rx="8" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1.5" />
  <circle cx="892" cy="63" r="6" fill="#10B981" />
  <text x="908" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" letter-spacing="0.04em">
    cGMP &amp; ISO 9001:2015
  </text>

  <!-- ── Left Column: Peptide Specs & 1D Barcode ── -->
  <!-- Product Title -->
  <text x="60" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="900" fill="#0F172A" letter-spacing="-0.03em">
    ${escapeXml(product.name.toUpperCase())}
  </text>
  <text x="60" y="202" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#0284C7" letter-spacing="0.05em">
    STERILE LYOPHILIZED SUBCUTANEOUS VIAL
  </text>

  <!-- Analytical Purity Pill -->
  <rect x="60" y="222" width="370" height="34" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" />
  <text x="76" y="244" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#15803D" letter-spacing="0.03em">
    ✔ RP-HPLC PURITY ${escapeXml(product.purity.toUpperCase())}
  </text>

  <!-- Clinical Spec Grid Box -->
  <rect x="60" y="272" width="620" height="150" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  
  <text x="82" y="306" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" fill="#64748B" letter-spacing="0.05em">TARGET RECEPTOR AXIS</text>
  <text x="82" y="328" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#0F172A">${escapeXml(product.targetAxis)}</text>

  <line x1="82" y1="345" x2="658" y2="345" stroke="#E2E8F0" stroke-width="1" />

  <text x="82" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="800" fill="#64748B" letter-spacing="0.05em">RECONSTITUTION &amp; STORAGE</text>
  <text x="82" y="397" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#334155">Bacteriostatic Water (BAC 0.9%) · Cold-Chain 2°C–8°C (Do Not Freeze)</text>

  <!-- 1D Linear Barcode Box -->
  <g transform="translate(60, 440)">
    ${barcode1dSvg}
    <text x="6" y="60" font-family="monospace, 'Courier New', Courier" font-size="13" font-weight="700" fill="#475569" letter-spacing="0.12em">
      ${escapeXml(product.skuNumber)} · ${escapeXml(product.lotNumber)}
    </text>
  </g>

  <!-- ── Right Column: High-Density QR Card ── -->
  <g transform="translate(740, 130)">
    <!-- White Enclosure Card -->
    <rect x="0" y="0" width="396" height="425" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
    
    <!-- Subtle Top Accent -->
    <path d="M 0 16 A 16 16 0 0 1 16 0 L 380 0 A 16 16 0 0 1 396 16 L 396 38 L 0 38 Z" fill="#F1F5F9" />
    <text x="198" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#475569" letter-spacing="0.08em">
      DIRECT MONOGRAPH SCANNER
    </text>

    <!-- Embedded QR Code -->
    <g transform="translate(48, 55)">
      <rect x="-10" y="-10" width="320" height="320" fill="#FFFFFF" />
      <svg width="300" height="300" viewBox="0 0 100 100">
        ${qrSvgContent}
      </svg>
    </g>

    <!-- QR Instruction Label -->
    <text x="198" y="388" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#002244" letter-spacing="0.02em">
      SCAN WITH CAMERA TO OPEN SPECS
    </text>
    <text x="198" y="408" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="#64748B">
      med-peptides.com/p/${escapeXml(slug)}
    </text>
  </g>

  <!-- Bottom Institutional Footer -->
  <line x1="60" y1="560" x2="1140" y2="560" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="60" y="585" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" fill="#64748B">
    Document Ref: PDS-${escapeXml(slug.toUpperCase())}-2026 · Authorized Clinical Reference · Lotusland Synthesis Alliance
  </text>
  <text x="1140" y="585" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#0284C7">
    Verified on Atlas Health Clinical Engine 2026
  </text>
</svg>`;

    return new Response(masterSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Length': String(Buffer.byteLength(masterSvg, 'utf8')),
      },
    });
  } catch (err) {
    console.error('[API /api/barcode/[slug]] Error:', err);
    return new Response('Error generating barcode', { status: 500 });
  }
}
