/**
 * universalExporter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Data Exporter with CSV Injection Protection & Dynamic Filtering.
 * Supports CSV and JSON streaming download for any DataTable dataset.
 *
 * Implements AGENTS.md Rule #10 (Anti-Risk & Data Sanitization).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Sanitizes a cell value to prevent CSV Injection / Formula Execution in Excel/Sheets.
 * If text starts with =, +, -, @, \t, \r, it prepends a single quote.
 */
function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  // Escape double quotes
  return str.replace(/"/g, '""');
}

/**
 * Exports an array of objects to sanitized CSV and triggers browser download.
 * @param {Array<Object>} data - Raw data objects
 * @param {Array<Object>} columns - Column definitions [{ key, header }]
 * @param {string} [filename='export.csv']
 */
export function exportToCSV(data = [], columns = [], filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[universalExporter] No data to export.');
    return;
  }

  const exportCols = columns.length > 0
    ? columns
    : Object.keys(data[0]).map(k => ({ key: k, header: k }));

  const headers = exportCols.map(c => `"${sanitizeCSVCell(c.header || c.key)}"`).join(',');

  const rows = data.map(row => {
    return exportCols.map(c => {
      const val = row[c.key];
      const cellContent = typeof val === 'object' ? JSON.stringify(val) : val;
      return `"${sanitizeCSVCell(cellContent)}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Exports data as a formatted JSON file.
 */
export function exportToJSON(data = [], filename = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

function downloadBlob(blob, filename) {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
