import { NextResponse } from 'next/server';

/**
 * GET /api/og-product?name=BPC-157&category=Peptide
 *
 * Generates a simple SVG-based OG image (1200x630) for WhatsApp/Twitter card previews.
 * No browser/puppeteer needed — pure SVG → returned as image/svg+xml.
 * WhatsApp and most platforms accept SVG OG images; fallback text card works regardless.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || 'Product').substring(0, 60);
  const category = (searchParams.get('category') || 'Peptide').substring(0, 40);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#003666"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f2744"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="180" fill="#0d9488" opacity="0.08"/>
  <circle cx="150" cy="530" r="120" fill="#7c3aed" opacity="0.07"/>

  <!-- Card -->
  <rect x="60" y="80" width="1080" height="470" rx="24" fill="url(#card)" opacity="0.85"/>

  <!-- Left accent bar -->
  <rect x="60" y="80" width="8" height="470" rx="4" fill="#0d9488"/>

  <!-- Category badge -->
  <rect x="100" y="120" width="${Math.min(category.length * 9.5 + 28, 280)}" height="32" rx="16" fill="#0d9488" opacity="0.9"/>
  <text x="114" y="141" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="white">${category.toUpperCase()}</text>

  <!-- Product name -->
  <text x="100" y="230" font-family="system-ui, -apple-system, sans-serif" font-size="${name.length > 30 ? 44 : 56}" font-weight="800" fill="white" opacity="0.97">${name}</text>

  <!-- Subtitle -->
  <text x="100" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#94a3b8">Clinical Information Sheet</text>

  <!-- Divider -->
  <line x1="100" y1="330" x2="1100" y2="330" stroke="#334155" stroke-width="1"/>

  <!-- Feature pills -->
  <rect x="100" y="355" width="220" height="36" rx="18" fill="#1e3a5f"/>
  <text x="120" y="379" font-family="system-ui, sans-serif" font-size="15" fill="#7dd3fc">✦  Mechanism of Action</text>

  <rect x="340" y="355" width="200" height="36" rx="18" fill="#1e3a5f"/>
  <text x="360" y="379" font-family="system-ui, sans-serif" font-size="15" fill="#6ee7b7">✦  Reconstitution Guide</text>

  <rect x="558" y="355" width="185" height="36" rx="18" fill="#1e3a5f"/>
  <text x="578" y="379" font-family="system-ui, sans-serif" font-size="15" fill="#fde68a">✦  Storage Conditions</text>

  <rect x="761" y="355" width="195" height="36" rx="18" fill="#1e3a5f"/>
  <text x="781" y="379" font-family="system-ui, sans-serif" font-size="15" fill="#f9a8d4">✦  Dosage Reference</text>

  <!-- No price / no supplier badges -->
  <rect x="100" y="415" width="145" height="28" rx="14" fill="#064e3b" opacity="0.8"/>
  <text x="118" y="434" font-family="system-ui, sans-serif" font-size="13" fill="#6ee7b7">✓  No Price Shown</text>

  <rect x="256" y="415" width="175" height="28" rx="14" fill="#064e3b" opacity="0.8"/>
  <text x="274" y="434" font-family="system-ui, sans-serif" font-size="13" fill="#6ee7b7">✓  No Supplier Listed</text>

  <rect x="442" y="415" width="165" height="28" rx="14" fill="#064e3b" opacity="0.8"/>
  <text x="460" y="434" font-family="system-ui, sans-serif" font-size="13" fill="#6ee7b7">✓  No Login Required</text>

  <!-- Brand -->
  <text x="100" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="white" opacity="0.9">RegenPept</text>
  <text x="100" y="532" font-family="system-ui, sans-serif" font-size="14" fill="#64748b">regenpept.com · Clinical Product Database</text>

  <!-- QR icon hint -->
  <rect x="990" y="450" width="80" height="80" rx="12" fill="#0f172a"/>
  <text x="1030" y="505" font-family="system-ui, sans-serif" font-size="38" text-anchor="middle" fill="#94a3b8">⬛</text>
  <text x="1030" y="548" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" fill="#475569">Scan QR</text>
</svg>`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
