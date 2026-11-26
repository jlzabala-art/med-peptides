import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NORMA_HELLAS_METADATA, NORMA_HELLAS_IMPORTS, getNormaHellasProcurementStats } from '@/services/normaHellasProcurementService';

/**
 * buildNormaHellasStatementPdfBlob
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional A4 PDF statement generator for Norma Hellas S.A. imports
 * reconciled for Magenta Pharma Medicine Trading LLC.
 */
export function buildNormaHellasStatementPdfBlob({ isEs = false } = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const stats = getNormaHellasProcurementStats();

  doc.setProperties({
    title: isEs
      ? 'Conciliación Oficial de Importaciones · Norma Hellas / Magenta'
      : 'Official Procurement Reconciliation · Norma Hellas / Magenta',
    subject: 'Testosterone Enanthate 250mg/mL Import Orders 1-7 Statement',
    author: 'Atlas Health Services / Mediluxe Health Solutions FZE',
    keywords: 'Norma Hellas, Magenta Pharma, Testosterone Enanthate, UAE MOH, Import Control',
    creator: 'Atlas Health Verified Document Engine'
  });

  // Header Banner
  const headerH = 26;
  doc.setFillColor(0, 54, 102); // Navy #003666
  doc.rect(0, 0, pageWidth, headerH, 'F');
  doc.setFillColor(26, 115, 232); // Blue Accent
  doc.rect(0, headerH, pageWidth, 1.2, 'F');

  doc.setTextColor(186, 230, 253);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ATLAS HEALTH SERVICES · B2B PROCUREMENT & RECONCILIATION CORRIDOR', 12, 7.5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11.5);
  doc.text(
    isEs
      ? 'Conciliación Oficial de Importaciones: Norma Hellas ➔ Magenta Pharma'
      : 'Official Procurement Statement: Norma Hellas ➔ Magenta Pharma',
    12,
    14.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  doc.text(
    isEs
      ? 'Producto: Testosterone Enanthate / Norma 250mg/mL (Ampollas 1 mL) · Historial Órdenes 1 al 7'
      : 'Product: Testosterone Enanthate / Norma 250mg/mL (1 mL Ampoules) · Historical Orders 1 to 7',
    12,
    20.5
  );

  // Meta Info Box (Buyer & Supplier Details)
  let y = headerH + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(218, 220, 224);
  doc.roundedRect(12, y, pageWidth - 24, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 54, 102);
  doc.text(isEs ? 'RECEPTOR / CLIENTE:' : 'CONSIGNEE / CLIENT:', 15, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(NORMA_HELLAS_METADATA.buyer.name, 15, y + 9.5);
  doc.text(`TRN: ${NORMA_HELLAS_METADATA.buyer.trn} · ${NORMA_HELLAS_METADATA.buyer.facility}`, 15, y + 13.5);
  doc.text(NORMA_HELLAS_METADATA.buyer.address, 15, y + 17.5);

  const midX = pageWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 54, 102);
  doc.text(isEs ? 'PROVEEDOR & GESTOR LOGÍSTICO:' : 'SUPPLIER & CORRIDOR AGENT:', midX, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`Supplier: ${NORMA_HELLAS_METADATA.supplierName} (${NORMA_HELLAS_METADATA.supplierAddress})`, midX, y + 9.5);
  doc.text(`Manufacturer: ${NORMA_HELLAS_METADATA.manufacturer}`, midX, y + 13.5);
  doc.text(`Fulfillment: ${NORMA_HELLAS_METADATA.importerCorridor.name} (TRN: ${NORMA_HELLAS_METADATA.importerCorridor.trn})`, midX, y + 17.5);

  // 4 KPI Summary Cards
  y += 28;
  const cardW = (pageWidth - 24 - 9) / 4;
  const kpis = [
    { label: isEs ? 'Total Ampollas' : 'Total Ampoules', val: `${stats.totalUnits.toLocaleString()} uds`, sub: '5.000 fulfilled' },
    { label: isEs ? 'Inversión Total' : 'Total Procurement', val: `€${stats.totalEur.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: '€4.99 unit price' },
    { label: isEs ? 'Lotes Suministrados' : 'Active Batch Lots', val: `${stats.activeBatchesCount} Lotes`, sub: 'G3WT1E, F8XG1A, G4BJ1A' },
    { label: isEs ? 'Último Pedido' : 'Active Order', val: `${stats.pendingUnits.toLocaleString()} uds`, sub: 'PO PRX00035 (In Transit)' }
  ];

  kpis.forEach((kpi, idx) => {
    const cx = 12 + idx * (cardW + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardW, 14, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), cx + 3, y + 4.2);
    doc.setFontSize(8.5);
    doc.setTextColor(0, 54, 102);
    doc.text(kpi.val, cx + 3, y + 8.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, cx + 3, y + 12.2);
  });

  // Table of 7 Imports
  y += 18;
  const tableData = NORMA_HELLAS_IMPORTS.map((imp) => [
    `#${imp.importNumber}`,
    imp.poNumber,
    imp.poDate,
    imp.deliveryDate,
    `${imp.quantity.toLocaleString()} pcs`,
    `€${imp.unitPriceEur.toFixed(2)}`,
    `€${imp.totalEur.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    imp.batchNumber,
    imp.status === 'delivered' ? (isEs ? 'Entregado' : 'Delivered') : (isEs ? 'En trámite' : 'In Transit')
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      '#',
      isEs ? 'Código PO / Ref.' : 'PO / Ref Code',
      isEs ? 'Fecha PO' : 'PO Date',
      isEs ? 'Entrega' : 'Delivery',
      isEs ? 'Cantidad' : 'Quantity',
      isEs ? 'Precio Unit.' : 'Unit Price',
      isEs ? 'Total (EUR)' : 'Total (EUR)',
      isEs ? 'Lote (Batch)' : 'Batch Lot',
      isEs ? 'Estado' : 'Status'
    ]],
    body: tableData,
    margin: { left: 12, right: 12 },
    theme: 'grid',
    styles: {
      fontSize: 6.8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [0, 54, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { halign: 'right', cellWidth: 18, fontStyle: 'bold' },
      5: { halign: 'right', cellWidth: 16 },
      6: { halign: 'right', cellWidth: 20, fontStyle: 'bold', textColor: [21, 128, 61] },
      7: { cellWidth: 28 },
      8: { halign: 'center', cellWidth: 18 }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    isEs
      ? '* Documento oficial generado automáticamente por el sistema de conciliación de compras Atlas Health. Los 7 pedidos cuentan con permiso de Import Control visado por el Ministerio de Salud (MOH) de EAU.'
      : '* Official statement generated automatically by Atlas Health B2B Procurement Engine. All 7 imports operate under approved UAE Ministry of Health (MOH) semi-controlled substance import permits.',
    12,
    finalY
  );

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Atlas Health Services · https://www.atlashealth-services.com/b2b/procurement/magenta', 12, pageHeight - 7);
  doc.text(`Generated: ${new Date().toLocaleDateString()} · Page 1 of 1`, pageWidth - 12, pageHeight - 7, { align: 'right' });

  return doc.output('blob');
}
