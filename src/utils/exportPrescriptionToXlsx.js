import * as XLSX from 'xlsx';

/**
 * exportPrescriptionToXlsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates and downloads a multi-sheet, clinical-grade Excel workbook (.xlsx)
 * representing an official medical prescription, including multi-formulation
 * Fagron Genomics reports and multi-item peptide protocols.
 * 
 * Sheets:
 *  1. Medical Dossier & Summary (Patient, Physician, Clinical Diagnosis, Regimen)
 *  2. Prescribed Products & Magistral Formulations (Itemized products, doses, posologies)
 *  3. Genomic Biomarkers (Optional: SULT1A1, AR, CYP19A1 variants if Fagron report)
 * 
 * @param {Object} rx - Canonical prescription object
 * @param {Object} options - Optional customization flags { filename, lang }
 */
export function exportPrescriptionToXlsx(rx, options = {}) {
  if (!rx) {
    console.warn('[exportPrescriptionToXlsx] No prescription object provided');
    return false;
  }

  const lang = options.lang || 'en';
  const isEs = lang === 'es';
  const rxId = rx.prescriptionNumber || rx.code || rx.id || 'RX-PRESCRIPTION';
  const exportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const patient = rx.patient || {};
  const patientName = patient.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
  const doctor = rx.doctor || {};
  const doctorName = doctor.name || rx.doctorName || 'Prescribing Physician';
  const clinicName = doctor.clinic || rx.clinicName || (isEs ? 'Centro Médico & Farmacia Magistral' : 'Licensed Clinical Practice');

  const rawLines = rx.prescriptionLines || rx.items || rx.compounds || [];
  const fagron = rx.fagron || {};
  const biomarkers = fagron.geneticBiomarkers || [];

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Medical Dossier & Summary ───────────────────────────────────────
  const summaryRows = [
    [isEs ? 'REGENPEPT & ATLAS CLINICAL — DOSSIER MÉDICO OFICIAL DE PRESCRIPCIÓN' : 'REGENPEPT & ATLAS CLINICAL — OFFICIAL MEDICAL PRESCRIPTION DOSSIER', ''],
    [isEs ? 'Referencia Oficial' : 'Prescription Reference', rxId],
    [isEs ? 'Fecha de Emisión' : 'Date of Issue', exportDate],
    [isEs ? 'Estado de Validación' : 'Clinical Status', (rx.status || 'approved').toUpperCase()],
    [isEs ? 'Origen / Tipo de Documento' : 'Document Type', rx.treatmentType || (isEs ? 'Fórmula Magistral Personalizada' : 'Custom Compounded Formula')],
    ['', ''],
    [isEs ? '── DATOS DEL PACIENTE ──' : '── PATIENT INFORMATION ──', ''],
    [isEs ? 'Nombre Completo' : 'Full Name', patientName],
    [isEs ? 'F. Nacimiento (DOB)' : 'Date of Birth (DOB)', patient.dob || '—'],
    [isEs ? 'Género' : 'Gender', patient.gender || '—'],
    [isEs ? 'Documento de Identidad / Pasaporte' : 'ID / Passport Number', patient.idNumber || '—'],
    [isEs ? 'Teléfono de Contacto' : 'Phone Number', patient.phone || rx.patientPhone || '—'],
    [isEs ? 'Correo Electrónico' : 'Email Address', patient.email || rx.patientEmail || '—'],
    [isEs ? 'Dirección' : 'Residential Address', patient.address || '—'],
    ['', ''],
    [isEs ? '── DATOS DEL MÉDICO PRESCRIPTOR ──' : '── PRESCRIBING PHYSICIAN ──', ''],
    [isEs ? 'Médico Colegiado' : 'Physician Name', doctorName],
    [isEs ? 'Nº de Colegiado / Licencia Médica' : 'Medical License / DHA / DEA', doctor.license || doctor.licenseNumber || rx.doctorLicense || '—'],
    [isEs ? 'Clínica / Centro Médico' : 'Clinic / Hospital', clinicName],
    [isEs ? 'Especialidad' : 'Medical Specialty', doctor.specialty || rx.doctorTitle || '—'],
    [isEs ? 'Dirección de Consulta' : 'Clinic Address', doctor.address || rx.doctorOfficeAddress || '—'],
    [isEs ? 'Contacto Clínico' : 'Doctor Contact', doctor.phone || doctor.email || '—'],
    ['', ''],
    [isEs ? '── INDICACIÓN CLÍNICA & EVALUACIÓN ──' : '── CLINICAL INDICATION & ASSESSMENT ──', ''],
    [isEs ? 'Diagnóstico / Indicación' : 'Clinical Diagnosis', rx.diagnosis || '—'],
    [isEs ? 'Programa Terapéutico' : 'Therapeutic Program', rx.treatmentProgram || fagron.testName || 'Clinical Prescription'],
    ...(fagron.boxId ? [[isEs ? 'ID Muestra Fagron (Box ID)' : 'Fagron Sample Box ID', fagron.boxId]] : []),
    [isEs ? 'Volumen / Presentación Total' : 'Total Volume / Presentation', rx.volume || '—'],
    [isEs ? 'Duración Estimada' : 'Treatment Duration', rx.duration || '30 days'],
    [isEs ? 'Total Productos / Principios Activos' : 'Total Active Items', rawLines.length],
    ['', ''],
    [isEs ? '── PAUTA GENERAL DE POSOLOGÍA & NOTAS ──' : '── POSOLOGY REGIMEN & CLINICAL INSTRUCTIONS ──', ''],
    [isEs ? 'Instrucciones de Uso' : 'Posology Regimen', rx.posology || rx.clinicalNotes || (isEs ? 'Según prescripción médica facultativa.' : 'As directed by prescribing physician.')],
    ['', ''],
    [isEs ? 'Verificación Oficial Digital' : 'Digital Verification URL', `https://med-peptides.com/rx/${rxId}`],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 34 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, isEs ? 'Resumen Clínico' : 'Medical Summary');

  // ── Sheet 2: Prescribed Products & Compounded Items ─────────────────────────
  const linesHeaders = [
    '#',
    isEs ? 'Formulación / Bloque' : 'Formulation Block',
    isEs ? 'Producto / Principio Activo' : 'Product / Active Ingredient (API)',
    isEs ? 'Molécula Activa' : 'Active Molecule',
    isEs ? 'Concentración / Dosis' : 'Strength / Dose',
    isEs ? 'Cantidad' : 'Quantity',
    isEs ? 'Forma Farmacéutica' : 'Dosage Form',
    isEs ? 'Vía de Administración' : 'Route',
    isEs ? 'Frecuencia' : 'Frequency',
    isEs ? 'Duración' : 'Duration',
    isEs ? 'Tipo / Rol' : 'Component Role',
    isEs ? 'Instrucciones Específicas / Posología' : 'Specific Posology Instructions',
    isEs ? 'Racional Genómico / Clínico' : 'Genomic / Clinical Rationale',
    isEs ? 'ID Catálogo' : 'Catalog Product ID'
  ];

  const linesRows = rawLines.map((line, idx) => {
    const isVehicle = Boolean(
      line.isVehicleOrBase ||
      line._isVehicleOrBase ||
      line.isVehicle ||
      line.dosageForm?.toLowerCase().includes('vehicle') ||
      (line.productName || line.name || '').toLowerCase().includes('trichosol') ||
      (line.productName || line.name || '').toLowerCase().includes('trichooil') ||
      (line.productName || line.name || '').toLowerCase().includes('pentravan')
    );

    const blockName = line.formulationBlock || rx.treatmentType || (isEs ? 'Fórmula Principal' : 'Primary Formulation');
    const name = line.productName || line.name || line.activeIngredient || (isEs ? `Producto ${idx + 1}` : `Item ${idx + 1}`);
    const molecule = line.activeIngredient || line.name || '';
    const dose = line.dosage || line.dose || line.strength || line.concentration || '—';
    const qty = line.quantity || 1;
    const form = line.dosageForm || (isVehicle ? 'Vehículo Liposomal' : 'Principio Activo');
    const route = line.route || (form.includes('Topical') ? 'Topical' : (form.includes('Injectable') ? 'Subcutaneous' : 'Oral'));
    const freq = line.frequency || (form.includes('Topical') ? (isEs ? 'Una vez al día (Noche)' : 'Once daily (Night)') : 'As directed');
    const duration = line.duration || rx.duration || '30 days';
    const role = isVehicle
      ? (isEs ? 'Vehículo Magistral Liposomal' : 'Liposomal Compounding Vehicle')
      : (isEs ? 'Principio Activo' : 'Active Pharmaceutical Ingredient');
    const instructions = line.patientInstructions || line.instructions || rx.posology || '';
    const rationale = line.rationale || (rx.treatmentProgram ? `Program: ${rx.treatmentProgram}` : '');
    const catalogId = line.productId || '';

    return [
      idx + 1,
      blockName,
      name,
      molecule,
      dose,
      qty,
      form,
      route,
      freq,
      duration,
      role,
      instructions,
      rationale,
      catalogId
    ];
  });

  const wsLines = XLSX.utils.aoa_to_sheet([linesHeaders, ...linesRows]);
  wsLines['!cols'] = [
    { wch: 5 },   // #
    { wch: 28 },  // Formulation Block
    { wch: 32 },  // Product Name
    { wch: 26 },  // Active Molecule
    { wch: 22 },  // Strength / Dose
    { wch: 10 },  // Quantity
    { wch: 22 },  // Dosage Form
    { wch: 16 },  // Route
    { wch: 24 },  // Frequency
    { wch: 16 },  // Duration
    { wch: 26 },  // Component Role
    { wch: 45 },  // Posology
    { wch: 32 },  // Rationale
    { wch: 20 },  // Catalog ID
  ];
  XLSX.utils.book_append_sheet(wb, wsLines, isEs ? 'Productos & Fórmulas' : 'Prescribed Products');

  // ── Sheet 3: Genomic Biomarkers (Fagron Genomics Reports) ───────────────────
  if (Array.isArray(biomarkers) && biomarkers.length > 0) {
    const bioHeaders = [
      isEs ? 'Gen / Biomarcador' : 'Gene Symbol',
      isEs ? 'Variante / Polimorfismo' : 'Variant / Genotype',
      isEs ? 'Interpretación Clínica & Sensibilidad' : 'Clinical Interpretation & Sensitivity'
    ];
    const bioRows = biomarkers.map(b => [
      b.gene || '—',
      b.variant || '—',
      b.interpretation || b.description || '—'
    ]);
    const wsBio = XLSX.utils.aoa_to_sheet([bioHeaders, ...bioRows]);
    wsBio['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 65 }];
    XLSX.utils.book_append_sheet(wb, wsBio, isEs ? 'Biomarcadores Genéticos' : 'Genomic Biomarkers');
  }

  // ── Generate & Download .xlsx File ──────────────────────────────────────────
  const finalFilename = options.filename || `${rxId}_Prescription_Atlas.xlsx`;
  XLSX.writeFile(wb, finalFilename);

  return {
    success: true,
    filename: finalFilename,
    itemCount: rawLines.length
  };
}

/**
 * exportBatchPrescriptionsToXlsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates and downloads a consolidated Excel workbook containing all prescriptions
 * in a batch (up to 3 or more), with a Master Index and combined formulation rows.
 * 
 * @param {Array<Object>} rxList - Array of canonical prescription objects
 * @param {Object} options - Customization flags { filename, lang }
 */
export function exportBatchPrescriptionsToXlsx(rxList = [], options = {}) {
  if (!Array.isArray(rxList) || rxList.length === 0) {
    console.warn('[exportBatchPrescriptionsToXlsx] Empty prescription list provided');
    return false;
  }

  const lang = options.lang || 'en';
  const isEs = lang === 'es';
  const exportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Master Batch Summary ─────────────────────────────────────────
  const masterHeaders = [
    '#',
    isEs ? 'Código / Referencia' : 'Prescription Ref',
    isEs ? 'Paciente' : 'Patient Name',
    isEs ? 'Médico Prescriptor' : 'Prescribing Doctor',
    isEs ? 'Tipo de Fórmula / Tratamiento' : 'Treatment / Formula Type',
    isEs ? 'Nº Fórmulas / Líneas' : 'Total Items',
    isEs ? 'Estado' : 'Status',
    isEs ? 'Fecha de Emisión' : 'Date',
    isEs ? 'Enlace Oficial de Verificación' : 'Official Verification Link'
  ];

  const masterRows = rxList.map((rx, idx) => {
    const rxId = rx.prescriptionNumber || rx.code || rx.id || `RX-${idx + 1}`;
    const patientName = rx.patient?.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
    const doctorName = rx.treatingDoctor?.name || rx.doctor?.name || rx.doctorName || 'Physician';
    const treatmentType = rx.treatmentType || rx.formulaName || (isEs ? 'Fórmula Magistral' : 'Compounded Formula');
    const lines = rx.prescriptionLines || rx.items || rx.compounds || [];
    const dateStr = rx.prescriptionDate || rx.createdAt?.slice(0, 10) || exportDate;
    const url = `https://med-peptides.com/rx/${rxId}`;

    return [
      idx + 1,
      rxId,
      patientName,
      doctorName,
      treatmentType,
      lines.length,
      (rx.status || 'approved').toUpperCase(),
      dateStr,
      url
    ];
  });

  const wsMaster = XLSX.utils.aoa_to_sheet([
    [isEs ? 'REGENPEPT & ATLAS CLINICAL — RESUMEN DE LOTE DE PRESCRIPCIONES' : 'REGENPEPT & ATLAS CLINICAL — BATCH PRESCRIPTION SUMMARY', ''],
    [isEs ? 'Fecha de Exportación' : 'Export Date', exportDate],
    [isEs ? 'Total Prescripciones en Lote' : 'Total Prescriptions in Batch', rxList.length],
    ['', ''],
    masterHeaders,
    ...masterRows
  ]);
  wsMaster['!cols'] = [
    { wch: 5 },   // #
    { wch: 22 },  // Code
    { wch: 28 },  // Patient
    { wch: 28 },  // Doctor
    { wch: 32 },  // Treatment
    { wch: 14 },  // Items
    { wch: 14 },  // Status
    { wch: 16 },  // Date
    { wch: 45 },  // URL
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, isEs ? 'Resumen Lote' : 'Batch Summary');

  // ── Sheet 2: Consolidated Formulations ─────────────────────────────────────
  const allLinesHeaders = [
    isEs ? 'Ref. Receta' : 'Prescription Ref',
    isEs ? 'Paciente' : 'Patient',
    '#',
    isEs ? 'Formulación / Bloque' : 'Formulation Block',
    isEs ? 'Producto / Principio Activo' : 'Product / Active Ingredient (API)',
    isEs ? 'Concentración / Dosis' : 'Strength / Dose',
    isEs ? 'Cantidad' : 'Quantity',
    isEs ? 'Forma Farmacéutica' : 'Dosage Form',
    isEs ? 'Vía' : 'Route',
    isEs ? 'Frecuencia' : 'Frequency',
    isEs ? 'Duración' : 'Duration',
    isEs ? 'Posología / Instrucciones' : 'Posology / Instructions',
    isEs ? 'Racional Clínico' : 'Clinical Rationale'
  ];

  const allLinesRows = [];
  rxList.forEach((rx) => {
    const rxId = rx.prescriptionNumber || rx.code || rx.id || 'RX';
    const pName = rx.patient?.name || rx.patientName || 'Patient';
    const lines = rx.prescriptionLines || rx.items || rx.compounds || [];

    lines.forEach((line, lineIdx) => {
      allLinesRows.push([
        rxId,
        pName,
        lineIdx + 1,
        line.formulationBlock || rx.treatmentType || 'Primary Formulation',
        line.productName || line.name || line.activeIngredient || `Item ${lineIdx + 1}`,
        line.dosage || line.dose || line.strength || line.concentration || '—',
        line.quantity || 1,
        line.dosageForm || 'Topical/Solution',
        line.route || 'Topical',
        line.frequency || 'Once daily',
        line.duration || rx.duration || '30 days',
        line.patientInstructions || line.instructions || rx.posology || '',
        line.rationale || ''
      ]);
    });
  });

  const wsAllLines = XLSX.utils.aoa_to_sheet([allLinesHeaders, ...allLinesRows]);
  wsAllLines['!cols'] = [
    { wch: 20 },
    { wch: 24 },
    { wch: 5 },
    { wch: 24 },
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 40 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAllLines, isEs ? 'Fórmulas Consolidadas' : 'All Prescribed Formulas');

  const finalFilename = options.filename || `Batch_Prescriptions_Atlas_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, finalFilename);

  return {
    success: true,
    filename: finalFilename,
    batchCount: rxList.length,
    itemCount: allLinesRows.length
  };
}

