import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { adminDb } from '../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

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

const DISCREET_PREFIXES = {
  retatrutide: 'RT',
  tirzepatide: 'TZ',
  semaglutide: 'SM',
  cagrilintide: 'CG',
  mazdutide: 'MZ',
  survodutide: 'SV',
  bpc157: 'BP',
  'bpc-157': 'BP',
  tb500: 'TB',
  'tb-500': 'TB',
  epithalon: 'EP',
  ghkcu: 'GH',
  'ghk-cu': 'GH',
  ipamorelin: 'IP',
  cjc1295: 'CJ',
  'cjc-1295': 'CJ',
  nad: 'ND',
  nadplus: 'ND',
  motsc: 'MC',
  'mots-c': 'MC',
  ss31: 'SS',
  'ss-31': 'SS',
  selank: 'SL',
  semax: 'SX',
  aod9604: 'AD',
  'aod-9604': 'AD',
  tesofensine: 'TS',
  sermorelin: 'SR',
  melanotan: 'MT',
  'melanotan-2': 'MT',
  pt141: 'PT',
  'pt-141': 'PT',
};

function getDiscreetProductCode(product, customCode, uniqueSeq) {
  if (customCode) return String(customCode).toUpperCase();
  const cleanSlug = toSafePdfText(product.slug || product.id || 'parcel').toLowerCase();
  
  let prefix = DISCREET_PREFIXES[cleanSlug];
  if (!prefix) {
    const consonants = cleanSlug.replace(/[^bcdfghjklmnpqrstvwxyz]/g, '').toUpperCase();
    if (consonants.length >= 2) {
      prefix = consonants.slice(0, 2);
    } else {
      prefix = cleanSlug.slice(0, 2).toUpperCase();
    }
  }

  const num = uniqueSeq ? uniqueSeq.slice(0, 3) : '982';
  return `${prefix}-${num}`;
}

/**
 * Draws the FULL information label (Brand, Name, Dose, Purity, Format, Reconstitution lines, Storage, QR, Batch & Discreet Code)
 */
async function renderFullInfoLabel(pdfDoc, page, originX, originY, widthPt, heightPt, product, font, fontB, targetShareUrl, batchNumber, discreetCode) {
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
  const cleanSlug = toSafePdfText(product.slug || product.id || 'product').toLowerCase();
  const publicUrl = targetShareUrl || `${BASE_URL}/p/${cleanSlug}`;
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
    y: originY + heightPt - 14,
    width: widthPt,
    height: 14,
    color: BRAND_COLOR,
  });

  const leftLabelTitle = 'CLINICAL VIAL APPLICATION';
  const rightLabelTag = 'RESEARCH STANDARD';
  const rightLabelTagW = fontB.widthOfTextAtSize(rightLabelTag, 5.2);

  page.drawText(leftLabelTitle, {
    x: originX + 8,
    y: originY + heightPt - 10,
    size: 6.5,
    font: fontB,
    color: rgb(1, 1, 1),
  });

  page.drawText(rightLabelTag, {
    x: originX + widthPt - rightLabelTagW - 8,
    y: originY + heightPt - 10,
    size: 5.2,
    font: fontB,
    color: rgb(0.85, 0.92, 1),
  });

  // Main Content Left Column
  const contentLeft = originX + 8;
  let currentY = originY + heightPt - 27;

  // Product Name
  page.drawText(trunc(name, 26), {
    x: contentLeft,
    y: currentY,
    size: 12.5,
    font: fontB,
    color: DARK_GRAY,
  });

  currentY -= 11;

  // Dosage & Purity Highlight
  const dosePurityText = `${dosage}  -  Purity: ${purity}`;
  page.drawText(trunc(dosePurityText, 34), {
    x: contentLeft,
    y: currentY,
    size: 7.2,
    font: fontB,
    color: TEAL_COLOR,
  });

  currentY -= 10;

  // CAS / Format
  const metaText = `${formatType}${casNumber ? `  -  CAS: ${casNumber}` : ''}`;
  page.drawText(trunc(metaText, 38), {
    x: contentLeft,
    y: currentY,
    size: 6.2,
    font,
    color: MUTED,
  });

  currentY -= 8;

  // Reconstitution Fill-in Fields (Handwriteable)
  page.drawLine({
    start: { x: contentLeft, y: currentY },
    end: { x: originX + widthPt - 86, y: currentY },
    thickness: 0.4,
    color: rgb(0.88, 0.9, 0.93),
  });

  currentY -= 9;
  page.drawText('Reconst. Date: _______________   Exp: ___________', {
    x: contentLeft,
    y: currentY,
    size: 5.8,
    font,
    color: DARK_GRAY,
  });

  currentY -= 8.5;
  page.drawText('Diluent Volume: _____________ mL BAC / Sterile Water', {
    x: contentLeft,
    y: currentY,
    size: 5.5,
    font,
    color: DARK_GRAY,
  });

  // Warning & Storage footer inside label
  currentY -= 8.5;
  page.drawText(`Storage: ${trunc(storage, 35)}`, {
    x: contentLeft,
    y: currentY,
    size: 5.2,
    font,
    color: MUTED,
  });

  // Discreet batch number and product coding reference
  currentY -= 8.5;
  page.drawText(`Batch: ${batchNumber}   •   Cod: ${discreetCode}`, {
    x: contentLeft,
    y: currentY,
    size: 5.6,
    font: fontB,
    color: DARK_GRAY,
  });

  // QR Code on the Right
  const qrSize = 68; // ~68 pt square
  const qrX = originX + widthPt - qrSize - 10;
  const qrY = originY + 16;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText('SCAN FOR GUIDE', {
    x: qrX + (qrSize - fontB.widthOfTextAtSize('SCAN FOR GUIDE', 4.8)) / 2,
    y: qrY - 6,
    size: 4.8,
    font: fontB,
    color: BRAND_COLOR,
  });

  page.drawText(`COD: ${discreetCode}`, {
    x: qrX + (qrSize - fontB.widthOfTextAtSize(`COD: ${discreetCode}`, 5)) / 2,
    y: qrY - 12,
    size: 5,
    font: fontB,
    color: DARK_GRAY,
  });
}

