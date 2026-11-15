import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  drawAtlasInstitutionalHeader,
  drawAtlasKpiStrip,
  getAtlasAutoTableDefaults,
  drawAtlasGuestCtaBanner,
  applyAtlasRunningFooter,
} from './atlasPdfChrome';

/**
 * Generates a real A4 PDF Blob for any price schedule / catalog table
 * so it can be previewed in DocumentPreviewModal before printing or downloading.
 * Uses the unified Atlas institutional PDF chrome (Golden Rules #60, #61, #66).
 */
export function buildSchedulePdfBlob({
  title = 'ATLAS HEALTH SERVICES — PRICE SCHEDULE',
  subtitle = '',
  metaLine = '',
  documentRef = '',
  currency = '',
  tierLabel = '',
  isGuest = false,
  accountLabel = null,
  rightAlignCols = [],
  head = [],
  body = [],
  orientation = 'portrait',
}) {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const issuedDate = new Date().toISOString().slice(0, 10);

  let nextY = drawAtlasInstitutionalHeader(doc, {
    title,
    subtitle,
    documentRef,
    issuedDate,
    tierLabel: tierLabel || (isGuest ? 'Public Wholeseller Schedule' : 'Authenticated Partner Schedule'),
  });

  // Parse KPI cards cleanly from structured props or fallback to metaLine
  const kpiItems = [];
  if (currency) kpiItems.push({ label: 'Currency', value: currency });
  kpiItems.push({ label: 'Catalog Scope', value: `${body.length} SKUs` });
  kpiItems.push({
    label: 'Access Tier',
    value: isGuest ? 'Wholeseller (Public)' : tierLabel || 'Authorized Partner',
  });
  if (!isGuest && accountLabel) {
    kpiItems.push({ label: 'Prepared For', value: accountLabel });
  }

  if (kpiItems.length > 0) {
    nextY = drawAtlasKpiStrip(doc, { startY: nextY, items: kpiItems });
  } else if (metaLine) {
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(metaLine).slice(0, 120), 14, nextY + 2);
    nextY += 7;
  }

  // Auto-detect right-aligned numeric columns if not explicitly passed
  const resolvedRightCols =
    rightAlignCols.length > 0
      ? rightAlignCols
      : head
          .map((h, idx) =>
            /\b(AED|EUR|USD|GBP|QAR|Cost|Wholeseller|Wholesale|Distributor|Clinic|MSRP|Price|Vial|Pack)\b/i.test(
              String(h)
            )
              ? idx
              : -1
          )
          .filter((idx) => idx >= 0);

  const tableDefaults = getAtlasAutoTableDefaults({ rightAlignCols: resolvedRightCols });

  autoTable(doc, {
    ...tableDefaults,
    startY: nextY,
    head: [head],
    body,
  });

  if (isGuest) {
    drawAtlasGuestCtaBanner(doc);
  }

  applyAtlasRunningFooter(doc, {
    disclaimer: isGuest
      ? 'ATLAS HEALTH SERVICES · PUBLIC WHOLESELLER SCHEDULE · SIGN IN FOR CLINIC & RETAIL TIERS'
      : 'ATLAS HEALTH SERVICES · PRECISION MEDICINE · CONFIDENTIAL AUTHORIZED SCHEDULE',
  });

  return doc.output('blob');
}
