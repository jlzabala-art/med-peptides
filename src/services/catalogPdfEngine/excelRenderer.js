/**
 * excelRenderer.js — Excel export engine for catalogs.
 *
 * Layout: Minimalist clean data table.
 * Content: SKU · Product Name · Format/Route · Strength/Size · Supplier · Price (ex-works).
 * Target: Wholesalers / Distributors / Operations teams.
 */

import * as XLSX from 'xlsx';

/**
 * Generate an Excel workbook Blob from catalog data.
 *
 * @param {Object} catalogData - Catalog data containing selectedProducts
 * @param {Object} publishOptions - Publishing options (priceLevel, showPrices)
 * @returns {Blob} The generated Excel file as a Blob
 */
export function generateCatalogExcel(catalogData, publishOptions = {}) {
  const products = catalogData.cartProductsSnapshot || catalogData.selectedProducts || [];

  // Table Headers
  const headers = [
    'SKU',
    'Product Name',
    'Format / Route',
    'Strength / Size',
    'Supplier',
    'Price (ex-works)'
  ];

  // Helper to format price values
  const priceKey = publishOptions.priceLevel === 'MSRP' 
    ? 'msrp' 
    : (publishOptions.priceLevel === 'wholesale' ? 'price' : 'cost');

  // Build rows
  const rows = products.map((p) => {
    const sku = p.sku || p.variantSku || p.variants?.[0]?.sku || '—';
    const name = p.name || p.productTitle || p.displayName || '—';
    
    // Format / Route
    const route = p.defaultVariant?.route || p.route || 'Vial';
    const cleanRoute = route.replace(/_/g, ' ');

    // Size / Strength
    const size = p.defaultVariant?.size || p.size || p.strength || p.vialStrength || '—';

    // Supplier
    const supplier = p.supplier || p.supplierName || 'Atlas Health';

    // Pricing
    let priceCell = 'Request Pricing';
    if (publishOptions.showPrices) {
      const priceVal = p[priceKey] ?? p.msrp ?? p.price ?? p.cost;
      if (priceVal != null && priceVal !== '') {
        const num = parseFloat(priceVal);
        priceCell = isNaN(num) ? String(priceVal) : `€ ${num.toFixed(2)}`;
      } else {
        priceCell = '—';
      }
    }

    return [sku, name, cleanRoute, size, supplier, priceCell];
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Adjust column widths
  ws['!cols'] = [
    { wch: 15 }, // SKU
    { wch: 35 }, // Product Name
    { wch: 20 }, // Format / Route
    { wch: 18 }, // Strength / Size
    { wch: 22 }, // Supplier
    { wch: 18 }  // Price
  ];

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Catalog');

  // Generate binary array buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Return as Blob
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * Trigger browser download of the Excel Blob.
 */
export function downloadExcelBlob(blob, filename = 'catalog.xlsx') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
