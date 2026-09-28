 
/**
 * ScientificStandards.js
 * 
 * Centralized registry for scientific data standards across all protocols.
 * Used by audit scripts to ensure unit consistency and terminology accuracy.
 */

export const SCIENTIFIC_STANDARDS = {
  units: {
    PEPTIDES: ['mcg', 'mg', 'IU'],
    SUPPLEMENTS: ['mg', 'g', 'mcg', 'IU', 'capsule', 'tablet'],
  },
  
  dosage_forms: {
    INJECTABLE: 'vial',
    NASAL: 'nasal spray',
    ORAL: 'capsules', // or 'tablets'
    TOPICAL: 'cream',
  },
  
  // Mapping of Product ID to its standard clinical parameters
  registry: {
    // Peptides
    'bpc-157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'bpc157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'tb-500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'ipamorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc-1295-no-dac': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc1295': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tesamorelin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [10] },
    'sermorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tirzepatide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [15, 30, 60] },
    'semaglutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'retatrutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10, 20] },
    'cagrilintide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'aod-9604': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ghk-cu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'ghkcu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'mot-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'motsc': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'mots-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'ss-31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'ss31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'elamipretide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'nad-plus': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 500, stability_weeks: 4, available_vial_sizes: [500, 1000] },
    'foxo4-dri': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'epitalon': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50, 100] },
    'dsip': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'thymalin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'thymosin-alpha-1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ta1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tb-4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'kisspeptin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'gonadorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 10] },
    'selank': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    'semax': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    
    // Oral Peptides (Exceptions)
    'bpc-157-oral': { unit: 'mcg', route: 'oral', form: 'capsules', available_vial_sizes: [0.250] }, // 250mcg per tablet
    
    // Supplements (Common)
    'vitamin-d3': { unit: 'IU', route: 'oral', form: 'capsules' },
    'magnesium-threonate': { unit: 'mg', route: 'oral', form: 'capsules' },
    'berberine': { unit: 'mg', route: 'oral', form: 'capsules' },
    'omega-3': { unit: 'mg', route: 'oral', form: 'capsules' },
    'nac': { unit: 'mg', route: 'oral', form: 'capsules' },
    'coq10': { unit: 'mg', route: 'oral', form: 'capsules' },
  }
};

/**
 * Phase-by-phase vial purchasing strategy and clinical ergonomics registry.
 * Prevents needle overflow (> 100 UI / > 0.5 mL) and prevents purchasing inappropriate vial sizes.
 */
