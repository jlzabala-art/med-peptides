/**
 * src/data/clinicalDosageRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Evidence-based clinical dosage registry for Compounding APIs (Pharmapolis / UltraPerson).
 * Formulated according to European Pharmacopoeia (Ph.Eur), EFSA safety monographs,
 * and clinical compounding best practices.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CLINICAL_DOSAGE_REGISTRY = {
  // ── Vitaminas y Cofactores ──────────────────────────────────────────────────
  'biotin': {
    min: 1, standard: 5, max: 10, step: 0.5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Salud folicular y síntesis de queratina', en: 'Follicular health and keratin synthesis' },
    clinicalRationale: {
      es: 'Dosis clínica óptima de 5 mg (5.000 mcg) para acelerar el anclaje folicular y síntesis de queratina sin saturar transportadores SMVT.',
      en: 'Optimal 5 mg (5,000 mcg) clinical dose for hair follicle anchorage and keratin matrix synthesis without SMVT transporter saturation.'
    },
    yieldNote: { es: 'D-Biotina 98% USP: 5 mg aportan 4.9 mg de biotina pura.', en: 'D-Biotin 98% USP: 5 mg yields 4.9 mg pure biotin.' },
    counselingAlert: {
      es: '⚠️ Advertencia analítica obligatoria: La biotina a dosis ≥ 2.500 mcg interfiere con inmunoensayos de laboratorio (falsos resultados de TSH tiroidea y troponina cardíaca). Suspender 48–72 horas antes de análisis de sangre.',
      en: '⚠️ Mandatory lab interference warning: Biotin at ≥ 2.5 mg causes false results in streptavidin immunoassays (falsely low TSH, inaccurate cardiac troponin). Discontinue 48–72 hours prior to bloodwork.'
    }
  },
  'beta-carotene': {
    min: 50, standard: 100, max: 150, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Protección fotocutánea y mucosas', en: 'Photocutaneous defense & mucosal integrity' },
    clinicalRationale: {
      es: '100 mg de microesferas CWS al 10% aportan 10 mg de beta-caroteno puro (~16.600 UI provitamina A), protegiendo membranas celulares sin toxicidad retiniana.',
      en: '100 mg of 10% CWS beadlets yields 10 mg pure beta-carotene (~16,600 IU provitamin A), shielding cell membranes without retinol toxicity.'
    },
    yieldNote: { es: '10% CWS: 100 mg = 10 mg beta-caroteno activo.', en: '10% CWS: 100 mg = 10 mg active beta-carotene.' }
  },
  'vitamin a (retinol)': {
    min: 5, standard: 10, max: 20, step: 2.5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Diferenciación epitelial y visión nocturna', en: 'Epithelial differentiation & night vision' },
    clinicalRationale: {
      es: '10 mg de polvo 500 CWS aportan 5.000 UI de retinol activo; dosis fisiológica diaria que preserva la renovación epitelial.',
      en: '10 mg of 500 CWS powder provides 5,000 IU active retinol, supporting epithelial turnover safely.'
    }
  },
  'vitamin c (ascorbic acid)': {
    min: 100, standard: 250, max: 500, step: 50, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Hidroxilación de colágeno y defensa antioxidante', en: 'Collagen hydroxylation & antioxidant defense' },
    clinicalRationale: {
      es: '250 mg es la dosis ideal por cápsula que satura los transportadores SVCT1 intestinales con máxima biodisponibilidad y sin molestias gástricas.',
      en: '250 mg per capsule optimizes intestinal SVCT1 transporter saturation with maximum bioavailability and no GI distress.'
    }
  },
  'vitamin d3 (cholecalciferol)': {
    min: 10, standard: 20, max: 40, step: 5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Regulación del eje inmune y mineralización ósea', en: 'Immune axis modulation & bone density' },
    clinicalRationale: {
      es: '20 mg de polvo 100.000 UI/g aportan 2.000 UI de Vitamina D3, la dosis de mantenimiento recomendada por consensos endocrinológicos.',
      en: '20 mg of 100,000 IU/g powder yields 2,000 IU Vitamin D3, standard clinical endocrine maintenance dose.'
    },
    yieldNote: { es: '100.000 UI/g: 20 mg = 2.000 UI Vit D3.', en: '100,000 IU/g: 20 mg = 2,000 IU Vit D3.' }
  },
  'vitamin e (mixed tocopherols)': {
    min: 50, standard: 100, max: 200, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Escudo lipófilo contra peroxidación de membranas', en: 'Lipophilic cell membrane antioxidant shield' },
    clinicalRationale: {
      es: '100 mg de tocoferoles mixtos aportan ~50 mg de tocoferoles naturales (alfa, beta, gamma, delta), protegiendo ácidos grasos de membrana.',
      en: '100 mg mixed tocopherols delivers ~50 mg natural tocopherols, shielding lipid bilayers from peroxidation.'
    }
  },
  'vitamin k2 (mk-7)': {
    min: 5, standard: 10, max: 15, step: 2.5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Carboxilación de osteocalcina y protección vascular MGP', en: 'Osteocalcin carboxylation & arterial MGP activation' },
    clinicalRationale: {
      es: '10 mg de polvo MK-7 al 1.3% aportan 130 mcg de menaquinona-7 trans-bioactiva, dirigiendo el calcio hacia hueso y evitando calcificación arterial.',
      en: '10 mg of 1.3% MK-7 powder delivers 130 mcg active menaquinone-7, directing calcium to bones away from vessels.'
    },
    yieldNote: { es: '1.3% MK-7: 10 mg = 130 mcg K2 activa.', en: '1.3% MK-7: 10 mg = 130 mcg active K2.' },
    counselingAlert: {
      es: '⚠️ Anticoagulación (AVK): La Vitamina K2 antagoniza directamente el mecanismo de anticoagulantes como warfarina o acenocumarol (Sintrom). Contraindicado en pacientes bajo terapia AVK sin monitorización estricta de INR.',
      en: '⚠️ Anticoagulation alert: Vitamin K2 directly antagonizes vitamin K antagonist drugs (warfarin/acenocoumarol). Contraindicated in patients on VKAs without strict INR monitoring.'
    }
  },
  'vitamin b complex methylated': {
    min: 25, standard: 50, max: 100, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Metilación sistémica y cofactores enzimáticos', en: 'Systemic methylation & enzyme cofactors' },
    clinicalRationale: {
      es: '50 mg de premezcla con formas activas (metilcobalamina, P-5-P, L-5-MTHF) garantizan biodisponibilidad directa sin cuellos de botella genéticos.',
      en: '50 mg methylated premix ensures active forms bypass enzymatic conversion bottlenecks (MTHFR).'
    }
  },
  'vitamin b1 (thiamine hcl)': {
    min: 25, standard: 50, max: 100, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Metabolismo glucídico y conducción nerviosa', en: 'Glucose metabolism & neuronal signaling' },
    clinicalRationale: { es: '50 mg como cofactor esencial de piruvato deshidrogenasa en la respiración mitocondrial.', en: '50 mg cofactor for pyruvate dehydrogenase in mitochondrial respiration.' }
  },
  'vitamin b2 (riboflavin)': {
    min: 15, standard: 30, max: 50, step: 5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Cofactor FAD/FMN y reciclaje de glutatión', en: 'FAD/FMN cofactor & glutathione recycling' },
    clinicalRationale: { es: '30 mg soporta la enzima glutatión reductasa y la cadena de transporte de electrones compleja II.', en: '30 mg supports glutathione reductase and respiratory chain complex II.' }
  },
  'vitamin b5 (calcium pantothenate)': {
    min: 25, standard: 50, max: 150, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Precursor de Coenzima A y soporte adrenal', en: 'Coenzyme A precursor & adrenal synthesis' },
    clinicalRationale: { es: '50 mg como sustrato directo para síntesis de acetil-CoA y hormonas esteroideas adrenales.', en: '50 mg precursor for acetyl-CoA synthesis and steroidogenesis.' }
  },
  'vitamin b6 (p-5-p)': {
    min: 10, standard: 25, max: 50, step: 5, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Metabolismo de neurotransmisores y homocisteína', en: 'Neurotransmitter synthesis & transsulfuration' },
    clinicalRationale: { es: '25 mg de piridoxal-5-fosfato es la forma coenzimática biológicamente activa directa, evitando toxicidad por piridoxina no fosforilada.', en: '25 mg active P-5-P bypasses hepatic conversion and prevents peripheral neuropathy.' }
  },
  'vitamin b9 (methylfolate)': {
    min: 0.4, standard: 0.8, max: 1.5, step: 0.1, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Donante de monocarbonos y remetilación de homocisteína', en: 'One-carbon donor & homocysteine remethylation' },
    clinicalRationale: { es: '0.8 mg (800 mcg) de L-5-MTHF atraviesa la barrera hematoencefálica y compensa polimorfismos MTHFR C677T/A1298C.', en: '0.8 mg (800 mcg) L-5-MTHF crosses BBB, directly remethylating homocysteine regardless of MTHFR SNPs.' },
    pairingRequirement: {
      es: '⚠️ Co-prescripción requerida: El metilfolato debe acompañarse siempre de Vitamina B12 (Metilcobalamina ≥ 500 mcg) para prevenir el enmascaramiento de anemia por déficit de B12 y evitar la progresión de daño neurológico.',
      en: '⚠️ Mandatory pairing: Methylfolate must always be co-prescribed with Vitamin B12 (Methylcobalamin ≥ 500 mcg) to prevent masking B12 deficiency anemia and irreversible neurological subacute degeneration.'
    }
  },
  'vitamin b12 (methylcobalamin)': {
    min: 0.5, standard: 1.0, max: 2.0, step: 0.1, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Vaina de mielina y síntesis de ADN', en: 'Myelin sheath maintenance & DNA synthesis' },
    clinicalRationale: { es: '1.0 mg (1.000 mcg) de metilcobalamina garantiza absorción transmucosa pasiva (1%) incluso con factor intrínseco deficiente.', en: '1.0 mg (1,000 mcg) ensures passive transmucosal uptake (1%) independent of gastric intrinsic factor.' }
  },
  'd-panthenol (provitamin b5)': {
    min: 25, standard: 50, max: 150, step: 25, unit: 'mg',
    category: 'vitamin',
    indication: { es: 'Hidratación celular y cutícula capilar', en: 'Cellular hydration & hair cuticle repair' },
    clinicalRationale: { es: '50 mg apoya la proliferación del queratinocito y regeneración epitelial.', en: '50 mg supports keratinocyte proliferation and epithelial repair.' }
  },

  // ── Minerales y Oligoelementos ──────────────────────────────────────────────
  'zinc (gluconate)': {
    min: 15, standard: 30, max: 50, step: 5, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Función tímica, queratinización e inmunidad', en: 'Thymic function, keratinization & immunity' },
    clinicalRationale: {
      es: '30 mg de gluconato de zinc aporta ~4.3 mg de zinc elemental quelado, seguro para uso continuado sin competir con el transporte de cobre.',
      en: '30 mg zinc gluconate provides ~4.3 mg elemental zinc, safe for chronic use without copper depletion.'
    },
    yieldNote: {
      es: 'Gluconato de zinc: 14.3% zinc elemental. 15 mg de sal = 2.1 mg elemental (subterapéutico); 30 mg = 4.3 mg elemental; 105 mg de sal = 15 mg elemental. Preferir Zinc Bisglicinato (TRAACS®) para 15–25 mg de zinc elemental neto.',
      en: 'Zinc gluconate: 14.3% elemental zinc. 15 mg salt = 2.1 mg elemental (sub-therapeutic); 30 mg salt = 4.3 mg elemental; 105 mg salt = 15 mg elemental. Prefer Zinc Bisglycinate for 15–25 mg net elemental zinc.'
    }
  },
  'copper (bisglycinate)': {
    min: 1, standard: 2, max: 3, step: 0.5, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Enzimas cuprodependientes (lisil oxidasa y SOD1)', en: 'Cuproenzymes: lysyl oxidase and Cu/Zn SOD1' },
    clinicalRationale: {
      es: '2 mg quelado con glicina restaura el ratio fisiológico Zn:Cu (10:1 o 15:1) y apoya la síntesis de elastina y colágeno.',
      en: '2 mg bisglycinate preserves physiological Zn:Cu balance (10:1) and crosslinks extracellular collagen.'
    }
  },
  'magnesium (glycinate)': {
    min: 150, standard: 300, max: 500, step: 50, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Relajación neuromuscular y activación ATPasa', en: 'Neuromuscular relaxation & ATP hydrolysis cofactor' },
    clinicalRationale: {
      es: '300 mg de bisglicinato aporta magnesio quelado de máxima tolerancia gastrointestinal y efecto calmante sobre el receptor NMDA.',
      en: '300 mg bisglycinate offers high bioabsorption with zero laxative effect and central NMDA modulation.'
    }
  },
  'selenium (selenomethionine)': {
    min: 25, standard: 50, max: 100, step: 25, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Glutatión peroxidasa y conversión T4 a T3', en: 'Glutathione peroxidase & deiodinase activation' },
    clinicalRationale: {
      es: '50 mg de L-selenometionina al 0.2% aporta 100 mcg de selenio elemental bioasimilable, activando la glutatión peroxidasa GPx1.',
      en: '50 mg of 0.2% selenomethionine yields 100 mcg elemental selenium, powering antioxidant GPx enzymes.'
    },
    yieldNote: { es: '0.2%: 50 mg polvo = 100 mcg selenio puro.', en: '0.2%: 50 mg powder = 100 mcg pure selenium.' }
  },
  'manganese': {
    min: 2, standard: 5, max: 10, step: 1, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Enzima mitocondrial Mn-SOD y síntesis de proteoglicanos', en: 'Mitochondrial Mn-SOD & proteoglycan synthesis' },
    clinicalRationale: { es: '5 mg como cofactor esencial de Mn-SOD para neutralizar anión superóxido en la matriz mitocondrial.', en: '5 mg cofactor for Mn-SOD dismutating superoxide within mitochondria.' }
  },
  'siliciumax': {
    min: 100, standard: 250, max: 500, step: 25, unit: 'mg',
    category: 'mineral',
    indication: { es: 'Síntesis de colágeno, anclaje óseo y grosor capilar', en: 'Collagen synthesis, bone density & hair shaft diameter' },
    clinicalRationale: { es: '250 mg de silicio biooptimizado SiliciuMax® incrementa la síntesis de colágeno tipo I y el grosor del tallo folicular.', en: '250 mg bioavailable SiliciuMax® silicon increases prolyl hydroxylase activity and hair tensile strength.' }
  },

  // ── Aminoácidos y Péptidos Fisiológicos ─────────────────────────────────────
  'bcaa complex': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Señalización mTOR, síntesis proteica y reserva anticatabólica', en: 'mTOR phosphorylation, protein synthesis & anticatabolic reserve' },
    clinicalRationale: {
      es: '500 mg en ratio 2:1:1 (leucina/isoleucina/valina) proporciona el estímulo umbral de leucina en cápsula sin sobrecargar el volumen galénico.',
      en: '500 mg at 2:1:1 provides the essential leucine signaling threshold in capsule without exceeding fill capacity.'
    }
  },
  'l-leucine': {
    min: 200, standard: 400, max: 800, step: 50, unit: 'amino_acid',
    clinicalRationale: { es: '400 mg actúa como sensor directo de aminoácidos para activar la síntesis proteica vía Sestrin2/mTORC1.', en: '400 mg triggers direct Sestrin2/mTORC1 activation of muscle protein synthesis.' }
  },
  'l-isoleucine': {
    min: 100, standard: 200, max: 400, step: 50, unit: 'amino_acid',
    clinicalRationale: { es: '200 mg favorece la captación periférica de glucosa independientemente de la insulina.', en: '200 mg promotes peripheral glucose uptake in skeletal muscle.' }
  },
  'l-valine': {
    min: 100, standard: 200, max: 400, step: 50, unit: 'amino_acid',
    clinicalRationale: { es: '200 mg compite con triptófano en la barrera hematoencefálica reduciendo la fatiga central.', en: '200 mg competes with tryptophan at the BBB blunting central nervous fatigue.' }
  },
  'l-arginine': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Sustrato directo de óxido nítrico sintasa (eNOS)', en: 'Direct eNOS substrate & microvascular vasodilation' },
    clinicalRationale: { es: '500 mg estimula la relajación endotelial periférica y optimiza la microcirculación papilar del cabello.', en: '500 mg stimulates endothelial vasodilation and dermal papilla capillary feed.' }
  },
  'l-carnitine l-tartrate': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Lanzadera CPT-1 de ácidos grasos a la mitocondria', en: 'CPT-1 mitochondrial fatty acid shuttle' },
    clinicalRationale: { es: '500 mg de LCLT incrementa la densidad de receptores androgénicos en músculo y acelera la recuperación post-ejercicio.', en: '500 mg LCLT increases androgen receptor density in muscle tissue.' }
  },
  'n-acetylcysteine (nac)': {
    min: 150, standard: 300, max: 600, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Cisteína limitante para biosíntesis de glutatión (GSH)', en: 'Rate-limiting cysteine for de novo glutathione synthesis' },
    clinicalRationale: { es: '300 mg restaura los niveles de glutatión celular, mucolítico y detoxificante hepático de fase II.', en: '300 mg replenishes intracellular glutathione pools and supports phase II hepatic clearance.' }
  },
  'l-glutamine': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Combustible preferente de enterocitos y linfocitos', en: 'Primary metabolic fuel for enterocytes & lymphocytes' },
    clinicalRationale: { es: '500 mg refuerza las uniones estrechas (tight junctions) del epitelio intestinal previniendo hiperpermeabilidad.', en: '500 mg seals gut tight junctions, preventing endotoxemia and systemic inflammation.' }
  },
  'glycine': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Biosíntesis de colágeno, conjugación biliar y relajación GABA', en: 'Collagen biosynthesis, bile conjugation & inhibitory neurotransmission' },
    clinicalRationale: { es: '500 mg actúa como cofactor limitante para la síntesis de tropocolágeno (1 de cada 3 aminoácidos es glicina).', en: '500 mg supplies the essential glycine triad required for triple-helix tropocollagen.' }
  },
  'taurine': {
    min: 200, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Osmolito intracelular, regulación de calcio y antifibrosis folicular', en: 'Intracellular osmolyte, calcium homeostasis & hair follicle antifibrotic' },
    clinicalRationale: { es: '500 mg inhibe la rigidez peribulbar por TGF-β1 y preserva la supervivencia del queratinocito folicular.', en: '500 mg prevents follicular peribulbar fibrosis induced by TGF-β1.' }
  },
  'betaine (trimethylglycine / tmg)': {
    min: 150, standard: 300, max: 600, step: 50, unit: 'mg',
    category: 'amino_acid',
    indication: { es: 'Donante directo de metilos vía BHMT a homocisteína', en: 'Direct methyl donor for BHMT homocysteine remethylation' },
    clinicalRationale: { es: '300 mg remetila la homocisteína en metionina en el hígado independientemente de la vía folato/B12.', en: '300 mg drives hepatic BHMT pathway, clearing homocysteine independent of B12/folate.' }
  },

  // ── Mitocondria & Longevidad Celular ─────────────────────────────────────────
  'coenzyme q10 (ubiquinol)': {
    min: 50, standard: 100, max: 200, step: 10, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Forma reducida bioactiva de CoQ10 y síntesis de ATP', en: 'Bioactive reduced CoQ10 & mitochondrial ATP output' },
    clinicalRationale: {
      es: '100 mg de Ubiquinol Kaneka QH multiplica por 4 la concentración plasmática frente a ubiquinona convencional, restaurando ATP celular.',
      en: '100 mg Ubiquinol yields 4x higher plasma levels than ubiquinone, driving electron transport chain complexes I & II.'
    }
  },
  'alpha-lipoic acid (ala)': {
    min: 100, standard: 300, max: 600, step: 25, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Antioxidante anfifílico y reciclaje de CoQ10 y glutatión', en: 'Amphiphilic antioxidant recycling CoQ10 & glutathione' },
    clinicalRationale: { es: '300 mg regenera la vitamina C, E y glutatión intracelulares y mejora la captación de glucosa vía GLUT4.', en: '300 mg recycles cellular redox buffers (Vit C/E/GSH) and improves insulin sensitivity via GLUT4.' }
  },
  'resveratrol': {
    min: 50, standard: 250, max: 500, step: 25, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Activador alostérico de sirtuina-1 (SIRT1) y AMPK', en: 'Allosteric SIRT1 deacetylase & AMPK activator' },
    clinicalRationale: { es: '250 mg de trans-resveratrol 98% promueve la biogénesis mitocondrial vía PGC-1α y modula citoquinas proinflamatorias.', en: '250 mg trans-resveratrol 98% triggers PGC-1α mitochondrial biogenesis.' }
  },
  'piperine': {
    min: 2.5, standard: 5, max: 10, step: 0.5, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Potenciador de biodisponibilidad por inhibición de glucuronidación', en: 'Bioavailability enhancer blunting hepatic glucuronidation' },
    clinicalRationale: {
      es: '5 mg es la dosis terapéutica exacta que multiplica la absorción de curcumina, resveratrol y CoQ10 sin irritar la mucosa digestiva.',
      en: '5 mg inhibits intestinal and hepatic UGT enzymes, dramatically boosting polyphenol absorption safely.'
    }
  },
  'melatonin': {
    min: 0.5, standard: 1.0, max: 3.0, step: 0.5, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Regulación circadiana y antioxidante mitocondrial pineal', en: 'Circadian entrainment & mitochondrial pineal antioxidant' },
    clinicalRationale: {
      es: '1.0 mg reproduce el pico fisiológico nocturno en receptores MT1/MT2 sin inducir tolerancia, sedación residual ni embotamiento matutino.',
      en: '1.0 mg mirrors physiological nocturnal plasma peak at MT1/MT2 without receptor desensitization or morning hangover.'
    }
  },
  'reduced glutathione': {
    min: 100, standard: 250, max: 500, step: 25, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Antioxidante maestro intracelular y detoxificación hepática', en: 'Master intracellular antioxidant & hepatic phase II detox' },
    clinicalRationale: { es: '250 mg apoya la neutralización de peróxidos lipídicos y la conjugación de xenobióticos hepáticos.', en: '250 mg supports hepatic phase II conjugation and quenches lipid peroxides.' },
    bioavailabilityNote: {
      es: 'Biodisponibilidad oral: El glutatión reducido oral convencional sufre degradación gástrica e hidrólisis intestinal. Se aconseja especificar forma liposomal o S-acetil-glutatión, o combinar con NAC 300–600 mg para síntesis intracelular.',
      en: 'Oral bioavailability note: Plain reduced glutathione undergoes extensive first-pass intestinal degradation. Recommend specifying liposomal or S-acetyl form, or pairing with NAC 300–600 mg.'
    }
  },
  'cycloastragenol': {
    min: 5, standard: 10, max: 25, step: 2.5, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Inducción de transcriptasa inversa de telomerasa (hTERT)', en: 'Telomerase reverse transcriptase (hTERT) induction' },
    clinicalRationale: { es: '10 mg estimula la actividad telomerasa en linfocitos T, retrasando la senescencia celular replicativa.', en: '10 mg stimulates transient telomerase activity in T cells, mitigating replicative senescence.' }
  },

  // ── Extractos Botánicos Estandarizados ──────────────────────────────────────
  'curcumin (cureit)': {
    min: 100, standard: 250, max: 500, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Inhibición de NF-κB y modulación de COX-2/5-LOX', en: 'NF-κB down-regulation & COX-2/5-LOX modulation' },
    clinicalRationale: { es: '250 mg de matriz completa Cureit® asegura biodisponibilidad multiplicada para modular inflamación crónica de bajo grado.', en: '250 mg Cureit® full-spectrum turmeric matrix delivers systemic anti-inflammatory action.' }
  },
  'ginkgo biloba': {
    min: 40, standard: 120, max: 240, step: 20, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Microcirculación cerebral, perfusión retiniana y vasoprotección', en: 'Cerebral microcirculation & peripheral vasoprotection' },
    clinicalRationale: { es: '120 mg (estandarizado 24% flavonglucósidos / 6% terpenolactonas) optimiza la perfusión capilar y la memoria de trabajo.', en: '120 mg standardized 24/6 extract enhances microvascular capillary perfusion.' }
  },
  'panax ginseng extract': {
    min: 100, standard: 200, max: 400, step: 25, unit: 'mg',
    category: 'botanical',
    chronopharmacology: 'AM_ONLY',
    indication: { es: 'Adaptógeno adrenal y proliferación de la papila dérmica', en: 'Adrenal adaptogen & dermal papilla proliferation' },
    clinicalRationale: { es: '200 mg de ginsenósidos estimula el eje HPA y sobreexpresa VEGF en el bulbo piloso.', en: '200 mg ginsenosides modulates HPA resilience and upregulates follicular VEGF.' },
    counselingAlert: {
      es: '⚠️ Cronofarmacología obligatoria: Tomar exclusivamente en la Mañana (AM). El ginseng estimula el eje suprarrenal y catecolaminas; su administración de noche (PM) produce insomnio y alteración del sueño profundo.',
      en: '⚠️ Mandatory morning chronopharmacology (AM): Modulates adrenal cortisol and catecholamines. Taking it in the evening (PM) disrupts sleep latency and delta non-REM architecture.'
    }
  },
  'mitocondrin': {
    min: 150, standard: 300, max: 500, step: 50, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Biogénesis mitocondrial PGC-1α y energía celular (Fagron)', en: 'Mitochondrial biogenesis PGC-1α and cellular energy (Fagron)' },
    clinicalRationale: {
      es: '300 mg de Mitocondrin® (extracto bioactivo de Ashitaba + Ginseng rojo Fagron) induce PGC-1α y ATP mitocondrial. Se corrige formalmente la prescripción legacy ambigua "1 cápsula" a 300 mg netos.',
      en: '300 mg Mitocondrin® (Fagron Ashitaba + Red Ginseng blend) induces PGC-1α and mitochondrial ATP. Corrects legacy ambiguous "1 capsule" notation to 300 mg net label claim.'
    }
  },
  'citrusim': {
    min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Composición corporal, metabolismo lipídico y adipogénesis (Fagron)', en: 'Body composition, lipid metabolism and adipokines (Fagron)' },
    clinicalRationale: {
      es: '500 mg de Citrus sinensis estandarizado (Fagron) es la dosis clínica validada en ensayos humanos para reducción de grasa visceral y modulación de adipocinas (250 mg es subtasa de mantenimiento).',
      en: '500 mg standardized Citrus sinensis extract (Fagron) is the clinically validated human trial dose for visceral fat and adipokines (250 mg is sub-maintenance).'
    }
  },
  'brocophanus': {
    min: 100, standard: 100, max: 250, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Inducción de Nrf2 y enzimas detoxificantes de fase II (Fagron)', en: 'Nrf2 activation and phase II detox enzymes (Fagron)' },
    clinicalRationale: {
      es: '100 mg aporta sulforafano (1%) y mirosinasa activa (0.5%), la dosis unitaria estándar de Fagron para detoxificación celular y protección genómica (evitar 250 mg sin validar tolerancia digestiva).',
      en: '100 mg provides standardized sulforaphane (1%) and active myrosinase (0.5%), standard Fagron unit dose (caution above 100 mg for GI tolerance).'
    }
  },
  'miodesin': {
    min: 100, standard: 250, max: 500, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Inhibición de NF-κB y modulación antiinflamatoria (Fagron)', en: 'NF-κB inhibition and anti-inflammatory modulation (Fagron)' },
    clinicalRationale: {
      es: '250 mg del fitocomplejo Miodesin® (Fagron) bloquea la translocación de NF-κB. Precaución en enfermedades autoinmunes o pacientes inmunosuprimidos debido a la actividad inmunoestimulante de Uncaria tomentosa.',
      en: '250 mg Miodesin® (Fagron) blocks NF-κB nuclear translocation. Flag caution in autoimmune disease or immunosuppressive therapy due to Uncaria tomentosa immunostimulation.'
    }
  },
  'green tea extract (egcg)': {
    min: 100, standard: 200, max: 400, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Inhibición de 5α-reductasa, termogénesis y senolítico leve', en: '5α-reductase inhibition, thermogenesis & mild senolytic' },
    clinicalRationale: { es: '200 mg (45% EGCG) aporta polifenoles que combaten la senescencia y reducen la conversión local a DHT.', en: '200 mg (45% EGCG) provides bioactive catechins suppressing local follicular DHT.' }
  },
  'saw palmetto': {
    min: 150, standard: 320, max: 640, step: 40, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Inhibición competitiva de 5α-reductasa prostática y folicular', en: 'Competitive 5α-reductase inhibition in prostate & scalp' },
    clinicalRationale: { es: '320 mg al 45% de ácidos grasos es la dosis clínica de referencia validada en ensayos para frenar la caída capilar androgenética.', en: '320 mg (45% fatty acids) is the validated clinical reference dose for androgenic hair loss.' }
  },
  'valerian root extract': {
    min: 100, standard: 200, max: 400, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Agonismo alostérico de receptores GABA-A y relajación nocturna', en: 'GABA-A receptor allosteric agonism & nocturnal calm' },
    clinicalRationale: { es: '200 mg estandarizado al 0.8% en ácido valerénico disminuye la latencia del sueño sin generar dependencia.', en: '200 mg standardized to 0.8% valerenic acid shortens sleep latency naturally.' }
  },
  'silibin (milk thistle)': {
    min: 100, standard: 200, max: 400, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Estabilización de membrana del hepatocito y síntesis de ARN ribosomal', en: 'Hepatocyte membrane stabilization & ribosomal RNA synthesis' },
    clinicalRationale: { es: '200 mg de silibina pura estimula la ARN polimerasa I hepática, acelerando la regeneración tisular y detoxificación.', en: '200 mg silibinin powers hepatic ribosomal RNA polymerase I and cellular recovery.' }
  },
  'astaxanthin': {
    min: 40, standard: 80, max: 160, step: 10, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Carotenoide transmembrana y neutralizador de oxígeno singlete', en: 'Transmembrane carotenoid & singlet oxygen quencher' },
    clinicalRationale: {
      es: '80 mg de microalgas al 5% aportan 4 mg de astaxantina pura bioactiva, atravesando la bicapa lipídica para proteger piel, retina y mitocondria.',
      en: '80 mg of 5% microalgae yields 4 mg pure astaxanthin, anchoring across lipid bilayers for ocular and dermal defense.'
    },
    yieldNote: { es: 'Polvo 5%: 80 mg = 4 mg astaxantina activa.', en: '5% powder: 80 mg = 4 mg active astaxanthin.' }
  },
  'lutein': {
    min: 25, standard: 50, max: 100, step: 10, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Pigmento macular y filtro de luz azul de alta energía', en: 'Macular pigment optical density & blue light filter' },
    clinicalRationale: { es: '50 mg al 20% aporta 10 mg de luteína pura; dosis clínica demostrada en los estudios AREDS2 para agudeza visual.', en: '50 mg of 20% extract delivers 10 mg pure lutein, mirroring the clinical AREDS2 trial standard.' }
  },
  'lycopene': {
    min: 50, standard: 100, max: 150, step: 25, unit: 'mg',
    category: 'botanical',
    indication: { es: 'Protección de tejido prostático y endotelio vascular', en: 'Prostatic tissue protection & endothelial nitric oxide' },
    clinicalRationale: { es: '100 mg al 10% aporta 10 mg de licopeno activo para modular IGF-1 prostático y oxidación de LDL.', en: '100 mg of 10% extract yields 10 mg active lycopene for prostate and cardiovascular support.' }
  },
  'ashwagandha': {
    min: 150, standard: 300, max: 600, step: 50, unit: 'botanical',
    clinicalRationale: { es: '300 mg (con withanólidos) modula el cortisol matutino y el receptor GABA-A reduciendo el estrés crónico.', en: '300 mg downregulates serum cortisol and reinforces hypothalamic-pituitary-adrenal balance.' }
  },
  'myo-inositol': {
    min: 200, standard: 500, max: 1000, step: 50, unit: 'mg',
    category: 'mitochondrial',
    indication: { es: 'Segundo mensajero de insulina y eje ovárico/tiroideo', en: 'Insulin second messenger & ovarian/thyroid axis' },
    clinicalRationale: { es: '500 mg mejora la translocación de GLUT4 y optimiza la sensibilidad a la insulina sin hipoglucemia.', en: '500 mg enhances insulin receptor transduction and cellular glucose disposal.' }
  }
};

/**
 * Normalizes input name and returns the clinical dosage profile.
 * Falls back to clinical category heuristics if the active is not explicitly matched.
 */
