/**
 * Utility to export active catalog / quotation selection to CSV / Excel readable format
 */
export function exportCatalogToCsv({
  items = [],
  currency = 'USD',
  incoterm = 'EXW',
  filename = 'atlas_solutions_catalog_export.csv'
}) {
  if (!items || items.length === 0) return;

  const headers = [
    'Ref Code',
    'Product Name',
    'Dosage / Presentation',
    'Category',
    'Target / Goal',
    'CAS Number',
    'Supplier',
    `Unit Price (${currency})`,
    'Kit Price (x10)',
    'Incoterm',
    'Status',
  ];

  const rows = items.map(item => {
    const unitPrice = item.price != null ? Number(item.price).toFixed(2) : 'N/A';
    const kitPrice = item.kitPrice != null ? Number(item.kitPrice).toFixed(2) : 'N/A';
    const refCode = item.refCode || item.sku || `PEP-${(item.name || 'PEP').slice(0, 3).toUpperCase()}-01`;
    
    return [
      `"${refCode}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.dosage || item.variantName || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.goal || item.target || '').replace(/"/g, '""')}"`,
      `"${(item.casNumber || '').replace(/"/g, '""')}"`,
      `"${(item.supplier || '').replace(/"/g, '""')}"`,
      unitPrice,
      kitPrice,
      `"${incoterm}"`,
      `"${item.inStock !== false ? 'In Stock' : 'Out of Stock'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
