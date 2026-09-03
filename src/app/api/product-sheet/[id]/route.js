import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { adminDb } from '../../../../lib/firebaseAdmin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://regenpept.com';
const BRAND_NAME = 'RegenPept';
const BRAND_COLOR = rgb(0, 0.21, 0.4);       // #003666
const TEAL_COLOR  = rgb(0.05, 0.58, 0.53);   // #0d9488
const MUTED       = rgb(0.39, 0.45, 0.55);
const ACCENT_BG   = rgb(0.94, 0.98, 0.97);

// ─── Public fields only — never expose pricing or supplier ────────────────────
const PUBLIC_FIELDS = [
  'id', 'name', 'displayName', 'slug',
  'category', 'therapeutic_category', 'type',
  'description', 'desc', 'objective',
  'casNumber', 'cas', 'scientificName',
  'goals', 'mechanisms', 'tags', 'primary_goal', 'target',
  'pharmacology', 'aiContent', 'isProfessional', 'requiresPrescription',
  'status', 'isActive',
];

const VARIANT_PUBLIC_FIELDS = [
  'id', 'dose', 'dosage', 'presentation', 'presentationName',
  'purity', 'strength', 'grade', 'administrationRoute',
  'reconstitutionGuide', 'storageInstructions', 'shelfLife',
  'contraindications', 'warnings',
];

const GOAL_LABELS = {
  fat_loss: 'Fat Loss & Metabolic Health', tissue_repair: 'Tissue Repair & Recovery',
  muscle_growth: 'Muscle & Body Composition', anti_aging: 'Longevity & Cellular Repair',
  cognitive: 'Cognitive & Neuroprotection', immune: 'Immune Modulation',
  hormonal: 'Hormonal Balance', gut_health: 'Gut Health', sleep: 'Sleep & Recovery',
};

