/**
 * @fileoverview Authoritative Clinical Peptide Posology & Dosage Directory
 * 
 * Provides reference clinical dosing, administration routes, treatment durations,
 * and reconstitution guidelines for medical practitioners and compounding pharmacists.
 */

export const PEPTIDE_POSOLOGY_MAP = {
  'bpc-157': {
    dose: '10 mg / 5 mg',
    standardDose: '250–500 mcg daily',
    route: 'Subcutaneous (SubQ) or Oral',
    duration: '4–6 weeks initial cycle',
    timing: 'Morning fasting or split BID for systemic repair',
    dilution: 'Reconstitute with 2.0 mL BAC water (500 mcg per 0.1 mL / 10 units)'
  },
  'tb-500': {
    dose: '10 mg / 5 mg',
    standardDose: '2.0–2.5 mg twice weekly',
    route: 'Subcutaneous (SubQ)',
    duration: '4–6 weeks loading, then bi-weekly maintenance',
    timing: 'Administer every 3–4 days (e.g. Mon / Thu)',
    dilution: 'Reconstitute with 2.0 mL BAC water (2.5 mg per 0.5 mL / 50 units)'
  },
  'ghk-cu': {
    dose: '50 mg / 100 mg',
    standardDose: '1.0–2.0 mg daily (SubQ) or 1–2% topical',
    route: 'SubQ / Micro-needling / Topical',
    duration: '30–60 days continuous',
    timing: 'Evening application or morning SubQ',
    dilution: 'Reconstitute 50 mg with 5.0 mL BAC water (1 mg per 0.1 mL / 10 units)'
  },
  'epithalon': {
    dose: '10 mg / 50 mg',
    standardDose: '5–10 mg daily',
    route: 'Subcutaneous (SubQ)',
    duration: '10–20 days (bi-annual biogerontology cycle)',
    timing: 'Morning fasting upon waking',
    dilution: 'Reconstitute 10 mg with 2.0 mL BAC water (5 mg per 1.0 mL)'
  },
  'mots-c': {
    dose: '10 mg / 15 mg',
    standardDose: '5 mg 3x weekly or 10 mg weekly',
    route: 'Subcutaneous (SubQ)',
    duration: '4–8 weeks metabolic cycle',
    timing: 'Administer 30–60 min prior to exercise',
    dilution: 'Reconstitute with 1.0–2.0 mL cold BAC water, gently swirl (do not shake)'
  },
  'semax': {
    dose: '10 mg / 30 mg',
    standardDose: '250–500 mcg daily',
    route: 'Intranasal Spray or SubQ',
    duration: '14–28 days cognitive cycle',
    timing: 'Morning upon waking for BDNF / focus',
    dilution: 'Reconstitute with 2.0 mL sterile saline/BAC for spray or SubQ'
  },
  'selank': {
    dose: '10 mg / 30 mg',
    standardDose: '250–500 mcg daily',
    route: 'Intranasal Spray or SubQ',
    duration: '14–21 days anxiolysis cycle',
    timing: 'Morning or mid-day during high-stress periods',
    dilution: 'Reconstitute with 2.0 mL sterile saline/BAC water'
  },
  'aod-9604': {
    dose: '5 mg',
    standardDose: '300–500 mcg daily',
    route: 'Subcutaneous (SubQ)',
    duration: '8–12 weeks visceral fat loss',
    timing: 'Morning in a fasted state, wait 45 min before food',
    dilution: 'Reconstitute 5 mg with 2.5 mL BAC water (200 mcg per 0.1 mL / 10 units)'
  },
  'cjc-1295': {
    dose: '5 mg (with or without DAC)',
    standardDose: '100–200 mcg with Ipamorelin',
    route: 'Subcutaneous (SubQ)',
    duration: '8–12 weeks (5 days on / 2 days off)',
    timing: 'Nightly 30 min before sleep on empty stomach',
    dilution: 'Reconstitute 5 mg with 2.5 mL BAC water (200 mcg per 0.1 mL)'
  },
  'ipamorelin': {
    dose: '5 mg',
    standardDose: '100–300 mcg nightly',
    route: 'Subcutaneous (SubQ)',
    duration: '8–12 weeks (5 days on / 2 days off)',
    timing: 'Immediately before sleep, minimum 2h after last meal',
    dilution: 'Reconstitute 5 mg with 2.5 mL BAC water'
  },
  'tirzepatide': {
    dose: '5 mg / 10 mg / 15 mg',
    standardDose: '2.5 mg weekly (escalating up to 15 mg)',
    route: 'Subcutaneous (SubQ) Once Weekly',
    duration: 'Long-term medical titration (monthly escalation)',
    timing: 'Same day each week, any time of day',
    dilution: 'Single-API compounding in bacteriostatic water or sterile pre-filled pen'
  },
  'semaglutide': {
    dose: '5 mg / 10 mg',
    standardDose: '0.25 mg weekly (escalating to 2.4 mg)',
    route: 'Subcutaneous (SubQ) Once Weekly',
    duration: 'Long-term medical titration',
    timing: 'Same day each week',
    dilution: 'Single-API sterile solution'
  },
  'retatrutide': {
    dose: '5 mg / 10 mg',
    standardDose: '2.0 mg weekly (escalating up to 12 mg)',
    route: 'Subcutaneous (SubQ) Once Weekly',
    duration: 'Clinical escalation schedule',
    timing: 'Weekly subcutaneous administration',
    dilution: 'Triple incretin agonist single-API sterile compounding'
  },
  'kpv': {
    dose: '5 mg / 10 mg',
    standardDose: '200–400 mcg daily',
    route: 'SubQ / Oral (Gut) / Topical',
    duration: '30 days anti-inflammatory cycle',
    timing: 'Morning fasting or with meal for gastrointestinal barrier',
    dilution: 'Reconstitute with 2.0 mL BAC water'
  },
  'dsip': {
    dose: '5 mg',
    standardDose: '100 mcg per dose',
    route: 'Subcutaneous (SubQ)',
    duration: '10–14 days as needed for slow-wave sleep',
    timing: '30–60 minutes before scheduled sleep',
    dilution: 'Reconstitute 5 mg with 2.5 mL BAC water (200 mcg per 0.1 mL)'
  },
  'nad': {
    dose: '500 mg / 1000 mg',
    standardDose: '50–100 mg SubQ 2–3x weekly or IV drip',
    route: 'SubQ / Intramuscular / IV Infusion',
    duration: '8–12 weeks cellular restoration',
    timing: 'Morning upon waking (avoid late evening)',
    dilution: 'Cold sterile saline reconstitution, protect from light'
  },
  'tesofensine': {
    dose: '0.25 mg / 0.5 mg',
    standardDose: '0.25–0.50 mg daily',
    route: 'Oral micronized capsule',
    duration: '12–24 weeks weight management',
    timing: 'Morning with breakfast',
    dilution: 'Oral magistral capsule formulation'
  },
  'foxo4-dri': {
    dose: '10 mg',
    standardDose: '3–5 mg 3x weekly',
    route: 'Subcutaneous (SubQ)',
    duration: '3 consecutive weeks (pulse senolytic clearance)',
    timing: 'Morning administration',
    dilution: 'Cold BAC water, strict low-temperature reconstitution'
  }
};

