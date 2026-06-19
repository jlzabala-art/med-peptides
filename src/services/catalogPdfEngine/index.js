/**
 * catalogPdfEngine/index.js
 *
 * Orchestrator for generating Catalog PDFs using templates.
 * Handles AI enrichment batching if the Clinical template is chosen.
 */

import { renderMinimal } from './templates/minimal.js';
import { renderStandard } from './templates/standard.js';
import { renderClinical } from './templates/clinical.js';
import { enrichProductBatch } from './aiEnricher.js';

/**
 * Generate a PDF blob from catalog data using the selected template.
 *
 * @param {Object} catalogData - Catalog data containing selectedProducts
 * @param {Object} publishOptions - Publishing options (template, format, priceLevel, showPrices)
 * @param {Object} tenantInfo - Tenant brand info
 * @param {Object} callbacks - Optional progress callbacks
 * @returns {Promise<Blob>} The generated PDF as a Blob
 */
export async function generateCatalogPdf(catalogData, publishOptions, tenantInfo = {}, callbacks = {}) {
  const { onProgress = () => {} } = callbacks;
  const template = publishOptions?.pdfTemplate || 'standard';

  onProgress({ step: 'init', progress: 10, message: 'Initializing PDF engine...' });

  const products = catalogData.cartProductsSnapshot || catalogData.selectedProducts || [];
  let enrichmentMap = {};

  // If Clinical template, we need to ensure all products are enriched
  if (template === 'clinical') {
    onProgress({ step: 'enrich', progress: 20, message: 'Running clinical AI enrichment...' });
    
    // Auth token is optional depending on backend rules, but we pass null here.
    // If you have a token in the app context, pass it in through publishOptions.
    const authToken = publishOptions?.authToken || null;

    enrichmentMap = await enrichProductBatch(products, authToken, (pct) => {
      onProgress({ 
        step: 'enrich', 
        progress: 20 + Math.round(pct * 0.5), // 20% to 70% range
        message: `Analyzing medical literature (${pct}%)...`
      });
    });
  }

  onProgress({ step: 'render', progress: 75, message: 'Rendering PDF pages...' });

  let doc;
  switch (template) {
    case 'minimal':
      doc = await renderMinimal(catalogData, publishOptions, tenantInfo);
      break;
    case 'clinical':
      doc = await renderClinical(catalogData, publishOptions, tenantInfo, enrichmentMap);
      break;
    case 'standard':
    default:
      doc = await renderStandard(catalogData, publishOptions, tenantInfo);
      break;
  }

  onProgress({ step: 'finalize', progress: 95, message: 'Finalizing document...' });

  // Output as Blob
  const blob = doc.output('blob');
  
  onProgress({ step: 'complete', progress: 100, message: 'Done!' });
  return blob;
}

/**
 * Download the generated Blob as a file.
 */
export function downloadPdfBlob(blob, filename = 'catalog.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Excel exports ──────────────────────────────────────────────────────────
export { generateCatalogExcel, downloadExcelBlob } from './excelRenderer.js';
