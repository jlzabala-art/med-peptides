/**
 * ancestralMetabolicEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Domain-Driven Ancestral Nutrigenomics & Evolutionary Metabolic Engine.
 *
 * General multi-patient engine that translates autosomal biogeographic ancestry,
 * ethnic/historical affinities, maternal mtDNA + paternal Y-DNA haplogroups, and
 * Neanderthal % into actionable clinical nutrition rules ("Evolutionary Mismatch").
 */

import spiceMatrixConfig from './rules/spiceMatrix.json' with { type: 'json' };

const MENA_SPICE_ALLIES = [
  { spice: 'Extra Virgin Olive Oil (High-Polyphenol)', target: 'NF-κB / Endothelial', clinicalActionEn: 'Oleocanthal & hydroxytyrosol modulate systemic inflammation (2–3 tbsp/day raw).' },
  { spice: 'Nigella Sativa (Black Seed / Habbat al-Barakah)', target: 'AMPK / Glycemic Control', clinicalActionEn: 'Thymoquinone activates AMPK and improves insulin sensitivity (1/2 tsp oil or seeds daily).' },
  { spice: 'Sumac & Za’atar (Wild Thyme + Oregano)', target: 'Phase II Antioxidant', clinicalActionEn: 'Gallic acid & carvacrol provide broad polyphenolic lipid protection in warm meals.' },
  { spice: 'Cumin & Coriander Seed', target: 'Bile Acid & GLUT-4', clinicalActionEn: 'Stimulates bile flow and blunts postprandial glucose excursions (1 tsp daily).' },
  { spice: 'Pomegranate & Hibiscus Polyphenols', target: 'Urolithin-A / Mitophagy', clinicalActionEn: 'Supports mitochondrial renewal and endothelial nitric oxide signaling.' },
];

function detectAncestralMacroCluster(primaryRegion = '', regionalBreakdown = []) {
  const haystack = [primaryRegion, ...(regionalBreakdown || []).map((r) => r.region || r.country || '')]
    .join(' ')
    .toLowerCase();
  if (/egypt|yemen|levant|israel|jordan|syria|lebanon|amazigh|arab|maghreb|north africa|mena|tunisia|libya|sudan/.test(haystack)) {
    return 'mena_levant';
  }
  if (/india|south asia|dravidian|pakistan|bangladesh|sri lanka|indus/.test(haystack)) {
    return 'south_asia';
  }
  return 'general';
}

/**
 * Pure evaluation function: ancestry + SNPs -> Canonical Ancestral Profile
 */
