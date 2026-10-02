"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FlaskConical, 
  Clock, 
  Calendar, 
  Syringe, 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  Copy, 
  Printer, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Info,
  Layers,
  Thermometer,
  RotateCcw,
  Plus,
  Lock,
  ExternalLink,
  X
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { resolveVialSizeMg } from '@/utils/supplyMath';
import { calculateReconstitution, calculateProtocolProcurement } from './monographCalculationEngine';
import { matchClinicalBenchmark, CLINICAL_BENCHMARKS } from '@/utils/clinicalDosingEngine';

/**
 * Built-in canonical protocol definitions for PT-141 & Peptide compounds
 */
const CANONICAL_PT141_PROTOCOLS = Object.freeze([
  {
    id: 'proto-pt141-ondemand',
    slug: 'pt-141-on-demand-libido',
    name: 'On-Demand Libido Enhancement',
    durationWeeks: 4,
    difficulty: 'Beginner',
    category: 'Sexual Health',
    objective: 'Acute, on-demand activation of hypothalamic melanocortin receptors (MC3R/MC4R) to enhance desire and physiological arousal prior to intimacy.',
    route: 'Subcutaneous',
    defaultDoseMg: 1.25,
    defaultDosesPerWeek: 2,
    frequencyDescription: 'As needed (1.25 mg, 45–60 minutes prior to anticipated activity, maximum 2 administrations per week)',
    phases: [
      {
        phaseIndex: 1,
        title: 'Phase 1: On-Demand Arousal Titration',
        weeks: 'Weeks 1–4',
        doseMg: 1.25,
        frequency: '1–2× per week PRN (max 2×/wk)'
      }
    ]
  },
  {
    id: 'proto-pt141-libido-arousal',
    slug: 'pt-141-hsdd-titration',
    name: 'Libido & Arousal Conditioning',
    durationWeeks: 4,
    difficulty: 'Intermediate',
    category: 'Sexual Health & Endocrinology',
    objective: 'Structured bi-weekly protocol for HSDD in premenopausal women and PDE5-refractory erectile dysfunction in men, establishing receptor responsiveness.',
    route: 'Subcutaneous',
    defaultDoseMg: 1.5,
    defaultDosesPerWeek: 2,
    frequencyDescription: 'Bi-weekly scheduled dose (1.50 mg administered every 72–96 hours, max 8 doses per month)',
    phases: [
      {
        phaseIndex: 1,
        title: 'Phase 1: Receptor Conditioning',
        weeks: 'Weeks 1–4',
        doseMg: 1.5,
        frequency: '2× per week (every 72–96h)'
      }
    ]
  },
  {
    id: 'proto-pt141-sexual-health-12w',
    slug: 'pt-141-sexual-health-extended',
    name: 'Sexual Health Protocol (Extended)',
    durationWeeks: 12,
    difficulty: 'Comprehensive',
    category: 'Comprehensive Sexual Health',
    objective: 'Multi-phase 12-week clinical program combining low-dose tolerance titration with ongoing maintenance for chronic hypoactive sexual desire.',
    route: 'Subcutaneous',
    defaultDoseMg: 1.25,
    defaultDosesPerWeek: 2,
    frequencyDescription: 'Phase 1 initiation at 1.0 mg, followed by 1.25 mg maintenance (max 2 doses/week)',
    phases: [
      {
        phaseIndex: 1,
        title: 'Phase 1: Tolerance & Titration',
        weeks: 'Weeks 1–4',
        doseMg: 1.0,
        frequency: '1–2× per week PRN'
      },
      {
        phaseIndex: 2,
        title: 'Phase 2: Active Maintenance',
        weeks: 'Weeks 5–8',
        doseMg: 1.25,
        frequency: '2× per week PRN'
      },
      {
        phaseIndex: 3,
        title: 'Phase 3: Long-Term Consolidation',
        weeks: 'Weeks 9–12',
        doseMg: 1.25,
        frequency: '1–2× per week PRN'
      }
    ]
  }
]);

function sanitizeProtocolTitle(rawName = '', canonicalCompound = '') {
  if (!rawName) return 'Clinical Protocol';
  let cleaned = String(rawName).trim();
  // Strip parenthetical generics anywhere in first 40 chars, e.g. "(Bremelanotide)"
  cleaned = cleaned.replace(/^([^\(]*)\([^)]*\)\s*[-—:]?\s*/i, '$1').trim();
  // Strip compound names
  cleaned = cleaned.replace(/^(PT[- ]?141|Bremelanotide|Semaglutide|Tirzepatide|GHK[- ]?Cu|BPC[- ]?157|TB[- ]?500|Ipamorelin|CJC[- ]?1295|Epitalon|NAD\+?|Tesamorelin|Retatrutide)\s*[-—:]?\s*/i, '').trim();
  if (canonicalCompound) {
    const escaped = canonicalCompound.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp('^' + escaped + '\\s*[-—:]?\\s*', 'i'), '').trim();
  }
  cleaned = cleaned.replace(/^[-—:\s]+/, '').trim();
  return cleaned || rawName;
}

