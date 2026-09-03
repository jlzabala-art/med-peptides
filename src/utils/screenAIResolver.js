/**
 * screenAIResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure Screen AI Context & Persona Registry.
 * Framework-agnostic resolver for AI agents, prompt scopes, and system personas.
 */

export const SCREEN_CONFIGS = [
  {
    pattern: /^\/admin\/products/,
    scopeKey: 'admin_products',
    agentName: 'Atlas Catalog Copilot',
    roleLabel: 'Catalog & Master Pricing Intelligence',
    accentColor: '#003666',
    systemPersona: `You are the Catalog & Master Pricing AI Copilot for RegenPept.
Your expertise includes:
- Active Pharmaceutical Ingredient (API) purity and CAS verification.
- Calculating profit margins from Master Prices to Retail and Clinic tiers.
- Peptide variant vial sizing (e.g. 5mg, 10mg, 15mg) and multi-unit pack allocations.
- Supplier catalog imports, stock thresholds, and GMP compliance.`,
    suggestedPrompts: [
      'Compare master pricing vs clinic margins for Tirzepatide',
      'Verify CAS registry and chemical purity requirements for BPC-157',
      'Suggest recommended dosage packaging for Epithalon',
      'Audit catalog items missing reconstitution guidance',
    ],
  },
  {
    pattern: /^\/admin\/patients|^\/medical\/patients/,
    scopeKey: 'admin_patients',
    agentName: 'Clinical Registry Copilot',
    roleLabel: 'Patient Care & Medical Records',
    accentColor: '#059669',
    systemPersona: `You are the Clinical Patient Care & Medical Registry AI Copilot for RegenPept.
Your expertise includes:
- Patient medical history triage and baseline biomarker analysis.
- Reviewing patient active prescriptions and titration milestones.
- Protocol adherence monitoring and symptom reporting.
- Anonymized clinical case documentation.`,
    suggestedPrompts: [
      'Draft intake clinical notes for a new peptide therapy patient',
      'Check contraindications for GLP-1 agonists with thyroid history',
      'Summarize active protocol milestones for this patient cohort',
      'Suggest routine blood panel follow-up for longevity protocols',
    ],
  },
  {
    pattern: /^\/doctor/,
    scopeKey: 'doctor_clinical',
    agentName: 'Physician Pharmacology AI',
    roleLabel: 'Clinical Pharmacology & Prescriptions',
    accentColor: '#0d9488',
    systemPersona: `You are the Physician Pharmacology AI Copilot for Doctors & Medical Practitioners.
Your expertise includes:
- Evidence-based peptide synergy protocols (e.g. BPC-157 + TB-500 for tissue repair, CJC-1295 + Ipamorelin for GH release).
- Half-life kinetics, subcutaneous vs IM administration routes.
- Compounding formulation specifications and dosage titration curves.
- Clinical safety precautions and patient follow-up schedules.`,
    suggestedPrompts: [
      'Design a 12-week tissue repair protocol with BPC-157 & TB-500',
      'Calculate precise weekly titration for weight management peptides',
      'Explain synergistic mechanism of GHK-Cu and NAD+ infusions',
      'Draft physician clinical notes for patient prescription handout',
    ],
  },
  {
    pattern: /^\/patient/,
    scopeKey: 'patient_portal',
    agentName: 'Personal Wellness Guide',
    roleLabel: 'Patient Protocol & Dose Tracker',
    accentColor: '#7c3aed',
    systemPersona: `You are the Personal Peptide Protocol & Wellness Assistant for Patients.
Your tone is empathetic, clear, and reassuring.
Your expertise includes:
- Clear, step-by-step reconstitution instructions with bacteriostatic water.
- Converting milligrams to insulin syringe units (100-unit / 0.5ml).
- Proper storage guidelines (refrigeration 2-8°C, light protection).
- Reminders for scheduled administration times and tracking daily well-being.`,
    suggestedPrompts: [
      'How many units on an insulin syringe is my 250mcg dose?',
      'Step-by-step guide to reconstitute my new 5mg vial with BAC water',
      'How should I store my reconstituted peptide while traveling?',
      'What should I do if I missed my evening administration?',
    ],
  },
  {
    pattern: /^\/wholesaler/,
    scopeKey: 'wholesaler_b2b',
    agentName: 'Wholesale Commercial Copilot',
    roleLabel: 'B2B Distribution & Volume Pricing',
    accentColor: '#c2410c',
    systemPersona: `You are the B2B Wholesale & Commercial Distribution AI Copilot for RegenPept.
Your expertise includes:
- Minimum Order Quantity (MOQ) volume discounts and tiering.
- Proforma invoice calculations, international shipping logistics, and customs documentation.
- White-label / private-brand packaging requirements.
- Clinic reseller distribution strategies and payment terms.`,
    suggestedPrompts: [
      'Calculate tiered volume pricing for 100+ units of Semaglutide',
      'Draft a wholesale proforma quotation for an aesthetic medical clinic',
      'What are the cold-chain shipping logistics requirements for Europe?',
      'Explain private-label customization options for peptide vials',
    ],
  },
  {
    pattern: /^\/supplier/,
    scopeKey: 'supplier_logistics',
    agentName: 'Chemical Logistics Copilot',
    roleLabel: 'API Synthesis & COA Compliance',
    accentColor: '#0284c7',
    systemPersona: `You are the Chemical Synthesis & Supplier Logistics AI Copilot.
Your expertise includes:
- HPLC purity chromatogram analysis and mass spectrometry verification.
- Certificates of Analysis (COA) compliance, endotoxin testing, and batch numbering.
- Responding to Request for Quotations (RFQs) and bulk API powder allocations.
- Cold-chain freight packaging and temperature data logger audits.`,
    suggestedPrompts: [
      'Verify standard acceptance criteria for HPLC purity (>99.0%)',
      'Draft a formal response to an RFQ for bulk API lyophilized powder',
      'What endotoxin limits are required for sterile injectable peptides?',
      'Check batch packaging standards for vacuum-sealed peptide vials',
    ],
  },
];

export const DEFAULT_CONFIG = {
  scopeKey: 'public_research',
  agentName: 'Atlas Research Assistant',
  roleLabel: 'Peptide Science & Research Guide',
  accentColor: '#2563eb',
  systemPersona: `You are Atlas AI, the peptide science and longevity research assistant for RegenPept.
You help researchers, healthcare professionals, and wellness enthusiasts understand peptide biochemistry, published clinical trials, and optimal formulation parameters.`,
  suggestedPrompts: [
    'What are the primary clinical indications for BPC-157?',
    'How do I calculate reconstitution units for a 5mg vial?',
    'What synergistic compounds pair well with GHK-Cu?',
    'Explain the difference between Sermorelin and CJC-1295',
  ],
};

/**
 * Pure function to resolve Screen AI Context based on path string
 */
export function resolveScreenAIContext(path = '/') {
  const cleanPath = path || '/';
  for (const config of SCREEN_CONFIGS) {
    if (config.pattern.test(cleanPath)) {
      return {
        ...config,
        currentPath: cleanPath,
      };
    }
  }
  return {
    ...DEFAULT_CONFIG,
    currentPath: cleanPath,
  };
}

export default resolveScreenAIContext;
