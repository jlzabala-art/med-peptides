import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  drawAtlasInstitutionalHeader,
  drawAtlasKpiStrip,
  getAtlasAutoTableDefaults,
  drawAtlasGuestCtaBanner,
  applyAtlasRunningFooter,
  previewOrSavePdf,
} from '../lib/pdf/atlasPdfChrome';

/**
 * Generates and downloads an official B2B Price Schedule PDF for the given
 * catalog, filtered/selected rows, and active pricing tier.
 * Uses the unified Atlas institutional PDF chrome (Golden Rules #60, #61, #66).
 */
export function exportPriceSchedulePdf({
  group,
  products = [],
  tier = 'wholesale',
  priceFor,
  formatPrice,
  brandFilter = 'all',
  isSelection = false,
  isGuest = false,
  accountLabel = null,
  returnBlob = false,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currency = group?.currency || 'EUR';
  const showAdminColumns = !isGuest && tier === 'admin';
  const dateStr = new Date().toISOString().slice(0, 10);

  const tierDisplay = isGuest
    ? 'Public Wholeseller Schedule'
    : tier === 'admin'
      ? 'Internal Admin (Full Waterfall)'
      : tier === 'clinic'
        ? 'Clinic / Doctor Tier (+45%)'
        : 'Wholesale / Distributor Tier (×1.3225)';

  const scopeNote = isSelection
    ? `Selected Quote (${products.length} SKUs)`
    : `${products.length} SKUs${brandFilter !== 'all' ? ` · ${brandFilter}` : ''}`;

  let nextY = drawAtlasInstitutionalHeader(doc, {
    title: `ATLAS HEALTH SERVICES — ${group?.label || 'Price Schedule'}`,
    subtitle: group?.description || 'Official B2B Clinical Price Schedule',
    documentRef: group?.documentRef || (group?.id ? String(group.id).toUpperCase() : ''),
    issuedDate: dateStr,
    tierLabel: tierDisplay,
  });

  const kpiItems = [
    { label: 'Currency', value: currency },
    { label: 'Catalog Scope', value: scopeNote },
    { label: 'Supplier', value: group?.supplier || 'Atlas Verified Network' },
  ];
  if (!isGuest && accountLabel) {
    kpiItems.push({ label: 'Prepared For', value: accountLabel });
  }

  nextY = drawAtlasKpiStrip(doc, { startY: nextY, items: kpiItems });

  const head = showAdminColumns
    ? [['SKU', 'Product & Presentation', 'Brand', 'Status', 'Cost', 'Mediluxe', 'Wholesale', 'Clinic']]
    : [['SKU', 'Product & Presentation', 'Brand', 'Availability', isGuest ? `Wholeseller (${currency})` : `Price (${currency})`]];

  const body = products.map((p) => {
    const resolved = priceFor ? priceFor(p) : { price: p.price };
    const presentation = p.packSize || p.dosage || 'Standard';
    const nameWithPres = `${p.name || p.canonicalName || p.id}\n${presentation}`;
    const brand = p.brand || p.manufacturer || '—';
    const status = p.inStock ? 'In Stock' : 'On Demand';

    if (showAdminColumns) {
      const cost = resolved.costPrice ?? (p.price ? +(p.price / 1.3225).toFixed(2) : null);
      const mediluxe = resolved.mediluxePrice ?? (cost ? +(cost * 1.15).toFixed(2) : null);
      const wholesale = resolved.wholesalePrice ?? (cost ? +(cost * 1.3225).toFixed(2) : null);
      const clinic = resolved.clinicPrice ?? (cost ? +(cost * 1.45).toFixed(2) : null);
      return [
        p.id,
        nameWithPres,
        brand,
        status,
        formatPrice(cost, currency),
        formatPrice(mediluxe, currency),
        formatPrice(wholesale, currency),
        formatPrice(clinic, currency),
      ];
    }

    const tierAmount = isGuest
      ? (resolved.wholesalePrice ?? p.pricing?.wholesalePrice ?? resolved.price ?? p.price)
      : tier === 'clinic'
        ? (resolved.clinicPrice ?? p.pricing?.clinicPrice ?? resolved.price ?? p.price)
        : (resolved.wholesalePrice ?? p.pricing?.wholesalePrice ?? resolved.price ?? p.price);

    return [
      p.id,
      nameWithPres,
      brand,
      status,
      formatPrice(tierAmount, currency),
    ];
  });

  const columnStyles = showAdminColumns
    ? {
        0: { cellWidth: 26 },
        1: { cellWidth: 50 },
        2: { cellWidth: 22 },
        3: { cellWidth: 16 },
        4: { halign: 'right', cellWidth: 17 },
        5: { halign: 'right', cellWidth: 17 },
        6: { halign: 'right', cellWidth: 17 },
        7: { halign: 'right', cellWidth: 17 },
      }
    : {
        0: { cellWidth: 32 },
        1: { cellWidth: 74 },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
      };

  const defaults = getAtlasAutoTableDefaults({
    rightAlignCols: showAdminColumns ? [4, 5, 6, 7] : [4],
    columnStyles,
  });

  autoTable(doc, {
    ...defaults,
    startY: nextY,
    head,
    body,
    styles: { ...defaults.styles, fontSize: 7.5, cellPadding: 2.2 },
  });

  if (isGuest) {
    drawAtlasGuestCtaBanner(doc);
  }

  applyAtlasRunningFooter(doc, {
    disclaimer: isGuest
      ? 'ATLAS HEALTH SERVICES · PUBLIC WHOLESELLER SCHEDULE · SIGN IN FOR CLINIC & RETAIL TIERS'
      : 'ATLAS HEALTH SERVICES · PRECISION MEDICINE · CONFIDENTIAL B2B SCHEDULE',
  });

  const safeId = (group?.id || 'schedule').replace(/[^a-z0-9-_]/gi, '_');
  if (returnBlob) {
    return doc.output('blob');
  }
  const filename = `${safeId}_${isGuest ? 'wholeseller' : tier}_${dateStr}.pdf`;
  return previewOrSavePdf(doc, filename, {
    title: `${group?.label || 'Price Schedule'} — Official PDF`,
    subtitle: `${products.length} SKUs · ${currency}`,
  });
}
