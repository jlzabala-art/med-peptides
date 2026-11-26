#!/usr/bin/env node
/**
 * Generate branded 1200x630 OG images for all /pricing/* routes.
 * Combines Atlas Health Services icon/logo + real clinical photography + B2B typography.
 */
import sharp from 'sharp';
import path from 'node:path';

const ROOT = process.cwd();
const LOGO_PATH = path.join(ROOT, 'public', 'logo-icon-only.png');

const CARDS = [
  {
    out: 'public/og-pellets.png',
    photo: 'public/images/clinical/goal_hormonal.jpg',
    badge: 'EU GMP · SUBCUTANEOUS BHRT',
    title1: 'Bioidentical Hormone',
    title2: 'Pellets & Trocar Kits',
    subtitle: '3.5–6 Month Zero-Order Release · >=99.5% USP/EP',
    accent: '#38bdf8',
  },
  {
    out: 'public/og-peptides.png',
    photo: 'public/images/clinical/kit_10_vials.jpg',
    badge: 'HPLC >=99% · LYOPHILIZED VIALS',
    title1: 'Clinical Peptides',
    title2: 'B2B Price Schedule',
    subtitle: 'Single Vials & Pack x10 Institutional Tiers · CoA Verified',
    accent: '#34d399',
  },
  {
    out: 'public/og-pens.png',
    photo: 'public/images/clinical/pen_single_cartridge.jpg',
    badge: '3 mL CARTRIDGE · 300 IU PEN',
    title1: 'Pre-filled Peptide',
    title2: 'Injection Pens',
    subtitle: 'Precision Micro-Dosing Clicks · Ready-to-Dispense B2B',
    accent: '#a78bfa',
  },
  {
    out: 'public/og-fillers.png',
    photo: 'public/images/clinical/goal_skin_hair.jpg',
    badge: 'AESTHETICS & SKIN BOOSTERS',
    title1: 'Aesthetic Injectables',
    title2: '& Biostimulators',
    subtitle: 'Dermal Fillers · Polynucleotides · Clinic Bulk Pricing',
    accent: '#f472b6',
  },
  {
    out: 'public/og-bloodo.png',
    photo: 'public/images/clinical/goal_metabolic.jpg',
    badge: 'CE-IVDR · CAPILLARY DBS KITS',
    title1: 'Bloodo Biomarker',
    title2: 'Diagnostic Panels',
    subtitle: 'NAD+ · Testosterone · Cortisol · HbA1c · Omega-3/6',
    accent: '#fb7185',
  },
  {
    out: 'public/og-hormones.png',
    photo: 'public/images/clinical/goal_hormonal.jpg',
    badge: 'ENDOCRINOLOGY & BHRT',
    title1: 'Bioidentical HRT',
    title2: '& TRT Formulations',
    subtitle: 'EU GMP Compounded Preparations · Official B2B Tariff',
    accent: '#60a5fa',
  },
  {
    out: 'public/og-colway.png',
    photo: 'public/images/clinical/topical_serum.jpg',
    badge: 'BIO-COLLAGEN & TRICHOLOGY',
    title1: 'Colway Clinical',
    title2: 'Skincare & Hair Line',
    subtitle: 'Native Triple-Helix Collagen · Clinic & Retail Margin Tiers',
    accent: '#2dd4bf',
  },
  {
    out: 'public/og-genomics.png',
    photo: 'public/images/clinical/goal_longevity.jpg',
    badge: 'CE-IVD GENOMICS · +700,000 SNPs',
    title1: '24Genetics Clinical',
    title2: 'DNA Panels Schedule',
    subtitle: 'Pharmacogenetics · Nutrigenetics · Longevity · Microbiome',
    accent: '#818cf8',
  },
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderCard(card) {
  const width = 1200;
  const height = 630;
  const photoW = 450;
  const photoH = 510;
  const photoX = 700;
  const photoY = 60;

  // Prepare rounded photo card
  const maskSvg = Buffer.from(
    `<svg width="${photoW}" height="${photoH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${photoW}" height="${photoH}" rx="28" ry="28" fill="#ffffff"/>
    </svg>`
  );

  const photoBuf = await sharp(path.join(ROOT, card.photo))
    .resize(photoW, photoH, { fit: 'cover', position: 'center' })
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Prepare crisp Atlas icon badge
  const logoBuf = await sharp(LOGO_PATH)
    .resize(52, 52, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const bgSvg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#001d3d"/>
        <stop offset="58%" stop-color="#003666"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <circle cx="110" cy="570" r="220" fill="${card.accent}" fill-opacity="0.08"/>
    <rect x="${photoX - 4}" y="${photoY - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="32" fill="none" stroke="${card.accent}" stroke-opacity="0.35" stroke-width="2"/>

    <!-- Top Brand Header -->
    <text x="128" y="88" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="0.4">Atlas Health Services</text>
    <text x="128" y="110" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" letter-spacing="1.2">INSTITUTIONAL B2B PLATFORM</text>

    <!-- Category Pill -->
    <rect x="64" y="160" width="360" height="36" rx="18" fill="${card.accent}" fill-opacity="0.16" stroke="${card.accent}" stroke-opacity="0.5"/>
    <text x="84" y="183" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="${card.accent}" letter-spacing="1.1">${escapeXml(card.badge)}</text>

    <!-- Main Title -->
    <text x="64" y="268" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${escapeXml(card.title1)}</text>
    <text x="64" y="332" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="${card.accent}">${escapeXml(card.title2)}</text>

    <!-- Subtitle -->
    <text x="64" y="396" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="400" fill="#cbd5e1">${escapeXml(card.subtitle)}</text>

    <!-- Footer Divider & Currency Line -->
    <rect x="64" y="478" width="580" height="1.5" fill="#334155"/>
    <text x="64" y="520" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#f8fafc">Official B2B Tariff · EUR / USD / AED</text>
    <text x="64" y="548" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#94a3b8">atlashealth-services.com · Verified Clinical Supply</text>
  </svg>`);

  await sharp(bgSvg)
    .composite([
      { input: logoBuf, left: 64, top: 62 },
      { input: photoBuf, left: photoX, top: photoY },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, card.out));

  console.log(`Generated ${card.out}`);
}

for (const card of CARDS) {
  await renderCard(card);
}
console.log('ALL_OG_IMAGES_READY');
