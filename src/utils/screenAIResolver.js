/**
 * screenAIResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure Screen AI Context & Persona Registry.
 * Multi-dimensional AI resolution engine: (Role × User × Screen × Entity).
 * Guarantees that every user experiences an AI assistant that feels uniquely
 * dedicated to them on every single screen.
 */

export const ROLE_THEMES = {
  doctor: {
    accentColor: '#0d9488',
    roleBadge: 'Physician Clinical AI',
    defaultTitle: 'Clinical Practice Copilot',
  },
  patient: {
    accentColor: '#7c3aed',
    roleBadge: 'Personal Health Concierge',
    defaultTitle: 'Personal Health Companion',
  },
  wholesaler: {
    accentColor: '#c2410c',
    roleBadge: 'B2B Procurement AI',
    defaultTitle: 'Commercial Copilot',
  },
  supplier: {
    accentColor: '#0284c7',
    roleBadge: 'API Quality & COA AI',
    defaultTitle: 'Chemical Logistics Copilot',
  },
  admin: {
    accentColor: '#003666',
    roleBadge: 'Platform Kernel Copilot',
    defaultTitle: 'Executive Operations AI',
  },
  guest: {
    accentColor: '#2563eb',
    roleBadge: 'Peptide Science AI',
    defaultTitle: 'Research Assistant',
  }
};