function humanizeGoal(g) {
  return GOAL_LABELS[g] || (g || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function pickFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return {};
  return fields.reduce((acc, f) => { if (obj[f] !== undefined) acc[f] = obj[f]; return acc; }, {});
}

function trunc(s, n) {
  const str = String(s || '');
  return str.length > n ? str.substring(0, n - 1) + '…' : str;
}

// Wrap text to lines of maxWidth chars
function wrapText(text, maxChars) {
  if (!text) return [];
  const words = text.split(' ');
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

  // Try by doc ID
  const byId = await adminDb.collection('products').doc(id).get().catch(() => null);
  let doc = byId?.exists ? byId : null;

  // Try slug
  if (!doc) {
    const bySlug = await adminDb.collection('products').where('slug', '==', id.toLowerCase()).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  if (!doc) return null;

  const raw = { id: doc.id, ...doc.data() };
  if (raw.status === 'hidden' || raw.status === 'archived') return null;

  const varSnap = await doc.ref.collection('variants').get().catch(() => null);
  const variants = (varSnap?.docs || []).map(v => pickFields({ id: v.id, ...v.data() }, VARIANT_PUBLIC_FIELDS));

  return { ...pickFields(raw, PUBLIC_FIELDS), variants };
}

export async function GET(request, { params }) {
  const id = params?.id;
  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });

  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: 'Product not found or not public' }, { status: 404 });

  const name = product.name || product.displayName || id;
  const casNumber = product.casNumber || product.cas || '';
  const category = product.category || product.therapeutic_category || 'Peptide';
  const description = product.desc || product.description || product.objective || '';
  const mechanisms = Array.isArray(product.mechanisms) ? product.mechanisms : [];
  const goals = Array.isArray(product.goals) ? product.goals : (product.primary_goal ? [product.primary_goal] : []);
  const pharmacology = product.pharmacology || product.aiContent?.pharmacology || {};
  const variants = product.variants || [];
  const reconstitution = variants.find(v => v.reconstitutionGuide)?.reconstitutionGuide || pharmacology.reconstitution || '';
  const storage = variants.find(v => v.storageInstructions)?.storageInstructions || pharmacology.storage || '';
  const shelfLife = variants.find(v => v.shelfLife)?.shelfLife || '';
  const contraindications = variants.find(v => v.contraindications)?.contraindications || pharmacology.contraindications || '';
  const warnings = variants.find(v => v.warnings)?.warnings || pharmacology.warnings || '';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const W = 595, H = 842; // A4
  const MRG = 40;
  const RIGHT = W - MRG;
  const CONTENT_W = RIGHT - MRG;

  function addPage() {
    const p = pdfDoc.addPage([W, H]);
    // Header strip
    p.drawRectangle({ x: 0, y: H - 58, width: W, height: 58, color: BRAND_COLOR });
    p.drawText(BRAND_NAME, { x: MRG, y: H - 36, size: 16, font: fontB, color: rgb(1, 1, 1) });
    p.drawText('Product Information Sheet — For Authorized Medical Use Only', {
      x: MRG, y: H - 50, size: 7.5, font, color: rgb(0.7, 0.8, 0.9),
    });
    // Right: date
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const dw = font.widthOfTextAtSize(dateStr, 8);
    p.drawText(dateStr, { x: RIGHT - dw, y: H - 42, size: 8, font, color: rgb(0.7, 0.8, 0.9) });

    // Footer
    p.drawLine({ start: { x: MRG, y: 36 }, end: { x: RIGHT, y: 36 }, thickness: 0.4, color: rgb(0.85, 0.88, 0.92) });
    p.drawText(`${BRAND_NAME}  ·  Clinical Product Datasheet  ·  Confidential — For Authorized Medical Use Only`, {
      x: MRG, y: 24, size: 6.5, font, color: MUTED,
    });
    const pgNum = String(pdfDoc.getPageCount());
    const pgW = font.widthOfTextAtSize(pgNum, 8);
    p.drawText(pgNum, { x: RIGHT - pgW, y: 24, size: 8, font: fontB, color: BRAND_COLOR });
    return p;
  }

  // ── Page 1 ──────────────────────────────────────────────────────────────────
  let page = addPage();
  let y = H - 78;

  // Product name block
  page.drawRectangle({ x: MRG, y: y - 54, width: CONTENT_W, height: 60, color: ACCENT_BG, borderRadius: 6 });

  // Category pill
  const catLabel = `  ${category}  `;
  page.drawRectangle({ x: MRG + 10, y: y - 12, width: fontB.widthOfTextAtSize(catLabel, 7.5) + 4, height: 13, color: TEAL_COLOR });
  page.drawText(catLabel, { x: MRG + 12, y: y - 9, size: 7.5, font: fontB, color: rgb(1, 1, 1) });

  page.drawText(trunc(name, 58), { x: MRG + 10, y: y - 30, size: 18, font: fontB, color: BRAND_COLOR });

  if (casNumber) {
    page.drawText(`CAS: ${casNumber}`, { x: MRG + 10, y: y - 46, size: 8, font, color: MUTED });
  }
  if (product.scientificName && product.scientificName !== name) {
    const sciX = casNumber ? MRG + 10 + font.widthOfTextAtSize(`CAS: ${casNumber}   `, 8) : MRG + 10;
    page.drawText(product.scientificName, { x: sciX, y: y - 46, size: 8, font, color: MUTED });
  }

  y -= 72;

  // Therapeutic goals
  if (goals.length > 0) {
    const goalStr = goals.map(humanizeGoal).join('  ·  ');
    page.drawText('Therapeutic Goals:', { x: MRG, y, size: 8, font: fontB, color: MUTED });
    y -= 13;
    page.drawText(trunc(goalStr, 90), { x: MRG, y, size: 8.5, font, color: rgb(0.09, 0.58, 0.53) });
    y -= 20;
  }

  // Divider
  page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.5, color: rgb(0.9, 0.93, 0.96) });
  y -= 14;

  // Description
  if (description) {
    page.drawText('OVERVIEW', { x: MRG, y, size: 7.5, font: fontB, color: MUTED });
    y -= 14;
    const descLines = wrapText(description, 90);
    for (const line of descLines.slice(0, 12)) {
      if (y < 120) break;
      page.drawText(line, { x: MRG, y, size: 9, font, color: rgb(0.2, 0.25, 0.3) });
      y -= 13;
    }
    y -= 8;
  }

  // Mechanism of Action
  if (mechanisms.length > 0 || pharmacology.mechanism) {
    page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.5, color: rgb(0.9, 0.93, 0.96) });
    y -= 14;
    page.drawText('MECHANISM OF ACTION', { x: MRG, y, size: 7.5, font: fontB, color: MUTED });
    y -= 14;
    const mechItems = mechanisms.length > 0 ? mechanisms : [pharmacology.mechanism].filter(Boolean);
    for (const m of mechItems.slice(0, 6)) {
      if (y < 120) break;
      const lines = wrapText(`• ${m}`, 88);
      for (const line of lines) {
        if (y < 120) break;
        page.drawText(line, { x: MRG + (line.startsWith('•') ? 0 : 8), y, size: 9, font, color: rgb(0.2, 0.25, 0.3) });
        y -= 13;
      }
    }
    if (product.target) {
      y -= 4;
      page.drawText(`Primary Target: ${product.target}`, { x: MRG, y, size: 8.5, font: fontB, color: rgb(0.49, 0.22, 0.87) });
      y -= 16;
    }
    y -= 6;
  }

  // Dosage table
  if (variants.length > 0 && y > 160) {
    page.drawLine({ start: { x: MRG, y }, end: { x: RIGHT, y }, thickness: 0.5, color: rgb(0.9, 0.93, 0.96) });
    y -= 14;
    page.drawText('DOSAGE & PRESENTATIONS', { x: MRG, y, size: 7.5, font: fontB, color: MUTED });
    y -= 16;

    // Table header
    page.drawRectangle({ x: MRG, y: y - 2, width: CONTENT_W, height: 15, color: rgb(0.93, 0.95, 0.98) });
    page.drawText('Dosage', { x: MRG + 6, y: y + 1, size: 7.5, font: fontB, color: BRAND_COLOR });
    page.drawText('Purity / Grade', { x: MRG + 130, y: y + 1, size: 7.5, font: fontB, color: BRAND_COLOR });
    page.drawText('Format', { x: MRG + 270, y: y + 1, size: 7.5, font: fontB, color: BRAND_COLOR });
    page.drawText('Route', { x: MRG + 380, y: y + 1, size: 7.5, font: fontB, color: BRAND_COLOR });
    y -= 16;

    for (const v of variants.slice(0, 8)) {
      if (y < 110) break;
      const dose = v.dosage || v.dose || '—';
      const purity = v.purity || v.grade || v.strength || '—';
      const fmt = v.presentationName || v.presentation || '—';
      const route = v.administrationRoute || '—';
      page.drawText(trunc(dose, 18), { x: MRG + 6, y, size: 8.5, font, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(trunc(purity, 18), { x: MRG + 130, y, size: 8.5, font, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(trunc(fmt, 16), { x: MRG + 270, y, size: 8.5, font, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(trunc(route, 14), { x: MRG + 380, y, size: 8.5, font, color: rgb(0.1, 0.1, 0.1) });
      page.drawLine({ start: { x: MRG, y: y - 4 }, end: { x: RIGHT, y: y - 4 }, thickness: 0.3, color: rgb(0.93, 0.95, 0.97) });
      y -= 15;
    }
    y -= 10;
  }

  // ── Page 2 if needed (reconstitution, storage, contraindications) ─────────
  if (reconstitution || storage || contraindications || warnings) {
    page = addPage();
    y = H - 80;

    page.drawText(trunc(name, 58), { x: MRG, y, size: 11, font: fontB, color: BRAND_COLOR });
    y -= 20;

    // Reconstitution
    if (reconstitution) {
      page.drawRectangle({ x: MRG, y: y - 8, width: 4, height: Math.min(wrapText(reconstitution, 85).length * 13 + 26, 200), color: TEAL_COLOR });
      page.drawText('RECONSTITUTION GUIDE', { x: MRG + 12, y, size: 7.5, font: fontB, color: MUTED });
      y -= 16;
      const rLines = wrapText(reconstitution, 85);
      for (const line of rLines.slice(0, 12)) {
        if (y < 120) break;
        page.drawText(line, { x: MRG + 12, y, size: 9, font, color: rgb(0.1, 0.15, 0.2) });
        y -= 13;
      }
      if (shelfLife) {
        y -= 4;
        page.drawText(`Shelf life after reconstitution: ${shelfLife}`, { x: MRG + 12, y, size: 8.5, font: fontB, color: rgb(0.09, 0.58, 0.53) });
        y -= 13;
      }
      y -= 16;
    }

    // Storage
    if (storage && y > 120) {
      page.drawRectangle({ x: MRG, y: y - 8, width: CONTENT_W, height: Math.min(wrapText(storage, 85).length * 13 + 30, 100), color: rgb(1, 0.98, 0.92) });
      page.drawText('STORAGE CONDITIONS', { x: MRG + 10, y, size: 7.5, font: fontB, color: rgb(0.6, 0.38, 0) });
      y -= 16;
      for (const line of wrapText(storage, 84).slice(0, 8)) {
        if (y < 120) break;
        page.drawText(line, { x: MRG + 10, y, size: 9, font, color: rgb(0.3, 0.18, 0) });
        y -= 13;
      }
      y -= 20;
    }

    // Contraindications
    if ((contraindications || warnings) && y > 120) {
      page.drawRectangle({ x: MRG, y: y - 8, width: CONTENT_W, height: 16, color: rgb(1, 0.93, 0.93) });
      page.drawText('CONTRAINDICATIONS & WARNINGS', { x: MRG + 10, y, size: 7.5, font: fontB, color: rgb(0.86, 0.15, 0.15) });
      y -= 20;
      if (contraindications) {
        for (const line of wrapText(contraindications, 84).slice(0, 6)) {
          if (y < 120) break;
          page.drawText(line, { x: MRG, y, size: 9, font, color: rgb(0.35, 0.1, 0.1) });
          y -= 13;
        }
        y -= 6;
      }
      if (warnings) {
        for (const line of wrapText(`⚠ ${warnings}`, 84).slice(0, 4)) {
          if (y < 120) break;
          page.drawText(line, { x: MRG, y, size: 9, font, color: rgb(0.5, 0.25, 0) });
          y -= 13;
        }
      }
      y -= 16;
    }

    // Disclaimer box
    if (y > 90) {
      page.drawRectangle({ x: MRG, y: y - 42, width: CONTENT_W, height: 48, color: rgb(0.96, 0.97, 0.99), borderRadius: 6 });
      page.drawText('DISCLAIMER', { x: MRG + 10, y: y - 10, size: 7, font: fontB, color: MUTED });
      const disc = 'This document is for informational purposes only, intended for authorized healthcare professionals. It does not constitute medical advice. Dosing, administration, and clinical decisions must be made by a qualified physician. No pricing or sourcing information is contained herein.';
      let dy = y - 22;
      for (const line of wrapText(disc, 88).slice(0, 4)) {
        page.drawText(line, { x: MRG + 10, y: dy, size: 7.5, font, color: MUTED });
        dy -= 11;
      }
    }
  }

  // ── QR code embedded using a pure SVG path approach ──────────────────────
  // We encode the URL as text in the last page footer area
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  const publicUrl = `${BASE_URL}/p/${product.slug || id}`;
  lastPage.drawText(`Digital version: ${publicUrl}`, {
    x: MRG, y: 46, size: 7.5, font, color: TEAL_COLOR,
  });

  const pdfBytes = await pdfDoc.save();
  const filename = `${(name || id).replace(/\s+/g, '_').toLowerCase()}_datasheet.pdf`;

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
