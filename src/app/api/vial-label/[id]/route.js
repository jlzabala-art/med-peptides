import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { adminDb } from '../../../../lib/firebaseAdmin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://regenpept.com';
const BRAND_NAME = 'RegenPept';
const BRAND_COLOR = rgb(0, 0.21, 0.4);       // #003666
const TEAL_COLOR  = rgb(0.05, 0.58, 0.53);   // #0d9488
const DARK_GRAY   = rgb(0.12, 0.15, 0.18);
const MUTED       = rgb(0.45, 0.50, 0.55);
const RED_ALERT   = rgb(0.85, 0.15, 0.15);

// Helper: mm to points (1 pt = 1/72 inch, 1 inch = 25.4 mm => 1 mm = 72 / 25.4 ≈ 2.83465 pt)
const mmToPt = (mm) => mm * (72 / 25.4);

function trunc(s, n) {
  const str = String(s || '');
  return str.length > n ? str.substring(0, n - 1) + '…' : str;
}

async function getProductData(id) {
  if (!adminDb || !id) return null;
  const cleanId = decodeURIComponent(id).trim();

  let doc = null;
  const byId = await adminDb.collection('products').doc(cleanId).get().catch(() => null);
  if (byId?.exists) doc = byId;

  if (!doc) {
    const bySlug = await adminDb.collection('products').where('slug', '==', cleanId.toLowerCase()).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  if (!doc) return null;

  const data = { id: doc.id, ...doc.data() };
  const varSnap = await doc.ref.collection('variants').get().catch(() => null);
  const variants = (varSnap?.docs || []).map(v => ({ id: v.id, ...v.data() }));

  return { ...data, variants };
}

/**
 * Draws a single 38x90mm label design at an arbitrary (x, y) origin
 */
async function renderSingleLabel(pdfDoc, page, originX, originY, widthPt, heightPt, product, font, fontB) {
  const name = product.name || product.displayName || 'Peptide Product';
  const category = product.category || product.therapeutic_category || 'Research';
  const casNumber = product.casNumber || product.cas || '';
  
  // Pick primary variant info if available
  const variant = product.variants?.[0] || {};
  const dosage = variant.dosage || variant.dose || product.dosage || '10 mg';
  const purity = variant.purity || variant.grade || '≥ 98.5% (HPLC)';
  const formatType = variant.presentationName || variant.presentation || 'Lyophilized Powder';
  const storage = variant.storageInstructions || 'Store at 2°C - 8°C';

  // Generate QR Code PNG Buffer pointing to public page
  const publicUrl = `${BASE_URL}/p/${product.slug || product.id}`;
  const qrPngBuffer = await QRCode.toBuffer(publicUrl, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);

  // Outer border & background
  page.drawRectangle({
    x: originX,
    y: originY,
    width: widthPt,
    height: heightPt,
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 0.5,
    color: rgb(1, 1, 1),
  });

  // Top header color band
  page.drawRectangle({
    x: originX,
    y: originY + heightPt - 16,
    width: widthPt,
    height: 16,
    color: BRAND_COLOR,
  });

  page.drawText(BRAND_NAME, {
    x: originX + 8,
    y: originY + heightPt - 12,
    size: 7.5,
    font: fontB,
    color: rgb(1, 1, 1),
  });

  page.drawText('CLINICAL & RESEARCH GRADE', {
    x: originX + widthPt - 120,
    y: originY + heightPt - 12,
    size: 5.5,
    font: fontB,
    color: rgb(0.8, 0.9, 1),
  });

  // Main Content Left Column
  const contentLeft = originX + 8;
  let currentY = originY + heightPt - 32;

  // Product Name
  page.drawText(trunc(name, 26), {
    x: contentLeft,
    y: currentY,
    size: 13,
    font: fontB,
    color: DARK_GRAY,
  });

  currentY -= 12;

  // Dosage & Purity Highlight
  const dosePurityText = `${dosage}  ·  Purity: ${purity}`;
  page.drawText(trunc(dosePurityText, 34), {
    x: contentLeft,
    y: currentY,
    size: 7.5,
    font: fontB,
    color: TEAL_COLOR,
  });

  currentY -= 11;

  // CAS / Format
  const metaText = `${formatType}${casNumber ? `  ·  CAS: ${casNumber}` : ''}`;
  page.drawText(trunc(metaText, 38), {
    x: contentLeft,
    y: currentY,
    size: 6.5,
    font,
    color: MUTED,
  });

  currentY -= 13;

  // Reconstitution Fill-in Fields (Handwriteable)
  page.drawLine({
    start: { x: contentLeft, y: currentY },
    end: { x: originX + widthPt - 80, y: currentY },
    thickness: 0.4,
    color: rgb(0.88, 0.9, 0.93),
  });

  currentY -= 10;
  page.drawText('Reconst. Date: _______________   Exp: ___________', {
    x: contentLeft,
    y: currentY,
    size: 6,
    font,
    color: DARK_GRAY,
  });

  currentY -= 9;
  page.drawText('Diluent Volume: _____________ mL BAC / Sterile Water', {
    x: contentLeft,
    y: currentY,
    size: 5.8,
    font,
    color: DARK_GRAY,
  });

  // Warning & Storage footer inside label
  currentY -= 10;
  page.drawText(`Storage: ${trunc(storage, 35)}`, {
    x: contentLeft,
    y: currentY,
    size: 5.5,
    font,
    color: MUTED,
  });

  // QR Code on the Right
  const qrSize = heightPt - 30; // 70-80 pt
  const qrX = originX + widthPt - qrSize - 8;
  const qrY = originY + 8;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText('SCAN FOR GUIDE', {
    x: qrX + 4,
    y: qrY - 5,
    size: 4.8,
    font: fontB,
    color: BRAND_COLOR,
  });
}

export async function GET(request, { params }) {
  const id = params?.id;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || '38x90'; // '38x90', '50x50', 'sheet_a4'

  if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

  const product = await getProductData(id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (format === 'sheet_a4') {
    // A4 sheet (595.28 x 841.89 pt) with a 2x4 grid (8 labels)
    const page = pdfDoc.addPage([595.28, 841.89]);
    const labelW = mmToPt(90);
    const labelH = mmToPt(38);
    const marginX = mmToPt(12);
    const marginY = mmToPt(18);
    const gapX = mmToPt(5);
    const gapY = mmToPt(8);

    // Title banner on A4
    page.drawText(`RegenPept Vial Label Batch Sheet — ${product.name}`, {
      x: marginX,
      y: 841.89 - marginY + 6,
      size: 9,
      font: fontB,
      color: BRAND_COLOR,
    });

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const x = marginX + col * (labelW + gapX);
        const y = 841.89 - marginY - (row + 1) * labelH - row * gapY;
        await renderSingleLabel(pdfDoc, page, x, y, labelW, labelH, product, font, fontB);
      }
    }
  } else if (format === '50x50') {
    // Square 50x50mm
    const sizePt = mmToPt(50);
    const page = pdfDoc.addPage([sizePt, sizePt]);
    await renderSingleLabel(pdfDoc, page, 0, 0, sizePt, sizePt, product, font, fontB);
  } else {
    // Default 38x90mm thermal label
    const labelW = mmToPt(90); // ~255 pt
    const labelH = mmToPt(38); // ~108 pt
    const page = pdfDoc.addPage([labelW, labelH]);
    await renderSingleLabel(pdfDoc, page, 0, 0, labelW, labelH, product, font, fontB);
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `vial_label_${(product.name || id).replace(/\s+/g, '_').toLowerCase()}_${format}.pdf`;

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
