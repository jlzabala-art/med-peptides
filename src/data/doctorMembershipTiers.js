/**
 * src/data/doctorMembershipTiers.js
 * Centralized, authoritative capabilities and pricing matrix for physician access
 * across the Atlas Health & Med-Peptides platform.
 */

export const DOCTOR_TIERS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    codeName: 'Clinical Starter',
    priceDisplay: '$0',
    frequency: 'Free Forever',
    badge: 'ACTIVE BY DEFAULT',
    badgeColor: '#137333',
    badgeBg: '#e6f4ea',
    summary: 'Standard clinical access for all verified healthcare practitioners.',
    keyHighlights: [
      'Full Lotusland & Compounding Formulary Access',
      'Individual Product Prescription Issuance',
      'Up to 30 Active Patients Directory',
      'Standard Med-Peptides Posology & Syringe Guide',
      '5 Clinical AI queries per browser session',
      'Standard Email / Ticketing Support (24-48h)'
    ]
  },
  PRO: {
    id: 'advanced',
    name: 'Advanced Pro',
    codeName: 'Medical Practice Suite',
    priceDisplay: 'Custom',
    frequency: 'Monthly Institutional Subscription',
    badge: 'PRACTICE AUTOMATION',
    badgeColor: '#1a73e8',
    badgeBg: '#e8f0fe',
    summary: 'White-label clinical branding, white-glove support, and automated patient adherence workflows.',
    keyHighlights: [
      'Unlimited 1-Tap Protocol Regimens (GHK-Cu, Epithalon, etc.)',
      '100% White-Label Patient Guides stamped with Clinic Logo & Branding',
      'Automated WhatsApp Predictive Refill Alerts (5 days prior to completion)',
      'Unlimited Active Patients + Longitudinal SOAP Clinical Notes',
      'UNLIMITED Atlas AI Clinical Scribe & Genetics / Blood Panel Interpretation',
      '24/7 Direct VIP WhatsApp Line with Compounding Technical Director'
    ]
  }
};

export const DOCTOR_CAPABILITIES_MATRIX = [
  {
    id: 'rx_issuance',
    category: 'PRESCRIPTION & PROTOCOLS',
    feature: 'Clinical Prescription Issuance',
    basic: 'Manual (product by product)',
    pro: 'Unlimited + Pre-Configured 1-Tap Protocols',
    description: 'Save custom multi-vial regimens (e.g. GHK-Cu Hair Protocol, Epithalon Reset) and issue them in one tap.',
    highlight: true
  },
  {
    id: 'clinical_ai',
    category: 'CLINICAL INTELLIGENCE',
    feature: 'Atlas AI Clinical Scribe & Copilot',
    basic: '5 queries / session',
    pro: 'UNLIMITED • Blood panels & genetics interpretation',
    description: 'Synthesizes patient biomarkers, flags contraindications, and calculates reconstitution mL & U-100 syringe units.',
    highlight: true
  },
  {
    id: 'white_label',
    category: 'PRACTICE AUTHORITY',
    feature: 'Patient Admin Guide (Reconstitution & Syringes)',
    basic: 'Standard Atlas Health format',
    pro: '100% White-Label with your clinic logo & branding',
    description: 'Patients receive an interactive portal and printable PDF stamped with your clinic authority and direct contacts.',
    highlight: true
  },
  {
    id: 'refill_alerts',
    category: 'RETENTION & ADHERENCE',
    feature: 'WhatsApp Predictive Refill Alerts',
    basic: 'Manual clinic follow-up',
    pro: 'Automated 5 days before vial completion',
    description: 'Proactive reminders with direct renewal links, boosting longitudinal patient adherence by +40%.',
    highlight: true
  },
  {
    id: 'patient_capacity',
    category: 'PATIENT DIRECTORY',
    feature: 'Active Patients Directory & Records',
    basic: 'Up to 30 active patients',
    pro: 'Unlimited Patients + Longitudinal SOAP Notes',
    description: 'Complete longitudinal therapy tracking, biometric evolution, and structured clinical timeline.',
    highlight: false
  },
  {
    id: 'formulary_access',
    category: 'PHARMACOPEIA ACCESS',
    feature: 'Lotusland Formulary & Compounding Pricing',
    basic: 'Standard verified catalog access',
    pro: 'VIP Access + Bioequivalence & Thermal Stability Matrix',
    description: 'In-depth pharmacokinetics, bioequivalence benchmarks, and compounding stability data.',
    highlight: false
  },
  {
    id: 'telehealth',
    category: 'TELEHEALTH & APPOINTMENTS',
    feature: 'Telemedicine & Video Consultation Rooms',
    basic: 'Manual scheduling',
    pro: 'Integrated appointments & encrypted video consults',
    description: 'Conduct follow-ups for local and international longevity patients within the portal.',
    highlight: false
  },
  {
    id: 'pharmacist_support',
    category: 'CLINICAL SUPPORT',
    feature: 'Pharmacological & Technical Support',
    basic: 'Standard email & ticketing (24-48h response)',
    pro: '24/7 Direct VIP WhatsApp Line',
    description: 'Instant direct communication with the Compounding Technical Director for formulation inquiries.',
    highlight: true
  }
];

export function resolveDoctorTier(doctor = {}) {
  const tier = (doctor?.tier || doctor?.subscriptionTier || doctor?.plan || '').toLowerCase();
  const isPro = tier === 'advanced' || tier === 'pro' || doctor?.isPro === true;
  return {
    tierKey: isPro ? 'advanced' : 'basic',
    isPro,
    tierData: isPro ? DOCTOR_TIERS.PRO : DOCTOR_TIERS.BASIC
  };
}
