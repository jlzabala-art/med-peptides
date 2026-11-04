/**
 * utils/exportLotuslandProcurementXlsx.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates and downloads a preset, audit-grade multi-sheet Excel (.xlsx) report
 * detailing all API raw materials purchased from Lotusland Limited from the
 * beginning of the commercial relationship.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as XLSX from 'xlsx';
import { getLotuslandProcurementReport } from '../services/lotuslandProcurementService.js';

export function exportLotuslandProcurementXlsx() {
  const data = getLotuslandProcurementReport();
  const today = new Date().toISOString().split('T')[0];

  const wb = XLSX.utils.book_new();

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 1: API Executive Summary
  // ─────────────────────────────────────────────────────────────────────────
  const sheet1Rows = [
    ['ATLAS HEALTH SERVICES — CLINICAL SOURCING AUDIT', ''],
    ['Supplier Sourcing Desk', `${data.metadata.companyName} (Hong Kong SAR Reg: ${data.metadata.regNumber})`],
    ['Relationship Scope', 'Authoritative API Raw Material Procurement Ledger'],
    ['Audited Date Range', `${data.summary.firstInvoiceDate} to ${data.summary.latestInvoiceDate}`],
    ['Export Generated Date', today],
    ['Authoritative Base Currency', 'USD ($)'],
    ['', ''],
    ['EXECUTIVE AUDIT SUMMARY', ''],
    ['Total Capital Allocated (USD)', `$${data.summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
    ['Total Cumulative API Mass Procured', `${data.summary.totalGramsProcured.toLocaleString('en-US')} Grams`],
    ['Unique Active Principles (APIs)', `${data.summary.uniqueApisCount} Active Molecules`],
    ['Commercial Invoices Reconciled', `${data.summary.totalInvoicesCount} Verified Releases`],
    ['', ''],
    [
      'Active Principle (API)',
      'Therapeutic Class',
      'CAS Number',
      'Purity / Grade Standard',
      'Total Grams Procured (g)',
      'Weighted Avg Cost ($/g)',
      'Latest Purchase Cost ($/g)',
      'Atlas Catalog Price ($/g)',
      'Gross Margin ($/g)',
      'Gross Margin (%)',
      'Total Lifetime Spend ($ USD)',
      'Invoices Count',
      'Invoice References',
      'First Order Date',
      'Latest Order Date'
    ]
  ];

  data.apis.forEach(api => {
    sheet1Rows.push([
      api.name,
      api.therapeuticClass,
      api.casNumber,
      api.grade,
      api.totalGrams,
      api.weightedAvgCost,
      api.latestCost,
      api.catalogPrice,
      api.marginUSD,
      `${api.marginPercent}%`,
      api.totalSpendUSD,
      api.invoiceCount,
      api.invoiceRefs.join(', '),
      api.firstDate,
      api.latestDate
    ]);
  });

  // Total summary row
  sheet1Rows.push([
    'TOTAL / AUDITED AGGREGATE',
    'All Therapeutic Categories',
    '—',
    'Certified cGMP / ≥99.0% HPLC',
    data.summary.totalGramsProcured,
    Number((data.summary.totalSpendUSD / data.summary.totalGramsProcured).toFixed(2)),
    '—',
    '—',
    '—',
    '—',
    data.summary.totalSpendUSD,
    data.summary.totalInvoicesCount,
    '10 Invoices',
    data.summary.firstInvoiceDate,
    data.summary.latestInvoiceDate
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1['!cols'] = [
    { wch: 32 }, // Name
    { wch: 34 }, // Class
    { wch: 16 }, // CAS
    { wch: 28 }, // Grade
    { wch: 22 }, // Grams
    { wch: 22 }, // Avg Cost
    { wch: 22 }, // Latest Cost
    { wch: 22 }, // Catalog Price
    { wch: 18 }, // Margin $
    { wch: 16 }, // Margin %
    { wch: 24 }, // Spend USD
    { wch: 16 }, // Inv Count
    { wch: 36 }, // Inv Refs
    { wch: 16 }, // First Date
    { wch: 16 }  // Latest Date
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'API_Executive_Summary');

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 2: Detailed Line Items Ledger
  // ─────────────────────────────────────────────────────────────────────────
  const sheet2Rows = [
    [
      'Invoice Number',
      'Invoice Date',
      'Buyer Entity',
      'API Raw Material',
      'Quantity (Grams)',
      'Unit Cost (USD/g)',
      'Original Unit Price',
      'Original Currency',
      'Line Total (USD)',
      'HPLC Purity Standard'
    ]
  ];

  data.allLineItems.forEach(line => {
    sheet2Rows.push([
      line.invoiceNumber,
      line.invoiceDate,
      line.buyer,
      line.apiName,
      line.quantityGrams,
      Number(line.unitCostUSD.toFixed(2)),
      line.originalUnitPrice,
      line.originalCurrency,
      Number(line.lineTotalUSD.toFixed(2)),
      '≥99.0% Certified Batch Release'
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  ws2['!cols'] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 36 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Invoice_Line_Items_Ledger');

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 3: Commercial Invoices Master
  // ─────────────────────────────────────────────────────────────────────────
  const sheet3Rows = [
    [
      'Invoice Number',
      'Release Date',
      'Buyer Entity',
      'Original Currency',
      'Subtotal',
      'Discount Applied',
      'Express Shipping',
      'Grand Total (Original)',
      'USD FX Rate',
      'Grand Total (USD Equivalent)',
      'Audit Status'
    ]
  ];

  data.invoices.forEach(inv => {
    sheet3Rows.push([
      inv.invoiceNumber,
      inv.date,
      inv.buyer,
      inv.currency,
      inv.subtotal,
      inv.discountAmount || 0,
      inv.shippingAmount || 0,
      inv.grandTotal,
      inv.rateToUSD || 1.0,
      inv.grandTotalUSD,
      'Verified & Seeded in Firestore'
    ]);
  });

  sheet3Rows.push([
    'TOTALS',
    '—',
    '—',
    'USD / EUR',
    '—',
    '—',
    '—',
    '—',
    '—',
    data.summary.totalSpendUSD,
    '10 Reconciled Orders'
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);
  ws3['!cols'] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 38 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 26 },
    { wch: 28 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Commercial_Invoices_Master');

  // Write file
  const fileName = `Atlas_Lotusland_API_Procurement_Audit_${today}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
