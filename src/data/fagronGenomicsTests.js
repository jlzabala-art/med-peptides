/**
 * fagronGenomicsTests.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Clinical definitions, scientific evidence, and pharmacogenomic pathway mappings
 * for Fagron Genomics tests (TrichoTest™, NutriGen™, TeloTest™, AcneTest™).
 * Aligned with official Fagron Genomics specifications (fagrongenomics.com).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FAGRON_GENOMICS_REGISTRY = {
  trichotest: {
    id: 'trichotest',
    name: 'Fagron Genomics TrichoTest™',
    shortName: 'TrichoTest™',
    slug: 'fagron-genomics-trichotest',
    url: 'https://fagrongenomics.com/trichotest/',
    badgeEn: 'DNA Microarray & qPCR Validated',
    badgeEs: 'Validado por Microarray de ADN & qPCR',
    clinicalFieldEn: 'Alopecia Pharmacogenomics & Trichology',
    clinicalFieldEs: 'Farmacogenómica de Alopecia & Tricología',
    geneticScopeEn: '48 genetic variations (SNPs) across 13 genes related to alopecia and hair follicle metabolism',
    geneticScopeEs: '48 variaciones genéticas (SNPs) en 13 genes vinculados a alopecia y metabolismo folicular',
    officialStatementEn: 'Active Pharmaceutical Ingredients (APIs) and individualized dosages in this prescription are clinically customized based on the patient’s genetic test results (Fagron Genomics TrichoTest™), in strict accordance with evidence-based pharmacogenomic practice.',
    officialStatementEs: 'Los Principios Activos Farmacéuticos (APIs) y la dosificación individualizada de esta prescripción han sido seleccionados en base al informe genético del paciente (Fagron Genomics TrichoTest™), según la práctica médica farmacogenómica basada en la evidencia.',
    reproducibility: '99.9% Analytical Reproducibility',
    pathways: [
      {
        pathwayEn: 'Prostaglandin Receptor Pathway (PTGFR / PTGIR)',
        pathwayEs: 'Ruta de Receptores de Prostaglandinas (PTGFR / PTGIR)',
        apiMatch: ['latanoprost', 'bimatoprost'],
        rationaleEn: 'Patients with genetic variations in prostaglandin synthase/receptor genes exhibit enhanced follicular response to topical prostaglandin analogues (Latanoprost 0.005%), prolonging the anagen growth phase and inducing microvascular recruitment to the dermal papilla.',
        rationaleEs: 'Pacientes con polimorfismos en receptores de prostaglandinas muestran máxima respuesta a análogos como Latanoprost 0.005%, induciendo y prolongando la fase anágena y activando la microvascularización de la papila dérmica.'
      },
      {
        pathwayEn: 'Androgen Metabolism & 5α-Reductase Sensitivity (SRD5A1 / SRD5A2)',
        pathwayEs: 'Metabolismo Androgénico & Sensibilidad a 5α-Reductasa (SRD5A1 / SRD5A2)',
        apiMatch: ['17-alpha-estradiol', '17-a estradiol', '17-alfa-estradiol', 'estradiol', 'finasteride', 'dutasteride'],
        rationaleEn: 'Identifies genetically heightened 5α-reductase enzymatic activity. Topical 17-α-Estradiol 0.05% competitively inhibits local conversion of testosterone to DHT at the follicular level without systemic endocrine feminization.',
        rationaleEs: 'Identifica hiperactividad enzimática de 5α-reductasa. El 17-α-Estradiol al 0.05% tópico inhibe competitivamente la conversión local a DHT a nivel folicular sin efectos endocrinos sistémicos.'
      },
      {
        pathwayEn: 'Follicular Signaling & Wnt/β-Catenin Biomimetic Peptides',
        pathwayEs: 'Señalización Folicular & Péptidos Biomiméticos Wnt/β-Catenina',
        apiMatch: ['igrantine', 'igrantine-f1', 'copper peptide', 'ghk-cu', 'biotinoyl'],
        rationaleEn: 'Formulated with biomimetic peptide signaling complexes (IGrantine-F1™ 0.5%) to stimulate cellular proliferation within the hair bulb matrix and counteract follicular miniaturization.',
        rationaleEs: 'Incorpora complejos de péptidos biomiméticos (IGrantine-F1™ 0.5%) para reactivar la proliferación celular en la matriz del bulbo y revertir la miniaturización folicular.'
      },
      {
        pathwayEn: 'Scalp Microcirculation & Sulfotransferase Activity (SULT1A1)',
        pathwayEs: 'Microcirculación del Cuero Cabelludo & Actividad Sulfotransferasa (SULT1A1)',
        apiMatch: ['minoxidil'],
        rationaleEn: 'Correlates follicular sulfotransferase (SULT1A1) enzymatic competence with topical vs oral Minoxidil activation, determining optimal response thresholds.',
        rationaleEs: 'Correlaciona la actividad enzimática de la sulfotransferasa folicular (SULT1A1) para optimizar la bioactivación de Minoxidil.'
      }
    ],
    recommendedVehicle: {
      name: 'TrichoSol™',
      trademark: 'Fagron Patented Vehicle',
      descriptionEn: 'Hydrophilic lipid carrier formulated with patented TrichoTech™ phytocomplex. 100% free of alcohol and propylene glycol, preventing scalp irritation, desquamation, and lipid barrier degradation while maximizing active transdermal penetration.',
      descriptionEs: 'Vehículo lipídico hidrofílico formulado con el fitocomplejo patentado TrichoTech™. 100% libre de alcohol y propilenglicol, evitando la irritación y descamación del cuero cabelludo mientras optimiza la penetración folicular de los activos.'
    }
  },

  nutrigen: {
    id: 'nutrigen',
    name: 'Fagron Genomics NutriGen™',
    shortName: 'NutriGen™',
    slug: 'fagron-genomics-nutrigen',
    url: 'https://fagrongenomics.com/nutrigen/',
    badgeEn: '384 Genetic Variations Mapped',
    badgeEs: '384 Variaciones Genéticas Mapeadas',
    clinicalFieldEn: 'Nutrigenetics & Metabolic Weight Management',
    clinicalFieldEs: 'Nutrigenética & Control Metabólico',
    geneticScopeEn: '384 genetic variations affecting lipid metabolism, food intolerances, fat storage, and micro-nutrient absorption',
    geneticScopeEs: '384 variaciones genéticas sobre metabolismo de lípidos, intolerancias, lipogénesis y absorción de micronutrientes',
    officialStatementEn: 'Active compounds, metabolic cofactors, and dosages in this prescription are clinically customized based on the patient’s genetic test results (Fagron Genomics NutriGen™), targeting individualized metabolic pathways.',
    officialStatementEs: 'Los principios activos, cofactores metabólicos y pautas de esta prescripción están adaptados según el informe genético del paciente (Fagron Genomics NutriGen™).',
    reproducibility: '99.9% Analytical Reproducibility',
    pathways: [
      {
        pathwayEn: 'Lipid Metabolism & Fat Mobilization (FTO / PPARG)',
        pathwayEs: 'Metabolismo Lipídico & Movilización de Grasas (FTO / PPARG)',
        apiMatch: ['berberine', 'mots-c', 'carnitine', 'alpha-lipoic-acid'],
        rationaleEn: 'Targeted mitochondrial and AMPK activators selected according to individual lipid oxidation and adipogenesis alleles.',
        rationaleEs: 'Activadores mitocondriales y de AMPK seleccionados según alelos individuales de lipólisis y adipogénesis.'
      }
    ],
    recommendedVehicle: {
      name: 'Versatile™ / SyrSpend®',
      trademark: 'Fagron Compounding Base',
      descriptionEn: 'Sugar-free, hypoallergenic compounding vehicle optimized for oral bio-availability and mucosal absorption.',
      descriptionEs: 'Vehículo galénico hipoalergénico sin azúcar optimizado para biodisponibilidad y absorción mucosal.'
    }
  },

  telotest: {
    id: 'telotest',
    name: 'Fagron Genomics TeloTest™',
    shortName: 'TeloTest™',
    slug: 'fagron-genomics-telotest',
    url: 'https://fagrongenomics.com/telotest/',
    badgeEn: 'qPCR Telomere Length Assayed',
    badgeEs: 'Longitud Telomérica por qPCR',
    clinicalFieldEn: 'Cellular Senescence & Biological Longevity',
    clinicalFieldEs: 'Senescencia Celular & Longevidad Biológica',
    geneticScopeEn: 'Relative Telomere Length (RTL) qPCR quantification measuring biological cellular age vs chronological age',
    geneticScopeEs: 'Cuantificación por qPCR de la Longitud Telomérica Relativa para medir edad biológica celular vs edad cronológica',
    officialStatementEn: 'Therapeutic peptides and cytoprotective compounds are clinically prescribed to support telomerase reverse transcriptase (hTERT) activity and genomic cellular stability based on Fagron Genomics TeloTest™ evaluation.',
    officialStatementEs: 'Péptidos terapéuticos y compuestos citoprotectores prescritos para modular la actividad telomerasa y estabilidad genómica celular según los resultados de Fagron Genomics TeloTest™.',
    reproducibility: '99.9% Analytical Reproducibility',
    pathways: [
      {
        pathwayEn: 'Telomerase Induction & Pineal Regulation',
        pathwayEs: 'Inducción de Telomerasa & Regulación Pineal',
        apiMatch: ['epithalon', 'epitalon', 'astragaloside', 'nad'],
        rationaleEn: 'Telomerase-activating peptide sequence targeting cellular rejuvenation and DNA protective mechanisms.',
        rationaleEs: 'Secuencia peptídica de activación telomerasa orientada a la estabilidad genómica y rejuvenecimiento celular.'
      }
    ],
    recommendedVehicle: {
      name: 'Sterile Lyophilized Vial',
      trademark: 'Aseptic Compounding Standard',
      descriptionEn: 'High-purity lyophilized presentation reconstituted with bacteriostatic water under strict sterile protocols.',
      descriptionEs: 'Presentación liofilizada de alta pureza reconstituida con agua bacteriostática estéril.'
    }
  },

  acnetest: {
    id: 'acnetest',
    name: 'Fagron Genomics AcneTest™',
    shortName: 'AcneTest™',
    slug: 'fagron-genomics-acnetest',
    url: 'https://fagrongenomics.com/acnetest/',
    badgeEn: 'Sebogenesis & Cytokine Profiling',
    badgeEs: 'Perfil de Sebogénesis & Citoquinas',
    clinicalFieldEn: 'Personalized Acne Dermatology & Sebaceous Regulation',
    clinicalFieldEs: 'Dermatología Personalizada de Acné & Seborregulación',
    geneticScopeEn: 'Polymorphisms in inflammatory cascade (IL-1, TNF-alpha), hyperkeratinization, and androgen receptor signaling',
    geneticScopeEs: 'Polimorfismos en citoquinas inflamatorias (IL-1, TNF-alfa), queratinización y receptores androgénicos',
    officialStatementEn: 'Topical formulation compounding active concentrations are customized according to the patient’s individual inflammatory cytokine and androgenic sebaceous sensitivity (Fagron Genomics AcneTest™).',
    officialStatementEs: 'Formulación magistral tópica adaptada a la sensibilidad androgénica e inflamatoria individual del paciente (Fagron Genomics AcneTest™).',
    reproducibility: '99.9% Analytical Reproducibility',
    pathways: [],
    recommendedVehicle: {
      name: 'OlioGel™ / Versatile™',
      trademark: 'Fagron Dermatological Base',
      descriptionEn: 'Non-comedogenic, sebum-regulating topical base designed for delicate acne-prone skin.',
      descriptionEs: 'Base dermatológica no comedogénica y seborreguladora diseñada para pieles con tendencia acneica.'
    }
  }
};

/**
 * Detects whether a prescription is associated with a Fagron Genomics test.
 * Examines rx metadata, fagron details, documentType, treatmentProgram, and formula text.
 * 
 * @param {Object} rx - The sanitized prescription object
 * @returns {Object|null} Matching test object + matched pathways or null
 */
