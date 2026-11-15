import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a real A4 PDF Blob for any price schedule / catalog table
 * so it can be previewed in DocumentPreviewModal before printing or downloading.
 */
export function buildSchedulePdfBlob({
  title = 'ATLAS HEALTH SERVICES — PRICE SCHEDULE',
  subtitle = '',
  metaLine = '',
  head = [],
  body = [],
  orientation = 'portrait',
}) {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = new Date().toISOString().slice(0, 10);

  // Header band
  doc.setFillColor(0, 54, 102); // #003666
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(String(title).slice(0, 85), 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const sub = [subtitle, `Issued: ${dateStr}`].filter(Boolean).join('  ·  ');
  doc.text(sub.slice(0, 110), 14, 18);

  if (metaLine) {
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.text(String(metaLine).slice(0, 120), 14, 33);
  }

  autoTable(doc, {
    startY: metaLine ? 38 : 32,
    head: [head],
    body,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 54, 102],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  return doc.output('blob');
}
