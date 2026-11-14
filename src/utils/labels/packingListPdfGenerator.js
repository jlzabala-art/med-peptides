/**
 * packingListPdfGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates an EU GMP Batch Picking & Verification Packing List PDF for
 * compounding pharmacy operators using jsPDF + jspdf-autotable.
 */

export async function generatePackingListPdf(patientQueue = [], options = {}) {
  if (!Array.isArray(patientQueue) || patientQueue.length === 0) {
    throw new Error('No patients in batch queue');
  }

  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  const isEs = Boolean(options.isEs);
  const operatorName = options.operatorName || 'Pharmacy Staff';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

  doc.setFontSize(14);
  doc.setTextColor(0, 54, 102);
  doc.text(
    isEs ? 'PHARMAPOLIS · Hoja de Picking y Verificación de Lote' : 'PHARMAPOLIS · Batch Picking & Verification List',
    14,
    16
  );

  doc.setFontSize(9);
  doc.setTextColor(90, 99, 110);
  doc.text(
    `${isEs ? 'Generado' : 'Generated'}: ${nowStr}   |   ${isEs ? 'Operador' : 'Operator'}: ${operatorName}   |   ${isEs ? 'Pacientes' : 'Patients'}: ${patientQueue.length}`,
    14,
    22
  );

  const rows = [];
  let rowIndex = 1;

  for (const pItem of patientQueue) {
    const rx = pItem.rx || {};
    const pName = rx.patient?.name || rx.patientName || 'Patient';
    const rxCode = rx.fileNumber || rx.code || pItem.code || '';
    const labels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
    const selectedIdx = pItem.selectedPartIndex;
    const indices = (selectedIdx != null && selectedIdx !== 'all' && labels[selectedIdx])
      ? [Number(selectedIdx)]
      : labels.map((_, i) => i);

    for (const idx of indices) {
      const lbl = labels[idx] || {};
      const partName = lbl.productName || lbl.title || lbl.formulaName || `Part ${idx + 1}`;
      const dims = `${lbl.widthMm || pItem.widthMm || 75}×${lbl.heightMm || pItem.heightMm || 45} mm`;
      const batchBud = [lbl.batchNumber || lbl.lotNumber || '—', lbl.expiryDate || lbl.bud || '—'].join(' / ');
      const status = (rx.status === 'approved' || rx.isSigned) ? (isEs ? 'Aprobada' : 'Approved') : (isEs ? 'Pendiente' : 'Pending');

      rows.push([
        String(rowIndex++),
        pName,
        `#${rxCode}`,
        `P${idx + 1}/${labels.length}: ${partName}`,
        dims,
        batchBud,
        status,
        '[   ]'
      ]);
    }
  }

  autoTable(doc, {
    startY: 27,
    head: [[
      '#',
      isEs ? 'Paciente' : 'Patient',
      'RX',
      isEs ? 'Parte / Fórmula' : 'Part / Formula',
      isEs ? 'Formato' : 'Size',
      'Batch / BUD',
      isEs ? 'Estado' : 'Status',
      isEs ? 'Verif.' : 'Check'
    ]],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: [0, 54, 102], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8 },
      2: { cellWidth: 22, fontStyle: 'bold' },
      4: { cellWidth: 20 },
      7: { cellWidth: 14, halign: 'center' }
    }
  });

  const dateTag = new Date().toISOString().slice(0, 10);
  doc.save(`Pharmapolis-Packing-List-${dateTag}.pdf`);
}
