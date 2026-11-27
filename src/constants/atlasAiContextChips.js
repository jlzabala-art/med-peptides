/**
 * atlasAiContextChips.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for contextually logical Atlas AI prompt chips across
 * ALL public, pricing, clinical, and portal screens (laptop & mobile).
 *
 * Pure ESM (zero React dependencies) so it can be shared by Footer bars,
 * PublicAtlasAIDrawer, AtlasAIDrawer, AtlasAiCopilotDrawer, and unit tests.
 */

/**
 * Derives a human-readable screen label when a page did not explicitly call
 * useRegisterAtlasContext().
 */
export function resolveFallbackContextTitle(pathname = '/', domTitle = '', isEs = false) {
  const p = String(pathname || '/').toLowerCase();
  if (p.startsWith('/pricing/peptides')) return isEs ? 'Tarifa de Péptidos B2B' : 'Peptides B2B Schedule';
  if (p.startsWith('/pricing/colway')) return isEs ? 'Tarifa Colway® Derma & Capilar' : 'Colway® Derma & Hair Schedule';
  if (p.startsWith('/pricing/24genetics')) return isEs ? 'Tarifa 24Genetics ADN' : '24Genetics DNA Schedule';
  if (p.startsWith('/pricing/fillers')) return isEs ? 'Tarifa Fillers & Skin Boosters' : 'Fillers & Skin Boosters Schedule';
  if (p.startsWith('/pricing/bloodo')) return isEs ? 'Tarifa Bloodo™ Diagnóstico Capilar' : 'Bloodo™ Capillary Diagnostics';
  if (p.startsWith('/pricing/pellets')) return isEs ? 'Tarifa Pellets Hormonales EU GMP' : 'EU GMP Hormone Pellets Schedule';
  if (p.startsWith('/pricing/hormones') || p.startsWith('/pricing/bhrt')) return isEs ? 'Tarifa Hormonas Bioidénticas (BHRT)' : 'Bioidentical Hormones (BHRT) Schedule';
  if (p.startsWith('/pricing/pens') || p.startsWith('/pricing/dnlab-pens')) return isEs ? 'Guía Clínica de Plumas Peptídicas U-100' : 'U-100 Peptide Pens Clinical Guide';
  if (p === '/pricing') return isEs ? 'Hub de Tarifas B2B' : 'B2B Pricing Schedules Hub';
  if (p.startsWith('/calculator')) return isEs ? 'Calculadora de Reconstitución y Dosis' : 'Reconstitution & Dosing Calculator';
  if (p.startsWith('/labels')) return isEs ? 'Estación de Etiquetas Clínicas' : 'Clinical Labels Workstation';
  if (p.startsWith('/rx')) return isEs ? 'Prescripción Electrónica (E-Rx)' : 'Digital Prescription (E-Rx)';
  if (p.startsWith('/proto') || p.startsWith('/protocol-finder')) return isEs ? 'Protocolos Clínicos' : 'Clinical Protocols';
  if (p.startsWith('/vials')) return isEs ? 'Catálogo de Viales Clínicos' : 'Clinical Vials Catalog';
  if (p.startsWith('/p/') || p.startsWith('/raw/')) return domTitle || (isEs ? 'Monografía de Producto' : 'Product Monograph');
  if (p.startsWith('/c/')) return domTitle || (isEs ? 'Catálogo Compartido' : 'Shared Catalog');
  if (p.startsWith('/verify/')) return isEs ? 'Verificación de Lote & CoA' : 'Batch & CoA Verification';
  if (p.startsWith('/quotation/') || p.startsWith('/rfq/')) return isEs ? 'Cotización / Solicitud B2B' : 'B2B Quotation / RFQ';
  if (p.startsWith('/compounding')) return isEs ? 'Formulación Magistral EU GMP' : 'EU GMP Compounding';
  if (p.startsWith('/guides/')) return domTitle || (isEs ? 'Guía Clínica' : 'Clinical Guide');
  if (p.startsWith('/admin')) return isEs ? 'Panel de Administración' : 'Admin Console';
  if (p.startsWith('/doctor') || p.startsWith('/dr')) return isEs ? 'Portal Médico' : 'Physician Portal';
  if (p.startsWith('/clinic')) return isEs ? 'Portal de Clínica' : 'Clinic Portal';
  if (p.startsWith('/patient')) return isEs ? 'Portal de Paciente' : 'Patient Portal';
  if (p.startsWith('/wholesaler')) return isEs ? 'Portal Wholesaler B2B' : 'B2B Wholesaler Portal';
  return domTitle || (isEs ? 'Atlas Health Services' : 'Atlas Health Services');
}