/**
 * Resolves dosage, clinical posology, and administration route for any product
 */
export function resolveProductClinicalPosology(product, brandSlug = 'peptides', isEs = false) {
  if (!product) {
    return {
      dosageBadge: 'Clinical Grade',
      posologyText: isEs ? 'Posología según prescripción médica' : 'Posology per clinical prescription',
      routeText: 'Clinical Protocol',
      durationText: isEs ? 'Ciclo médico individualizado' : 'Individualized clinical cycle'
    };
  }

  const id = String(product.id || product.slug || product.canonicalId || '').toLowerCase();
  const name = String(product.name || product.title || '').toLowerCase();

  // 1. Direct match in PEPTIDE_POSOLOGY_MAP
  for (const [key, meta] of Object.entries(PEPTIDE_POSOLOGY_MAP)) {
    if (id.includes(key) || name.includes(key)) {
      const explicitDose = product.dosage || product.strength || meta.dose;
      return {
        dosageBadge: explicitDose,
        posologyText: isEs ? `Pauta: ${meta.standardDose}` : `Posology: ${meta.standardDose}`,
        routeText: meta.route,
        durationText: meta.duration,
        timingText: meta.timing,
        dilutionText: meta.dilution
      };
    }
  }

  // 2. Compounding Formulations (TrichoSol / TrichoFoam / NutriGen)
  if (product.isCompounded || id.includes('tricho') || id.includes('nutrigen')) {
    if (id.includes('foam')) {
      return {
        dosageBadge: '100 mL Foam',
        posologyText: isEs ? 'Pauta: 1 pulsación noche en cuero cabelludo' : 'Posology: 1 pump nightly on dry scalp',
        routeText: 'Topical Scalp (Alcohol-free)',
        durationText: isEs ? 'Ciclo continuo de 90 días' : '90-Day Continuous Protocol'
      };
    }
    if (id.includes('oil')) {
      return {
        dosageBadge: '30 mL Scalp Oil',
        posologyText: isEs ? 'Pauta: 1–2 mL antes del lavado (dejar 30 min)' : 'Posology: 1–2 mL pre-wash (leave 30 min)',
        routeText: 'Topical Scalp Pre-Wash',
        durationText: isEs ? '2–3 veces por semana' : '2–3x Weekly Application'
      };
    }
    if (id.includes('solution') || id.includes('sol')) {
      return {
        dosageBadge: '100 mL Solution',
        posologyText: isEs ? 'Pauta: 1 mL noche con suave masaje' : 'Posology: 1 mL nightly with gentle massage',
        routeText: 'Topical Scalp (TrichoSol™)',
        durationText: isEs ? 'Ciclo continuo de 90–120 días' : '90–120 Day Cycle'
      };
    }
    if (id.includes('capsule') || id.includes('nutrigen')) {
      return {
        dosageBadge: '60 / 120 DRcaps®',
        posologyText: isEs ? 'Pauta: 1 cápsula con desayuno y 1 con cena' : 'Posology: 1 capsule BID with meals',
        routeText: 'Oral (DRcaps® Vegan)',
        durationText: isEs ? 'Ciclo de 60 días (evaluación día 45)' : '60-Day Cycle (Day 45 check)'
      };
    }
  }

  // 3. Colway Bioactive Collagen & Hair
  if (id.includes('shampoo') || name.includes('shampoo')) {
    return {
      dosageBadge: '200 mL Bottle',
      posologyText: isEs ? 'Pauta: Masajear cuero cabelludo, dejar actuar 3 min' : 'Posology: Massage scalp, leave 3 min, rinse',
      routeText: 'Topical Hair Care',
      durationText: isEs ? 'Uso regular 3x por semana' : 'Regular 3x Weekly Use'
    };
  }
  if (id.includes('conditioner') || name.includes('conditioner')) {
    return {
      dosageBadge: '200 mL Bottle',
      posologyText: isEs ? 'Pauta: Aplicar de medios a puntas tras champú' : 'Posology: Apply mid-length to ends, leave 2 min',
      routeText: 'Topical Hair Care',
      durationText: isEs ? 'Tras cada lavado' : 'After Each Wash'
    };
  }
  if (id.includes('colvita') || name.includes('colvita')) {
    return {
      dosageBadge: '60 / 120 Caps',
      posologyText: isEs ? 'Pauta: 2 cápsulas al día durante o tras comidas' : 'Posology: 2 capsules daily during/after meals',
      routeText: 'Oral Freeze-Dried Tropocollagen',
      durationText: isEs ? 'Tratamiento mínimo recomendado: 2 meses' : 'Recommended: 60-day renewal cycle'
    };
  }

  // 4. Diagnostic tests
  if (id.includes('bloodo') || id.includes('teletest') || id.includes('eterna') || id.includes('kit')) {
    return {
      dosageBadge: '1 Patient Kit',
      posologyText: isEs ? 'Pauta: Muestra única de saliva / sangre capilar' : 'Posology: Single saliva / capillary blood sample',
      routeText: 'Diagnostic Testing Kit',
      durationText: isEs ? 'Informe en 3–4 semanas (CE-IVD)' : 'Results in 3–4 weeks (CE-IVD)'
    };
  }

  // 5. Generic fallback
  const fallbackDose = product.dosage || product.strength || (product.variants && product.variants[0]?.dosage) || 'Clinical Vial';
  return {
    dosageBadge: fallbackDose,
    posologyText: isEs ? 'Pauta: Según indicación médica' : 'Posology: Per medical practitioner protocol',
    routeText: product.administrationRoute || 'Clinical Specification',
    durationText: isEs ? 'Ciclo médico recomendado' : 'Prescribed clinical cycle'
  };
}

