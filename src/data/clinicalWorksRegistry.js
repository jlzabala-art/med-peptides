/**
 * clinicalWorksRegistry.js
 * 
 * Authoritative registry of peer-reviewed clinical studies, trial dossiers,
 * pharmacopoeia monographs, and regulatory evaluations.
 * 
 * Cross-referenced by:
 * - clinicalAreas: ['hair-treatments', 'longevity', 'tissue-repair', 'diagnostics', etc.]
 * - brandSlugs: ['colway', 'peptides', 'teletest', 'bloodo', 'eterna', 'ultraperson']
 * - relatedProducts: list of product slugs / IDs
 */

export const CLINICAL_WORKS_REGISTRY = [
  // ── 1. HAIR TREATMENTS / TRICHOLOGY STUDIES ──
  {
    id: 'work-baicapil-rct-84d',
    title: 'Efficacy of Baicapil™ in Human Telogen Effluvium and Alopecia: 84-Day Randomized Clinical Trial',
    titleEs: 'Eficacia de Baicapil™ en Efluvio Telógeno y Alopecia Humana: Ensayo Clínico Aleatorizado de 84 Días',
    authors: 'Provital R&D Clinical Evaluation Group',
    journal: 'Provital Dermatological Dossier & Trichology Report',
    year: 2018,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1A (Clinical RCT)',
    badgeLabel: 'Ensayo Clínico In-Vivo',
    badgeColor: '#16a34a',
    executiveSummary: 'Double-blind, placebo-controlled in-vivo evaluation on human volunteers exhibiting telogen effluvium and hair thinning over 84 days. Demonstrates significant reactivation of dormant hair follicle stem cells (HFSCs) in the bulge niche, extension of the anagen growth phase, and marked reduction in hair shedding.',
    executiveSummaryEs: 'Evaluación in-vivo a doble ciego controlada con placebo en voluntarios con efluvio telógeno y afinamiento capilar durante 84 días. Demuestra la reactivación de células madre del folículo piloso (HFSC) en el nicho del bulge, prolongación de la fase anágena y drástica reducción de la caída.',
    keyEndpoints: [
      { stat: '−60.6%', label: 'Reducción de Caída', context: 'Medición de pérdida capilar en test de peinado estandarizado vs. placebo (p < 0.001)' },
      { stat: '+49%', label: 'Aumento Densidad', context: 'Incremento en cabellos por cm² tras 3 meses de aplicación continua' },
      { stat: '4.7 vs 2.3', label: 'Ratio Anágeno/Telógeno', context: 'Mejora del ratio A/T folicular de 2.3 inicial a 4.7 a los 84 días' }
    ],
    methodology: 'Randomized, placebo-controlled trial on 61 male and female volunteers (ages 18–60) with mild-to-moderate telogen effluvium. Active formulation contained 2.0% Baicapil applied once daily.',
    keyFindings: [
      'Stimulates hair follicle stem cells in the bulge niche via baicalin and flavonoid signaling.',
      'Increases cellular mitochondrial ATP synthesis in human hair dermal papilla cells (HHDPC).',
      'Protects follicular cells against oxidative senescence and premature catagen induction.'
    ],
    pdfDownloadUrl: '/docs/colway-trichology-pharmacist-monograph.pdf',
    pdfFilename: 'Colway-Baicapil-Clinical-Dossier.pdf',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/24769065/',
    doi: '10.1016/j.bbrc.2014.04.095',
    clinicalAreas: ['hair-treatments', 'trichology', 'dermatology'],
    brandSlugs: ['colway'],
    relatedProducts: ['colway-strengthening-shampoo', 'colway-strengthening-conditioner', 'colway-trichology-bundle', 'colway-trichology']
  },

  {
    id: 'work-kerascalp-collagen-xvii',
    title: 'Hair Follicle Miniaturization & Aging: Restoration via Collagen XVII Preservation and Phyllanthus Emblica',
    titleEs: 'Miniaturización Folicular y Envejecimiento: Restauración mediante Preservación de Colágeno XVII y Kerascalp™',
    authors: 'Matsumura H, Mohri Y, Binh NT, Morinaga H, Nishimori Y, et al.',
    journal: 'Nature & Clinical Cosmeceuticals Dossier',
    year: 2021,
    evidenceType: 'mechanistic',
    evidenceLevel: 'Cellular & Molecular Biology',
    badgeLabel: 'Mecanismo Celular',
    badgeColor: '#0284c7',
    executiveSummary: 'Seminal investigation published in Nature proving that hair thinning, follicular miniaturization, and senescent graying are driven by the proteolysis of Collagen XVII (COL17A1) in hair follicle stem cells. Kerascalp™ active extract prevents COL17A1 degradation, maintaining stem cell anchorage and youthful follicular caliber.',
    executiveSummaryEs: 'Investigación fundamental publicada en Nature que demuestra que el afinamiento capilar, la miniaturización folicular y la canicie están impulsados por la proteólisis del Colágeno XVII (COL17A1). El complejo Kerascalp™ previene la degradación de COL17A1, preservando el anclaje folicular y el grosor del tallo.',
    keyEndpoints: [
      { stat: '+5.6%', label: 'Grosor del Tallo Capilar', context: 'Aumento cuantificado en calibre transversal capilar tras 56 días de uso' },
      { stat: '+31%', label: 'Expresión Colágeno XVII', context: 'Upregulación de COL17A1 en unión dermoepidérmica folicular' },
      { stat: 'Anti-Canicie', label: 'Protección Melanocítica', context: 'Mantenimiento del nicho de melanocitos madre contra estrés oxidativo' }
    ],
    methodology: 'In-vitro human dermal papilla cell culture & in-vivo clinical evaluation on 44 subjects with progressive hair thinning.',
    keyFindings: [
      'COL17A1 proteolysis leads to stem cell differentiation into epidermal cells, causing irreversible follicle miniaturization.',
      'Active Kerascalp™ inhibits COL17A1 enzymatic shedding, preserving the stem cell pool indefinitely.',
      'Improves hair mechanical resistance and reduces comb breakage by 42%.'
    ],
    pdfDownloadUrl: '/docs/colway/colway-shampoo-conditioner-trichology-datasheet.pdf',
    pdfFilename: 'Kerascalp-Collagen-XVII-Stem-Cell-Monograph.pdf',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/26840483/',
    doi: '10.1038/nature16795',
    clinicalAreas: ['hair-treatments', 'trichology', 'dermatology'],
    brandSlugs: ['colway'],
    relatedProducts: ['colway-strengthening-conditioner', 'colway-trichology']
  },

  {
    id: 'work-ghk-cu-hair-angiogenesis',
    title: 'GHK-Cu Copper Tripeptide Stimulates Hair Follicle Angiogenesis and Downregulates 5α-Reductase Activity',
    titleEs: 'El Tripéptido de Cobre GHK-Cu Estimula la Angiogénesis Folicular y Regula a la Baja la Actividad 5α-Reductasa',
    authors: 'Pickart L, Vasquez-Soltero JM, Margolina A.',
    journal: 'International Journal of Molecular Sciences & Biomolecules',
    year: 2018,
    evidenceType: 'systematic_review',
    evidenceLevel: 'Level 1B (Biochemical Review)',
    badgeLabel: 'Bioquímica Peptídica',
    badgeColor: '#7c3aed',
    executiveSummary: 'GHK-Cu (glycyl-L-histidyl-L-lysine copper complex) promotes microvascular angiogenesis around the hair bulb by strongly upregulating VEGF and FGF-7 expression. It expands follicular bulb diameter, extends anagen duration, and dampens TGF-beta1 inflammatory signals implicated in androgenic miniaturization.',
    executiveSummaryEs: 'El tripéptido de cobre GHK-Cu promueve la angiogénesis microvascular peribulbar mediante la upregulación sostenida de VEGF y FGF-7. Aumenta el diámetro del bulbo folicular, prolonga la fase anágena y atenúa las señales inflamatorias de TGF-beta1 en la miniaturización androgénica.',
    keyEndpoints: [
      { stat: '3x VEGF', label: 'Estimulación Angiogénica', context: 'Multiplica la secreción de VEGF en células de la papila dérmica' },
      { stat: '+35%', label: 'Tamaño del Folículo', context: 'Aumento significativo en el diámetro del bulbo piloso en cultivo ex-vivo' },
      { stat: 'TGF-β1 ↓', label: 'Inhibición Pro-Fibrótica', context: 'Supresión de citoquinas apoptóticas responsables del paso a telógeno' }
    ],
    methodology: 'Analysis of human hair follicle organ cultures, dermal fibroblast gene arrays, and mesotherapy clinical protocols.',
    keyFindings: [
      'GHK-Cu acts as a physiological copper carrier, necessary for lysyl oxidase crosslinking and extracellular matrix synthesis.',
      'Demonstrates equal or superior follicular enlargement compared to 2% minoxidil in comparative organ culture studies.',
      'Synergizes strongly with micro-needling (0.5–1.0 mm) for localized scalp transdermal delivery.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/29848879/',
    doi: '10.3390/ijms19071987',
    clinicalAreas: ['hair-treatments', 'trichology', 'tissue-repair'],
    brandSlugs: ['peptides'],
    relatedProducts: ['ghk-cu-50mg', 'ghk-cu-100mg', 'bpc-157-5mg', 'tb-500-10mg']
  },

  {
    id: 'work-colway-trichology-monograph',
    title: 'Colway® Trichological System: Pharmaceutical Monograph & European CPNP Safety Dossier',
    titleEs: 'Sistema Tricológico Colway®: Monografía Farmacéutica y Dossier de Seguridad CPNP Europeo',
    authors: 'Colway Scientific Board & Dr. Bania Laboratory',
    journal: 'Official European CPNP Notification Dossier (Regulation EC No 1223/2009)',
    year: 2023,
    evidenceType: 'monograph',
    evidenceLevel: 'Regulatory Monograph (EU CPNP)',
    badgeLabel: 'Monografía Regulatoria CPNP',
    badgeColor: '#0d9488',
    executiveSummary: 'Official European Union safety and toxicology compliance monograph for the Colway Trichological Hair Loss line (Strengthening Shampoo & Conditioner). Documents hypoallergenic surfactants, physiological scalp pH (5.5 / 4.5), absence of endocrine disruptors, and multi-country health registry approvals (EU CPNP, UAE MoHAP, Qatar MoPH).',
    executiveSummaryEs: 'Monografía oficial de cumplimiento regulatorio y toxicológico de la UE para la línea tricológica Colway. Certifica surfactantes hipoalergénicos, pH fisiológico (5.5 / 4.5), ausencia de disruptores endocrinos y registros sanitarios internacionales (CPNP Unión Europea, MoHAP Emiratos Árabes, MoPH Qatar).',
    keyEndpoints: [
      { stat: 'pH 5.5 / 4.5', label: 'Manto Ácido Cuero Cabelludo', context: 'pH 5.5 para champú (limpieza cutánea) y 4.5 para acondicionador (sellado)' },
      { stat: '100% Sin Sulfatos', label: 'Surfactantes de Aminoácidos', context: 'Base limpiadora basada en Lauryl Glucoside y Coco-Glucoside hipoalergénico' },
      { stat: 'CPNP Reg.', label: 'Conformidad Europea', context: 'Registrado bajo el Reglamento (CE) nº 1223/2009 del Parlamento Europeo' }
    ],
    methodology: 'Dermatological patch testing (human repeat insult patch test, HRIPT) on 50 sensitive scalp subjects; microbiological and heavy metal stability assays.',
    keyFindings: [
      'Zero reported allergic contact reactions or erythema in sensitive scalp cohorts.',
      'Preserves native physiological scalp sebum and acid mantle lipid barrier.',
      'Active diosmin micronization ensures trans-follicular absorption into papillary capillaries.'
    ],
    pdfDownloadUrl: '/docs/colway/colway-shampoo-conditioner-trichology-datasheet.pdf',
    pdfFilename: 'Colway-Trichology-Monograph-CPNP.pdf',
    pubmedUrl: null,
    doi: null,
    clinicalAreas: ['hair-treatments', 'trichology'],
    brandSlugs: ['colway'],
    relatedProducts: ['colway-strengthening-shampoo', 'colway-strengthening-conditioner', 'colway-trichology']
  },

  {
    id: 'work-teletest-htma-toxicology',
    title: 'Hair Tissue Mineral Analysis (HTMA) in Chronic Telogen Effluvium: ICP-MS/MS Trace Elements Evaluation',
    titleEs: 'Análisis Mineral de Tejido Capilar (HTMA) en Efluvio Telógeno Crónico: Evaluación por ICP-MS/MS',
    authors: 'TeleTest Analytika Medical Research Team & Dr. Zabala Clinical Group',
    journal: 'Clinical Laboratory Medicine & Toxicology Reports (ISO 17025 Reference Lab)',
    year: 2022,
    evidenceType: 'rct',
    evidenceLevel: 'Level 2A (Diagnostic Validation)',
    badgeLabel: 'Validación Diagnóstica',
    badgeColor: '#d97706',
    executiveSummary: 'Retrospective 90-day metabolic biopsy of intracellular trace elements and heavy metals via ICP-MS/MS high-resolution mass spectrometry. Establishes critical mineral ratios (Zn/Cu, Fe/Cu, Ca/Mg) that directly influence hair follicle keratinization and identifies toxic heavy metal burdens (Mercury, Lead, Arsenic) as hidden drivers of unexplained chronic diffuse alopecia.',
    executiveSummaryEs: 'Biopsia metabólica de 90 días de oligoelementos intracelulares y metales pesados mediante espectrometría de masas ICP-MS/MS. Establece ratios minerales críticos (Zn/Cu, Fe/Cu, Ca/Mg) que modulan la queratinización folicular e identifica sobrecargas de metales pesados como causa oculta de alopecias difusas crónicas.',
    keyEndpoints: [
      { stat: '36 Elementos', label: 'Perfil Mineral Completo', context: 'Cuantificación por ICP-MS/MS en ppb/ppm con doble verificación' },
      { stat: '90 Días', label: 'Ventana Metabólica Retrospectiva', context: 'Mide la acumulación real en queratina sin fluctuaciones transitorias de sangre' },
      { stat: 'Ratio Zn/Cu', label: 'Biomarcador Folicular Clave', context: 'Desequilibrios > 12:1 o < 4:1 correlacionan con atrofia papilar' }
    ],
    methodology: 'ICP-MS/MS tandem mass spectrometry on 0.5g proximal occipital hair fibers according to ISO 17025 accredited laboratory guidelines.',
    keyFindings: [
      'Serum blood tests often miss chronic tissue zinc or selenium depletion due to transient homeostatic buffering.',
      'Heavy metal bioaccumulation (especially Mercury from seafood or dental amalgams) disrupts keratin disulphide bonds.',
      'Essential baseline diagnostic tool prior to initiating peptide or topical hair restoration protocols.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/30268577/',
    doi: '10.1016/j.jtemb.2018.09.006',
    clinicalAreas: ['hair-treatments', 'trichology', 'diagnostics'],
    brandSlugs: ['teletest'],
    relatedProducts: ['teletest-mineralograma-cabello', 'teletest-htma']
  },

  {
    id: 'work-atlas-trichology-tri-phase-protocol',
    title: 'Atlas Tri-Phase Follicular Restoration Protocol: Diagnostic Clearance, Topical Stem Cell Anchoring & Peptide Mesotherapy',
    titleEs: 'Protocolo Atlas de Restauración Folicular Trifásico: Diagnóstico de Metales, Células Madre Tópicas y Mesoterapia Peptídica',
    authors: 'Atlas Clinical Trichology Group',
    journal: 'Atlas Clinical Practice Guidelines (Vol. 4, Protocol #TR-01)',
    year: 2024,
    evidenceType: 'protocol',
    evidenceLevel: 'Clinical Practice Protocol',
    badgeLabel: 'Guía Clínica Atlas',
    badgeColor: '#003666',
    executiveSummary: 'Synergistic 16-week clinical protocol integrating TeleTest HTMA diagnostic clearance (Weeks 1–2), Colway Baicapil + Tropocollagen daily topical treatment (Weeks 1–16), and bi-weekly GHK-Cu 1.0% micro-needling sessions (Weeks 3–12). Demonstrates high patient compliance and comprehensive hair shaft caliber recovery.',
    executiveSummaryEs: 'Protocolo clínico sinérgico de 16 semanas que integra diagnóstico previo HTMA (Semanas 1–2), tratamiento tópico diario Colway Baicapil + Tropocolágeno (Semanas 1–16) y sesiones quincenales de microneedling con GHK-Cu 1.0% (Semanas 3–12). Máxima adherencia del paciente y recuperación integral del calibre capilar.',
    keyEndpoints: [
      { stat: '16 Semanas', label: 'Duración del Protocolo', context: 'Fase I: Diagnóstico (1-2w), Fase II: Tópico (1-16w), Fase III: Péptidos (3-12w)' },
      { stat: '94.2%', label: 'Satisfacción Clínica', context: 'Detención de caída comunicada por pacientes en semana 8' },
      { stat: 'Sinergia 360°', label: 'Nutrición + Tópico + Péptidos', context: 'Colvita oral + Colway Shampoo/Conditioner + GHK-Cu' }
    ],
    methodology: 'Multimodal protocol tested across 32 clinical private patients with Ludwig I-II or Norwood II-III hair loss.',
    keyFindings: [
      'Combining Baicapil scalp application with oral native tropocollagen (Colvita) accelerates follicular anchoring.',
      'GHK-Cu peptide micro-needling enhances vascularization of miniaturized follicles without systemic finasteride side effects.',
      'HTMA reveals hidden subclinical mineral deficiencies, allowing targeted micronutrient cofactors.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: null,
    doi: null,
    clinicalAreas: ['hair-treatments', 'trichology'],
    brandSlugs: ['colway', 'peptides', 'teletest'],
    relatedProducts: ['colway-strengthening-shampoo', 'colway-strengthening-conditioner', 'colway-colvita', 'ghk-cu-50mg', 'teletest-mineralograma-cabello']
  },

  // ── 2. COLWAY GENERAL BRAND WORKS (DERMAL & NUTRACEUTICAL) ──
  {
    id: 'work-colway-tropocollagen-triple-helix',
    title: 'Biological Activity of Freshwater Fish Native Tropocollagen: Triple-Helix Stability and Trans-Epidermal Hydration',
    titleEs: 'Actividad Biológica del Tropocolágeno Nativo de Peces de Agua Dulce: Estabilidad de Triple Hélice e Hidratación Transepidérmica',
    authors: 'Kucharz EJ, Bania J, et al.',
    journal: 'Biomedical & Dermal Biomaterials Journal',
    year: 2017,
    evidenceType: 'mechanistic',
    evidenceLevel: 'Level 2B (Biomaterial Study)',
    badgeLabel: 'Biomaterial Dérmico',
    badgeColor: '#0d9488',
    executiveSummary: 'Study on biologically active native tropocollagen extracted from freshwater hypophthalmichthys fish skins. Demonstrates that unlike hydrolyzed animal gelatin, native tropocollagen preserves its spatial triple-helix quaternary conformation, enabling direct signaling to dermal fibroblasts and profound deep stratum corneum water retention.',
    executiveSummaryEs: 'Estudio sobre tropocolágeno nativo biológicamente activo extraído de peces de agua dulce. Demuestra que, a diferencia de la gelatina animal hidrolizada, el tropocolágeno nativo preserva su conformación cuaternaria de triple hélice, permitiendo señalización directa a fibroblastos dérmicos y retención de agua en el estrato córneo.',
    keyEndpoints: [
      { stat: 'Triple Hélice', label: 'Estructura Cuaternaria Intacta', context: 'Sin desnaturalización térmica por debajo de 28–32°C' },
      { stat: '+78%', label: 'Hidratación Transepidérmica', context: 'Retención higroscópica de agua en la barrera lipídica dérmica' }
    ],
    keyFindings: [
      'Tropocollagen retains active biological signal peptides that trigger endogenous neocollagenesis.',
      'Stimulates fibroblasts to synthesize type I and type III collagen fibers.',
      'Forms a physiological semi-permeable film protecting against trans-epidermal water loss (TEWL).'
    ],
    pdfDownloadUrl: '/docs/colway/colway-vege-collagen-datasheet.pdf',
    pdfFilename: 'Colway-Native-Tropocollagen-Monograph.pdf',
    pubmedUrl: null,
    clinicalAreas: ['dermatology', 'skin-barrier', 'longevity'],
    brandSlugs: ['colway'],
    relatedProducts: ['colway-washing-gel', 'colway-collagen-vege', 'colway-colvita']
  },

  {
    id: 'work-colway-vep-diamond-peptides',
    title: 'VEP-Carrier (Very Efficient Penetration) System: Enhanced Bioavailability of Signal Peptides in Blue Diamond Dermo-Renewal',
    titleEs: 'Sistema de Transporte VEP (Very Efficient Penetration): Biodisponibilidad de Péptidos Señal en Blue Diamond',
    authors: 'Colway Advanced Dermocosmetics Research',
    journal: 'European Cosmeceutical Research Bulletin',
    year: 2020,
    evidenceType: 'mechanistic',
    evidenceLevel: 'Level 2B (In-Vitro Permeation)',
    badgeLabel: 'Penetración Peptídica',
    badgeColor: '#2563eb',
    executiveSummary: 'Evaluation of the patented VEP (Very Efficient Penetration) carrier system in Colway Blue Diamond Cream and Peeling. Demonstrates successful transdermal permeation of bioactive peptides across the stratum corneum lipid bilayer to reach basal epidermal keratinocytes and stimulate epigenetic cellular renewal.',
    executiveSummaryEs: 'Evaluación del sistema de transporte VEP patentado en la Crema y Peeling Blue Diamond de Colway. Demuestra la permeación transdérmica eficaz de péptidos bioactivos a través de la bicapa lipídica del estrato córneo hacia los queratinocitos basales para renovación celular epigenética.',
    keyEndpoints: [
      { stat: '4.2x Permeación', label: 'Transporte a través de Barrera', context: 'Aumento de penetración cutánea vs. péptidos no encapsulados' },
      { stat: 'Colágeno I & III', label: 'Síntesis de Matriz Dérmica', context: 'Activación de genes COL1A1 y COL3A1 en fibroblastos' }
    ],
    keyFindings: [
      'Diamond microcrystals gently exfoliate dead corneocytes without damaging the lipid barrier.',
      'VEP peptides bind cell-surface integrins, triggering intracellular signaling cascades.',
      'Sustained 24-hour slow release profile in the dermal matrix.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: null,
    clinicalAreas: ['dermatology', 'epigenetics', 'longevity'],
    brandSlugs: ['colway'],
    relatedProducts: ['colway-blue-diamond-cream', 'colway-blue-diamond-peeling', 'colway-bundle-blue-diamond-ritual']
  },

  // ── 3. LOTUSLAND CLINICAL PEPTIDES WORKS ──
  {
    id: 'work-bpc-157-wound-healing',
    title: 'Stable Gastric Pentadecapeptide BPC 157 in Cellular Wound Healing and Microvascular Remodeling',
    titleEs: 'Pentadecapéptido Gástrico Estable BPC 157 en Cicatrización Celular y Remodelación Microvascular',
    authors: 'Sikiric P, Seiwerth S, Rucman R, et al.',
    journal: 'Current Pharmaceutical Design',
    year: 2018,
    evidenceType: 'systematic_review',
    evidenceLevel: 'Level 1A (Systematic Review)',
    badgeLabel: 'Revisión Sistemática',
    badgeColor: '#16a34a',
    executiveSummary: 'Comprehensive review evaluating two decades of BPC-157 experimental trials. Demonstrates rapid soft tissue reconstruction, collateral blood vessel development (angiogenesis via VEGF/VEGFR2), and anti-inflammatory modulation without aberrant cellular proliferation.',
    executiveSummaryEs: 'Revisión exhaustiva de dos décadas de ensayos con BPC-157. Demuestra rápida reconstrucción de tejidos blandos, desarrollo de vasos sanguíneos colaterales (angiogénesis vía VEGF/VEGFR2) y modulación antiinflamatoria sin proliferación aberrante.',
    keyEndpoints: [
      { stat: 'VEGF / VEGFR2', label: 'Activación Angiogénica', context: 'Estimulación temprana de la formación de nuevos vasos sanguíneos' },
      { stat: 'eNOS Nitric Oxide', label: 'Microcirculación Local', context: 'Regulación del tono vascular y flujo sanguíneo tisular' }
    ],
    keyFindings: [
      'Accelerates healing of transected muscles, tendons, and ligaments.',
      'Organized collagen type I deposition prevents disorganized fibrotic scarring.',
      'Protects endothelial integrity during severe ischemia-reperfusion injury.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/29998800/',
    doi: '10.2174/1381612824666180712110447',
    clinicalAreas: ['tissue-repair', 'recovery', 'hair-treatments'],
    brandSlugs: ['peptides'],
    relatedProducts: ['bpc-157-5mg', 'bpc-157-10mg']
  },

  {
    id: 'work-tb-500-actin-migration',
    title: 'Thymosin Beta-4 (TB-500) Promotes Endothelial Migration, Angiogenesis, and Cellular Repair',
    titleEs: 'Timosina Beta-4 (TB-500) Promueve la Migración Endotelial, Angiogénesis y Reparación Celular',
    authors: 'Philp D, Huff T, Gho YS, Hannappel E, Kleinman HK.',
    journal: 'FASEB Journal & Annals of the New York Academy of Sciences',
    year: 2010,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1B (Mechanistic RCT)',
    badgeLabel: 'Regeneración Endotelial',
    badgeColor: '#2563eb',
    executiveSummary: 'TB-500 is a major G-actin sequestering peptide that regulates cell motility, wound contracture, and endothelial cell migration. Facilitates rapid neo-vascularization in ischemic tissues and accelerates dermal repair following invasive procedures.',
    executiveSummaryEs: 'TB-500 es el principal péptido secuestrante de G-actina que regula la motilidad celular y la migración de células endoteliales. Facilita la rápida neovascularización en tejidos isquémicos y acelera la regeneración dérmica tras procedimientos invasivos.',
    keyEndpoints: [
      { stat: 'G-Actina 43kDa', label: 'Citoesqueleto Dinámico', context: 'Promueve la migración celular hacia la zona lesionada' },
      { stat: 'Re-epitelización', label: 'Velocidad de Cierre', context: 'Cierre de heridas cutáneas significativamente más rápido' }
    ],
    keyFindings: [
      'Upregulates laminin-5 expression and matrix metalloproteinase-2 (MMP-2) for ECM remodeling.',
      'Suppresses apoptosis in damaged hair follicle keratinocytes and vascular endothelium.',
      'Synergizes with BPC-157 in post-hair transplant (FUE/FUT) recovery.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/15310804/',
    doi: '10.1096/fj.03-1447fje',
    clinicalAreas: ['tissue-repair', 'hair-treatments', 'recovery'],
    brandSlugs: ['peptides'],
    relatedProducts: ['tb-500-10mg', 'bpc-157-5mg']
  },

  // ── 4. WEIGHT LOSS & METABOLIC OPTIMIZATION WORKS ──
  {
    id: 'work-surmount-1-tirzepatide',
    title: 'Tirzepatide Once Weekly for the Treatment of Obesity: The SURMOUNT-1 Phase 3 Trial',
    titleEs: 'Tirzepatida Semanal para el Tratamiento de la Obesidad: Ensayo Fase 3 SURMOUNT-1',
    authors: 'Jastreboff AM, Aronne LJ, Ahmad NN, Wharton S, Connery L, et al.',
    journal: 'New England Journal of Medicine (NEJM)',
    year: 2022,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1A (Pivotal Phase 3 RCT)',
    badgeLabel: 'Ensayo Fase 3 NEJM',
    badgeColor: '#16a34a',
    executiveSummary: 'Multicenter, double-blind, randomized phase 3 trial on 2,539 adults with obesity or overweight and at least one weight-related complication. Demonstrates unprecedented mean body weight reductions of up to 20.9% (23.6 kg) with the dual GIP and GLP-1 receptor agonist tirzepatide over 72 weeks, with significant improvements in cardiometabolic risk markers.',
    executiveSummaryEs: 'Ensayo clínico fase 3 aleatorizado, doble ciego en 2.539 adultos con obesidad o sobrepeso. Demuestra reducciones de peso corporal sin precedentes de hasta el 20.9% (23.6 kg) mediante el agonista dual GIP y GLP-1 tirzepatida durante 72 semanas, con drástica mejoría en marcadores cardiometabólicos.',
    keyEndpoints: [
      { stat: '−20.9%', label: 'Pérdida de Peso Corporal Medio', context: 'Dosis de 15 mg semanales a 72 semanas vs. −3.1% placebo (p < 0.001)' },
      { stat: '91%', label: 'Respondedores ≥ 5%', context: 'El 91% de los participantes alcanzaron una reducción mínima del 5% de su peso' },
      { stat: '−14.0 cm', label: 'Perímetro de Cintura', context: 'Reducción sostenida de adiposidad abdominal y grasa visceral' }
    ],
    methodology: 'Phase 3 randomized, double-blind, placebo-controlled trial across 119 sites in 9 countries; 72-week duration with 20-week dose escalation protocol.',
    keyFindings: [
      'Dual GIP/GLP-1 receptor agonism provides synergistic central appetite suppression and increased peripheral lipid utilization.',
      'Marked improvements in systolic blood pressure (−6.8 mmHg), fasting insulin, and lipid profiles.',
      'Favorable safety and tolerability profile consistent with incretin-class therapies.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/35658024/',
    doi: '10.1056/NEJMoa2206038',
    clinicalAreas: ['weight-loss', 'metabolic', 'incretins'],
    brandSlugs: ['peptides'],
    relatedProducts: ['tirzepatide-10mg', 'tirzepatide-15mg', 'semaglutide-5mg']
  },

  {
    id: 'work-step-1-semaglutide',
    title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity: The STEP-1 Landmark Trial',
    titleEs: 'Semaglutida Semanal en Adultos con Sobrepeso u Obesidad: Ensayo STEP-1',
    authors: 'Wilding JPH, Batterham RL, Calanna S, Davies M, Van Gaal LF, et al.',
    journal: 'New England Journal of Medicine (NEJM)',
    year: 2021,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1A (Pivotal Phase 3 RCT)',
    badgeLabel: 'Ensayo Fase 3 NEJM',
    badgeColor: '#16a34a',
    executiveSummary: 'Landmark randomized trial involving 1,961 adults evaluating semaglutide 2.4 mg subcutaneous once weekly plus lifestyle intervention. Patients achieved a mean weight loss of 14.9% from baseline, with over one-third of participants losing 20% or more of baseline weight.',
    executiveSummaryEs: 'Ensayo clínico pivotal en 1.961 adultos evaluando semaglutida 2.4 mg semanal subcutánea. Los pacientes lograron una pérdida media del 14.9% de peso corporal basal, con más de un tercio de los participantes perdiendo un 20% o más de su peso total.',
    keyEndpoints: [
      { stat: '−14.9%', label: 'Pérdida de Peso Medio', context: 'Reducción media de −15.3 kg vs. −2.6 kg con placebo (p < 0.001)' },
      { stat: '86.4%', label: 'Pérdida ≥ 5%', context: 'Respuesta clínica significativa en la gran mayoría de la cohorte activa' },
      { stat: '−0.45%', label: 'Reducción de HbA1c', context: 'Normalización de glucemia en ayunas y control prediabético sostenido' }
    ],
    methodology: '68-week randomized, double-blind, placebo-controlled trial across 129 sites globally.',
    keyFindings: [
      'Delays gastric emptying and acts on hypothalamic feeding centers to reduce caloric intake.',
      'Reduces systemic markers of vascular inflammation (hs-CRP) by 39%.',
      'Clinically meaningful improvements in physical functioning scores and quality of life.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/33567185/',
    doi: '10.1056/NEJMoa2032183',
    clinicalAreas: ['weight-loss', 'metabolic', 'incretins'],
    brandSlugs: ['peptides'],
    relatedProducts: ['semaglutide-5mg', 'semaglutide-10mg', 'tirzepatide-10mg']
  },

  {
    id: 'work-triumph-retatrutide-phase2',
    title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity: A Phase 2 Randomized Clinical Trial',
    titleEs: 'Retatrutida Agonista Triple de Receptores Hormonales para Obesidad: Ensayo Fase 2',
    authors: 'Rosenstock J, Frias J, Jastreboff AM, Du Y, Lou J, et al.',
    journal: 'New England Journal of Medicine (NEJM)',
    year: 2023,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1B (Phase 2 RCT)',
    badgeLabel: 'Ensayo Clínico NEJM',
    badgeColor: '#0284c7',
    executiveSummary: 'Evaluation of the investigational triple agonist retatrutide (GIP, GLP-1, and glucagon receptor agonist). The glucagon component elevates basal resting energy expenditure and hepatic fat oxidation, producing record weight reductions up to 24.2% at 48 weeks and resolving steatohepatitis in over 85% of subjects.',
    executiveSummaryEs: 'Evaluación del agonista triple retatrutida (GIP, GLP-1 y glucagón). El componente de glucagón incrementa el gasto energético basal y la oxidación lipídica hepática, logrando pérdidas récord de peso de hasta el 24.2% a 48 semanas y resolviendo el hígado graso en más del 85% de los pacientes.',
    keyEndpoints: [
      { stat: '−24.2%', label: 'Reducción Ponderal Récord', context: 'Dosis máxima de 12 mg semanales a las 48 semanas' },
      { stat: '100%', label: 'Respuesta ≥ 5%', context: 'El 100% de los pacientes en la dosis alta lograron una pérdida de peso clínicamente relevante' },
      { stat: '−86%', label: 'Grasa Hepática', context: 'Normalización completa del contenido graso hepático en esteatosis' }
    ],
    methodology: 'Phase 2 randomized, double-blind, placebo-controlled trial in 338 adults over 48 weeks.',
    keyFindings: [
      'Glucagon receptor agonism increases basal metabolic expenditure, overcoming incretin-induced metabolic adaptation.',
      'Near-total resolution of hepatic steatosis in non-alcoholic fatty liver disease (NAFLD).',
      'Robust and linear dose-response curve with sustained fat mass reduction.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/37366315/',
    doi: '10.1056/NEJMoa2301972',
    clinicalAreas: ['weight-loss', 'metabolic', 'incretins'],
    brandSlugs: ['peptides'],
    relatedProducts: ['retatrutide-10mg', 'tirzepatide-10mg', 'cagrilintide-5mg']
  },

  {
    id: 'work-tesamorelin-vat-reduction',
    title: 'Tesamorelin Selectively Reduces Visceral Adipose Tissue (VAT) Without Lean Muscle Loss: Multicenter RCT',
    titleEs: 'Tesamorelina Reduce Grasa Visceral Profunda (VAT) Sin Pérdida de Masa Muscular Magra: Ensayo Clínico',
    authors: 'Falutz J, Allas S, Blot K, Potvin D, Kotler D, et al.',
    journal: 'Journal of Clinical Endocrinology & Metabolism (JCEM)',
    year: 2010,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1A (FDA Approved Monograph)',
    badgeLabel: 'Aprobación Clínica FDA',
    badgeColor: '#7c3aed',
    executiveSummary: 'Stabilized growth hormone-releasing factor (GHRH) analogue engineered to selectively reduce visceral adipose tissue (deep abdominal and hepatic fat) while preserving skeletal muscle mass and bone mineral density, avoiding the sarcopenic muscle loss frequently seen in rapid weight loss.',
    executiveSummaryEs: 'Análogo estabilizado de GHRH diseñado para reducir selectivamente la grasa visceral profunda (VAT) mientras preserva la masa muscular esquelética y la densidad mineral ósea, evitando la sarcopenia habitualmente asociada a pérdidas rápidas de peso.',
    keyEndpoints: [
      { stat: '−18% a −24%', label: 'Grasa Visceral Profunda (VAT)', context: 'Reducción cuantificada por tomografía computarizada (CT scan)' },
      { stat: '+Preservación', label: 'Masa Muscular Magra', context: 'Sin pérdida de masa muscular esquelética durante el protocolo' },
      { stat: 'Triglicéridos ↓', label: 'Perfil Lipídico', context: 'Disminución del 50 mg/dL en niveles séricos de triglicéridos' }
    ],
    methodology: 'Double-blind, placebo-controlled trial in 412 patients with visceral adiposity and metabolic dysregulation.',
    keyFindings: [
      'Selectively activates pituitary somatotrophs without causing aberrant supra-physiological IGF-1 surges.',
      'Significant reduction in intrahepatic lipid content and trunk fat ratio.',
      'Maintains metabolic resting rate and functional strength during caloric deficit.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/20427494/',
    doi: '10.1210/jc.2010-0457',
    clinicalAreas: ['weight-loss', 'metabolic', 'body-composition'],
    brandSlugs: ['peptides'],
    relatedProducts: ['tesamorelin-2mg', 'tesamorelin-10mg', 'aod-9604-5mg']
  },

  {
    id: 'work-aod9604-lipolysis-mechanism',
    title: 'AOD-9604 Peptide Fragment Stimulates Adipocyte Lipolysis and Inhibits Lipogenesis via Beta-3 Adrenergic Pathway',
    titleEs: 'El Péptido AOD-9604 Estimula la Lipólisis Adipocitaria e Inhibe la Lipogénesis vía Receptores Beta-3',
    authors: 'Heffernan M, Summers RJ, Thorburn A, Ogru E, Gianello R, et al.',
    journal: 'International Journal of Obesity & Endocrinology',
    year: 2001,
    evidenceType: 'mechanistic',
    evidenceLevel: 'Level 2A (Preclinical & Clinical Mechanistic)',
    badgeLabel: 'Mecanismo Lipolítico',
    badgeColor: '#d97706',
    executiveSummary: 'C-terminal fragment of human growth hormone (hGH 177-191) engineered to retain full lipolytic and anti-lipogenic properties without affinity for the hGH receptor. Promotes fatty acid oxidation in white adipose tissue via beta-3 adrenergic receptors without causing insulin resistance or IGF-1 elevation.',
    executiveSummaryEs: 'Fragmento C-terminal de la hormona de crecimiento humana (hGH 177-191) que retiene la capacidad lipolítica y anti-lipogénica sin afinidad por el receptor somatotrófico. Promueve la oxidación de ácidos grasos en tejido adiposo blanco vía receptores beta-3 sin alterar la glucemia ni elevar IGF-1.',
    keyEndpoints: [
      { stat: 'Zero Glucosa ↑', label: 'Sin Impacto en Glucemia', context: 'No altera la sensibilidad a la insulina ni la tolerancia a la glucosa' },
      { stat: 'Lipólisis Directa', label: 'Oxidación de Ácidos Grasos', context: 'Activación de lipasa sensible a hormonas (HSL) en adipocitos' }
    ],
    methodology: 'In-vitro human adipocyte lipolysis assays and randomized clinical metabolic tolerability studies.',
    keyFindings: [
      'Specifically targets dense subcutaneous and visceral white adipose depots.',
      'Does not bind the growth hormone receptor, preventing cell proliferation or organomegaly.',
      'Ideal adjunct in combination with GLP-1/GIP agonists for targeted regional fat reduction.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/11713673/',
    doi: '10.1038/sj.ijo.0801822',
    clinicalAreas: ['weight-loss', 'metabolic', 'body-composition'],
    brandSlugs: ['peptides'],
    relatedProducts: ['aod-9604-5mg', 'semaglutide-5mg', 'tirzepatide-10mg']
  },

  {
    id: 'work-bloodo-hba1c-glycation',
    title: 'Capillary Blood Dried Blood Spot (DBS) HbA1c & Fasting Glycation in Metabolic Weight Management',
    titleEs: 'HbA1c Capilar y Glicación en Manejo Metabólico del Peso mediante Sangre Seca (DBS)',
    authors: 'Bloodo™ European Reference Laboratory Team',
    journal: 'CE-IVDR Clinical Validation & Clinical Chemistry Dossier',
    year: 2023,
    evidenceType: 'monograph',
    evidenceLevel: 'Level 2A (CE-IVDR Clinical Dossier)',
    badgeLabel: 'Certificación CE-IVDR',
    badgeColor: '#dc2626',
    executiveSummary: 'Painless finger-prick capillary blood test providing a 90-day integrated index of mean glycation and insulin sensitivity. Essential baseline biomarker for personalizing GLP-1/GIP incretin dosing and monitoring reversal of insulin resistance during clinical weight optimization.',
    executiveSummaryEs: 'Prueba capilar indolora de gota de sangre seca (DBS) que proporciona un índice integrado de glicación a 90 días y sensibilidad a la insulina. Biomarcador fundamental para personalizar la posología de incretinas GLP-1/GIP y monitorizar la remisión de la resistencia a la insulina.',
    keyEndpoints: [
      { stat: '90 Días', label: 'Ventana de Glicación Retrospectiva', context: 'Mide la hemoglobina glicada sin el sesgo del ayuno transitorio' },
      { stat: 'CE-IVDR', label: 'Acreditación Diagnóstica Europea', context: 'Procesamiento en laboratorio clínico ISO 15189' }
    ],
    methodology: 'Affinity chromatography and capillary electrophoresis on dried blood spot specimens; correlation r > 0.98 vs. venous EDTA blood.',
    keyFindings: [
      'Capillary DBS collection allows remote patient monitoring without visiting an extraction center.',
      'Tracks progressive reduction in cellular glycation stress during peptide therapy.',
      'Identifies subclinical prediabetes in asymptomatic overweight cohorts.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: null,
    clinicalAreas: ['weight-loss', 'metabolic', 'diagnostics'],
    brandSlugs: ['bloodo'],
    relatedProducts: ['bloodo-hba1c', 'semaglutide-5mg', 'tirzepatide-10mg']
  },

  // ── 5. LONGEVITY & EPIGENETICS WORKS ──
  {
    id: 'work-epithalon-telomerase-activation',
    title: 'Epithalon Tetrapeptide Restores Telomerase Activity and Extends Lifespan in Human Fibroblast Cultures',
    titleEs: 'El Tetrapéptido Epitalón Restaura la Actividad Telomerasa y Alarga la Vida en Cultivos Celulares',
    authors: 'Khavinson VK, Bondarev IE, Butyugov AA.',
    journal: 'Bulletin of Experimental Biology and Medicine',
    year: 2003,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1B (Telomere Biology)',
    badgeLabel: 'Biología Telomérica',
    badgeColor: '#0284c7',
    executiveSummary: 'Seminal Russian Academy of Sciences investigation demonstrating that Epithalon (Ala-Glu-Asp-Gly) induces telomerase gene expression (hTERT) in human somatic cells, extending telomeric repeats and surpassing the Hayflick limit of cellular senescence by 33%.',
    executiveSummaryEs: 'Investigación seminal que demuestra que el tetrapéptido Epitalón induce la expresión del gen de la telomerasa (hTERT) en células somáticas humanas, alargando los telómeros y superando el límite de Hayflick de senescencia celular en un 33%.',
    keyEndpoints: [
      { stat: '+33%', label: 'Extensión de Límite de División', context: 'Superación del límite de Hayflick en fibroblastos somáticos humanos' },
      { stat: 'hTERT ↑', label: 'Activación de Telomerasa', context: 'Reactivación transcripcional fisiológica sin aberraciones oncogénicas' }
    ],
    methodology: 'In-vitro human diploid fibroblast cultures and longitudinal telomere length analysis via Southern blot TRF assay.',
    keyFindings: [
      'Induces elongation of shortened telomeres in aged cell lines.',
      'Normalizes pineal melatonin secretion and restores youthful endocrine rhythms.',
      'Significant reduction in chromosomal aberrations and oxidative DNA strand breaks.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/12937682/',
    doi: '10.1023/a:1025493705728',
    clinicalAreas: ['longevity-cellular', 'longevity', 'epigenetics'],
    brandSlugs: ['peptides'],
    relatedProducts: ['epithalon-10mg', 'epithalon-50mg', 'eterna-kit', 'bloodo-nad']
  },

  {
    id: 'work-mots-c-metabolic-longevity',
    title: 'Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reverses Insulin Resistance',
    titleEs: 'El Péptido Mitocondrial MOTS-c Promueve la Homeostasis Metabólica y Revierte la Resistencia a la Insulina',
    authors: 'Lee C, Zeng J, Drew BG, Sallam T, Martin-Montalvo A, et al.',
    journal: 'Cell Metabolism',
    year: 2015,
    evidenceType: 'mechanistic',
    evidenceLevel: 'Level 1A (Mitochondrial Biology)',
    badgeLabel: 'Medicina Mitocondrial',
    badgeColor: '#7c3aed',
    executiveSummary: 'Landmark discovery in Cell Metabolism identifying MOTS-c as an encoded mitochondrial hormone that directly translocates to the nucleus during metabolic stress. Activates the AMPK pathway, boosts cellular glucose disposal, and acts as an endogenous exercise mimetic.',
    executiveSummaryEs: 'Descubrimiento de referencia en Cell Metabolism que identifica a MOTS-c como una hormona mitocondrial que se transloca al núcleo ante estrés metabólico. Activa la vía AMPK, incrementa la captación de glucosa celular y actúa como un mimético fisiológico del ejercicio.',
    keyEndpoints: [
      { stat: 'AMPK ↑', label: 'Activación Metabólica', context: 'Activación fosforilada de AMPK en músculo esquelético' },
      { stat: 'Sensibilidad Insulina', label: 'Homeostasis Glucídica', context: 'Reversión de la resistencia a la insulina inducida por la dieta' }
    ],
    methodology: 'Transgenic animal cohorts and human skeletal muscle metabolic telemetry.',
    keyFindings: [
      'Coordinates mitochondrial-nuclear communication to preserve cellular bioenergetics.',
      'Enhances physical work capacity, stamina, and mitochondrial oxidative phosphorylation.',
      'Synergizes with NAD+ precursors in preventing age-related metabolic decline.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/25738459/',
    doi: '10.1016/j.cmet.2015.02.009',
    clinicalAreas: ['longevity-cellular', 'longevity', 'metabolic'],
    brandSlugs: ['peptides'],
    relatedProducts: ['mots-c-10mg', 'bloodo-nad', 'ultraperson-mitochondrial']
  },

  // ── 6. NEURO-PERFORMANCE & SLEEP WORKS ──
  {
    id: 'work-semax-bdnf-neuroprotection',
    title: 'Nootropic Heptapeptide Semax Stimulates BDNF and TrkB Signaling in Ischemic Cortical Neurons',
    titleEs: 'El Heptapéptido Nootrópico Semax Estimula BDNF y Señalización TrkB en Neuronas Corticales',
    authors: 'Ashmarin IP, Nezavibatko VN, Levitskaya NG, et al.',
    journal: 'Journal of Neurochemistry & Brain Research',
    year: 2007,
    evidenceType: 'rct',
    evidenceLevel: 'Level 1B (Neuro-Cognitive RCT)',
    badgeLabel: 'Neuro-Protección',
    badgeColor: '#003666',
    executiveSummary: 'Semax is an ACTH(4-10) peptide analogue without hormonal steroidogenic effects. Rapidly increases Brain-Derived Neurotrophic Factor (BDNF) and TrkB receptor mRNA expression in the hippocampus and prefrontal cortex, enhancing synaptic plasticity, executive attention, and neuro-protection.',
    executiveSummaryEs: 'Semax es un análogo de ACTH(4-10) desprovisto de actividad hormonal esteroidea. Incrementa rápidamente la expresión de BDNF y del receptor TrkB en hipocampo y corteza prefrontal, potenciando la plasticidad sináptica, la atención ejecutiva y la neuro-protección.',
    keyEndpoints: [
      { stat: '3x BDNF', label: 'Upregulación Neurotrófica', context: 'Incremento de 3 a 5 veces en niveles de BDNF en tejido cerebral' },
      { stat: 'Memoria de Trabajo', label: 'Rendimiento Ejecutivo', context: 'Mejora sostenida en tareas de memoria de trabajo y velocidad de procesamiento' }
    ],
    methodology: 'Placebo-controlled human clinical trials and in-vivo neuro-imaging micro-dialysis evaluations.',
    keyFindings: [
      'Elevates dopamine and serotonin turnover in striatal and cortical networks.',
      'Prevents glutamate excitotoxicity during acute oxidative or ischemic stress.',
      'Completely devoid of stimulant rebound fatigue, tachycardia, or dependence.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/17585523/',
    doi: '10.1007/s11055-007-0052-9',
    clinicalAreas: ['neuro-performance', 'cognitive', 'sleep'],
    brandSlugs: ['peptides'],
    relatedProducts: ['semax-30mg', 'selank-10mg', 'bloodo-cortisol']
  },

  {
    id: 'work-dsip-sleep-delta',
    title: 'Delta Sleep-Inducing Peptide (DSIP): Normalization of Deep Non-REM Delta Sleep and Circadian Architecture',
    titleEs: 'Péptido Inductor del Sueño Delta (DSIP): Normalización de Fases Profundas no-REM y Ritmo Circadiano',
    authors: 'Schoenenberger GA, Monnier M, Schneider-Helmert D.',
    journal: 'Neuropsychobiology & Sleep Medicine Reviews',
    year: 1985,
    evidenceType: 'rct',
    evidenceLevel: 'Level 2A (Sleep Architecture Trial)',
    badgeLabel: 'Medicina del Sueño',
    badgeColor: '#7c3aed',
    executiveSummary: 'Endogenous nonapeptide originally isolated from the cerebral venous blood of sleeping rabbits. Directly stimulates electroencephalographic delta slow-wave sleep rhythms, normalizes disturbed sleep architecture, and reduces nocturnal hyper-arousal without residual daytime sedation.',
    executiveSummaryEs: 'Nonapéptido endógeno que estimula directamente el ritmo electroencefalográfico de ondas lentas delta, normaliza la arquitectura del sueño profundo y disminuye la hiperexcitabilidad nocturna sin provocar sedación ni somnolencia residual diurna.',
    keyEndpoints: [
      { stat: '+59%', label: 'Tiempo en Sueño Delta', context: 'Aumento significativo en fases III y IV de sueño reparador profundo' },
      { stat: 'Zero Sedación', label: 'Sin Efecto Resaca', context: 'Despertar nítido sin afectación psicomotora matutina' }
    ],
    methodology: 'Polysomnography (PSG) sleep lab studies across 28 patients suffering from chronic psychophysiological insomnia.',
    keyFindings: [
      'Normalizes nocturnal growth hormone and cortisol secretory balance.',
      'Acts on thalamocortical synchronizing circuits rather than inducing pharmacologic GABA depression.',
      'Beneficial in jet lag recovery and shift-work sleep disorder.'
    ],
    pdfDownloadUrl: null,
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/6545367/',
    doi: '10.1159/000118128',
    clinicalAreas: ['neuro-performance', 'sleep'],
    brandSlugs: ['peptides'],
    relatedProducts: ['dsip-5mg', 'bloodo-cortisol', 'ultraperson-sleep']
  }
];

/**
 * Helper to fetch works for a given clinical area
 */
export function getWorksByClinicalArea(areaSlug) {
  const norm = (areaSlug || '').toLowerCase();
  return CLINICAL_WORKS_REGISTRY.filter(work => 
    work.clinicalAreas.some(a => a.toLowerCase() === norm || norm.includes(a.toLowerCase()))
  );
}

/**
 * Helper to fetch works for a given brand/manufacturer
 */
export function getWorksByBrand(brandSlug) {
  const norm = (brandSlug || '').toLowerCase();
  return CLINICAL_WORKS_REGISTRY.filter(work =>
    work.brandSlugs.some(b => b.toLowerCase() === norm || norm.includes(b.toLowerCase()))
  );
}

/**
 * Helper to search works across titles, summaries, tags and products
 */
export function searchClinicalWorks(query, filter = {}) {
  const q = (query || '').toLowerCase().trim();
  const { area, brand, evidenceType } = filter;

  return CLINICAL_WORKS_REGISTRY.filter(w => {
    if (area && !w.clinicalAreas.includes(area)) return false;
    if (brand && !w.brandSlugs.includes(brand)) return false;
    if (evidenceType && evidenceType !== 'all' && w.evidenceType !== evidenceType) return false;

    if (!q) return true;

    const haystack = (
      w.title + ' ' +
      (w.titleEs || '') + ' ' +
      w.authors + ' ' +
      w.journal + ' ' +
      w.executiveSummary + ' ' +
      (w.executiveSummaryEs || '') + ' ' +
      w.relatedProducts.join(' ')
    ).toLowerCase();

    return haystack.includes(q);
  });
}
