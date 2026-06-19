/**
 * templates/standard.js — Standard catalog template.
 *
 * Layout: 2 products per page, 2-column layout per product.
 * Content: Image · Name · SKU · Description · Indications · Price.
 * Target: Wholesalers / distributors.
 * AI: Not required (uses existing product data).
 */

import {
  createDocument, drawCoverPage, addAllFooters, drawSectionHeader,
  drawInfoRow, PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLORS, loadImageAsBase64
} from '../pdfRenderer.js';

const PRODUCT_BLOCK_H = 100;
const IMG_SIZE = 45;

function formatPrice(val) {
  if (val == null) return '—';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return `€ ${num.toFixed(2)}`;
}

async function drawProductBlock(doc, product, imgBase64, y, publishOptions) {
  const blockY = y;

  // Subtle background
  doc.setFillColor(...COLORS.light);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, blockY, CONTENT_W, PRODUCT_BLOCK_H, 2, 2, 'FD');

  // Accent left bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(MARGIN, blockY, 2.5, PRODUCT_BLOCK_H, 'F');

  // Image column (left)
  if (imgBase64) {
    try {
      doc.addImage(imgBase64, 'JPEG', MARGIN + 6, blockY + 6, IMG_SIZE, IMG_SIZE);
    } catch { /* continue */ }
  } else {
    doc.setFillColor(226, 232, 240);
    doc.rect(MARGIN + 6, blockY + 6, IMG_SIZE, IMG_SIZE, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text('No image', MARGIN + 6 + IMG_SIZE / 2, blockY + 6 + IMG_SIZE / 2 + 2, { align: 'center' });
  }

  // Data column (right of image)
  const dataX = MARGIN + IMG_SIZE + 12;
  const dataW = CONTENT_W - IMG_SIZE - 16;
  let dataY = blockY + 8;

  // Product name
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  const nameLines = doc.splitTextToSize(product.name || product.productTitle || '—', dataW);
  doc.text(nameLines.slice(0, 2), dataX, dataY);
  dataY += nameLines.slice(0, 2).length * 5 + 2;

  // SKU + Category chips
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  const meta = [product.sku && `SKU: ${product.sku}`, product.category].filter(Boolean).join('  ·  ');
  if (meta) {
    doc.text(meta, dataX, dataY);
    dataY += 6;
  }

  // Description
  if (product.description) {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    const descLines = doc.splitTextToSize(product.description, dataW);
    doc.text(descLines.slice(0, 3), dataX, dataY);
    dataY += descLines.slice(0, 3).length * 4 + 3;
  }

  // Dosage reference
  if (product.dosage || product.strength || product.vialStrength) {
    dataY = drawInfoRow(doc, 'Dosage:', product.dosage || product.strength || product.vialStrength, dataX, dataY, 18);
    dataY += 1;
  }

  // Pricing section
  if (publishOptions?.showPrices) {
    dataY += 2;
    doc.setDrawColor(...COLORS.border);
    doc.line(dataX, dataY, dataX + dataW, dataY);
    dataY += 4;

    const priceKey = publishOptions.priceLevel === 'MSRP' ? 'msrp'
      : publishOptions.priceLevel === 'wholesale' ? 'price' : 'cost';
    const priceVal = product[priceKey] ?? product.msrp ?? product.price;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text(formatPrice(priceVal), dataX, dataY + 4);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text('ex-works — shipping not included', dataX + 28, dataY + 4);
  }

  return blockY + PRODUCT_BLOCK_H + 8;
}

/**
 * Render standard template.
 */
export async function renderStandard(catalogData, publishOptions, tenantInfo = {}) {
  const doc = createDocument();

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

  const images = await Promise.all(
    products.map(p => loadImageAsBase64(p.imageUrl || p.image || p.thumbnail))
  );

  doc.addPage();
  let y = MARGIN + 5;

  for (let i = 0; i < products.length; i++) {
    if (y + PRODUCT_BLOCK_H > 280) {
      doc.addPage();
      y = MARGIN + 5;
    }

    y = await drawProductBlock(doc, products[i], images[i], y, publishOptions);
  }

  addAllFooters(doc, { catalogTitle: catalogData.title, isExWorks: publishOptions?.showPrices });
  return doc;
}
