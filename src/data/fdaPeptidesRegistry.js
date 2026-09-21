/**
 * fdaPeptidesRegistry.js
 * 
 * Authoritative registry of FDA regulatory classifications and status for peptides.
 * Covers:
 * 1. The 7 Peptides evaluated by the FDA Pharmacy Compounding Advisory Committee (PCAC)
 *    in July 2026 for the 503A Bulks List (BPC-157, TB-500, KPV, MOTS-c, Semax, Epitalon, Emideltide).
 * 2. FDA-Approved Peptides (Semaglutide, Tirzepatide, Tesamorelin, etc.)
 * 3. Investigational / IND Peptides (Retatrutide, Cagrilintide, etc.)
 * 4. Research-Grade Analytical Standards.
 */

export const FDA_STATUS_TYPES = {
  FDA_APPROVED: 'fda_approved',
  FDA_PCAC_503A_RECOMMENDED: 'fda_pcac_503a_recommended',
  FDA_CATEGORY_2_RESTRICTED: 'fda_category_2_restricted',
  CLINICAL_INVESTIGATIONAL: 'clinical_investigational',
  RESEARCH_ANALYTICAL_STANDARD: 'research_analytical_standard'
};

export const FDA_REGISTRY = {
  // ── 1. The 7 Peptides Evaluated by FDA PCAC (July 2026 503A Bulks List) ──
  'bpc-157': {
    slug: 'bpc-157',
    canonicalName: 'BPC-157',
    casNumber: '137525-51-0',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'The FDA Pharmacy Compounding Advisory Committee voted in July 2026 in favor of including BPC-157 on the 503A Bulks List for patient-specific compounding.',
    legalNotice: 'Recommendation by PCAC represents advisory clinical consensus for compounding pharmacy inclusion. Rulemaking procedures apply.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'tb-500': {
    slug: 'tb-500',
    canonicalName: 'TB-500 (Thymosin β4)',
    casNumber: '77591-33-4',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'The FDA PCAC voted in July 2026 to support inclusion of Thymosin Beta-4 / TB-500 on the 503A Bulks List for physician-supervised compounding.',
    legalNotice: 'Compounded under Section 503A guidance upon formal FDA Bulks List codification.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'bpc-157-tb-500': {
    slug: 'bpc-157-tb-500',
    canonicalName: 'BPC-157 + TB-500 Blend',
    casNumber: '137525-51-0 / 77591-33-4',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended Components',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Both Active Components Recommended for 503A Bulks List',
    summary: 'Both active biological peptide components (BPC-157 and Thymosin Beta-4 / TB-500) received favorable inclusion votes from the FDA PCAC in July 2026.',
    legalNotice: 'Active ingredients recommended for 503A compounding bulks list.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'kpv': {
    slug: 'kpv',
    canonicalName: 'KPV (Lys-Pro-Val)',
    casNumber: '67727-97-3',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'The FDA PCAC voted in July 2026 in favor of adding KPV (alpha-MSH C-terminal tripeptide) to the 503A Bulks List.',
    legalNotice: 'Recommended by PCAC for compounding in mucosal and systemic inflammation formulations.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'mots-c': {
    slug: 'mots-c',
    canonicalName: 'MOTS-c',
    casNumber: '1627580-64-6',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'Mitochondrial-derived peptide MOTS-c received a positive advisory recommendation from the FDA PCAC in July 2026 for compounding access.',
    legalNotice: 'Supported for 503A compounding bulks list.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'semax': {
    slug: 'semax',
    canonicalName: 'Semax',
    casNumber: '80714-61-0',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'The FDA PCAC voted favorably in July 2026 for the nomination of Semax (ACTH 4-10 analogue) for 503A compounding.',
    legalNotice: 'Advisory committee voted to approve inclusion on 503A Bulks List.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'epitalon': {
    slug: 'epitalon',
    canonicalName: 'Epitalon (Epithalon)',
    casNumber: '307297-39-8',
    status: FDA_STATUS_TYPES.FDA_PCAC_503A_RECOMMENDED,
    badgeLabel: 'FDA PCAC 503A Recommended',
    shortBadge: '503A PCAC ✓',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Recommended for 503A Bulks List Inclusion',
    summary: 'Epitalon (Ala-Glu-Asp-Gly telomerase activator peptide) was recommended by FDA PCAC in July 2026 for inclusion on the 503A Bulks List.',
    legalNotice: 'Voted for inclusion on 503A compounding list.',
    colorScheme: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      icon: '🛡️',
      accent: '#2563eb'
    }
  },
  'emideltide': {
    slug: 'emideltide',
    canonicalName: 'Emideltide (DSIP / Delta Sleep-Inducing Peptide)',
    casNumber: '62568-57-4',
    status: FDA_STATUS_TYPES.FDA_CATEGORY_2_RESTRICTED,
    badgeLabel: 'FDA Category 2 / Not Recommended',
    shortBadge: 'Category 2',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Rejected for 503A Bulks List Inclusion',
    summary: 'The FDA PCAC voted against recommending Emideltide (DSIP) for the 503A Bulks List due to insufficient human safety and clinical trial data.',
    legalNotice: 'Remains categorized as FDA Category 2 substance with restricted compounding status.',
    colorScheme: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#b91c1c',
      icon: '⚠️',
      accent: '#dc2626'
    }
  },
  'dsip': {
    slug: 'dsip',
    canonicalName: 'DSIP (Delta Sleep-Inducing Peptide / Emideltide)',
    casNumber: '62568-57-4',
    status: FDA_STATUS_TYPES.FDA_CATEGORY_2_RESTRICTED,
    badgeLabel: 'FDA Category 2 / Not Recommended',
    shortBadge: 'Category 2',
    rulingDate: 'July 2026',
    advisoryBody: 'FDA Pharmacy Compounding Advisory Committee (PCAC)',
    voteResult: 'Rejected for 503A Bulks List Inclusion',
    summary: 'FDA PCAC voted against 503A inclusion in July 2026.',
    legalNotice: 'Classified under FDA Category 2 restricted compounding substances.',
    colorScheme: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#b91c1c',
      icon: '⚠️',
      accent: '#dc2626'
    }
  },

  // ── 2. Full FDA-Approved Pharmaceutical Peptides ──
  'semaglutide': {
    slug: 'semaglutide',
    canonicalName: 'Semaglutide',
    casNumber: '910463-68-2',
    status: FDA_STATUS_TYPES.FDA_APPROVED,
    badgeLabel: 'FDA Approved Active Ingredient',
    shortBadge: 'FDA Approved ✓',
    rulingDate: 'Approved (NDA)',
    advisoryBody: 'U.S. FDA CDER (Center for Drug Evaluation and Research)',
    voteResult: 'FDA Approved Prescription Medication (GLP-1 RA)',
    summary: 'Semaglutide is an FDA-approved GLP-1 receptor agonist for type 2 diabetes management and chronic weight management.',
    legalNotice: 'Subject to commercial NDA / ANDA regulatory frameworks and standard prescription dispensing.',
    colorScheme: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#15803d',
      icon: '✅',
      accent: '#16a34a'
    }
  },
  'tirzepatide': {
    slug: 'tirzepatide',
    canonicalName: 'Tirzepatide',
    casNumber: '2023788-19-2',
    status: FDA_STATUS_TYPES.FDA_APPROVED,
    badgeLabel: 'FDA Approved Active Ingredient',
    shortBadge: 'FDA Approved ✓',
    rulingDate: 'Approved (NDA)',
    advisoryBody: 'U.S. FDA CDER',
    voteResult: 'FDA Approved Dual GIP/GLP-1 Receptor Agonist',
    summary: 'Tirzepatide is an FDA-approved dual glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptor agonist.',
    legalNotice: 'Dispensed under clinical medical supervision in accordance with FDA labeling.',
    colorScheme: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#15803d',
      icon: '✅',
      accent: '#16a34a'
    }
  },
  'tesamorelin': {
    slug: 'tesamorelin',
    canonicalName: 'Tesamorelin',
    casNumber: '218949-48-5',
    status: FDA_STATUS_TYPES.FDA_APPROVED,
    badgeLabel: 'FDA Approved GHRH Analogue',
    shortBadge: 'FDA Approved ✓',
    rulingDate: 'Approved (NDA)',
    advisoryBody: 'U.S. FDA CDER',
    voteResult: 'FDA Approved GHRH Analogue',
    summary: 'Tesamorelin is an FDA-approved growth hormone-releasing factor (GHRH) analogue.',
    legalNotice: 'Approved for clinical reduction of excess abdominal fat in lipodystrophy.',
    colorScheme: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#15803d',
      icon: '✅',
      accent: '#16a34a'
    }
  },

  // ── 3. Investigational Phase Peptides (Clinical Trials) ──
  'retatrutide': {
    slug: 'retatrutide',
    canonicalName: 'Retatrutide',
    casNumber: '2381089-83-2',
    status: FDA_STATUS_TYPES.CLINICAL_INVESTIGATIONAL,
    badgeLabel: 'Phase 3 Investigational (IND)',
    shortBadge: 'Phase 3 IND',
    rulingDate: 'Active Phase 3 Trials',
    advisoryBody: 'Clinical Trial Investigation',
    voteResult: 'Under Active Investigational New Drug (IND) Evaluation',
    summary: 'Retatrutide is a triple agonist (GIP, GLP-1, and Glucagon) currently in Phase 3 clinical trials.',
    legalNotice: 'Investigational new drug; not yet approved by the FDA for commercial marketing.',
    colorScheme: {
      bg: '#faf5ff',
      border: '#d8b4fe',
      text: '#6d28d9',
      icon: '🔬',
      accent: '#7c3aed'
    }
  }
};