export function evaluateAncestralMetabolicCompatibility({ ancestry = {}, snps = {}, customSpiceMatrix = null } = {}) {
  const haplogroup = ancestry.maternalHaplogroup || "M2a'b";
  const paternalHaplogroup = ancestry.paternalHaplogroup || null;
  const primaryRegion = ancestry.primaryRegion || 'South Asia / Indian Subcontinent';
  const primaryPercent = ancestry.primaryRegionPercent ?? 80.61;
  const neanderthal = ancestry.neanderthalPercent ?? 1.5;
  const cluster = detectAncestralMacroCluster(primaryRegion, ancestry.regionalBreakdown);

  const activeSpiceConfig = customSpiceMatrix || spiceMatrixConfig;

  // 1. Dairy Evolution & Lactase Persistence (MCM6)
  const mcm6 = snps.MCM6_rs4988235 || snps.MCM6 || 'GG';
  const isLactoseIntolerant = mcm6 === 'GG';

  let dairyAdaptation;
  if (isLactoseIntolerant) {
    dairyAdaptation = {
      status: 'Ancestral Non-Pastoral Wild-Type (MCM6 GG)',
      evolutionaryContextEn:
        cluster === 'mena_levant'
          ? 'Even with Nile Valley & Arabian pastoral heritage, your MCM6 GG genotype retains the ancestral post-weaning lactase down-regulation. Traditional MENA/Amazigh diets relied on fermented sheep/goat labneh and aged cheeses rather than fresh industrial A1 cow milk.'
          : 'Your genetic profile represents the ancestral human norm: lactase enzyme synthesis naturally ceases after weaning. Over 85% of indigenous South Asian and Dravidian lineages evolved without industrial cow dairying.',
      evolutionaryContextEs:
        cluster === 'mena_levant'
          ? 'Incluso con herencia del Valle del Nilo y la Península Arábiga, tu genotipo MCM6 GG conserva la regulación ancestral tras el destete. Las dietas tradicionales MENA/Amazigh usaban lácteos fermentados de cabra/oveja (labneh, kéfir) y nunca leche industrial de vaca A1.'
          : 'Tu perfil representa la norma ancestral humana: la producción de lactasa cesa de forma natural tras el destete. Más del 85% de los linajes del sur de Asia e Indo evolucionaron sin ganadería vacuna intensiva.',
      clinicalImpactEn:
        'Modern pasteurized cow’s milk (A1 beta-casein) induces intestinal mucosal hyperpermeability, dysbiosis, and chronic low-grade inflammation. It is NOT a disease or defect—it is evolutionary adaptation.',
      clinicalImpactEs:
        'La leche pasteurizada de vaca comercial (A1) produce hiperpermeabilidad intestinal y microinflamación. NO es un defecto genético: es una adaptación evolutiva a tu entorno ancestral.',
      dietaryProtocolEn: [
        'Strictly eliminate commercial A1 cow’s milk, soft processed cheeses, and ice cream.',
        'Grass-Fed Ghee / Smen (clarified butter) is 100% tolerated because all lactose and casein proteins are precipitated during clarification.',
        'Aged Parmigiano Reggiano (36+ months) and fermented A2 goat/sheep labneh or kefir provide calcium with zero digestive friction.',
      ],
      dietaryProtocolEs: [
        'Eliminar por completo la leche de vaca comercial A1 y quesos blandos industriales.',
        'El Ghee / mantequilla clarificada es 100% tolerado ya que en su clarificado se elimina toda traza de lactosa y caseína.',
        'El Parmigiano curado (+36 meses) y fermentados de cabra/oveja A2 (labneh/kéfir) aportan calcio sin fricción digestiva.',
      ],
    };
  } else {
    dairyAdaptation = {
      status: 'Pastoral Lactase Persistence (MCM6 AA/AG)',
      evolutionaryContextEn:
        cluster === 'mena_levant'
          ? 'Your lineage reflects Arab-Bedouin & North African pastoral selection, retaining adult lactase activity.'
          : 'Your lineage carries the pastoral lactase persistence mutation, enabling adult lactose digestion.',
      evolutionaryContextEs:
        cluster === 'mena_levant'
          ? 'Tu linaje refleja selección pastoral árabe-beduina y norteafricana, conservando lactasa activa en la edad adulta.'
          : 'Tu linaje conserva la mutación pastoral que mantiene activa la lactasa en la edad adulta.',
      clinicalImpactEn: 'Well-tolerated dairy assimilation when consuming organic, unpasteurized, or fermented A2 sources.',
      clinicalImpactEs: 'Buena asimilación de lácteos cuando proceden de fuentes biológicas, A2 o fermentadas.',
      dietaryProtocolEn: ['Consume cultured goat/sheep labneh, kefir, and aged raw cheeses.'],
      dietaryProtocolEs: ['Priorizar lácteos fermentados de cabra/oveja (labneh, kéfir) y quesos curados.'],
    };
  }

  // 2. Grain Evolution & Carbohydrate Sensitivity (IRS1 + FTO + TCF7L2)
  const irs1 = snps.IRS1_rs1801278 || snps.IRS1 || 'TC';
  const fto = snps.FTO_rs9939609 || snps.FTO || 'AC';
  const hasCarbSensitivity = irs1 === 'TC' || irs1 === 'CC' || fto === 'AC' || fto === 'AA';

  let carbohydrateAdaptation;
  if (hasCarbSensitivity) {
    carbohydrateAdaptation = {
      status: `Thrifty Harvest Ancestral Metabolism (IRS1 ${irs1} + FTO ${fto})`,
      evolutionaryContextEn:
        cluster === 'mena_levant'
          ? 'Your deep Natufian & Neolithic Levant/Nile ancestry pioneered early wild barley, einkorn, fava beans (ful), and lentils—high-fiber, slow-release botanicals rather than ultra-refined white wheat or sugary pastries.'
          : 'For millennia, Indus Valley and Southern Indian agriculturalists subsisted on ancient, unpolished, high-fiber millets (Ragi, Jowar, Bajra) and fibrous pulses (mung, lentils, chickpeas) rather than refined white grains.',
      evolutionaryContextEs:
        cluster === 'mena_levant'
          ? 'Tu ancestría Natufiense y del Neolítico del Levante/Nilo se adaptó a cebada silvestre, espelta ancestral, habas (ful) y lentejas ricas en fibra, nunca a harinas blancas ultraprocesadas ni azúcares simples.'
          : 'Durante milenios, las culturas del Valle del Indo y el sur de Asia subsistieron con mijos ancestrales ricos en fibra (Ragi, Jowar, Bajra) y legumbres integrales (mung, lentejas), nunca con harinas refinadas.',
      clinicalImpactEn:
        'Industrial white flour and polished white rice saturate GLUT-4 glucose transporters, causing postprandial insulin spikes and visceral fat storage.',
      clinicalImpactEs:
        'La harina blanca moderna y el arroz blanco pulido saturan los receptores de insulina, provocando picos glucémicos, fatiga vespertina y depósito graso visceral.',
      dietaryProtocolEn:
        cluster === 'mena_levant'
          ? [
              'Mandatory 1-2-3 Plate Sequencing: Bitter/fibrous greens first → olive-oil protein/fish second → whole pulses or ancient grains last.',
              'Swap refined white pita/rice for soaked/sprouted lentils, fava beans, freekeh, or quinoa.',
              'Take 1 tbsp Apple Cider Vinegar or fresh lemon juice with extra-virgin olive oil before starch-heavy meals.',
            ]
          : [
              'Mandatory 1-2-3 Plate Sequencing: Fibrous greens/crucifers first → dense protein second → complex carb last.',
              'Swap commercial white rice and wheat bread for ancestral grains: Ragi (Finger Millet), Quinoa, Lentil flatbreads, and Roasted Sweet Potato.',
              'Add 1 teaspoon of Apple Cider Vinegar or Lemon Juice before high-carb meals to blunt glucose peaks by up to 34%.',
            ],
      dietaryProtocolEs:
        cluster === 'mena_levant'
          ? [
              'Secuenciación de plato 1-2-3 obligatoria: Verduras/hojas amargas primero → Proteína/pescado con AOVE segundo → Legumbre o grano ancestral al final.',
              'Sustituir pan blanco y arroz refinado por lentejas, habas remojadas, freekeh o quinoa.',
              'Tomar 1 cucharada de vinagre de manzana o zumo de limón antes de las comidas para aplanar la curva glucémica.',
            ]
          : [
              'Secuenciación de plato 1-2-3 obligatoria: Verduras y fibra primero → Proteína segundo → Carbohidrato al final.',
              'Sustituir pan blanco y arroz refinado por mijos ancestrales (Ragi, Jowar), quinoa y lentejas.',
              'Tomar 1 cucharada de vinagre de manzana o limón antes de las comidas para aplanar la curva de glucosa.',
            ],
    };
  } else {
    carbohydrateAdaptation = {
      status: 'Balanced Glycemic Flexibility (IRS1 Wild-Type)',
      evolutionaryContextEn: 'Normal insulin receptor sensitivity across varied dietary carbohydrate densities.',
      evolutionaryContextEs: 'Sensibilidad equilibrada a los carbohidratos.',
      clinicalImpactEn: 'Stable postprandial glucose regulation.',
      clinicalImpactEs: 'Regulación glucémica estable.',
      dietaryProtocolEn: ['Maintain balanced unrefined whole grains, pulses, and seasonal vegetables.'],
      dietaryProtocolEs: ['Mantener carbohidratos complejos integrales, legumbres y vegetales de temporada.'],
    };
  }

  // 3. Ancestral Pharmacological Spice & Botanical Matrix
  const spiceMatrix =
    cluster === 'mena_levant'
      ? {
          titleEn: 'MENA & Levantine Botanical Polyphenol Shield',
          titleEs: 'Escudo Botánico y Polifenólico MENA / Levante',
          evolutionaryContextEn:
            'Nile Valley, Levantine, and Amazigh populations evolved around olive polyphenols, black seed (Nigella sativa), sumac, cumin, and pomegranate bioactives.',
          evolutionaryContextEs:
            'Las poblaciones del Valle del Nilo, Levante y Amazigh coevolucionaron con polifenoles del aceite de oliva, semilla negra (Nigella sativa), zumaque, comino y granada.',
          keyAllies: MENA_SPICE_ALLIES,
        }
      : {
          titleEn: activeSpiceConfig.name || 'Ancestral Pharmacological Spice Shield',
          titleEs: 'Escudo Farmacológico de Especias Ancestrales',
          evolutionaryContextEn:
            'Indigenous Southern Asian and Harappan civilizations co-evolved with a distinct botanical pharmacopeia that protected metabolic health in warm climates.',
          evolutionaryContextEs:
            'Las civilizaciones autóctonas del sur de Asia e Indo coevolucionaron con una farmacopea botánica de especias que protegía la salud celular.',
          keyAllies: activeSpiceConfig.allies || [],
        };

  // 4. Maternal (mtDNA) & Paternal (Y-DNA) Lineage + Mitochondrial Longevity
  const isMaternalM = String(haplogroup).toUpperCase().startsWith('M');
  const isMaternalH = String(haplogroup).toUpperCase().startsWith('H');
  const mitochondrialProfile = {
    haplogroup,
    paternalHaplogroup,
    rootLineage:
      ancestry.maternalHaplogroupRoot ||
      (isMaternalH
        ? `Haplogroup ${haplogroup} (West Asia / Mediterranean Lineage ~12,846 BP)`
        : isMaternalM
          ? 'Haplogroup M (Out-of-Africa Southern Coastal Lineage ~49,590 BP)'
          : 'Eurasian / Global Lineage'),
    clinicalRelevanceEn: isMaternalH
      ? `Maternal Haplogroup ${haplogroup} (West Asia / Mediterranean branch of HV) shows high mitochondrial coupling efficiency suited to warm-temperate coastal diets, circadian sun alignment, and polyphenol-rich olive/marine nutrition.${paternalHaplogroup ? ` Paternal Y-DNA ${paternalHaplogroup} traces an ancient Eurasian migration corridor.` : ''}`
      : isMaternalM
        ? 'Maternal Haplogroup M lineages carry mitochondrial DNA specialized for metabolic endurance under antioxidant-rich botanical ecosystems. They thrive when supported with mitochondrial cofactors (CoQ10 Ubiquinol, Magnesium Bisglycinate) and 14-hour overnight circadian fasting.'
        : 'Mitochondrial lineage calibrated for balanced oxidative phosphorylation and cellular energy production.',
    clinicalRelevanceEs: isMaternalH
      ? `El linaje materno ${haplogroup} (rama del haplogrupo H en Asia Occidental/Mediterráneo) muestra una elevada eficiencia mitocondrial adaptada a dietas ricas en polifenoles marinos y de oliva, y exposición solar circadiana.${paternalHaplogroup ? ` El linaje paterno Y-DNA ${paternalHaplogroup} confirma una ruta ancestral euroasiática.` : ''}`
      : isMaternalM
        ? "El linaje materno M2a'b presenta un ADN mitocondrial adaptado a una dieta alta en antioxidantes y polifenoles. Responde de forma sobresaliente a cofactores como CoQ10 (Ubiquinol), Magnesio Bisglicinato y ayuno circadiano de 14 horas."
        : 'Linaje mitocondrial equilibrado para la fosforilación oxidativa.',
    lifestylePrescriptionsEn: [
      '14-Hour Circadian Fast (e.g. Finish dinner by 20:00, breakfast at 10:00) to trigger mitochondrial mitophagy.',
      'Daily morning natural sunlight (15 min) + Vitamin D3/K2 monitoring (critical when living indoors relative to ancestral latitude).',
      'Targeted mitochondrial trio: CoQ10 (100mg) + Magnesium Bisglycinate (300mg) + R-Alpha Lipoic Acid.',
    ],
    lifestylePrescriptionsEs: [
      'Ayuno circadiano de 14 horas (cenar antes de las 20:00, desayuno a las 10:00) para estimular la mitofagia.',
      '15 minutos de sol matinal + control de Vitamina D3/K2 (clave al vivir en interiores respecto a la latitud ancestral).',
      'Trío de soporte mitocondrial: CoQ10 (100mg) + Magnesio Bisglicinato (300mg) + Ácido R-Alfa Lipoico.',
    ],
  };

  // 5. Dynamic Neanderthal DNA Rule
  const neanderthalRule =
    Number(neanderthal) >= 1.0
      ? {
          status: `Active Archaic Introgression (${neanderthal}%)`,
          noteEn: 'Elevated Neanderthal fraction (>1%) warrants closer monitoring of innate immune TLR pathways, lipid clearance, and postprandial inflammation.',
          noteEs: `Fracción neandertal relevante (${neanderthal}%): priorizar control antiinflamatorio, perfil lipídico y respuesta inmune innata.`,
        }
      : {
          status: `Minimal / Zero Archaic Load (${neanderthal}%)`,
          noteEn: 'Zero Neanderthal admixture detected; metabolic & immune calibration focuses purely on modern Holocene regional variants.',
          noteEs: `0% de carga neandertal detectada; la calibración metabólica se centra íntegramente en variantes regionales modernas del Holoceno.`,
        };

  // 6. Genotype -> Peptide & Clinical Formulation Synergy Bridge
  const peptideSynergyMatches = [
    ...(hasCarbSensitivity
      ? [{ name: 'Tirzepatide / Semaglutide + B12', slug: 'tirzepatide', rationale: `Supports insulin sensitivity & satiety signaling (${irs1}/${fto} metabolic phenotype).` }]
      : []),
    ...(isLactoseIntolerant
      ? [{ name: 'BPC-157 (Gastric & Mucosal Repair)', slug: 'bpc-157', rationale: 'Protects gut epithelial tight junctions against modern A1 dairy/dietary friction.' }]
      : []),
    { name: 'NAD+ / CoQ10 Cellular Longevity', slug: 'nad', rationale: `Optimizes oxidative phosphorylation for maternal mtDNA ${haplogroup}.` },
    { name: 'GHK-Cu + Colway Native Collagen', slug: 'ghk-cu', rationale: 'Dermal & follicular extracellular matrix repair aligned with botanical polyphenols.' },
  ];

  return {
    sampleCode: ancestry.sampleCode || 'G000943568',
    macroCluster: cluster,
    primaryRegion,
    primaryPercent,
    neanderthalPercent: neanderthal,
    neanderthalRule,
    regionalBreakdown: ancestry.regionalBreakdown || [],
    ethnicBreakdown: ancestry.ethnicBreakdown || [],
    archaeologicalAffinities: ancestry.archaeologicalAffinities || [],
    maternalHaplogroup: haplogroup,
    paternalHaplogroup,
    dairyAdaptation,
    carbohydrateAdaptation,
    spiceMatrix,
    mitochondrialProfile,
    peptideSynergyMatches,
    clinicalSynthesisEn:
      cluster === 'mena_levant'
        ? `Your ancestral heritage (${primaryPercent}% ${primaryRegion}, Maternal ${haplogroup}${paternalHaplogroup ? `, Paternal ${paternalHaplogroup}` : ''}, ${neanderthal}% Neanderthal) reflects millennia of Nile Valley, Levantine & Amazigh adaptation to olive polyphenols, fermented A2 dairy, and high-fiber pulses.`
        : `Your ancestral heritage (${primaryPercent}% ${primaryRegion}, Haplogroup ${haplogroup}) represents thousands of years of metabolic adaptation to ancient millets, high-fiber pulses, clarified ghee, and an extraordinary antioxidant spice matrix.`,
    clinicalSynthesisEs:
      cluster === 'mena_levant'
        ? `Tu herencia ancestral (${primaryPercent}% ${primaryRegion}, Materno ${haplogroup}${paternalHaplogroup ? `, Paterno ${paternalHaplogroup}` : ''}, ${neanderthal}% Neandertal) refleja milenios de adaptación al Valle del Nilo, Levante y cultura Amazigh, optimizada para polifenoles del olivo, fermentados A2 y legumbres integrales.`
        : `Tu herencia ancestral (${primaryPercent}% ${primaryRegion}, Haplogrupo ${haplogroup}) refleja milenios de adaptación a mijos ancestrales, legumbres integrales, ghee clarificado y un escudo farmacológico de especias.`,
  };
}
