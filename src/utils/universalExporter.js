/**
 * universalExporter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Data Exporter with CSV Injection Protection & Dynamic Filtering.
 * Supports:
 *   - Fast client-side CSV/JSON download with UTF-8 BOM.
 *   - Direct Server-Side Streaming Export (/api/export/[entity]) for massive datasets.
 *
 * Implements AGENTS.md Rule #1 (Paging/Limits) and Rule #10 (Anti-Risk & Data Sanitization).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Sanitizes a cell value to prevent CSV Injection / Formula Execution in Excel/Sheets.
 * If text starts with =, +, -, @, \t, \r, it prepends a single quote.
 */
export function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes
  return str.replace(/"/g, '""');
}

/**
 * Exports an array of objects to sanitized CSV and triggers browser download.
 * @param {Array<Object>} data - Raw data objects
 * @param {Array<Object>} columns - Column definitions [{ key, header, accessor }]
 * @param {string} [filename='export.csv']
 */
export function exportToCSV(data = [], arg2 = [], arg3 = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[universalExporter] No data to export.');
    return;
  }

  // Polymorphic argument handling:
  // Signature A: (data, columns, filename)
  // Signature B: (data, filename, columns)
  let columns = [];
  let filename = 'export.csv';

  if (typeof arg2 === 'string') {
    filename = arg2;
    columns = Array.isArray(arg3) ? arg3 : [];
  } else if (Array.isArray(arg2)) {
    columns = arg2;
    filename = typeof arg3 === 'string' ? arg3 : 'export.csv';
  }

  const exportCols = columns.length > 0
    ? columns
    : Object.keys(data[0]).map(k => ({ key: k, header: k }));

  const headers = exportCols.map(c => `"${sanitizeCSVCell(c.header || c.key)}"`).join(',');

  const rows = data.map(row => {
    return exportCols.map(c => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.key];
      const cellContent = (val && typeof val === 'object' && !Array.isArray(val)) 
        ? JSON.stringify(val) 
        : val;
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

/**
 * Triggers a direct server-side stream download from /api/export/[entity]
 * Best for massive datasets (entire database archive up to 5,000 records).
 *
 * @param {{
 *   entity: 'clinics' | 'prescriptions' | 'products' | 'patients' | 'orders',
 *   format?: 'csv' | 'json',
 *   status?: string,
 *   doctorId?: string,
 *   clinicId?: string,
 *   limit?: number,
 *   filename?: string
 * }} options
 */
export async function triggerServerExport({
  entity,
  format = 'csv',
  status,
  doctorId,
  clinicId,
  limit = 2000,
  filename
}) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  params.set('format', format);
  if (status && status !== 'all') params.set('status', status);
  if (doctorId) params.set('doctorId', doctorId);
  if (clinicId) params.set('clinicId', clinicId);
  if (limit) params.set('limit', String(limit));

  const url = `/api/export/${encodeURIComponent(entity)}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server export failed with HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const dateStr = new Date().toISOString().slice(0, 10);
    const resolvedName = filename || `${entity}_export_${dateStr}.${format}`;
    downloadBlob(blob, resolvedName);
  } catch (err) {
    console.error('[universalExporter] server export error:', err);
    throw err;
  }
}

export function downloadBlob(blob, filename) {
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