export function getClinicalDosageProfile(name) {
  const norm = String(name || '').toLowerCase().trim();

  // 1. Direct or partial match in clinical registry
  for (const [key, profile] of Object.entries(CLINICAL_DOSAGE_REGISTRY)) {
    if (norm.includes(key) || key.includes(norm)) {
      return {
        ...profile,
        activeKey: key,
        matched: true
      };
    }
  }

  // 2. Intelligent Category Heuristics for non-mapped actives
  if (norm.includes('vitamin b') || norm.includes('folate') || norm.includes('cobalamin') || norm.includes('riboflavin') || norm.includes('thiamine') || norm.includes('pyridox')) {
    return {
      min: 15, standard: 50, max: 100, step: 5, unit: 'mg',
      category: 'vitamin',
      indication: { es: 'Cofactor metabólico B', en: 'B-vitamin cofactor' },
      clinicalRationale: { es: 'Dosis estándar fisiológica de soporte vitamínico hidrosoluble.', en: 'Standard physiological water-soluble vitamin support dose.' },
      matched: false
    };
  }

  if (norm.includes('zinc') || norm.includes('copper') || norm.includes('iron') || norm.includes('manganese') || norm.includes('selenium') || norm.includes('iodine')) {
    return {
      min: 5, standard: 25, max: 50, step: 5, unit: 'mg',
      category: 'mineral',
      indication: { es: 'Oligoelemento quelado', en: 'Chelated trace mineral' },
      clinicalRationale: { es: 'Dosis moderada para evitar competencia de absorción o toxicidad por acumulación.', en: 'Moderate dose to prevent transporter competition or mineral accumulation.' },
      matched: false
    };
  }

  if (norm.includes('acid') || norm.includes('amino') || norm.includes('bcaa') || norm.includes('glutam') || norm.includes('carnitine') || norm.includes('arginine') || norm.includes('glycine') || norm.includes('taurine') || norm.includes('cysteine') || norm.includes('collagen')) {
    return {
      min: 250, standard: 500, max: 1000, step: 50, unit: 'mg',
      category: 'amino_acid',
      indication: { es: 'Aminoácido funcional', en: 'Functional amino acid' },
      clinicalRationale: { es: 'Dosis estándar de 500 mg requerida para superar el aclaramiento hepático de aminoácidos.', en: 'Standard 500 mg required to establish active physiological systemic pools.' },
      matched: false
    };
  }

  if (norm.includes('extract') || norm.includes('leaf') || norm.includes('root') || norm.includes('bark') || norm.includes('herb') || norm.includes('berry') || norm.includes('curcumin') || norm.includes('ginseng')) {
    return {
      min: 100, standard: 250, max: 500, step: 25, unit: 'mg',
      category: 'botanical',
      indication: { es: 'Fitoterapia estandarizada', en: 'Standardized phytotherapy' },
      clinicalRationale: { es: 'Dosis fitoterápica estandarizada habitual para formulaciones galénicas orales.', en: 'Standardized botanical dose for clinical oral compounding.' },
      matched: false
    };
  }

  // 3. Ultra-Safe General Compounding Fallback (200 mg rather than arbitrary 100)
  return {
    min: 50, standard: 200, max: 500, step: 25, unit: 'mg',
    category: 'general',
    indication: { es: 'Principio activo complementario', en: 'Complementary active' },
    clinicalRationale: { es: 'Dosis galénica equilibrada de 200 mg dentro del volumen de llenado de cápsula HPMC.', en: 'Balanced 200 mg compounding dose fitting standard HPMC capsule volume.' },
    matched: false
  };
}

