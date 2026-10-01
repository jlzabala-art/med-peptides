/**
 * fagronClinicalMonographs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Evidence-based clinical monographs and pharmacogenomic annotations
 * for all Fagron APIs (TrichoTest, NutriGen, TeloTest, Compounding).
 *
 * Each entry provides:
 *  - geneTargets: Official Gene Symbols (HGNC)
 *  - pharmacologicalClass: Specific therapeutic class
 *  - clinicalIndication: Medical indication for targeted therapy
 *  - mechanismOfAction: Biological cellular mechanism (papilla, follicular stem cells, metabolism)
 *  - compatibleVehicles: Recommended galenic compounding bases
 *  - standardDosages: Typical concentration or dose ranges
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FAGRON_CLINICAL_MONOGRAPHS = {
  'finasteride': {
    canonicalName: 'Finasteride',
    geneTargets: ['SRD5A2', 'SRD5A1'],
    pharmacologicalClass: 'Inhibidor Selectivo 5α-Reductasa Tipo II',
    clinicalIndication: 'Supresión de DHT folicular, reversión de miniaturización & mantenimiento de densidad capilar',
    mechanismOfAction: 'Inhibe selectivamente la enzima esteroide 5α-reductasa tipo II, bloqueando la conversión de testosterona en dihidrotestosterona (DHT) en la papila dérmica folicular. Reduce los niveles de DHT en >70% frenando la apoptosis folicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Micronizadas USP'],
    standardDosages: '0.1% - 1% Tópico · 1 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'dutasteride': {
    canonicalName: 'Dutasteride',
    geneTargets: ['SRD5A1', 'SRD5A2', 'SRD5A3'],
    pharmacologicalClass: 'Inhibidor Dual 5α-Reductasa Tipo I, II y III',
    clinicalIndication: 'Inhibición androgénica folicular profunda en alopecia androgenética refractaria',
    mechanismOfAction: 'Bloqueador dual de isoenzimas 5α-reductasa tipo I y II. Suprime los niveles de DHT folicular en >90%, con afinidad 3 veces superior a la isoenzima tipo II y 100 veces superior a la tipo I respecto a finasteride.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Mesoterapia Capilar', 'Cápsulas Micronizadas'],
    standardDosages: '0.01% - 0.5% Tópico · 0.5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'minoxidil': {
    canonicalName: 'Minoxidil',
    geneTargets: ['SULT1A1', 'KCNJ8', 'ABCC9'],
    pharmacologicalClass: 'Activador de Sulfotransferasa & Canales K_ATP Foliculares',
    clinicalIndication: 'Inducción de fase anágena, estimulación de perfusión microvascular folicular y grosor del tallo',
    mechanismOfAction: 'Bioactivado enzimáticamente por la sulfotransferasa folicular (SULT1A1) a sulfato de minoxidil activo. Abre los canales de potasio sensibles a ATP (K_ATP), provocando hiperpolarización celular, vasodilatación papilar y estimulación mitogénica de queratinocitos.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Solución Hidroalcohólica Fagron'],
    standardDosages: '2% - 7% Tópico · 0.25 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  'cetirizine-hcl': {
    canonicalName: 'Cetirizine Hcl',
    geneTargets: ['PTGDR2', 'CRTH2', 'HRH1'],
    pharmacologicalClass: 'Antagonista Selectivo del Receptor PGD2 / CRTH2',
    clinicalIndication: 'Neutralización del freno microinflamatorio perifolicular y desbloqueo de fase anágena',
    mechanismOfAction: 'Antagoniza de forma competitiva los receptores de prostaglandina D2 (PGD2/CRTH2) sobreexpresados en cuero cabelludo alopécico. Bloquea la apoptosis de queratinocitos foliculares y suprime el infiltrado inflamatorio mastocitario perifolicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.5% - 1% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'd-panthenol': {
    canonicalName: 'D-Panthenol (Provitamina B5)',
    geneTargets: ['PANK1', 'PANK2', 'COA_SYNTHESIS'],
    pharmacologicalClass: 'Precursor de Coenzima A & Regenerador Celular Folicular',
    clinicalIndication: 'Bioenergía folicular (ATP), reparación de cutícula y resistencia tensil de la fibra capilar',
    mechanismOfAction: 'Precursor fisiológico del ácido pantoténico y la Coenzima A. Impulsa la biosíntesis de ATP celular y lípidos de la vaina epitelial externa, optimizando la capacidad higroscópica del tallo y reparando el daño térmico y mecánico.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™'],
    standardDosages: '0.25% - 2% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'latanoprost-fagron': {
    canonicalName: 'Latanoprost',
    geneTargets: ['PTGFR', 'FP_RECEPTOR'],
    pharmacologicalClass: 'Agonista Selectivo de Receptores de Prostaglandina F2α (FP)',
    clinicalIndication: 'Inducción de anagénesis precoz, hipertrofia folicular y estimulación de melanogénesis',
    mechanismOfAction: 'Activa directamente los receptores FP de la papila dérmica, induciendo la transición de folículos de fase telógena a anágena. Estimula el reclutamiento microvascular y aumenta el diámetro y pigmentación de cabellos miniaturizados.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.005% - 0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'spironolactone': {
    canonicalName: 'Spironolactone',
    geneTargets: ['AR', 'NR3C2'],
    pharmacologicalClass: 'Antagonista Competitivo de Receptores Androgénicos',
    clinicalIndication: 'Bloqueo androgénico folicular localizado sin alteración hormonal sistémica',
    mechanismOfAction: 'Compite con la dihidrotestosterona por el receptor androgénico intracelular en las células de la papila dérmica folicular. Previene la translocación nuclear del receptor y detiene la expresión de señales paracrinas miniaturizantes.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 5% Tópico · 25 mg - 100 mg Oral',
    fagronPrograms: ['TrichoTest']
  },
  '17-alpha-estradiol': {
    canonicalName: '17-α Estradiol (Alfatradiol)',
    geneTargets: ['CYP19A1', 'SRD5A1'],
    pharmacologicalClass: 'Inhibidor Local de 5α-Reductasa & Estimulador de Aromatasa',
    clinicalIndication: 'Terapia antiandrogénica tópica segura en hombres y mujeres sin feminización sistémica',
    mechanismOfAction: 'Estereoisómero no feminizante del 17-β-estradiol. Inhibe la 5α-reductasa folicular e incrementa la actividad aromatasa local en el bulbo piloso, favoreciendo la conversión de andrógenos a estrógenos protectores.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.025% - 0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'clobetasol-propionate': {
    canonicalName: 'Clobetasol Propionato',
    geneTargets: ['NR3C1', 'GLUCOCORTICOID_RECEPTOR'],
    pharmacologicalClass: 'Corticosteroide Tópico de Muy Alta Potencia (Clase IV)',
    clinicalIndication: 'Supresión de alopecia areata y procesos inflamatorios autoinmunes del cuero cabelludo',
    mechanismOfAction: 'Unión de alta afinidad a receptores glucocorticoides citoplasmáticos. Inhibe la transcripción de citoquinas proinflamatorias (IL-1, IL-2, TNF-α) y suprime el ataque linfocitario al privilegio inmune folicular.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '0.05% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'caffeine': {
    canonicalName: 'Caffeine Pure API',
    geneTargets: ['PDE4', 'CAMP_PATHWAY'],
    pharmacologicalClass: 'Inhibidor de Fosfodiesterasa & Activador Mitocondrial',
    clinicalIndication: 'Estimulación de proliferación celular folicular y neutralización del freno por testosterona',
    mechanismOfAction: 'Inhibe la fosfodiesterasa intracelular incrementando los niveles de adenosín monofosfato cíclico (cAMP). Estimula el metabolismo celular, promueve la elongación folicular y contrarresta el freno inducido por andrógenos.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™'],
    standardDosages: '0.5% - 2% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'cafeisome': {
    canonicalName: 'CafeiSome™ (Cafeína Liposomal)',
    geneTargets: ['PDE4', 'CAMP_PATHWAY'],
    pharmacologicalClass: 'Cafeína Encapsulada en Vesículas Liposomales',
    clinicalIndication: 'Liberación prolongada de cafeína folicular con penetración transdérmica optimizada',
    mechanismOfAction: 'Sistema nanovesicular liposomal que transporta cafeína purificada profundamente hacia el bulbo folicular sin evaporación en la superficie cutánea, manteniendo niveles estimulantes durante 24 horas.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™'],
    standardDosages: '1% - 3% Tópico',
    fagronPrograms: ['TrichoTest']
  },
  'melatonin': {
    canonicalName: 'Melatonina',
    geneTargets: ['MTNR1A', 'MTNR1B', 'CLOCK_GENES'],
    pharmacologicalClass: 'Agonista de Receptores MT1/MT2 & Antioxidante Mitocondrial',
    clinicalIndication: 'Cronobiología folicular, mantenimiento del anágeno y eliminación de radicales libres',
    mechanismOfAction: 'Se une a receptores melatonérgicos MT1/MT2 en queratinocitos foliculares y fibroblastos de la papila. Regula los ritmos circadianos del ciclo capilar y actúa como potente captador de radicales hidroxilo.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'TrichoOil™', 'Cápsulas Orales'],
    standardDosages: '0.0033% - 0.1% Tópico · 1 mg - 5 mg Oral',
    fagronPrograms: ['TrichoTest', 'TeloTest']
  },
  'ginkgo-biloba': {
    canonicalName: 'Ginkgo Biloba Extracto Estandarizado',
    geneTargets: ['NOS3', 'VEGF', 'ENOS'],
    pharmacologicalClass: 'Vasoprotector Folicular & Captador de Radicales Libres',
    clinicalIndication: 'Optimización de microcirculación capilar papilar y escudo antioxidante dérmico',
    mechanismOfAction: 'Flavonoides y terpenoides estandarizados que estimulan la síntesis endotelial de óxido nítrico (eNOS). Mejoran la deformabilidad eritrocitaria en capilares terminales y protegen las membranas del bulbo piloso.',
    compatibleVehicles: ['TrichoOil™', 'TrichoSol™', 'Cápsulas Orales'],
    standardDosages: '1% - 3% Tópico · 60 mg - 240 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen', 'TeloTest']
  },
  'ginseng': {
    canonicalName: 'Panax Ginseng Extracto',
    geneTargets: ['VEGFA', 'FGF7', 'BCL2'],
    pharmacologicalClass: 'Fitoestimulante Celular & Up-regulador de Factores de Crecimiento',
    clinicalIndication: 'Proliferación celular en la matriz papilar y retraso de entrada en fase catágena',
    mechanismOfAction: 'Ginsenósidos bioactivos (Rb1, Rg1) que sobreexpresan VEGF y FGF-7 en la papila dérmica. Inhiben la caspasa-3 y sobreexpresan Bcl-2, protegiendo las células madre del folículo contra la involución prematura.',
    compatibleVehicles: ['TrichoOil™', 'TrichoSol™', 'Cápsulas Orales'],
    standardDosages: '1% - 3% Tópico · 100 mg - 500 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'biotin': {
    canonicalName: 'Biotina (Vitamina B7 / Vitamina H)',
    geneTargets: ['BTD', 'HLCS', 'KERATIN_GENES'],
    pharmacologicalClass: 'Cofactor Enzimático de Carboxilasas & Síntesis de Queratina',
    clinicalIndication: 'Fortalecimiento estructural del tallo piloso y metabolismo de aminoácidos azufrados',
    mechanismOfAction: 'Coenzima indispensable para carboxilasas mitocondriales. Facilita la síntesis de ácidos grasos y el metabolismo de aminoácidos como la cisteína, reforzando los puentes disulfuro de la queratina capilar.',
    compatibleVehicles: ['TrichoSol™', 'TrichoFoam™', 'Cápsulas Orales'],
    standardDosages: '0.1% - 0.5% Tópico · 2.5 mg - 10 mg Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  },
  'vitamin-d3': {
    canonicalName: 'Vitamina D3 (Colecalciferol)',
    geneTargets: ['VDR', 'CYP27B1', 'CYP24A1'],
    pharmacologicalClass: 'Ligando del Receptor de Vitamina D (VDR) & Modulador Inmunitario',
    clinicalIndication: 'Activación del ciclo folicular y diferenciación de células madre en el bulbo piloso',
    mechanismOfAction: 'Se une al receptor nuclear VDR expresado abundantemente en queratinocitos del folículo piloso. Induce la expresión de genes esenciales para el inicio del ciclo anágeno y previene la alopecia mediada por fallo de VDR.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoOil™'],
    standardDosages: '1,000 UI - 10,000 UI Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen', 'TeloTest']
  },
  'alpha-lipoic-acid': {
    canonicalName: 'Ácido Alfa-Lipoico (ALA)',
    geneTargets: ['NFE2L2', 'NRF2', 'SOD2'],
    pharmacologicalClass: 'Antioxidante Universal Anfifílico & Regenerador de GSH',
    clinicalIndication: 'Protección mitocondrial, neutralización de estrés oxidativo y sensibilidad a insulina',
    mechanismOfAction: 'Activa la vía Nrf2-ARE intracelular para sobreexpresar enzimas antioxidantes endógenas (SOD, Catalasa). Regenera vitaminas C, E y glutatión intracelular, protegiendo los telómeros y el ADN celular.',
    compatibleVehicles: ['Cápsulas Orales Micronizadas'],
    standardDosages: '300 mg - 600 mg Oral',
    fagronPrograms: ['NutriGen', 'TeloTest']
  },
  'coenzyme-q10': {
    canonicalName: 'Coenzima Q10 (Ubiquinona / Ubiquinol)',
    geneTargets: ['COQ2', 'COQ7', 'OXPHOS'],
    pharmacologicalClass: 'Transportador Electrónico Mitocondrial & Escudo Lipídico',
    clinicalIndication: 'Bioenergética celular mitocondrial, prevención de senescencia celular y salud vascular',
    mechanismOfAction: 'Componente indispensable de la cadena de transporte de electrones (Complejos I, II y III) para fosforilación oxidativa mitocondrial. Previene la peroxidación de lípidos de membrana y preserva la función endotelial.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoOil™'],
    standardDosages: '100 mg - 300 mg Oral',
    fagronPrograms: ['NutriGen', 'TeloTest']
  },
  'berberine': {
    canonicalName: 'Berberina Clorhidrato USP',
    geneTargets: ['PRKAA1', 'AMPK', 'PCSK9', 'LDLR'],
    pharmacologicalClass: 'Activador Alostérico de AMPK & Modulador Metabólico',
    clinicalIndication: 'Sensibilidad a la insulina, modulación de lipogénesis y metabolismo glucídico',
    mechanismOfAction: 'Activa la proteína quinasa activada por AMP (AMPK) de manera independiente de insulina. Suprime la expresión hepática de PCSK9 aumentando receptores LDLR y disminuye la gluconeogénesis hepática.',
    compatibleVehicles: ['Cápsulas Micronizadas USP'],
    standardDosages: '500 mg (2-3 veces/día con comidas)',
    fagronPrograms: ['NutriGen']
  },
  'zinc-citrate': {
    canonicalName: 'Zinc Citrato',
    geneTargets: ['MT1A', 'ZNT1', 'ZIP4'],
    pharmacologicalClass: 'Cofactor Metaloproteasa Esencial & Modulador 5α-Reductasa',
    clinicalIndication: 'Inmunidad celular, síntesis de queratina e inhibición coadyuvante de 5α-reductasa',
    mechanismOfAction: 'Cofactor de más de 300 metaloenzimas esenciales para la replicación del ADN y síntesis proteica en queratinocitos. Ejerce una inhibición alostérica no competitiva sinérgica sobre la 5α-reductasa folicular.',
    compatibleVehicles: ['Cápsulas Orales', 'TrichoSol™'],
    standardDosages: '15 mg - 30 mg Zinc Elemental Oral',
    fagronPrograms: ['TrichoTest', 'NutriGen']
  }
};

/**
 * Finds clinical monograph data for any given API name or slug.
 * @param {string} rawName 
 * @returns {Object|null}
 */
