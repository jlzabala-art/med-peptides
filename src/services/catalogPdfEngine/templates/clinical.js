/**
 * templates/clinical.js — Clinical catalog template (AI-enriched).
 *
 * Layout: 1 product per page, full clinical dossier format.
 * Content: Image · Full specs · AI-generated mechanism of action,
 *          indications, contraindications, literature references.
 * Target: Doctors / specialist clinics.
 * AI: Required (enriched via aiEnricher with cache-first logic).
 */

import {
  createDocument, drawCoverPage, addAllFooters, drawSectionHeader,
  drawInfoRow, PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLORS, loadImageAsBase64
} from '../pdfRenderer.js';

const IMG_SIZE = 55;

function formatPrice(val) {
  if (val == null) return '—';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return `€ ${num.toFixed(2)}`;
}

/**
 * Render a single product as a full clinical dossier page.
 */
async function drawClinicalProductPage(doc, product, imgBase64, enrichment, publishOptions) {
  doc.addPage();
  let y = MARGIN;

  // ── Product Header Bar ───────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 22, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 22, PAGE_W, 1.5, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(product.name || product.productTitle || '—', MARGIN, 14);

  if (product.category) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 190, 220);
    doc.text(product.category.toUpperCase(), PAGE_W - MARGIN, 14, { align: 'right' });
  }

  y = 28;

  // ── Two-column layout: image left, specs right ───────────────────────────
  const colLeft = MARGIN;
  const colRight = MARGIN + IMG_SIZE + 8;
  const colRightW = CONTENT_W - IMG_SIZE - 8;

  // Image
  if (imgBase64) {
    try {
      doc.addImage(imgBase64, 'JPEG', colLeft, y, IMG_SIZE, IMG_SIZE);
    } catch { /* skip */ }
  } else {
    doc.setFillColor(...COLORS.light);
    doc.rect(colLeft, y, IMG_SIZE, IMG_SIZE, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text('No image', colLeft + IMG_SIZE / 2, y + IMG_SIZE / 2, { align: 'center' });
  }

  // Specs column
  let specY = y;
  if (product.sku || product.variantSku) {
    specY = drawInfoRow(doc, 'SKU:', product.sku || product.variantSku, colRight, specY, 22);
    specY += 1;
  }
  if (product.strength || product.vialStrength) {
    specY = drawInfoRow(doc, 'Strength:', product.strength || product.vialStrength, colRight, specY, 22);
    specY += 1;
  }
  if (product.route) {
    specY = drawInfoRow(doc, 'Route:', product.route, colRight, specY, 22);
    specY += 1;
  }
  if (product.dosage) {
    specY = drawInfoRow(doc, 'Dosage:', product.dosage, colRight, specY, 22);
    specY += 1;
  }
  if (product.storage) {
    specY = drawInfoRow(doc, 'Storage:', product.storage, colRight, specY, 22);
    specY += 1;
  }

  // Price in specs column
  if (publishOptions?.showPrices) {
    const priceKey = publishOptions.priceLevel === 'MSRP' ? 'msrp'
      : publishOptions.priceLevel === 'wholesale' ? 'price' : 'cost';
    const priceVal = product[priceKey] ?? product.msrp ?? product.price;

    specY += 3;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text(formatPrice(priceVal), colRight, specY);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text('ex-works / unit', colRight + 28, specY);
  }

  y = Math.max(y + IMG_SIZE, specY) + 8;

  // ── AI-enriched clinical sections ────────────────────────────────────────
  if (enrichment) {
    // Executive Summary
    if (enrichment.summary) {
      y = drawSectionHeader(doc, '📋 Clinical Summary', y);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const summaryLines = doc.splitTextToSize(enrichment.summary, CONTENT_W - 4);
      doc.text(summaryLines, MARGIN + 2, y + 1);
      y += summaryLines.length * 4.2 + 6;
    }

    // Mechanism of Action
    if (enrichment.mechanism) {
      if (y > 240) { doc.addPage(); y = MARGIN; }
      y = drawSectionHeader(doc, '⚙️ Mechanism of Action', y);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const mechLines = doc.splitTextToSize(enrichment.mechanism, CONTENT_W - 4);
      doc.text(mechLines, MARGIN + 2, y + 1);
      y += mechLines.length * 4 + 6;
    }

    // Indications + Contraindications — two columns
    if (enrichment.indications?.length || enrichment.contraindications?.length) {
      if (y > 240) { doc.addPage(); y = MARGIN; }
      y = drawSectionHeader(doc, '✅ Indications  /  ⚠️ Contraindications', y);

      const halfW = (CONTENT_W - 6) / 2;
      let leftY = y + 2;
      let rightY = y + 2;

      // Indications (left)
      doc.setFontSize(7.5);
      (enrichment.indications || []).forEach((ind) => {
        if (leftY > 275) return;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(`• ${ind}`, halfW);
        doc.text(lines, MARGIN + 2, leftY);
        leftY += lines.length * 4 + 1;
      });

      // Contraindications (right)
      (enrichment.contraindications || []).forEach((ci) => {
        if (rightY > 275) return;
        doc.setTextColor(...COLORS.warning);
        const lines = doc.splitTextToSize(`⚠ ${ci}`, halfW);
        doc.text(lines, MARGIN + halfW + 6, rightY);
        rightY += lines.length * 4 + 1;
      });

      y = Math.max(leftY, rightY) + 5;
    }

    // Literature references
    if (enrichment.references?.length) {
      if (y > 255) { doc.addPage(); y = MARGIN; }
      y = drawSectionHeader(doc, '📚 Key References', y);
      doc.setFontSize(7);
      enrichment.references.slice(0, 4).forEach((ref, i) => {
        if (y > 275) return;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.accent);
        doc.text(`[${i + 1}]`, MARGIN + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(ref, CONTENT_W - 12);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * 3.5 + 2;
      });
    }
  } else {
    // No enrichment available — show product description at minimum
    if (product.description) {
      y = drawSectionHeader(doc, 'Description', y);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const descLines = doc.splitTextToSize(product.description, CONTENT_W - 4);
      doc.text(descLines, MARGIN + 2, y + 1);
    }
  }
}

/**
 * Render clinical template.
 * @param {Object} catalogData
 * @param {Object} publishOptions
 * @param {Object} tenantInfo
 * @param {Object} enrichmentMap - { productName: enrichmentData } from aiEnricher
 */
export async function renderClinical(catalogData, publishOptions, tenantInfo = {}, enrichmentMap = {}) {
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

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pName = p.name || p.productTitle || '';
    const enrichment = enrichmentMap[pName] || null;
    await drawClinicalProductPage(doc, p, images[i], enrichment, publishOptions);
  }

  addAllFooters(doc, { catalogTitle: catalogData.title, isExWorks: publishOptions?.showPrices });
  return doc;
}
