/**
 * priceListExportService.js
 * 
 * Generates an official, high-quality Price List PDF & CSV for Atlas Health catalog.
 * Adapts columns and pricing visibility dynamically based on user role:
 * - Admin: Full cost-to-retail waterfall + margins + supplier breakdown.
 * - Doctor: Clinical price & Retail PVP only (no raw acquisition cost).
 * - Wholesaler: B2B wholesale pricing, 10-kit & 50-kit volume tiers, and MOQ.
 * - Compounding Pharmacy: Raw API / custom formulations & base pricing.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [15, 23, 42],       // slate-900
  accent: [37, 99, 235],       // blue-600
  accentTeal: [13, 148, 136],  // teal-600
  accentOrange: [194, 65, 12], // orange-700
  border: [226, 232, 240],     // slate-200
  lightBg: [248, 250, 252],    // slate-50
  text: [30, 41, 59],          // slate-800
  muted: [100, 116, 139],      // slate-500
  white: [255, 255, 255]
};

/**
 * Extracts and normalizes rows from a products array for tabular export.
 */
function normalizeCatalogRows(products = [], role = 'admin') {
  const rows = [];

  products.forEach((p) => {
    const prodName = p.canonicalName || p.displayName || p.name || 'Unknown Compound';
    const category = p.category || 'General';
    const variants = Array.isArray(p.variants) && p.variants.length > 0
      ? p.variants
      : [{
          dosage: p.dosage || 'Standard',
          presentation: p.presentation || 'Vial',
          supplier: p.supplier || 'Atlas Verified',
          stock: p.stock ?? 'Available',
          cost: p.cost ?? p.unit_cost ?? 0,
          wholesalePrice: p.wholesalePrice ?? p.wholesale_price ?? 0,
          clinicPrice: p.clinicPrice ?? p.clinic_price ?? 0,
          retailPrice: p.price ?? p.retailPrice ?? 0,
          cost_tiers: p.cost_tiers || {}
        }];

    variants.forEach((v) => {
      const cost = v.cost ?? v.unit_cost ?? v.pricing?.masterPrice?.base ?? v.pricing?.master?.perUnit;
      const wholesale = v.wholesalePrice ?? v.wholesale_price ?? v.pricing?.wholesalePrice?.base ?? v.pricing?.wholesale?.perUnit;
      const clinic = v.clinicPrice ?? v.clinic_price ?? v.pricing?.clinicPrice?.base ?? v.pricing?.clinic?.perUnit;
      const retail = v.unit_price ?? v.price ?? v.retailPrice ?? v.pricing?.retailPrice?.base ?? v.pricing?.retail?.perUnit;
      const tier10 = v.cost_tiers?.cost_10 ?? v.price_per_kit_10 ?? v.pricing?.wholesale?.kit;
      const tier50 = v.cost_tiers?.cost_50 ?? v.price_per_tier_50;

      let marginPct = null;
      if (cost && retail && Number(retail) > 0) {
        marginPct = Math.round(((Number(retail) - Number(cost)) / Number(retail)) * 100);
      }

      rows.push({
        name: prodName,
        category,
        dosage: v.dosage || v.concentration || 'Standard',
        presentation: v.presentation || v.form || 'Vial',
        supplier: v.supplier || 'Atlas Verified',
        stock: v.stock != null ? String(v.stock) : 'In Stock',
        cost: cost != null ? Number(cost) : null,
        wholesale: wholesale != null ? Number(wholesale) : null,
        clinic: clinic != null ? Number(clinic) : null,
        retail: retail != null ? Number(retail) : null,
        tier10: tier10 != null ? Number(tier10) : null,
        tier50: tier50 != null ? Number(tier50) : null,
        marginPct
      });
    });
  });

  return rows;
}

/**
 * Generate Price List PDF
 */