/**
 * Returns 4 contextually logical chips for the current screen + role + market.
 * Each chip has { id, label, prompt }.
 */
export function getContextualAtlasChips({
  pathname = '/',
  screenContext = null,
  market = 'global',
  lang = 'en',
} = {}) {
  const isEs = lang === 'es';
  const p = String(pathname || '/').toLowerCase();
  const title =
    screenContext?.contextAnchor?.sectionTitle ||
    screenContext?.contextAnchor?.name ||
    screenContext?.title ||
    resolveFallbackContextTitle(p, '', isEs);

  // 1. Peptides pricing & vials
  if (p.startsWith('/pricing/peptides') || p.startsWith('/vials')) {
    return isEs
      ? [
          { id: 'pep-recon', label: 'Cálculo U-100', prompt: 'Explícame cómo reconstituir un vial de 10 mg con 2 mL de agua bacteriostática y cuántas unidades U-100 corresponden a 250 mcg y 500 mcg.' },
          { id: 'pep-pack10', label: 'Ahorro Pack ×10', prompt: '¿Cómo funciona el ahorro por volumen en Pack ×10 en la tarifa actual y qué péptidos tienen mayor descuento?' },
          { id: 'pep-synergy', label: 'Sinergia BPC-157 + TB-500', prompt: 'Resume la sinergia clínica de BPC-157 y TB-500 en recuperación tisular y su pauta orientativa.' },
          { id: 'pep-fda', label: 'Estatus 503A / CoA', prompt: '¿Qué documentación de calidad (RP-HPLC ≥99%, CoA) y consideraciones regulatorias 503A acompañan a los lotes?' },
        ]
      : [
          { id: 'pep-recon', label: 'U-100 Dosing Math', prompt: 'Walk through reconstituting a 10 mg vial with 2 mL BAC water and converting 250 mcg and 500 mcg into U-100 syringe units.' },
          { id: 'pep-pack10', label: 'Pack ×10 Savings', prompt: 'How do Pack ×10 volume tiers work on the active peptide schedule and which formulations offer the highest savings?' },
          { id: 'pep-synergy', label: 'BPC-157 + TB-500', prompt: 'Summarize the clinical synergy between BPC-157 and TB-500 for musculoskeletal recovery and typical cycle structure.' },
          { id: 'pep-fda', label: 'CoA & 503A Status', prompt: 'What quality documentation (RP-HPLC ≥99%, batch CoA) and 503A considerations apply to this schedule?' },
        ];
  }

  // 2. Peptide Pens (U-100 click guide)
  if (p.startsWith('/pricing/pens') || p.startsWith('/pricing/dnlab-pens')) {
    return isEs
      ? [
          { id: 'pen-clicks', label: 'Conversión clics U-100', prompt: '¿Cómo se calculan los clics U-100 en las plumas precargadas (100 clics = 1 mL) y cuántas dosis rinde un cartucho de 3 mL?' },
          { id: 'pen-stack', label: 'Protocolo recuperación', prompt: 'Propón un stack clínico de 6 semanas con plumas precargadas para recuperación tisular con clics diarios y número de plumas.' },
          { id: 'pen-cold', label: 'Estabilidad 2–8°C', prompt: '¿Cuáles son las condiciones de cadena de frío (2–8°C) y la estabilidad tras la primera punción (BUD 30 días)?' },
          { id: 'pen-needles', label: 'Agujas y purga', prompt: '¿Qué agujas (31G/32G × 4 mm) son compatibles y cómo realizar la purga inicial sin desperdiciar dosis?' },
        ]
      : [
          { id: 'pen-clicks', label: 'U-100 Click Math', prompt: 'Explain U-100 click conversion on pre-filled pens (100 clicks = 1 mL) and how to compute doses per 3 mL cartridge.' },
          { id: 'pen-stack', label: 'Recovery Stack', prompt: 'Outline a 6-week tissue recovery protocol using pre-filled pens with daily clicks and total cartridges needed.' },
          { id: 'pen-cold', label: '2–8°C Stability', prompt: 'What are the 2–8°C cold-chain requirements and 30-day beyond-use stability once a cartridge is pierced?' },
          { id: 'pen-needles', label: 'Needles & Priming', prompt: 'Which pen needles (31G/32G × 4 mm) are compatible and how should clinicians instruct initial priming?' },
        ];
  }

  // 3. 24Genetics DNA
  if (p.startsWith('/pricing/24genetics')) {
    const marketLabel = market === 'qatar' ? 'Qatar (QAR)' : 'Global';
    return isEs
      ? [
          { id: 'gen-compare', label: 'Comparar paneles ADN', prompt: 'Compara los paneles clave de 24Genetics (Health, Pharmacogenetics, Nutrigenetics, Skin & Hair, Complete Pack) y qué aporta cada uno en consulta.' },
          { id: 'gen-sample', label: 'Toma de muestra y plazo', prompt: '¿Cómo es la recogida de muestra salival y cuál es el plazo estándar de entrega del informe clínico?' },
          { id: 'gen-market', label: `Condiciones ${marketLabel}`, prompt: `Resume las condiciones comerciales y packs disponibles para el mercado ${marketLabel} en 24Genetics.` },
          { id: 'gen-pharma', label: 'Farmacogenética clínica', prompt: '¿Qué utilidad práctica tiene el panel de Farmacogenética para médicos de longevidad y medicina preventiva?' },
        ]
      : [
          { id: 'gen-compare', label: 'Compare DNA Panels', prompt: 'Compare the core 24Genetics panels (Health, Pharmacogenetics, Nutrigenetics, Skin & Hair, Complete Pack) for clinical use.' },
          { id: 'gen-sample', label: 'Sample & Turnaround', prompt: 'How does saliva sample collection work and what is the expected clinical report turnaround time?' },
          { id: 'gen-market', label: `${marketLabel} Terms`, prompt: `Summarize the active commercial terms and pack options for the ${marketLabel} market on 24Genetics.` },
          { id: 'gen-pharma', label: 'Pharmacogenetics', prompt: 'How do longevity and preventive clinicians use the Pharmacogenetics panel to personalize prescriptions?' },
        ];
  }

  // 4. Colway
  if (p.startsWith('/pricing/colway')) {
    return isEs
      ? [
          { id: 'col-tropo', label: 'Tropocolágeno nativo', prompt: '¿Qué diferencia al tropocolágeno nativo de triple hélice de Colway® frente al colágeno hidrolizado convencional?' },
          { id: 'col-hair', label: 'Línea capilar y derma', prompt: 'Recomienda un protocolo combinado de cabina y domicilio con la línea derma y tricología de Colway®.' },
          { id: 'col-reg', label: 'CPNP / ISO 22716', prompt: '¿Qué certificaciones regulatorias (UE ISO 22716, registro CPNP) respaldan la línea Colway®?' },
          { id: 'col-quote', label: 'Cotización B2B', prompt: '¿Cómo solicito una proforma oficial o pedido mayorista de esta tarifa Colway®?' },
        ]
      : [
          { id: 'col-tropo', label: 'Native Tropocollagen', prompt: 'How does Colway® triple-helix native tropocollagen differ from standard hydrolyzed collagen?' },
          { id: 'col-hair', label: 'Derma & Hair Protocol', prompt: 'Recommend a combined in-clinic and home-care protocol using Colway® dermal and trichology formulations.' },
          { id: 'col-reg', label: 'EU ISO 22716 / CPNP', prompt: 'What regulatory standards (EU ISO 22716, CPNP) back the Colway® clinical range?' },
          { id: 'col-quote', label: 'B2B Proforma Quote', prompt: 'How do I request an official B2B proforma or wholesale order from this Colway® schedule?' },
        ];
  }

  // 5. Fillers & Boosters
  if (p.startsWith('/pricing/fillers')) {
    return isEs
      ? [
          { id: 'fil-diff', label: 'Fillers vs Boosters', prompt: 'Diferencia clínica entre fillers de ácido hialurónico reticulado, skin boosters y bioestimuladores (PLLA/CaHA).' },
          { id: 'fil-pn', label: 'Polinucleótidos', prompt: '¿En qué indicaciones faciales y perioculares destacan los polinucleótidos frente a un skin booster clásico?' },
          { id: 'fil-ce', label: 'Marcado CE y lotes', prompt: '¿Cómo se garantiza la trazabilidad de lote y el marcado CE en los inyectables estéticos del portafolio?' },
          { id: 'fil-order', label: 'Pedido clínica', prompt: '¿Cuáles son los plazos de entrega (24–48h) y cómo preparar una solicitud de presupuesto para clínica?' },
        ]
      : [
          { id: 'fil-diff', label: 'Fillers vs Boosters', prompt: 'Outline the clinical distinction between cross-linked HA fillers, skin boosters, and biostimulators (PLLA/CaHA).' },
          { id: 'fil-pn', label: 'Polynucleotides', prompt: 'When should clinicians choose polynucleotides over classic HA skin boosters for periorbital or dermal remodeling?' },
          { id: 'fil-ce', label: 'CE Mark & Lot Trace', prompt: 'How are CE certification and batch traceability documented across this aesthetic injectables schedule?' },
          { id: 'fil-order', label: 'Clinic Ordering', prompt: 'What are the 24–48h dispatch terms and how do I submit a clinic quote request from this schedule?' },
        ];
  }

  // 6. Bloodo Diagnostics
  if (p.startsWith('/pricing/bloodo')) {
    return isEs
      ? [
          { id: 'bld-dbs', label: 'Cómo funciona DBS', prompt: 'Explica la tecnología de gota de sangre seca (DBS) de Bloodo™ y su validación LC-MS/MS en laboratorio ISO 15189.' },
          { id: 'bld-nad', label: 'Panel NAD+ y Cortisol', prompt: '¿Qué aporta medir NAD+ intracelular y curva diurna de Cortisol (CAR) en pacientes de longevidad?' },
          { id: 'bld-tat', label: 'Plazo 48–72h', prompt: '¿Cuál es el flujo logístico desde la toma capilar hasta la recepción del informe en 48–72 horas?' },
          { id: 'bld-tier', label: 'Tarifa B2B', prompt: 'Resume los paneles disponibles en Bloodo™ y cómo añadirlos a una cotización B2B.' },
        ]
      : [
          { id: 'bld-dbs', label: 'How DBS Works', prompt: 'Explain Bloodo™ Dried Blood Spot (DBS) sampling and ISO 15189 LC-MS/MS laboratory validation.' },
          { id: 'bld-nad', label: 'NAD+ & Cortisol CAR', prompt: 'What clinical value do intracellular NAD+ and diurnal Cortisol (CAR) panels add in longevity medicine?' },
          { id: 'bld-tat', label: '48–72h Turnaround', prompt: 'Walk through the kit workflow from capillary collection to receiving lab results in 48–72 hours.' },
          { id: 'bld-tier', label: 'B2B Pricing', prompt: 'Summarize the Bloodo™ panels on this schedule and how to build a B2B clinic quote.' },
        ];
  }

  // 7. Pellets & BHRT / Hormones
  if (p.startsWith('/pricing/pellets') || p.startsWith('/pricing/hormones') || p.startsWith('/pricing/bhrt')) {
    return isEs
      ? [
          { id: 'pel-kin', label: 'Cinética 3.5–6 meses', prompt: 'Explica la liberación de orden cero de los pellets subcutáneos EU GMP y por qué evitan el primer paso hepático.' },
          { id: 'pel-trocar', label: 'Trócar 3.2 vs 4.5 mm', prompt: '¿Qué diámetro de trócar estéril (3.2 mm vs 4.5 mm) corresponde a pellets femeninos y masculinos?' },
          { id: 'pel-bhrt', label: 'BHRT Cremas vs Pellets', prompt: 'Compara ventajas clínicas entre formulaciones magistrales tópicas/cápsulas BHRT y pellets subcutáneos.' },
          { id: 'pel-bulk', label: 'Pack ×10 / Bulk MOQ', prompt: '¿Cómo funcionan los descuentos por Pack ×10 o lotes bulk en esta tarifa hormonal?' },
        ]
      : [
          { id: 'pel-kin', label: 'Zero-Order Kinetics', prompt: 'Explain zero-order release kinetics (3.5–6 months) of EU GMP subcutaneous pellets and hepatic first-pass bypass.' },
          { id: 'pel-trocar', label: '3.2 vs 4.5 mm Trocar', prompt: 'Which sterile single-use trocar size (3.2 mm vs 4.5 mm) is indicated for female vs male pellet implantation?' },
          { id: 'pel-bhrt', label: 'Topical vs Pellets', prompt: 'Compare clinical indications for compounded topical/oral BHRT versus subcutaneous hormone pellets.' },
          { id: 'pel-bulk', label: 'Pack ×10 / Bulk MOQ', prompt: 'How do Pack ×10 and bulk compounding batch tiers work on this hormone schedule?' },
        ];
  }

  // 8. Calculator
  if (p.startsWith('/calculator')) {
    return isEs
      ? [
          { id: 'calc-u100', label: 'Regla jeringa U-100', prompt: 'Explícame la fórmula rápida para pasar de mg/mL a unidades (marcas) en una jeringa de insulina U-100.' },
          { id: 'calc-vol', label: '¿1 mL, 2 mL o 3 mL?', prompt: '¿Cómo elegir el volumen óptimo de agua bacteriostática (1, 2 o 3 mL) para evitar dosis demasiado pequeñas o imprecisas?' },
          { id: 'calc-pen', label: 'Clics en Pluma', prompt: '¿Cómo se traduce una dosis objetivo en mcg/mg a número de clics en un cartucho de 3 mL?' },
          { id: 'calc-bud', label: 'Conservación tras mezcla', prompt: '¿Cuántos días es estable un péptido reconstituido en nevera (2–8°C) y qué precauciones se deben seguir?' },
        ]
      : [
          { id: 'calc-u100', label: 'U-100 Syringe Formula', prompt: 'Give me the exact formula to convert mg/mL concentration into U-100 insulin syringe tick marks.' },
          { id: 'calc-vol', label: 'Choosing BAC Volume', prompt: 'How should I choose between 1 mL, 2 mL, or 3 mL BAC water to keep injection volumes accurate and comfortable?' },
          { id: 'calc-pen', label: 'Pen Click Math', prompt: 'How do I convert a target mcg/mg dose into exact click counts on a 3 mL U-100 cartridge?' },
          { id: 'calc-bud', label: 'Post-Mix Stability', prompt: 'How long do reconstituted peptides remain stable at 2–8°C and what handling practices prevent degradation?' },
        ];
  }

  // 9. Prescriptions & Labels
  if (p.startsWith('/rx') || p.startsWith('/labels')) {
    return isEs
      ? [
          { id: 'rx-check', label: 'Revisar posología', prompt: 'Ayúdame a revisar la coherencia de dosis, frecuencia y duración de la prescripción activa.' },
          { id: 'rx-patient', label: 'Instrucciones paciente', prompt: 'Redacta instrucciones claras y sencillas para el paciente sobre administración y conservación en frío (2–8°C).' },
          { id: 'rx-label', label: 'Campos de etiqueta', prompt: '¿Qué datos obligatorios deben figurar en la etiqueta clínica dispensada (lote, BUD, concentración, vía)?' },
          { id: 'rx-refill', label: 'Cálculo de reposición', prompt: 'Calcula para cuántos días alcanza el vial/cartucho dispensado según la pauta prescrita.' },
        ]
      : [
          { id: 'rx-check', label: 'Verify Dosing', prompt: 'Help review dosing consistency, administration frequency, and cycle duration for the active prescription.' },
          { id: 'rx-patient', label: 'Patient Instructions', prompt: 'Draft clear, patient-friendly administration and 2–8°C cold-storage instructions for this prescription.' },
          { id: 'rx-label', label: 'Label Requirements', prompt: 'Which mandatory clinical fields should appear on the dispensed label (lot, BUD, concentration, route)?' },
          { id: 'rx-refill', label: 'Days Supply Math', prompt: 'Calculate total days of supply for the dispensed vial or cartridge based on the prescribed schedule.' },
        ];
  }

  // 10. Protocols
  if (p.startsWith('/proto') || p.startsWith('/protocol-finder')) {
    return isEs
      ? [
          { id: 'pr-design', label: 'Diseñar protocolo', prompt: 'Recomienda un protocolo clínico estructurado por fases (inicio, mantenimiento y descanso) según objetivo terapéutico.' },
          { id: 'pr-labs', label: 'Analíticas de control', prompt: '¿Qué biomarcadores basales y de seguimiento (IGF-1, HbA1c, hs-CRP, perfil hormonal) recomiendas monitorizar?' },
          { id: 'pr-stack', label: 'Compatibilidad y timing', prompt: '¿Qué compuestos se pueden combinar en el mismo ciclo y qué horarios AM/PM optimizan su tolerabilidad?' },
          { id: 'pr-safety', label: 'Contraindicaciones', prompt: 'Resume las principales precauciones clínicas y contraindicaciones antes de iniciar este protocolo.' },
        ]
      : [
          { id: 'pr-design', label: 'Structure a Protocol', prompt: 'Outline a phased clinical protocol (initiation, maintenance, washout) tailored to this therapeutic goal.' },
          { id: 'pr-labs', label: 'Monitoring Labs', prompt: 'Which baseline and follow-up biomarkers (IGF-1, HbA1c, hs-CRP, hormone panel) should be tracked?' },
          { id: 'pr-stack', label: 'Stacking & Timing', prompt: 'Which compounds pair synergistically in the same cycle and what AM/PM timing optimizes tolerability?' },
          { id: 'pr-safety', label: 'Contraindications', prompt: 'Summarize key clinical precautions and contraindications to screen for before starting this protocol.' },
        ];
  }

  // 11. Authenticated Portals (Admin / Doctor / Patient / Wholesaler)
  if (p.startsWith('/admin')) {
    return isEs
      ? [
          { id: 'adm-pricing', label: 'Reglas Role + Market', prompt: 'Resume cómo se calculan las tarifas por rol (Distributor +15%, Wholeseller 15%+15%) y overrides por mercado.' },
          { id: 'adm-rx', label: 'Flujo E-Rx y Etiquetas', prompt: 'Resume el flujo operativo desde la importación de prescripción hasta la impresión de etiquetas y seguimiento.' },
          { id: 'adm-audit', label: 'Revisión de catálogo', prompt: '¿Qué campos críticos conviene validar en un producto antes de publicarlo en las tarifas B2B?' },
          { id: 'adm-quote', label: 'Proforma / Cotización', prompt: '¿Cómo preparar y compartir una cotización con precios adaptados al mercado del cliente?' },
        ]
      : [
          { id: 'adm-pricing', label: 'Role + Market Pricing', prompt: 'Summarize how role tiers (Distributor +15%, Wholeseller 15%+15%) and regional market overrides resolve.' },
          { id: 'adm-rx', label: 'E-Rx & Labels Flow', prompt: 'Summarize the operational workflow from prescription import to clinical label printing and dispatch.' },
          { id: 'adm-audit', label: 'Catalog Readiness', prompt: 'Which critical product fields should be verified before publishing to B2B price schedules?' },
          { id: 'adm-quote', label: 'B2B Proforma', prompt: 'How do I generate and share a market-specific quotation for a partner or clinic?' },
        ];
  }

  // 12. Product Monograph / Raw / Catalog / General fallback
  return isEs
    ? [
        { id: 'gen-summary', label: 'Resumen clínico', prompt: `Haz un resumen clínico conciso de "${title}": mecanismo de acción, indicaciones principales y puntos clave.` },
        { id: 'gen-dosing', label: 'Dosificación y uso', prompt: `¿Cuál es la pauta orientativa de dosificación, vía de administración y conservación para "${title}"?` },
        { id: 'gen-quality', label: 'Calidad y CoA', prompt: `¿Qué estándares de calidad, pureza y trazabilidad de lote aplican a "${title}"?` },
        { id: 'gen-next', label: 'Siguiente paso', prompt: `¿Qué opciones de cotización o consulta técnica están disponibles para "${title}"?` },
      ]
    : [
        { id: 'gen-summary', label: 'Clinical Summary', prompt: `Provide a concise clinical overview of "${title}": mechanism of action, primary indications, and key takeaways.` },
        { id: 'gen-dosing', label: 'Dosing & Storage', prompt: `What are the typical dosing considerations, route of administration, and storage conditions for "${title}"?` },
        { id: 'gen-quality', label: 'Quality & CoA', prompt: `What quality standards, purity verification, and batch traceability apply to "${title}"?` },
        { id: 'gen-next', label: 'Ordering & Support', prompt: `What B2B ordering, documentation, or clinical support options are available for "${title}"?` },
      ];
}