/**
 * Assesses the user's selected dose against evidence-based therapeutic ranges.
 * @returns {'subtherapeutic' | 'optimal' | 'supratherapeutic'}
 */
export function getDoseAssessment(name, currentDose, lang = 'es') {
  const isEs = lang === 'es';
  const profile = getClinicalDosageProfile(name);
  const dose = Number(currentDose) || 0;

  if (dose < profile.min) {
    return {
      status: 'subtherapeutic',
      color: '#d97706', // amber
      badgeText: isEs ? 'Sub-Terapéutica' : 'Sub-Therapeutic',
      message: isEs 
        ? `Por debajo del umbral clínico eficaz (${profile.min} mg). Podría no generar el efecto farmacodinámico deseado.`
        : `Below the clinical threshold (${profile.min} mg). May not trigger the intended pharmacodynamic response.`
    };
  }

  if (dose > profile.max) {
    return {
      status: 'supratherapeutic',
      color: '#ea580c', // orange/red
      badgeText: isEs ? 'Dosis Elevada' : 'High Dosage',
      message: isEs
        ? `Supera la dosis recomendada (${profile.max} mg). Vigilar tolerancia gastrointestinal y saturación enzimática.`
        : `Exceeds the recommended dose (${profile.max} mg). Monitor gastrointestinal tolerance and enzyme saturation.`
    };
  }

  return {
    status: 'optimal',
    color: '#0d9488', // teal
    badgeText: isEs ? 'Rango Óptimo' : 'Optimal Range',
    message: isEs
      ? `Dentro del rango terapéutico documentado (${profile.min}–${profile.max} mg). Dosis estándar sugerida: ${profile.standard} mg.`
      : `Within documented therapeutic range (${profile.min}–${profile.max} mg). Suggested standard: ${profile.standard} mg.`
  };
}