export const SCREEN_CONFIGS = [
  // ── DOCTOR SCREENS ──────────────────────────────────────────────────────────
  {
    pattern: /^\/doctor\/prescriptions/,
    screenScope: 'doctor_prescriptions',
    screenTitle: 'Prescription Formulator',
    roleLabel: 'Clinical Pharmacology & Formulation',
    accentColor: '#0d9488',
    suggestedPrompts: [
      'Calculate compounding dilution for BPC-157 5mg in 2mL BAC water',
      'Check synergistic protocol between BPC-157 and TB-500',
      'Review subcutaneous injection schedule for weight management GLP-1s',
      'Draft physician clinical notes for patient prescription handout',
    ],
  },
  {
    pattern: /^\/doctor\/patients/,
    screenScope: 'doctor_patients',
    screenTitle: 'Patient Cohort Specialist',
    roleLabel: 'Patient Records & Biomarker Triage',
    accentColor: '#0d9488',
    suggestedPrompts: [
      'Draft intake clinical notes for a new peptide therapy patient',
      'Check contraindications for GLP-1 agonists with thyroid history',
      'Review titration timeline for active metabolic cohort patients',
      'Suggest routine blood biomarker follow-up for longevity protocols',
    ],
  },
  {
    pattern: /^\/doctor\/protocols/,
    screenScope: 'doctor_protocols',
    screenTitle: 'Regimen & Synergy Architect',
    roleLabel: 'Regimen Architecture & Stacking',
    accentColor: '#0d9488',
    suggestedPrompts: [
      'Design a 12-week tissue repair regimen with BPC-157 & TB-500',
      'Compare half-life kinetics between Sermorelin and CJC-1295',
      'Stacking protocol: GHK-Cu topical vs subcutaneous for dermal rejuvenation',
      'Audit protocol rest periods and receptor sensitivity cycles',
    ],
  },
  {
    pattern: /^\/doctor/,
    screenScope: 'doctor_overview',
    screenTitle: 'Practice Cockpit Copilot',
    roleLabel: 'Clinical Practice Operations',
    accentColor: '#0d9488',
    suggestedPrompts: [
      'Summarize pending prescription approvals and refill requests',
      'Audit clinical alerts and patient adherence drop-offs',
      'Review recent DHA regulatory dispensing compliance',
      'Draft quick magistral order for active clinic workspace',
    ],
  },

  // ── PATIENT SCREENS ─────────────────────────────────────────────────────────
  {
    pattern: /^\/patient\/prescriptions/,
    screenScope: 'patient_prescriptions',
    screenTitle: 'Treatment & Protocol Guide',
    roleLabel: 'Active Protocol & Dosing Guidance',
    accentColor: '#7c3aed',
    suggestedPrompts: [
      'How many insulin syringe units is my 250mcg prescribed dose?',
      'Step-by-step guide to reconstitute my new 5mg vial with BAC water',
      'Should I take this dose in the morning or before bedtime?',
      'What should I do if I missed yesterday’s administration?',
    ],
  },
  {
    pattern: /^\/patient\/adherence/,
    screenScope: 'patient_adherence',
    screenTitle: 'Daily Routine & Adherence Coach',
    roleLabel: 'Wellness Habits & Adherence Tracking',
    accentColor: '#7c3aed',
    suggestedPrompts: [
      'How do I rotate subcutaneous injection sites safely?',
      'How should I store my reconstituted peptide while traveling?',
      'Log my mild side effects for my doctor to review',
      'Tips for staying consistent with my 12-week protocol',
    ],
  },
  {
    pattern: /^\/patient/,
    screenScope: 'patient_home',
    screenTitle: 'Personal Wellness Companion',
    roleLabel: 'Personal Health & Protocol Concierge',
    accentColor: '#7c3aed',
    suggestedPrompts: [
      'Explain how my prescribed peptide works in my body',
      'What foods or supplements support my recovery protocol?',
      'When should I schedule my next clinic check-in?',
      'How do I request a refill from my doctor?',
    ],
  },

  // ── ADMIN SCREENS ───────────────────────────────────────────────────────────
  {
    pattern: /^\/admin\/products/,
    screenScope: 'admin_products',
    screenTitle: 'Master Formulary & Margin Auditor',
    roleLabel: 'Catalog Pricing & Variant Architecture',
    accentColor: '#003666',
    suggestedPrompts: [
      'Compare master pricing vs clinic margins for Tirzepatide',
      'Verify CAS registry and chemical purity standards for BPC-157',
      'Suggest packaging vial sizes for Epithalon bulk batch',
      'Audit items missing reconstitution or cold-chain instructions',
    ],
  },
  {
    pattern: /^\/admin\/patients|^\/medical\/patients/,
    screenScope: 'admin_patients',
    screenTitle: 'Clinical Registry & Segregation Monitor',
    roleLabel: 'Clinical Governance & Segregation',
    accentColor: '#059669',
    suggestedPrompts: [
      'Verify patient data segregation between clinic tenants',
      'Audit unverified patient intake workflows',
      'Check cohort prescription fulfillment velocity',
      'Export clinical log audit trail for compliance',
    ],
  },
  {
    pattern: /^\/admin\/clinics/,
    screenScope: 'admin_clinics',
    screenTitle: 'Clinic Partner & Tenant Auditor',
    roleLabel: 'Multi-Tenant Practice Governance',
    accentColor: '#003666',
    suggestedPrompts: [
      'Review Bedaya Polyclinic active prescriber credentials',
      'Audit margin distribution across clinic partners',
      'Verify DHA license validity for registered clinics',
      'Check partner volume tier thresholds',
    ],
  },
  {
    pattern: /^\/admin/,
    screenScope: 'admin_operations',
    screenTitle: 'Executive Operations Copilot',
    roleLabel: 'Platform Governance & Master Analytics',
    accentColor: '#003666',
    suggestedPrompts: [
      'Summarize platform-wide active prescriptions and POs',
      'Audit cold-chain logistics delivery adherence',
      'Check system latency and Firestore indexing health',
      'Review gross margin performance by peptide category',
    ],
  },

  // ── WHOLESALER / B2B SCREENS ────────────────────────────────────────────────
  {
    pattern: /^\/wholesaler\/pricing|^\/wholesaler\/orders/,
    screenScope: 'wholesaler_pricing',
    screenTitle: 'Volume Tier & Procurement Auditor',
    roleLabel: 'B2B Wholesale & Margin Tiering',
    accentColor: '#c2410c',
    suggestedPrompts: [
      'Calculate tiered volume pricing for 100+ units of Semaglutide',
      'Draft a wholesale proforma quotation for clinic order',
      'What are the cold-chain shipping logistics requirements for GCC?',
      'Explain private-label packaging MOQs and lead times',
    ],
  },
  {
    pattern: /^\/wholesaler/,
    screenScope: 'wholesaler_portal',
    screenTitle: 'Commercial Distribution Copilot',
    roleLabel: 'B2B Distribution & Accounts',
    accentColor: '#c2410c',
    suggestedPrompts: [
      'Review pending wholesale quotations and delivery dates',
      'Check stock availability for high-demand peptides',
      'Generate batch COA package for client shipment',
      'Request custom formulation RFQ from compounding facility',
    ],
  },

  // ── SUPPLIER SCREENS ────────────────────────────────────────────────────────
  {
    pattern: /^\/supplier/,
    screenScope: 'supplier_logistics',
    screenTitle: 'API Synthesis & COA Quality Copilot',
    roleLabel: 'API Synthesis & COA Compliance',
    accentColor: '#0284c7',
    suggestedPrompts: [
      'Verify standard acceptance criteria for HPLC purity (>99.0%)',
      'Draft a formal response to an RFQ for bulk API lyophilized powder',
      'What endotoxin limits are required for sterile injectable peptides?',
      'Check batch packaging standards for vacuum-sealed peptide vials',
    ],
  },
];