export function buildCanonicalCompoundProtocols(canonicalName = 'PT-141') {
  const bm = matchClinicalBenchmark(canonicalName);
  const name = bm?.canonicalName || canonicalName || 'Peptide';
  const isPt141 = name.toLowerCase().includes('pt-141') || name.toLowerCase().includes('bremelanotide');
  if (isPt141) return CANONICAL_PT141_PROTOCOLS;

  const unit = bm?.unit || 'mg';
  const steps = bm?.steps || [2.5, 5.0, 7.5];
  const cadence = bm?.cadence || 'Once weekly';
  const shortCadence = bm?.shortCadence || '1x/wk';
  const timesPerWeek = bm?.timesPerWeek || 1;
  const route = bm?.route || 'Subcutaneous';
  const isWeekly = timesPerWeek === 1;

  const stepMg = (st) => (unit === 'mcg' && st >= 100 ? st / 1000 : st);
  const initialDose = stepMg(steps[0]);
  const midDose = stepMg(steps[Math.min(1, steps.length - 1)]);
  const maxDose = stepMg(steps[steps.length - 1]);

  const proto1Weeks = steps.length * 4;
  const proto1Phases = steps.map((st, i) => ({
    phaseIndex: i + 1,
    title: i === 0
      ? 'Phase 1: Induction & Tolerance'
      : (i === steps.length - 1 ? `Phase ${i + 1}: Maintenance & Peak Plateau` : `Phase ${i + 1}: Phased Titration`),
    weeks: `Weeks ${i * 4 + 1}–${(i + 1) * 4}`,
    doseMg: stepMg(st),
    frequency: cadence
  }));

  const proto2Phases = [
    { phaseIndex: 1, title: 'Phase 1: Initiation Ramp', weeks: 'Weeks 1–4', doseMg: initialDose, frequency: cadence },
    { phaseIndex: 2, title: 'Phase 2: Target Maintenance', weeks: 'Weeks 5–12', doseMg: midDose, frequency: cadence }
  ];

  const proto3Phases = [
    { phaseIndex: 1, title: 'Phase 1: Induction Priming', weeks: 'Weeks 1–2', doseMg: initialDose, frequency: cadence },
    { phaseIndex: 2, title: 'Phase 2: Accelerated Escalation', weeks: 'Weeks 3–6', doseMg: midDose, frequency: cadence },
    { phaseIndex: 3, title: 'Phase 3: Peak Plateau', weeks: 'Weeks 7–12', doseMg: maxDose, frequency: cadence }
  ];

  const category = (name.toLowerCase().includes('selank') || name.toLowerCase().includes('semax') || name.toLowerCase().includes('pinealon'))
    ? 'Cognitive & Neurological'
    : (isWeekly
        ? 'Weight Management & Metabolic Optimization'
        : (timesPerWeek >= 5 ? 'Tissue Regeneration & Healing' : 'Clinical Optimization'));

  return [
    {
      id: `proto-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-standard`,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-standard-titration`,
      name: `${name} Standard Titration Protocol`,
      durationWeeks: proto1Weeks,
      difficulty: 'Standard Clinical',
      category,
      objective: `Gradual physiological titration of ${name} (${initialDose} mg initiation up to ${maxDose} mg peak) to ensure optimal cellular receptor adaptation and minimize side effects.`,
      route,
      defaultDoseMg: initialDose,
      defaultDosesPerWeek: timesPerWeek,
      frequencyDescription: `${cadence} (${shortCadence})`,
      phases: proto1Phases
    },
    {
      id: `proto-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-moderate`,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-moderate-maintenance`,
      name: `${name} Moderate Maintenance Protocol`,
      durationWeeks: 12,
      difficulty: 'Intermediate',
      category,
      objective: `Structured 12-week clinical program establishing stable therapeutic levels of ${name} at ${midDose} mg with steady long-term maintenance.`,
      route,
      defaultDoseMg: initialDose,
      defaultDosesPerWeek: timesPerWeek,
      frequencyDescription: `${cadence} (${shortCadence})`,
      phases: proto2Phases
    },
    {
      id: `proto-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-intensive`,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-intensive-response`,
      name: `${name} Intensive Response Protocol`,
      durationWeeks: 12,
      difficulty: 'Comprehensive',
      category,
      objective: `Rapid therapeutic ramp reaching steady-state levels of ${name} (${maxDose} mg) for intensive therapeutic targets and verified tolerance.`,
      route,
      defaultDoseMg: initialDose,
      defaultDosesPerWeek: timesPerWeek,
      frequencyDescription: `${cadence} (${shortCadence})`,
      phases: proto3Phases
    }
  ];
}

function extractProtocolClinicalSpecs(p, canonicalCompound = '', isNasal = false, isPen = false) {
  const phases = Array.isArray(p.phases) && p.phases.length > 0
    ? p.phases
    : (Array.isArray(p.phase_blueprints) ? p.phase_blueprints : []);

  const benchmark = matchClinicalBenchmark(canonicalCompound || p.name || '');

  let extractedDoseMg = null;
  let extractedFreqPerWeek = null;
  let extractedFreqDesc = '';
  let extractedRoute = p.route || benchmark?.route || 'Subcutaneous';
  if (isNasal) {
    extractedRoute = 'Intranasal';
  } else if (isPen) {
    extractedRoute = 'Subcutaneous (Pen)';
  } else if (p.route) {
    extractedRoute = p.route;
  }
  let totalWeeks = 0;

  const mappedPhases = phases.map((ph, idx) => {
    // Pick the drug/compound matching canonical compound
    let drug = null;
    const compoundCandidates = Array.isArray(ph.drugs) && ph.drugs.length > 0
      ? ph.drugs
      : (Array.isArray(ph.compounds) && ph.compounds.length > 0
        ? ph.compounds
        : (Array.isArray(ph.items) && ph.items.length > 0 ? ph.items : []));

    if (compoundCandidates.length > 0) {
      if (canonicalCompound) {
        const compLower = canonicalCompound.toLowerCase().split(/[\s-]/)[0];
        drug = compoundCandidates.find(d => {
          const dTitle = (d.product_title || d.product_name || d.name || d.compound_name || '').toLowerCase();
          const dId = (d.product_id || d.productId || d.id || '').toLowerCase();
          return dTitle.includes(compLower) || dId.includes(compLower);
        }) || compoundCandidates[0];
      } else {
        drug = compoundCandidates[0];
      }
    }

    const doseLogic = drug?.dose_logic || {};
    const phaseWeeks = Number(ph.durationWeeks || ph.default_duration_weeks || ph.duration) || 4;
    totalWeeks += phaseWeeks;

    let phaseDose = null;
    let unit = 'mg';
    const rawUnit = (ph.unit || drug?.unit || doseLogic.dose_unit || '').toLowerCase();
    if (rawUnit === 'mcg' || rawUnit === 'µg') {
      unit = 'mcg';
    }

    if (ph.doseMg) {
      phaseDose = parseFloat(ph.doseMg);
    } else if (ph.dose) {
      const match = String(ph.dose).match(/([\d.]+)\s*(mg|mcg|µg)?/i);
      if (match) {
        phaseDose = parseFloat(match[1]);
        if (match[2]?.toLowerCase() === 'mcg') unit = 'mcg';
      }
    } else if (drug?.dose) {
      const match = String(drug.dose).match(/([\d.]+)\s*(mg|mcg|µg)?/i);
      if (match) {
        phaseDose = parseFloat(match[1]);
        if (match[2]?.toLowerCase() === 'mcg') unit = 'mcg';
      }
    } else if (doseLogic.starting_weekly_dose) {
      const swd = parseFloat(doseLogic.starting_weekly_dose);
      phaseDose = (unit === 'mcg' && swd > 50) ? swd / 1000 : swd;
    } else if (doseLogic.dose_per_administration) {
      const dpa = parseFloat(doseLogic.dose_per_administration);
      phaseDose = (unit === 'mcg' && dpa >= 100) ? dpa / 1000 : dpa;
    }

    // Convert mcg to mg if unit is mcg and dose is large (e.g. 250 mcg -> 0.25 mg)
    if (unit === 'mcg' && phaseDose !== null && phaseDose >= 50) {
      phaseDose = phaseDose / 1000;
    }

    let phaseFreq = ph.frequency || drug?.frequency || doseLogic.administration_frequency || '';
    if (/once|weekly|1x|semanal/i.test(phaseFreq)) {
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = 1;
      phaseFreq = 'Once weekly';
    } else if (/2x|twice|biweekly|bi-weekly/i.test(phaseFreq)) {
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = 2;
      phaseFreq = '2x per week';
    } else if (/3x|3 times/i.test(phaseFreq)) {
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = 3;
      phaseFreq = '3x per week';
    } else if (/5d|5 days/i.test(phaseFreq)) {
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = 5;
      phaseFreq = '5 days on / 2 days off';
    } else if (/daily|qd|every day|diario/i.test(phaseFreq)) {
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = 7;
      phaseFreq = 'Daily';
    } else if (benchmark) {
      phaseFreq = benchmark.cadence;
      if (extractedFreqPerWeek === null) extractedFreqPerWeek = benchmark.timesPerWeek;
    }

    // Benchmark calibration if phase dose is missing or repeated
    if ((phaseDose === null || isNaN(phaseDose)) && benchmark?.steps) {
      const stepIdx = Math.min(idx, benchmark.steps.length - 1);
      const bStep = benchmark.steps[stepIdx];
      phaseDose = (benchmark.unit === 'mcg' && bStep >= 100) ? bStep / 1000 : bStep;
    }

    if (phaseDose && extractedDoseMg === null) {
      extractedDoseMg = phaseDose;
      extractedFreqDesc = phaseFreq;
    }

    const fallbackDose = benchmark
      ? (benchmark.unit === 'mcg' && benchmark.steps[0] >= 100 ? benchmark.steps[0] / 1000 : benchmark.steps[0])
      : 2.5;

    return {
      phaseIndex: idx + 1,
      title: ph.phase_title || ph.phaseLabel || ph.name || `Phase ${idx + 1}`,
      weeks: `Weeks ${totalWeeks - phaseWeeks + 1}–${totalWeeks}`,
      doseMg: phaseDose || fallbackDose,
      frequency: phaseFreq || 'Once weekly'
    };
  });

  const compoundLower = String(canonicalCompound || p.name || '').toLowerCase();
  if (!extractedDoseMg) {
    if (p.defaultDoseMg) {
      extractedDoseMg = parseFloat(p.defaultDoseMg);
    } else if (benchmark) {
      const bStep0 = benchmark.steps[0];
      extractedDoseMg = (benchmark.unit === 'mcg' && bStep0 >= 100) ? bStep0 / 1000 : bStep0;
      extractedFreqDesc = benchmark.cadence;
      extractedFreqPerWeek = benchmark.timesPerWeek;
    } else {
      extractedDoseMg = 2.5;
    }
  }

  if (!extractedFreqPerWeek) {
    if (benchmark) {
      extractedFreqPerWeek = benchmark.timesPerWeek;
      extractedFreqDesc = benchmark.cadence;
    } else if (compoundLower.includes('tirzepatide') || compoundLower.includes('semaglutide') || compoundLower.includes('retatrutide')) {
      extractedFreqPerWeek = 1;
      extractedFreqDesc = 'Once weekly subcutaneous injection';
    } else if (compoundLower.includes('pt-141') || compoundLower.includes('bremelanotide')) {
      extractedFreqPerWeek = 2;
      extractedFreqDesc = 'As needed (1–2x per week, 45 min prior)';
    } else {
      extractedFreqPerWeek = 1;
      extractedFreqDesc = 'Weekly';
    }
  }

  const calculatedDuration = totalWeeks > 0 ? totalWeeks : (Number(p.durationWeeks) || parseInt(p.duration, 10) || 12);
  let cleanedObjective = p.objective || p.overview_summary || p.description || p.clinicalRationale || p.summary || 'Clinical administration protocol.';
  if (calculatedDuration > 8 && cleanedObjective.includes('8-week')) {
    cleanedObjective = cleanedObjective.replace(/\b8-week\b/gi, `${calculatedDuration}-week`);
  }

  return {
    durationWeeks: calculatedDuration,
    defaultDoseMg: extractedDoseMg,
    defaultDosesPerWeek: extractedFreqPerWeek,
    frequencyDescription: extractedFreqDesc,
    route: extractedRoute,
    phases: mappedPhases.length > 0 ? mappedPhases : [
      {
        phaseIndex: 1,
        title: 'Phase 1: Initiation Titration',
        weeks: `Weeks 1–${calculatedDuration}`,
        doseMg: extractedDoseMg,
        frequency: extractedFreqDesc || 'Once weekly'
      }
    ],
    objective: cleanedObjective
  };
}

/**
 * Formats clinical dosages into standardized international units:
 * Dosages < 1 mg are displayed in micrograms (mcg) to prevent decimal prescription ambiguity,
 * while dosages >= 1 mg are displayed in milligrams (mg).
 */
export function formatClinicalDose(doseMg) {
  const d = Number(doseMg);
  if (isNaN(d) || d <= 0) return '0 mg';
  if (d < 1) {
    return `${Math.round(d * 1000)} mcg`;
  }
  return d % 1 === 0 ? `${d.toFixed(0)} mg` : `${d.toFixed(2)} mg`;
}

export default function ProtocolWorkspaceTab({
  product = {},
  associatedProtocols = [],
  activeFormat = null,
  selectedStrength = null,
  availableFormats = [],
  onFormatChange,
  onOpenPreviewModal,
  onAddToCart,
  onProtocolChange
}) {
  const { user } = useAuth();
  const router = useRouter();
  const canonicalName = product.canonicalName || product.name || 'PT-141';

  const currentFormat = activeFormat || product.presentation || product.format || 'vial';
  const isNasal = String(currentFormat).toLowerCase().includes('nasal') || String(currentFormat).toLowerCase().includes('spray');
  const isPen = String(currentFormat).toLowerCase().includes('pen') || String(currentFormat).toLowerCase().includes('cartridge');
  const isVial = !isNasal && !isPen;

  // Normalize protocols list: use provided or fallback to canonical compound protocols
  const availableProtocols = useMemo(() => {
    if (Array.isArray(associatedProtocols) && associatedProtocols.length > 0) {
      // Map Firestore/Repository protocols into canonical structure using extractProtocolClinicalSpecs
      return associatedProtocols.map(p => {
        const specs = extractProtocolClinicalSpecs(p, canonicalName, isNasal, isPen);
        return {
          id: p.id || p.slug,
          slug: p.slug || p.id,
          name: sanitizeProtocolTitle(p.name || p.title, canonicalName),
          fullName: p.name || p.title || 'Clinical Protocol',
          durationWeeks: specs.durationWeeks,
          difficulty: p.difficulty || p.difficulty_level || 'Clinical',
          category: p.category || (specs.defaultDosesPerWeek === 1 ? 'Weight Management' : 'Clinical Protocol'),
          objective: specs.objective,
          route: specs.route,
          defaultDoseMg: specs.defaultDoseMg,
          defaultDosesPerWeek: specs.defaultDosesPerWeek,
          frequencyDescription: specs.frequencyDescription,
          phases: specs.phases,
          _raw: p
        };
      });
    }
    return buildCanonicalCompoundProtocols(canonicalName);
  }, [associatedProtocols, canonicalName, isNasal, isPen]);

  // ── Selected Protocol State ──
  const [selectedProtocolId, setSelectedProtocolId] = useState(
    availableProtocols[0]?.id || 'proto-standard'
  );

  const activeProtocol = useMemo(() => {
    return availableProtocols.find(p => p.id === selectedProtocolId) || availableProtocols[0];
  }, [availableProtocols, selectedProtocolId]);

  // Dynamically computed dose steps from clinical benchmark and active protocol phases
  const availableDoseSteps = useMemo(() => {
    const bm = matchClinicalBenchmark(canonicalName);
    let steps = [];
    if (bm?.steps) {
      steps = bm.steps.map(s => bm.unit === 'mcg' && s >= 100 ? s / 1000 : s);
    }
    const fromPhases = (activeProtocol?.phases || []).map(ph => Number(ph.doseMg)).filter(Boolean);
    if (fromPhases.length > 0) {
      steps = [...steps, ...fromPhases];
    }
    if (activeProtocol?.defaultDoseMg) {
      steps.push(Number(activeProtocol.defaultDoseMg));
    }
    if (steps.length === 0) steps = [1.0, 2.0, 2.5, 5.0];
    return [...new Set(steps)].sort((a, b) => a - b).slice(0, 6);
  }, [canonicalName, activeProtocol]);

  // Dynamically computed frequency cadences
  const availableFrequencies = useMemo(() => {
    const base = [1, 2, 3];
    const protoFreq = Number(activeProtocol?.defaultDosesPerWeek);
    if (protoFreq && !base.includes(protoFreq)) base.push(protoFreq);
    return [...new Set(base)].sort((a, b) => a - b);
  }, [activeProtocol?.defaultDosesPerWeek]);

  // Dynamically computed treatment durations
  const availableDurations = useMemo(() => {
    const base = [4, 8, 12];
    const protoDur = Number(activeProtocol?.durationWeeks);
    if (protoDur && !base.includes(protoDur)) base.push(protoDur);
    return [...new Set(base)].sort((a, b) => a - b);
  }, [activeProtocol?.durationWeeks]);

  // Alternative protocols memo for comparison and fast switching
  const otherProtocols = useMemo(() => {
    return availableProtocols.filter(p => p.id !== (activeProtocol?.id || selectedProtocolId));
  }, [availableProtocols, selectedProtocolId, activeProtocol]);

  // Modal / Bottom Sheet state for Google Cloud UX protocol inspection
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  // ── Horizontal Stepper State: 1 to 5 ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Patient Treatment Specific Parameters (Physician Authorized Overrides) ──
  const [isPickerExpandedMobile, setIsPickerExpandedMobile] = useState(false);
  const [physicianDoseMg, setPhysicianDoseMg] = useState(activeProtocol.defaultDoseMg || 2.5);
  const [physicianFreqPerWeek, setPhysicianFreqPerWeek] = useState(activeProtocol.defaultDosesPerWeek || 1);
  const [physicianDurationWeeks, setPhysicianDurationWeeks] = useState(activeProtocol.durationWeeks || 12);
  const [selectedVialStrength, setSelectedVialStrength] = useState(() => {
    return resolveVialSizeMg({ product_slug: product.slug, product_title: canonicalName }) || 10;
  });
  const [selectedBacVolume, setSelectedBacVolume] = useState(2.0);

  // Sync physician defaults whenever active protocol or protocols list updates
  useEffect(() => {
    if (availableProtocols.length > 0) {
      const exists = availableProtocols.some(p => p.id === selectedProtocolId || p.slug === selectedProtocolId);
      if (!exists) {
        setSelectedProtocolId(availableProtocols[0].id || availableProtocols[0].slug);
      }
    }
  }, [availableProtocols, selectedProtocolId]);

  useEffect(() => {
    if (activeProtocol) {
      if (activeProtocol.defaultDoseMg) setPhysicianDoseMg(activeProtocol.defaultDoseMg);
      if (activeProtocol.defaultDosesPerWeek) setPhysicianFreqPerWeek(activeProtocol.defaultDosesPerWeek);
      if (activeProtocol.durationWeeks) setPhysicianDurationWeeks(activeProtocol.durationWeeks);
    }
  }, [activeProtocol?.id, activeProtocol?.defaultDoseMg, activeProtocol?.defaultDosesPerWeek, activeProtocol?.durationWeeks]);

  // Synchronize vial / unit strength when active strength changes in parent
  useEffect(() => {
    if (selectedStrength?.name) {
      const match = String(selectedStrength.name).match(/(\d+(\.\d+)?)/);
      if (match) {
        setSelectedVialStrength(parseFloat(match[1]));
      }
    }
  }, [selectedStrength?.name, selectedStrength?.id]);

  // Expanded stepper items for progressive disclosure in Step 4
  const [expandedSteps, setExpandedSteps] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false, 6: false });

  // Update physician defaults when switching protocol
  const handleSelectProtocol = (protoId) => {
    const nextProto = availableProtocols.find(p => p.id === protoId);
    if (!nextProto) return;
    triggerHaptic('selection');
    setSelectedProtocolId(protoId);
    setPhysicianDoseMg(nextProto.defaultDoseMg || 2.5);
    setPhysicianFreqPerWeek(nextProto.defaultDosesPerWeek || 1);
    setPhysicianDurationWeeks(nextProto.durationWeeks || 12);
    setCurrentStep(1); // Return to Step 1 for fresh review
    setIsPickerExpandedMobile(false); // Auto-collapse on mobile upon selection
  };

  // Check if current parameters differ from protocol default
  const isDoseModified = physicianDoseMg !== activeProtocol.defaultDoseMg;
  const isFreqModified = physicianFreqPerWeek !== activeProtocol.defaultDosesPerWeek;
  const isDurationModified = physicianDurationWeeks !== activeProtocol.durationWeeks;
  const isTreatmentModified = isDoseModified || isFreqModified || isDurationModified;

  // ── Single Authoritative Calculations ──
  const reconCalc = useMemo(() => {
    return calculateReconstitution({
      vialStrengthMg: selectedVialStrength,
      bacVolumeMl: selectedBacVolume,
      targetDoseMg: physicianDoseMg
    });
  }, [selectedVialStrength, selectedBacVolume, physicianDoseMg]);

  const procCalc = useMemo(() => {
    return calculateProtocolProcurement({
      durationWeeks: physicianDurationWeeks,
      administrationsPerWeek: physicianFreqPerWeek,
      dosePerAdminMg: physicianDoseMg,
      preferredVialStrength: selectedVialStrength,
      presentation: currentFormat,
      selectedStrength: selectedStrength || product.dose
    });
  }, [physicianDurationWeeks, physicianFreqPerWeek, physicianDoseMg, selectedVialStrength, currentFormat, selectedStrength, product.dose]);

  const handleCopyProcurement = () => {
    triggerHaptic('light');
    const doseDisplay = formatClinicalDose(physicianDoseMg);
    const text = [
      `PATIENT TREATMENT REQUIREMENTS — ${product.canonicalName || 'Peptide'}`,
      `Protocol: ${activeProtocol.name}`,
      `Duration: ${physicianDurationWeeks} Weeks (${procCalc.totalAdministrations} total doses)`,
      `Administration Route: ${isNasal ? 'Intranasal (Metered-dose pump, Ready-to-use, zero reconstitution)' : isPen ? 'Subcutaneous Multi-Dose Pen (31G/32G Nano-Needles)' : 'Subcutaneous Injection (Lyophilized vial + BAC water)'}`,
      `Dose per administration: ${doseDisplay} (${isNasal ? '1 metered puff per nostril' : isPen ? 'SubQ dial setting' : `${reconCalc.injectionVolumeMl} mL / ${reconCalc.syringeUnitsU100} U`})`,
      `Total API Required: ${procCalc.totalApiRequiredMg} mg`,
      `Recommended Procurement: ${procCalc.procurementSummary}`,
      `Total Supply: ${procCalc.totalProvidedApiMg} mg API (${procCalc.expectedUnusedMg} mg buffer)`,
      `Dispensed by: ${product.supplierName || 'Lotusland / Bioblend / Atlas Health Services'}`
    ].join('\n');

    navigator.clipboard?.writeText(text);
    toast.success('Procurement list copied to clipboard ✓');
  };

  const handleAddRequirementsToCart = () => {
    if (!user) {
      triggerHaptic('warning');
      toast.error('Sign in required: Please log in to request quotations or order supplies.');
      const redirectUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    triggerHaptic('medium');
    if (isNasal) {
      onAddToCart?.({
        id: `${product.id || 'selank'}-${procCalc.unitStrengthMg || 30}mg-nasal`,
        productId: product.id || 'selank',
        name: `${product.name || 'Selank'} ${procCalc.unitStrengthMg || 30} mg Nasal Spray (${procCalc.containerVolumeMl || (procCalc.unitStrengthMg === 30 ? 4 : 10)} mL)`,
        dosage: `${procCalc.unitStrengthMg || 30} mg`,
        format: 'nasal_spray',
        price: selectedStrength?.price || product.price || 134.79
      }, procCalc.totalUnitsCount || 1);
    } else if (isPen) {
      onAddToCart?.({
        id: `${product.id || 'selank'}-${procCalc.unitStrengthMg || 6}mg-pen`,
        productId: product.id || 'selank',
        name: `${product.name || 'Selank'} ${procCalc.unitStrengthMg || 6} mg Pre-filled Multi-Dose Pen (3 mL)`,
        dosage: `${procCalc.unitStrengthMg || 6} mg`,
        format: 'prefilled_pen',
        price: product.price || 62.00
      }, procCalc.totalUnitsCount || 1);
    } else {
      (procCalc.recommendedVials || []).forEach(v => {
        onAddToCart?.({
          id: `${product.id || 'peptide'}-${v.strength}mg`,
          productId: product.id || 'peptide',
          name: `${product.name || 'Peptide'} ${v.strength} mg Lyophilized Vial`,
          dosage: `${v.strength} mg`,
          format: 'vial',
          price: v.strength === 5 ? 24.00 : v.strength === 10 ? 38.00 : 65.00
        }, v.count);
      });
    }
    toast.success(`Added ${procCalc.procurementSummary} to quotation / order ✓`);
  };

  // Notify parent component of current active protocol context
  React.useEffect(() => {
    onProtocolChange?.({
      activeProtocol: {
        ...activeProtocol,
        cleanTitle: sanitizeProtocolTitle(activeProtocol.name, canonicalName)
      },
      procCalc,
      reconCalc,
      selectedVialStrength,
      physicianDurationWeeks,
      physicianDoseMg,
      currentStep,
      formatType: currentFormat,
      route: activeProtocol.route
    });
  }, [activeProtocol, procCalc, reconCalc, selectedVialStrength, physicianDurationWeeks, physicianDoseMg, currentStep, canonicalName, currentFormat, onProtocolChange]);

  const stepsList = [
    { number: 1, label: 'Protocol' },
    { number: 2, label: 'Treatment Plan' },
    { number: 3, label: isNasal ? 'Supply (Sprays)' : isPen ? 'Supply (Pens)' : 'Vials' },
    { number: 4, label: isNasal ? 'Nasal Spray Guide' : isPen ? 'Pen Calibration' : 'Preparation' },
    { number: 5, label: 'Review' }
  ];

  return (
    <div className="pds-protocol-workspace-grid">
      
      {/* ── LEFT COLUMN: Available Protocols (Accordion on Mobile <1024px, Fixed Column on Desktop) ── */}
      {/* ── LEFT COLUMN: Available Protocols (Google Cloud Console Resource Selector) ── */}
      <aside className="pds-protocol-picker-aside">
        <div className="pds-protocol-picker-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#003666'
            }}>
              <FlaskConical size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Clinical Protocols
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {canonicalName} Blueprints
              </div>
            </div>
          </div>

          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            padding: '2px 8px',
            borderRadius: '12px',
            flexShrink: 0
          }}>
            {availableProtocols.length} {availableProtocols.length === 1 ? 'option' : 'options'}
          </span>
        </div>

        <div className="pds-protocol-picker-list">
          {availableProtocols.map((proto, idx) => {
            const isSelected = proto.id === selectedProtocolId;
            return (
              <button
                key={proto.id}
                type="button"
                onClick={() => handleSelectProtocol(proto.id)}
                className={`pds-picker-item-btn ${isSelected ? 'is-selected' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  padding: '0.75rem 0.95rem',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  borderLeft: isSelected ? '3.5px solid #003666' : '3.5px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: isSelected ? '#0284c7' : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Option {idx + 1}
                  </span>
                  {isSelected && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      <Check size={10} strokeWidth={3} /> Active
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 800 : 700,
                  color: isSelected ? '#003666' : '#1e293b',
                  lineHeight: 1.35
                }}>
                  {sanitizeProtocolTitle(proto.name, canonicalName)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    color: isSelected ? '#0284c7' : '#64748b',
                    fontWeight: 600
                  }}>
                    <Clock size={11} /> {proto.durationWeeks} wks
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.68rem' }}>•</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    background: isSelected ? '#dbeafe' : '#f8fafc',
                    color: isSelected ? '#1e40af' : '#64748b',
                    border: '1px solid',
                    borderColor: isSelected ? '#bfdbfe' : '#e2e8f0',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {proto.category || 'Clinical'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {availableProtocols.length > 1 && (
          <div style={{ padding: '0.6rem 0.85rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsProtocolModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '6px 8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#003666',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={13} color="#003666" />
              <span>Compare All {availableProtocols.length} Options</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <main className="pds-protocol-main-workspace">
        {/* ── Google Cloud UX Protocol Switcher (Mobile & Desktop) ── */}
        <div className="pds-gcp-protocol-switcher">
          <div className="pds-gcp-switcher-header">
            <div className="pds-gcp-switcher-header-left">
              <div className="pds-gcp-switcher-icon-box">
                <FlaskConical size={16} />
              </div>
              <div>
                <span className="pds-gcp-switcher-eyebrow">Available Protocol Blueprints</span>
                <div className="pds-gcp-switcher-title-row">
                  <h3 className="pds-gcp-switcher-title">
                    {sanitizeProtocolTitle(activeProtocol.name, canonicalName)}
                  </h3>
                  <span className="pds-gcp-switcher-pill">
                    {availableProtocols.length} available
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="pds-gcp-switcher-compare-btn"
              onClick={() => {
                triggerHaptic('light');
                setIsProtocolModalOpen(true);
              }}
              aria-label="Compare all protocols"
            >
              <Layers size={13} />
              <span>Compare All ({availableProtocols.length})</span>
            </button>
          </div>

          {/* Clean Google Cloud Dropdown Field for Mobile (No horizontal scroll) */}
          <div className="pds-gcp-mobile-select-wrapper">
            <div className="pds-gcp-select-container">
              <select
                className="pds-gcp-native-select"
                value={selectedProtocolId}
                onChange={(e) => handleSelectProtocol(e.target.value)}
                aria-label="Select Clinical Protocol Blueprint"
              >
                {availableProtocols.map((proto, idx) => (
                  <option key={proto.id} value={proto.id}>
                    #{idx + 1} · {sanitizeProtocolTitle(proto.name, canonicalName)} ({proto.durationWeeks} Wks • {proto.defaultDoseMg || proto.phases?.[0]?.doseMg || 2.5} mg)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pds-gcp-select-arrow" />
            </div>

            <div className="pds-gcp-select-meta-strip">
              <span className="pds-gcp-meta-pill">
                <Clock size={11} /> {activeProtocol.durationWeeks} Weeks
              </span>
              <span className="pds-gcp-meta-pill dose">
                • {activeProtocol.defaultDoseMg || activeProtocol.phases?.[0]?.doseMg || 2.5} mg / admin
              </span>
              <span className="pds-gcp-meta-pill">
                • {activeProtocol.difficulty || 'Clinical'}
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Segmented Switcher Deck */}
          <div className="pds-gcp-switcher-deck hide-on-mobile" role="tablist" aria-label="Clinical Protocol Options">
            {availableProtocols.map((proto, idx) => {
              const isSelected = proto.id === selectedProtocolId;
              return (
                <button
                  key={proto.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`pds-gcp-switcher-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectProtocol(proto.id)}
                >
                  <div className="pds-gcp-card-top">
                    <span className={`pds-gcp-card-step ${isSelected ? 'is-selected' : ''}`}>
                      {idx + 1}
                    </span>
                    <span className="pds-gcp-card-name" title={proto.name}>
                      {sanitizeProtocolTitle(proto.name, canonicalName)}
                    </span>
                    {isSelected ? (
                      <span className="pds-gcp-card-active-tag">
                        <Check size={10} /> Active
                      </span>
                    ) : (
                      <span className="pds-gcp-card-switch-tag">
                        Select
                      </span>
                    )}
                  </div>
                  <div className="pds-gcp-card-meta">
                    <span className="pds-gcp-meta-pill">
                      <Clock size={10} /> {proto.durationWeeks} Wks
                    </span>
                    <span className="pds-gcp-meta-pill dose">
                      • {proto.defaultDoseMg || proto.phases?.[0]?.doseMg || 2.5} mg
                    </span>
                    <span className="pds-gcp-meta-pill">
                      • {proto.difficulty || 'Clinical'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Title & Current Protocol Context (Google Cloud Console Resource Header) */}
        <div className="pds-protocol-header-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.85rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Clinical Protocol Blueprint
              </span>
              <span style={{ fontSize: '0.64rem', color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0284c7' }}>
                {canonicalName}
              </span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 850,
              color: '#003666',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}>
              {canonicalName} — {sanitizeProtocolTitle(activeProtocol.name, canonicalName)}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {physicianDurationWeeks} Weeks
            </span>
            <span style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {formatClinicalDose(physicianDoseMg)} / admin
            </span>
            <span style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {activeProtocol.route || 'Subcutaneous'}
            </span>
          </div>
        </div>

        {/* ── Official Protocol Page Link & Executive Summary Notice (GCP Callout Standard) ── */}
        <div className="pds-protocol-summary-banner">
          <div className="pds-protocol-summary-content">
            <div className="pds-protocol-summary-icon">
              <Info size={15} color="#0284c7" />
            </div>
            <div className="pds-protocol-summary-text">
              <strong style={{ color: '#003666' }}>Clinical Blueprint Overview:</strong> Active blueprint: <strong style={{ color: '#0369a1' }}>{sanitizeProtocolTitle(activeProtocol.name, canonicalName)}</strong> ({physicianDurationWeeks} Weeks, {formatClinicalDose(physicianDoseMg)}/admin, {activeProtocol.route || 'Subcutaneous'}). Interactive physician calculator for rapid {isNasal ? 'nasal spray dosing, pump calibration, and clinical supply forecasting' : isPen ? 'pen dial calibration, dose titration, and device procurement' : 'vial reconstitution, syringe calibration, and compounding procurement'}.
            </div>
          </div>

          <div className="pds-protocol-summary-actions">
            {availableProtocols.length > 1 && (
              <button
                type="button"
                className="pds-protocol-summary-compare-btn"
                onClick={() => {
                  triggerHaptic('light');
                  setIsProtocolModalOpen(true);
                }}
              >
                <Layers size={13} color="#003666" />
                <span>Compare Pathways ({availableProtocols.length})</span>
              </button>
            )}

            <a
              href={activeProtocol?.slug ? `/proto/${activeProtocol.slug}` : (activeProtocol?.id ? `/proto/${activeProtocol.id}` : `/proto/${product.slug || 'protocol'}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="pds-protocol-summary-link-btn"
              title={`Open full clinical protocol blueprint for ${sanitizeProtocolTitle(activeProtocol?.name, canonicalName)}`}
            >
              <span>Full Blueprint</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* ── Workflow Stepper: Responsive Grid without Horizontal Scroll ── */}
        <div className="pds-stepper-wrapper">
          {/* Mobile Step Title Pill */}
          <div className="pds-stepper-mobile-title">
            <span style={{ fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              STEP {currentStep} OF 5
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
            <span style={{ fontWeight: 700, color: '#0369a1' }}>
              {stepsList.find(s => s.number === currentStep)?.label}
            </span>
          </div>

          <div className="pds-protocol-stepper-container">
            {stepsList.map(s => {
              const isActive = currentStep === s.number;
              const isCompleted = currentStep > s.number;

              return (
                <button
                  key={s.number}
                  type="button"
                  className={`pds-protocol-stepper-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    triggerHaptic('selection');
                    setCurrentStep(s.number);
                  }}
                  style={{
                    background: isActive ? '#003666' : isCompleted ? '#ffffff' : 'transparent',
                    color: isActive ? '#ffffff' : isCompleted ? '#003666' : '#64748b',
                    boxShadow: isActive ? '0 2px 4px rgba(0, 54, 102, 0.2)' : isCompleted ? '0 1px 2px rgba(0,0,0,0.04)' : 'none'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive ? '#38bdf8' : isCompleted ? '#e0f2fe' : '#e2e8f0',
                    color: isActive ? '#003666' : isCompleted ? '#0369a1' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 850,
                    flexShrink: 0
                  }}>
                    {isCompleted ? '✓' : s.number}
                  </span>
                  <span className="pds-stepper-btn-label">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP CONTENT ROUTER ── */}

        {/* ═══════════════════════════════════════════════════════════
            STEP 1: PROTOCOL DEFINITION (Pure Clinical Intent)
            ═══════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
                Clinical Objective
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
                {activeProtocol.objective}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Duration</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                  {activeProtocol.durationWeeks} Weeks
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Administration Route</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                  {activeProtocol.route}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Target Dose</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {formatClinicalDose(activeProtocol.defaultDoseMg)}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Frequency</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                  {activeProtocol.defaultDosesPerWeek}× per week PRN
                </div>
              </div>
            </div>

            {/* Nose-to-Brain Transcribiform Pharmacokinetic Advantage (Nasal Spray) */}
            {isNasal && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#166534',
                  flexShrink: 0
                }}>
                  <Sparkles size={17} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#14532d' }}>
                      Pharmacokinetic Advantage: Direct Transcribiform Nose-to-Brain Delivery
                    </span>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #86efac'
                    }}>
                      Bypasses Blood-Brain Barrier (BBB)
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
                    Intranasal atomization delivers {canonicalName} directly along the olfactory and trigeminal nerve fibers crossing the lamina cribrosa into cerebrospinal fluid (CSF) and limbic/hippocampal structures. Peak neural concentration occurs within 15–30 minutes without hepatic first-pass degradation or systemic peripheral side effects.
                  </p>
                </div>
              </div>
            )}

            {/* Protocol Phases Roadmap */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Protocol Phases ({activeProtocol.phases.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeProtocol.phases.map(ph => (
                  <div
                    key={ph.phaseIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{ph.title}</strong>
                      <span style={{ marginLeft: '8px', fontSize: '0.74rem', color: '#64748b' }}>({ph.weeks})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 750, color: '#166534' }}>
                        {formatClinicalDose(ph.doseMg)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• {ph.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Step 1 of 5: Defines clinical treatment intent. {isNasal ? 'Metered spray delivery & bottle requirements are computed in Steps 3 and 4.' : isPen ? 'Pre-filled pens & dial calibration are configured in Steps 3 and 4.' : 'Reconstitution & units are computed in Step 4.'}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentStep(2);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <span>Continue to Treatment Plan</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STEP 2: TREATMENT PLAN (Visual Schedule + Physician Modifiers)
            ═══════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  Physician Customization Status
                </span>
                <div style={{ marginTop: '2px' }}>
                  {isTreatmentModified ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#b45309',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}>
                      Physician Modified (Defaults Preserved)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 750
                    }}>
                      <Check size={12} /> Using Protocol Standard Defaults
                    </span>
                  )}
                </div>
              </div>

              {isTreatmentModified && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPhysicianDoseMg(activeProtocol.defaultDoseMg || (availableDoseSteps[0] || 1.25));
                    setPhysicianFreqPerWeek(activeProtocol.defaultDosesPerWeek || 2);
                    setPhysicianDurationWeeks(activeProtocol.durationWeeks || 4);
                    toast.success('Reset to protocol defaults');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={12} /> Reset to Defaults
                </button>
              )}
            </div>

            {/* Editable Parameter Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Dose Modifier */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    Target Dose per Admin
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Default: {formatClinicalDose(activeProtocol.defaultDoseMg)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableDoseSteps.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setPhysicianDoseMg(d);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: physicianDoseMg === d ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: physicianDoseMg === d ? '#003666' : '#f8fafc',
                        color: physicianDoseMg === d ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: physicianDoseMg === d ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {formatClinicalDose(d)} {d === activeProtocol.defaultDoseMg ? '(Std)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Modifier */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    Frequency
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Default: {activeProtocol.defaultDosesPerWeek}×/wk</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableFrequencies.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setPhysicianFreqPerWeek(f);
                      }}
                      style={{
                        flex: '1 1 auto',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: physicianFreqPerWeek === f ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: physicianFreqPerWeek === f ? '#003666' : '#f8fafc',
                        color: physicianFreqPerWeek === f ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: physicianFreqPerWeek === f ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {f}× / week
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Modifier */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                    Treatment Duration
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Default: {activeProtocol.durationWeeks} wks</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableDurations.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setPhysicianDurationWeeks(w);
                      }}
                      style={{
                        flex: '1 1 auto',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: physicianDurationWeeks === w ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: physicianDurationWeeks === w ? '#003666' : '#f8fafc',
                        color: physicianDurationWeeks === w ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: physicianDurationWeeks === w ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {w} Weeks
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Clinical Schedule */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Configured Clinical Administration Schedule
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(physicianDurationWeeks, 6)}, 1fr)`,
                gap: '0.4rem'
              }}>
                {Array.from({ length: physicianDurationWeeks }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>W{i + 1}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                      {formatClinicalDose(physicianDoseMg)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#0284c7', marginTop: '1px' }}>
                      {physicianFreqPerWeek}×
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nasal Dosimetry per Nostril & Circadian Timing (Only for Intranasal Spray) */}
            {isNasal && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.85rem'
              }}>
                {/* Nostril Division */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
                      Intranasal Dosimetry per Nostril
                    </span>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #86efac'
                    }}>
                      0.1 mL Metered Pump
                    </span>
                  </div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#14532d', marginTop: '4px' }}>
                    {procCalc.spraysPerDose <= 1 ? '1 Spray (Alternate Nostril Daily)' : `${Math.ceil(procCalc.spraysPerDose / 2)} Spray Left + ${Math.floor(procCalc.spraysPerDose / 2)} Spray Right`}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                    {procCalc.spraysPerDose <= 1
                      ? `Deliver ${formatClinicalDose(physicianDoseMg)} in a single metered puff (${procCalc.dosePerSprayDisplay || '750 mcg'}/actuation), alternating nostrils daily.`
                      : `Administer ${procCalc.spraysPerDose} metered sprays (~${procCalc.dosePerSprayDisplay || '750 mcg'}/spray) divided between nostrils. Wait 30–60 seconds between actuations to maximize olfactory mucosal absorption and prevent throat runoff.`}
                  </p>
                </div>

                {/* Cronobiology & Administration Window */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e40af' }}>
                      Optimal Chronobiology Window
                    </span>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #93c5fd'
                    }}>
                      Circadian Peak
                    </span>
                  </div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#003666', marginTop: '4px' }}>
                    Morning to Midday (08:00 – 13:00)
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                    Administer in the first half of the day to support cognitive focus, anxiolytic resilience, and BDNF synthesis. Avoid late night administration to prevent increased alertness or vivid dream cycles.
                  </p>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentStep(3);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <span>Calculate Product Requirements</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STEP 3: VIAL CALCULATION (Procurement Requirements)
            ═══════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem'
            }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total API Required</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', marginTop: '2px', fontFamily: 'monospace' }}>
                  {procCalc.totalApiRequiredMg} mg
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Recommended Supply</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                  {procCalc.procurementSummary}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Administrations</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0f172a', marginTop: '2px', fontFamily: 'monospace' }}>
                  {procCalc.totalAdministrations}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Expected Buffer</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#166534', marginTop: '2px', fontFamily: 'monospace' }}>
                  {procCalc.expectedUnusedMg} mg
                </div>
              </div>
            </div>

            {/* Transparent Reasoning Card */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#1e40af' }}>Atlas Calculation Transparency:</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.80rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  {procCalc.reasoningText}
                </p>
              </div>
            </div>

            {/* Procurement Action CTAs (Separated from reconstitution) */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Direct Clinical Procurement</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Add verified clinical {isNasal ? 'nasal spray bottles' : isPen ? 'pre-filled multi-dose pens' : 'laboratory vials'} directly to quotation or export itemized BOM.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopyProcurement}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={13} /> Copy Procurement List
                </button>

                <button
                  type="button"
                  onClick={handleAddRequirementsToCart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: user ? '#16a34a' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: user ? '0 2px 4px rgba(22, 163, 74, 0.2)' : '0 2px 4px rgba(0, 54, 102, 0.2)'
                  }}
                  title={user ? `Add ${isNasal ? 'spray' : isPen ? 'pen' : 'vial'} requirements to quotation` : "Sign in required to request quotation"}
                >
                  {user ? (
                    <>
                      <ShoppingCart size={14} /> Add Requirements to Quotation
                    </>
                  ) : (
                    <>
                      <Lock size={14} /> Sign in to Request Quotation
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentStep(4);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <span>Proceed to {isNasal ? 'Nasal Spray Guide' : isPen ? 'Pen Calibration Guide' : 'Preparation & Syringe Calibration'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STEP 4: PREPARATION & SYRINGE CALIBRATION
            ═══════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* ─── 4A: NASAL SPRAY METERED DOSE & ADMINISTRATION GUIDE ─── */}
            {isNasal && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* LEFT: Nasal Device & Dose Calibration */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#003666', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                      1. Metered Device & Dose Configuration
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bottle Strength</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#003666' }}>
                          {procCalc.unitStrengthMg || 30} mg / {procCalc.containerVolumeMl || (procCalc.unitStrengthMg === 30 ? 4 : 10)} mL
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Actuation Output</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#0284c7' }}>
                          0.10 mL / puff ({procCalc.dosePerSprayDisplay || '750 mcg'})
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Target Clinical Dose</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#003666', marginTop: '2px' }}>
                        {formatClinicalDose(physicianDoseMg)} ({physicianFreqPerWeek}× daily)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1e3a8a', marginTop: '4px' }}>
                        Standard intranasal protocol: {procCalc.spraysPerDose <= 1 ? '1 metered spray daily (alternate nostrils daily).' : `${Math.ceil(procCalc.spraysPerDose / 2)} metered spray left + ${Math.floor(procCalc.spraysPerDose / 2)} spray right nostril daily (30s interval).`}
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.70rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Zero Reconstitution Required</div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#14532d', lineHeight: 1.4 }}>
                        Factory pre-solubilized in isotonic nasal saline buffer. No BAC water mixing or needle manipulation is necessary.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: Pharmacokinetics & Delivery Advantages */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      2. Intranasal Mucosal Bioavailability
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Onset of Action</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#166534' }}>
                          3–5 Minutes
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Direct BBB Bypass</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#003666' }}>
                          Olfactory Route
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Bottle</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#0284c7' }}>
                          ~{procCalc.totalSpraysPerBottle || (procCalc.unitStrengthMg === 30 ? 40 : 100)} Sprays
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Storage Post-Open</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#334155' }}>
                          2°C–8°C Cold Chain
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666' }}>Clinical Mechanism:</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                        Intranasal administration allows peptide transport along olfactory and trigeminal nerve pathways directly to the central nervous system, avoiding first-pass hepatic metabolism and enzymatic GI degradation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Intranasal Administration Guide */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem'
                  }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Intranasal Administration Procedure & Handling
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Click step to expand instructions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      { step: 1, title: 'Prime Pump', summary: 'Depress pump 2–3 times into air before first usage', detail: 'On first use or after periods of storage, actuate pump until a fine aerosolized mist is produced. Ensure nozzle is directed away from face.' },
                      { step: 2, title: 'Clear Passageways', summary: 'Blow nose gently to clear nasal airways', detail: 'Clean nostrils ensure direct mucosal contact and optimal trans-mucosal absorption.' },
                      { step: 3, title: 'Nozzle Alignment', summary: 'Insert tip into nostril, aim slightly outward towards ear', detail: 'Tilt head slightly forward. Aim nozzle slightly outward towards the outer ear, away from the central nasal septum to avoid irritation and maximize olfactory mucosal delivery.' },
                      { step: 4, title: 'Actuate & Inhale', summary: 'Press pump firmly while breathing in gently through nose', detail: 'Depress actuator fully with index and middle fingers. Inhale gently through the nostril. Avoid vigorous sniffing, which can draw solution into the throat.' },
                      { step: 5, title: 'Clean & Refrigerate', summary: 'Wipe nozzle clean and store upright at 2°C–8°C', detail: 'Wipe tip with a clean tissue, replace safety dust cap, and store refrigerated (2°C–8°C) to maintain peptide chain stability throughout the cycle.' }
                    ].map(item => {
                      const isExp = expandedSteps[item.step];
                      return (
                        <div
                          key={item.step}
                          style={{
                            border: '1px solid #f1f5f9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: isExp ? '#f8fafc' : '#ffffff'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedSteps(prev => ({ ...prev, [item.step]: !prev[item.step] }))}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyCenter: 'center'
                              }}>
                                {item.step}
                              </span>
                              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{item.title}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>• {item.summary}</span>
                            </div>
                            {isExp ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                          </button>
                          {isExp && (
                            <div style={{ padding: '4px 12px 10px 40px', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                              {item.detail}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contralateral Technique & Thermal Stability Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.85rem'
                }}>
                  {/* Contralateral Technique Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                        Clinical Technique: Contralateral Administration
                      </span>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #bae6fd'
                      }}>
                        Cross-Hand Rule
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>
                      <li><strong>Cross Hands:</strong> Use right hand to spray into left nostril, and left hand into right nostril. This mechanically directs the mist outward toward the turbinates and olfactory mucosa, avoiding septal irritation.</li>
                      <li><strong>Head Position:</strong> Tilt head slightly forward (15° chin-down). <em>Never tilt head backwards</em>, which causes solution to swallow into stomach acid.</li>
                      <li><strong>Gentle Inhalation:</strong> Breathe in gently through the nose as the pump actuates. Avoid forceful snorting.</li>
                    </ul>
                  </div>

                  {/* Thermal Stability & Storage Card */}
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
                        Thermal Stability & Chain of Custody
                      </span>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #86efac'
                      }}>
                        2°C–8°C Recommended
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#14532d', lineHeight: 1.45 }}>
                      <li><strong>Unopened Storage:</strong> Store in refrigerator at 2°C–8°C away from direct sunlight. Stable until expiration date.</li>
                      <li><strong>In-Use Viability:</strong> Ambient room temperature (&lt;25°C) stable for up to 30–45 days. Refrigerate to extend integrity up to 60 days.</li>
                      <li><strong>Do Not Freeze:</strong> Freezing causes ice micro-crystallization that damages the internal gasket and pump calibration.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* ─── 4B: PRE-FILLED PEN DIAL CALIBRATION & ADMINISTRATION GUIDE ─── */}
            {isPen && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* LEFT: Pen Device Configuration */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#003666', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                      1. Pre-Filled Multi-Dose Pen Configuration
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cartridge Volume</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#003666' }}>
                          3.0 mL ({procCalc.unitStrengthMg || 6} mg API)
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Needle System</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#0284c7' }}>
                          31G / 32G 4mm Nano
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Target Clinical Dose</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#003666', marginTop: '2px' }}>
                        {formatClinicalDose(physicianDoseMg)} SubQ
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1e3a8a', marginTop: '4px' }}>
                        Rotate dose selector dial to click setting corresponding to {formatClinicalDose(physicianDoseMg)}.
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.70rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Factory Pre-Formulated Solution</div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#14532d', lineHeight: 1.4 }}>
                        Factory pre-constituted sterile multi-dose cartridge with antibacterial preservation. Zero vial drawing or mixing.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: Pen Parameters */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      2. Injection Calibration & Yield
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Concentration</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#166534' }}>
                          {((procCalc.unitStrengthMg || 6) / 3).toFixed(1)} mg/mL
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Yield per Pen</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#003666' }}>
                          ~{Math.floor((procCalc.unitStrengthMg || 6) / physicianDoseMg)} Doses
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Required</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#0284c7' }}>
                          {procCalc.procurementSummary}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cold-Chain</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#334155' }}>
                          Refrigerate (2°C–8°C)
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666' }}>Injection Site Rotation:</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                        Administer into lower abdominal subcutaneous tissue (at least 2 inches away from navel) or outer anterior thigh. Rotate injection quadrants with each administration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Pen Guide */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem'
                  }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pre-Filled Multi-Dose Pen Administration Guide
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Click step to expand instructions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      { step: 1, title: 'Check Solution', summary: 'Inspect cartridge window for clear, colorless fluid', detail: 'Ensure solution is clear and particle-free. Allow pen to reach room temperature for 15 minutes before injection for maximum comfort.' },
                      { step: 2, title: 'Attach Nano-Needle', summary: 'Peel seal and screw sterile 31G/32G needle straight onto pen', detail: 'Screw on clockwise until firm. Remove outer and inner needle caps. Keep outer cap for safe disposal.' },
                      { step: 3, title: 'Prime / Air-Shot', summary: 'Turn dial to 1 unit, hold point up, press button until drop appears', detail: 'Eliminates air bubbles and confirms unobstructed fluid flow through the nano-needle.' },
                      { step: 4, title: 'Dial Prescribed Dose', summary: 'Rotate dose selector to target dose marking', detail: 'Turn dial clockwise to the prescribed dose setting. If dial is turned past dose, rotate backward to correct.' },
                      { step: 5, title: 'Inject SubQ & Hold', summary: 'Insert needle at 90°, press button fully, hold 5 seconds', detail: 'Clean skin with 70% IPA swab. Insert needle at 90°, press button completely, count slowly to 5 before withdrawing needle. Unscrew and discard needle in sharps container.' }
                    ].map(item => {
                      const isExp = expandedSteps[item.step];
                      return (
                        <div
                          key={item.step}
                          style={{
                            border: '1px solid #f1f5f9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: isExp ? '#f8fafc' : '#ffffff'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedSteps(prev => ({ ...prev, [item.step]: !prev[item.step] }))}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyCenter: 'center'
                              }}>
                                {item.step}
                              </span>
                              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{item.title}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>• {item.summary}</span>
                            </div>
                            {isExp ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                          </button>
                          {isExp && (
                            <div style={{ padding: '4px 12px 10px 40px', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                              {item.detail}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ─── 4C: LYOPHILIZED VIAL RECONSTITUTION & SYRINGE CALIBRATION ─── */}
            {isVial && (
              <>
                {/* Two-Column Layout: Left Configuration, Right Calculated Administration */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* LEFT: Configuration */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#003666', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                      1. Reconstitution Configuration
                    </div>

                    <div>
                      <label style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Vial Strength:
                      </label>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {[5, 10, 20].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setSelectedVialStrength(s);
                              setSelectedBacVolume(s === 5 ? 1.0 : s === 10 ? 2.0 : 4.0);
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: selectedVialStrength === s ? '1.5px solid #003666' : '1px solid #cbd5e1',
                              background: selectedVialStrength === s ? '#003666' : '#f8fafc',
                              color: selectedVialStrength === s ? '#ffffff' : '#334155',
                              fontSize: '0.78rem',
                              fontWeight: selectedVialStrength === s ? 800 : 600,
                              cursor: 'pointer'
                            }}
                          >
                            {s} mg
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        BAC Water Volume:
                      </label>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {[1.0, 2.0, 4.0].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setSelectedBacVolume(v);
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: selectedBacVolume === v ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                              background: selectedBacVolume === v ? '#0284c7' : '#f8fafc',
                              color: selectedBacVolume === v ? '#ffffff' : '#334155',
                              fontSize: '0.78rem',
                              fontWeight: selectedBacVolume === v ? 800 : 600,
                              cursor: 'pointer'
                            }}
                          >
                            {v.toFixed(1)} mL
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700 }}>Target Clinical Dose:</div>
                      <strong style={{ fontSize: '0.92rem', color: '#003666' }}>{formatClinicalDose(physicianDoseMg)}</strong>
                    </div>
                  </div>

                  {/* RIGHT: Calculated Administration */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      2. Calculated Administration Results
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Concentration</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#166534', fontFamily: 'monospace' }}>
                          {reconCalc.concentrationDisplay}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Injection Volume</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#003666', fontFamily: 'monospace' }}>
                          {reconCalc.injectionVolumeDisplay}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>U-100 Syringe Draw</span>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
                          {reconCalc.syringeUnitsDisplay}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Vial</span>
                        <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
                          {reconCalc.dosesPerVial} Doses
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precision Syringe Visualizer Subordinate to calculated values */}
                <PrecisionSyringeVisualizer
                  targetDoseMg={physicianDoseMg}
                  injectionVolumeMl={reconCalc.injectionVolumeMl}
                  syringeUnitsU100={reconCalc.syringeUnitsU100}
                />

                {/* Concise 6-Step Administration Guide (Progressive Disclosure) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem'
                  }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Clinical Handling & Administration Procedure
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Click step to expand instructions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      { step: 1, title: 'Disinfect', summary: 'Swab rubber stopper with 70% IPA wipe', detail: 'Allow stopper to air-dry for 30 seconds. Do not touch or blow on the sterile rubber septum.' },
                      { step: 2, title: 'Reconstitute', summary: `Add ${selectedBacVolume.toFixed(1)} mL Bacteriostatic Water along inside vial wall`, detail: 'Use a 21–25G sterile syringe. Aim needle stream against the inner glass wall so the liquid flows gently over the cake.' },
                      { step: 3, title: 'Dissolve gently', summary: 'Swirl smoothly — never shake vigorously', detail: 'Peptide secondary and tertiary bonds are shear-sensitive. Swirl in slow circular motion until solution is clear and particle-free.' },
                      { step: 4, title: 'Draw dose', summary: `Draw exactly ${reconCalc.syringeUnitsU100} U (${reconCalc.injectionVolumeMl} mL) in U-100 syringe`, detail: 'Invert vial vertically. Inject air volume equivalent to dose, then withdraw plunger until top of black stopper aligns with tick mark.' },
                      { step: 5, title: 'Administer', summary: 'SubQ injection in abdomen or thigh at 45–90°', detail: 'Pinch a 2-inch fold of skin. Insert 31G needle fully, depress plunger steadily over 5 seconds, hold for 5 seconds before withdrawing.' },
                      { step: 6, title: 'Store', summary: 'Refrigerate (2°C–8°C) • Beyond-Use Date: 28 Days', detail: 'Store reconstituted vial upright in original light-shielding carton. Discard after 28 days of initial needle puncture.' },
                    ].map(item => {
                      const isExp = expandedSteps[item.step];
                      return (
                        <div
                          key={item.step}
                          style={{
                            border: '1px solid #f1f5f9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: isExp ? '#f8fafc' : '#ffffff'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedSteps(prev => ({ ...prev, [item.step]: !prev[item.step] }))}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {item.step}
                              </span>
                              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{item.title}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>• {item.summary}</span>
                            </div>
                            {isExp ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                          </button>
                          {isExp && (
                            <div style={{ padding: '4px 12px 10px 40px', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                              {item.detail}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentStep(5);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <span>Finalize & Review Treatment</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STEP 5: REVIEW (Consolidated Treatment Summary)
            ═══════════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#003666',
                color: '#ffffff',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Consolidated Clinical Treatment Plan Summary
                  </span>
                </div>
                <span style={{ fontSize: '0.70rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  Validated
                </span>
              </div>

              {/* Specification Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1px',
                background: '#e2e8f0',
                padding: '1px'
              }}>
                {[
                  { label: 'Active Compound', value: `${product.canonicalName || product.name || 'Peptide'}${product.scientificName ? ` (${product.scientificName})` : ''}` },
                  { label: 'Selected Protocol', value: activeProtocol.name },
                  { label: 'Treatment Duration', value: `${physicianDurationWeeks} Weeks (${procCalc.totalAdministrations} ${isNasal ? 'metered sprays' : isPen ? 'injections' : 'administrations'})` },
                  { label: 'Dose per Administration', value: `${formatClinicalDose(physicianDoseMg)} per ${isNasal ? 'intranasal dose' : isPen ? 'SubQ injection (Pen)' : 'SubQ injection'}` },
                  { label: 'Selected Presentation', value: isNasal ? `${procCalc.unitStrengthMg || 30} mg Nasal Spray Bottle (${procCalc.containerVolumeMl || (procCalc.unitStrengthMg === 30 ? 4 : 10)} mL)` : isPen ? `${procCalc.unitStrengthMg || 6} mg Multi-Dose Pen (3 mL)` : `${selectedVialStrength} mg Lyophilized Vial (${product.supplierName || 'Verified Laboratory'})` },
                  ...(isNasal ? [
                    { label: 'Delivery Vehicle', value: 'Pre-mixed isotonic nasal saline solution' },
                    { label: 'Actuator Output', value: `0.10 mL per metered puff (~${procCalc.totalSpraysPerBottle || 40} total sprays, ${procCalc.dosePerSprayDisplay || '750 mcg'}/puff)` },
                    { label: 'Administration Method', value: procCalc.spraysPerDose <= 1 ? '1 spray daily (alternate nostrils daily)' : `${Math.ceil(procCalc.spraysPerDose / 2)} spray left + ${Math.floor(procCalc.spraysPerDose / 2)} spray right nostril daily (30s gap)` },
                    { label: 'Clinical Technique', value: 'Contralateral cross-hand (aim towards ear, 15° forward tilt)' },
                    { label: 'Chronobiology Window', value: 'Morning / Midday (08:00–13:00)' },
                    { label: 'Storage Condition', value: 'Refrigerated 2°C–8°C once opened (do not freeze)' },
                    { label: 'Total Supply Required', value: procCalc.procurementSummary },
                  ] : isPen ? [
                    { label: 'Cartridge Type', value: '3 mL Factory Pre-filled sterile cartridge' },
                    { label: 'Needle Specification', value: '31G / 32G 4mm Sterile Nano-Needles' },
                    { label: 'Administration Method', value: 'Subcutaneous injection via calibrated dial' },
                    { label: 'Storage Condition', value: 'Refrigerated 2°C–8°C' },
                    { label: 'Total Pens Required', value: procCalc.procurementSummary },
                  ] : [
                    { label: 'Reconstitution Diluent', value: `${selectedBacVolume.toFixed(1)} mL Bacteriostatic Water` },
                    { label: 'Solution Concentration', value: reconCalc.concentrationDisplay },
                    { label: 'Draw per Administration', value: `${reconCalc.injectionVolumeDisplay} / ${reconCalc.syringeUnitsDisplay}` },
                    { label: 'Yield per Vial', value: `${reconCalc.dosesPerVial} administrations` },
                    { label: 'Total Vials Required', value: procCalc.procurementSummary },
                  ])
                ].map((row, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriber Responsibility Notice (Contextual & Clean) */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong>Prescriber Notice:</strong> Calculated volumetric yields are clinical estimates based on sterile reconstitution guidelines. Final dose administration remains the clinical discretion of the licensed healthcare practitioner.
              </p>
            </div>

            {/* Final Action CTAs (Google Cloud Console UX Standard) */}
            <div className="pds-protocol-step-footer gcp-action-bar">
              {/* Primary Procurement CTA (Prominent full width on mobile, rightmost on desktop) */}
              <div className="gcp-action-primary-slot">
                <button
                  type="button"
                  onClick={handleAddRequirementsToCart}
                  className={`gcp-action-btn ${user ? 'success' : 'primary'}`}
                  title={user ? "Request quote and order vials for this protocol" : "Sign in required to request quotation"}
                >
                  {user ? (
                    <>
                      <ShoppingCart size={15} /> <span>Request Quote / Order Vials</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} /> <span>Sign in to Request Quotation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Clinical & Utility Actions (2-column symmetric grid on mobile, inline on desktop) */}
              <div className="gcp-action-secondary-group">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      triggerHaptic('warning');
                      toast.error('Sign in required: Please log in as a practitioner to add protocols to a patient plan.');
                      const redirectUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
                      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
                      return;
                    }
                    triggerHaptic('medium');
                    toast.success(`Protocol ${activeProtocol.name} added to Patient Treatment plan ✓`);
                  }}
                  className="gcp-action-btn secondary"
                  title={user ? "Add protocol to patient treatment plan" : "Sign in required to add to patient protocol"}
                >
                  {!user ? <Lock size={13} style={{ opacity: 0.8 }} /> : <Plus size={14} />}
                  <span>Add to Protocol</span>
                </button>

                {onOpenPreviewModal && (
                  <button
                    type="button"
                    onClick={onOpenPreviewModal}
                    className="gcp-action-btn neutral"
                    title="Print or export clinical summary"
                  >
                    <Printer size={14} /> <span>Print Summary</span>
                  </button>
                )}
              </div>

              {/* Navigation Return Action (Clean bottom link/button on mobile, leftmost on desktop) */}
              <div className="gcp-action-nav-slot">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setCurrentStep(4);
                  }}
                  className="gcp-action-btn neutral"
                >
                  <ArrowLeft size={14} /> <span>Back to Step 4</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Google Cloud Alternative Protocol Blueprints Section ── */}
        {otherProtocols.length > 0 && (
          <section className="pds-other-protocols-section" aria-label="Alternative Clinical Protocols">
            <div className="pds-other-protocols-header">
              <div className="pds-other-protocols-title-group">
                <div className="pds-other-protocols-icon-box">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <h4 className="pds-other-protocols-title">
                    Alternative Clinical Protocols for {canonicalName}
                  </h4>
                  <p className="pds-other-protocols-subtitle">
                    Select an alternative blueprint below to re-titrate vial requirements and administration schedules.
                  </p>
                </div>
              </div>
              <span className="pds-other-protocols-count-badge">
                {otherProtocols.length} other {otherProtocols.length === 1 ? 'option' : 'options'}
              </span>
            </div>

            <div className="pds-other-protocols-grid">
              {otherProtocols.map(other => (
                <div key={other.id} className="pds-other-protocol-card">
                  <div>
                    <div className="pds-other-card-meta">
                      <span className="pds-other-card-category">{other.category || 'Clinical'}</span>
                      <span className="pds-other-card-duration">
                        <Clock size={11} /> {other.durationWeeks} Weeks
                      </span>
                    </div>

                    <h5 className="pds-other-card-title">
                      {sanitizeProtocolTitle(other.name, canonicalName)}
                    </h5>

                    <p className="pds-other-card-objective">
                      {other.objective}
                    </p>

                    <div className="pds-other-card-specs">
                      <span className="pds-other-spec-pill dose">
                        {other.defaultDoseMg || 1.25} mg / admin
                      </span>
                      <span className="pds-other-spec-pill cadence">
                        • {other.defaultDosesPerWeek || 2}× per week
                      </span>
                    </div>
                  </div>

                  <div className="pds-other-card-actions">
                    <button
                      type="button"
                      onClick={() => handleSelectProtocol(other.id)}
                      className="pds-other-switch-btn"
                    >
                      <RotateCcw size={13} />
                      <span>Switch to this Protocol</span>
                    </button>

                    <a
                      href={other.slug ? `/proto/${other.slug}` : (other.id ? `/proto/${other.id}` : `/proto/${product.slug || 'protocol'}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pds-other-link-btn"
                      title="View full protocol in new window"
                    >
                      <span>Full Blueprint</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Google Cloud Console Protocol Selector & Comparison Modal (Mobile/Tablet Sheet) ── */}
      {isProtocolModalOpen && (
        <div
          className="pds-gcp-bottom-sheet-backdrop"
          onClick={() => setIsProtocolModalOpen(false)}
        >
          <div
            className="pds-gcp-bottom-sheet-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pds-protocol-modal-title"
          >
            <div className="pds-gcp-bottom-sheet-drag-handle" />

            <div className="pds-gcp-bottom-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#003666',
                  flexShrink: 0
                }}>
                  <Layers size={16} />
                </div>
                <div>
                  <h3 id="pds-protocol-modal-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#003666' }}>
                    Clinical Protocol Blueprints
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Compare available treatment strategies for {canonicalName} ({availableProtocols.length} verified)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProtocolModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pds-gcp-bottom-sheet-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableProtocols.map((proto, idx) => {
                  const isSelected = proto.id === selectedProtocolId;
                  return (
                    <div
                      key={proto.id}
                      style={{
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        border: isSelected ? '2px solid #003666' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              color: isSelected ? '#003666' : '#64748b',
                              background: isSelected ? '#dbeafe' : '#f1f5f9',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              Blueprint #{idx + 1}
                            </span>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#0284c7'
                            }}>
                              {proto.category}
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 850, color: isSelected ? '#003666' : '#0f172a' }}>
                            {sanitizeProtocolTitle(proto.name, canonicalName)}
                          </h4>
                        </div>

                        {isSelected && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.70rem',
                            fontWeight: 800,
                            background: '#003666',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            flexShrink: 0
                          }}>
                            <Check size={11} /> Selected
                          </span>
                        )}
                      </div>

                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                        {proto.objective}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
                          <span style={{ fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={12} /> {proto.durationWeeks} Weeks
                          </span>
                          <span style={{ fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                            {proto.defaultDoseMg || proto.phases?.[0]?.doseMg || 2.5} mg / dose
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={proto.slug ? `/proto/${proto.slug}` : `/proto/${product.slug || 'protocol'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: '#003666',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <span>Blueprint</span>
                            <ExternalLink size={11} />
                          </a>

                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectProtocol(proto.id);
                                setIsProtocolModalOpen(false);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 12px',
                                background: '#003666',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <span>Apply Protocol</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