export const PHASE_VIAL_STRATEGIES = {
  tirzepatide: {
    name: 'Tirzepatide',
    indication: 'GLP-1 / GIP Dual Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Phase 1: Initiation (Month 1)',
        targetDose: '2.5 mg / week',
        doseMg: 2.5,
        recommendedVial: '10 mg or 15 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '30 mg or 60 mg Vials (Degradation risk prior to consumption)',
        rationale: 'A 10 mg vial lasts exactly 4 weeks at 2.5 mg. Diluted with 2 mL BAC yields 50 Units/injection.',
        whyAvoid: 'Purchasing 60 mg for a 2.5 mg dose would require using the same vial for 6 months, violating the 28-day sterility limit (USP <797>).'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Phase 2: Escalation Step 1 (Month 2)',
        targetDose: '5 mg / week',
        doseMg: 5.0,
        recommendedVial: '10 mg or 20 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 1.0,
        resultConcentration: '10 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '5 mg Vials (Lasts only 1 week)',
        rationale: 'A 10 mg vial with 1.0 mL BAC yields 50 Units injections (2 weeks per vial), or a 20 mg vial (4 weeks per vial).',
        whyAvoid: '5 mg vials require purchasing 4 separate vials per month and multiple punctures.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Phase 3: Escalation Step 2 (Month 3)',
        targetDose: '7.5 mg / week',
        doseMg: 7.5,
        recommendedVial: '30 mg',
        recommendedVialMg: 30,
        recommendedBacMl: 2.0,
        resultConcentration: '15 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '10 mg Vials (Yields only 1.3 doses, causing medication waste)',
        rationale: 'A 30 mg vial with 2 mL BAC yields exactly 4 weekly doses of 7.5 mg at 50 Units (exactly 1 month of treatment).',
        whyAvoid: 'With 10 mg, 2.5 mg remains unused per vial or requires pooling vials.'
      },
      {
        phaseId: 'escalation_step_3',
        name: 'Phase 4: Escalation Step 3 (Month 4)',
        targetDose: '10 mg / week',
        doseMg: 10.0,
        recommendedVial: '30 mg or 40 mg',
        recommendedVialMg: 30,
        recommendedBacMl: 1.5,
        resultConcentration: '20 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '10 mg Vials (1 vial = single dose, high packaging cost and waste)',
        rationale: 'A 30 mg or 40 mg vial provides continuous monthly supply at 50 Units per injection.',
        whyAvoid: 'A 10 mg vial per week requires ordering 4 kits and handling 4 separate vials monthly.'
      },
      {
        phaseId: 'maintenance',
        name: 'Phase 5: Maximum Maintenance (Month 5+)',
        targetDose: '15 mg / week',
        doseMg: 15.0,
        recommendedVial: '60 mg (1 full month) or 30 mg (2 weeks)',
        recommendedVialMg: 60,
        recommendedBacMl: 2.0,
        resultConcentration: '30 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ DO NOT purchase 10 mg vials (Overflows to 150 Units = 1.5 mL, requiring 2 injections weekly)',
        rationale: 'A 60 mg vial with 2.0 mL BAC provides exactly 4 full weeks at 15 mg/week at 50 Units in a single painless injection.',
        whyAvoid: 'A 10 mg vial does not cover a single dose (0.6 doses), forcing vial pooling and two separate 75 Units injections weekly.'
      }
    ]
  },
  semaglutide: {
    name: 'Semaglutide',
    indication: 'GLP-1 Receptor Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Phase 1: Initiation (Month 1)',
        targetDose: '0.25 mg / week',
        doseMg: 0.25,
        recommendedVial: '2 mg or 3 mg',
        recommendedVialMg: 2,
        recommendedBacMl: 2.0,
        resultConcentration: '1 mg / mL',
        resultUnits: 25,
        volumeMl: 0.25,
        avoidVials: '10 mg Vials (Risk of degradation prior to completing recommended weeks)',
        rationale: 'A 2 mg vial with 2 mL BAC covers the first 4 weeks at 0.25 mg + 2 weeks at 0.5 mg without expiration.',
        whyAvoid: 'A 10 mg vial at 0.25 mg would take 40 weeks to consume, violating the 28-day sterility limit (USP <797>).'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Phase 2: Escalation Step 1 (Month 2)',
        targetDose: '0.50 mg / week',
        doseMg: 0.5,
        recommendedVial: '2 mg or 5 mg',
        recommendedVialMg: 5,
        recommendedBacMl: 2.0,
        resultConcentration: '2.5 mg / mL',
        resultUnits: 20,
        volumeMl: 0.2,
        avoidVials: '10 mg Vials',
        rationale: 'A 5 mg vial with 2 mL BAC yields 10 doses of 0.5 mg (20 Units per injection).',
        whyAvoid: 'Oversized vials lose biological stability.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Phase 3: Escalation Step 2 (Month 3)',
        targetDose: '1.0 mg / week',
        doseMg: 1.0,
        recommendedVial: '5 mg',
        recommendedVialMg: 5,
        recommendedBacMl: 2.0,
        resultConcentration: '2.5 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: '2 mg Vials (Lasts only 2 weeks)',
        rationale: 'A 5 mg vial = 5 doses of 1.0 mg (1 month + 1 week) at exactly 40 Units.',
        whyAvoid: '2 mg vials unnecessarily increase shipping and packaging overhead.'
      },
      {
        phaseId: 'maintenance',
        name: 'Phase 4 & 5: Target Maintenance Dose (1.7 - 2.4 mg)',
        targetDose: '2.4 mg / week',
        doseMg: 2.4,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 48,
        volumeMl: 0.48,
        avoidVials: '❌ DO NOT buy 2 mg or 3 mg vials (Lasts less than 1 single dose)',
        rationale: 'A 10 mg vial with 2.0 mL BAC yields exactly 4 complete doses of 2.4 mg (48 Units = 0.48 mL in 1 painless injection).',
        whyAvoid: 'A 2 mg vial does not even cover a single 2.4 mg injection.'
      }
    ]
  },
  retatrutide: {
    name: 'Retatrutide',
    indication: 'GLP-1 / GIP / GCG Tri-Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Phase 1: Initiation (Weeks 1-4)',
        targetDose: '2.0 mg / week',
        doseMg: 2.0,
        recommendedVial: '5 mg or 10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: '30 mg or 40 mg Vials',
        rationale: 'A 10 mg vial yields 5 doses of 2.0 mg (1 full initiation month) at 40 Units.',
        whyAvoid: 'Oversizing the vial during phase 1 leads to peptide degradation.'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Phase 2: Escalation (Weeks 5-8)',
        targetDose: '4.0 mg / week',
        doseMg: 4.0,
        recommendedVial: '10 mg or 20 mg',
        recommendedVialMg: 20,
        recommendedBacMl: 2.0,
        resultConcentration: '10 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: '5 mg Vials (Lasts only 1 week)',
        rationale: 'A 20 mg vial covers 5 weeks of escalation at 40 Units per injection.',
        whyAvoid: '5 mg vials create disproportionate purchasing overhead.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Phase 3: Metabolic Acceleration (Weeks 9-12)',
        targetDose: '8.0 mg / week',
        doseMg: 8.0,
        recommendedVial: '30 mg or 40 mg',
        recommendedVialMg: 40,
        recommendedBacMl: 2.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: '10 mg Vials (Yields only 1.2 doses)',
        rationale: 'A 40 mg vial yields 5 doses of 8 mg at 40 Units with optimal concentration.',
        whyAvoid: 'With 10 mg, 2 mg is wasted or requires 2 separate vials.'
      },
      {
        phaseId: 'maintenance',
        name: 'Phase 4: Maximum Intensity / Maintenance (Weeks 13+)',
        targetDose: '12.0 mg / week',
        doseMg: 12.0,
        recommendedVial: '60 mg or 40 mg',
        recommendedVialMg: 60,
        recommendedBacMl: 2.5,
        resultConcentration: '24 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ DO NOT use 10 mg or 20 mg vials (Forces injection > 120 Units or multiple vials)',
        rationale: 'A 60 mg vial with 2.5 mL BAC allows 5 doses of 12 mg at 50 Units (1 single injection of 0.5 mL).',
        whyAvoid: 'A 10 mg vial does not contain even a single week’s therapeutic dose.'
      }
    ]
  },
  'mots-c': {
    name: 'MOTS-c',
    indication: 'Mitochondrial Bioenergetics & Lipolysis',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Phase 1: Mitochondrial Activation',
        targetDose: '5 mg (2x to 3x per week)',
        doseMg: 5.0,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: '40 mg Vials if dosing schedule is spaced',
        rationale: 'A 10 mg vial allows exactly 2 applications of 5 mg in the same week.',
        whyAvoid: 'MOTS-c is sensitive to oxidation; 10 mg vials minimize reconstituted storage duration.'
      },
      {
        phaseId: 'escalation_maintenance',
        name: 'Phase 2: Intensification & Loading Protocol',
        targetDose: '10 mg per administration',
        doseMg: 10.0,
        recommendedVial: '20 mg or 25 mg',
        recommendedVialMg: 20,
        recommendedBacMl: 1.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ DO NOT buy 5 mg vials (Forces reconstituting 2 vials for a single injection)',
        rationale: 'A 20 mg vial diluted with 1.0 mL BAC yields 10 mg doses in just 50 Units (0.50 mL).',
        whyAvoid: 'With 5 mg vials, the patient must puncture two separate vials for every injection.'
      }
    ]
  },
  'tb-500': {
    name: 'TB-500 (Thymosin Beta-4)',
    indication: 'Tissue Repair & Angiogenesis',
    phases: [
      {
        phaseId: 'loading',
        name: 'Loading Phase (Weeks 1-4)',
        targetDose: '2.5 mg - 5.0 mg (2x per week = 5-10 mg/wk)',
        doseMg: 2.5,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '2 mg Vials (Does not cover even 1 loading dose of 2.5 mg)',
        rationale: 'A 10 mg vial with 2.0 mL BAC yields exactly 4 injections of 2.5 mg at 50 Units (2 full weeks of loading).',
        whyAvoid: 'A 2 mg vial leaves the patient short by 0.5 mg for each injection.'
      },
      {
        phaseId: 'maintenance',
        name: 'Maintenance Phase (Weeks 5+)',
        targetDose: '2.0 mg (1x per week)',
        doseMg: 2.0,
        recommendedVial: '5 mg or 10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.5,
        resultConcentration: '4 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '2 mg Vials (Higher economic and packaging overhead)',
        rationale: 'A 10 mg vial yields 5 weeks of maintenance at exact 50 Units doses.',
        whyAvoid: 'Buying 1 vial of 2 mg weekly multiplies packaging and shipping costs.'
      }
    ]
  },
  'ghk-cu': {
    name: 'GHK-Cu',
    indication: 'Tissue Remodeling, Collagen & Wound Healing',
    phases: [
      {
        phaseId: 'priming',
        name: 'Phase 1: Dermal Priming / Microdosing',
        targetDose: '2 mg / day (5 days/week)',
        doseMg: 2.0,
        recommendedVial: '50 mg',
        recommendedVialMg: 50,
        recommendedBacMl: 2.5,
        resultConcentration: '20 mg / mL',
        resultUnits: 10,
        volumeMl: 0.1,
        avoidVials: '10 mg Vials (Lasts only 5 days)',
        rationale: 'A 50 mg vial yields 25 doses (5 weeks of Monday-Friday regimen).',
        whyAvoid: '10 mg vials deplete within 1 work week.'
      },
      {
        phaseId: 'remodeling',
        name: 'Phase 2: Active Remodeling & Consolidation',
        targetDose: '5 mg / day (5 days/week = 25 mg/wk)',
        doseMg: 5.0,
        recommendedVial: '100 mg (or 50 mg)',
        recommendedVialMg: 100,
        recommendedBacMl: 5.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 25,
        volumeMl: 0.25,
        avoidVials: '❌ DO NOT buy 10 mg or 20 mg vials (Depleted in 2-4 days)',
        rationale: 'At 25 mg/week, a 100 mg vial covers exactly 1 full month (4 remodeling weeks).',
        whyAvoid: 'Would require purchasing 10 separate 10 mg vials per month.'
      }
    ]
  },
  'elamipretide': {
    name: 'Elamipretide (SS-31)',
    indication: 'Mitochondrial Cardiorenal & Cellular Repair',
    phases: [
      {
        phaseId: 'therapeutic',
        name: 'Daily Therapeutic Phase',
        targetDose: '20 mg to 40 mg daily',
        doseMg: 40.0,
        recommendedVial: '50 mg or 100 mg',
        recommendedVialMg: 100,
        recommendedBacMl: 2.5,
        resultConcentration: '40 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: '❌ STRICTLY AVOID 10 mg vials (One vial does not even cover half a day)',
        rationale: 'For 40 mg daily regimens, 100 mg vials provide 2.5 days per vial at 40 mg/mL concentrations.',
        whyAvoid: 'With 10 mg vials, 4 vials would be required DAILY (120 vials per month).'
      }
    ]
  },
  'nad-plus': {
    name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
    indication: 'Cellular Redox & Sirtuin Activation',
    phases: [
      {
        phaseId: 'subcutaneous_titration',
        name: 'Phase 1: Subcutaneous Titration',
        targetDose: '50 mg - 100 mg (2x to 3x per week)',
        doseMg: 100.0,
        recommendedVial: '500 mg',
        recommendedVialMg: 500,
        recommendedBacMl: 2.5,
        resultConcentration: '200 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '100 mg Vials or low concentrations requiring > 1 mL SubQ',
        rationale: 'NAD+ causes local burning when injected at high volumes. At 200 mg/mL, 100 mg is only 50 Units (0.50 mL).',
        whyAvoid: 'Injecting more than 0.5 mL of NAD+ causes acute localized stinging.'
      },
      {
        phaseId: 'high_dose_protocol',
        name: 'Phase 2: Intensive Optimization Protocol',
        targetDose: '150 mg - 250 mg',
        doseMg: 200.0,
        recommendedVial: '1000 mg',
        recommendedVialMg: 1000,
        recommendedBacMl: 5.0,
        resultConcentration: '200 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: '500 mg Vials for bi-weekly schedules',
        rationale: 'A 1000 mg vial covers 5 doses of 200 mg.',
        whyAvoid: 'Small vials require frequent reconstitutions and increase risk of degradation.'
      }
    ]
  }
};

