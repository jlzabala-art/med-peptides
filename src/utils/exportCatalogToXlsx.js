import * as XLSX from 'xlsx';

/**
 * Generates and downloads a structured, formatted Excel (.xlsx) workbook
 * for product catalogues and clinical price lists.
 */
export function exportCatalogToXlsx({
  items = [],
  catalogueTitle = 'Atlas Solutions Portfolio',
  brandName = 'RegenPept & Atlas Clinical',
  supplierName = 'Atlas Solutions Commercial Network',
  warehouse = 'Poland, USA, and UK',
  currency = 'USD',
  incoterm = 'EXW',
  markupPercent = 0,
  recipientName = 'Valued Partner / Clinic',
  filename = null
}) {
  if (!items || items.length === 0) {
    console.warn('[exportCatalogToXlsx] No items provided to export');
    return;
  }

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'AED' ? 'AED ' : currency === 'GBP' ? '£' : '$';
  const exportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Sheet 1: Executive Summary & Commercial Terms ───────────────────────────
  const summaryData = [
    ['ATLAS SOLUTIONS — CLINICAL PORTFOLIO & COMMERCIAL CATALOGUE', ''],
    ['Generated On', exportDate],
    ['Catalogue Brand / Scope', brandName],
    ['Supplier / Sourcing Desk', supplierName],
    ['Prepared For', recipientName || 'Open Distribution'],
    ['Pricing Tier / Margin', markupPercent === 0 ? 'Master Cost (0% Markup)' : `Commercial (+${markupPercent}%)`],
    ['Currency', currency],
    ['Commercial Terms', `Incoterm: ${incoterm} (Ex-Works)`],
    ['Primary Dispatch Warehouse', warehouse],
    ['Total Active Products', new Set(items.map(i => i.productId || i.name)).size],
    ['Total Variants / Presentations', items.length],
    ['', ''],
    ['COMMERCIAL & LOGISTICS NOTICE', ''],
    ['1. Cold-Chain Compliance', 'All lyophilized peptides and sterile bio-stimulators are shipped with validated temperature indicators.'],
    ['2. Lead Times', 'EU Hub stock: 2-4 business days. Transatlantic / UK Hub: 3-5 business days.'],
    ['3. Payment & Settlement', 'Net terms or upfront payment depending on partner agreement.'],
    ['4. Order Desk Contact', 'orders@atlas-solutions.com | +34 687 168 464'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 75 }];

  // ── Sheet 2: Detailed Catalogue ─────────────────────────────────────────────
  const catalogHeaders = [
    'Ref Code',
    'Product Name',
    'Dosage / Volume',
    'Presentation',
    'Category',
    'Clinical Target / Goal',
    'CAS Number',
    'Supplier / Brand',
    'Warehouse Origin',
    `Unit Cost (${currency})`,
    `Kit Price (x10) (${currency})`,
    'Status'
  ];

  const catalogRows = items.map(item => {
    const refCode = item.refCode || item.sku || `PEP-${(item.name || 'PEP').slice(0, 3).toUpperCase()}-01`;
    const unitPrice = item.price != null ? Number(Number(item.price).toFixed(2)) : null;
    const kitPrice = item.kitPrice != null ? Number(Number(item.kitPrice).toFixed(2)) : null;

    return [
      refCode,
      item.name || 'Unknown',
      item.dosage || item.doseOnly || '-',
      item.presentation || item.presentationOnly || item.format || 'Vial',
      item.category || 'Peptides',
      item.goal || item.target || '-',
      item.casNumber || '-',
      item.supplier || supplierName,
      item.warehouse || warehouse,
      unitPrice !== null ? unitPrice : 'N/A',
      kitPrice !== null ? kitPrice : 'N/A',
      item.inStock !== false ? 'Active / In Stock' : 'Out of Stock'
    ];
  });

  const wsCatalog = XLSX.utils.aoa_to_sheet([catalogHeaders, ...catalogRows]);
  wsCatalog['!cols'] = [
    { wch: 15 }, // Ref Code
    { wch: 32 }, // Product Name
    { wch: 18 }, // Dosage
    { wch: 16 }, // Presentation
    { wch: 18 }, // Category
    { wch: 30 }, // Target
    { wch: 14 }, // CAS
    { wch: 22 }, // Supplier
    { wch: 24 }, // Warehouse
    { wch: 14 }, // Unit Cost
    { wch: 16 }, // Kit Price
    { wch: 18 }  // Status
  ];

  // ── Build Workbook & Trigger Download ───────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Commercial Terms');
  XLSX.utils.book_append_sheet(wb, wsCatalog, 'Product Catalogue');

  const finalFilename = filename || `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_catalogue_${currency}_${Date.now().toString(36)}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}