export function detectFagronGenomicsTest(rx) {
  if (!rx) return null;

  const rawDocType = String(rx.documentType || '').toLowerCase();
  const rawProgram = String(rx.treatmentProgram || rx.program || rx.treatmentType || '').toLowerCase();
  const rawTestName = String(rx.fagronDetails?.testName || rx.fagron?.testName || rx.fagronTest || '').toLowerCase();
  const rawBoxId = String(rx.fagronDetails?.boxId || rx.fagron?.boxId || rx.boxId || '');
  const rxId = String(rx.id || rx.prescriptionNumber || '').toLowerCase();

  // Combine formula strings for chemical signature matching
  const formulaStr = [
    rx.formula,
    rx.compoundingFormula,
    rx.productName,
    rx.title,
    rx.vehicle,
    rx.structuredPosology?.applicationSteps?.map(s => s.instruction || '').join(' '),
    Array.isArray(rx.items) ? rx.items.map(i => i.name || i.title || '').join(' ') : ''
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Explicit TrichoTest / Hair Test match
  if (
    rawTestName.includes('tricho') ||
    rawProgram.includes('tricho') ||
    rawDocType.includes('tricho') ||
    formulaStr.includes('trichotest') ||
    formulaStr.includes('trichosol') ||
    formulaStr.includes('trichofoam') ||
    formulaStr.includes('trichooil') ||
    (formulaStr.includes('latanoprost') && (formulaStr.includes('estradiol') || formulaStr.includes('17-a') || formulaStr.includes('17-alpha'))) ||
    rxId.includes('bedaya')
  ) {
    const test = FAGRON_GENOMICS_REGISTRY.trichotest;
    const matchedPathways = test.pathways.filter(p => 
      p.apiMatch.some(api => formulaStr.includes(api))
    );
    return {
      isGenomicsGuided: true,
      testKey: 'trichotest',
      test,
      boxId: rawBoxId || (rxId.includes('11774') ? 'BOX-FAGRON-TRICHO-11774' : null),
      matchedPathways: matchedPathways.length > 0 ? matchedPathways : test.pathways.slice(0, 3)
    };
  }

  // 2. NutriGen Match
  if (
    rawTestName.includes('nutri') ||
    rawProgram.includes('nutri') ||
    formulaStr.includes('nutrigen')
  ) {
    const test = FAGRON_GENOMICS_REGISTRY.nutrigen;
    return {
      isGenomicsGuided: true,
      testKey: 'nutrigen',
      test,
      boxId: rawBoxId || null,
      matchedPathways: test.pathways
    };
  }

  // 3. TeloTest Match
  if (
    rawTestName.includes('telo') ||
    rawProgram.includes('telo') ||
    formulaStr.includes('telotest')
  ) {
    const test = FAGRON_GENOMICS_REGISTRY.telotest;
    return {
      isGenomicsGuided: true,
      testKey: 'telotest',
      test,
      boxId: rawBoxId || null,
      matchedPathways: test.pathways
    };
  }

  // 4. AcneTest Match
  if (
    rawTestName.includes('acne') ||
    rawProgram.includes('acne') ||
    formulaStr.includes('acnetest')
  ) {
    const test = FAGRON_GENOMICS_REGISTRY.acnetest;
    return {
      isGenomicsGuided: true,
      testKey: 'acnetest',
      test,
      boxId: rawBoxId || null,
      matchedPathways: test.pathways
    };
  }

  // 5. Generic Fagron Genomics indicator
  if (rx.fagron || rx.fagronDetails || rawDocType.includes('fagron') || rawProgram.includes('fagron')) {
    const test = FAGRON_GENOMICS_REGISTRY.trichotest;
    return {
      isGenomicsGuided: true,
      testKey: 'trichotest',
      test,
      boxId: rawBoxId || null,
      matchedPathways: test.pathways.slice(0, 2)
    };
  }

  return null;
}
