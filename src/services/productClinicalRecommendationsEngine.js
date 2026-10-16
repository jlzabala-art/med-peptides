/**
 * src/services/productClinicalRecommendationsEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas Clinical Adjuvant & Cross-Selling Synergy Engine
 *
 * Provides scientifically grounded, mechanism-based clinical recommendations
 * for all products in the Atlas catalog across 4 biological pillars:
 *   1. Tissue Scaffolding & Substrates (Oral Tropocollagen, Galenic Bases)
 *   2. Bioregulatory Peptides & Growth Signals (BPC-157, TB-500, GHK-Cu)
 *   3. Clinical Reconstitution Vehicles & Administration Supplies (BAC Water, Syringes)
 *   4. Diagnostic Biomarker Panels (TeleTest HTMA, Omega-3, Bloodo NAD+)
 *
 * Adheres strictly to AGENTS.md rules. Client-safe (0 Node.js dependencies).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function getProductClinicalRecommendations(product = {}, slug = '', lang = 'en') {
  const isEs = lang === 'es';
  const pSlug = String(slug || product?.slug || product?.id || '').toLowerCase();
  const pName = String(product?.canonicalName || product?.name || '').toLowerCase();
  const cat = String(product?.category || product?.therapeutic_category || '').toLowerCase();
  const type = String(product?.type || product?.productType || '').toLowerCase();

  // ─────────────────────────────────────────────────────────────────────────
  // 1. COLVITA NATIVE TROPOCOLLAGEN & DIETARY SUPPLEMENTS
  // ─────────────────────────────────────────────────────────────────────────
  if (pSlug.includes('colvita') || pName.includes('colvita') || cat.includes('supplement') || type.includes('supplement')) {
    return [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Péptido Regenerativo' : 'Regenerative Peptide',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Neo-Colagénesis & Angiogénesis' : 'Neo-Collagenesis & Angiogenesis',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'BPC-157 activa la señalización de EGR-1 y VEGF en fibroblastos. El tropocolágeno puro liofilizado de Colvita suministra los oligopéptidos estructurales específicos (hidroxiprolina y prolina) necesarios para materializar la matriz extracelular ordenada.'
          : 'BPC-157 upregulates EGR-1 and VEGF signaling in fibroblasts. Freeze-dried native Colvita tropocollagen provides the exact structural oligopeptide substrates (hydroxyproline, proline) required to synthesize organized ECM.',
        role: isEs ? 'Activador Celular de Síntesis ECM' : 'ECM Cellular Synthesis Activator'
      },
      {
        id: 'ghk-cu',
        slug: 'ghk-cu',
        name: 'GHK-Cu (Copper Tripeptide-1)',
        category: isEs ? 'Péptido Antienvejecimiento' : 'Anti-Aging Peptide',
        presentation: isEs ? 'Vial Liofilizado (50 mg / 100 mg)' : 'Lyophilized Vial (50 mg / 100 mg)',
        image: '/images/products/lotusland/ghk-cu.png',
        url: '/p/ghk-cu',
        synergyBadge: isEs ? 'Entrecruzamiento LOX & Firmeza' : 'LOX Cross-Linking & Dermal Tensile',
        synergyBadgeColor: '#0d9488',
        clinicalRationale: isEs
          ? 'GHK-Cu induce la expresión de la lisil oxidasa (LOX), la enzima que entrecruza covalentemente las triples hélices de tropocolágeno en fibras resistentes a la tracción dérmica y articular.'
          : 'GHK-Cu upregulates lysyl oxidase (LOX), the key enzyme that covalently cross-links tropocollagen helices into resilient, load-bearing dermal and joint collagen fibers.',
        role: isEs ? 'Catalizador de Entrecruzamiento de Fibras' : 'Collagen Fibril Cross-Linking Catalyst'
      },
      {
        id: 'teletest-mineralograma-cabello-htma',
        slug: 'teletest-mineralograma-cabello-htma',
        name: 'TeleTest HTMA Mineralograma de Cabello',
        category: isEs ? 'Diagnóstico Clínico ICP-MS' : 'ICP-MS Clinical Diagnostic',
        presentation: isEs ? 'Kit de Muestra Capilar (33 Minerales + 10 Ratios)' : 'Hair Kit (33 Elements + 10 Ratios)',
        image: '/images/products/teletest/mineralograma.svg',
        url: '/p/teletest-mineralograma-cabello-htma',
        synergyBadge: isEs ? 'Cofactores de Síntesis & Metales Pesados' : 'Cofactors & Toxic Elements',
        synergyBadgeColor: '#7c3aed',
        clinicalRationale: isEs
          ? 'La síntesis de colágeno depende de la homeostasis Zinc/Cobre y la actividad tiroidea (Ca/K). El HTMA descarta toxicidad por plomo o cadmio, metales que bloquean las enzimas colagenasas y degradan la matriz.'
          : 'Collagen synthesis requires optimal Zn/Cu ratios and thyroid rate (Ca/K). HTMA rules out toxic heavy metals (Pb, Cd, Hg) that inhibit prolyl hydroxylase and degrade connective tissue.',
        role: isEs ? 'Validación Analítica de Micronutrientes' : 'Micronutrient Analytical Baseline'
      },
      {
        id: 'tb-500',
        slug: 'tb-500',
        name: 'TB-500 (Thymosin Beta-4)',
        category: isEs ? 'Reparación Tisular' : 'Tissue Repair',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/tb-500.png',
        url: '/p/tb-500',
        synergyBadge: isEs ? 'Migración Celular & Anti-Fibrosis' : 'Cell Migration & Anti-Fibrosis',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'TB-500 moviliza la actina y atrae células progenitoras hacia zonas lesionadas. Combinado con Colvita, asegura una remodelación ordenada sin formación de cicatrices hipertróficas o adherencias fibrosas.'
          : 'TB-500 sequesters G-actin, driving stem cell migration to damaged connective tissue while preventing fibrotic collagen scar tissue in synergy with oral tropocollagen.',
        role: isEs ? 'Coordinador de Remodelación Fibrilar' : 'Fibrillar Remodeling Coordinator'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. REGENERATIVE & TISSUE REPAIR PEPTIDES (BPC-157, TB-500, KPV, ETC.)
  // ─────────────────────────────────────────────────────────────────────────
  if (pSlug.includes('bpc') || pSlug.includes('tb-500') || pSlug.includes('kpv') || pSlug.includes('ara-290') || pSlug.includes('pentosan')) {
    return [
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Tropocolágeno Nativo Liofilizado',
        category: isEs ? 'Nutracéutico de Matriz Extracelular' : 'ECM Nutricosmetic & Substrate',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Sustrato Estructural de Prolina/Hidroxiprolina' : 'Structural Proline/Hydroxyproline Substrate',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Los péptidos bioactivos señalizan la síntesis acelerada de tejido, pero la velocidad de recuperación está limitada por la biodisponibilidad de oligopéptidos de colágeno triple-hélice. Colvita provee el andamio bioactivo esencial.'
          : 'Regenerative peptides signal rapid fibroblast activation, but clinical repair rate is limited by collagen oligopeptide precursor availability. Colvita supplies intact, freeze-dried tropocollagen building blocks.',
        role: isEs ? 'Sustrato de Síntesis Tisular' : 'Tissue Synthesis Substrate'
      },
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Solvente de Reconstitución Oficial' : 'Official Reconstitution Diluent',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Agua estéril bacteriostática con alcohol bencílico 0.9% USP. Indispensable para preservar la estabilidad microbiológica y conformación molecular del péptido hasta 28 días refrigerado tras la reconstitución.'
          : 'Sterile bacteriostatic water containing 0.9% benzyl alcohol USP. Essential for maintaining peptide molecular conformation and microbiological sterility for up to 28 days refrigerated.',
        role: isEs ? 'Vehículo de Administración Clínico' : 'Clinical Reconstitution Vehicle'
      },
      {
        id: pSlug.includes('bpc') ? 'tb-500' : 'bpc-157',
        slug: pSlug.includes('bpc') ? 'tb-500' : 'bpc-157',
        name: pSlug.includes('bpc') ? 'TB-500 (Thymosin Beta-4)' : 'BPC-157 (Body Protection Compound)',
        category: isEs ? 'Sinergia Péptido Dual' : 'Dual Peptide Synergy',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: pSlug.includes('bpc') ? '/images/products/lotusland/tb-500.png' : '/images/products/lotusland/bpc-157.png',
        url: pSlug.includes('bpc') ? '/p/tb-500' : '/p/bpc-157',
        synergyBadge: isEs ? 'Dúo Regenerativo Canónico (Wolverine)' : 'Canonical Tissue Regeneration Duo',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'La combinación BPC-157 + TB-500 ejerce una sinergia celular pleiotrópica: angiogénesis temprana vía VEGF (BPC) con migración de células madre y polimerización de actina (TB-500).'
          : 'BPC-157 + TB-500 co-administration produces pleiotropic synergy: rapid early VEGF angiogenesis paired with stem cell mobilization and actin cytoskeleton repair.',
        role: isEs ? 'Potenciador de Cinética Reparadora' : 'Repair Kinetics Enhancer'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. METABOLIC & WEIGHT MANAGEMENT (RETATRUTIDE, TIRZEPATIDE, SEMAGLUTIDE)
  // ─────────────────────────────────────────────────────────────────────────
  if (pSlug.includes('retatrutide') || pSlug.includes('tirzepatide') || pSlug.includes('semaglutide') || pSlug.includes('cagrilintide') || pSlug.includes('aod-9604')) {
    return [
      {
        id: 'teletest-test-omega',
        slug: 'teletest-test-omega',
        name: 'TeleTest Omega Test (HS Omega-3 & AA/EPA)',
        category: isEs ? 'Diagnóstico Metabólico & Cardiovascular' : 'Cardiovascular & Metabolic Diagnostic',
        presentation: isEs ? 'Analítica Sangre Total (24 Ácidos Grasos)' : 'Whole Blood Diagnostic (24 Fatty Acids)',
        image: '/images/products/teletest/omega-test.svg',
        url: '/p/teletest-test-omega',
        synergyBadge: isEs ? 'Marcador de Inflamación Celular & AA/EPA' : 'Cellular Inflammation & AA/EPA Ratio',
        synergyBadgeColor: '#d97706',
        clinicalRationale: isEs
          ? 'En terapias con agonistas GLP-1/GIP/Glucagón, monitorizar el índice Omega-3 y el ratio AA/EPA previene la esteatosis hepática de rebote y evalúa la sensibilidad de la membrana adipocitaria a la lipólisis.'
          : 'During multi-agonist metabolic protocols, tracking red blood cell HS Omega-3 index and AA/EPA ratio ensures anti-inflammatory cell membrane responsiveness and protects cardiovascular endothelium.',
        role: isEs ? 'Monitorización de Resistencia Celular' : 'Membrane Sensitivity Monitoring'
      },
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Solvente de Reconstitución Oficial' : 'Official Reconstitution Diluent',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Permite reconstituir los viales con concentraciones volumétricas adaptadas a escalas de microdosis progresivas según posología clínica del médico tratante.'
          : 'Enables precise, customized reconstitution volume matching the physician titration schedule with guaranteed microbiological stability.',
        role: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Tropocolágeno Nativo',
        category: isEs ? 'Preservación de Turgencia Cutánea' : 'Skin Tightening & Tissue Elasticity',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Prevención de Flacidez en Pérdida de Peso' : 'Weight Loss Flaccidity Prevention',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'La rápida pérdida ponderal mediada por análogos de incretinas genera flacidez dérmica ("Ozempic Face"). Colvita aporta tropocolágeno no desnaturalizado para preservar la densidad de la dermis profunda.'
          : 'Rapid adipose tissue reduction often provokes dermal sagging. Colvita supplies triple-helix tropocollagen and sea algae trace elements to sustain facial collagen matrix thickness.',
        role: isEs ? 'Preservación de Firmeza Dérmica' : 'Dermal Density Preservation'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. LONGEVITY & MITOCHONDRIAL OPTIMIZATION (EPITHALON, MOTS-C, NAD+)
  // ─────────────────────────────────────────────────────────────────────────
  if (pSlug.includes('epithalon') || pSlug.includes('mots-c') || pSlug.includes('humanin') || pSlug.includes('nad') || pSlug.includes('ss-31')) {
    return [
      {
        id: 'bloodo-nad-level-test',
        slug: 'bloodo-nad-level-test',
        name: 'Bloodo NAD+ Quantitative DBS Test',
        category: isEs ? 'Marcador Longevidad Celular' : 'Cellular Longevity Biomarker',
        presentation: isEs ? 'Kit Capilar DBS (CE-IVDR)' : 'DBS Fingerstick Kit (CE-IVDR)',
        image: '/images/products/bloodo/nad-test.png',
        url: '/p/bloodo-nad-level-test',
        synergyBadge: isEs ? 'Cuantificación Bioenergética Intracelular' : 'Intracellular Bioenergetic Status',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Evalúa la concentración real de NAD+ celular para calibrar la activación de sirtuinas (SIRT1-SIRT7) y la respuesta mitocondrial a los péptidos de longevidad.'
          : 'Quantifies true intracellular NAD+ concentration to evaluate sirtuin activation capacity and mitochondrial substrate availability before and after therapy cycles.',
        role: isEs ? 'Biomarcador Mitocondrial Objetivo' : 'Objective Mitochondrial Biomarker'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Tropocolágeno Nativo',
        category: isEs ? 'Rejuvenecimiento Matriz Extracelular' : 'Extracellular Matrix Rejuvenation',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Andamio Conectivo Antisenescencia' : 'Anti-Senescence Matrix Scaffold',
        synergyBadgeColor: '#0d9488',
        clinicalRationale: isEs
          ? 'La senescencia celular degrada el colágeno tipo I y activa metaloproteinasas (MMP). Colvita suministra tropocolágeno bioactivo para rejuvenecer el microambiente estromal.'
          : 'Cellular senescence drives extracellular matrix fragmentation via MMP activation. Colvita replenishes undamaged native tropocollagen to rebuild the systemic stromal microenvironment.',
        role: isEs ? 'Reconstrucción Estromal Sistémica' : 'Systemic Stromal Reconstruction'
      },
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Solvente de Reconstitución Oficial' : 'Official Reconstitution Diluent',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Agua bacteriostática estéril para reconstitución de péptidos bioreguladores con preservante microbiológico 0.9% alcohol bencílico.'
          : 'Pharmaceutical sterile bacteriostatic diluent for multi-dose longevity peptide reconstitution and stability.',
        role: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DIAGNOSTIC TESTS (TELETEST HTMA, OMEGA, CELIAC, METABOLIZER)
  // ─────────────────────────────────────────────────────────────────────────
  if (cat.includes('diagnostic') || type.includes('diagnostic') || pSlug.includes('teletest') || pSlug.includes('bloodo')) {
    return [
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Tropocolágeno Nativo Liofilizado',
        category: isEs ? 'Nutracéutico Sistémico de Reparación' : 'Systemic Tissue Repair Nutricosmetic',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Repleción Estructural Post-Diagnóstico' : 'Post-Diagnostic Structural Repletion',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Ante hallazgos de toxicidad por metales, disbiosis o estrés oxidativo en pruebas diagnósticas, Colvita provee aminoácidos estructurales para reparar la barrera mucosal intestinal y los tejidos articulares.'
          : 'Following diagnostic detection of heavy metal toxicity, dysbiosis, or oxidative imbalance, Colvita supplies undamaged structural amino acids to restore gut barrier and connective integrity.',
        role: isEs ? 'Repleción Estructural Nutracéutica' : 'Nutraceutical Structural Repletion'
      },
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Péptido Terapéutico Dirigido' : 'Targeted Therapeutic Peptide',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Restauración de Barrera & Microinflamación' : 'Barrier Restoration & Anti-Inflammatory',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Péptido de referencia para restablecer uniones estrechas (zonulina/claudina) en mucosa intestinal o tejidos vasculares tras la detección de marcadores inflamatorios o genotipos autoinmunes.'
          : 'Gold-standard clinical peptide to restore tight junctions and resolve subclinical endothelial or mucosal inflammation identified by diagnostic testing.',
        role: isEs ? 'Terapia Dirigida por Biomarcadores' : 'Biomarker-Directed Therapy'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. DEFAULT CANONICAL PEPTIDE SYNERGY (FALLBACK FOR ALL PEPTIDES)
  // ─────────────────────────────────────────────────────────────────────────
  return [
    {
      id: 'bac-water-30ml',
      slug: 'bac-water-30ml',
      name: 'Bacteriostatic Water USP (30 mL)',
      category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
      presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
      image: '/images/products/lotusland/bac-water.png',
      url: '/p/bac-water-30ml',
      synergyBadge: isEs ? 'Solvente de Reconstitución Oficial' : 'Official Reconstitution Diluent',
      synergyBadgeColor: '#003666',
      clinicalRationale: isEs
        ? 'Vehículo estéril con 0.9% alcohol bencílico USP requerido para reconstituir viales multidosis, garantizando estabilidad físico-química y esterilidad durante 28 días.'
        : 'Essential sterile reconstituting solvent with 0.9% benzyl alcohol USP for multi-dose peptide stability up to 28 days post-mixing.',
      role: isEs ? 'Solvente de Reconstitución' : 'Reconstitution Diluent'
    },
    {
      id: 'colway-colvita',
      slug: 'colway-colvita',
      name: 'Colvita Tropocolágeno Nativo',
      category: isEs ? 'Sustrato Estructural ECM' : 'ECM Structural Substrate',
      presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
      image: '/images/products/colway/colvita.png',
      url: '/p/colway-colvita',
      synergyBadge: isEs ? 'Andamio de Péptidos Estructurales' : 'Structural Bio-Scaffold',
      synergyBadgeColor: '#0284c7',
      clinicalRationale: isEs
        ? 'Suministra tropocolágeno nativo puro liofilizado como sustrato directo para las células activadas por péptidos bioactivos, acelerando la consolidación tisular.'
        : 'Supplies freeze-dried native tropocollagen triple-helix substrates to support cellular regeneration stimulated by peptide signaling.',
      role: isEs ? 'Sustrato Biológico Conectivo' : 'Biological Connective Substrate'
    },
    {
      id: 'teletest-mineralograma-cabello-htma',
      slug: 'teletest-mineralograma-cabello-htma',
      name: 'TeleTest HTMA Mineralograma de Cabello',
      category: isEs ? 'Analítica Diagnóstica de Base' : 'Baseline Diagnostic Panel',
      presentation: isEs ? 'Kit Capilar ICP-MS (33 Elementos)' : 'ICP-MS Kit (33 Elements)',
      image: '/images/products/teletest/mineralograma.svg',
      url: '/p/teletest-mineralograma-cabello-htma',
      synergyBadge: isEs ? 'Perfil de Minerales & Metales Pesados' : 'Trace Minerals & Heavy Metals',
      synergyBadgeColor: '#7c3aed',
      clinicalRationale: isEs
        ? 'Prueba diagnóstica de alta sensibilidad para cuantificar cofactores minerales esenciales (Zn, Cu, Se, Mg) y descartar tóxicos que interfieran con la respuesta a la terapia.'
        : 'High-precision diagnostic test evaluating essential mineral cofactors and toxic elements that modulate cellular peptide responsiveness.',
      role: isEs ? 'Monitorización Diagnóstica' : 'Diagnostic Monitoring'
    }
  ];
}
