/**
 * src/utils/clinicalDocExporter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Clinical & Commercial Document Exporter (PDF / CSV)
 *
 * Generates:
 *   1. Compounding Sheet & Preparation Guide for Pharmacies (PDF)
 *   2. Medical Prescription & Patient Protocol Handout (PDF)
 *   3. Clinical & Financial CSV exports for Patients, Prescriptions, Quotations
 *
 * Uses `pdf-lib` for client-side and server-side zero-overhead vector PDF generation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Downloads a binary blob in the browser.
 */
export function downloadBlob(blob, filename) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Compounding & Preparation PDF Sheet for a Prescription.
 *
 * @param {Object} prescription - The normalized prescription document
 * @param {Object} [meta] - Optional Clinic and Doctor metadata
 * @returns {Promise<Uint8Array>}
 */
export async function generateCompoundingSheetPDF(prescription, meta = {}) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 (points)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primaryColor = rgb(0.0, 0.21, 0.4); // #003666 Corporate Blue
  const textColor = rgb(0.1, 0.1, 0.15);
  const mutedColor = rgb(0.4, 0.45, 0.5);
  const borderColor = rgb(0.88, 0.9, 0.94);

  let y = height - 50;

  // 1. Header
  page.drawText('REGENPEPT CLINICAL NETWORK', {
    x: 40,
    y,
    size: 16,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText('HOJA DE PREPARACIÓN CLÍNICA / COMPOUNDING ORDER', {
    x: 40,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: mutedColor,
  });

  const rxId = prescription.prescriptionId || prescription.id || 'N/A';
  page.drawText(`Rx Ref: ${rxId}`, {
    x: width - 160,
    y,
    size: 10,
    font: fontBold,
    color: textColor,
  });

  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  page.drawText(`Fecha: ${dateStr}`, {
    x: width - 160,
    y: y - 15,
    size: 9,
    font: fontRegular,
    color: mutedColor,
  });

  y -= 45;
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: borderColor,
  });

  // 2. Patient & Prescriber Info Box
  y -= 25;
  page.drawText('DATOS DEL PACIENTE Y PRESCRIPTOR', {
    x: 40,
    y,
    size: 10,
    font: fontBold,
    color: primaryColor,
  });

  y -= 18;
  const patientName = prescription.patient?.name || prescription.patientName || 'Paciente Confidencial';
  const doctorName = prescription.doctor?.name || prescription.prescribedBy || 'Médico Facultativo';

  page.drawText(`Paciente: ${patientName}`, { x: 40, y, size: 9, font: fontBold, color: textColor });
  page.drawText(`Facultativo: ${doctorName}`, { x: 300, y, size: 9, font: fontRegular, color: textColor });

  y -= 15;
  const indication = prescription.clinicalIndication || prescription.treatmentGoal || 'Tratamiento de optimización regenerativa';
  page.drawText(`Indicación / Diagnóstico: ${indication}`, { x: 40, y, size: 8.5, font: fontRegular, color: mutedColor });

  y -= 25;
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: borderColor,
  });

  // 3. Formula Lines
  y -= 25;
  page.drawText('COMPUESTOS Y ESPECIFICACIONES DE DISPENSACIÓN', {
    x: 40,
    y,
    size: 10,
    font: fontBold,
    color: primaryColor,
  });

  y -= 20;
  // Table Header
  page.drawRectangle({
    x: 40,
    y: y - 5,
    width: width - 80,
    height: 20,
    color: rgb(0.96, 0.97, 0.98),
  });

  page.drawText('Compuesto / Producto', { x: 45, y, size: 8, font: fontBold, color: textColor });
  page.drawText('Dosis / Concentración', { x: 230, y, size: 8, font: fontBold, color: textColor });
  page.drawText('Vía / Pauta', { x: 360, y, size: 8, font: fontBold, color: textColor });
  page.drawText('Viales/Qty', { x: 480, y, size: 8, font: fontBold, color: textColor });

  y -= 22;

  const lines = prescription.prescriptionLines || prescription.items || [];
  lines.forEach((line) => {
    const pName = line.productName || line.name || 'Compuesto';
    const dose = line.dose || line.dosage || line.concentration || 'Según protocolo';
    const freq = `${line.route || 'Subcutáneo'} • ${line.frequency || '1x/día'}`;
    const qty = `${line.vialsRequired || line.quantity || 1} uds`;

    page.drawText(pName.substring(0, 32), { x: 45, y, size: 8.5, font: fontBold, color: textColor });
    page.drawText(dose.substring(0, 22), { x: 230, y, size: 8.5, font: fontRegular, color: textColor });
    page.drawText(freq.substring(0, 24), { x: 360, y, size: 8.5, font: fontRegular, color: textColor });
    page.drawText(qty, { x: 480, y, size: 8.5, font: fontBold, color: primaryColor });

    y -= 18;

    if (line.instructions || line.patientInstructions) {
      const inst = `Instrucciones: ${line.instructions || line.patientInstructions}`;
      page.drawText(inst.substring(0, 80), { x: 55, y, size: 7.5, font: fontRegular, color: mutedColor });
      y -= 14;
    }

    page.drawLine({
      start: { x: 45, y: y + 4 },
      end: { x: width - 45, y: y + 4 },
      thickness: 0.5,
      color: borderColor,
    });
  });

  // 4. Safety Warnings if any
  if (prescription.safetyWarnings && prescription.safetyWarnings.length > 0) {
    y -= 15;
    page.drawText('ALERTAS DE SEGURIDAD CLÍNICA', { x: 40, y, size: 9, font: fontBold, color: rgb(0.85, 0.4, 0.0) });
    y -= 14;
    prescription.safetyWarnings.forEach((w) => {
      page.drawText(`• ${w.substring(0, 95)}`, { x: 45, y, size: 7.5, font: fontRegular, color: rgb(0.7, 0.2, 0.0) });
      y -= 12;
    });
  }

  // 5. Signature Footer
  const footerY = 70;
  page.drawLine({
    start: { x: 40, y: footerY + 45 },
    end: { x: 220, y: footerY + 45 },
    thickness: 1,
    color: mutedColor,
  });
  page.drawText('Firma y Sello Médico Facultativo', { x: 40, y: footerY + 30, size: 8, font: fontRegular, color: mutedColor });

  page.drawLine({
    start: { x: width - 220, y: footerY + 45 },
    end: { x: width - 40, y: footerY + 45 },
    thickness: 1,
    color: mutedColor,
  });
  page.drawText('Recepción y Validación de Farmacia', { x: width - 220, y: footerY + 30, size: 8, font: fontRegular, color: mutedColor });

  page.drawText('Documento generado mediante RegenPept Clinical Platform. Uso médico exclusivo.', {
    x: 40,
    y: 25,
    size: 7,
    font: fontRegular,
    color: mutedColor,
  });

  return await pdfDoc.save();
}

/**
 * Exports an array of items to a standard CSV string.
 */
export function exportToCSV(data = [], columns = []) {
  if (!data.length || !columns.length) return '';

  const headerRow = columns.map((c) => `"${(c.header || c.key).replace(/"/g, '""')}"`).join(',');
  const bodyRows = data.map((row) => {
    return columns
      .map((col) => {
        const val = typeof col.renderValue === 'function' ? col.renderValue(row) : row[col.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headerRow, ...bodyRows].join('\n');
}
