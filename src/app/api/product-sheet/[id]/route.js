import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { getPeptideScientificData } from '../../../../utils/knownPeptideData';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://atlassolutions.com';
const BRAND_NAME = 'Atlas Solutions';
const BRAND_COLOR = rgb(0, 0.21, 0.4);       // #003666 (Deep Corporate Navy)
const TEAL_COLOR  = rgb(0.05, 0.58, 0.53);   // #0d9488 (Medical Teal)
const MUTED       = rgb(0.39, 0.45, 0.55);   // #64748b (Slate Muted)
const LIGHT_BG    = rgb(0.96, 0.98, 1.0);    // #f8fafc (Subtle Light)
const BORDER_CLR  = rgb(0.88, 0.91, 0.94);   // #e2e8f0 (Grid Border)
const WARN_BG     = rgb(1.0, 0.95, 0.95);    // #fef2f2 (Warning Box)
const WARN_RED    = rgb(0.86, 0.15, 0.15);   // #dc2626 (Clinical Danger Red)

// ⚡ Layer 1 In-Memory Buffer RAM Cache for Generated PDFs
const PDF_RAM_CACHE = new Map();
const PDF_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function invalidatePdfCache(id) {
  if (!id) {
    PDF_RAM_CACHE.clear();
  } else {
    const prefix = id.toLowerCase();
    for (const key of PDF_RAM_CACHE.keys()) {
      if (key.startsWith(prefix)) {
        PDF_RAM_CACHE.delete(key);
      }
    }
  }
}

// Public fields only — never expose commercial cost or private suppliers
const PUBLIC_FIELDS = [
  'id', 'name', 'canonicalName', 'displayName', 'slug',
  'category', 'therapeutic_category', 'type', 'subcategory',
  'description', 'desc', 'objective', 'format', 'presentation',
  'casNumber', 'cas', 'scientificName', 'molecularFormula', 'molecularWeight',
  'goals', 'mechanisms', 'tags', 'primary_goal', 'target', 'targetSystem',
  'pharmacology', 'aiContent', 'isProfessional', 'requiresPrescription',
  'status', 'isActive',
];

const VARIANT_PUBLIC_FIELDS = [
  'id', 'dose', 'dosage', 'presentation', 'presentationName', 'format',
  'strength', 'grade', 'administrationRoute',
  'reconstitutionGuide', 'storageInstructions', 'shelfLife',
  'contraindications', 'warnings',
];

const GOAL_LABELS = {
  fat_loss: 'Fat Loss & Metabolic Health', 
  tissue_repair: 'Tissue Repair & Recovery',
  muscle_growth: 'Muscle & Body Composition', 
  anti_aging: 'Longevity & Cellular Repair',
  cognitive: 'Cognitive & Neuroprotection', 
  immune: 'Immune Modulation',
  hormonal: 'Hormonal Balance', 
  gut_health: 'Gut Health', 
  sleep: 'Sleep & Recovery',
};

function humanizeGoal(g) {
  return GOAL_LABELS[g] || (g || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function pickFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return {};
  return fields.reduce((acc, f) => { if (obj[f] !== undefined) acc[f] = obj[f]; return acc; }, {});
}

function cleanPdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/[•]/g, '-')
    .replace(/[⚠]/g, '!')
    .replace(/[·]/g, '|')
    .replace(/[—–]/g, '-')
    .replace(/[’’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7F]/g, '');
}

function trunc(s, n) {
  const str = cleanPdfText(s);
  return str.length > n ? str.substring(0, n - 3) + '...' : str;
}

