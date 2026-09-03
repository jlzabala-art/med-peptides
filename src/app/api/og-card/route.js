import { NextResponse } from 'next/server';

/**
 * GET /api/og-card?type=product|protocol|verify&title=...&badge=...&subtitle=...
 *
 * Ultra-fast serverless SVG generator (1200x630) for WhatsApp, Telegram, and iMessage previews.
 * Zero headless browser dependencies, 100% vector, instant response (<5ms).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'product';
  const title = (searchParams.get('title') || 'RegenPept Clinical').substring(0, 50);
  const badge = (searchParams.get('badge') || (type === 'protocol' ? 'CLINICAL PROTOCOL' : type === 'verify' ? 'AUTHENTIC BATCH' : 'PEPTIDE')).substring(0, 30);
  const subtitle = (searchParams.get('subtitle') || (type === 'protocol' ? 'Phased Clinical Treatment Plan' : type === 'verify' ? 'Analytical CoA & Quality Release' : 'Clinical Product Information Sheet')).substring(0, 60);

  // Dynamic Theme Colors
  let accentColor = '#0d9488'; // Teal
  let typeIcon = '🧪';
  let pill1 = '✦  Mechanism of Action';
  let pill2 = '✦  Reconstitution Guide';
  let pill3 = '✦  Storage Conditions';
  let pill4 = '✦  Dosage Reference';

  if (type === 'protocol') {
    accentColor = '#0284c7'; // Sky Blue
    typeIcon = '📋';
    pill1 = '✦  Phased Timeline';
    pill2 = '✦  Compound Synergies';
    pill3 = '✦  Monitoring Cadence';
    pill4 = '✦  Safety Guidelines';
  } else if (type === 'verify') {
    accentColor = '#16a34a'; // Emerald Green
    typeIcon = '🛡️';
    pill1 = '✓  HPLC Purity Assay';
    pill2 = '✓  Mass Spectrometry Match';
    pill3 = '✓  Sterility & Endotoxin Pass';
    pill4 = '✓  cGMP Certified Batch';
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#071426"/>
      <stop offset="100%" style="stop-color:#002244"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f2038"/>
      <stop offset="100%" style="stop-color:#091629"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative glow accents -->
  <circle cx="1060" cy="110" r="190" fill="${accentColor}" opacity="0.12"/>
  <circle cx="140" cy="540" r="140" fill="#003666" opacity="0.3"/>

  <!-- Main Card Container -->
  <rect x="60" y="70" width="1080" height="490" rx="28" fill="url(#card)" stroke="#1e3a5f" stroke-width="1.5"/>

  <!-- Left vertical accent bar -->
  <rect x="60" y="70" width="10" height="490" rx="5" fill="${accentColor}"/>

  <!-- Top Badge -->
  <rect x="100" y="115" width="${Math.min(badge.length * 10.5 + 34, 320)}" height="34" rx="17" fill="${accentColor}" opacity="0.95"/>
  <text x="117" y="137" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="white" letter-spacing="0.05em">${badge.toUpperCase()}</text>

  <!-- Title -->
  <text x="100" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="${title.length > 25 ? 42 : 54}" font-weight="800" fill="white" letter-spacing="-0.02em">${title}</text>

  <!-- Subtitle -->
  <text x="100" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#94a3b8" font-weight="500">${subtitle}</text>

  <!-- Divider Line -->
  <line x1="100" y1="315" x2="1100" y2="315" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Feature Pills Grid -->
  <rect x="100" y="340" width="225" height="38" rx="19" fill="#172b45" stroke="#254366" stroke-width="1"/>
  <text x="120" y="364" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#7dd3fc">${pill1}</text>

  <rect x="345" y="340" width="225" height="38" rx="19" fill="#172b45" stroke="#254366" stroke-width="1"/>
  <text x="365" y="364" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#6ee7b7">${pill2}</text>

  <rect x="590" y="340" width="225" height="38" rx="19" fill="#172b45" stroke="#254366" stroke-width="1"/>
  <text x="610" y="364" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fde68a">${pill3}</text>

  <rect x="835" y="340" width="225" height="38" rx="19" fill="#172b45" stroke="#254366" stroke-width="1"/>
  <text x="855" y="364" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f9a8d4">${pill4}</text>

  <!-- Security & Clinical Guarantee Badges -->
  <rect x="100" y="405" width="160" height="28" rx="14" fill="#064e3b" opacity="0.85"/>
  <text x="118" y="424" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#6ee7b7">✓  Zero Financial Data</text>

  <rect x="275" y="405" width="170" height="28" rx="14" fill="#064e3b" opacity="0.85"/>
  <text x="293" y="424" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#6ee7b7">✓  No Login Required</text>

  <rect x="460" y="405" width="180" height="28" rx="14" fill="#064e3b" opacity="0.85"/>
  <text x="478" y="424" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#6ee7b7">✓  Direct QR Mobile Pass</text>

  <!-- Brand Footer -->
  <text x="100" y="505" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="white">RegenPept</text>
  <text x="100" y="528" font-family="system-ui, sans-serif" font-size="14" fill="#64748b">regenpept.com · Precision Clinical Peptide & Protocol Intelligence</text>

  <!-- Watermark Icon -->
  <text x="1050" y="515" font-family="system-ui, sans-serif" font-size="44" text-anchor="middle" opacity="0.6">${typeIcon}</text>
</svg>`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