export async function generatePriceListPdf(products = [], options = {}) {
  const role = options.role || 'admin';
  const categoryFilter = options.category || options.categoryFilter || 'All Categories';
  const title = options.title || `Price Catalog · ${categoryFilter}`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PAGE_W = 297;
  const PAGE_H = 210;
  const MARGIN = 14;

  const isDoctorRole = ['doctor', 'medical_director'].includes(role);
  const isWholesaler = ['wholesaler', 'distributor'].includes(role);
  const accentColor = isDoctorRole ? COLORS.accentTeal : (isWholesaler ? COLORS.accentOrange : COLORS.accent);

  // ── Header Banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 22, 'F');
  doc.setFillColor(...accentColor);
  doc.rect(0, 22, PAGE_W, 1.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text('ATLAS HEALTH', MARGIN, 11);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('CLINICAL RESEARCH & PEPTIDE INTELLIGENCE', MARGIN, 16);

  // Right subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text(title.toUpperCase(), PAGE_W - MARGIN, 11, { align: 'right' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`AUDIENCE: ${role.toUpperCase()} · DATE: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, PAGE_W - MARGIN, 16, { align: 'right' });

  // ── Build Columns based on role ────────────────────────────────────────────
  const rows = normalizeCatalogRows(products, role);

  let headers = [];
  let tableData = [];

  if (role === 'admin') {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Supplier', 'Stock', 'Unit Cost', 'Wholesale', 'Clinic', 'Retail PVP', '10-Kit Tier', 'Margin %'];
    tableData = rows.map(r => [
      r.name,
      r.category,
      r.dosage,
      r.presentation,
      r.supplier,
      r.stock,
      r.cost != null ? `$${r.cost.toFixed(2)}` : '—',
      r.wholesale != null ? `$${r.wholesale.toFixed(2)}` : '—',
      r.clinic != null ? `$${r.clinic.toFixed(2)}` : '—',
      r.retail != null ? `$${r.retail.toFixed(2)}` : '—',
      r.tier10 != null ? `$${r.tier10.toFixed(2)}` : '—',
      r.marginPct != null ? `${r.marginPct}%` : '—'
    ]);
  } else if (isDoctorRole) {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Status', 'Clinical Price', 'Retail PVP'];
    tableData = rows.map(r => [
      r.name,
      r.category,
      r.dosage,
      r.presentation,
      r.stock,
      r.clinic != null ? `$${r.clinic.toFixed(2)}` : '—',
      r.retail != null ? `$${r.retail.toFixed(2)}` : '—'
    ]);
  } else if (isWholesaler) {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Stock Status', 'Unit Wholesale', '10-Kit Tier', '50-Kit Tier'];
    tableData = rows.map(r => [
      r.name,
      r.category,
      r.dosage,
      r.presentation,
      r.stock,
      r.wholesale != null ? `$${r.wholesale.toFixed(2)}` : '—',
      r.tier10 != null ? `$${r.tier10.toFixed(2)}` : '—',
      r.tier50 != null ? `$${r.tier50.toFixed(2)}` : '—'
    ]);
  } else {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Stock', 'Unit Price'];
    tableData = rows.map(r => [
      r.name,
      r.category,
      r.dosage,
      r.presentation,
      r.stock,
      r.retail != null ? `$${r.retail.toFixed(2)}` : (r.clinic != null ? `$${r.clinic.toFixed(2)}` : '—')
    ]);
  }

  // ── AutoTable Render ───────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: accentColor,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center'
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      halign: 'center',
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'left' }
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg
    },
    margin: { left: MARGIN, right: MARGIN, bottom: 14 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.muted);
      doc.text('Atlas Health Intelligence Platform · Confidential Pricing · Not for Public Distribution', MARGIN, PAGE_H - 6);
      doc.text(`Page ${pageNumber} · Total Items: ${rows.length}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
    }
  });

  const filename = `Atlas_Price_Catalog_${role}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return { success: true, filename, totalItems: rows.length };
}

/**
 * Generate Price List CSV
 */
export function generatePriceListCsv(products = [], options = {}) {
  const role = options.role || 'admin';
  const rows = normalizeCatalogRows(products, role);

  const isDoctorRole = ['doctor', 'medical_director'].includes(role);
  const isWholesaler = ['wholesaler', 'distributor'].includes(role);

  let headers = [];
  if (role === 'admin') {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Supplier', 'Stock', 'Unit Cost', 'Wholesale Price', 'Clinic Price', 'Retail Price', '10-Kit Tier', 'Margin Pct'];
  } else if (isDoctorRole) {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Stock Status', 'Clinical Price', 'Retail PVP'];
  } else if (isWholesaler) {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Stock Status', 'Unit Wholesale', '10-Kit Tier', '50-Kit Tier'];
  } else {
    headers = ['Compound', 'Category', 'Dosage', 'Format', 'Stock Status', 'Unit Price'];
  }

  const csvRows = [headers.join(',')];

  rows.forEach(r => {
    let rowVals = [];
    if (role === 'admin') {
      rowVals = [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.dosage}"`,
        `"${r.presentation}"`,
        `"${r.supplier}"`,
        `"${r.stock}"`,
        r.cost != null ? r.cost : '',
        r.wholesale != null ? r.wholesale : '',
        r.clinic != null ? r.clinic : '',
        r.retail != null ? r.retail : '',
        r.tier10 != null ? r.tier10 : '',
        r.marginPct != null ? `${r.marginPct}%` : ''
      ];
    } else if (isDoctorRole) {
      rowVals = [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.dosage}"`,
        `"${r.presentation}"`,
        `"${r.stock}"`,
        r.clinic != null ? r.clinic : '',
        r.retail != null ? r.retail : ''
      ];
    } else if (isWholesaler) {
      rowVals = [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.dosage}"`,
        `"${r.presentation}"`,
        `"${r.stock}"`,
        r.wholesale != null ? r.wholesale : '',
        r.tier10 != null ? r.tier10 : '',
        r.tier50 != null ? r.tier50 : ''
      ];
    } else {
      rowVals = [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.dosage}"`,
        `"${r.presentation}"`,
        `"${r.stock}"`,
        r.retail != null ? r.retail : (r.clinic != null ? r.clinic : '')
      ];
    }
    csvRows.push(rowVals.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  const filename = `Atlas_Price_Catalog_${role}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { success: true, filename, totalItems: rows.length };
}