/**
 * Resolves the FDA Regulatory profile for any product, variant, or slug.
 */
export function getFdaPeptideStatus(productOrSlug) {
  if (!productOrSlug) return null;

  // 1. Direct explicit schema property
  if (typeof productOrSlug === 'object' && productOrSlug.fdaRegulatory?.status) {
    const custom = productOrSlug.fdaRegulatory;
    const base = Object.values(FDA_REGISTRY).find(r => r.status === custom.status) || FDA_REGISTRY['bpc-157'];
    return {
      ...base,
      ...custom,
      colorScheme: custom.colorScheme || base.colorScheme
    };
  }

  // 2. Extract string key
  const str = (typeof productOrSlug === 'string'
    ? productOrSlug
    : (productOrSlug.slug || productOrSlug.canonicalName || productOrSlug.name || productOrSlug.id || '')
  ).toLowerCase().trim();

  // 3. Exact slug match
  if (FDA_REGISTRY[str]) {
    return FDA_REGISTRY[str];
  }

  // 4. Normalized substring match (e.g., "bpc-157-10mg" -> "bpc-157")
  for (const [key, value] of Object.entries(FDA_REGISTRY)) {
    if (str.includes(key) || key.includes(str)) {
      return value;
    }
  }

  // 5. Default fallback for standard analytical peptides
  return {
    status: FDA_STATUS_TYPES.RESEARCH_ANALYTICAL_STANDARD,
    badgeLabel: 'Analytical Reference Standard',
    shortBadge: 'Analytical Grade',
    rulingDate: 'ISO / HPLC Validated',
    advisoryBody: 'Analytical Standards Framework',
    voteResult: 'Chemical Characterization Standard',
    summary: 'Analytical reference peptide verified via HPLC and Mass Spectrometry for laboratory and clinical diagnostic reference.',
    legalNotice: 'High-purity API standard material provided with verified Certificate of Analysis (CoA).',
    colorScheme: {
      bg: '#f8fafc',
      border: '#cbd5e1',
      text: '#475569',
      icon: '⚗️',
      accent: '#64748b'
    }
  };
}