export function getFagronClinicalMonograph(rawName) {
  if (!rawName) return null;
  const lower = String(rawName).toLowerCase().trim();

  // 1. Direct key match
  if (FAGRON_CLINICAL_MONOGRAPHS[lower]) {
    return FAGRON_CLINICAL_MONOGRAPHS[lower];
  }

  // 2. Substring search in monograph keys
  for (const [key, mono] of Object.entries(FAGRON_CLINICAL_MONOGRAPHS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return mono;
    }
  }

  // 3. Match against canonical name
  for (const mono of Object.values(FAGRON_CLINICAL_MONOGRAPHS)) {
    const cLower = mono.canonicalName.toLowerCase();
    if (lower.includes(cLower) || cLower.includes(lower)) {
      return mono;
    }
  }

  return null;
}

/**
 * Evaluates whether an extracted dose is within the standard compounding safety range.
 * @param {string} apiName 
 * @param {string} dosageStr 
 * @param {string} route 
 * @returns {{ evaluated: boolean, isWithinStandardRange: boolean, level: string, standardRange: string|null, message: string|null }}
 */
export function checkDosageSafety(apiName, dosageStr, route = 'topical') {
  if (!apiName || !dosageStr) {
    return { evaluated: false, isWithinStandardRange: true, level: 'unrated', standardRange: null, message: null };
  }
  
  const mono = getFagronClinicalMonograph(apiName);
  if (!mono || !mono.standardDosages) {
    return { evaluated: false, isWithinStandardRange: true, level: 'unrated', standardRange: null, message: null };
  }

  const rangeStr = typeof mono.standardDosages === 'string' 
    ? mono.standardDosages 
    : (mono.standardDosages[route] || mono.standardDosages.topical || mono.standardDosages.oral || '');

  // Extract percentage or numerical value with unit
  const numMatch = String(dosageStr).match(/(\d+(?:[.,]\d+)?)\s*(%|mg|mcg|g)/i);
  if (!numMatch) {
    return { evaluated: true, isWithinStandardRange: true, level: 'standard', standardRange: rangeStr, message: `Rango estándar: ${rangeStr}` };
  }

  const val = parseFloat(numMatch[1].replace(',', '.'));
  const unit = numMatch[2].toLowerCase();

  // Range parser, e.g. "0.1% - 0.25%" or "2% - 5%"
  const rangeMatches = [...rangeStr.matchAll(/(\d+(?:[.,]\d+)?)\s*(%|mg|mcg|g)?/gi)];
  if (rangeMatches.length >= 2) {
    const minVal = parseFloat(rangeMatches[0][1].replace(',', '.'));
    const maxVal = parseFloat(rangeMatches[1][1].replace(',', '.'));
    const rangeUnit = (rangeMatches[1][2] || rangeMatches[0][2] || '').toLowerCase();

    if (unit === rangeUnit && !isNaN(minVal) && !isNaN(maxVal)) {
      if (val < minVal * 0.5) {
        return {
          evaluated: true,
          isWithinStandardRange: false,
          level: 'low',
          standardRange: rangeStr,
          message: `Dosis ${dosageStr} es inferior al rango habitual (${rangeStr}).`
        };
      }
      if (val > maxVal * 1.5) {
        return {
          evaluated: true,
          isWithinStandardRange: false,
          level: 'high',
          standardRange: rangeStr,
          message: `Atención: Dosis ${dosageStr} excede el rango habitual (${rangeStr}). Verificar con el prescriptor.`
        };
      }
      return {
        evaluated: true,
        isWithinStandardRange: true,
        level: 'standard',
        standardRange: rangeStr,
        message: `Dosis en rango terapéutico estándar (${rangeStr}).`
      };
    }
  }

  return { evaluated: true, isWithinStandardRange: true, level: 'standard', standardRange: rangeStr, message: `Rango estándar: ${rangeStr}` };
}
