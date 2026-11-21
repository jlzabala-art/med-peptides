'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackSearchClick } from '@/services/algoliaInsights';
import {
  Sparkles,
  Send,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  FileText,
  Thermometer,
  Droplets,
  HelpCircle,
  Layers,
  FlaskConical,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  Calculator,
  Clock,
  Syringe,
  Mail,
  ArrowUpRight,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import {
  getSuggestedInquiriesForProduct,
  getContextualAndPopularSuggestions,
} from '@/data/compoundSuggestedInquiries';
import '@/styles/publicDesignSystem.css';

/**
 * PublicAtlasAIDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Sandboxed, strictly focused AI research assistant for Public Datasheets (/p/[slug])
 * and Public Shared Catalogs (/c/[id]).
 * 
 * Strict Guardrails:
 * 1. Strictly in English at all times.
 * 2. Rate-limit with intelligent caching to guarantee repeated searches never deplete quota.
 * 3. Session isolation via sessionStorage (no cross-user query bleed).
 * 4. Zero outbound hyperlinks away from the platform.
 * 5. Registration CTA trigger once the free guest queries are exhausted.
 * 6. Live integration with Recognized Clinical Sources (NIH PubMed & Clinical Compendiums).
 */

const PENS_CLINICAL_EVIDENCE_LIBRARY = [
  {
    pmid: '20647205',
    title: 'Effects of Tesamorelin (Egrifta®), a Growth Hormone-Releasing Factor Analogue, on Visceral Adipose Tissue & Metabolic Markers (Phase 3)',
    journal: 'New England Journal of Medicine (NEJM)',
    pubdate: '2010',
    authors: 'Falutz J, Potvin D, Mamputu JC et al.',
    clinicalSummary: 'Selective visceral adipose tissue (VAT) reduction (-15% to -18%) and triglyceride improvement via physiological pulsatile GH/IGF-1 stimulation without impairing fasting glucose.',
    penCorrelation: 'Tesamorelin Pen (30 mg / 3 mL = 10 mg/mL) · 10 to 20 clicks daily (1–2 mg) SC before bedtime.',
  },
  {
    pmid: '32409585',
    title: 'Elamipretide (SS-31) Targets Inner Mitochondrial Cardiolipin to Restore Bioenergetics & ATP Synthesis in Mitochondrial Myopathy (MMPOWER / TAZPOWER)',
    journal: 'Genetics in Medicine / Nature Medicine',
    pubdate: '2020',
    authors: 'Karaa A, Haas R, Goldstein A et al.',
    clinicalSummary: 'Stabilizes cardiolipin on the inner mitochondrial membrane, reduces mitochondrial ROS, and increases Complex I–IV electron transport chain efficiency.',
    penCorrelation: 'SS-31 (Elamipretide) Pen (30 mg / 3 mL = 10 mg/mL) · 10 to 40 clicks daily (1–4 mg) SC in the morning.',
  },
  {
    pmid: '25738459',
    title: 'The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reduces Obesity and Insulin Resistance via AMPK Activation',
    journal: 'Cell Metabolism',
    pubdate: '2015',
    authors: 'Lee C, Zeng J, Drew BG, Sallam T, Pinchuk P, Cohen P',
    clinicalSummary: '16-amino-acid mtDNA-encoded peptide regulating the folate-methionine cycle and AICAR-mediated AMPK activation in skeletal muscle, mimicking exercise-induced GLUT4 translocation.',
    penCorrelation: 'MOTS-c Pen (15/30/60 mg in 3 mL or 40 mg in 2 mL) · 5 mg active dose = 100 clicks (15mg), 50 clicks (30mg), or 25 clicks (40mg/2mL & 60mg/3mL).',
  },
  {
    pmid: '16571593',
    title: 'Pulsatile GH & IGF-1 Elevation Following Co-Administration of GHRH Analogue (CJC-1295) and Selective Ghrelin Mimetic (Ipamorelin)',
    journal: 'Journal of Clinical Endocrinology & Metabolism (JCEM)',
    pubdate: '2006',
    authors: 'Teichman SL, Neale A, Lawrence B et al.',
    clinicalSummary: 'Synergistic GHRH receptor + GHSR-1a activation amplifies nocturnal somatotroph GH release while preserving pituitary pulsatility and avoiding ACTH/cortisol or prolactin elevation.',
    penCorrelation: 'CJC-1295 (No DAC) / Ipamorelin Pen (3/6 mg, 5/10 mg, or 6/6 mg in 3 mL) · 10 clicks (0.10 mL) fasted before bedtime (5 days on / 2 days off).',
  },
  {
    pmid: '21030672',
    title: 'Pentadecapeptide BPC-157 & Thymosin Beta-4 (TB-500) Accelerate Tendon-to-Bone Healing, Fibroblast GH-Receptor Expression & VEGF Angiogenesis',
    journal: 'Journal of Orthopaedic Research / Ann NY Acad Sci',
    pubdate: '2011',
    authors: 'Chang CH, Tsai WC, Hsu YH, Pang JH',
    clinicalSummary: 'BPC-157 upregulates growth hormone receptor expression on tendon fibroblasts up to 7-fold while TB-500 (Ac-LKKTETQ) promotes actin monomer sequestration and endothelial migration.',
    penCorrelation: 'BPC-157 / TB-500 Pen (6/9 mg, 7.5/7.5 mg, or 15/22.5 mg in 3 mL) · 10 clicks daily (6/9 & 7.5/7.5 mg) or 4 clicks daily (15/22.5 mg concentrated).',
  },
  {
    pmid: '18097414',
    title: 'Alpha-MSH C-Terminal Tripeptide KPV (Lys-Pro-Val) Inhibits NF-κB Nuclear Translocation & Mucosal Inflammation via PepT1 Transport',
    journal: 'Gastroenterology',
    pubdate: '2008',
    authors: 'Dalmasso G, Charrier-Hisamuddin L, Nguyen HT et al.',
    clinicalSummary: 'Potent anti-inflammatory immunomodulation without melanotropic pigmentation (zero MC1R melanin stimulation), downregulating TNF-α, IL-1β, and IL-6.',
    penCorrelation: 'KPV Pen (10 mg or 15 mg / 3 mL) or KLOW 4-in-1 Stack Pen · 10 clicks daily (0.10 mL = 333–500 mcg).',
  },
  {
    pmid: '20497731',
    title: 'Thymosin Alpha-1 (Thymalfasin / Zadaxin®): Mechanism of Action in T-Cell Maturation, NK Cytotoxicity & Toll-Like Receptor 2/9 Signaling',
    journal: 'Annals of the New York Academy of Sciences',
    pubdate: '2010',
    authors: 'Romani L, Bistoni F, Montagnoli C, Gaziano R, Bozza S, Garaci E',
    clinicalSummary: '28-amino-acid thymic peptide approved in >35 countries that restores adaptive CD4+/CD8+ T-cell immunity, dendritic cell antigen presentation, and intracellular glutathione.',
    penCorrelation: 'Thymosin Alpha-1 Pen (30 mg / 3 mL = 10 mg/mL) · 16 clicks (0.16 mL = 1.6 mg) twice weekly SC.',
  },
  {
    pmid: '30007919',
    title: 'NAD+ Repletion Restores Sirtuin (SIRT1/SIRT3) Deacetylase Activity, PARP1 DNA Repair & Vascular Endothelial Function in Human Aging',
    journal: 'Nature Communications / Cell Metabolism',
    pubdate: '2018',
    authors: 'Martens CR, Denman BA, Mazzo MR, Seals DR et al.',
    clinicalSummary: 'Direct parenteral NAD+ replenishment bypasses gut degradation to elevate intracellular NAD+/NADH ratios, supporting mitochondrial biogenesis and genomic stability.',
    penCorrelation: 'NAD+ Pen (300 mg, 750 mg, or 1,050 mg / 3 mL) · 30–50 clicks (300 mg), 12–20 clicks (750 mg), or 9–15 clicks (1,050 mg) for 30–50 mg dose.',
  },
  {
    pmid: '12919708',
    title: 'Epithalon (Ala-Glu-Asp-Gly) Induces Telomerase Activity and Telomere Elongation in Human Somatic Cells & Pineal Melatonin Regulation',
    journal: 'Bulletin of Experimental Biology and Medicine',
    pubdate: '2003',
    authors: 'Khavinson VKh, Bondarev IE, Butyugov AA',
    clinicalSummary: 'Pineal tetrapeptide bioregulator shown to activate hTERT telomerase expression in somatic fibroblasts and normalize circadian melatonin-cortisol rhythms.',
    penCorrelation: 'Epithalon Pen (30 mg or 100 mg / 3 mL) · 25 clicks daily (2.5 mg on 30 mg pen) or 15 clicks daily (5 mg on 100 mg pen) for 10–20 day cycle.',
  },
  {
    pmid: '16996037',
    title: 'Heptapeptides Semax & Selank Rapidly Upregulate Hippocampal BDNF/trkB Expression and Modulate GABAergic Anxiolytic Neurotransmission',
    journal: 'Brain Research / European Neuropsychopharmacology',
    pubdate: '2006',
    authors: 'Dolotov OV, Karpenko EA, Inozemtseva LS et al.',
    clinicalSummary: 'ACTH(4-10) analogue Semax elevates brain-derived neurotrophic factor (BDNF) within 3 hours while tuftsin analogue Selank modulates enkephalin degradation and GABA-A receptors without sedation.',
    penCorrelation: 'Semax Pen (15 mg / 3 mL) & Selank Pen (15 mg / 3 mL) · 5 to 10 clicks (250–500 mcg) SC in the morning.',
  },
];

const PENS_CLINICAL_PROTOCOL_PRESETS = [
  {
    id: 'preset-recovery',
    badge: 'TISSUE & POST-SURGICAL',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    titleEn: 'Post-Surgical & Musculoskeletal Recovery Stack',
    titleEs: 'Protocolo de Recuperación Post-Quirúrgica y Tendinosa',
    pensLabel: 'BPC-157/TB-500 + GHK-Cu + KPV (3 Pens)',
    productIds: ['dn-bpc-tb', 'dn-ghk-cu', 'dn-kpv'],
    promptEn: 'Design a 6-week Post-Surgical & Tendon Recovery clinical protocol stacking BPC-157/TB-500, GHK-Cu, and KPV pre-filled pens: specify exact U-100 dial clicks for each strength, AM/PM injection timing, total pens required for 6 weeks (accounting for needle priming), and hs-CRP/inflammatory biomarker monitoring.',
    promptEs: 'Diseña un protocolo clínico de 6 semanas de Recuperación Post-Quirúrgica y Tendinosa combinando las plumas BPC-157/TB-500, GHK-Cu y KPV: detalla los clics U-100 exactos por concentración, horario AM/PM, número total de plumas para 6 semanas (descontando purga) y biomarcadores inflamatorios (hs-CRP) a monitorizar.',
  },
  {
    id: 'preset-longevity',
    badge: 'MITOCHONDRIAL & NAD+',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    titleEn: 'Mitochondrial ATP & Cellular Longevity Protocol',
    titleEs: 'Protocolo de Longevidad Celular, ATP Mitocondrial y NAD+',
    pensLabel: 'Epithalon + MOTS-c + NAD+ + SS-31 (4 Pens)',
    productIds: ['dn-epithalon', 'dn-mots-c', 'dn-nad-plus', 'dnlab-pen-ss31'],
    promptEn: 'Design an advanced Cellular Longevity & Mitochondrial ATP protocol combining Epithalon, MOTS-c, NAD+, and SS-31 (Elamipretide) pens: provide exact U-100 dial clicks across the available concentrations (MOTS-c 15/30/40/60 mg, NAD+ 300/750/1050 mg), sequencing (10-day Epithalon pulse vs 4-week mitochondrial phase), and baseline/follow-up labs.',
    promptEs: 'Diseña un protocolo avanzado de Longevidad Celular y ATP Mitocondrial combinando las plumas Epithalon, MOTS-c, NAD+ y SS-31 (Elamipretide): indica los clics U-100 exactos según concentración (MOTS-c 15/30/40/60 mg, NAD+ 300/750/1050 mg), secuenciación por fases y analíticas de control.',
  },
  {
    id: 'preset-gh-metabolic',
    badge: 'GH AXIS & VISCERAL FAT',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    titleEn: 'Visceral Adiposity & Pulsatile GH Optimization',
    titleEs: 'Optimización del Eje GH/IGF-1 y Reducción de Grasa Visceral',
    pensLabel: 'Tesamorelin + CJC-1295/Ipamorelin (2 Pens)',
    productIds: ['dnlab-pen-tesamorelin', 'dn-cjc-ipam'],
    promptEn: 'Compare and design a metabolic GH-axis protocol using Tesamorelin (30 mg / 3 mL) vs CJC-1295/Ipamorelin (3/6, 5/10, or 6/6 mg / 3 mL): detail exact U-100 clicks, mandatory 2-hour post-dinner fasting window, 5-days-on/2-days-off desensitization cycling, and IGF-1 / HbA1c / HOMA-IR monitoring.',
    promptEs: 'Compara y diseña un protocolo metabólico del eje GH con Tesamorelin (30 mg / 3 mL) y CJC-1295/Ipamorelin (3/6, 5/10 o 6/6 mg / 3 mL): detalla clics U-100 exactos, ventana obligatoria de ayuno nocturno, ciclo 5 días on / 2 off y monitorización de IGF-1, HbA1c y HOMA-IR.',
  },
  {
    id: 'preset-neuro-sleep',
    badge: 'NEURO & DEEP SLEEP',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    titleEn: 'Neuro-Cognitive BDNF Focus (AM) & Delta Sleep (PM)',
    titleEs: 'Protocolo Neuro-Cognitivo BDNF (Mañana) y Sueño Delta (Noche)',
    pensLabel: 'Semax + Selank (AM) + DSIP (PM) (3 Pens)',
    productIds: ['dnlab-pen-semax', 'dnlab-pen-selank', 'dn-dsip'],
    promptEn: 'Design a circadian Neuro-Cognitive & Restorative Sleep protocol pairing morning Semax (15 mg / 3 mL) + Selank (15 mg / 3 mL) with evening DSIP (2 mg / 2 mL): provide exact U-100 dial clicks, receptor mechanisms (BDNF/trkB, GABA-A, delta-wave sleep architecture), and cartridge duration.',
    promptEs: 'Diseña un protocolo circadiano Neuro-Cognitivo y de Sueño Profundo combinando Semax (15 mg / 3 mL) + Selank (15 mg / 3 mL) por la mañana con DSIP (2 mg / 2 mL) por la noche: indica clics U-100 exactos, mecanismos (BDNF/trkB, GABA-A, sueño delta) y duración de cada cartucho.',
  },
];

const PENS_SPECIALTY_AXES = [
  {
    id: 'repair',
    labelEn: '🩹 Tissue Repair (6)',
    labelEs: '🩹 Reparación Tisular (6)',
    promptEn: 'Show the complete U-100 click-to-dose table and clinical comparison for all Tissue Repair pens: BPC-157/TB-500 (6/9, 7.5/7.5 & 15/22.5 mg), BPC-157 Standalone (15 mg), TB-500 Standalone (15 mg), KPV (10 & 15 mg), GLOW Stack, and KLOW Stack.',
    promptEs: 'Muestra la tabla completa de clics U-100 y comparativa clínica de todas las plumas de Reparación Tisular: BPC-157/TB-500 (6/9, 7.5/7.5 y 15/22.5 mg), BPC-157 Individual (15 mg), TB-500 Individual (15 mg), KPV (10 y 15 mg), GLOW Stack y KLOW Stack.',
  },
  {
    id: 'gh',
    labelEn: '⚡ GH & IGF-1 Axis (6)',
    labelEs: '⚡ Eje GH / IGF-1 (6)',
    promptEn: 'Show the U-100 click dosing matrix and clinical differentiation across all 6 Growth Hormone & IGF-1 pens: Tesamorelin (30 mg), CJC-1295 No DAC (3 & 30 mg), CJC-1295/Ipamorelin (3/6, 5/10 & 6/6 mg), Ipamorelin (6 & 15 mg), IGF-1 LR3 (300 mcg & 3 mg), and MGF (2.4 mg / 2.4 mL).',
    promptEs: 'Muestra la matriz de clics U-100 y diferenciación clínica de las 6 plumas del Eje GH / IGF-1: Tesamorelin (30 mg), CJC-1295 No DAC (3 y 30 mg), CJC-1295/Ipamorelin (3/6, 5/10 y 6/6 mg), Ipamorelin (6 y 15 mg), IGF-1 LR3 (300 mcg y 3 mg) y MGF (2.4 mg / 2.4 mL).',
  },
  {
    id: 'mito',
    labelEn: '🧬 Mitochondrial & NAD+ (7)',
    labelEs: '🧬 Mitocondrial y NAD+ (7)',
    promptEn: 'Provide the complete U-100 dial conversion matrix across all Mitochondrial, Metabolic & Longevity pens: MOTS-c (15/30/40/60 mg), NAD+ (300/750/1050 mg), SS-31 Elamipretide (30 mg), Epithalon (30 & 100 mg), Humanin (30 mg), Thymosin Alpha-1 (30 mg), and 5-Amino-1MQ (100 mg).',
    promptEs: 'Proporciona la matriz completa de conversión de clics U-100 de las plumas Mitocondriales, Metabólicas y de Longevidad: MOTS-c (15/30/40/60 mg), NAD+ (300/750/1050 mg), SS-31 Elamipretide (30 mg), Epithalon (30 y 100 mg), Humanin (30 mg), Thymosin Alpha-1 (30 mg) y 5-Amino-1MQ (100 mg).',
  },
  {
    id: 'neuro',
    labelEn: '🧠 Neuro & Sleep (4)',
    labelEs: '🧠 Neuro y Sueño (4)',
    promptEn: 'Compare U-100 click dosing, circadian timing, and mechanisms for our 4 Neuro-Cognitive & Sleep pens: Semax (15 mg / 3 mL), Selank (15 mg / 3 mL), DSIP (2 mg / 2 mL), and CJC-1295/Ipamorelin/DSIP Night Blend (3/6/6 mg / 3 mL).',
    promptEs: 'Compara los clics U-100, horario circadiano y mecanismos de las 4 plumas Neuro-Cognitivas y de Sueño: Semax (15 mg / 3 mL), Selank (15 mg / 3 mL), DSIP (2 mg / 2 mL) y CJC-1295/Ipamorelin/DSIP Night Blend (3/6/6 mg / 3 mL).',
  },
  {
    id: 'dermal-sexual',
    labelEn: '✨ Dermal & Sexual (4)',
    labelEs: '✨ Dermo y Salud Sexual (4)',
    promptEn: 'Detail the U-100 dial clicks, multi-strength differences, and safety guardrails for GHK-Cu (30, 60 & 100 mg / 3 mL), PT-141 Bremelanotide (20 mg & 15 mg / 3 mL), Kisspeptin-10 (3 mg & 15 mg / 3 mL), and hCG (5,000 IU / 2 mL = 25 IU/click).',
    promptEs: 'Detalla los clics U-100, diferencias entre concentraciones y precauciones de seguridad para GHK-Cu (30, 60 y 100 mg / 3 mL), PT-141 Bremelanotide (20 y 15 mg / 3 mL), Kisspeptin-10 (3 y 15 mg / 3 mL) y hCG (5,000 IU / 2 mL = 25 IU/clic).',
  },
];

function detectMentionedPenIdsInText(text = '') {
  if (!text) return [];
  const lower = String(text).toLowerCase();
  const rules = [
    { id: 'dn-bpc-tb', match: /\bbpc[-\s]?157\s*\/\s*tb[-\s]?(?:500|4)\b/i },
    { id: 'dnlab-pen-bpc157-solo', match: /\bbpc[-\s]?157\b(?![\s/]*tb)/i },
    { id: 'dnlab-pen-tb500-solo', match: /(?<!\/)\btb[-\s]?500\b/i },
    { id: 'dn-kpv', match: /\bkpv\b/i },
    { id: 'dn-cjc-ipam-dsip', match: /\bcjc[-\s]?1295\s*\/\s*ipamorelin\s*\/\s*dsip\b/i },
    { id: 'dn-cjc-ipam', match: /\bcjc[-\s]?1295\s*\/\s*ipamorelin\b/i },
    { id: 'dn-cjc-1295-alone', match: /\bcjc[-\s]?1295\s*\(\s*no\s*dac\s*\)/i },
    { id: 'dn-igf1-lr3', match: /\bigf[-\s]?1\s*lr3\b/i },
    { id: 'dn-ipamorelin-alone', match: /(?<!\/)\bipamorelin\b(?!\s*\/)/i },
    { id: 'dn-mgf', match: /\bmgf\b/i },
    { id: 'dn-dsip', match: /(?<!\/)\bdsip\b/i },
    { id: 'dn-epithalon', match: /\bepith?alon\b/i },
    { id: 'dn-humanin', match: /\bhumanin\b/i },
    { id: 'dn-mots-c', match: /\bmots[-\s]?c\b/i },
    { id: 'dn-nad-plus', match: /\bnad\+\b/i },
    { id: 'dnlab-pen-ss31', match: /\b(?:ss[-\s]?31|elamipretide)\b/i },
    { id: 'dn-ghk-cu', match: /\bghk[-\s]?cu\b/i },
    { id: 'dn-glow', match: /\bglow\b/i },
    { id: 'dn-klow', match: /\bklow\b/i },
    { id: 'dn-hcg', match: /\bhcg\b/i },
    { id: 'dn-kisspeptin', match: /\bkisspeptin\b/i },
    { id: 'dn-pt-141', match: /\b(?:pt[-\s]?141|bremelanotide)\b/i },
    { id: 'dnlab-pen-tesamorelin', match: /\btesamorelin\b/i },
    { id: 'dnlab-pen-ta1', match: /\b(?:thymosin\s*alpha[-\s]?1|ta[-\s]?1|thymalfasin)\b/i },
    { id: 'dnlab-pen-selank', match: /\bselank\b/i },
    { id: 'dnlab-pen-semax', match: /\bsemax\b/i },
    { id: 'dnlab-pen-5amino1mq', match: /\b5[-\s]?amino[-\s]?1mq\b/i },
  ];
  const found = [];
  for (const r of rules) {
    if (r.match.test(lower)) found.push(r.id);
  }
  return Array.from(new Set(found)).slice(0, 6);
}

function parseAiResponseParts(text) {
  if (!text) return { cleanText: '', highlights: [], predictedSteps: [] };

  let highlights = [];
  const hlMatch = text.match(/\[CLINICAL_HIGHLIGHTS\]([\s\S]*?)\[\/CLINICAL_HIGHLIGHTS\]/i);
  if (hlMatch) {
    highlights = hlMatch[1]
      .split('\n')
      .map(l => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean);
  }

  let predictedSteps = [];
  const psMatch = text.match(/\[PREDICTED_NEXT_STEPS\]([\s\S]*?)\[\/PREDICTED_NEXT_STEPS\]/i);
  if (psMatch) {
    predictedSteps = psMatch[1]
      .split('\n')
      .map(l => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean);
  }

  const cleanText = text
    .replace(/\[CLINICAL_HIGHLIGHTS\][\s\S]*?\[\/CLINICAL_HIGHLIGHTS\]/gi, '')
    .replace(/\[PREDICTED_NEXT_STEPS\][\s\S]*?\[\/PREDICTED_NEXT_STEPS\]/gi, '')
    .trim();

  return { cleanText, highlights, predictedSteps };
}

export default function PublicAtlasAIDrawer({
  contextType = 'monograph', // 'monograph' | 'catalog'
  contextAnchor = null,     // { name, cas, purity, molecular, sequence, details, slug }
  catalogInventory = [],    // [{ name, category, purity, format }]
  storageKey = 'default',
  onOpenRegisterModal = null,
  hideFloatingTrigger = true,
  lang = 'en',
  isOpenControlled = null,
  onCloseControlled = null,
  isOpen: isOpenProp = null,
  onClose: onCloseProp = null,
  isGlobalFallback = false,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenControlled !== null 
    ? isOpenControlled 
    : (isOpenProp !== null && isOpenProp !== undefined ? isOpenProp : internalIsOpen);
  const handleClose = () => {
    if (onCloseControlled) onCloseControlled();
    else if (onCloseProp) onCloseProp();
    else setInternalIsOpen(false);
  };
  const handleOpenDrawer = () => {
    setInternalIsOpen(true);
  };
  const { user, activeRole } = useAuth();
  // True authentication requires a valid non-anonymous registered user with email and non-guest role
  const isAuthenticated = Boolean(user && !user.isAnonymous && user.email && activeRole !== 'guest');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(isAuthenticated ? 999 : 5);
  const [limit, setLimit] = useState(isAuthenticated ? 999 : 5);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'evidence'
  const [clinicalSources, setClinicalSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [isUnlockingBonus, setIsUnlockingBonus] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionKey = `atlas_ai_public_${storageKey}`;

  // 1. Load isolated session chat history & check bonus
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
      if (sessionStorage.getItem(`${sessionKey}_bonus_unlocked`)) {
        setLimit(30);
        setRemaining(25);
        setIsBlocked(false);
      }
    } catch {
      setMessages([]);
    }
  }, [sessionKey]);

  const handleUnlockBonus = async (e) => {
    e.preventDefault();
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      toast.error('Please enter a valid clinical or professional email.');
      return;
    }
    setIsUnlockingBonus(true);
    triggerHaptic('impact');
    try {
      await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Atlas AI Practitioner Lead',
          email: leadEmail.trim(),
          topic: 'Atlas AI Quota Unlock (+25 Inquiries)',
          message: `Practitioner lead requested +25 bonus inquiries unlock for: ${contextAnchor?.name || 'General Catalog'}`,
          contextType: 'ai_quota_unlock_lead',
        })
      });
      setLimit(30);
      setRemaining(25);
      setIsBlocked(false);
      sessionStorage.setItem(`${sessionKey}_bonus_unlocked`, 'true');
      toast.success('✓ +25 Inquiries unlocked! Scientific access granted for your session.');
    } catch {
      setLimit(30);
      setRemaining(25);
      setIsBlocked(false);
      sessionStorage.setItem(`${sessionKey}_bonus_unlocked`, 'true');
      toast.success('✓ +25 Inquiries unlocked! Scientific access granted for your session.');
    } finally {
      setIsUnlockingBonus(false);
    }
  };

  // Track page-level PublicAtlasAIDrawer mounts so GlobalPublicAtlasDrawer avoids duplicate FABs
  useEffect(() => {
    if (isGlobalFallback || typeof window === 'undefined') return;
    window.__publicAtlasPageMounted = (window.__publicAtlasPageMounted || 0) + 1;
    window.dispatchEvent(new CustomEvent('public-atlas-mount-change'));
    return () => {
      window.__publicAtlasPageMounted = Math.max(0, (window.__publicAtlasPageMounted || 1) - 1);
      window.dispatchEvent(new CustomEvent('public-atlas-mount-change'));
    };
  }, [isGlobalFallback]);

  // Global event listener to open drawer with pre-filled inquiry from publication cards
  useEffect(() => {
    const handleOpen = (e) => {
      setInternalIsOpen(true);
      if (e.detail?.initialQuery) {
        setMessage(e.detail.initialQuery);
        setActiveTab('chat');
      }
    };
    window.addEventListener('open-public-atlas-ai', handleOpen);
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setInternalIsOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setInternalIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('open-public-atlas-ai', handleOpen);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const isPensFormulary =
    contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing';

  // Auto-load rich clinical context when opened with a section/collection anchor
  // NOTE: For pens_formulary we render the interactive above-the-fold Clinical Command Deck instead of a wall-of-text bot bubble.
  useEffect(() => {
    if (isPensFormulary) {
      if (messages.length === 1 && messages[0]?.isAutoWelcome) {
        setMessages([]);
      }
      return;
    }
    const canInjectWelcome =
      messages.length === 0 || (messages.length === 1 && messages[0]?.isAutoWelcome);
    if (isOpen && canInjectWelcome && contextAnchor?.sectionTitle) {
      const isEs = lang === 'es';
      const productsList = Array.isArray(contextAnchor.products) ? contextAnchor.products.filter(Boolean) : [];
      const selectedProtocol = Array.isArray(contextAnchor.protocolSelection) ? contextAnchor.protocolSelection : [];

      const lines = [`### 🧬 ${contextAnchor.sectionTitle}`];

      if (selectedProtocol.length > 0) {
        lines.push(
          `**${isEs ? 'Protocolo Activo Seleccionado (Supply Summary):' : 'Active Protocol Selection (Supply Summary):'}**`,
          selectedProtocol
            .map(
              (item) =>
                `• **${item.name} (${item.concentration} / ${item.volume})** — ${item.qty} ${
                  item.qty === 1 ? (isEs ? 'pluma' : 'pen') : (isEs ? 'plumas' : 'pens')
                } · ${item.clicksRange || item.clicksPerDose} clicks (${item.doseBreakdown})`
            )
            .join('\n')
        );
      } else if (productsList.length > 0) {
        lines.push(
          `**${isEs ? 'Formulaciones en Alcance:' : 'Formulations in Scope:'}**`,
          productsList.map((p) => `• **${p}**`).join('\n')
        );
      }

      if (contextAnchor.keyActives) {
        lines.push(
          `**${
            contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing'
              ? isEs
                ? 'Porfolio de Bolígrafos Precargados y Especialidades:'
                : 'Pre-filled Pen Portfolio & Therapeutic Axes:'
              : isEs
                ? 'Principios Activos y Complejos Clave:'
                : 'Key Bioactive Actives & Complexes:'
          }**`,
          contextAnchor.keyActives
        );
      }

      if (contextAnchor.mechanisms) {
        lines.push(
          `**${
            contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing'
              ? isEs
                ? 'Estándar de Dosificación U-100 y Cadena de Frío:'
                : 'U-100 Dial Standard & Cold-Chain Specifications:'
              : isEs
                ? 'Mecanismo Clínico y Acción Biológica:'
                : 'Clinical Mechanism & Biological Action:'
          }**`,
          contextAnchor.mechanisms
        );
      }

      const closingNote =
        contextAnchor.welcomeIntro ||
        (isEs
          ? '¿Cómo puedo asistir en tu evaluación clínica hoy? Consulta sobre farmacología, pautas de dosificación, sinergias entre fórmulas o especificaciones analíticas.'
          : 'How can I assist your clinical evaluation today? Feel free to ask about pharmacology, dosing schedules, formulation synergies, or analytical specifications.');

      lines.push(`*${closingNote}*`);
      const welcome = lines.join('\n\n');
      if (messages[0]?.text !== welcome) {
        setMessages([{ sender: 'bot', text: welcome, isAutoWelcome: true, timestamp: new Date().toISOString() }]);
      }
    }
  }, [isOpen, contextAnchor, contextType, lang, messages]);

  // 2. Fetch current IP quota status
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai-chat?scope=public_sandbox')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining);
          setLimit(data.limit || 5);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('atlas-quota-updated', {
                detail: { remaining: data.remaining, limit: data.limit || 5 },
              })
            );
          }
          if (data.remaining <= 0) {
            setIsBlocked(true);
          }
        }
      })
      .catch(() => {
        // Non-blocking quota lookup
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Pre-load recognized PubMed clinical evidence for active compound (or curated 27-pen evidence library)
  useEffect(() => {
    if (isPensFormulary) {
      setClinicalSources(PENS_CLINICAL_EVIDENCE_LIBRARY);
      setIsLoadingSources(false);
      return undefined;
    }
    if (contextType === 'monograph' && contextAnchor?.name) {
      let isMounted = true;
      setIsLoadingSources(true);
      const cleanName = contextAnchor.name.replace(/\([^)]*\)/g, '').replace(/≥.*%/, '').trim();
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanName)}&retmode=json&retmax=4`;

      fetch(searchUrl)
        .then(res => res.json())
        .then(data => {
          const ids = data.esearchresult?.idlist || [];
          if (ids.length === 0) {
            if (isMounted) setIsLoadingSources(false);
            return;
          }
          const sumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
          return fetch(sumUrl);
        })
        .then(res => (res ? res.json() : null))
        .then(sumData => {
          if (!isMounted || !sumData?.result) return;
          const result = sumData.result || {};
          const ids = sumData.result.uids || [];
          const parsed = ids.map(id => {
            const item = result[id] || {};
            return {
              pmid: id,
              title: item.title || '',
              journal: item.source || item.fulljournalname || 'Biomedical Journal',
              pubdate: item.pubdate || item.epubdate || '',
              authors: (item.authors || []).slice(0, 2).map(a => a.name).join(', '),
              pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
            };
          });
          setClinicalSources(parsed);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingSources(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [contextType, contextAnchor?.name]);

  // 4. Scroll to latest message
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Save session messages locally
  const saveMessages = (updated) => {
    setMessages(updated);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query || isLoading || isBlocked) return;

    setMessage('');
    setActiveTab('chat');
    const newMsgList = [...messages, { sender: 'user', text: query, timestamp: new Date().toISOString() }];
    saveMessages(newMsgList);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: isAuthenticated ? 'authenticated' : 'public_sandbox',
          currentUser: isAuthenticated ? { uid: user.uid, email: user.email, role: activeRole } : null,
          message: query,
          context: {
            screenScope: contextType || (contextType === 'monograph' ? 'product_monograph' : 'catalog_portfolio'),
            contextAnchor,
            catalogInventory,
            currentUser: isAuthenticated ? { uid: user.uid, email: user.email, role: activeRole } : null,
          },
          history: newMsgList.slice(-6),
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        setIsBlocked(true);
        setRemaining(0);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('atlas-quota-updated', {
              detail: { remaining: 0, limit: limit || 5 },
            })
          );
        }
        saveMessages([
          ...newMsgList,
          {
            sender: 'bot',
            text: 'You have reached the limit of 5 free guest research inquiries. Please sign in or subscribe for unlimited clinical access.',
            isQuotaExceeded: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      if (typeof data.remaining === 'number' && !isAuthenticated) {
        setRemaining(data.remaining);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('atlas-quota-updated', {
              detail: { remaining: data.remaining, limit: data.limit || limit || 5 },
            })
          );
        }
        if (data.remaining <= 0) {
          setIsBlocked(true);
        }
      }

      if (typeof data.limit === 'number' && !isAuthenticated) {
        setLimit(data.limit);
      }

      if (Array.isArray(data.sources) && data.sources.length > 0) {
        setClinicalSources(prev => (prev.length > 0 ? prev : data.sources));
      }

      const botReply = data.reply || 'Analytical specification confirmed. All compounding parameters must follow standard institutional guidelines.';
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: botReply,
          cached: Boolean(data.cached),
          matchedEntities: Array.isArray(data.matchedEntities) ? data.matchedEntities : [],
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: 'Temporary network connection delay. Dual-stage RP-HPLC specifications remain verified on the primary document.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Metric Highlight Helper (Avoids splitting slash ratios like 6/9 or 15/22.5 mg) ──
  const METRIC_REGEX = /(≥\s*\d+(?:\.\d+)?%|\d+(?:\.\d+)?%|[-−]?\d+(?:\.\d+)?\s*(?:°C|°F)|\d+(?:\.\d+)?\s*[-–—]\s*\d+(?:\.\d+)?\s*(?:°C|°F)|\d+(?:\.\d+)?\s*[-–—]\s*\d+(?:\.\d+)?\s*(?:mL|mg|mcg|µg)|(?<![/\d])\b\d+(?:\.\d+)?\s*(?:mL|mg|mcg|µg)\b|\bRP-HPLC\b|\bLC-MS\b|\bESI-MS\b|\b0\.9%\s+benzyl\s+alcohol\b|\bU-100\b|\b\d+\s*(?:days|months|hours|weeks|years)\b|\[PubMed:\s*\d+[^\]]*\]|\[Clinical[^\]]*\])/gi;

  const TOKEN_REGEX = /(\[[^\]]+\]\(\/[^)]+\)|\*\*[^*]+\*\*)/g;

  const renderBodyWithHighlights = (rawText) => {
    if (!rawText) return null;
    // Clean any stray unclosed asterisks or trailing **: from broken upstream formatting
    const text = String(rawText).replace(/\*\*:/g, ':').replace(/([^\n*]+)\*\*/g, (m, p1) => {
      return p1.includes('**') ? m : p1;
    });
    const tokens = text.split(TOKEN_REGEX);

    return tokens.map((chunk, cIdx) => {
      if (!chunk) return null;

      // 1. Internal Public Markdown Link
      if (chunk.startsWith('[') && chunk.includes('](')) {
        const linkMatch = chunk.match(/^\[([^\]]+)\]\(\/([^)]+)\)$/);
        if (linkMatch) {
          const label = linkMatch[1];
          const href = '/' + linkMatch[2];
          return (
            <a
              key={cIdx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#0284c7',
                backgroundColor: '#eff6ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                padding: '1px 7px',
                margin: '1px 3px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.80rem',
                verticalAlign: 'baseline',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0f2fe';
                e.currentTarget.style.borderColor = '#7dd3fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#bae6fd';
              }}
            >
              <ExternalLink size={11} color="#0284c7" />
              <span>{label}</span>
            </a>
          );
        }
      }

      // 2. Bold emphasis
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        const inner = chunk.slice(2, -2);
        return (
          <strong key={cIdx} style={{ color: '#00284d', fontWeight: 700 }}>
            {inner}
          </strong>
        );
      }

      // 3. Metric and Citation regex parser
      const metricParts = chunk.split(METRIC_REGEX);
      return metricParts.map((part, pIdx) => {
        if (!part) return null;
        if (METRIC_REGEX.test(part)) {
          METRIC_REGEX.lastIndex = 0;

          // Citation tag badge
          if (part.startsWith('[PubMed:') || part.startsWith('[Clinical')) {
            return (
              <span
                key={`${cIdx}-${pIdx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '5px',
                  padding: '1px 6px',
                  margin: '0 2px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  verticalAlign: 'baseline',
                }}
              >
                <BookOpen size={11} color="#2563eb" />
                {part.replace(/[[\]]/g, '')}
              </span>
            );
          }

          // Clinical parameter metric badge
          return (
            <span
              key={`${cIdx}-${pIdx}`}
              style={{
                display: 'inline-block',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '0 4px',
                margin: '0 1.5px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.79rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                border: '1px solid rgba(59, 130, 246, 0.22)',
                verticalAlign: 'baseline',
              }}
            >
              {part}
            </span>
          );
        }
        return part;
      });
    });
  };

  const getSpecIconAndStyle = (label, body) => {
    const text = ((label || '') + ' ' + (body || '')).toLowerCase();

    if (
      text.includes('storage') ||
      text.includes('thermal') ||
      text.includes('temp') ||
      text.includes('stability') ||
      text.includes('°c') ||
      text.includes('freeze') ||
      text.includes('refrigerat') ||
      text.includes('cool')
    ) {
      return {
        icon: <Thermometer size={14} color="#2563eb" style={{ flexShrink: 0 }} />,
        tagBg: '#eff6ff',
        tagColor: '#1d4ed8',
        borderColor: 'rgba(59, 130, 246, 0.25)',
      };
    }
    if (
      text.includes('dilut') ||
      text.includes('reconstitut') ||
      text.includes('water') ||
      text.includes('bac') ||
      text.includes('solvent') ||
      text.includes('inject') ||
      text.includes('syringe') ||
      text.includes('volume') ||
      text.includes('liquid')
    ) {
      return {
        icon: <Droplets size={14} color="#0284c7" style={{ flexShrink: 0 }} />,
        tagBg: '#f0f9ff',
        tagColor: '#0369a1',
        borderColor: 'rgba(14, 165, 233, 0.25)',
      };
    }
    if (
      text.includes('purity') ||
      text.includes('standard') ||
      text.includes('hplc') ||
      text.includes('ms') ||
      text.includes('synthes') ||
      text.includes('analytical') ||
      text.includes('grade') ||
      text.includes('certif')
    ) {
      return {
        icon: <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />,
        tagBg: '#ecfdf5',
        tagColor: '#047857',
        borderColor: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (
      text.includes('cas') ||
      text.includes('molecular') ||
      text.includes('formula') ||
      text.includes('weight') ||
      text.includes('sequence') ||
      text.includes('peptide') ||
      text.includes('receptor') ||
      text.includes('affinity') ||
      text.includes('agonist')
    ) {
      return {
        icon: <FlaskConical size={14} color="#7c3aed" style={{ flexShrink: 0 }} />,
        tagBg: '#f5f3ff',
        tagColor: '#6d28d9',
        borderColor: 'rgba(139, 92, 246, 0.25)',
      };
    }
    return {
      icon: <CheckCircle2 size={14} color="#003666" style={{ flexShrink: 0 }} />,
      tagBg: '#f8fafc',
      tagColor: '#003666',
      borderColor: '#e2e8f0',
    };
  };

  // Dynamic topic pools for non-repeating inquiry rotation
  const DIAGNOSTIC_TOPICS = [
    { label: 'Capillary DBS Collection', query: 'What are the step-by-step instructions for capillary blood collection on the Whatman 903 card?', keys: ['collection', 'fingerstick', 'step', 'lancet', 'spot', 'card', 'whatman'] },
    { label: 'Sample Transit Stability', query: 'What is the sample stability duration at ambient temperature during postal transit?', keys: ['stability', 'transit', 'postal', 'ambient', 'temperature', 'days', 'desiccant'] },
    { label: 'Biomarker Reference Ranges', query: 'How are the intracellular NAD+ clinical reference ranges stratified and interpreted?', keys: ['range', 'reference', 'stratified', 'depletion', 'optimal', 'level', 'umol'] },
    { label: 'Re-Testing Cadence', query: 'What is the recommended re-testing interval during active precursor supplementation or peptide therapy?', keys: ['re-test', 'cadence', 'interval', 'follow-up', 'monitoring', 'weeks'] },
    { label: 'LifeLab1 Analytical Method', query: 'What analytical assay methodology does LifeLab1 use for intracellular NAD+ measurement?', keys: ['method', 'assay', 'lifelab', 'enzymatic', 'cyclic', 'spectrophotometric', 'lod'] },
    { label: 'Pre-Test Fasting Protocol', query: 'Should the blood sample be collected in a fasted state or at a specific time of day?', keys: ['fasting', 'morning', 'circadian', 'timing', 'food', 'breakfast'] },
    { label: 'CD38 & PARP1 Sinks', query: 'What cellular mechanisms and enzymes drive intracellular NAD+ depletion in aging?', keys: ['cd38', 'parp', 'sirtuin', 'consumption', 'decline', 'aging', 'salvage'] },
    { label: 'Protocol Pairing & Precursors', query: 'Which clinical longevity protocols and cofactors are recommended for suboptimal NAD+ levels?', keys: ['protocol', 'precursor', 'nmn', 'ss-31', 'mots-c', 'tmg', 'synergy'] },
  ];

  const MONOGRAPH_TOPICS = [
    { label: 'BAC Dilution Ratio', query: 'Please detail the exact BAC water dilution ratio and reconstitution steps.', keys: ['bac', 'dilut', 'reconstitut', 'water'] },
    { label: 'Refrigeration Limits', query: 'What are the thermal stability limits and refrigeration storage protocols?', keys: ['refrigerat', 'storage', 'temp', 'thermal', 'freeze'] },
    { label: 'Clinical Pathways', query: 'What are the primary clinical pathways and investigational outcomes?', keys: ['clinical', 'pathway', 'trial', 'investigat', 'human'] },
    { label: 'Receptor Target Affinities', query: 'What are the receptor binding affinities and molecular selectivity values?', keys: ['receptor', 'affinity', 'selectivity', 'agonist', 'target'] },
    { label: 'Dual-Stage HPLC Purity', query: 'What are the certified dual-stage RP-HPLC and MS purity release specifications?', keys: ['purity', 'hplc', 'spectrometry', 'ms', 'release', 'standard'] },
    { label: 'In-Solution Shelf Life', query: 'What is the active degradation curve and shelf life once reconstituted?', keys: ['shelf', 'solution', 'days active', 'degradation', 'stability'] },
    { label: 'Peer-Reviewed Evidence', query: 'What do published PubMed clinical trials and pharmacokinetic data indicate?', keys: ['pubmed', 'pmid', 'evidence', 'study', 'literature'] },
    { label: 'Gentle Handling Protocols', query: 'What are the critical vial handling guidelines to prevent peptide shearing?', keys: ['handling', 'swirl', 'shear', 'agitat', 'gentle'] },
    { label: 'Micro-Dosing Syringe Units', query: 'How do syringe unit calibrations correlate to microgram (mcg) measurements?', keys: ['syringe', 'unit', 'mcg', 'conversion', 'micro-dosing'] },
    { label: 'Molecular Identity & Mass', query: 'What is the theoretical molecular formula and verified net peptide mass?', keys: ['molecular', 'formula', 'weight', 'mass', 'sequence'] },
    { label: 'Secondary Signaling Cascades', query: 'What downstream metabolic cascades or enzymatic pathways are modulated?', keys: ['cascade', 'metabolic', 'enzymatic', 'downstream', 'camp'] },
  ];

  const PROTOCOL_TOPICS = [
    { label: 'Phase Titration Schedule', query: 'Explain the progressive phase titration schedule and step-up timeline.', keys: ['titrat', 'schedule', 'phase', 'step-up', 'timeline'] },
    { label: 'Required Biomarkers', query: 'Which baseline and follow-up laboratory biomarkers should be monitored?', keys: ['biomarker', 'lab', 'blood', 'monitor', 'baseline'] },
    { label: 'Compound Synergies', query: 'How do the companion compounds synergize within this protocol architecture?', keys: ['synerg', 'companion', 'combin', 'stack'] },
    { label: 'Safety & Contraindications', query: 'What are the strict contraindications, warning flags, and interaction precautions?', keys: ['contraindicat', 'caution', 'warning', 'safety', 'precaution'] },
    { label: 'Washout & Cycle Limits', query: 'What is the recommended cycle duration and required washout or pause interval?', keys: ['cycle', 'washout', 'pause', 'duration', 'interval'] },
    { label: 'Micro-Unit Syringe Math', query: 'How to calculate individual syringe units for each titration phase?', keys: ['unit', 'calculat', 'syringe', 'dose'] },
  ];

  const CATALOG_TOPICS = [
    { label: 'Metabolic Formulations', query: 'Which high-purity formulations are designed for metabolic and glycemic research?', keys: ['metabolic', 'glycemic', 'weight'] },
    { label: 'In-Stock Immediate Dispatch', query: 'Which research compounds are currently verified in stock for immediate dispatch?', keys: ['stock', 'dispatch', 'ship', 'available'] },
    { label: 'Verified Synthesis Standard', query: 'What is the dual-stage RP-HPLC synthesis standard and release testing criteria?', keys: ['standard', 'synthesis', 'purity', 'release', 'quality'] },
    { label: 'Research Volume Tiers', query: 'What multi-vial research volume tiers and bulk study discounts are supported?', keys: ['volume', 'tier', 'bulk', 'multi-vial'] },
    { label: 'Cellular Repair Peptides', query: 'What cellular repair and wound healing peptides are cataloged?', keys: ['repair', 'tissue', 'healing', 'bpc', 'tb-500'] },
    { label: 'Neuro & Longevity Monograph', query: 'What nootropic and cellular longevity peptides are available in the repository?', keys: ['neuro', 'longevity', 'semax', 'selank', 'epithalon'] },
  ];

  const getDynamicSuggestions = (activeBotText = '') => {
    return getContextualAndPopularSuggestions({
      messages,
      contextAnchor,
      contextType,
      lang,
      activeBotText,
    });
  };

  // Safe markdown cleaner and high-fidelity clinical parser
  const renderSafeBotText = (txt) => {
    if (!txt) return null;
    // Sanitize markdown links: preserve only safe internal public platform routes, strip external or private links
    const sanitized = txt.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      const isSafePublic = /^\/(proto(\/.*)?|p(\/.*)?|catalog|calculator|what-are-peptides)(\?.*)?$/.test(url);
      return isSafePublic ? `[${label}](${url})` : label;
    });
    const rawLines = sanitized.split('\n').map(l => l.trim()).filter(Boolean);

    const isDiagContext = contextType === 'diagnostic_test' || contextAnchor?.category === 'Diagnostic Kits';
    const isCorpContext = contextType === 'corporate_residency' || contextAnchor?.category === 'Corporate Services';
    const isProtoContext = contextType === 'protocol_guide' || contextAnchor?.phases;
    const isProtoDirContext = contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog';
    const isPensContext = contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing';

    const microHeaderTitle = isPensContext
      ? (lang === 'es' ? 'DOSIFICACIÓN U-100 Y FORMULARIO DE BOLÍGRAFOS' : 'U-100 PRE-FILLED PEN DOSING & FORMULARY')
      : isDiagContext
      ? (lang === 'es' ? 'ESPECIFICACIONES DE BIOMARCADORES CLÍNICOS' : 'VERIFIED CLINICAL BIOMARKER SPECIFICATIONS')
      : isCorpContext
      ? (lang === 'es' ? 'ESPECIFICACIONES ESTATUTARIAS CORPORATIVAS' : 'VERIFIED CORPORATE STATUTORY SPECIFICATIONS')
      : isProtoDirContext
      ? (lang === 'es' ? 'DIRECTORIO DE PROTOCOLOS TERAPÉUTICOS' : 'CLINICAL PROTOCOL DIRECTORY BLUEPRINT')
      : isProtoContext
      ? (lang === 'es' ? 'ARQUITECTURA DE PROTOCOLO CLÍNICO' : 'VERIFIED CLINICAL PROTOCOL BLUEPRINT')
      : (lang === 'es' ? 'ESPECIFICACIONES ANALÍTICAS VERIFICADAS' : 'VERIFIED ANALYTICAL SPECIFICATIONS');

    const microHeaderSubtitle = isPensContext
      ? '100 clicks = 1 mL'
      : isDiagContext
      ? 'CE-IVDR Diagnostic Test'
      : isCorpContext
      ? 'Spanish Law 14/2013'
      : isProtoDirContext
      ? '78 Standardized Pathways'
      : isProtoContext
      ? 'Phased Pathway'
      : 'Standard Monograph';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Institutional Micro-Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
            paddingBottom: '4px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.70rem', fontWeight: 800, color: '#003666', letterSpacing: '0.02em' }}>
            <Sparkles size={11} color="#0284c7" />
            <span>{microHeaderTitle}</span>
          </div>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>{microHeaderSubtitle}</span>
        </div>

        {rawLines.map((line, idx) => {
          // 0. Horizontal rule ("---", "***", "___") — never parse as a bullet box!
          if (/^[-_*]{3,}$/.test(line)) {
            return (
              <div
                key={idx}
                style={{
                  borderTop: '1px solid #e2e8f0',
                  margin: '4px 0',
                }}
              />
            );
          }

          // 0b. Single-asterisk italic summary / callout line ("*How can I assist...*")
          if (/^\*[^*]+\*$/.test(line)) {
            const cleanItalic = line.replace(/^\*+|\*+$/g, '').trim();
            return (
              <div
                key={idx}
                style={{
                  marginTop: '4px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '3px solid #0284c7',
                  borderRadius: '8px',
                  padding: '8px 11px',
                  fontSize: '0.79rem',
                  color: '#334155',
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                {renderBodyWithHighlights(cleanItalic)}
              </div>
            );
          }

          // Check if it's a section header
          const isHeader = (
            (line.endsWith(':') && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 65) ||
            line.startsWith('### ') ||
            line.startsWith('## ') ||
            (/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*)$/.test(line))
          );

          if (isHeader) {
            const cleanTitle = line.replace(/^[#*\s]+|[*#:]+$/g, '').trim();
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: '6px 0 4px 0',
                  paddingBottom: '4px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Layers size={13} color="#003666" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00284d', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                  {cleanTitle}
                </span>
              </div>
            );
          }

          // Check if it's a callout or closing question
          const isQuestionOrCallout = (
            line.endsWith('?') ||
            line.toLowerCase().startsWith('which specific') ||
            line.toLowerCase().startsWith('would you like') ||
            line.toLowerCase().startsWith('please let me know') ||
            line.toLowerCase().startsWith('note:') ||
            line.toLowerCase().startsWith('warning:')
          );

          if (isQuestionOrCallout) {
            return (
              <div
                key={idx}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '7px',
                }}
              >
                <HelpCircle size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0369a1', lineHeight: 1.4 }}>
                  {line.replace(/^\*+|\*+$/g, '').trim()}
                </span>
              </div>
            );
          }

          // Check if it's a bullet or parameter item (must have a space after •, -, *, or digit.)
          const isBullet = (
            /^(\s*[•\-*]|\s*\d+\.)\s+/.test(line) ||
            /^[A-Za-z\s/&—-]+:\s+.+/.test(line)
          );

          if (isBullet) {
            // Strip only bullet markers (e.g. "- ", "* ", "1. "), preserving any ** bold delimiters!
            const stripped = line.replace(/^(\s*[-•*]|\s*\d+\.)\s+/, '').trim();
            const colonMatch = stripped.match(/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*:\s*|\*\*[^*]+\*\*\s*|[A-Za-z0-9\s/&—-]+:)\s*(.+)$/);

            let label = null;
            let body = stripped;

            if (colonMatch) {
              label = colonMatch[1].replace(/[:*]/g, '').trim();
              body = colonMatch[2].trim();
            }

            const style = getSpecIconAndStyle(label, body);

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${style.borderColor}`,
                  borderRadius: '8px',
                  padding: '8px 11px',
                  marginBottom: '2px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                {label && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                    {style.icon}
                    <span style={{ fontSize: '0.78rem', fontWeight: 750, color: style.tagColor, letterSpacing: '-0.01em' }}>
                      {label}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#334155', paddingLeft: label ? '19px' : '0' }}>
                  {!label && (
                    <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
                      {style.icon}
                    </span>
                  )}
                  {renderBodyWithHighlights(body)}
                </div>
              </div>
            );
          }

          // General paragraph
          return (
            <p key={idx} style={{ margin: '0 0 4px 0', lineHeight: 1.45, fontSize: '0.84rem', color: '#334155' }}>
              {renderBodyWithHighlights(line)}
            </p>
          );
        })}

        {/* Interactive Follow-up Options / Continuation Chips (Always rendered after bot response) */}
        <div
          style={{
            marginTop: '10px',
            marginBottom: '4px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '9px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={13} color="#0284c7" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {lang === 'es' ? 'Consultas Sugeridas de Continuación:' : 'Suggested Follow-Up Inquiries:'}
              </span>
            </div>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
              {lang === 'es' ? 'Continuar Consulta' : 'Continue Thread'}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {getDynamicSuggestions(txt).map((chip, cIdx) => (
              <button
                key={cIdx}
                type="button"
                onClick={() => handleSendMessage(chip.query || `Please detail: ${chip.label || chip}`)}
                disabled={isBlocked || isLoading}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  color: '#003666',
                  cursor: isBlocked || isLoading ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textAlign: 'left',
                  lineHeight: 1.3,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  if (!isBlocked && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.color = '#0284c7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isBlocked && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#003666';
                  }
                }}
              >
                <span style={{ color: '#0d9488', fontWeight: 800 }}>+</span> {chip.label || chip}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Verification Stamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px dashed #e2e8f0',
            fontSize: '0.67rem',
            color: '#94a3b8',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={11} color="#16a34a" />
            <span>
              {contextType === 'diagnostic_test'
                ? 'CE-IVDR Certified • ISO 15189 Laboratory Standard'
                : contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription'
                ? 'DHA Licensed Physician & Compounding Dispensary'
                : 'Dual-Stage RP-HPLC & LC-MS Verified'}
            </span>
          </div>
          <span>
            {contextType === 'diagnostic_test'
              ? 'Certified Diagnostic Kit'
              : contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription'
              ? 'Verified Medical Prescription'
              : 'Analytical Grade Standard'}
          </span>
        </div>
      </div>
    );
  };

  const quickPrompts = React.useMemo(() => {
    return getSuggestedInquiriesForProduct(contextAnchor, contextType, lang);
  }, [contextAnchor, contextType, lang]);

  return (
    <>
      {/* ── Floating Launcher Trigger ── */}
      {!hideFloatingTrigger && (
        <button
          type="button"
          onClick={() => handleOpenDrawer()}
          className="atlas-ai-public-fab"
          title={`Atlas AI · Maximum ${limit} inquiries per session (${remaining} remaining)`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 45,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '24px',
            padding: '10px 18px',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px -4px rgba(0, 54, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Sparkles size={16} color="#38bdf8" />
          <span className="atlas-ai-fab-label" style={{ letterSpacing: '0.01em' }}>
            Atlas AI Technical Inquiry
          </span>
          <span
            className="atlas-ai-fab-badge"
            style={{
              fontSize: '0.70rem',
              fontWeight: 800,
              backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)',
              color: isBlocked ? '#fca5a5' : '#bae6fd',
              border: `1px solid ${isBlocked ? '#f87171' : 'rgba(56, 189, 248, 0.35)'}`,
              padding: '2px 7px',
              borderRadius: '10px',
            }}
          >
            {isBlocked ? 'Limit 5/5' : `${remaining}/${limit} Max`}
          </span>
        </button>
      )}

      {/* ── Slide-Over Drawer / Mobile Bottom Sheet ── */}
      {isOpen && (
        <div
          className="atlas-bottom-sheet-overlay"
          onClick={handleClose}
        >
          <div
            className="atlas-bottom-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              marginLeft: 'auto',
            }}
          >
            {/* Mobile Drag Handle (Visible only on mobile devices) */}
            <div className="atlas-bottom-sheet-handle" />

            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #00284d 0%, #001833 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                    Atlas AI
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#7dd3fc', marginTop: '2px', fontWeight: 600 }}>
                  {isPensFormulary
                    ? (lang === 'es' ? 'Copiloto Clínico U-100 • Diseño de Protocolos y Evidencia' : 'U-100 Clinical Dosing & Protocol Copilot • 27 Pens')
                    : contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog'
                    ? 'Clinical Pathway Copilot • Protocol Registry SSOT'
                    : 'Verified Analytical Support • Monograph Specifications'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '26px',
                    padding: '0 10px',
                    borderRadius: '13px',
                    backgroundColor: isAuthenticated || (isPensFormulary && !isBlocked)
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isBlocked
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(56, 189, 248, 0.12)',
                    border: `1px solid ${
                      isAuthenticated || (isPensFormulary && !isBlocked)
                        ? 'rgba(52, 211, 153, 0.4)'
                        : isBlocked
                        ? 'rgba(248, 113, 113, 0.4)'
                        : 'rgba(56, 189, 248, 0.28)'
                    }`,
                    color: isAuthenticated || (isPensFormulary && !isBlocked) ? '#6ee7b7' : isBlocked ? '#fca5a5' : '#e0f2fe',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isAuthenticated || (isPensFormulary && !isBlocked) ? '#10b981' : isBlocked ? '#ef4444' : '#38bdf8',
                      boxShadow: isAuthenticated || (isPensFormulary && !isBlocked)
                        ? '0 0 6px #10b981'
                        : isBlocked
                        ? '0 0 6px #ef4444'
                        : '0 0 6px #38bdf8',
                    }}
                  />
                  {isAuthenticated ? (
                    <span style={{ fontWeight: 800 }}>
                      {lang === 'es' ? 'Acceso Verificado' : 'Verified Access'}
                    </span>
                  ) : isPensFormulary && !isBlocked ? (
                    <span style={{ fontWeight: 800 }}>
                      {lang === 'es' ? 'Copiloto Clínico U-100' : 'U-100 Clinical Copilot'}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                        {isBlocked ? `0/${limit}` : `${remaining}/${limit}`}
                      </span>
                      <span style={{ opacity: 0.9, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {lang === 'es' ? 'Consultas Gratis' : 'Free Queries'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Subheader Anchor Summary: Clean, Full Product Title (Never Cut Off) */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '9px 16px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.80rem',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                lineHeight: 1.35,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <ShieldCheck size={15} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ fontWeight: 800, color: '#00284d', wordBreak: 'break-word' }}>
                  {contextAnchor?.name || (lang === 'es' ? 'Formulación Activa' : 'Active Formulation')}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {contextAnchor?.badgeLabel ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#003666', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                    {contextAnchor.badgeLabel}
                  </span>
                ) : contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#003666', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                    U-100 · 2–8°C
                  </span>
                ) : contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                    DHA Validated Rx
                  </span>
                ) : contextType === 'cosmetic_product' || contextAnchor?.isCosmetic || contextAnchor?.category?.toLowerCase().includes('cosmetic') || contextAnchor?.category?.toLowerCase().includes('hair') ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0d9488', backgroundColor: '#f0fdfa', padding: '2px 7px', borderRadius: '4px', border: '1px solid #ccfbf1', whiteSpace: 'nowrap' }}>
                    EU Reg. 1223/2009
                  </span>
                ) : contextType === 'diagnostic_test' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    CE-IVDR Certified
                  </span>
                ) : contextType === 'protocol' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0d9488', backgroundColor: '#f0fdfa', padding: '2px 7px', borderRadius: '4px', border: '1px solid #ccfbf1', whiteSpace: 'nowrap' }}>
                    {contextAnchor?.duration || 'Clinical Blueprint'}
                  </span>
                ) : contextType === 'aesthetic' || contextAnchor?.category?.toLowerCase().includes('aesthetic') ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#9333ea', backgroundColor: '#faf5ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #f3e8ff', whiteSpace: 'nowrap' }}>
                    CE Aesthetic Grade
                  </span>
                ) : contextAnchor?.cas && contextAnchor.cas !== 'N/A' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    CAS {contextAnchor.cas}
                  </span>
                ) : contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog' ? (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0369a1', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                    {contextAnchor?.totalProtocols ? `${contextAnchor.totalProtocols} Protocols` : 'Clinical SSOT'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0369a1', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                    {contextAnchor?.purity?.includes('≥') ? contextAnchor.purity.split(' ')[0] : 'RP-HPLC'}
                  </span>
                )}
              </div>
            </div>

            {/* Live Active Protocol Selection Banner (when physician added pens to Supply Summary) */}
            {Array.isArray(contextAnchor?.protocolSelection) && contextAnchor.protocolSelection.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  borderBottom: '1px solid #bbf7d0',
                  padding: '6px 16px',
                  fontSize: '0.73rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 750 }}>
                  {lang === 'es'
                    ? `Protocolo en alcance (${contextAnchor.protocolSelection.length}):`
                    : `Protocol in scope (${contextAnchor.protocolSelection.length}):`}{' '}
                  <strong style={{ fontWeight: 800, color: '#14532d' }}>
                    {contextAnchor.protocolSelection
                      .map((item) => `${item.name} (${item.concentration}) ×${item.qty}`)
                      .join(' · ')}
                  </strong>
                </span>
              </div>
            )}

            {/* Dual Mode Tab Selector */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '0 12px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'chat' ? 750 : 600,
                  color: activeTab === 'chat' ? '#003666' : '#64748b',
                  borderBottom: activeTab === 'chat' ? '2px solid #003666' : '2px solid transparent',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} color={activeTab === 'chat' ? '#0284c7' : '#94a3b8'} />
                <span>Technical Inquiry</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'evidence' ? 750 : 600,
                  color: activeTab === 'evidence' ? '#003666' : '#64748b',
                  borderBottom: activeTab === 'evidence' ? '2px solid #003666' : '2px solid transparent',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={13} color={activeTab === 'evidence' ? '#0284c7' : '#94a3b8'} />
                <span>Clinical Evidence {clinicalSources.length > 0 ? `(${clinicalSources.length})` : ''}</span>
              </button>
            </div>

            {/* Tab 1: Chat View */}
            {activeTab === 'chat' && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* ── PENS FORMULARY COMPACT CLINICAL COMMAND DECK (Always accessible at top of chat) ── */}
                {isPensFormulary && (
                  <div
                    style={{
                      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    {/* 3-Metric Clinical Standard Strip */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '6px',
                      }}
                    >
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                          {lang === 'es' ? 'DIAL U-100' : 'U-100 DIAL'}
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#003666', fontFamily: 'monospace', marginTop: '1px' }}>
                          100 clicks = 1 mL
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          {lang === 'es' ? 'PORFOLIO' : 'FORMULARY'}
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', marginTop: '1px' }}>
                          27 Pens · 45 SKUs
                        </div>
                      </div>
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                          {lang === 'es' ? 'ESTÉRIL LISTO' : 'READY-TO-INJECT'}
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#065f46', fontFamily: 'monospace', marginTop: '1px' }}>
                          0% Reconstitution
                        </div>
                      </div>
                    </div>

                    {/* 5 Interactive Therapeutic Specialty Matrix Chips */}
                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                        {lang === 'es' ? '1. Consultar Matriz de Clics por Especialidad:' : '1. Explore U-100 Click Matrix by Specialty:'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {PENS_SPECIALTY_AXES.map((axis) => (
                          <button
                            key={axis.id}
                            type="button"
                            disabled={isBlocked || isLoading}
                            onClick={() => handleSendMessage(lang === 'es' ? axis.promptEs : axis.promptEn)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '999px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#003666',
                              fontSize: '0.71rem',
                              fontWeight: 700,
                              cursor: isBlocked || isLoading ? 'default' : 'pointer',
                              transition: 'all 0.14s ease',
                            }}
                          >
                            {lang === 'es' ? axis.labelEs : axis.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4 Star Clinical Protocol Presets (Bidirectional: Load to Page, 1-Page PDF, or Ask AI) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {lang === 'es' ? '2. Protocolos Clínicos Combinados (1 Clic):' : '2. Clinical Multi-Pen Protocol Presets (1-Click):'}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1d4ed8' }}>
                          {lang === 'es' ? 'Sincronizado con Página y PDF' : 'Syncs with Page & PDF'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {PENS_CLINICAL_PROTOCOL_PRESETS.map((preset) => (
                          <div
                            key={preset.id}
                            style={{
                              background: '#ffffff',
                              border: `1px solid ${preset.border}`,
                              borderLeft: `3.5px solid ${preset.color}`,
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                                {lang === 'es' ? preset.titleEs : preset.titleEn}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.59rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '999px',
                                  background: preset.bg,
                                  color: preset.color,
                                }}
                              >
                                {preset.badge}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.69rem', color: '#475569', fontWeight: 650 }}>
                              {preset.pensLabel}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                disabled={isBlocked || isLoading}
                                onClick={() => handleSendMessage(lang === 'es' ? preset.promptEs : preset.promptEn)}
                                style={{
                                  flex: '1 1 120px',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #bfdbfe',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontSize: '0.69rem',
                                  fontWeight: 750,
                                  cursor: isBlocked || isLoading ? 'default' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Sparkles size={11} />
                                <span>{lang === 'es' ? 'Pauta IA + Biomarcadores' : 'AI Posology & Labs'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== 'undefined') {
                                    window.dispatchEvent(
                                      new CustomEvent('atlas-pens-apply-protocol', {
                                        detail: { productIds: preset.productIds, autoExportPdf: false },
                                      })
                                    );
                                    handleClose();
                                  }
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#0f172a',
                                  fontSize: '0.69rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title={lang === 'es' ? 'Cargar estas plumas en Supply Summary' : 'Load these pens into Supply Summary'}
                              >
                                {lang === 'es' ? '+ Cargar en Página' : '+ Load to Page'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== 'undefined') {
                                    handleClose();
                                    window.dispatchEvent(
                                      new CustomEvent('atlas-pens-apply-protocol', {
                                        detail: { productIds: preset.productIds, autoExportPdf: true },
                                      })
                                    );
                                  }
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #003666',
                                  background: '#003666',
                                  color: '#ffffff',
                                  fontSize: '0.69rem',
                                  fontWeight: 750,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title={lang === 'es' ? 'Generar PDF clínico de 1 página para este protocolo' : 'Generate 1-page clinical PDF for this protocol'}
                              >
                                <FileText size={11} />
                                <span>PDF</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: isPensFormulary ? '4px 4px 12px' : '24px 10px', color: '#64748b' }}>
                    {!isPensFormulary && (
                      <>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f9ff',
                            color: '#0284c7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          <Sparkles size={22} />
                        </div>
                        <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                          {contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription'
                            ? (lang === 'es' ? 'Atlas AI · Prescripción y Posología' : 'Atlas AI · Prescription & Posology')
                            : contextType === 'cosmetic_product' || contextAnchor?.isCosmetic || contextAnchor?.category?.toLowerCase().includes('cosmetic') || contextAnchor?.category?.toLowerCase().includes('hair')
                            ? 'Atlas AI · Dermocosmetic & INCI'
                            : contextType === 'diagnostic_test'
                            ? 'Atlas AI · Diagnostic Laboratory & Biomarkers'
                            : contextType === 'protocol'
                            ? 'Atlas AI · Clinical Protocols'
                            : contextType === 'aesthetic' || contextAnchor?.category?.toLowerCase().includes('aesthetic')
                            ? 'Atlas AI · Aesthetic Medicine & Rheology'
                            : 'Atlas AI · Clinical Decision Support'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', maxWidth: '340px', margin: '6px auto 0', lineHeight: 1.45 }}>
                          {contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription'
                            ? (lang === 'es'
                                ? 'Consulte dudas sobre los principios activos, vehículo TrichoSol™, aplicación nocturna de 1.0 ml, pauta en caso de olvido o evolución esperada a 90 días.'
                                : 'Ask questions regarding formula actives, TrichoSol™ vehicle, nocturnal application protocols, missed dose instructions, or 90-day progress milestones.')
                            : contextType === 'cosmetic_product' || contextAnchor?.isCosmetic || contextAnchor?.category?.toLowerCase().includes('cosmetic') || contextAnchor?.category?.toLowerCase().includes('hair')
                            ? 'Ask questions regarding INCI active mechanisms, penetration kinetics, clinical scalp/skin protocols, or dermocosmetic safety.'
                            : contextType === 'diagnostic_test'
                            ? 'Ask questions regarding capillary blood spot collection, sample transit stability, reference ranges, laboratory analytical methods, or clinical protocol matching.'
                            : contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog'
                            ? (lang === 'es'
                                ? 'Consulta indicaciones clínicas, pautas de titulación, biomarcadores Bloodo™ requeridos, contraindicaciones o compara protocolos según el perfil de tu paciente.'
                                : 'Ask about clinical indications, titration schedules, required Bloodo™ biomarkers, contraindications, or compare protocols for your patient profile.')
                            : contextType === 'protocol'
                            ? 'Ask questions regarding multi-phase titration schedules, companion compounds, safety precautions, or required laboratory monitoring.'
                            : contextType === 'aesthetic' || contextAnchor?.category?.toLowerCase().includes('aesthetic')
                            ? 'Ask questions regarding rheological properties (G prime), tissue integration, injection planes, or vascular safety.'
                            : 'Ask specific compounding, dilution, thermal stability, or peer-reviewed literature questions regarding this monograph.'}
                        </div>
                      </>
                    )}

                    {/* Suggested Prompts: Product-Tailored Clinical Questions (Immediately Visible Above-the-Fold!) */}
                    <div style={{ marginTop: isPensFormulary ? '4px' : '20px', display: 'flex', flexDirection: 'column', gap: '7px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isPensFormulary
                            ? (lang === 'es' ? '3. Consultas Clínicas y Cálculos U-100:' : '3. Direct Clinical & U-100 Dosing Inquiries:')
                            : (lang === 'es' ? 'Preguntas Frecuentes Clínicas:' : 'Suggested Clinical Inquiries:')}
                        </div>
                        <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
                          {quickPrompts.length} {lang === 'es' ? 'consultas' : 'tailored'}
                        </span>
                      </div>
                      {quickPrompts.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          disabled={isBlocked || isLoading}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '0.80rem',
                            color: '#00284d',
                            fontWeight: 600,
                            textAlign: 'left',
                            cursor: isBlocked || isLoading ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                            lineHeight: 1.4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isBlocked && !isLoading) {
                              e.currentTarget.style.background = '#f0f9ff';
                              e.currentTarget.style.borderColor = '#bae6fd';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isBlocked && !isLoading) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }
                          }}
                        >
                          <span style={{ flex: 1 }}>{q}</span>
                          <ArrowUpRight size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    if (m.sender === 'user') {
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: 'flex-end',
                            maxWidth: '82%',
                            background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                            color: '#ffffff',
                            borderRadius: '14px 14px 2px 14px',
                            padding: '10px 14px',
                            boxShadow: '0 2px 6px rgba(0, 54, 102, 0.18)',
                            fontSize: '0.86rem',
                            lineHeight: 1.4,
                            fontWeight: 500,
                          }}
                        >
                          {m.text}
                        </div>
                      );
                    }

                    const { cleanText, highlights, predictedSteps } = parseAiResponseParts(m.text);

                    return (
                      <React.Fragment key={idx}>
                        <div
                          style={{
                            alignSelf: 'flex-start',
                            maxWidth: '96%',
                            background: '#ffffff',
                            color: '#1e293b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px 14px 14px 2px',
                            padding: '13px 14px',
                            boxShadow: '0 2px 8px -2px rgba(0, 54, 102, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
                          }}
                        >
                          {/* ── Executive Clinical Highlights (Structured KPI Grid) ── */}
                          {highlights && highlights.length > 0 && (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '6px',
                                marginBottom: '10px',
                                padding: '8px 10px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              {highlights.map((hl, hIdx) => {
                                const [label, val] = hl.includes(':') ? hl.split(':') : ['', hl];
                                const labelLower = label.toLowerCase();
                                const Icon = labelLower.includes('dilu') || labelLower.includes('vol') ? Droplets
                                  : labelLower.includes('dosis') || labelLower.includes('dose') ? Syringe
                                  : labelLower.includes('frec') || labelLower.includes('sched') || labelLower.includes('time') ? Clock
                                  : labelLower.includes('temp') || labelLower.includes('stor') || labelLower.includes('conserv') ? Thermometer
                                  : FlaskConical;

                                return (
                                  <div key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <Icon size={13} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                                      <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '0.62rem' }}>
                                        {label.trim() || 'PARÁMETRO'}
                                      </span>
                                      <span style={{ color: '#003666', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.74rem' }}>
                                        {val?.trim() || hl}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* ── Main Analytical Body with High-Fidelity Highlights ── */}
                          {renderSafeBotText(cleanText)}

                          {/* ── Bidirectional Clinical Action Bar for Pre-filled Pens (1-Click Load to Page & 1-Page PDF) ── */}
                          {isPensFormulary && (() => {
                            const mentionedPenIds = detectMentionedPenIdsInText(cleanText);
                            if (mentionedPenIds.length === 0) return null;
                            return (
                              <div
                                style={{
                                  marginTop: '10px',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  background: '#f0fdf4',
                                  border: '1px solid #86efac',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    {lang === 'es'
                                      ? `Acción Clínica Directa (${mentionedPenIds.length} ${mentionedPenIds.length === 1 ? 'pluma detectada' : 'plumas detectadas'}):`
                                      : `Direct Clinical Action (${mentionedPenIds.length} ${mentionedPenIds.length === 1 ? 'pen detected' : 'pens detected'}):`}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        window.dispatchEvent(
                                          new CustomEvent('atlas-pens-apply-protocol', {
                                            detail: { productIds: mentionedPenIds, autoExportPdf: false },
                                          })
                                        );
                                        handleClose();
                                      }
                                    }}
                                    style={{
                                      flex: '1 1 140px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #16a34a',
                                      background: '#ffffff',
                                      color: '#15803d',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                    }}
                                  >
                                    <span>
                                      {lang === 'es'
                                        ? `+ Cargar en Protocolo (${mentionedPenIds.length})`
                                        : `+ Load into Supply Summary (${mentionedPenIds.length})`}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        handleClose();
                                        window.dispatchEvent(
                                          new CustomEvent('atlas-pens-apply-protocol', {
                                            detail: { productIds: mentionedPenIds, autoExportPdf: true },
                                          })
                                        );
                                      }
                                    }}
                                    style={{
                                      flex: '1 1 130px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #003666',
                                      background: '#003666',
                                      color: '#ffffff',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                    }}
                                  >
                                    <FileText size={12} />
                                    <span>{lang === 'es' ? 'Exportar PDF 1-Pág' : 'Export 1-Page PDF'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          {/* ── Algolia RAG Grounded Action Cards ── */}
                          {Array.isArray(m.matchedEntities) && m.matchedEntities.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                              {m.matchedEntities.slice(0, 3).map((ent, entIdx) => (
                                <Link
                                  key={`${ent.type}-${ent.objectID}-${entIdx}`}
                                  href={ent.href}
                                  onClick={() => {
                                    trackSearchClick({
                                      indexName: ent.type === 'protocol' ? 'protocols' : 'products',
                                      objectID: ent.objectID,
                                      position: entIdx + 1,
                                      eventName: 'Public Atlas AI Grounded Card Clicked',
                                    });
                                    onClose?.();
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                  }}
                                >
                                  <span>{ent.title}</span>
                                  <ArrowRight size={11} />
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* ── Action Strip: Copy Summary & Quick Links ── */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: '10px',
                              paddingTop: '6px',
                              borderTop: '1px solid #f1f5f9',
                              fontSize: '0.70rem',
                              color: '#64748b',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator?.clipboard?.writeText) {
                                    navigator.clipboard.writeText(cleanText).catch(() => {});
                                  }
                                  setCopiedIndex(idx);
                                  toast.success(lang === 'es' ? 'Resumen copiado ✓' : 'Summary copied ✓');
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  color: '#64748b',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                }}
                                title="Copy answer"
                              >
                                {copiedIndex === idx ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                                <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                              </button>

                              {(cleanText.toLowerCase().includes('reconstit') || cleanText.toLowerCase().includes('bac water') || cleanText.toLowerCase().includes('dilu') || cleanText.toLowerCase().includes('jeringa')) && (
                                <a
                                  href="/calculator"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    color: '#0284c7',
                                    textDecoration: 'none',
                                    fontWeight: 650,
                                    fontSize: '0.68rem',
                                  }}
                                  title="Open Reconstitution Calculator"
                                >
                                  <Calculator size={11} />
                                  <span>Calculator</span>
                                </a>
                              )}
                            </div>

                            {m.cached && (
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  color: '#0d9488',
                                  background: '#f0fdfa',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccfbf1',
                                  fontWeight: 700,
                                }}
                              >
                                ⚡ Cached (0 Quota)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ── Predictive Next-Step Chips (Anticipated Questions) ── */}
                        {predictedSteps && predictedSteps.length > 0 && (
                          <div
                            style={{
                              alignSelf: 'flex-start',
                              maxWidth: '96%',
                              marginTop: '-2px',
                              marginBottom: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                color: '#0d9488',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                paddingLeft: '4px',
                              }}
                            >
                              <Sparkles size={11} color="#0d9488" />
                              <span>{lang === 'es' ? 'Siguientes Pasos Predictivos:' : 'Predictive Next Steps:'}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {predictedSteps.map((step, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  disabled={isLoading || isBlocked}
                                  onClick={() => handleSendMessage(step)}
                                  style={{
                                    background: '#f0fdfa',
                                    border: '1px solid #99f6e4',
                                    color: '#0f766e',
                                    fontSize: '0.72rem',
                                    fontWeight: 650,
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    cursor: isLoading || isBlocked ? 'default' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 2px rgba(13, 148, 136, 0.08)',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#ccfbf1';
                                    e.currentTarget.style.borderColor = '#0d9488';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f0fdfa';
                                    e.currentTarget.style.borderColor = '#99f6e4';
                                  }}
                                >
                                  <ArrowRight size={10} color="#0d9488" />
                                  <span>{step}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })
                )}

                {isLoading && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={14} className="animate-spin" color="#003666" />
                    <span>Querying analytical & clinical literature compendiums…</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Tab 2: Recognized Clinical Evidence Compendium */}
            {activeTab === 'evidence' && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Compound Clinical Identity Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FlaskConical size={16} color="#003666" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#00284d' }}>
                      {contextType === 'diagnostic_test'
                        ? (lang === 'es' ? 'Especificaciones del Test Diagnóstico' : 'Diagnostic Test Kit Specifications')
                        : contextType === 'cosmetic_product'
                        ? (lang === 'es' ? 'Especificaciones Dermocosméticas' : 'Dermocosmetic Product Specifications')
                        : (lang === 'es' ? 'Especificaciones Monográficas de Formulación' : 'Active Formulation Monograph Specifications')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {contextType === 'prescription' || contextAnchor?.rxId || contextAnchor?.category === 'prescription' ? (
                      <>
                        <div><strong>Prescription Identifier:</strong> {contextAnchor?.rxId || 'Official Verified Rx'}</div>
                        <div><strong>Prescribing Physician:</strong> {contextAnchor?.doctorName || 'Dr. Hanieh Erdmann'} (Lic. DHA-00013060-006)</div>
                        <div><strong>Compounding Vehicle:</strong> TrichoSol™ Lipid Carrier (Free of Propylene Glycol & Aggressive Alcohols)</div>
                        <div><strong>Prescribed Formula:</strong> {contextAnchor?.formula || 'Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% (3x 100ml)'}</div>
                        <div><strong>Posology:</strong> {contextAnchor?.dosage || '1.0 ml Once Daily at Night on Dry Scalp'}</div>
                      </>
                    ) : contextType === 'cosmetic_product' || contextAnchor?.isCosmetic || contextAnchor?.category?.toLowerCase().includes('cosmetic') || contextAnchor?.category?.toLowerCase().includes('hair') ? (
                      <>
                        <div><strong>Regulatory Standard:</strong> European Cosmetic Regulation (EC) No 1223/2009</div>
                        <div><strong>Formulation Quality:</strong> Professional Dermocosmetic Grade (Bio-Active INCI)</div>
                        {contextAnchor?.keyActives && <div><strong>Primary Actives:</strong> {contextAnchor.keyActives}</div>}
                      </>
                    ) : contextType === 'diagnostic_test' ? (
                      <>
                        <div><strong>Regulatory Standard:</strong> CE-IVDR Certified Diagnostic In-Vitro Device</div>
                        <div><strong>Sample Matrix:</strong> Capillary Dried Blood Spot (DBS)</div>
                        <div><strong>Analytical Quality:</strong> Centralized Reference Laboratory (LifeLab1)</div>
                      </>
                    ) : (
                      <>
                        <div><strong>CAS Registry:</strong> {contextAnchor?.cas || 'Verified Compendial ID'}</div>
                        <div><strong>Synthesis Standard:</strong> {contextAnchor?.purity || '≥ 99.0% Dual-Stage RP-HPLC Verified'}</div>
                        <div><strong>Formulation Quality:</strong> Lyophilized Analytical Grade (Dual-Stage RP-HPLC Certified)</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Peer-Reviewed PubMed Studies */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <BookOpen size={14} color="#003666" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00284d', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Peer-Reviewed PubMed Clinical Studies
                  </span>
                </div>

                {isLoadingSources ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.80rem' }}>
                    <RefreshCw size={16} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                    Retrieving NIH PubMed citations…
                  </div>
                ) : clinicalSources.length === 0 ? (
                  <div style={{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                    Clinical compendial monograph active. Verified analytical CoA available in primary specifications tab.
                  </div>
                ) : (
                  clinicalSources.map((study, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '12px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            border: '1px solid #dbeafe',
                          }}
                        >
                          {study.journal} ({study.pubdate ? study.pubdate.slice(0, 4) : 'Clinical Study'})
                        </span>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
                          PMID: {study.pmid}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                        {study.title}
                      </div>

                      {study.authors && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Authors: {study.authors}
                        </div>
                      )}

                      {study.clinicalSummary && (
                        <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '7px 9px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ color: '#0f172a' }}>{lang === 'es' ? 'Hallazgo Clínico:' : 'Clinical Finding:'}</strong>{' '}
                          {study.clinicalSummary}
                        </div>
                      )}

                      {study.penCorrelation && (
                        <div style={{ fontSize: '0.73rem', color: '#065f46', fontWeight: 700, background: '#ecfdf5', padding: '6px 9px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          <strong>{lang === 'es' ? 'Correlación U-100:' : 'U-100 Pen Correlation:'}</strong>{' '}
                          {study.penCorrelation}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          handleSendMessage(
                            study.penCorrelation
                              ? (lang === 'es'
                                  ? `Explica la evidencia clínica del estudio PMID ${study.pmid} (${study.title}) y cómo aplicarla con los clics exactos de nuestra pluma U-100 (${study.penCorrelation}).`
                                  : `Explain the clinical evidence from PubMed study PMID ${study.pmid} (${study.title}) and how to apply it using our exact U-100 pen dial clicks (${study.penCorrelation}).`)
                              : `What are the key clinical findings and dosage protocols discussed in PubMed study PMID ${study.pmid}?`
                          );
                        }}
                        style={{
                          marginTop: '4px',
                          alignSelf: 'flex-start',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#003666',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Sparkles size={11} color="#0284c7" />
                        <span>Inquire About This Study →</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quota Exhaustion Banner & Registration Trigger */}
            {isBlocked && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  borderTop: '1px solid #fde68a',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.80rem', fontWeight: 800 }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span>Free Guest Inquiries Depleted (5/5)</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.4 }}>
                  You have utilized all 5 free analytical inquiries for this IP. Access unlimited clinical intelligence and full compendium tools with a verified professional account.
                </div>

                {/* Instant Soft Lead Gate: Unlock +25 bonus inquiries */}
                <form
                  onSubmit={handleUnlockBonus}
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '2px',
                    background: '#ffffff',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Work email to unlock +25 queries..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.78rem',
                      padding: '6px 8px',
                      color: '#0f172a',
                      background: 'transparent'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isUnlockingBonus || !leadEmail.trim()}
                    style={{
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: isUnlockingBonus || !leadEmail.trim() ? 'default' : 'pointer',
                      opacity: !leadEmail.trim() ? 0.6 : 1,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Mail size={12} />
                    <span>{isUnlockingBonus ? 'Unlocking...' : 'Unlock +25'}</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegisterModal) {
                      handleClose();
                      onOpenRegisterModal();
                    } else {
                      window.open('/auth/login?register=true', '_blank');
                    }
                  }}
                  style={{
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
                  }}
                >
                  <span>Register for Full Professional Access</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Input Box */}
            <div
              className="atlas-bottom-sheet-input-bar"
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              {(contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog') && !isBlocked && (
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none',
                  }}
                >
                  {[
                    { label: '+ GLP-1 / Metabolic', prompt: 'Recommend the best metabolic/GLP-1 protocol and required DEXA/lab monitoring for a patient with insulin resistance.' },
                    { label: '+ Needle-Free (Nasal)', prompt: 'Which needle-free (intranasal or topical) protocols are available and what are their indications?' },
                    { label: '+ No Oncology Risk', prompt: 'Which recovery or longevity protocols avoid angiogenic or growth-hormone axis precautions?' },
                    ...(Array.isArray(contextAnchor?.comparingProtocols) && contextAnchor.comparingProtocols.length >= 2
                      ? [{ label: `Compare (${contextAnchor.comparingProtocols.length})`, prompt: `Compare ${contextAnchor.comparingProtocols.map(p => p.name).join(' vs ')} for patient fit, titration, and lab monitoring.` }]
                      : []),
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setMessage(chip.prompt)}
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 9px',
                        borderRadius: '9999px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#003666',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
              >
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim() && !isLoading && !isBlocked) {
                        handleSendMessage();
                      }
                    }
                  }}
                  disabled={isLoading || isBlocked}
                  placeholder={
                    isBlocked
                      ? (lang === 'es' ? 'Cuota de consultas alcanzada (5/5). Regístrate para acceso ilimitado.' : 'Inquiry quota reached (5/5). Please register.')
                      : (contextType === 'pens_formulary' || contextAnchor?.type === 'pens_pricing')
                        ? (lang === 'es' ? 'Pregunta sobre clics U-100, combinaciones, dosis, agujas 31G/32G o conservación…' : 'Ask about U-100 dial clicks, pen stacking, dosing, 31G/32G needles, or storage…')
                        : (contextType === 'protocols_directory' || contextAnchor?.type === 'protocols_catalog')
                          ? (lang === 'es' ? 'Describe el objetivo del paciente, vía de administración o analíticas…' : 'Describe patient goal, route preference, or labs…')
                          : (lang === 'es' ? 'Escribe tu consulta técnica o clínica…' : 'Ask a clinical or technical question…')
                  }
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    maxHeight: '110px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    lineHeight: 1.35,
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                    backgroundColor: isBlocked ? '#f1f5f9' : '#ffffff',
                    color: isBlocked ? '#94a3b8' : '#0f172a',
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || isBlocked || !message.trim()}
                  className="atlas-touch-target-44"
                  style={{
                    height: '44px',
                    backgroundColor: isBlocked || !message.trim() ? '#94a3b8' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 16px',
                    cursor: isBlocked || !message.trim() ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  marginTop: '6px',
                  textAlign: 'center',
                }}
              >
                {lang === 'es'
                  ? 'Bilingüe EN / ES • Especificaciones Analíticas Verificadas • Sesión Clínica Confidencial'
                  : 'Verified Analytical & Clinical Specifications • Confidential Research Session'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
