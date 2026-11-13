/**
 * ancestralMetabolicEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Domain-Driven Ancestral Nutrigenomics & Evolutionary Metabolic Engine.
 *
 * Translates autosomal biogeographic ancestry and maternal mitochondrial
 * haplogroup lineages into actionable clinical nutrition rules, explaining the
 * "Evolutionary Mismatch" between ancient genome adaptations and modern industrial diets.
 */

/**
 * Pure evaluation function: ancestry + SNPs -> Canonical Ancestral Profile
 */
export function evaluateAncestralMetabolicCompatibility({ ancestry = {}, snps = {} } = {}) {
  const haplogroup = ancestry.maternalHaplogroup || "M2a'b";
  const primaryRegion = ancestry.primaryRegion || 'South Asia / Indian Subcontinent';
  const primaryPercent = ancestry.primaryRegionPercent || 80.61;
  const neanderthal = ancestry.neanderthalPercent || 1.5;

  // 1. Dairy Evolution & Lactase Persistence (MCM6)
  const mcm6 = snps.MCM6_rs4988235 || snps.MCM6 || 'GG';
  const isLactoseIntolerant = mcm6 === 'GG';

  let dairyAdaptation;
  if (isLactoseIntolerant) {
    dairyAdaptation = {
      status: 'Ancestral Non-Pastoral Wild-Type (MCM6 GG)',
      evolutionaryContextEn:
        'Your genetic profile represents the ancestral human norm: lactase enzyme synthesis naturally ceases after weaning. Over 85% of indigenous South Asian and Dravidian lineages evolved without industrial cow dairying.',
      evolutionaryContextEs:
        'Tu perfil representa la norma ancestral humana: la producción de lactasa cesa de forma natural tras el destete. Más del 85% de los linajes del sur de Asia e Indo evolucionaron sin ganadería vacuna intensiva.',
      clinicalImpactEn:
        'Modern pasteurized cow’s milk (A1 beta-casein) induces intestinal mucosal hyperpermeability, dysbiosis, and chronic low-grade inflammation. It is NOT a disease or defect—it is evolutionary adaptation.',
      clinicalImpactEs:
        'La leche pasteurizada de vaca comercial (A1) produce hiperpermeabilidad intestinal y microinflamación. NO es un defecto genético: es una adaptación evolutiva a tu entorno ancestral.',
      dietaryProtocolEn: [
        'Strictly eliminate commercial A1 cow’s milk, soft processed cheeses, and ice cream.',
        'Grass-Fed Ghee (clarified butter) is 100% tolerated because all lactose and casein proteins are precipitated during clarification.',
        'Aged Parmigiano Reggiano (36+ months) and fermented A2 goat/sheep labneh or kefir provide calcium with zero digestive friction.'
      ],
      dietaryProtocolEs: [
        'Eliminar por completo la leche de vaca comercial A1 y quesos blandos industriales.',
        'El Ghee de pasto es 100% tolerado ya que en su clarificado se elimina toda traza de lactosa y caseína.',
        'El Parmigiano curado (+36 meses) y fermentados de cabra/oveja A2 aportan calcio sin fricción digestiva.'
      ]
    };
  } else {
    dairyAdaptation = {
      status: 'Pastoral Lactase Persistence (MCM6 AA/AG)',
      evolutionaryContextEn: 'Your lineage carries the pastoral lactase persistence mutation, enabling adult lactose digestion.',
      evolutionaryContextEs: 'Tu linaje conserva la mutación pastoral que mantiene activa la lactasa en la edad adulta.',
      clinicalImpactEn: 'Well-tolerated dairy assimilation when consuming organic, unpasteurized, or fermented sources.',
      clinicalImpactEs: 'Buena asimilación de lácteos cuando proceden de fuentes biológicas o fermentadas.',
      dietaryProtocolEn: ['Consume cultured goat/sheep dairy and aged raw cheeses.'],
      dietaryProtocolEs: ['Priorizar lácteos de cabra/oveja y quesos curados.']
    };
  }

  // 2. Grain Evolution & Carbohydrate Sensitivity (IRS1 + FTO + TCF7L2)
  const irs1 = snps.IRS1_rs1801278 || snps.IRS1 || 'TC';
  const fto = snps.FTO_rs9939609 || snps.FTO || 'AC';
  const hasCarbSensitivity = irs1 === 'TC' || irs1 === 'CC' || fto === 'AC' || fto === 'AA';

  let carbohydrateAdaptation;
  if (hasCarbSensitivity) {
    carbohydrateAdaptation = {
      status: 'Thrifty Harvest Ancestral Metabolism (IRS1 TC + FTO AC)',
      evolutionaryContextEn:
        'For millennia, Indus Valley and Southern Indian agriculturalists subsisted on ancient, unpolished, high-fiber millets (Ragi, Jowar, Bajra) and fibrous pulses (mung, lentils, chickpeas) rather than refined white grains.',
      evolutionaryContextEs:
        'Durante milenios, las culturas del Valle del Indo y el sur de Asia subsistieron con mijos ancestrales ricos en fibra (Ragi, Jowar, Bajra) y legumbres integrales (mung, lentejas), nunca con harinas refinadas.',
      clinicalImpactEn:
        'Industrial wheat flour (maida, naan, white sandwich bread) and quick-cooking polished white rice saturate the GLUT-4 glucose transporters, causing an intense postprandial insulin spike and subsequent afternoon fatigue.',
      clinicalImpactEs:
        'La harina blanca moderna (maida, pan blanco) y el arroz blanco pulido saturan los receptores de insulina, provocando caídas de energía por la tarde y depósito graso visceral.',
      dietaryProtocolEn: [
        'Mandatory 1-2-3 Plate Sequencing: Fibrous greens/crucifers first → dense protein second → complex carb last.',
        'Swap commercial white rice and wheat bread for ancestral grains: Ragi (Finger Millet), Quinoa, Lentil flatbreads, and Roasted Sweet Potato.',
        'Add 1 teaspoon of Apple Cider Vinegar or Lemon Juice before high-carb meals to blunt glucose peaks by up to 34%.'
      ],
      dietaryProtocolEs: [
        'Secuenciación de plato 1-2-3 obligatoria: Verduras y fibra primero → Proteína segundo → Carbohidrato al final.',
        'Sustituir pan blanco y arroz refinado por mijos ancestrales (Ragi, Jowar), quinoa y lentejas.',
        'Tomar 1 cucharada de vinagre de manzana o limón antes de las comidas para aplanar la curva de glucosa.'
      ]
    };
  } else {
    carbohydrateAdaptation = {
      status: 'Balanced Glycemic Flexibility (IRS1 Wild-Type)',
      evolutionaryContextEn: 'Normal insulin receptor sensitivity across varied dietary carbohydrate densities.',
      evolutionaryContextEs: 'Sensibilidad equilibrada a los carbohidratos.',
      clinicalImpactEn: 'Stable postprandial glucose regulation.',
      clinicalImpactEs: 'Regulación glucémica estable.',
      dietaryProtocolEn: ['Maintain balanced unrefined whole grains and seasonal root vegetables.'],
      dietaryProtocolEs: ['Mantener carbohidratos complejos integrales y tubérculos.']
    };
  }

  // 3. Ancestral Pharmacological Spice Matrix & Phase II Detoxification
  const spiceMatrix = {
    titleEn: 'Ancestral Pharmacological Spice Shield',
    titleEs: 'Escudo Farmacológico de Especias Ancestrales',
    evolutionaryContextEn:
      'Indigenous Southern Asian and Harappan civilizations co-evolved with a distinct botanical pharmacopeia that protected metabolic health in warm climates.',
    evolutionaryContextEs:
      'Las civilizaciones autóctonas del sur de Asia e Indo coevolucionaron con una farmacopea botánica de especias que protegía la salud celular.',
    keyAllies: [
      {
        spice: 'Turmeric + Black Pepper (Curcumin + Piperine)',
        target: 'NF-kB & Systemic Anti-Inflammation',
        clinicalActionEn: 'Downregulates pro-inflammatory cytokines (IL-6, TNF-a) and protects vascular endothelial integrity.',
        clinicalActionEs: 'Frena citocinas inflamatorias (IL-6, TNF-a) y protege el endotelio vascular.'
      },
      {
        spice: 'Ceylon Cinnamon (True Cinnamon)',
        target: 'Insulin Sensitivity & GLUT-4 Translocation',
        clinicalActionEn: 'Mimics insulin signaling to facilitate cellular glucose uptake without triggering hyperinsulinemia.',
        clinicalActionEs: 'Facilita la entrada de glucosa en la célula sin disparar picos excesivos de insulina.'
      },
      {
        spice: 'Fresh Ginger (Gingerols & Shogaols)',
        target: 'Migrating Motor Complex (MMC) & Gastric Emptying',
        clinicalActionEn: 'Stimulates digestive motility, prevents small intestinal bacterial overgrowth (SIBO), and enhances bile acid secretion.',
        clinicalActionEs: 'Estimula el vaciado gástrico y previene el sobrecrecimiento bacteriano (SIBO).'
      },
      {
        spice: 'Fenugreek & Cardamom',
        target: 'Lipid Digestion & Microbiome Diversity',
        clinicalActionEn: 'Improves digestive comfort and feeds beneficial Akkermansia muciniphila strains in the colonic mucosa.',
        clinicalActionEs: 'Favorece la flora protectora Akkermansia muciniphila en el colon.'
      }
    ]
  };

  // 4. Maternal Lineage & Mitochondrial Longevity (Haplogroup M2a'b)
  const isMaternalM = String(haplogroup).toUpperCase().startsWith('M');
  const mitochondrialProfile = {
    haplogroup,
    rootLineage: ancestry.maternalHaplogroupRoot || (isMaternalM ? 'Haplogroup M (Out-of-Africa Southern Coastal Lineage ~49,590 BP)' : 'Eurasian Lineage'),
    clinicalRelevanceEn: isMaternalM
      ? 'Maternal Haplogroup M lineages carry mitochondrial DNA specialized for metabolic endurance under antioxidant-rich botanical ecosystems. They thrive when supported with mitochondrial cofactors (CoQ10 Ubiquinol, Magnesium Bisglycinate) and 14-hour overnight circadian fasting.'
      : 'Mitochondrial lineage calibrated for balanced oxidative phosphorylation and cellular energy production.',
    clinicalRelevanceEs: isMaternalM
      ? 'El linaje materno M2a\'b presenta un ADN mitocondrial adaptado a una dieta alta en antioxidantes y polifenoles. Responde de forma sobresaliente a cofactores como CoQ10 (Ubiquinol), Magnesio Bisglicinato y ayuno circadiano de 14 horas.'
      : 'Linaje mitocondrial equilibrado para la fosforilación oxidativa.',
    lifestylePrescriptionsEn: [
      '14-Hour Circadian Fast (e.g. Finish dinner by 20:00, breakfast at 10:00) to trigger mitochondrial mitophagy.',
      'Daily morning natural sunlight (15 min) to reset retinal melanopsin and optimize cellular ATP generation.',
      'Targeted mitochondrial trio: CoQ10 (100mg) + Magnesium Bisglycinate (300mg) + R-Alpha Lipoic Acid.'
    ],
    lifestylePrescriptionsEs: [
      'Ayuno circadiano de 14 horas (cenar antes de las 20:00, desayuno a las 10:00) para estimular la mitofagia.',
      '15 minutos de sol matinal para sincronizar el ritmo circadiano y la producción de ATP.',
      'Trío de soporte mitocondrial: CoQ10 (100mg) + Magnesio Bisglicinato (300mg) + Ácido R-Alfa Lipoico.'
    ]
  };

  return {
    sampleCode: ancestry.sampleCode || 'G000943568',
    primaryRegion,
    primaryPercent,
    neanderthalPercent: neanderthal,
    regionalBreakdown: ancestry.regionalBreakdown || [],
    archaeologicalAffinities: ancestry.archaeologicalAffinities || [],
    maternalHaplogroup: haplogroup,
    dairyAdaptation,
    carbohydrateAdaptation,
    spiceMatrix,
    mitochondrialProfile,
    clinicalSynthesisEn: `Your ancestral heritage (${primaryPercent}% ${primaryRegion}, Haplogroup ${haplogroup}) represents thousands of years of metabolic adaptation to ancient millets, high-fiber pulses, clarified ghee, and an extraordinary antioxidant spice matrix. By eliminating modern industrial cow dairy and polished white flour, and restoring the 1-2-3 plate sequence, your genetics operate in complete evolutionary harmony.`,
    clinicalSynthesisEs: `Tu herencia ancestral (${primaryPercent}% ${primaryRegion}, Haplogrupo ${haplogroup}) refleja milenios de adaptación a mijos ancestrales, legumbres integrales, ghee clarificado y un escudo farmacológico de especias. Al eliminar la leche de vaca comercial y harinas blancas refinadas, tu metabolismo recupera la armonía evolutiva original.`
  };
}