/**
 * Resolves the clinical phase vial strategy for a given peptide and target dose.
 */
export function getPhaseVialStrategy(peptideOrName, targetDoseMg = null) {
  if (!peptideOrName) return null;
  const p = String(peptideOrName).toLowerCase();
  
  let key = null;
  if (p.includes('tirzepatide')) key = 'tirzepatide';
  else if (p.includes('semaglutide') || p.includes('cagrilintide')) key = 'semaglutide';
  else if (p.includes('retatrutide')) key = 'retatrutide';
  else if (p.includes('mots')) key = 'mots-c';
  else if (p.includes('tb-500') || p.includes('tb500') || p.includes('thymosin beta')) key = 'tb-500';
  else if (p.includes('ghk')) key = 'ghk-cu';
  else if (p.includes('elamipretide') || p.includes('ss-31') || p.includes('ss31')) key = 'elamipretide';
  else if (p.includes('nad')) key = 'nad-plus';

  if (!key || !PHASE_VIAL_STRATEGIES[key]) return null;

  const strategy = PHASE_VIAL_STRATEGIES[key];
  if (targetDoseMg === null || targetDoseMg === undefined) return strategy;

  const d = parseFloat(targetDoseMg) || 0;
  // Find best matching phase in strategy
  const match = strategy.phases.find(ph => Math.abs(ph.doseMg - d) <= 0.05) ||
                strategy.phases.slice().reverse().find(ph => d >= ph.doseMg) ||
                strategy.phases[0];

  return {
    strategy,
    matchedPhase: match
  };
}

/**
 * Normalizes units and terminology based on the registry.
 * @param {string} productId 
 * @param {object} currentData 
 * @returns {object} The corrected/standardized data
 */
export function standardizeData(productId, currentData = {}) {
  const cleanId = productId.toLowerCase().replace('prd_', '');
  const standard = SCIENTIFIC_STANDARDS.registry[cleanId];
  if (!standard) return currentData;
  
  const updated = { ...currentData };
  
  // Apply standard unit if missing or mismatched
  if (standard.unit && updated.dose_unit !== standard.unit) {
    updated.dose_unit = standard.unit;
  }
  
  // Apply standard form based on route
  if (standard.form) {
    updated.dosage_form = standard.form;
  }
  
  if (standard.route) {
    updated.route = standard.route;
  }
  
  // Inject scientific metadata
  updated.stability_weeks = standard.stability_weeks || 4;
  updated.available_vial_sizes = standard.available_vial_sizes || [];
  
  return updated;
}