function wrapText(text, maxChars) {
  if (!text) return [];
  const cleaned = cleanPdfText(text);
  const words = cleaned.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function getProduct(id) {
  if (!adminDb || !id) return null;

  const byId = await adminDb.collection('products').doc(id).get().catch(() => null);
  let doc = byId?.exists ? byId : null;

  if (!doc) {
    const bySlug = await adminDb.collection('products').where('slug', '==', id.toLowerCase()).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  if (!doc) return null;

  const raw = { id: doc.id, ...doc.data() };
  if (raw.status === 'hidden' || raw.status === 'archived') return null;

  const varSnap = await doc.ref.collection('variants').get().catch(() => null);
  const variants = (varSnap?.docs || []).map(v => pickFields({ id: v.id, ...v.data() }, VARIANT_PUBLIC_FIELDS));

  return { ...pickFields(raw, PUBLIC_FIELDS), variants: variants.length > 0 ? variants : (raw.variants || []) };
}

export async function GET(request, context) {
  try {
    const resolvedParams = await context?.params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });

    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: 'Product not found or not public' }, { status: 404 });

    const name = product.canonicalName || product.name || product.displayName || id;
    const category = product.category || product.therapeutic_category || 'Product';

    // ── Archetype Detection ──
    const catRaw = (product.category || product.subcategory || '').toLowerCase();
    const nameRaw = (name || '').toLowerCase();
    const presRaw = (product.presentation || product.format || '').toLowerCase();

    const isDevice = /pen|device|needle|syringe|injector|accessory|consumable|bac water|supplies/i.test(catRaw) ||
                     /pen|device|needle|syringe|injector/i.test(nameRaw) ||
                     /empty.?pen|injector/i.test(presRaw);

    const isPreFilledPen = isDevice && (/pre.?fill|peptide.?pen|cartridge/i.test(nameRaw) || /pre.?fill/i.test(presRaw) || /cartridge/i.test(presRaw));

    const isDiagnostic = /diagnostic|genomic|dna|test|saliva|blood|biomarker|panel/i.test(catRaw) ||
                         /test|dna|genomic|screen|biomarker/i.test(nameRaw);

    const isSmallMolecule = /small.?molecule|nootropic|longevity|metabolic|supplement|vitamin|capsule/i.test(catRaw) ||
                            /nad\+|nmn|metformin|resveratrol|curcumin|melatonin|methylene/i.test(nameRaw);

    const isPeptide = !isDevice && !isDiagnostic && !isSmallMolecule;

    // ── Delivery Triad Format Resolution (vial, single_cartridge_pen, double_cartridge_pen) ──
    const searchParams = new URL(request.url).searchParams;
    const formatParam = (searchParams.get('format') || '').toLowerCase();
    let selectedFormat = 'vial';
    if (/double|dual/i.test(formatParam)) {
      selectedFormat = 'double_cartridge_pen';
    } else if (/single|cartridge|pen/i.test(formatParam)) {
      selectedFormat = 'single_cartridge_pen';
    } else if (formatParam === 'vial') {
      selectedFormat = 'vial';
    } else {
      const isLotusland = /lotusland/i.test(product.supplierName || product.supplier || product.supplierId || '');
      if (isLotusland) {
        selectedFormat = 'vial';
      } else {
        const variants = product.variants || [];
        const hasDouble = variants.some(v => /double|dual|two.?chamber/i.test(v.presentation || v.format || ''));
        if (hasDouble || /double|dual|two.?chamber/i.test(nameRaw) || /double|dual|two.?chamber/i.test(presRaw)) {
          selectedFormat = 'double_cartridge_pen';
        } else if (isPreFilledPen || variants.some(v => /single|cartridge|\bpen\b/i.test(v.presentation || v.format || '')) || /single|cartridge|\bpen\b/i.test(nameRaw) || /single|cartridge|\bpen\b/i.test(presRaw)) {
          selectedFormat = 'single_cartridge_pen';
        } else {
          selectedFormat = 'vial';
        }
      }
    }

    // ⚡ Check Layer 1 Buffer RAM Cache (< 1ms instant binary delivery)
    const cacheKey = `${id.toLowerCase()}_${selectedFormat}`;
    const cached = PDF_RAM_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new NextResponse(cached.bytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${cached.filename}"`,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          'X-Atlas-Cache': 'HIT-RAM',
        },
      });
    }

    const sciData = getPeptideScientificData(name) || {};
    const rawCas = product.casNumber || product.cas || product.cas_number || product.molecular?.casNumber || sciData.casNumber;
    const cleanCas = (!rawCas || /available on request/i.test(rawCas)) ? (sciData.casNumber || null) : rawCas;
    const casNumber = cleanCas || (isDevice ? 'N/A (Medical Device)' : 'N/A');
    const molecularFormula = product.molecularFormula || sciData.molecularFormula || 'Synthetic Polypeptide Structure';
    const molecularWeight = product.molecularWeight || sciData.molecularWeight || '';
    const targetSystem = product.targetSystem || product.target || sciData.targetSystem || 'Cellular Receptor Signaling & Homeostasis';
    const description = product.desc || product.description || product.objective || sciData.mechanismOfAction || 'Standardized clinical formulation engineered for physiological optimization.';

    const mechanisms = Array.isArray(product.mechanisms) && product.mechanisms.length > 0
      ? product.mechanisms 
      : [sciData.mechanismOfAction || 'Targeted physiological receptor modulation with high affinity binding profile.'];

    const goals = Array.isArray(product.goals) ? product.goals : (product.primary_goal ? [product.primary_goal] : []);
    const variants = product.variants || [];

    // ── PDF Document Creation ──
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const W = 595, H = 842; // A4
    const MRG = 40;
    const RIGHT = W - MRG;
    const CONTENT_W = RIGHT - MRG;

    const docCode = `ATS-DS-${(casNumber.replace(/[^0-9A-Z]/gi, '') || id.slice(-6)).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    function addPage() {
      const p = pdfDoc.addPage([W, H]);

      // Top Banner
      p.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: BRAND_COLOR });
      p.drawText(BRAND_NAME, { x: MRG, y: H - 32, size: 15, font: fontB, color: rgb(1, 1, 1) });
      p.drawText('CLINICAL SPECIFICATION & OFFICIAL PRODUCT MONOGRAPH', {
        x: MRG, y: H - 46, size: 7.5, font: fontB, color: rgb(0.68, 0.85, 0.95),
      });

      const refText = `DOC REF: ${docCode}`;
      const refW = font.widthOfTextAtSize(refText, 7.5);
      p.drawText(refText, { x: RIGHT - refW, y: H - 32, size: 7.5, font: fontB, color: rgb(1, 1, 1) });

      const dateText = `DATE: ${dateStr}`;
      const dateW = font.widthOfTextAtSize(dateText, 7.5);
      p.drawText(dateText, { x: RIGHT - dateW, y: H - 46, size: 7.5, font, color: rgb(0.8, 0.9, 0.98) });

      // Footer
      p.drawLine({ start: { x: MRG, y: 36 }, end: { x: RIGHT, y: 36 }, thickness: 0.5, color: BORDER_CLR });
      p.drawText(`${BRAND_NAME}  ·  Medical & Pharmaceutical Intelligence  ·  Confidential — For Authorized Medical Use Only`, {
        x: MRG, y: 24, size: 6.8, font, color: MUTED,
      });

      const pgStr = `Page ${pdfDoc.getPageCount()}`;
      const pgW = font.widthOfTextAtSize(pgStr, 7.5);
      p.drawText(pgStr, { x: RIGHT - pgW, y: 24, size: 7.5, font: fontB, color: BRAND_COLOR });

      return p;
    }

    let page = addPage();
    let y = H - 76;

    // ── Header Box ──
    page.drawRectangle({ x: MRG, y: y - 68, width: CONTENT_W, height: 68, color: LIGHT_BG, borderColor: BORDER_CLR, borderWidth: 1 });

    const catBadge = isDevice 
      ? (isPreFilledPen ? 'COMP. PRE-FILLED PEN' : 'MEDICAL DEVICE')
      : isDiagnostic
        ? 'GENOMIC & DIAGNOSTIC'
        : isSmallMolecule
          ? 'SMALL MOLECULE API'
          : selectedFormat === 'double_cartridge_pen'
            ? 'PEPTIDE · DOUBLE CARTRIDGE (DUAL-CHAMBER)'
            : selectedFormat === 'single_cartridge_pen'
              ? 'PEPTIDE · SINGLE CARTRIDGE PEN (LIQUID)'
              : 'PEPTIDE · LYOPHILIZED VIAL';

    const catW = fontB.widthOfTextAtSize(catBadge, 7) + 8;
    page.drawRectangle({ x: MRG + 12, y: y - 16, width: catW, height: 13, color: TEAL_COLOR, borderRadius: 3 });
    page.drawText(catBadge, { x: MRG + 16, y: y - 13, size: 7, font: fontB, color: rgb(1, 1, 1) });

    // Canonical Standard (No supplier purity!)
    const standardBadge = isDevice ? (isPreFilledPen ? 'HS: 3004.90' : 'HS: 9018.31') : isDiagnostic ? 'CLIA / CE-IVD SPECIFICATION' : 'PHARMACEUTICAL GRADE';
    const stdW = fontB.widthOfTextAtSize(standardBadge, 7) + 8;
    page.drawRectangle({ x: RIGHT - stdW - 12, y: y - 16, width: stdW, height: 13, color: rgb(0.93, 0.95, 0.98), borderColor: rgb(0.75, 0.85, 0.95), borderWidth: 0.5 });
    page.drawText(standardBadge, { x: RIGHT - stdW - 8, y: y - 13, size: 7, font: fontB, color: BRAND_COLOR });

    page.drawText(trunc(name, 50), { x: MRG + 12, y: y - 36, size: 16, font: fontB, color: BRAND_COLOR });

    // Subheader Line
    if (isDevice) {
      page.drawText('Tariff Classification: ', { x: MRG + 12, y: y - 54, size: 8, font: fontB, color: rgb(0.2, 0.25, 0.3) });
      const hsDesc = isPreFilledPen ? '3004.90 (Pre-filled Compounded Peptide Pen)' : '9018.31 (Pen-type Injection Device, Empty)';
      page.drawText(hsDesc, { x: MRG + 105, y: y - 54, size: 8, font, color: BRAND_COLOR });
    } else {
      page.drawText('CAS Registry: ', { x: MRG + 12, y: y - 54, size: 8, font: fontB, color: rgb(0.2, 0.25, 0.3) });
      page.drawText(`${casNumber}    `, { x: MRG + 80, y: y - 54, size: 8, font, color: BRAND_COLOR });
      if (molecularWeight) {
        page.drawText(`MW: ${molecularWeight} Da`, { x: MRG + 180, y: y - 54, size: 8, font, color: MUTED });
      }
    }

    y -= 86;

    // ════════════════════════════════════════════════════════════
    // ARCHETYPE 1: DEVICES & INJECTION EQUIPMENT
    // ════════════════════════════════════════════════════════════
    if (isDevice) {
      page.drawText('1. PROPOSED HARMONIZED SYSTEM (HS) CLASSIFICATION', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      const hsLines = isPreFilledPen 
        ? wrapText('Proposed HS Family: 3004.90 | Description: Patient-specific compounded sterile peptide preparation, supplied in a pre-filled multidose injection pen for subcutaneous administration. Note: These products are patient-specific compounded pharmaceutical preparations and are not industrially manufactured finished medicinal products.', 92)
        : wrapText('Proposed HS Code: 9018.31 | Description: Pen-type injection device for subcutaneous administration, supplied without medicinal product. Engineered for multidose administration of liquid preparations.', 92);

      page.drawRectangle({ x: MRG, y: y - (hsLines.length * 11 + 10), width: CONTENT_W, height: hsLines.length * 11 + 14, color: LIGHT_BG, borderColor: BORDER_CLR, borderWidth: 0.5 });
      let hsy = y - 4;
      for (const line of hsLines) {
        page.drawText(line, { x: MRG + 8, y: hsy, size: 8, font, color: rgb(0.15, 0.2, 0.25) });
        hsy -= 11;
      }
      y = hsy - 12;

      page.drawText('2. MECHANICAL SPECIFICATIONS & CARTRIDGE COMPATIBILITY', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      const deviceSpecs = [
        'Cartridge Format: Standard 3.0 mL dual-chamber or single-chamber cylindrical cartridges.',
        'Dose Selector: Micro-stepper dial with 0.01 mL / 0.05 mL audible and tactile increments.',
        'Materials: Anodized medical aluminum chassis with reinforced biocompatible polymers.',
        'Sterilization: Validated Ethylene Oxide (EtO) and Gamma irradiation processing.'
      ];
      for (const spec of deviceSpecs) {
        page.drawText(`-  ${spec}`, { x: MRG, y, size: 8.2, font, color: rgb(0.2, 0.25, 0.3) });
        y -= 13;
      }
      y -= 8;

      page.drawText('3. HANDLING, NEEDLE DISPOSAL & TEMPERATURE STABILITY', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      const handleLines = wrapText('Store device at controlled room temperature (15C to 25C) protected from excessive moisture. Injection needles must be safely detached and discarded into a certified sharps container immediately following each subcutaneous administration. Never store pen with needle attached to avoid product crystallization or bacterial contamination.', 92);
      for (const line of handleLines) {
        page.drawText(line, { x: MRG, y, size: 8.2, font, color: rgb(0.2, 0.25, 0.3) });
        y -= 12;
      }
      y -= 10;
    }

    // ════════════════════════════════════════════════════════════
    // ARCHETYPE 2: GENOMICS & DIAGNOSTICS
    // ════════════════════════════════════════════════════════════
    else if (isDiagnostic) {
      page.drawText('1. ASSAY METHODOLOGY & TECHNOLOGY PLATFORM', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      const diagLines = wrapText('Technology: Next-Generation Sequencing (NGS) and High-Density DNA Microarray. Scope: Polygenic risk scoring, pharmacogenomics (CYP enzyme profiles), metabolic phenotype analysis and longevity biomarker quantification. Turnaround: 15 to 20 business days from specimen receipt.', 92);
      for (const line of diagLines) {
        page.drawText(line, { x: MRG, y, size: 8.2, font, color: rgb(0.2, 0.25, 0.3) });
        y -= 12;
      }
      y -= 10;

      page.drawText('2. SPECIMEN MATRIX, STABILIZATION & LOGISTICS', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      const specLines = wrapText('Required Matrix: Non-invasive Buccal Saliva Swab (2.0mL) or Dried Blood Spot (DBS). Sample includes proprietary lysis buffer ensuring cellular DNA integrity at room temperature for up to 6 months. Cold chain transport is not required.', 92);
      for (const line of specLines) {
        page.drawText(line, { x: MRG, y, size: 8.2, font, color: rgb(0.2, 0.25, 0.3) });
        y -= 12;
      }
      y -= 10;
    }

    // ════════════════════════════════════════════════════════════
    // ARCHETYPE 3: PEPTIDES & BIOLOGICALS (Standard)
    // ════════════════════════════════════════════════════════════
    else {
      page.drawText('1. PHARMACOLOGICAL PROFILE & TARGET SYSTEM', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
      y -= 4;
      page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
      y -= 14;

      page.drawRectangle({ x: MRG, y: y - 18, width: CONTENT_W, height: 22, color: rgb(0.94, 0.98, 0.97), borderColor: rgb(0.7, 0.9, 0.85), borderWidth: 0.5 });
      page.drawText('Primary Target:', { x: MRG + 8, y: y - 11, size: 8, font: fontB, color: TEAL_COLOR });
      page.drawText(trunc(targetSystem, 80), { x: MRG + 85, y: y - 11, size: 8, font, color: rgb(0.1, 0.2, 0.25) });
      y -= 26;

      if (description) {
        for (const line of wrapText(description, 92).slice(0, 4)) {
          page.drawText(line, { x: MRG, y, size: 8.2, font, color: rgb(0.2, 0.25, 0.3) });
          y -= 12;
        }
        y -= 4;
      }

      if (mechanisms.length > 0) {
        for (const m of mechanisms.slice(0, 3)) {
          for (const ml of wrapText(`-  ${m}`, 90)) {
            page.drawText(ml, { x: MRG, y, size: 8.2, font, color: rgb(0.25, 0.3, 0.35) });
            y -= 12;
          }
        }
        y -= 6;
      }

      // ── Clinical Preparation & Delivery Protocol (Format-Tailored) ──
      if (selectedFormat === 'single_cartridge_pen') {
        page.drawText('2. SINGLE CARTRIDGE PROTOCOL & MULTIDOSE PEN ADMINISTRATION', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
        y -= 4;
        page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
        y -= 14;

        const pLines = [
          'Zero Reconstitution Required: Pre-formulated aqueous sterile solution in 3.0 mL cylindrical cartridge. No manual mixing or diluent required.',
          'Visual Inspection & Needle Setup: Confirm solution is clear and particulate-free. Screw on new sterile 31G/32G (4mm-6mm) pen needle.',
          'Priming & Air Purge: Dial 1-2 test units, point needle upward, depress button until steady droplet emerges at tip.',
          'Subcutaneous Dosing: Dial prescribed units on micro-stepper dial. Inject at 90 deg into abdomen/thigh; hold button for 6-10s before withdrawing.',
          'Sharps Disposal: Unscrew and safely discard needle into certified sharps container immediately. Never store pen with needle attached.'
        ];
        for (const line of pLines) {
          for (const wl of wrapText(`-  ${line}`, 92)) {
            page.drawText(wl, { x: MRG, y, size: 8, font, color: rgb(0.15, 0.2, 0.25) });
            y -= 11;
          }
        }
        y -= 3;

        page.drawText('Storage Requirements:', { x: MRG, y, size: 8, font: fontB, color: rgb(0.2, 0.25, 0.3) });
        page.drawText('Unused pen: 2C - 8C (do not freeze). In-use pen: Controlled room temp (<25C) or 2C - 8C for 30-56 days.', { x: MRG + 105, y, size: 8, font, color: TEAL_COLOR });
        y -= 16;
      } else if (selectedFormat === 'double_cartridge_pen') {
        page.drawText('2. DUAL-CHAMBER IN-DEVICE RECONSTITUTION & DELIVERY PROTOCOL', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
        y -= 4;
        page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
        y -= 14;

        const dLines = [
          'Dual-Chamber Anatomy: Chamber 1 (front) contains lyophilized peptide powder; Chamber 2 (rear) contains pre-measured bacteriostatic diluent.',
          'In-Device Mechanical Mixing: Zero external syringes or needles required. Screw cartridge holder clockwise into pen body until locked.',
          'Automated Bypass: Rear plunger drives diluent through internal bypass channel directly into powder chamber.',
          'Gentle Dissolution: Invert pen slowly 5-10 times. Wait 3-5 minutes for complete dissolution into clear solution. Avoid vigorous shaking.',
          'Priming & Delivery: Attach sterile 31G/32G needle, dial 1-2 clicks to purge air, select prescribed dose, and inject subcutaneously (hold 6-10s).'
        ];
        for (const line of dLines) {
          for (const wl of wrapText(`-  ${line}`, 92)) {
            page.drawText(wl, { x: MRG, y, size: 8, font, color: rgb(0.15, 0.2, 0.25) });
            y -= 11;
          }
        }
        y -= 3;

        page.drawText('Storage Requirements:', { x: MRG, y, size: 8, font: fontB, color: rgb(0.2, 0.25, 0.3) });
        page.drawText('Unmixed cartridge: 2C - 8C. Once mixed in-pen: Refrigerate at 2C - 8C (stable 28-30 days). Protect from freezing.', { x: MRG + 105, y, size: 8, font, color: TEAL_COLOR });
        y -= 16;
      } else {
        // Vial (Lyophilized)
        page.drawText('2. MANUAL RECONSTITUTION PROTOCOL & THERMAL STABILITY', { x: MRG, y, size: 8.5, font: fontB, color: BRAND_COLOR });
        y -= 4;
        page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: BRAND_COLOR });
        y -= 14;

        const vLines = [
          'Aseptic Septum Preparation: Clean vial rubber septum with 70% isopropyl alcohol wipe and allow to air dry completely.',
          'Diluent Introduction: Aseptically draw 1.0mL - 2.0mL of sterile 0.9% Bacteriostatic Water. Direct needle slowly down inside glass wall.',
          'Gentle Dissolution: Swirl vial gently in circular motion until crystal clear. Do not shake or vortex violently to prevent protein shearing.',
          'Subcutaneous Administration: Administer calculated dose using sterile 30G/31G subcutaneous insulin syringe. Discard needle immediately.'
        ];
        for (const line of vLines) {
          for (const wl of wrapText(`-  ${line}`, 92)) {
            page.drawText(wl, { x: MRG, y, size: 8, font, color: rgb(0.15, 0.2, 0.25) });
            y -= 11;
          }
        }
        y -= 3;

        page.drawText('Storage Requirements:', { x: MRG, y, size: 8, font: fontB, color: rgb(0.2, 0.25, 0.3) });
        page.drawText('Lyophilized powder: Store at -20C (or 2C - 8C). Reconstituted solution: 2C - 8C (stable 28 days). Do not freeze.', { x: MRG + 105, y, size: 8, font, color: TEAL_COLOR });
        y -= 16;
      }
    }

    // ── Universal Contraindications & Warnings ──
    page.drawText('CLINICAL PRECAUTIONS & REGULATORY WARNINGS', { x: MRG, y, size: 8.5, font: fontB, color: WARN_RED });
    y -= 4;
    page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.8, color: WARN_RED });
    y -= 14;

    const warnText = isDevice 
      ? 'Device intended exclusively for single-patient administration. Do not reuse single-use needles. Ensure aseptic technique during cartridge replacement.'
      : 'Contraindicated in individuals with known hypersensitivity to active compound. Patients with active malignancy must obtain clinical oncology clearance prior to therapy. Not evaluated during pregnancy or lactation.';

    const warnLines = wrapText(warnText, 92);
    const warnBoxH = warnLines.length * 11 + 14;
    page.drawRectangle({ x: MRG, y: y - warnBoxH + 4, width: CONTENT_W, height: warnBoxH, color: WARN_BG, borderColor: rgb(0.98, 0.8, 0.8), borderWidth: 0.8 });
    
    let wy = y - 6;
    for (const wl of warnLines) {
      page.drawText(wl, { x: MRG + 8, y: wy, size: 7.8, font, color: rgb(0.55, 0.08, 0.08) });
      wy -= 11;
    }
    y = wy - 10;

    // ── Digital Verification & Professional Disclaimer ──
    const publicUrl = `${BASE_URL}/p/${product.slug || id}`;
    page.drawRectangle({ x: MRG, y: y - 32, width: CONTENT_W, height: 32, color: rgb(0.97, 0.98, 0.99), borderColor: BORDER_CLR, borderWidth: 0.5 });
    page.drawText('REGULATORY & PROFESSIONAL DISCLAIMER:', { x: MRG + 8, y: y - 10, size: 6.8, font: fontB, color: MUTED });
    page.drawText('Authorized clinical specification intended exclusively for licensed healthcare practitioners.', {
      x: MRG + 8, y: y - 20, size: 6.5, font, color: MUTED
    });
    
    page.drawText('Digital Verification Record: ', { x: MRG + 8, y: y - 28, size: 6.5, font: fontB, color: MUTED });
    page.drawText(publicUrl, { x: MRG + 105, y: y - 28, size: 6.5, font: fontB, color: TEAL_COLOR });

    // ── Final PDF Output ──
    const pdfBytes = await pdfDoc.save();
    const filename = `${(name || id).replace(/\s+/g, '_').toLowerCase()}_datasheet.pdf`;

    // Cache in RAM for instant subsequent downloads
    PDF_RAM_CACHE.set(cacheKey, {
      bytes: pdfBytes,
      filename,
      expiresAt: Date.now() + PDF_CACHE_TTL_MS,
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'X-Atlas-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error('[product-sheet] Error generating PDF:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
