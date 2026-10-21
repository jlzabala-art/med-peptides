/**
 * src/services/productClinicalRecommendationsEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas Recommendations Engine (Clinical Adjuvant & Pairings)
 *
 * Provides clear, doctor-friendly, mechanism-based clinical recommendations
 * for all products in the Atlas catalog across 4 biological pillars:
 *   1. Tissue Scaffolding & Substrates (Bioactive Collagen, Galenic Bases)
 *   2. Bioregulatory Peptides & Growth Signals (BPC-157, TB-500, GHK-Cu)
 *   3. Clinical Reconstitution Vehicles & Administration (BAC Water, Syringes)
 *   4. Diagnostic Biomarker Panels (Bloodo NAD+, TeleTest HTMA, Omega-3)
 *
 * Golden Rule: Never recommend a product to itself. Keep rationales simple,
 * concise, and doctor-friendly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function getProductClinicalRecommendations(product = {}, slug = '', lang = 'en') {
  const isEs = lang === 'es';
  const pSlug = String(slug || product?.slug || product?.id || '').toLowerCase();
  const pName = String(product?.canonicalName || product?.name || '').toLowerCase();
  const cat = String(product?.category || product?.therapeutic_category || '').toLowerCase();
  const type = String(product?.type || product?.productType || '').toLowerCase();

  let list = [];

  // ─────────────────────────────────────────────────────────────────────────
  // 1. BLOOD & SALIVA DIAGNOSTIC TESTS (BLOODO NAD+, TELETEST PANELS)
  // ─────────────────────────────────────────────────────────────────────────

  // 1A. Bloodo NAD+ Diagnostic Test (DBS Capillary)
  if (pSlug.includes('bloodo-nad') || (pSlug.includes('bloodo') && pSlug.includes('nad')) || pName.includes('bloodo nad')) {
    list = [
      {
        id: 'nad',
        slug: 'nad',
        name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
        category: isEs ? 'Bioenergética Celular Inyectable' : 'Parenteral Bioenergetics',
        presentation: isEs ? 'Vial Clínico Liofilizado (500 mg / 1000 mg)' : 'Lyophilized Clinical Vial (500 mg / 1000 mg)',
        image: '/assets/vials/nadplus.png',
        url: '/p/nad',
        synergyBadge: isEs ? 'Tratamiento Restaurador Primario' : 'Primary Restorative Therapy',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Terapia parenteral directa para restaurar los niveles de NAD+ intracelular cuando la prueba diagnóstica refleja depleción celular y mitocondrial.'
          : 'Direct parenteral therapy to replenish intracellular NAD+ levels when diagnostic testing reveals cellular depletion and mitochondrial fatigue.',
        role: isEs ? 'Reposición Intracelular Directa' : 'Direct Intracellular Repletion'
      },
      {
        id: 'mots-c',
        slug: 'mots-c',
        name: 'MOTS-c (Mitochondrial-Derived Peptide)',
        category: isEs ? 'Regulador Metabólico Mitocondrial' : 'Mitochondrial Metabolic Regulator',
        presentation: isEs ? 'Vial Clínico (10 mg)' : '10 mg Clinical Vial',
        image: '/images/products/lotusland/mots-c.png',
        url: '/p/mots-c',
        synergyBadge: isEs ? 'Sinergia Mitocondrial' : 'Mitochondrial Synergy',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Activa la vía AMPK y mejora la captación celular de glucosa, potenciando la respuesta energética mitocondrial en protocolos con NAD+.'
          : 'Activates the AMPK pathway and improves cellular glucose uptake, enhancing mitochondrial bioenergetic response in NAD+ protocols.',
        role: isEs ? 'Activador AMPK' : 'AMPK Activator'
      },
      {
        id: 'epithalon',
        slug: 'epithalon',
        name: 'Epithalon (Synthetic Pineal Peptide)',
        category: isEs ? 'Biorregulador de Longevidad' : 'Longevity Bioregulator',
        presentation: isEs ? 'Vial Clínico (10 mg / 50 mg)' : '10 mg / 50 mg Clinical Vial',
        image: '/images/products/lotusland/epithalon.png',
        url: '/p/epithalon',
        synergyBadge: isEs ? 'Protocolo de Longevidad Celular' : 'Cellular Longevity Protocol',
        synergyBadgeColor: '#0d9488',
        clinicalRationale: isEs
          ? 'Estimula la telomerasa y armoniza el ritmo neuroendocrino, complementando la restauración de NAD+ para la longevidad celular.'
          : 'Stimulates telomerase activity and harmonizes circadian endocrine rhythm, complementing NAD+ restoration for healthy cellular aging.',
        role: isEs ? 'Regulación Telomérica' : 'Telomerase Regulation'
      }
    ];
  }

  // 1B. Omega Fatty Acids & Cellular Inflammation (TeleTest Test Omega / Bloodo Omega)
  else if (pSlug.includes('omega') || pName.includes('omega') || pSlug.includes('lipid')) {
    list = [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Citoprotección Endotelial' : 'Endothelial Cytoprotection',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Resolución Microvascular' : 'Microvascular Resolution',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Estabiliza el endotelio microvascular y modula citoquinas proinflamatorias cuando el ratio AA/EPA se encuentra elevado.'
          : 'Stabilizes microvascular endothelium and down-regulates inflammatory cytokines when erythrocyte AA/EPA ratio is elevated.',
        role: isEs ? 'Protección Endotelial' : 'Endothelial Protection'
      },
      {
        id: 'nad',
        slug: 'nad',
        name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
        category: isEs ? 'Optimización Metabólica' : 'Metabolic Optimization',
        presentation: isEs ? 'Vial Liofilizado (500 mg)' : 'Lyophilized Vial (500 mg)',
        image: '/assets/vials/nadplus.png',
        url: '/p/nad',
        synergyBadge: isEs ? 'Beta-Oxidación Lipídica' : 'Lipid Beta-Oxidation',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Restaura el balance redox intracelular facilitando la beta-oxidación de ácidos grasos y la fluidez de membrana.'
          : 'Restores intracellular redox balance to facilitate mitochondrial fatty acid beta-oxidation and membrane fluidity.',
        role: isEs ? 'Soporte Redox' : 'Redox Support'
      }
    ];
  }

  // 1C. HTMA Hair Mineral Analysis (TeleTest HTMA)
  else if (pSlug.includes('htma') || pSlug.includes('mineral') || pName.includes('mineral') || pSlug.includes('cabello')) {
    list = [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Barrera Mucosa Intestinal' : 'Mucosal Barrier Protection',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Defensa de Uniones Estrechas' : 'Tight Junction Defense',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Protege la mucosa intestinal impidiendo la translocación de metales pesados y reduciendo la inflamación subclínica.'
          : 'Protects the intestinal barrier against heavy metal translocation and reduces chronic subclinical inflammation.',
        role: isEs ? 'Defensa de Barrera Mucosa' : 'Mucosal Barrier Defense'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen',
        category: isEs ? 'Sustrato de Matriz Conectiva' : 'Connective Tissue Matrix',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Reposición Estructural' : 'Structural Matrix Repletion',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Aporta tropocolágeno nativo y oligoelementos marinos para restaurar la matriz extracelular tras exposición a metales tóxicos.'
          : 'Supplies native tropocollagen and marine trace minerals to restore connective tissue matrix integrity.',
        role: isEs ? 'Sustrato Conectivo' : 'Connective Substrate'
      }
    ];
  }

  // 1D. HLA Immunogenetics & Autoimmunity (TeleTest HLA / Celiac)
  else if (pSlug.includes('hla') || pSlug.includes('celiac') || pName.includes('hla') || pSlug.includes('autoinmunidad')) {
    list = [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Restauración de Barrera Intestinal' : 'Intestinal Barrier Restoration',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Sellado de Mucosa' : 'Mucosal Tight Junction Sealing',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Revierte la permeabilidad intestinal mediada por zonulina en pacientes con susceptibilidad genética HLA a la autoinmunidad.'
          : 'Reverses intestinal hyperpermeability and stabilizes tight junctions in individuals with genetic autoimmune predisposition.',
        role: isEs ? 'Sellado de Uniones Estrechas' : 'Tight Junction Sealing'
      },
      {
        id: 'kpv',
        slug: 'kpv',
        name: 'KPV (Lysine-Proline-Valine)',
        category: isEs ? 'Antiinflamatorio Mucoso' : 'Mucosal Anti-Inflammatory',
        presentation: isEs ? 'Vial Liofilizado (5 mg)' : 'Lyophilized Vial (5 mg)',
        image: '/assets/vials/kpv.png',
        url: '/p/kpv',
        synergyBadge: isEs ? 'Inhibición NF-κB' : 'NF-κB Pathway Down-Regulation',
        synergyBadgeColor: '#d97706',
        clinicalRationale: isEs
          ? 'Tripéptido bioactivo que bloquea la activación de NF-κB en el epitelio intestinal reduciendo la respuesta autoinmune local.'
          : 'Bioactive tripeptide that attenuates epithelial NF-κB signaling, dampening mucosal inflammatory flares.',
        role: isEs ? 'Control de NF-κB' : 'NF-κB Control'
      }
    ];
  }

  // 1E. Pharmacogenetics & Hepatic Detox (TeleTest Saliva Metabolizer)
  else if (pSlug.includes('detox') || pSlug.includes('metabolizer') || pName.includes('metabolizer') || pSlug.includes('farmacogenetica')) {
    list = [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Citoprotección Hepática' : 'Hepatic Cytoprotection',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Protección Hepatocelular' : 'Hepatocellular Cytoprotection',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Protege los hepatocitos y la microcirculación hepática en pacientes con fenotipos metabolizadores lentos o intermedios.'
          : 'Protects hepatocytes and hepatic microvasculature against reactive intermediate toxicity in slow metabolizers.',
        role: isEs ? 'Soporte Hepático' : 'Hepatic Support'
      },
      {
        id: 'nad',
        slug: 'nad',
        name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
        category: isEs ? 'Cofactor Redox de Biotransformación' : 'Phase I/II Redox Cofactor',
        presentation: isEs ? 'Vial Liofilizado (500 mg)' : 'Lyophilized Vial (500 mg)',
        image: '/assets/vials/nadplus.png',
        url: '/p/nad',
        synergyBadge: isEs ? 'Aclaramiento Enzimático' : 'Enzymatic Clearance Support',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Aporta el sustrato redox necesario para las enzimas del citocromo P450 y las reacciones de conjugación de Fase II.'
          : 'Provides the essential redox cofactor required for cytochrome P450 monooxygenases and Phase II clearance.',
        role: isEs ? 'Cofactor de Biotransformación' : 'Biotransformation Cofactor'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LONGEVITY PEPTIDES & PARENTERAL NAD+ VIALS (NAD+, MOTS-C, EPITHALON, SS-31)
  // ─────────────────────────────────────────────────────────────────────────
  else if (pSlug.includes('nad') || pSlug.includes('epithalon') || pSlug.includes('mots-c') || pSlug.includes('ss-31') || pSlug.includes('humanin')) {
    // If the product is injectable NAD+ itself
    if (pSlug.includes('nad')) {
      list = [
        {
          id: 'bloodo-nad-level-test',
          slug: 'bloodo-nad-level-test',
          name: 'Bloodo™ NAD+ Quantitative DBS Test',
          category: isEs ? 'Monitorización Diagnóstica DBS' : 'DBS Diagnostic Monitoring',
          presentation: isEs ? 'Kit Capilar DBS (CE-IVDR)' : 'CE-IVDR DBS Capillary Kit',
          image: '/images/products/bloodo/nad-test.png',
          url: '/p/bloodo-nad-level-test',
          synergyBadge: isEs ? 'Monitorización Objetiva' : 'Objective Biomarker Monitoring',
          synergyBadgeColor: '#003666',
          clinicalRationale: isEs
            ? 'Cuantifica los niveles basales de NAD+ intracelular para pautar la dosis de inyección y evaluar el progreso terapéutico.'
            : 'Quantifies baseline and post-cycle intracellular NAD+ levels to objectively calibrate injection dosage and efficacy.',
          role: isEs ? 'Validación Diagnóstica' : 'Diagnostic Validation'
        },
        {
          id: 'bac-water-30ml',
          slug: 'bac-water-30ml',
          name: 'Bacteriostatic Water USP (30 mL)',
          category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
          presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
          image: '/images/products/lotusland/bac-water.png',
          url: '/p/bac-water-30ml',
          synergyBadge: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle',
          synergyBadgeColor: '#0284c7',
          clinicalRationale: isEs
            ? 'Solvente bacteriostático estéril con 0.9% alcohol bencílico indispensable para la reconstitución segura del vial.'
            : 'Sterile bacteriostatic diluent with 0.9% benzyl alcohol USP required to safely reconstitute the lyophilized vial.',
          role: isEs ? 'Solvente de Reconstitución' : 'Reconstitution Diluent'
        },
        {
          id: 'mots-c',
          slug: 'mots-c',
          name: 'MOTS-c (Mitochondrial-Derived Peptide)',
          category: isEs ? 'Regulador Metabólico Mitocondrial' : 'Mitochondrial Metabolic Regulator',
          presentation: isEs ? 'Vial Clínico (10 mg)' : '10 mg Clinical Vial',
          image: '/images/products/lotusland/mots-c.png',
          url: '/p/mots-c',
          synergyBadge: isEs ? 'Sinergia Mitocondrial' : 'Mitochondrial Synergy',
          synergyBadgeColor: '#0d9488',
          clinicalRationale: isEs
            ? 'Actúa en sinergia directa con el NAD+ activando la vía AMPK y optimizando la respiración celular mitocondrial.'
            : 'Acts in direct synergy with NAD+ by activating AMPK and boosting cellular mitochondrial respiration.',
          role: isEs ? 'Activador AMPK' : 'AMPK Activator'
        }
      ];
    } else {
      // Epithalon, MOTS-c, SS-31
      list = [
        {
          id: 'nad',
          slug: 'nad',
          name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
          category: isEs ? 'Bioenergética Celular Inyectable' : 'Parenteral Bioenergetics',
          presentation: isEs ? 'Vial Clínico Liofilizado (500 mg)' : 'Lyophilized Clinical Vial (500 mg)',
          image: '/assets/vials/nadplus.png',
          url: '/p/nad',
          synergyBadge: isEs ? 'Sinergia Bioenergética' : 'Bioenergetic Synergy',
          synergyBadgeColor: '#003666',
          clinicalRationale: isEs
            ? 'Restaura el sustrato celular de sirtuinas y la fosforilación oxidativa, potenciando la acción de los péptidos de longevidad.'
            : 'Restores sirtuin coenzyme substrate and oxidative phosphorylation, enhancing longevity peptide activity.',
          role: isEs ? 'Bioenergética Celular' : 'Cellular Bioenergetics'
        },
        {
          id: 'bloodo-nad-level-test',
          slug: 'bloodo-nad-level-test',
          name: 'Bloodo™ NAD+ Quantitative DBS Test',
          category: isEs ? 'Monitorización Diagnóstica DBS' : 'DBS Diagnostic Monitoring',
          presentation: isEs ? 'Kit Capilar DBS (CE-IVDR)' : 'CE-IVDR DBS Capillary Kit',
          image: '/images/products/bloodo/nad-test.png',
          url: '/p/bloodo-nad-level-test',
          synergyBadge: isEs ? 'Marcador de Longevidad' : 'Longevity Biomarker',
          synergyBadgeColor: '#0284c7',
          clinicalRationale: isEs
            ? 'Evalúa el estado bioenergético intracelular antes y después de los ciclos de péptidos bioreguladores.'
            : 'Evaluates cellular bioenergetic status before and after bioregulatory peptide cycles.',
          role: isEs ? 'Validación Analítica' : 'Analytical Validation'
        },
        {
          id: 'bac-water-30ml',
          slug: 'bac-water-30ml',
          name: 'Bacteriostatic Water USP (30 mL)',
          category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
          presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
          image: '/images/products/lotusland/bac-water.png',
          url: '/p/bac-water-30ml',
          synergyBadge: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle',
          synergyBadgeColor: '#16a34a',
          clinicalRationale: isEs
            ? 'Solvente bacteriostático indispensable para la reconstitución estéril de péptidos liofilizados.'
            : 'Sterile bacteriostatic diluent required for safe multi-dose peptide reconstitution.',
          role: isEs ? 'Solvente de Reconstitución' : 'Reconstitution Diluent'
        }
      ];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. REGENERATIVE TISSUE REPAIR (BPC-157, TB-500, KPV, GHK-CU)
  // ─────────────────────────────────────────────────────────────────────────
  else if (pSlug.includes('bpc') || pSlug.includes('tb-500') || pSlug.includes('kpv') || pSlug.includes('ghk') || pSlug.includes('ara-290')) {
    const isBpc = pSlug.includes('bpc');
    list = [
      {
        id: isBpc ? 'tb-500' : 'bpc-157',
        slug: isBpc ? 'tb-500' : 'bpc-157',
        name: isBpc ? 'TB-500 (Thymosin Beta-4)' : 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Sinergia Regenerativa Dual' : 'Dual Regenerative Synergy',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: isBpc ? '/images/products/lotusland/tb-500.png' : '/images/products/lotusland/bpc-157.png',
        url: isBpc ? '/p/tb-500' : '/p/bpc-157',
        synergyBadge: isEs ? 'Dúo Regenerativo Canónico' : 'Canonical Regeneration Duo',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Combina angiogénesis temprana (BPC-157) con migración celular y remodelación de actina (TB-500) para acelerar la reparación tisular.'
          : 'Combines rapid VEGF angiogenesis (BPC-157) with stem cell migration and actin remodeling (TB-500) for tissue repair.',
        role: isEs ? 'Potenciador Reparador' : 'Repair Potentiator'
      },
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Agua bacteriostática estéril con 0.9% alcohol bencílico USP indispensable para preservar la estabilidad del péptido.'
          : 'Sterile bacteriostatic diluent with 0.9% benzyl alcohol USP essential for preserving peptide stability and sterility.',
        role: isEs ? 'Vehículo Clínico' : 'Clinical Vehicle'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen',
        category: isEs ? 'Sustrato Estructural de Matriz' : 'Extracellular Matrix Substrate',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Sustrato de Síntesis Tisular' : 'Tissue Synthesis Substrate',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Aporta oligopéptidos de colágeno nativo puro para nutrir la matriz extracelular activada por la señalización peptídica.'
          : 'Supplies freeze-dried native collagen peptides to build extracellular matrix signaled by peptide therapy.',
        role: isEs ? 'Sustrato Tisular' : 'Tissue Substrate'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. METABOLIC & WEIGHT MANAGEMENT (RETATRUTIDE, TIRZEPATIDE, SEMAGLUTIDE)
  // ─────────────────────────────────────────────────────────────────────────
  else if (pSlug.includes('retatrutide') || pSlug.includes('tirzepatide') || pSlug.includes('semaglutide') || pSlug.includes('cagrilintide') || pSlug.includes('aod-9604')) {
    list = [
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Permite reconstituir los viales con concentraciones volumétricas exactas adaptadas a la titulación de dosis médica.'
          : 'Allows precise volumetric reconstitution tailored to physician dosage titration schedules.',
        role: isEs ? 'Solvente de Reconstitución' : 'Reconstitution Diluent'
      },
      {
        id: 'teletest-test-omega',
        slug: 'teletest-test-omega',
        name: 'TeleTest Omega Test (HS Omega-3 & AA/EPA)',
        category: isEs ? 'Diagnóstico Cardiovascular' : 'Cardiovascular Diagnostic',
        presentation: isEs ? 'Analítica Sangre Total' : 'Whole Blood Diagnostic',
        image: '/images/products/teletest/omega-test.svg',
        url: '/p/teletest-test-omega',
        synergyBadge: isEs ? 'Monitorización de Inflamación' : 'Inflammation Monitoring',
        synergyBadgeColor: '#d97706',
        clinicalRationale: isEs
          ? 'Monitoriza el índice Omega-3 y el ratio de inflamación AA/EPA durante protocolos de pérdida de peso con incretinas.'
          : 'Tracks red blood cell Omega-3 index and inflammation ratio during incretin weight loss protocols.',
        role: isEs ? 'Control de Inflamación' : 'Inflammation Monitoring'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen',
        category: isEs ? 'Firmeza Cutánea & Elasticidad' : 'Skin Tightening & Elasticity',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Prevención de Flacidez' : 'Dermal Density Protection',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Aporta tropocolágeno nativo para preservar la densidad de la dermis profunda ante una rápida pérdida de peso.'
          : 'Replenishes native tropocollagen to sustain dermal thickness and skin firmness during rapid weight loss.',
        role: isEs ? 'Firmeza Dérmica' : 'Dermal Firmness'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. COLVITA & ORAL NUTRACEUTICALS
  // ─────────────────────────────────────────────────────────────────────────
  else if (pSlug.includes('colvita') || pName.includes('colvita') || cat.includes('supplement') || type.includes('supplement')) {
    list = [
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Péptido Regenerativo' : 'Regenerative Peptide',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Neo-Colagénesis' : 'Neo-Collagenesis',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Estimula los fibroblastos para sintetizar nueva matriz extracelular aprovechando los aminoácidos de Colvita.'
          : 'Stimulates fibroblasts to synthesize new extracellular matrix using bioavailable collagen substrates.',
        role: isEs ? 'Activador de Síntesis' : 'Synthesis Activator'
      },
      {
        id: 'ghk-cu',
        slug: 'ghk-cu',
        name: 'GHK-Cu (Copper Tripeptide-1)',
        category: isEs ? 'Péptido Antienvejecimiento' : 'Anti-Aging Peptide',
        presentation: isEs ? 'Vial Liofilizado (50 mg / 100 mg)' : 'Lyophilized Vial (50 mg / 100 mg)',
        image: '/images/products/lotusland/ghk-cu.png',
        url: '/p/ghk-cu',
        synergyBadge: isEs ? 'Entrecruzamiento LOX' : 'LOX Cross-Linking',
        synergyBadgeColor: '#0d9488',
        clinicalRationale: isEs
          ? 'Induce la enzima lisil oxidasa (LOX), entrelazando las fibras de tropocolágeno para una piel más densa y firme.'
          : 'Upregulates lysyl oxidase (LOX), cross-linking collagen fibers for greater dermal tensile strength.',
        role: isEs ? 'Catalizador de Fibras' : 'Fiber Cross-Linker'
      },
      {
        id: 'teletest-mineralograma-cabello-htma',
        slug: 'teletest-mineralograma-cabello-htma',
        name: 'TeleTest HTMA Hair Mineral Analysis',
        category: isEs ? 'Diagnóstico Clínico ICP-MS' : 'ICP-MS Clinical Diagnostic',
        presentation: isEs ? 'Kit Capilar (33 Minerales)' : 'Hair Kit (33 Elements)',
        image: '/images/products/teletest/mineralograma.svg',
        url: '/p/teletest-mineralograma-cabello-htma',
        synergyBadge: isEs ? 'Cofactores de Síntesis' : 'Synthesis Cofactors',
        synergyBadgeColor: '#7c3aed',
        clinicalRationale: isEs
          ? 'Evalúa el balance Zinc/Cobre y descarta metales pesados que bloquean la síntesis ordenada de colágeno.'
          : 'Evaluates Zinc/Copper balance and rules out toxic metals that interfere with healthy collagen synthesis.',
        role: isEs ? 'Validación Analítica' : 'Analytical Validation'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. DEFAULT CANONICAL PEPTIDE SYNERGY (FALLBACK)
  // ─────────────────────────────────────────────────────────────────────────
  else {
    list = [
      {
        id: 'bac-water-30ml',
        slug: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP (30 mL)',
        category: isEs ? 'Vehículo Estéril Requerido' : 'Mandatory Sterile Vehicle',
        presentation: isEs ? 'Vial Multidosis Borosilicato Tipo I' : 'Multi-Dose Borosilicate Vial',
        image: '/images/products/lotusland/bac-water.png',
        url: '/p/bac-water-30ml',
        synergyBadge: isEs ? 'Vehículo de Reconstitución' : 'Reconstitution Vehicle',
        synergyBadgeColor: '#003666',
        clinicalRationale: isEs
          ? 'Solvente bacteriostático indispensable para la reconstitución estéril y estabilidad del vial durante 28 días.'
          : 'Sterile bacteriostatic diluent with 0.9% benzyl alcohol USP for multi-dose peptide stability up to 28 days.',
        role: isEs ? 'Solvente de Reconstitución' : 'Reconstitution Diluent'
      },
      {
        id: 'bpc-157',
        slug: 'bpc-157',
        name: 'BPC-157 (Body Protection Compound-157)',
        category: isEs ? 'Péptido Regenerativo' : 'Regenerative Peptide',
        presentation: isEs ? 'Vial Liofilizado (5 mg / 10 mg)' : 'Lyophilized Vial (5 mg / 10 mg)',
        image: '/images/products/lotusland/bpc-157.png',
        url: '/p/bpc-157',
        synergyBadge: isEs ? 'Regeneración Tisular' : 'Tissue Regeneration',
        synergyBadgeColor: '#16a34a',
        clinicalRationale: isEs
          ? 'Péptido de referencia para la estabilización celular y la resolución de la inflamación sistémica.'
          : 'Reference clinical peptide for cellular stabilization and resolution of systemic tissue stress.',
        role: isEs ? 'Reparación Tisular' : 'Tissue Repair'
      },
      {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen',
        category: isEs ? 'Sustrato de Matriz Conectiva' : 'Connective Tissue Matrix',
        presentation: isEs ? 'Cápsulas Orales (60 / 120 cápsulas)' : 'Oral Capsules (60 / 120 capsules)',
        image: '/images/products/colway/colvita.png',
        url: '/p/colway-colvita',
        synergyBadge: isEs ? 'Andamio Conectivo' : 'Connective Bio-Scaffold',
        synergyBadgeColor: '#0284c7',
        clinicalRationale: isEs
          ? 'Suministra tropocolágeno nativo puro como andamio biológico para la regeneración tisular estimulada por péptidos.'
          : 'Supplies native tropocollagen triple-helix building blocks to support tissue regeneration stimulated by peptide therapy.',
        role: isEs ? 'Sustrato Biológico' : 'Biological Substrate'
      }
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UNIVERSAL FILTER: NEVER RECOMMEND THE PRODUCT TO ITSELF
  // ─────────────────────────────────────────────────────────────────────────
  const currentId = String(product?.id || slug || '').toLowerCase();
  const currentSlug = String(slug || product?.slug || '').toLowerCase();

  return list
    .filter(rec => {
      const recId = String(rec.id || '').toLowerCase();
      const recSlug = String(rec.slug || '').toLowerCase();
      if (recId === currentId || recSlug === currentSlug) return false;
      if (recId === currentSlug || recSlug === currentId) return false;
      return true;
    })
    .slice(0, 3);
}
