import React from 'react';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Brain,
  Activity,
  Droplets,
  FlaskConical,
  Moon
} from 'lucide-react';
import { getFdaPeptideStatus, FDA_STATUS_TYPES } from '@/data/fdaPeptidesRegistry';

export const CATEGORY_MAP = {
  repair: { label: 'Tissue Repair & Healing', labelEn: 'Tissue Repair & Healing', labelEs: 'Reparación Tisular', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: '🩹' },
  metabolic: { label: 'Metabolic & GLP-1', labelEn: 'Metabolic & GLP-1', labelEs: 'Metabolismo & GLP-1', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '⚡' },
  longevity: { label: 'Longevity & Cellular', labelEn: 'Longevity & Cellular', labelEs: 'Longevidad & Celular', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: '🧬' },
  neuro: { label: 'Neuro & Cognitive', labelEn: 'Neuro & Cognitive', labelEs: 'Neuro & Cognitivo', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5', icon: '🧠' },
  growth_hormone: { label: 'GH Secretagogues', labelEn: 'GH Secretagogues', labelEs: 'Secretagogos de GH', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', icon: '🚀' },
  cosmetic: { label: 'Dermal & Follicular', labelEn: 'Dermal & Follicular', labelEs: 'Dérmico & Folicular', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', icon: '✨' },
  general_health: { label: 'Bioactive Peptide', labelEn: 'Bioactive Peptide', labelEs: 'Péptidos Bioactivos', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: '🧪' },
  supplies: { label: 'Solvents & Supplies', labelEn: 'Solvents & Supplies', labelEs: 'Disolventes & Suministros', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '💧' }
};

export const CATEGORY_ORDER = [
  'repair',
  'metabolic',
  'longevity',
  'neuro',
  'growth_hormone',
  'cosmetic',
  'general_health',
  'supplies'
];

export const DOSAGE_STRENGTHS = [
  { id: 'all', label: 'All Strengths' },
  { id: '5mg', label: '5 mg' },
  { id: '10mg', label: '10 mg' },
  { id: '20mg_plus', label: '15–20 mg+' }
];

export const SHIPPING_DESTINATIONS = [
  {
    id: 'EU',
    flag: '🇪🇺',
    labelEn: 'Europe',
    labelEs: 'Europa',
    rateBadge: '€60',
    usdCost: Math.round((60 / 0.92) * 100) / 100, // $65.22 USD
    eurCost: 60,
    defaultCountry: 'Spain',
    defaultPhoneCode: 'es'
  },
  {
    id: 'US',
    flag: '🇺🇸',
    labelEn: 'USA',
    labelEs: 'USA',
    rateBadge: '$25',
    usdCost: 25,
    eurCost: Math.round(25 * 0.92 * 100) / 100, // €23.00 EUR
    defaultCountry: 'United States',
    defaultPhoneCode: 'us'
  },
  {
    id: 'AE',
    flag: '🇦🇪',
    labelEn: 'UAE',
    labelEs: 'UAE',
    rateBadge: '$80',
    usdCost: 80,
    eurCost: Math.round(80 * 0.92 * 100) / 100, // €73.60 EUR
    defaultCountry: 'United Arab Emirates',
    defaultPhoneCode: 'ae'
  }
];

export const FDA_FILTERS = [
  { id: 'all', labelEn: 'All Regulatory', labelEs: 'Todos los Estatus', tooltipEn: 'All FDA Regulatory Statuses', tooltipEs: 'Todos los Estados Regulatorios FDA', icon: '🌐' },
  { id: 'fda_503a', labelEn: '503A Discretion', labelEs: '503A Magistral', tooltipEn: 'HHS/FDA 503A Enforcement Discretion', tooltipEs: '503A Discreción de Ejecución Magistral HHS/FDA', icon: '🛡️', color: '#16a34a' },
  { id: 'fda_approved', labelEn: 'FDA Approved', labelEs: 'Aprobados FDA', tooltipEn: 'FDA Approved (NDA / BLA)', tooltipEs: 'Aprobados por FDA (NDA / BLA)', icon: '🏛️', color: '#1a73e8' },
  { id: 'clinical_ind', labelEn: 'Clinical (IND)', labelEs: 'Fase Clínica IND', tooltipEn: 'Clinical Investigational (IND)', tooltipEs: 'En Investigación Clínica Activa (IND)', icon: '🔬', color: '#d97706' },
  { id: 'analytical', labelEn: 'Analytical Grade', labelEs: 'Estándar Analítico', tooltipEn: 'Analytical Reference Standards', tooltipEs: 'Estándar de Referencia Analítica', icon: '🧪', color: '#64748b' }
];

export const CLINICAL_PRESETS = [
  {
    id: 'tissue_repair',
    name: 'Tissue Repair Protocol',
    icon: '🩹',
    description: 'BPC-157 (10mg) + TB-500 (10mg)',
    categoryName: 'Musculoskeletal & Tendon Repair',
    accent: '#0284c7',
    accentBg: '#f0f9ff',
    searchTerms: ['bpc-157', 'tb-500'],
    dosageFilter: '10mg',
    cycleDuration: '6 to 8 Consecutive Weeks',
    administration: 'Subcutaneous (SQ) injection near injury site or abdomen',
    posology: 'BPC-157: 250–500 mcg twice daily. TB-500: 2.0–2.5 mg twice weekly.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'BPC-157 accelerates focal neo-angiogenesis via VEGF upregulation and stabilizes granulation tissue. TB-500 acts as a cellular G-actin sequestrant, inducing rapid migration of myoblasts and endothelial progenitor cells into damaged connective tissue matrices.',
    outcomes: [
      'Accelerated collagen Type I & III synthesis in tendon-to-bone junctions',
      'Rapid resolution of micro-vascular inflammation and muscular soreness',
      'Systemic gastro-protective endothelial stabilization'
    ],
    peptides: [
      { name: 'BPC-157', dosage: '10 mg', role: 'Angiogenic Repair & Collagen Synthesis' },
      { name: 'TB-500 (Thymosin Beta-4)', dosage: '10 mg', role: 'Actin Regulation & Fibroblast Migration' }
    ]
  },
  {
    id: 'metabolic_glp1',
    name: 'Metabolic & GLP-1 Protocol',
    icon: '⚡',
    description: 'Tirzepatide (10mg) + Retatrutide (10mg)',
    categoryName: 'Dual/Triple Incretin Synergy',
    accent: '#16a34a',
    accentBg: '#f0fdf4',
    searchTerms: ['tirzepatide', 'retatrutide'],
    dosageFilter: '10mg',
    cycleDuration: '8 to 12 Weeks Titration',
    administration: 'Subcutaneous (SQ) injection once weekly (abdominal rotation)',
    posology: 'Starting titration: 2.5 mg once weekly for 4 weeks, escalating to 5.0 mg – 7.5 mg weekly based on glycemic/adipose response.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Simultaneous GLP-1 (satiety & gastric delay), GIP (adipose lipid buffering & insulinotropic balance), and Glucagon receptor agonism (mitochondrial thermogenesis and resting energy expenditure enhancement).',
    outcomes: [
      'Significant reduction in visceral adipose tissue and waist circumference',
      'Suppression of food noise and restoration of glycemic sensitivity',
      'Hepatic steatosis resolution through glucagon-mediated lipid clearance'
    ],
    peptides: [
      { name: 'Tirzepatide', dosage: '10 mg', role: 'Dual GIP / GLP-1 Receptor Agonist' },
      { name: 'Retatrutide', dosage: '10 mg', role: 'Triple GIP / GLP-1 / Glucagon Agonist' }
    ]
  },
  {
    id: 'cellular_longevity',
    name: 'Longevity & Cellular Protocol',
    icon: '🧬',
    description: 'Epithalon (10mg) + MOTS-c (10mg)',
    categoryName: 'Telomeric & Mitochondrial Health',
    accent: '#7c3aed',
    accentBg: '#faf5ff',
    searchTerms: ['epithalon', 'mots-c'],
    dosageFilter: '10mg',
    cycleDuration: '20 to 60 Days Cyclic Routine',
    administration: 'Subcutaneous (SQ) injection (morning upon waking)',
    posology: 'Epithalon: 5–10 mg daily for 10–20 days (repeat 2x per year). MOTS-c: 5–10 mg 3x weekly for 4–8 weeks.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Epithalon induces telomerase elongation and regulates pineal melatonin/circadian expression. MOTS-c translocates to the cell nucleus upon metabolic stress to trigger AMPK activation and mitochondrial biogenesis.',
    outcomes: [
      'Cellular senescence defense and genomic integrity stabilization',
      'Enhanced insulin sensitivity and systemic metabolic flexibility',
      'Deep circadian rhythm realignment and slow-wave sleep depth'
    ],
    peptides: [
      { name: 'Epithalon', dosage: '10 mg', role: 'Telomerase Induction & Pineal Regulation' },
      { name: 'MOTS-c', dosage: '10 mg', role: 'Mitochondrial-Derived Peptide & AMPK Activator' }
    ]
  },
  {
    id: 'cognitive_neuro',
    name: 'Neuro & Focus Protocol',
    icon: '🧠',
    description: 'Semax (10mg) + Selank (10mg)',
    categoryName: 'Neuropeptide Cognitive Optimization',
    accent: '#ea580c',
    accentBg: '#fff7ed',
    searchTerms: ['semax', 'selank'],
    dosageFilter: '10mg',
    cycleDuration: '4 to 6 Weeks Consecutive Cycle',
    administration: 'Subcutaneous (SQ) or Intranasal reconstitutions',
    posology: 'Semax: 250–500 mcg morning. Selank: 250–500 mcg late afternoon or evening.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Semax triggers potent BDNF (Brain-Derived Neurotrophic Factor) and TrkB receptor expression in the hippocampus. Selank modulates GABAergic neurotransmission and suppresses enkephalin degradation without sedation.',
    outcomes: [
      'Marked enhancement of executive focus, working memory, and mental stamina',
      'Robust stress resilience and reduction of Generalized Anxiety symptoms',
      'Cerebrovascular neuroprotection and synaptic plasticity enhancement'
    ],
    peptides: [
      { name: 'Semax', dosage: '10 mg', role: 'BDNF/TrkB Upregulation & Executive Function' },
      { name: 'Selank', dosage: '10 mg', role: 'GABA-A Modulation & Stress Reduction' }
    ]
  },
  {
    id: 'gh_secretagogue',
    name: 'GH Secretagogue Axis',
    icon: '🚀',
    description: 'CJC-1295 (5mg) + Ipamorelin (5mg)',
    categoryName: 'Somatotropic Pituitary Pulsatility',
    accent: '#0d9488',
    accentBg: '#f0fdfa',
    searchTerms: ['cjc-1295', 'ipamorelin'],
    dosageFilter: '5mg',
    cycleDuration: '8 to 12 Consecutive Weeks (5 days on / 2 days off)',
    administration: 'Subcutaneous (SQ) pre-bedtime on an empty stomach (2h post-meal)',
    posology: '100–200 mcg CJC-1295 + 100–300 mcg Ipamorelin once daily before sleep.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'CJC-1295 (GHRH analog) amplifies natural growth hormone pulse amplitude, while Ipamorelin (selective GHSR-1a agonist) triggers pituitary release without elevating cortisol, prolactin, or appetite-stimulating ghrelin.',
    outcomes: [
      'Pulsatile nocturnal growth hormone & circulating IGF-1 elevation',
      'Enhanced lean body mass preservation and lipolysis',
      'Accelerated micro-connective tissue repair and deeper stage-4 restorative sleep'
    ],
    peptides: [
      { name: 'CJC-1295 (No DAC)', dosage: '5 mg', role: 'GHRH Secretagogue Pulse Amplifier' },
      { name: 'Ipamorelin', dosage: '5 mg', role: 'Selective Ghrelin/GHSR-1a Receptor Agonist' }
    ]
  }
];

export function getCategoryIcon(key, size = 14) {
  switch (key) {
    case 'repair': return <ShieldCheck size={size} color="#1a73e8" />;
    case 'metabolic': return <Zap size={size} color="#188038" />;
    case 'longevity': return <Sparkles size={size} color="#7c3aed" />;
    case 'neuro': return <Brain size={size} color="#ea580c" />;
    case 'growth_hormone': return <Activity size={size} color="#0d9488" />;
    case 'cosmetic': return <Sparkles size={size} color="#db2777" />;
    case 'supplies': return <Droplets size={size} color="#0284c7" />;
    case 'general_health':
    default:
      return <FlaskConical size={size} color="#5f6368" />;
  }
}

export function getPresetIcon(id, size = 15) {
  switch (id) {
    case 'tissue_repair': return <ShieldCheck size={size} color="#1a73e8" />;
    case 'metabolic_glp1': return <Zap size={size} color="#188038" />;
    case 'cellular_longevity': return <Sparkles size={size} color="#7c3aed" />;
    case 'neuro_focus': return <Brain size={size} color="#ea580c" />;
    case 'deep_sleep': return <Moon size={size} color="#4f46e5" />;
    default: return <Activity size={size} color="#5f6368" />;
  }
}

export function resolveProductFda(product) {
  const status = getFdaPeptideStatus(product);
  if (status) return status;
  return {
    status: FDA_STATUS_TYPES?.RESEARCH_ANALYTICAL_STANDARD || 'research_analytical_standard',
    badgeLabel: 'Analytical Reference Standard',
    shortBadge: 'Analytical Standard',
    shortCode: 'STANDARD',
    colorScheme: {
      bg: '#f1f5f9',
      border: '#cbd5e1',
      text: '#475569',
      icon: '🧪'
    }
  };
}

export function getFdaFilterBucket(product) {
  const fda = getFdaPeptideStatus(product);
  if (!fda) return 'analytical';
  if (
    fda.status === FDA_STATUS_TYPES?.HHS_503A_ENFORCEMENT_DISCRETION ||
    fda.status === FDA_STATUS_TYPES?.FDA_PCAC_503A_RECOMMENDED
  ) {
    return 'fda_503a';
  }
  if (fda.status === FDA_STATUS_TYPES?.FDA_APPROVED) {
    return 'fda_approved';
  }
  if (fda.status === FDA_STATUS_TYPES?.CLINICAL_INVESTIGATIONAL) {
    return 'clinical_ind';
  }
  return 'analytical';
}

export function parseDoseNum(str = '') {
  const match = String(str).match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}
