import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Ensure directory exists
const outputDir = path.resolve(process.cwd(), 'public/docs/trichotest');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPathEs = path.join(outputDir, 'Atlas-TrichoTest-Hair-Treatments-Dossier-ES.pdf');
const outputPathEn = path.join(outputDir, 'Atlas-TrichoTest-Hair-Treatments-Dossier-EN.pdf');

// Palette
const NAVY = [0, 54, 102];        // #003666
const TEAL = [13, 148, 136];      // #0d9488
const SLATE_DARK = [15, 23, 42];   // #0f172a
const SLATE_MUTED = [100, 116, 139]; // #64748b
const LIGHT_BG = [248, 250, 252]; // #f8fafc
const BORDER_COLOR = [226, 232, 240]; // #e2e8f0
const WHITE = [255, 255, 255];
const BLUE_ACCENT = [37, 99, 235]; // #2563eb

function buildDossierPdf(isEs = true) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Helper for footer
  function drawPageFooter(pageNum, totalPages) {
    const y = pageHeight - 8;
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_MUTED);

    const leftText = isEs 
      ? 'Atlas Clinical Healthcare Services · Departamento de Tricología Médica & Farmacogenómica'
      : 'Atlas Clinical Healthcare Services · Medical Trichology & Pharmacogenomics Dept.';
    doc.text(leftText, margin, y);

    const centerText = isEs ? 'Uso Exclusivo Profesional y Paciente' : 'For Clinical & Patient Guidance';
    doc.text(centerText, pageWidth / 2, y, { align: 'center' });

    doc.text(`${pageNum} / ${totalPages}`, pageWidth - margin, y, { align: 'right' });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PÁGINA 1: PORTADA & MARCO TERAPÉUTICO TRICHOTEST
  // ───────────────────────────────────────────────────────────────────────────
  
  // Top Banner Strip
  doc.setFillColor(...NAVY);
  doc.rect(margin, 12, contentWidth, 4, 'F');

  // Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  const eyebrow = isEs
    ? 'DOSSIER CLÍNICO OFICIAL · MEDICINA CAPILAR DE PRECISIÓN'
    : 'OFFICIAL CLINICAL DOSSIER · PRECISION CAPILLARY MEDICINE';
  doc.text(eyebrow, margin, 22);

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  const mainTitle = isEs
    ? 'Colección de Tratamientos Basados en TrichoTest™'
    : 'TrichoTest™-Guided Hair Treatments Collection';
  doc.text(mainTitle, margin, 30);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...SLATE_DARK);
  const subTitle = isEs
    ? 'Ecosistema Multimodal Integrado: Fórmulas Magistrales en TrichoSol™, Péptidos Biorreguladores y Nutracéuticos'
    : 'Integrated Multimodal Ecosystem: TrichoSol™ Compounded Formulations, Follicular Peptides & Nutriceuticals';
  doc.text(subTitle, margin, 36);

  // Meta Badges Bar
  let bY = 41;
  const badges = isEs ? [
    'ADN: 48 SNPs / 13 Genes',
    'Vehículo Patentado TrichoSol™',
    'Lotusland GHK-Cu 50 mg',
    'Colway® Baicapil™ 2%',
    'HTMA ICP-MS/MS'
  ] : [
    'DNA: 48 SNPs / 13 Genes',
    'Patented TrichoSol™ Vehicle',
    'Lotusland GHK-Cu 50 mg',
    'Colway® Baicapil™ 2%',
    'HTMA ICP-MS/MS'
  ];

  let bX = margin;
  badges.forEach((b) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const tw = doc.getTextWidth(b);
    const boxW = tw + 7;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(bX, bY, boxW, 5.5, 1, 1, 'FD');
    doc.setTextColor(...NAVY);
    doc.text(b, bX + 3.5, bY + 4);
    bX += boxW + 3;
  });

  // Box 1: Fundamento Científico TrichoTest
  let curY = 51;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, curY, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  const fundTitle = isEs 
    ? '1. Fundamento Genético y Racional Clínico de TrichoTest™' 
    : '1. Genetic Foundation and Clinical Rationale of TrichoTest™';
  doc.text(fundTitle, margin + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE_DARK);
  const fundBody = isEs
    ? 'El test genético Fagron Genomics TrichoTest™ analiza mediante microarray de ADN y qPCR 48 variaciones genéticas (SNPs) en 13 genes implicados en la fisiopatología de la alopecia (vías de prostaglandinas PTGFR/PTGIR, 5α-reductasa SRD5A1/SRD5A2, sulfotransferasa folicular SULT1A1, receptores androgénicos AR, óxido nítrico NOS3 e inflamación perifolicular CRTH2/PTGDR2).\n\nTradicionalmente, el tratamiento de la alopecia se abordaba con monoterapia genérica. Sin embargo, la evidencia demuestra que los pacientes con baja actividad SULT1A1 no metabolizan el Minoxidil tópico convencional, y aquellos con polimorfismos en PTGFR requieren análogos de prostaglandinas específicos. Esta colección traslada el resultado genético del paciente a un tratamiento galénico personalizado y sinérgico.'
    : 'Fagron Genomics TrichoTest™ analyzes 48 single nucleotide polymorphisms (SNPs) across 13 genes governing hair follicle metabolism via DNA microarray and qPCR (PTGFR/PTGIR prostaglandin receptors, 5α-reductase SRD5A1/SRD5A2, follicular sulfotransferase SULT1A1, androgen receptor AR, nitric oxide synthase NOS3, and perifollicular inflammation CRTH2/PTGDR2).\n\nStandard single-drug therapies often fail because patients with low SULT1A1 activity cannot sulfoconjugate Minoxidil, while those with PTGFR mutations need targeted prostaglandin modulation. This collection converts individual genetic profiles into personalized compounding and adjuvant care.';

  const splitFund = doc.splitTextToSize(fundBody, contentWidth - 8);
  doc.text(splitFund, margin + 4, curY + 12);

  // Box 2: Los 5 Pilares del Ecosistema Multimodal
  curY = 93;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  const pillarsTitle = isEs 
    ? '2. Arquitectura de Tratamiento Multimodal en 5 Pilares' 
    : '2. Multimodal 5-Pillar Treatment Architecture';
  doc.text(pillarsTitle, margin, curY);

  curY += 4;
  const pillarsData = isEs ? [
    ['Pilar', 'Componente Clínico', 'Mecanismo & Sinergia Farmacogenómica', 'Marca / Origen'],
    [
      'Pilar 1',
      'Fórmulas Magistrales en TrichoSol™ / TrichoFoam™',
      'Minoxidil bioactivado, Finasteride/Dutasteride, Espironolactona, Prostaquinon™ y péptidos biomiméticos (IGrantine-F1™) en vehículo patentado 0% alcohol y 0% propilenglicol.',
      'Pharmapolis Compounding Pharmacy'
    ],
    [
      'Pilar 2',
      'Biorregulación Peptídica Folicular (GHK-Cu / TB-500)',
      'GHK-Cu 50 mg estimula fibroblastos de la papila dérmica, bloquea el TGF-β1 (inductor de catagénesis y miniaturización) y promueve angiogénesis microvascular (VEGF/bFGF).',
      'Lotusland Research Lyophilization Hub'
    ],
    [
      'Pilar 3',
      'Matriz Extracelular y Células Madre (Baicapil™ & Colágeno)',
      'Champú y Acondicionador Colway® con Baicapil™ 2% (−60.6% caída, +49% densidad en 84 días) y tropocolágeno nativo de pez que preserva la vaina radicular y calma el cuero cabelludo.',
      'Colway® Trichology Line (Polonia / UE)'
    ],
    [
      'Pilar 4',
      'Diagnóstico Toxicológico & Mineralograma (HTMA)',
      'Espectrometría de masas ICP-MS/MS que cuantifica 33 minerales intracelulares y metales pesados tóxicos (Pb, Hg, Cd, As). Detecta déficits no visibles en sangre que frenan el crecimiento.',
      'TeleTest® Analytika (ISO 17025)'
    ],
    [
      'Pilar 5',
      'Soporte Sistémico y Monitoreo Analítico',
      'Colvita (colágeno nativo liofilizado oral con algas marinas) y Panel Sanguíneo Androgénico/Microvascular Bloodo™ (DHT libre, Ferritina sérica >70 ng/mL, Zinc, Vitamina D3).',
      'Colway® / Bloodo™ Diagnostic Suite'
    ]
  ] : [
    ['Pillar', 'Clinical Component', 'Mechanism & Pharmacogenomic Synergy', 'Brand / Origin'],
    [
      'Pillar 1',
      'Custom Formulations in TrichoSol™ / TrichoFoam™',
      'Bioactivated Minoxidil, Finasteride/Dutasteride, Spironolactone, Prostaquinon™ and biomimetic peptides (IGrantine-F1™) in patented 0% alcohol / 0% propylene glycol base.',
      'Pharmapolis Compounding Pharmacy'
    ],
    [
      'Pillar 2',
      'Follicular Peptide Bioregulation (GHK-Cu / TB-500)',
      'GHK-Cu 50 mg stimulates dermal papilla fibroblasts, downregulates catagen-driver TGF-β1, and promotes VEGF/bFGF angiogenesis without hormonal competition.',
      'Lotusland Research Lyophilization Hub'
    ],
    [
      'Pillar 3',
      'Extracellular Matrix & Stem Cells (Baicapil™ & Collagen)',
      'Colway® Shampoo & Conditioner with Baicapil™ 2% (−60.6% hair loss arrest, +49% density in 84-day RCT) and native tropocollagen protecting against lipid depletion.',
      'Colway® Trichology Line (Poland / EU)'
    ],
    [
      'Pillar 4',
      'Toxicological & Mineral HTMA Diagnostics',
      'ICP-MS/MS hair tissue mineral spectrometry measuring 33 intracellular elements and heavy metals (Pb, Hg, Cd, As). Detects silent metabolic blocks.',
      'TeleTest® Analytika (ISO 17025)'
    ],
    [
      'Pillar 5',
      'Systemic Matrix & Laboratory Telemetry',
      'Colvita (lyophilized native tropocollagen oral capsules with marine algae) and Bloodo™ Androgenic Panel (Free DHT, Ferritin >70 ng/mL, Zinc, Vitamin D3).',
      'Colway® / Bloodo™ Diagnostic Suite'
    ]
  ];

  doc.autoTable({
    startY: curY,
    head: [pillarsData[0]],
    body: pillarsData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.6,
      cellPadding: 2.8,
      overflow: 'linebreak',
      textColor: [...SLATE_DARK],
      lineColor: [...BORDER_COLOR],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', textColor: [...TEAL] },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 84 },
      3: { cellWidth: 38, fontStyle: 'italic', textColor: [...SLATE_MUTED] }
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255]
    }
  });

  // Highlight Box at Bottom of Page 1
  const afterTableY = doc.lastAutoTable.finalY + 5;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, afterTableY, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...BLUE_ACCENT);
  const advTitle = isEs 
    ? 'Ventaja Tecnológica del Vehículo Patentado Fagron TrichoSol™' 
    : 'Technological Superiority of Patented Fagron TrichoSol™ Vehicle';
  doc.text(advTitle, margin + 4, afterTableY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...SLATE_DARK);
  const advBody = isEs
    ? 'Los vehículos convencionales con alcohol y propilenglicol inducen prurito, descamación, eritema y atrofia cutánea con el uso continuado, causando el abandono del tratamiento en más del 40% de los pacientes. TrichoSol™ incorpora el fitocomplejo patentado TrichoTech™ (lipofílico hidrofílico, 100% libre de alcohol y glicoles), que multiplica la permeabilidad folicular mientras restaura el manto hidrolipídico del cuero cabelludo.'
    : 'Traditional alcohol and propylene glycol solutions trigger scalp erythema, contact dermatitis, and lipid barrier damage leading to high discontinuation rates. TrichoSol™ features the patented TrichoTech™ phytocomplex (100% alcohol and glycol free), tripling follicular drug absorption while protecting epicutaneous scalp balance.';
  doc.text(doc.splitTextToSize(advBody, contentWidth - 8), margin + 4, afterTableY + 10.5);

  drawPageFooter(1, 3);

  // ───────────────────────────────────────────────────────────────────────────
  // PÁGINA 2: CATÁLOGO DE FÓRMULAS MAGISTRALES & FARMACOGENÓMICA
  // ───────────────────────────────────────────────────────────────────────────
  doc.addPage();

  // Top Line
  doc.setFillColor(...NAVY);
  doc.rect(margin, 12, contentWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text(isEs ? 'PILAR 1 · FÓRMULAS MAGISTRALES OFICIALES' : 'PILLAR 1 · OFFICIAL COMPOUNDED FORMULATIONS', margin, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(isEs ? 'Formulaciones Galénicas Calibradas en la Colección' : 'Precision Compounded Formulations in the Collection', margin, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(...SLATE_MUTED);
  doc.text(isEs 
    ? 'Fórmulas preparadas en laboratorio magistral bajo prescripción médica individualizada, alineadas con la genómica del paciente.'
    : 'Custom formulations prepared under individual medical prescription, aligned with patient genomics.', margin, 32);

  // Formulations Table
  const formulasData = isEs ? [
    ['Fórmula & Vehículo', 'Composición de Activos (APIs)', 'Indicación Genética & Clínica', 'Pauta de Aplicación'],
    [
      'TrichoSol™ Dúo Androgénico\n(100 mL Solución)',
      '• Minoxidil 4%\n• Espironolactona 1%\n• L-Arginina 1.5%',
      'Sensibilidad a DHT + baja perfusión papilar (eNOS/NOS3). Bloqueo androgénico sin feminización sistémica.',
      '1 mL nocturno en cuero cabelludo seco. Masajear y dejar actuar toda la noche. Lavar al día siguiente.'
    ],
    [
      'TrichoFoam™ Triple Reactivador\n(100 mL Espuma)',
      '• Minoxidil 4%\n• Dutasterida 0.25%\n• IGrantine-F1™ 0.5%',
      'Hiperactividad 5α-reductasa tipo I/II (SRD5A1/2) con miniaturización severa del bulbo folicular.',
      '2 pulsaciones de espuma por la noche con suave masaje en coronilla y entradas.'
    ],
    [
      'TrichoSol™ Anti-PGD2\n(100 mL Solución)',
      '• Prostaquinon™ 3%\n• Espironolactona 1%\n• IGrantine-F1™ 0.25%',
      'Elevada síntesis de PGD2 y receptor CRTH2 activo. Neutraliza el freno microinflamatorio perifolicular.',
      '1 mL diario antes de acostarse. No aclarar inmediatamente.'
    ],
    [
      'TrichoSol™ Patrón Femenino\n(100 mL Solución)',
      '• 17-α-Estradiol (Alfatradiol) 0.05%\n• IGrantine-F1™ 0.5%',
      'Alopecia femenina o intolerancia a antiandrógenos sistémicos. Inhibición competitiva folicular directa.',
      '1 mL diario aplicado con pipeta dosificadora en la raya media y áreas difusas.'
    ],
    [
      'TrichoOil™ Pre-Wash Nutritivo\n(30 mL Aceite Capilar)',
      '• Panax Ginseng 2%\n• Ginkgo Biloba 2.5%\n• Vitamina E (Alfa-Tocoferol) 5%',
      'Cuero cabelludo con estrés oxidativo, descamación lipídica o daño de barrera cutánea por tratamientos.',
      '1–2 veces por semana: masajear 3–5 min, dejar actuar 10 min antes del lavado capilar.'
    ]
  ] : [
    ['Formulation & Vehicle', 'Active APIs & Strength', 'Genetic & Clinical Target', 'Administration Protocol'],
    [
      'TrichoSol™ Androgenic Duo\n(100 mL Solution)',
      '• Minoxidil 4%\n• Spironolactone 1%\n• L-Arginine 1.5%',
      'Heightened DHT sensitivity + impaired microvascular perfusion (NOS3). Follicular receptor antagonism.',
      'Apply 1 mL at night onto dry scalp with gentle massage. Leave overnight; wash next morning.'
    ],
    [
      'TrichoFoam™ Triple Reactivator\n(100 mL Foam)',
      '• Minoxidil 4%\n• Dutasteride 0.25%\n• IGrantine-F1™ 0.5%',
      '5α-reductase type I/II hyperactivity (SRD5A1/2) with severe hair bulb miniaturization.',
      'Apply 2 pumps of foam at night; massage into thinning crown and hairline.'
    ],
    [
      'TrichoSol™ Anti-PGD2 Shield\n(100 mL Solution)',
      '• Prostaquinon™ 3%\n• Spironolactone 1%\n• IGrantine-F1™ 0.25%',
      'High PGD2 pathway activation and CRTH2 receptor sensitivity. Suppresses micro-inflammatory arrest.',
      'Apply 1 mL daily before bedtime. Allow full absorption.'
    ],
    [
      'TrichoSol™ Female Balance\n(100 mL Solution)',
      '• 17-α-Estradiol (Alfatradiol) 0.05%\n• IGrantine-F1™ 0.5%',
      'Female androgenetic pattern or intolerance to systemic anti-androgens. Zero systemic feminization.',
      'Apply 1 mL once daily with calibrated dropper to mid-scalp and diffuse thinning areas.'
    ],
    [
      'TrichoOil™ Pre-Wash Nutrient\n(30 mL Scalp Oil)',
      '• Panax Ginseng 2%\n• Ginkgo Biloba 2.5%\n• Vitamin E (Tocopherol) 5%',
      'Oxidative scalp stress, cutaneous lipid loss, or damaged epidermal barrier from chronic topicals.',
      '1–2 times weekly: massage 3–5 min, leave for 10 min before shampooing.'
    ]
  ];

  doc.autoTable({
    startY: 36,
    head: [formulasData[0]],
    body: formulasData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.4,
      cellPadding: 2.8,
      overflow: 'linebreak',
      textColor: [...SLATE_DARK],
      lineColor: [...BORDER_COLOR],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', textColor: [...NAVY] },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 54 },
      3: { cellWidth: 44, textColor: [...SLATE_MUTED] }
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255]
    }
  });

  // Pathways Reference Table
  const table2Y = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(isEs ? 'Correlación de Polimorfismos Genéticos y Principios Activos' : 'Genetic Polymorphism and API Target Correlation', margin, table2Y);

  const pathwaysData = isEs ? [
    ['Vía Genética', 'Genes / SNPs', 'Activo Recomendado', 'Racional Farmacodinámico'],
    [
      'Prostaglandinas',
      'PTGFR / PTGIR',
      'Latanoprost 0.005% / Prostaquinon™',
      'Prolonga la fase anágena y estimula la papila dérmica.'
    ],
    [
      'Metabolismo Androgénico',
      'SRD5A1 / SRD5A2',
      'Dutasterida / Finasteride / 17α-Estradiol',
      'Inhibición competitiva de 5αR sin alteración sistémica.'
    ],
    [
      'Sulfotransferasa',
      'SULT1A1',
      'Minoxidil en TrichoSol™ o vía oral',
      'Calibra si el paciente responde a vía tópica u oral.'
    ],
    [
      'Óxido Nítrico & Perfusión',
      'NOS3 / eNOS',
      'L-Arginina 1.5% + GHK-Cu',
      'Vasodilatación peribulbar y aporte de O2 y nutrientes.'
    ],
    [
      'Inflamación Folicular',
      'CRTH2 / PTGDR2',
      'Cetirizina / Prostaquinon™',
      'Neutraliza el freno sobre el tallo inducido por PGD2.'
    ]
  ] : [
    ['Genetic Pathway', 'Genes / SNPs', 'Recommended API', 'Pharmacodynamic Rationale'],
    [
      'Prostaglandin Axis',
      'PTGFR / PTGIR',
      'Latanoprost 0.005% / Prostaquinon™',
      'Prolongs anagen phase and recruits dermal papilla vessels.'
    ],
    [
      'Androgen Metabolism',
      'SRD5A1 / SRD5A2',
      'Dutasteride / Finasteride / 17α-Estradiol',
      'Competitive 5αR inhibition without systemic side effects.'
    ],
    [
      'Sulfotransferase',
      'SULT1A1',
      'Minoxidil in TrichoSol™ or Oral',
      'Identifies whether patient responds to topical vs oral Minoxidil.'
    ],
    [
      'Nitric Oxide & Perfusion',
      'NOS3 / eNOS',
      'L-Arginine 1.5% + GHK-Cu',
      'Peribulbar vasodilation, microvascular O2 and nutrient feed.'
    ],
    [
      'Follicular Inflammation',
      'CRTH2 / PTGDR2',
      'Cetirizine / Prostaquinon™',
      'Inhibits PGD2-mediated follicular arrest and miniaturization.'
    ]
  ];

  doc.autoTable({
    startY: table2Y + 3,
    head: [pathwaysData[0]],
    body: pathwaysData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      overflow: 'linebreak',
      textColor: [...SLATE_DARK],
      lineColor: [...BORDER_COLOR],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [...TEAL],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 7.6
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 30, textColor: [...NAVY], fontStyle: 'bold' },
      2: { cellWidth: 48, fontStyle: 'bold' },
      3: { cellWidth: 66 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  drawPageFooter(2, 3);

  // ───────────────────────────────────────────────────────────────────────────
  // PÁGINA 3: PÉPTIDOS BIORREGULADORES, CUIDADOS DIARIOS & PROTOCOLO INTEGRAL
  // ───────────────────────────────────────────────────────────────────────────
  doc.addPage();

  // Top Line
  doc.setFillColor(...NAVY);
  doc.rect(margin, 12, contentWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text(isEs ? 'PILARES 2, 3, 4 Y 5 · BIORREGULACIÓN, PROTECCIÓN & RUTINA' : 'PILLARS 2, 3, 4 & 5 · BIOREGULATION, CARE & ROUTINE', margin, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(isEs ? 'Péptidos, Protección Dérmica y Rutina Diaria del Paciente' : 'Peptides, Scalp Protection & Patient Daily Routine', margin, 27);

  // Box A: Lotusland GHK-Cu 50 mg & TB-500
  let p3Y = 32;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, p3Y, contentWidth, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(isEs 
    ? 'Pilar 2: Biorregulación con Péptidos de Cobre (Lotusland GHK-Cu 50 mg)'
    : 'Pillar 2: Copper Peptide Bioregulation (Lotusland GHK-Cu 50 mg)', margin + 4, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...SLATE_DARK);
  const pepText = isEs
    ? 'El tripéptido de cobre GHK-Cu (50 mg en vial liofilizado estéril) actúa como un potente biorregulador de la papila dérmica. Bloquea selectivamente la transcripción del Factor de Crecimiento Transformante Beta-1 (TGF-β1), el principal mediador molecular que fuerza el paso a la fase catágena y la miniaturización progresiva. Además, induce la angiogénesis microvascular mediante sobreexpresión de VEGF y bFGF, sin competir con receptores androgénicos ni causar efectos hormonales secundarios.'
    : 'GHK-Cu (Copper Tripeptide-1, 50 mg sterile lyophilized vial) acts as a powerful dermal papilla bioregulator. It downregulates Transforming Growth Factor Beta-1 (TGF-β1), the primary cytokine driving catagen transition and miniaturization. Additionally, it stimulates microvascular angiogenesis via VEGF and bFGF upregulation without hormonal receptor competition.';
  doc.text(doc.splitTextToSize(pepText, contentWidth - 8), margin + 4, p3Y + 11);

  // Box B: Colway Baicapil & Tropocolágeno
  p3Y = 65;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, p3Y, contentWidth, 33, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text(isEs 
    ? 'Pilar 3: Cuidado del Cuero Cabelludo y Colágeno Nativo (Colway® Trichology)'
    : 'Pillar 3: Scalp Barrier Care & Native Collagen (Colway® Trichology)', margin + 4, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...SLATE_DARK);
  const colwayText = isEs
    ? 'El uso continuado de fármacos tópicos (Minoxidil / antiandrógenos) suele provocar atrofia epidérmica y sequedad cuticular. El sistema tricológico de Colway® combina:\n• Champú Fortalecedor (200 mL): Formulado con Baicapil™ 2% (Scutellaria baicalensis, brotes de soja y trigo), diosmina micronizada y tropocolágeno nativo de pez. Ensayos clínicos RCT documentan −60.6% de caída capilar y +49% de aumento de densidad tras 84 días (mejora del ratio anágeno/telógeno de 2.3 a 4.7).\n• Acondicionador Fortalecedor (200 mL): Sella la cutícula y refuerza el anclaje infundibular.\n• Colvita (Cápsulas Orales): Colágeno nativo liofilizado activo + Fucus vesiculosus para regeneración sistémica de la matriz dérmica.'
    : 'Chronic use of topical Minoxidil and antiandrogens frequently leads to scalp desquamation and cuticle lipid depletion. The Colway® Trichology system delivers:\n• Strengthening Shampoo (200 mL): Featuring Baicapil™ 2% (Scutellaria baicalensis, soy & wheat sprouts), micronized diosmin, and native fish tropocollagen. RCT clinical trials confirm −60.6% hair loss arrest and +49% hair density increase over 84 days (anagen/telogen ratio rises from 2.3 to 4.7).\n• Strengthening Conditioner (200 mL): Seals cuticle scales and reinforces infundibular anchorage.\n• Colvita (Oral Capsules): Lyophilized native tropocollagen with Fucus vesiculosus for systemic ECM rebuilding.';
  doc.text(doc.splitTextToSize(colwayText, contentWidth - 8), margin + 4, p3Y + 11);

  // Box C: TeleTest HTMA
  p3Y = 101;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, p3Y, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BLUE_ACCENT);
  doc.text(isEs 
    ? 'Pilar 4: Diagnóstico Mineral y Toxicológico Intracelular (TeleTest® HTMA)'
    : 'Pillar 4: Intracellular Mineral & Heavy Metal Toxicology (TeleTest® HTMA)', margin + 4, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...SLATE_DARK);
  const htmaText = isEs
    ? 'El análisis de cabello por espectrometría de masas ICP-MS/MS cuantifica 33 minerales y metales pesados tóxicos (plomo, mercurio, cadmio, arsénico). A diferencia del suero sanguíneo, refleja el almacenamiento celular acumulado de los últimos 3 meses, detectando ratios metabólicos críticos (Ca/Mg, Na/K, Zn/Cu) que pueden boicotear la respuesta al tratamiento tópico.'
    : 'Hair tissue analysis via ICP-MS/MS mass spectrometry quantifies 33 essential minerals and toxic heavy metals (Pb, Hg, Cd, As). Unlike transient serum levels, it evaluates 90-day intracellular storage and metabolic ratios (Ca/Mg, Na/K, Zn/Cu) that can otherwise sabotage topical response.';
  doc.text(doc.splitTextToSize(htmaText, contentWidth - 8), margin + 4, p3Y + 11);

  // Schedule Table: Rutina Semanal del Paciente
  p3Y = 128;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(isEs ? 'Guía Práctica de Aplicación para el Paciente (Cronograma Semanal)' : 'Patient Application Guide (Weekly Protocol Schedule)', margin, p3Y);

  const scheduleData = isEs ? [
    ['Momento', 'Paso Clínico', 'Producto / Tratamiento', 'Instrucciones Clave'],
    [
      'Mañana\n(3–4 veces/sem)',
      'Higiene Folicular & Activación Stem Cell',
      'Champú Fortalecedor Colway® con Baicapil™ 2%',
      'Masajear sobre el cuero cabelludo húmedo durante 2–3 minutos para purificar el ostium folicular. Aclarar con agua templada.'
    ],
    [
      'Mañana\n(Tras champú)',
      'Sellado Cuticular & Anclaje',
      'Acondicionador Fortalecedor Colway®',
      'Aplicar de medios a puntas. Dejar actuar 2 minutos y aclarar. Evita la rotura de la fibra capilar.'
    ],
    [
      'Desayuno\n(Diario)',
      'Soporte Sistémico de Matriz',
      'Colvita (2 cápsulas diarias)',
      'Tomar 2 cápsulas con agua junto a las comidas para aportar péptidos de tropocolágeno liofilizado y antioxidantes marinos.'
    ],
    [
      'Noche\n(Diario)',
      'Tratamiento Folicular de Precisión',
      'Fórmula Magistral en TrichoSol™ o TrichoFoam™',
      'Aplicar 1 mL (o 2 pulsaciones de espuma) sobre cuero cabelludo seco. Extender con ligero masaje. No aclarar; dejar actuar toda la noche.'
    ],
    [
      'Semanal\n(1–2 veces/sem)',
      'Acondicionamiento Lipídico Pre-Lavado',
      'TrichoOil™ Pre-Wash Scalp Oil (30 mL)',
      'Aplicar en cuero cabelludo 10 minutos antes del champú para desensibilizar la barrera cutánea y evitar descamaciones.'
    ]
  ] : [
    ['Timing', 'Clinical Step', 'Product / Formulation', 'Key Instructions'],
    [
      'Morning\n(3–4x weekly)',
      'Follicular Hygiene & Stem Cell Stimulation',
      'Colway® Strengthening Shampoo with Baicapil™ 2%',
      'Massage onto wet scalp for 2–3 minutes to cleanse follicular ostia. Rinse with lukewarm water.'
    ],
    [
      'Morning\n(Post shampoo)',
      'Cuticle Sealing & Hair Shaft Protection',
      'Colway® Strengthening Conditioner',
      'Apply to mid-lengths and ends. Leave for 2 minutes and rinse thoroughly.'
    ],
    [
      'Breakfast\n(Daily)',
      'Systemic Matrix Fortification',
      'Colvita (2 capsules daily)',
      'Take 2 capsules with water at mealtime to supply bioactive tropocollagen oligopeptides and marine minerals.'
    ],
    [
      'Night\n(Daily)',
      'Precision Follicular Compounding',
      'Custom Formula in TrichoSol™ / TrichoFoam™',
      'Apply 1 mL (or 2 pumps) onto clean, dry scalp with gentle finger massage. Leave on overnight; do not rinse immediately.'
    ],
    [
      'Weekly\n(1–2x weekly)',
      'Pre-Wash Lipid Barrier Conditioning',
      'TrichoOil™ Scalp Care Oil (30 mL)',
      'Massage onto scalp 10 minutes prior to washing to prevent lipid barrier dryness and vehicle irritation.'
    ]
  ];

  doc.autoTable({
    startY: p3Y + 3,
    head: [scheduleData[0]],
    body: scheduleData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.2,
      cellPadding: 2.3,
      overflow: 'linebreak',
      textColor: [...SLATE_DARK],
      lineColor: [...BORDER_COLOR],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 7.6
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', textColor: [...NAVY] },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 48, textColor: [...TEAL], fontStyle: 'bold' },
      3: { cellWidth: 66 }
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255]
    }
  });

  // Regulatory & Contact Notice Box
  const p3FinalY = doc.lastAutoTable.finalY + 5;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, p3FinalY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...NAVY);
  const legalTitle = isEs ? 'Aviso Médico & Garantía de Calidad Farmacéutica' : 'Medical Notice & Compounding Quality Guarantee';
  doc.text(legalTitle, margin + 4, p3FinalY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...SLATE_MUTED);
  const legalBody = isEs
    ? 'Las fórmulas magistrales de esta colección son preparadas bajo prescripción médica individualizada por farmacias formuladoras acreditadas en cumplimiento con las Buenas Prácticas de Elaboración de Medicamentos y la Farmacopea Europea. Los cosméticos Colway® cumplen el Reglamento (CE) nº 1223/2009 con registro en el CPNP europeo. Las pruebas diagnósticas TeleTest® HTMA se procesan en laboratorios acreditados ISO 17025.\n\nPara solicitar ajustes de formulación o renovar prescripciones: Mesa Clínica Atlas · info@atlashealth-services.com · www.atlashealth-services.com'
    : 'Compounded medications in this collection are prepared under individualized medical prescription by accredited compounding pharmacies compliant with European Pharmacopoeia and GMP standards. Colway® products comply with EU Cosmetic Regulation 1223/2009 (CPNP registered). TeleTest® HTMA diagnostic analyses are performed in ISO 17025 accredited facilities.\n\nFor clinical adjustments or prescription renewals: Atlas Clinical Desk · info@atlashealth-services.com · www.atlashealth-services.com';
  doc.text(doc.splitTextToSize(legalBody, contentWidth - 8), margin + 4, p3FinalY + 9.5);

  drawPageFooter(3, 3);

  return doc;
}

// Generate Spanish PDF
console.log('Generating Spanish TrichoTest Dossier PDF...');
const docEs = buildDossierPdf(true);
fs.writeFileSync(outputPathEs, Buffer.from(docEs.output('arraybuffer')));
console.log('Saved:', outputPathEs, 'Size:', fs.statSync(outputPathEs).size, 'bytes');

// Generate English PDF
console.log('Generating English TrichoTest Dossier PDF...');
const docEn = buildDossierPdf(false);
fs.writeFileSync(outputPathEn, Buffer.from(docEn.output('arraybuffer')));
console.log('Saved:', outputPathEn, 'Size:', fs.statSync(outputPathEn).size, 'bytes');