/**
 * Draws the ANONYMOUS SHIPPING & TRACEABILITY label
 * Contains STRICTLY the square QR code + 1D scan barcode with an anonymous batch number and discreet product code.
 * Absolutely zero product/drug name to ensure 100% discrete logistics.
 */
async function renderBarcodeOnlyLabel(pdfDoc, page, originX, originY, widthPt, heightPt, product, font, fontB, customBatch, targetShareUrl, customDiscreetCode) {
  const cleanSlug = toSafePdfText(product.slug || product.id || 'parcel').toLowerCase();
  
  let hash = 0;
  for (let i = 0; i < cleanSlug.length; i++) {
    hash = ((hash << 5) - hash) + cleanSlug.charCodeAt(i);
    hash |= 0;
  }
  const uniqueSeq = String(Math.abs(hash) % 900000 + 100000);

  // Generate an anonymous batch / lot number that does NOT disclose the compound/product name
  let batchNumber = customBatch;
  if (!batchNumber) {
    if (product.batchCode && !product.batchCode.toLowerCase().includes(cleanSlug)) {
      batchNumber = product.batchCode;
    } else if (product.lotNumber && !product.lotNumber.toLowerCase().includes(cleanSlug)) {
      batchNumber = product.lotNumber;
    } else {
      batchNumber = `LOT-${uniqueSeq.slice(0, 3)}-${uniqueSeq.slice(3)}`;
    }
  }

  const discreetCode = customDiscreetCode || getDiscreetProductCode(product, null, uniqueSeq);

  // The square QR code opens the official shared product monograph page
  const destinationUrl = targetShareUrl || `${BASE_URL}/p/${cleanSlug}`;

  // Outer border & background
  page.drawRectangle({
    x: originX,
    y: originY,
    width: widthPt,
    height: heightPt,
    borderColor: rgb(0.80, 0.84, 0.88),
    borderWidth: 0.8,
    color: rgb(1, 1, 1),
  });

  // The QR code encodes the shared page URL
  const qrPngBuffer = await QRCode.toBuffer(destinationUrl, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'M',
    color: { dark: '#002244', light: '#ffffff' }
  });
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);

  if (widthPt >= 200) {
    // 38x90mm Landscape Layout: square QR code opening shared page + 1D scan barcode and BATCH NUMBER
    const qrSize = heightPt - 24; // ~83 pt square
    const qrX = originX + 14;
    const qrY = originY + (heightPt - qrSize) / 2;

    // 1. Square QR Code on the Left
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    page.drawText('SCAN QR FOR GUIDE', {
      x: qrX + (qrSize - fontB.widthOfTextAtSize('SCAN QR FOR GUIDE', 5)) / 2,
      y: qrY - 7,
      size: 5,
      font: fontB,
      color: BRAND_COLOR,
    });

    // 2. Right side: BATCH NUMBER, DISCREET CODING, 1D Scan Barcode
    const rightX = qrX + qrSize + 16;
    const rightWidth = originX + widthPt - rightX - 14;

    let curY = originY + heightPt - 20;

    page.drawText('BATCH NUMBER', {
      x: rightX,
      y: curY,
      size: 7,
      font: fontB,
      color: MUTED,
    });

    const codeTag = `COD: ${discreetCode}`;
    const codeTagW = fontB.widthOfTextAtSize(codeTag, 7);
    page.drawText(codeTag, {
      x: rightX + rightWidth - codeTagW,
      y: curY,
      size: 7,
      font: fontB,
      color: DARK_GRAY,
    });

    curY -= 17;
    page.drawText(batchNumber, {
      x: rightX,
      y: curY,
      size: 15,
      font: fontB,
      color: DARK_GRAY,
    });

    curY -= 12;
    // 1D Barcode
    const barcodeHeight = 28;
    draw1DBarcode(page, rightX, curY - barcodeHeight, rightWidth, barcodeHeight, batchNumber);

    curY -= (barcodeHeight + 9);
    page.drawText(`* ${batchNumber} *`, {
      x: rightX + 4,
      y: curY,
      size: 7.2,
      font,
      color: DARK_GRAY,
    });

    const refTag = `REF: ${discreetCode}`;
    const refTagW = font.widthOfTextAtSize(refTag, 6.8);
    page.drawText(refTag, {
      x: rightX + rightWidth - refTagW,
      y: curY,
      size: 6.8,
      font,
      color: MUTED,
    });
  } else {
    // 50x50mm Square Layout
    const qrSize = heightPt - 42;
    const qrX = originX + (widthPt - qrSize) / 2;
    const qrY = originY + 30;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    page.drawText('SCAN QR FOR GUIDE', {
      x: originX + (widthPt - fontB.widthOfTextAtSize('SCAN QR FOR GUIDE', 5.2)) / 2,
      y: qrY - 7,
      size: 5.2,
      font: fontB,
      color: BRAND_COLOR,
    });

    page.drawText(`BATCH: ${batchNumber}   •   COD: ${discreetCode}`, {
      x: originX + (widthPt - fontB.widthOfTextAtSize(`BATCH: ${batchNumber}   •   COD: ${discreetCode}`, 6.5)) / 2,
      y: originY + 12,
      size: 6.5,
      font: fontB,
      color: DARK_GRAY,
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

    const customBatch = searchParams.get('batch') || searchParams.get('lot') || searchParams.get('tracking') || searchParams.get('trk');
    const customCode = searchParams.get('code') || searchParams.get('ref') || searchParams.get('coding');

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const product = await getProductData(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const cleanSlug = toSafePdfText(product.slug || product.id || 'parcel').toLowerCase();

    // Resolve target shared URL for the QR code
    const explicitUrl = searchParams.get('url') || searchParams.get('shareUrl');
    let targetShareUrl = explicitUrl;
    if (!targetShareUrl) {
      const qParams = new URLSearchParams();
      const supp = searchParams.get('supplier');
      const dose = searchParams.get('dose');
      const lang = searchParams.get('lang');
      const presFormat = searchParams.get('presentation') || searchParams.get('formatId');
      if (supp && supp !== 'all') qParams.set('supplier', supp);
      if (dose && dose !== 'all') qParams.set('dose', dose);
      if (presFormat && presFormat !== 'all') qParams.set('format', presFormat);
      if (lang && lang !== 'en') qParams.set('lang', lang);
      const qs = qParams.toString();
      targetShareUrl = `${BASE_URL}/p/${cleanSlug}${qs ? `?${qs}` : ''}`;
    }

    let hash = 0;
    for (let i = 0; i < cleanSlug.length; i++) {
      hash = ((hash << 5) - hash) + cleanSlug.charCodeAt(i);
      hash |= 0;
    }
    const uniqueSeq = String(Math.abs(hash) % 900000 + 100000);

    // Deterministic anonymous batch number (Lot)
    let batchNumber = customBatch;
    if (!batchNumber) {
      if (product.batchCode && !product.batchCode.toLowerCase().includes(cleanSlug)) {
        batchNumber = product.batchCode;
      } else if (product.lotNumber && !product.lotNumber.toLowerCase().includes(cleanSlug)) {
        batchNumber = product.lotNumber;
      } else {
        batchNumber = `LOT-${uniqueSeq.slice(0, 3)}-${uniqueSeq.slice(3)}`;
      }
    }

    // Discreet coding number invented to identify the product internally
    const discreetCode = getDiscreetProductCode(product, customCode, uniqueSeq);

    const renderLabel = isBarcodeOnly
      ? (doc, p, x, y, w, h) => renderBarcodeOnlyLabel(doc, p, x, y, w, h, product, font, fontB, batchNumber, targetShareUrl, discreetCode)
      : (doc, p, x, y, w, h) => renderFullInfoLabel(doc, p, x, y, w, h, product, font, fontB, targetShareUrl, batchNumber, discreetCode);

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
        ? `Atlas Logistics Discreet Batch & Monograph Traceability Labels`
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
          await renderLabel(pdfDoc, page, x, y, labelW, labelH);
        }
      }
    } else if (format === '50x50') {
      // Square 50x50mm
      const sizePt = mmToPt(50);
      const page = pdfDoc.addPage([sizePt, sizePt]);
      await renderLabel(pdfDoc, page, 0, 0, sizePt, sizePt);
    } else {
      // Default 38x90mm thermal label
      const labelW = mmToPt(90); // ~255 pt
      const labelH = mmToPt(38); // ~108 pt
      const page = pdfDoc.addPage([labelW, labelH]);
      await renderLabel(pdfDoc, page, 0, 0, labelW, labelH);
    }

    const pdfBytes = await pdfDoc.save();
    const safeName = toSafePdfText(product.name || id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = isBarcodeOnly
      ? `batch_label_${batchNumber.toLowerCase()}_${format}.pdf`
      : `vial_label_${safeName}_full_${format}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': isBarcodeOnly
          ? 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          : 'public, max-age=3600, stale-while-revalidate=86400',
        'Pragma': 'no-cache',
        'Expires': '0',
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