export const DEFAULT_CONFIG = {
  screenScope: 'public_research',
  screenTitle: 'Research Assistant',
  roleLabel: 'Peptide Science & Research Guide',
  accentColor: '#2563eb',
  suggestedPrompts: [
    'What are the primary clinical indications for BPC-157?',
    'How do I calculate reconstitution units for a 5mg vial?',
    'What synergistic compounds pair well with GHK-Cu?',
    'Explain the difference between Sermorelin and CJC-1295',
  ],
};

/**
 * Format user name for display and agent ownership
 * e.g. "Dr. Erdmann" or "Carlos" or "Jose Luis"
 */
function formatUserSalutation(user) {
  if (!user || !user.name) return null;
  const fullName = String(user.name).trim();
  if (user.role === 'doctor') {
    if (fullName.toLowerCase().startsWith('dr.') || fullName.toLowerCase().startsWith('dr ')) {
      return fullName;
    }
    const parts = fullName.split(' ');
    const lastName = parts.length > 1 ? parts[parts.length - 1] : fullName;
    return `Dr. ${lastName}`;
  }
  return fullName.split(' ')[0]; // First name for warm personalization
}

/**
 * Multi-dimensional Pure Resolver for Screen AI Context
 * 
 * @param {string} path - Current pathname (e.g. /doctor/patients)
 * @param {Object} [activeEntity] - Currently pinned patient, product, or prescription
 * @param {Object} [currentUser] - { id, name, role, clinic, license, isAdmin }
 * @returns {Object} Screen AI configuration personalized to this exact user and screen
 */
