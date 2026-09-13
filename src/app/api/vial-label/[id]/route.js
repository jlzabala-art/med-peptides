import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { adminDb } from '../../../../lib/firebaseAdmin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
const BRAND_COLOR = rgb(0, 0.21, 0.4);       // #003666
const TEAL_COLOR  = rgb(0.05, 0.58, 0.53);   // #0d9488
const DARK_GRAY   = rgb(0.12, 0.15, 0.18);
const MUTED       = rgb(0.45, 0.50, 0.55);
const RED_ALERT   = rgb(0.85, 0.15, 0.15);

// Helper: mm to points (1 pt = 1/72 inch, 1 inch = 25.4 mm => 1 mm = 72 / 25.4 ≈ 2.83465 pt)
const mmToPt = (mm) => mm * (72 / 25.4);

function toSafePdfText(s) {
  if (!s) return '';
  return String(s)
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/[·•]/g, '-')
    .replace(/[°]/g, 'C')
    .replace(/[…]/g, '...')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, '');
}

function trunc(s, n) {
  const clean = toSafePdfText(s);
  return clean.length > n ? clean.substring(0, Math.max(0, n - 3)) + '...' : clean;
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

function draw1DBarcode(page, originX, originY, maxW, height, text) {
  const clean = String(text || 'RP-LOT').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  let x = originX;
  const barColor = rgb(0.06, 0.12, 0.2);

  // Start guard
  page.drawRectangle({ x, y: originY, width: 1.5, height, color: barColor }); x += 3;
  page.drawRectangle({ x, y: originY, width: 1, height, color: barColor }); x += 2.5;

  for (let i = 0; i < clean.length; i++) {
    if (x >= originX + maxW - 12) break;
    const code = clean.charCodeAt(i);
    const w1 = ((code * 7) % 2.5) + 0.8;
    const s1 = ((code * 3) % 2) + 0.8;
    const w2 = ((code * 11) % 2.5) + 0.8;
    const s2 = ((code * 5) % 2) + 0.8;
    page.drawRectangle({ x, y: originY, width: w1, height, color: barColor });
    x += w1 + s1;
    if (x >= originX + maxW - 8) break;
    page.drawRectangle({ x, y: originY, width: w2, height, color: barColor });
    x += w2 + s2;
  }

  // End guard
  page.drawRectangle({ x, y: originY, width: 1.5, height, color: barColor }); x += 2.5;
  page.drawRectangle({ x, y: originY, width: 1, height, color: barColor });
}

/**
 * Draws the FULL information label (Brand, Name, Dose, Purity, Format, Reconstitution lines, Storage, QR)
 */
async function renderFullInfoLabel(pdfDoc, page, originX, originY, widthPt, heightPt, product, font, fontB) {
  const name = toSafePdfText(product.name || product.displayName || 'Peptide Product');
  const category = toSafePdfText(product.category || product.therapeutic_category || 'Research');
  const casNumber = toSafePdfText(product.casNumber || product.cas || '');
  
  // Pick primary variant info if available
  const variant = product.variants?.[0] || {};
  const dosage = toSafePdfText(variant.dosage || variant.dose || product.dosage || '10 mg');
  const purity = toSafePdfText(variant.purity || variant.grade || '>= 98.5% (HPLC)');
  const formatType = toSafePdfText(variant.presentationName || variant.presentation || 'Lyophilized Powder');
  const storage = toSafePdfText(variant.storageInstructions || 'Store at 2C - 8C');

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

  const leftLabelTitle = 'CLINICAL VIAL APPLICATION';
  const rightLabelTag = 'RESEARCH STANDARD';
  const rightLabelTagW = fontB.widthOfTextAtSize(rightLabelTag, 5.2);

  page.drawText(leftLabelTitle, {
    x: originX + 8,
    y: originY + heightPt - 11.5,
    size: 6.8,
    font: fontB,
    color: rgb(1, 1, 1),
  });

  page.drawText(rightLabelTag, {
    x: originX + widthPt - rightLabelTagW - 8,
    y: originY + heightPt - 11.5,
    size: 5.2,
    font: fontB,
    color: rgb(0.85, 0.92, 1),
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
  const dosePurityText = `${dosage}  -  Purity: ${purity}`;
  page.drawText(trunc(dosePurityText, 34), {
    x: contentLeft,
    y: currentY,
    size: 7.5,
    font: fontB,
    color: TEAL_COLOR,
  });

  currentY -= 11;

  // CAS / Format
  const metaText = `${formatType}${casNumber ? `  -  CAS: ${casNumber}` : ''}`;
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

/**
 * Draws the BARCODE-ONLY label that directs instantly to the Monograph
 * Features a large prominent QR Code for camera scanning + 1D barcode for laser scanning
 */
async function renderBarcodeOnlyLabel(pdfDoc, page, originX, originY, widthPt, heightPt, product, font, fontB) {
  const name = toSafePdfText(product.name || product.displayName || 'Peptide Product');
  const variant = product.variants?.[0] || {};
  const dosage = toSafePdfText(variant.dosage || variant.dose || product.dosage || '');
  const cleanSlug = toSafePdfText(product.slug || product.id || 'peptide').toLowerCase();
  
  // Public Monograph URL
  const publicUrl = `${BASE_URL}/p/${cleanSlug}`;

  // Outer border & background
  page.drawRectangle({
    x: originX,
    y: originY,
    width: widthPt,
    height: heightPt,
    borderColor: rgb(0.82, 0.86, 0.9),
    borderWidth: 0.6,
    color: rgb(1, 1, 1),
  });

  const trackingCode = toSafePdfText(product.sku || product.lotNumber || `RP-LOT-${cleanSlug.toUpperCase()}-2026`);

  if (widthPt >= 200) {
    // Landscape 38x90 layout
    // Top banner
    page.drawRectangle({
      x: originX,
      y: originY + heightPt - 15,
      width: widthPt,
      height: 15,
      color: BRAND_COLOR,
    });

    const leftShipTitle = 'DISPATCH & TRACEABILITY';
    const rightShipTag = 'PARCEL STANDARD';
    const rightShipTagW = fontB.widthOfTextAtSize(rightShipTag, 5.2);

    page.drawText(leftShipTitle, {
      x: originX + 8,
      y: originY + heightPt - 11,
      size: 6.8,
      font: fontB,
      color: rgb(1, 1, 1),
    });

    page.drawText(rightShipTag, {
      x: originX + widthPt - rightShipTagW - 8,
      y: originY + heightPt - 11,
      size: 5.2,
      font: fontB,
      color: rgb(0.85, 0.92, 1),
    });

    // Generate high-resolution QR code pointing directly to verification URL
    const qrPngBuffer = await QRCode.toBuffer(publicUrl, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: 'M',
      color: { dark: '#002244', light: '#ffffff' }
    });
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    // Large QR Code on the Left: scans instantly from camera
    const qrSize = heightPt - 28; // ~80 pt
    const qrX = originX + 8;
    const qrY = originY + 8;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Right side: STRICTLY Code, 1D Barcode and Logistics Specs (No drug description)
    const rightX = qrX + qrSize + 12;
    const rightWidth = originX + widthPt - rightX - 8;

    let curY = originY + heightPt - 30;

    // 1. Primary Tracking / SKU Code
    page.drawText(trackingCode, {
      x: rightX,
      y: curY,
      size: 10,
      font: fontB,
      color: DARK_GRAY,
    });

    curY -= 11;
    page.drawText('DISCREET LOGISTICS PARCEL - COLD CHAIN VERIFIED', {
      x: rightX,
      y: curY,
      size: 6.0,
      font: fontB,
      color: MUTED,
    });

    curY -= 12;
    // 2. 1D Barcode
    const barcodeHeight = 16;
    draw1DBarcode(page, rightX, curY - barcodeHeight, rightWidth, barcodeHeight, trackingCode);

    curY -= (barcodeHeight + 7);
    page.drawText(`* ${trackingCode} *`, {
      x: rightX + 8,
      y: curY,
      size: 5.8,
      font,
      color: DARK_GRAY,
    });

    curY -= 9;
    page.drawText('OUTBOUND FREIGHT SPECIFICATION - DIRECT TRANSIT', {
      x: rightX,
      y: curY,
      size: 5.2,
      font,
      color: MUTED,
    });
  } else {
    // Square 50x50 layout
    page.drawRectangle({
      x: originX,
      y: originY + heightPt - 14,
      width: widthPt,
      height: 14,
      color: BRAND_COLOR,
    });

    page.drawText('PARCEL TRACEABILITY', {
      x: originX + 6,
      y: originY + heightPt - 10,
      size: 6.5,
      font: fontB,
      color: rgb(1, 1, 1),
    });

    page.drawText(trunc(trackingCode, 20), {
      x: originX + 6,
      y: originY + heightPt - 24,
      size: 7.5,
      font: fontB,
      color: DARK_GRAY,
    });

    const qrSize = heightPt - 46;
    const qrPngBuffer = await QRCode.toBuffer(publicUrl, {
      margin: 1,
      width: 256,
      errorCorrectionLevel: 'M',
      color: { dark: '#002244', light: '#ffffff' }
    });
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    page.drawImage(qrImage, {
      x: originX + (widthPt - qrSize) / 2,
      y: originY + 16,
      width: qrSize,
      height: qrSize,
    });

    page.drawText('SCAN FOR VERIFICATION', {
      x: originX + (widthPt - 86) / 2,
      y: originY + 6,
      size: 5.5,
      font: fontB,
      color: BRAND_COLOR,
    });
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || '38x90'; // '38x90', '50x50', 'sheet_a4'
    const type = (searchParams.get('type') || searchParams.get('style') || 'full').toLowerCase();
    const isBarcodeOnly = type === 'barcode' || type === 'minimal' || type === 'barcode_only' || type === 'shipping';

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const product = await getProductData(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const renderLabel = isBarcodeOnly ? renderBarcodeOnlyLabel : renderFullInfoLabel;

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
      const sheetTitle = isBarcodeOnly
        ? `Atlas Services Barcode & Monograph Label Sheet - ${product.name || id}`
        : `Atlas Services Complete Clinical Vial Label Sheet - ${product.name || id}`;

      page.drawText(toSafePdfText(sheetTitle), {
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
          await renderLabel(pdfDoc, page, x, y, labelW, labelH, product, font, fontB);
        }
      }
    } else if (format === '50x50') {
      // Square 50x50mm
      const sizePt = mmToPt(50);
      const page = pdfDoc.addPage([sizePt, sizePt]);
      await renderLabel(pdfDoc, page, 0, 0, sizePt, sizePt, product, font, fontB);
    } else {
      // Default 38x90mm thermal label
      const labelW = mmToPt(90); // ~255 pt
      const labelH = mmToPt(38); // ~108 pt
      const page = pdfDoc.addPage([labelW, labelH]);
      await renderLabel(pdfDoc, page, 0, 0, labelW, labelH, product, font, fontB);
    }

    const pdfBytes = await pdfDoc.save();
    const safeName = toSafePdfText(product.name || id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `vial_label_${safeName}_${isBarcodeOnly ? 'barcode' : 'full'}_${format}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[API vial-label] Error generating PDF label:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF label', details: err.message },
      { status: 500 }
    );
  }
}
