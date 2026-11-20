/**
 * dnaProfileResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Domain-accurate genomic profile resolver for DoctorDnaAnalysisTab.
 * Ensures Fagron TrichoTest™ (AATRI), TeloTest™ (AATEL), and AcneTest™ (AAACN)
 * render their true pharmacogenomic/dermatological genes & axes instead of
 * falling back to 24Genetics Nutrigenomics (lactose/caffeine/meal plans).
 */

export function detectDnaTestFamily(row = {}) {
  const corpus = `${row.testType || ''} ${row.assayTitle || ''} ${row.code || ''} ${row.sampleId || ''} ${row.labName || ''}`.toLowerCase();
  if (/aatri|tricho/i.test(corpus)) return 'trichotest';
  if (/aatel|telo/i.test(corpus)) return 'telotest';
  if (/aaacn|acne/i.test(corpus)) return 'acnetest';
  return 'nutrigenomics';
}

export function resolveNonNutrigenomicDnaProfile(row = {}, family) {
  const sample = row.sampleId || row.code || 'SPECIMEN';

  if (family === 'trichotest') {
    return {
      family: 'trichotest',
      testLabel: 'Fagron TrichoTest™ · Trichology Pharmacogenomics',
      headerSubtitle: `5 Trichology Pharmacogenomic Axes · Specimen ${sample}`,
      badges: [
        { label: 'SRD5A1 / SRD5A2 (5α-Reductase)', tone: 'danger' },
        { label: 'SULT1A1 (Minoxidil Activation)', tone: 'success' },
        { label: 'PTGFR / PTGES (Prostaglandin)', tone: 'warn' },
      ],
      axes: [
        { id: 't1', axisName: 'Androgen & 5α-Reductase Pathway', genesLabel: 'SRD5A1, SRD5A2, AR', priority: 'HIGH PRIORITY', badgeColor: '#c5221f' },
        { id: 't2', axisName: 'Follicular Sulfotransferase Bioactivation', genesLabel: 'SULT1A1, ABCC9, KCNJ8', priority: 'ACTIONABLE', badgeColor: '#137333' },
        { id: 't3', axisName: 'Prostaglandin Anagen Signaling', genesLabel: 'PTGFR, PTGES, PTGDR2', priority: 'HIGH PRIORITY', badgeColor: '#b06000' },
        { id: 't4', axisName: 'Dermal Papilla Microcirculation & IGF-1', genesLabel: 'ACE, VEGFA, IGF1', priority: 'ACTIONABLE', badgeColor: '#1a73e8' },
        { id: 't5', axisName: 'Follicular Inflammation & Collagen Matrix', genesLabel: 'IL6, SOD2, COL1A1, CRABP2', priority: 'MONITOR', badgeColor: '#5f6368' },
      ],
      synthesisTitle: 'Trichology Pharmacogenomic Synthesis (48 SNPs · 13 Alopecia Genes)',
      synthesisText:
        'Follicular genetic panel guiding precision topical & oral compounding: evaluates 5α-reductase (dutasteride/finasteride) sensitivity, follicular SULT1A1 minoxidil sulfation capacity, prostaglandin F2α/E2 receptor expression, and dermal papilla microvascular response.',
      convergenceTitle: 'Pharmacogenomic Formulation Alignment',
      convergenceItems: [
        {
          id: 'tricho-5ar',
          axis: 'AXIS 1 · ANDROGEN METABOLISM',
          convergenceLevel: 'HIGH_PRIORITY',
          title: '5α-Reductase Follicular Inhibition Sensitivity',
          geneticMarker: 'SRD5A1 / SRD5A2 / AR',
          phenotypeStatus: 'Androgenetic Alopecia Pharmacogenomic Target',
          clinicalActionEn: 'Prioritize targeted 5α-reductase modulation (Dutasteride / Finasteride) calibrated to patient tolerability and scalp/oral route.',
        },
        {
          id: 'tricho-sult',
          axis: 'AXIS 2 · VASODILATION & ANAGEN INDUCTION',
          convergenceLevel: 'ACTION_REQUIRED',
          title: 'SULT1A1 Minoxidil Sulfation & K_ATP Channel Response',
          geneticMarker: 'SULT1A1 / KCNJ8 / PTGFR',
          phenotypeStatus: 'Topical & Oral Follicular Bioactivation Window',
          clinicalActionEn: 'Pair follicular K_ATP activation (Minoxidil in TrichoSol™) with prostaglandin/microvascular co-factors for optimal anagen induction.',
        },
      ],
      whatsappSummary: (patient, doc, portalUrl) =>
        `🧬 *Fagron TrichoTest™ Pharmacogenomics* · Atlas Health Services\n👤 *Patient:* ${patient} (Specimen #${sample})\n👨‍⚕️ *Physician:* ${doc}\n\n*Key Trichology Gene Pathways:*\n• 🧬 *5α-Reductase (SRD5A1/2, AR):* Guides Dutasteride/Finasteride precision dosing.\n• 💧 *Minoxidil Activation (SULT1A1):* Evaluates follicular sulfotransferase conversion.\n• 🌱 *Prostaglandins & Perfusion (PTGFR, ACE, IGF1):* Guides anagen & microvascular support.\n\n🌐 *Interactive Patient Portal:* ${portalUrl}`,
    };
  }

  if (family === 'telotest') {
    return {
      family: 'telotest',
      testLabel: 'Fagron TeloTest™ · Telomere & Cellular Longevity',
      headerSubtitle: `5 Cellular Longevity & Telomere Axes · Specimen ${sample}`,
      badges: [
        { label: 'TERT / TERC (Telomerase)', tone: 'warn' },
        { label: 'SOD2 / GPX1 (Oxidative Stress)', tone: 'danger' },
        { label: 'SIRT1 / FOXO3 (Longevity)', tone: 'success' },
      ],
      axes: [
        { id: 'tl1', axisName: 'Telomerase Maintenance & Attrition Rate', genesLabel: 'TERT, TERC, OBFC1', priority: 'HIGH PRIORITY', badgeColor: '#1a73e8' },
        { id: 'tl2', axisName: 'Mitochondrial Oxidative Defense', genesLabel: 'SOD2, GPX1, CAT', priority: 'HIGH PRIORITY', badgeColor: '#c5221f' },
        { id: 'tl3', axisName: 'Cellular Senescence & Sirtuin Repair', genesLabel: 'SIRT1, FOXO3, TP53', priority: 'ACTIONABLE', badgeColor: '#137333' },
        { id: 'tl4', axisName: 'Systemic Inflammaging Modulation', genesLabel: 'IL6, TNF, CRP', priority: 'ACTIONABLE', badgeColor: '#b06000' },
        { id: 'tl5', axisName: 'Methylation & DNA Repair Fidelity', genesLabel: 'MTHFR, XRCC1, PARP1', priority: 'MONITOR', badgeColor: '#5f6368' },
      ],
      synthesisTitle: 'Telomere Biology & Cellular Aging Synthesis',
      synthesisText:
        'Evaluates telomere length dynamics, mitochondrial ROS neutralization capacity, and sirtuin/DNA-repair pathways to guide personalized longevity, antioxidant, and peptide compounding.',
      convergenceTitle: 'Longevity & Cellular Protection Targets',
      convergenceItems: [],
      whatsappSummary: (patient, doc, portalUrl) =>
        `🧬 *Fagron TeloTest™ Cellular Longevity* · Atlas Health Services\n👤 *Patient:* ${patient} (Specimen #${sample})\n👨‍⚕️ *Physician:* ${doc}\n\n*Key Longevity Pathways:*\n• 🧬 *Telomerase (TERT/TERC)*, *Oxidative Defense (SOD2/GPX1)* & *Sirtuins (SIRT1/FOXO3)*.\n\n🌐 *Interactive Patient Portal:* ${portalUrl}`,
    };
  }

  // acnetest
  return {
    family: 'acnetest',
    testLabel: 'Fagron AcneTest™ · Dermatological Pharmacogenomics',
    headerSubtitle: `5 Sebaceous & Inflammatory Dermatology Axes · Specimen ${sample}`,
    badges: [
      { label: 'IL1A / TNF (Inflammation)', tone: 'danger' },
      { label: 'IGF1 (Sebogenesis)', tone: 'warn' },
      { label: 'MMP1 / CYP1A1 (Scarring)', tone: 'success' },
    ],
    axes: [
      { id: 'ac1', axisName: 'Sebaceous Gland & IGF-1 Activity', genesLabel: 'IGF1, AR, SRD5A1', priority: 'HIGH PRIORITY', badgeColor: '#c5221f' },
      { id: 'ac2', axisName: 'Cutaneous Cytokine Hyper-Reactivity', genesLabel: 'IL1A, TNF, TLR2', priority: 'HIGH PRIORITY', badgeColor: '#b06000' },
      { id: 'ac3', axisName: 'Retinoid & Keratinization Response', genesLabel: 'RARA, CRABP2, CYP26A1', priority: 'ACTIONABLE', badgeColor: '#1a73e8' },
      { id: 'ac4', axisName: 'Dermal Matrix & Post-Acne Scarring', genesLabel: 'MMP1, COL1A1, TGFB1', priority: 'ACTIONABLE', badgeColor: '#137333' },
      { id: 'ac5', axisName: 'Cutaneous Oxidative Detoxification', genesLabel: 'CYP1A1, GSTM1, SOD2', priority: 'MONITOR', badgeColor: '#5f6368' },
    ],
    synthesisTitle: 'Dermatological Acne Pharmacogenomic Synthesis',
    synthesisText:
      'Guides topical and systemic dermatological compounding by profiling sebogenesis, pro-inflammatory cytokine sensitivity, retinoid metabolism, and post-inflammatory scarring risk.',
    convergenceTitle: 'Dermatological Compounding Targets',
    convergenceItems: [],
    whatsappSummary: (patient, doc, portalUrl) =>
      `🧬 *Fagron AcneTest™ Dermatology* · Atlas Health Services\n👤 *Patient:* ${patient} (Specimen #${sample})\n👨‍⚕️ *Physician:* ${doc}\n\n*Key Dermatology Pathways:*\n• 🧬 *Sebogenesis (IGF1/AR)*, *Inflammation (IL1A/TNF)* & *Matrix Repair (MMP1/COL1A1)*.\n\n🌐 *Interactive Patient Portal:* ${portalUrl}`,
  };
}