export function resolveScreenAIContext(path = '/', activeEntity = null, currentUser = null) {
  const cleanPath = path || '/';
  const role = currentUser?.role || 'guest';
  const roleTheme = ROLE_THEMES[role] || ROLE_THEMES.guest;
  const userSalutation = formatUserSalutation(currentUser);

  // Match screen configuration
  let matchedScreen = null;
  for (const config of SCREEN_CONFIGS) {
    if (config.pattern.test(cleanPath)) {
      matchedScreen = config;
      break;
    }
  }

  // Fallback or adaptive screen config if on shared routes like /catalog or /calculator
  if (!matchedScreen) {
    if (cleanPath.startsWith('/catalog') || cleanPath.startsWith('/product/') || cleanPath.startsWith('/p/')) {
      if (cleanPath.includes('spain-company') || cleanPath.includes('spain-residency')) {
        matchedScreen = {
          screenScope: 'corporate_residency',
          screenTitle: 'Executive Corporate & Immigration Advisor',
          roleLabel: 'Spanish Law 14/2013 Corporate Residency',
          accentColor: '#003666',
          suggestedPrompts: [
            'Explain the 20-day UGE-CE fast-track statutory resolution window',
            'What is the structure of the 100% Spanish S.L. acquisition?',
            'How does the 3-year initial residence card work for my family?',
            'What are the consular Power of Attorney (PoA) requirements for remote closing?',
          ],
        };
      } else if (role === 'doctor') {
        matchedScreen = {
          screenScope: 'doctor_formulary',
          screenTitle: 'Formulary & Clinical Dosing Advisor',
          roleLabel: 'Physician Formulary Guidance',
          accentColor: roleTheme.accentColor,
          suggestedPrompts: [
            'Review clinical indications and recommended dosing for this peptide',
            'Audit reconstitution units and syringe calibration',
            'Check drug-drug interactions and patient contraindications',
            'Draft prescription magistral order for this compound',
          ],
        };
      } else if (role === 'patient') {
        matchedScreen = {
          screenScope: 'patient_compound',
          screenTitle: 'Compound & Protocol Guide',
          roleLabel: 'Personal Peptide Education',
          accentColor: roleTheme.accentColor,
          suggestedPrompts: [
            'How does this compound support my health and recovery?',
            'What is the standard reconstitution process for this vial?',
            'Are there any common side effects I should watch for?',
            'Ask my prescribing doctor about this peptide',
          ],
        };
      } else if (role === 'wholesaler') {
        matchedScreen = {
          screenScope: 'wholesaler_catalog',
          screenTitle: 'B2B Wholesale Catalog Copilot',
          roleLabel: 'Wholesale Pricing & Volume Tiers',
          accentColor: roleTheme.accentColor,
          suggestedPrompts: [
            'Check bulk tiered pricing (50+ / 100+ units)',
            'Verify available stock levels and lot expiration dates',
            'Request batch COA and purity report for this compound',
            'Add 50 units to commercial quotation workspace',
          ],
        };
      } else {
        matchedScreen = {
          screenScope: 'public_datasheet',
          screenTitle: 'Research Monograph Copilot',
          roleLabel: 'Analytical Monograph & Formulations',
          accentColor: roleTheme.accentColor,
          suggestedPrompts: [
            'Explain target receptor mechanisms and biological pathways',
            'What are the standard reconstitution guidelines with BAC water?',
            'Which evidence-based protocols feature this compound?',
            'How does Lotusland Limited certify RP-HPLC analytical purity?',
          ],
        };
      }
    }
  }

  const finalScreen = matchedScreen || DEFAULT_CONFIG;
  const accentColor = finalScreen.accentColor || roleTheme.accentColor;

  // 1. Personalized Agent Name
  let agentName = finalScreen.screenTitle;
  if (userSalutation) {
    agentName = `${userSalutation}'s ${finalScreen.screenTitle}`;
  } else if (currentUser?.name) {
    agentName = `${currentUser.name}'s ${finalScreen.screenTitle}`;
  }

  // 2. Personalized Initial Greeting
  let initialGreeting = '';
  if (role === 'doctor') {
    initialGreeting = `Good day, **${userSalutation || 'Doctor'}**.\n\nI am your dedicated **${agentName}**${currentUser?.clinic ? ` for *${currentUser.clinic}*` : ''}.\n\nHow can I assist your clinical formulation, patient titration, or compounding protocol on this screen?`;
  } else if (role === 'patient') {
    initialGreeting = `Hello **${userSalutation || 'there'}**! 😊\n\nI'm your private **${agentName}**.\n\nI'm here to help you follow your treatment plan, understand your dosages, and answer questions about storage and reconstitution.`;
  } else if (role === 'wholesaler') {
    initialGreeting = `Welcome, **${currentUser?.name || 'Partner'}**.\n\nI am your dedicated **${agentName}**.\n\nI can help calculate volume discounts, analyze tier margins, and verify cold-chain logistics for your orders.`;
  } else if (role === 'admin') {
    initialGreeting = `Greetings, **${currentUser?.name || 'Administrator'}**.\n\nI am your dedicated **${agentName}**.\n\nReady to audit master catalog pricing, verify clinical segregation, or review platform analytics.`;
  } else {
    initialGreeting = `Welcome to **RegenPept Research**.\n\nI am your **${agentName}**.\n\nHow can I help you explore peptide science, biochemistry, and clinical reconstitution?`;
  }

  // 3. Isolated Scope Key per (Role + User ID + Screen)
  const userIdKey = currentUser?.id || (currentUser?.name ? currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest');
  const scopeKey = `${role}_${userIdKey}_${finalScreen.screenScope}`;

  // 4. Personalized System Persona with strict role isolation contract
  let systemPersona = `You are ${agentName}, a dedicated, private AI assistant created exclusively for ${currentUser?.name || 'the user'} (${roleTheme.roleBadge}).
Facility / Organization: ${currentUser?.clinic || 'Med-Peptides Private Clinical Network'}
Role Authority: ${role.toUpperCase()}${currentUser?.license ? ` (Lic: ${currentUser.license})` : ''}
Screen Domain: ${finalScreen.roleLabel}

DEDICATED PERSONAL ASSISTANT CONTRACT:
- You are NOT a generic chatbot. You belong uniquely to ${currentUser?.name || 'this user'}.
- Maintain the appropriate professional tone:
  * DOCTOR: Peer-to-peer expert clinical pharmacologist. Address as ${userSalutation || 'Doctor'}. Focus on half-life kinetics, receptor binding, subcutaneous titration curves, compounding purity, and contraindications.
  * PATIENT: Reassuring, clear, empathetic wellness coach. Address by first name. Simplify complex chemistry into safe daily steps (units on syringe, BAC water, storage temperature).
  * WHOLESALER: Commercial B2B procurement advisor. Focus on MOQs, cold-chain transport, margins, and proforma invoices.
  * ADMIN: Executive platform auditor. Focus on multi-tenant isolation, clinical segregation compliance, margin auditing, and regulatory requirements.
- Strictly respect privacy and data boundaries. Do not reveal other clinics' or unassigned patients' confidential records.`;

  let finalPrompts = [...finalScreen.suggestedPrompts];
  let contextAnchor = null;

  // 5. Active Entity Anchoring (Patient, Product, Prescription)
  if (activeEntity && (activeEntity.name || activeEntity.id)) {
    const entityName = activeEntity.name || `Record #${activeEntity.id}`;
    const entityType = activeEntity.type || 'resource';

    contextAnchor = {
      type: entityType,
      id: activeEntity.id,
      name: entityName,
      badge: activeEntity.fileNumber ? `PIN: ${activeEntity.fileNumber}` : (activeEntity.id ? `#${String(activeEntity.id).slice(0, 8)}` : ''),
      subtitle: activeEntity.clinic || activeEntity.activeRx || activeEntity.dosage || (activeEntity.itemsCount ? `${activeEntity.itemsCount} compounds staged` : ''),
    };

    if (entityType === 'patient') {
      finalPrompts = [
        `Review titration schedule & adherence for ${entityName}`,
        `Draft personalized administration guide for ${entityName}`,
        `Check compound synergies & safety for ${entityName}`,
        ...finalScreen.suggestedPrompts.slice(0, 2),
      ];
      systemPersona += `\n\nACTIVE FOCUSED PATIENT: You are currently advising on patient "${entityName}" (ID: ${activeEntity.id}${activeEntity.clinic ? `, Clinic: ${activeEntity.clinic}` : ''}). Personalize all answers to this patient's profile.`;
    } else if (entityType === 'product') {
      finalPrompts = [
        `Calculate clinic margins and volume tiers for ${entityName}`,
        `Explain clinical indications & reconstitution for ${entityName}`,
        `Audit purity standards and storage protocol for ${entityName}`,
        ...finalScreen.suggestedPrompts.slice(0, 2),
      ];
      systemPersona += `\n\nACTIVE FOCUSED COMPOUND: You are currently analyzing compound "${entityName}" (Dosage: ${activeEntity.dosage || 'Standard'}, CAS: ${activeEntity.casNumber || 'Verified'}).`;
    } else if (entityType === 'prescription') {
      finalPrompts = [
        `Audit prescription ${activeEntity.id} for compound synergies`,
        `Draft patient administration instructions for prescription ${activeEntity.id}`,
        `Verify cold-chain delivery requirements for this order`,
        ...finalScreen.suggestedPrompts.slice(0, 2),
      ];
      systemPersona += `\n\nACTIVE FOCUSED PRESCRIPTION: You are currently reviewing prescription "${activeEntity.id}".`;
    }
  }

  return {
    agentName,
    roleLabel: roleTheme.roleBadge,
    screenSpecialty: finalScreen.screenTitle,
    accentColor,
    scopeKey,
    initialGreeting,
    suggestedPrompts: finalPrompts,
    systemPersona,
    contextAnchor,
    currentUser,
    currentPath: cleanPath,
  };
}

export default resolveScreenAIContext;
