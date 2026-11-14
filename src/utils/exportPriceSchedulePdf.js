import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads an official B2B Price Schedule PDF for the given
 * catalog, filtered/selected rows, and active pricing tier.
 */
export function exportPriceSchedulePdf({
  group,
  products = [],
  tier = 'wholesale',
  priceFor,
  formatPrice,
  brandFilter = 'all',
  isSelection = false,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currency = group?.currency || 'EUR';
  const showAdminColumns = tier === 'admin';
  const dateStr = new Date().toISOString().slice(0, 10);

  // Header band
  doc.setFillColor(0, 54, 102); // #003666
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`ATLAS HEALTH SERVICES — ${group?.label || 'Price Schedule'}`, 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const subtitleParts = [
    group?.description || 'Official B2B Clinical Price Schedule',
    `Currency: ${currency}`,
    `Issued: ${dateStr}`,
  ];
  doc.text(subtitleParts.join('  ·  ').slice(0, 105), 14, 19);

  // Metadata strip
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  const tierDisplay =
    tier === 'admin'
      ? 'Internal Admin (Full Waterfall)'
      : tier === 'clinic'
        ? 'Clinic / Doctor Tier (+45%)'
        : 'Wholesale / Distributor Tier (×1.3225)';
  const scopeNote = isSelection
    ? `Selected Quote (${products.length} SKUs)`
    : `${products.length} SKUs${brandFilter !== 'all' ? ` · Brand: ${brandFilter}` : ''}`;

  doc.text(`Tier: ${tierDisplay}   |   Scope: ${scopeNote}`, 14, 35);
  doc.text(`Supplier: ${group?.supplier || 'Atlas Verified Network'}`, 14, 40);

  const head = showAdminColumns
    ? [['SKU', 'Product & Presentation', 'Brand', 'Status', 'Cost', 'Mediluxe', 'Wholesale', 'Clinic']]
    : [['SKU', 'Product & Presentation', 'Brand', 'Availability', `Price (${currency})`]];

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

    const tierAmount =
      tier === 'clinic'
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

  autoTable(doc, {
    startY: 45,
    head,
    body,
    styles: { fontSize: 7.5, cellPadding: 2.2, valign: 'middle' },
    headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: showAdminColumns
      ? {
          0: { cellWidth: 26 },
          1: { cellWidth: 52 },
          2: { cellWidth: 22 },
          3: { cellWidth: 16 },
          4: { halign: 'right', cellWidth: 17 },
          5: { halign: 'right', cellWidth: 18 },
          6: { halign: 'right', cellWidth: 18 },
          7: { halign: 'right', cellWidth: 17 },
        }
      : {
          0: { cellWidth: 32 },
          1: { cellWidth: 78 },
          2: { cellWidth: 28 },
          3: { cellWidth: 22 },
          4: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
        },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Atlas Health Services · Precision Medicine · Confidential B2B Schedule · Page ${data.pageNumber} of ${pageCount}`,
        14,
        290
      );
    },
  });

  const safeId = (group?.id || 'schedule').replace(/[^a-z0-9-_]/gi, '_');
  doc.save(`${safeId}_${tier}_${dateStr}.pdf`);
}
