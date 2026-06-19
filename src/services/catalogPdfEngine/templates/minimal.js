/**
 * templates/minimal.js — Minimal catalog template.
 *
 * Layout: Grid of product cards (3 per page).
 * Content: Image · Name · SKU · Price only.
 * Target: Patients / end consumers / visual brochure.
 * AI: Not required.
 */

import {
  createDocument, drawCoverPage, addAllFooters,
  PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLORS, loadImageAsBase64
} from '../pdfRenderer.js';

const CARD_W = (CONTENT_W - 8) / 3;
const CARD_H = 65;
const CARDS_PER_ROW = 3;
const CARDS_PER_PAGE = 6;

function formatPrice(val, priceLevel) {
  if (val == null || val === '') return '—';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return `€ ${num.toFixed(2)}`;
}

/**
 * @param {jsPDF} doc
 * @param {Object} product
 * @param {string|null} imgBase64
 * @param {number} x
 * @param {number} y
 * @param {Object} publishOptions
 */
function drawProductCard(doc, product, imgBase64, x, y, publishOptions) {
  // Card border
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(x, y, CARD_W, CARD_H, 2, 2, 'FD');

  // Product image
  const imgSize = 28;
  const imgX = x + (CARD_W - imgSize) / 2;
  if (imgBase64) {
    try {
      doc.addImage(imgBase64, 'JPEG', imgX, y + 3, imgSize, imgSize);
    } catch { /* ignore broken images */ }
  } else {
    // Placeholder box
    doc.setFillColor(...COLORS.light);
    doc.rect(imgX, y + 3, imgSize, imgSize, 'F');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.muted);
    doc.text('No image', imgX + imgSize / 2, y + 3 + imgSize / 2, { align: 'center' });
  }

  // Product name
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  const nameLines = doc.splitTextToSize(product.name || product.productTitle || '—', CARD_W - 4);
  doc.text(nameLines.slice(0, 2), x + CARD_W / 2, y + 35, { align: 'center' });

  // SKU
  if (product.sku || product.variantSku) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(`SKU: ${product.sku || product.variantSku}`, x + CARD_W / 2, y + 43, { align: 'center' });
  }

  // Price
  if (publishOptions?.showPrices) {
    const priceKey = publishOptions.priceLevel === 'MSRP' ? 'msrp' : (publishOptions.priceLevel === 'wholesale' ? 'price' : 'cost');
    const priceVal = product[priceKey] ?? product.msrp ?? product.price;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text(formatPrice(priceVal), x + CARD_W / 2, y + 51, { align: 'center' });

    // Ex-works tag
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text('ex-works', x + CARD_W / 2, y + 56, { align: 'center' });
  }
}

/**
 * Render minimal template.
 * @param {Object} catalogData
 * @param {Object} publishOptions
 * @param {Object} tenantInfo
 * @returns {Promise<jsPDF>}
 */
export async function renderMinimal(catalogData, publishOptions, tenantInfo = {}) {
  const doc = createDocument();

  // Cover page
  drawCoverPage(doc, {
    title: catalogData.title,
    description: catalogData.description,
    date: catalogData.date,
    audience: catalogData.targetAudience,
    tenantName: tenantInfo.name,
  });

  const products = catalogData.cartProductsSnapshot || catalogData.selectedProducts || [];
  if (products.length === 0) {
    addAllFooters(doc, { catalogTitle: catalogData.title });
    return doc;
  }

  // Preload images
  const images = await Promise.all(
    products.map(p => loadImageAsBase64(p.imageUrl || p.image || p.thumbnail))
  );

  doc.addPage();
  let col = 0, row = 0, pageCount = 0;
  const startY = MARGIN + 5;
  const colGap = 4;
  const rowGap = 6;

  for (let i = 0; i < products.length; i++) {
    if (pageCount > 0 && (col === 0 && row === 0)) {
      doc.addPage();
    }

    const x = MARGIN + col * (CARD_W + colGap);
    const y = startY + row * (CARD_H + rowGap);

    drawProductCard(doc, products[i], images[i], x, y, publishOptions);

    col++;
    if (col >= CARDS_PER_ROW) {
      col = 0;
      row++;
    }
    if (row >= 2) {
      col = 0;
      row = 0;
      pageCount++;
      if (i < products.length - 1) doc.addPage();
    }
  }

  addAllFooters(doc, { catalogTitle: catalogData.title, isExWorks: publishOptions?.showPrices });
  return doc;
}
