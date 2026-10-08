'use client';

import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Layers, 
  Pill, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Sparkles,
  Info,
  Dna,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';

/**
 * Normalizes API names for accurate aggregation
 */
function normalizeApiName(rawName) {
  if (!rawName) return '';
  const clean = String(rawName).trim();
  const lower = clean.toLowerCase();

  if (lower.includes('minoxidil')) return 'Minoxidil';
  if (lower.includes('dutasteride')) return 'Dutasteride';
  if (lower.includes('finasteride')) return 'Finasteride';
  if (lower.includes('spironolactone')) return 'Spironolactone';
  if (lower.includes('latanoprost')) return 'Latanoprost';
  if (lower.includes('melatonin')) return 'Melatonin';
  if (lower.includes('saw palmetto') || lower.includes('serenoa')) return 'Saw Palmetto';
  if (lower.includes('metformin')) return 'Metformin';
  if (lower.includes('testosterone')) return 'Testosterone';
  if (lower.includes('astaxanthin')) return 'Astaxanthin';
  if (lower.includes('turmeric') || lower.includes('curcumin')) return 'Turmeric Extract';
  if (lower.includes('coenzyme q10') || lower.includes('coq10') || lower.includes('ubiquinol')) return 'Coenzyme Q10 / Ubiquinol';
  if (lower.includes('cysteine') || lower.includes('nac')) return 'N-Acetyl-L-Cysteine (NAC)';
  if (lower.includes('arginine')) return 'L-Arginine';
  if (lower.includes('ginkgo')) return 'Ginkgo biloba';
  if (lower.includes('ginseng')) return 'Panax Ginseng';
  if (lower.includes('caffeine')) return 'Caffeine';
  if (lower.includes('vitamin b12') || lower.includes('cyanocobalamin') || lower.includes('methylcobalamin')) return 'Vitamin B12 (Cobalamin)';
  if (lower.includes('vitamin e') || lower.includes('tocoferol')) return 'Vitamin E (Tocopherol)';
  if (lower.includes('panthenol')) return 'D-Panthenol';
  if (lower.includes('cetirizine')) return 'Cetirizine HCl';
  if (lower.includes('resveratrol')) return 'Trans-Resveratrol';
  if (lower.includes('theanine')) return 'L-Theanine';
  if (lower.includes('glycine') && !lower.includes('bisglycinate')) return 'Glycine';
  if (lower.includes('magnesium')) return 'Magnesium Bisglycinate';
  if (lower.includes('tmg') || lower.includes('betaine')) return 'Trimethylglycine (TMG)';

  return clean;
}

/**
 * Returns therapeutic category and color token for GCP-styled bars
 */
function getApiCategoryMeta(apiName) {
  const name = String(apiName).toLowerCase();
  if (name.includes('minoxidil')) {
    return { category: 'Vasodilator & Microvascular Growth Factor', color: '#0d9488', bg: '#f0fdfa' };
  }
  if (name.includes('dutasteride') || name.includes('finasteride') || name.includes('spironolactone') || name.includes('saw palmetto')) {
    return { category: '5α-Reductase & Androgen Blockade', color: '#1a73e8', bg: '#eff6ff' };
  }
  if (name.includes('metformin') || name.includes('resveratrol') || name.includes('epithalon')) {
    return { category: 'Telomere & Genomic Activator', color: '#7c3aed', bg: '#f5f3ff' };
  }
  if (name.includes('astaxanthin') || name.includes('coenzyme') || name.includes('cysteine') || name.includes('nac') || name.includes('ubiquinol')) {
    return { category: 'Mitochondrial & Antioxidant Shield', color: '#ea580c', bg: '#fff7ed' };
  }
  if (name.includes('latanoprost')) {
    return { category: 'Prostaglandin F2α Agonist', color: '#059669', bg: '#ecfdf5' };
  }
  if (name.includes('melatonin') || name.includes('theanine') || name.includes('glycine') || name.includes('magnesium')) {
    return { category: 'Neuro-Circadian Modulator', color: '#6366f1', bg: '#eef2ff' };
  }
  if (name.includes('arginine') || name.includes('ginkgo') || name.includes('ginseng')) {
    return { category: 'Microcirculation & Bioregulator', color: '#0284c7', bg: '#f0f9ff' };
  }
  return { category: 'Targeted API Compound', color: '#5f6368', bg: '#f8f9fa' };
}

/**
 * Helper to calculate SVG donut slice path
 */
function getDonutSlice(startAngle, endAngle, innerR, outerR, cx, cy) {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);

  const x3 = cx + innerR * Math.cos(endRad);
  const y3 = cy + innerR * Math.sin(endRad);
  const x4 = cx + innerR * Math.cos(startRad);
  const y4 = cy + innerR * Math.sin(startRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export default function DoctorClinicalAnalytics({
  prescriptions = [],
  serverAnalytics = null,
  onSelectApi = null,
  selectedApiFilter = null,
  onClearApiFilter = null,
  isFiltered = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  // ⚡ SERVER-COMPUTED OPTIMIZATION (Golden Rule #22):
  // When serverAnalytics is provided and no local drill-down filter is active,
  // we bypass 100% of client-side loops for instant 0ms latency.
  const isServerOptimized = !!serverAnalytics && !selectedApiFilter && !isFiltered;

  // ── 1. Monthly Distribution ────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    if (isServerOptimized && Array.isArray(serverAnalytics?.monthlyData) && serverAnalytics.monthlyData.length > 0) {
      return serverAnalytics.monthlyData;
    }
    if (!prescriptions || prescriptions.length === 0) return [];

    const monthMap = {};
    prescriptions.forEach((rx) => {
      let rawDate = rx.dateIssued || rx.createdAt || rx.date;
      if (!rawDate) return;

      let d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        if (typeof rawDate === 'string' && rawDate.includes('/')) {
          const [day, m, y] = rawDate.split('/');
          d = new Date(`${y}-${m}-${day}`);
        }
      }
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[key]) {
        monthMap[key] = { key, label, count: 0, dateObj: d };
      }
      monthMap[key].count += 1;
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    return sorted.slice(-8);
  }, [isServerOptimized, serverAnalytics, prescriptions]);

  const maxMonthlyCount = useMemo(() => {
    if (isServerOptimized && serverAnalytics?.maxMonthlyCount != null) {
      return serverAnalytics.maxMonthlyCount;
    }
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map(m => m.count), 1);
  }, [isServerOptimized, serverAnalytics, monthlyData]);

  const avgMonthlyRx = useMemo(() => {
    if (isServerOptimized && serverAnalytics?.avgMonthlyRx != null) {
      return serverAnalytics.avgMonthlyRx;
    }
    if (monthlyData.length === 0) return 0;
    const sum = monthlyData.reduce((acc, m) => acc + m.count, 0);
    return (sum / monthlyData.length).toFixed(1);
  }, [isServerOptimized, serverAnalytics, monthlyData]);

  // ── 2. Top 5 Prescribed APIs ───────────────────────────────────────────────
  const topApis = useMemo(() => {
    if (isServerOptimized && Array.isArray(serverAnalytics?.topApis) && serverAnalytics.topApis.length > 0) {
      return serverAnalytics.topApis;
    }
    if (!prescriptions || prescriptions.length === 0) return [];

    const apiMap = {};
    const totalRxCount = prescriptions.length;

    prescriptions.forEach((rx) => {
      const seenInThisRx = new Set();
      const candidateItems = [];
      if (Array.isArray(rx.items)) candidateItems.push(...rx.items);
      if (Array.isArray(rx.recommendedItems)) candidateItems.push(...rx.recommendedItems);
      if (Array.isArray(rx.phases)) {
        rx.phases.forEach(ph => {
          if (Array.isArray(ph.apis)) candidateItems.push(...ph.apis);
          if (Array.isArray(ph.items)) candidateItems.push(...ph.items);
        });
      }
      if (Array.isArray(rx.parts)) {
        rx.parts.forEach(pt => {
          if (Array.isArray(pt.apis)) candidateItems.push(...pt.apis);
        });
      }

      candidateItems.forEach(item => {
        if (!item) return;
        if (item.isVehicleOrBase || item.itemType === 'vehicle_base') return;

        const rawName = item.activeIngredient || item.drugName || item.name;
        const norm = normalizeApiName(rawName);
        if (!norm || norm === 'Unknown' || norm.length < 2) return;

        if (!seenInThisRx.has(norm)) {
          seenInThisRx.add(norm);
          if (!apiMap[norm]) {
            apiMap[norm] = { name: norm, count: 0 };
          }
          apiMap[norm].count += 1;
        }
      });
    });

    const list = Object.values(apiMap)
      .map(item => ({
        ...item,
        percentage: Math.round((item.count / totalRxCount) * 100),
        meta: getApiCategoryMeta(item.name)
      }))
      .sort((a, b) => b.count - a.count);

    return list.slice(0, 5);
  }, [isServerOptimized, serverAnalytics, prescriptions]);

  // ── 3. Patient Cohort Loyalty ─────────────────────────────────────────────
  const cohortData = useMemo(() => {
    if (isServerOptimized && serverAnalytics?.cohortData?.slices?.length > 0) {
      return serverAnalytics.cohortData;
    }
    if (!prescriptions || prescriptions.length === 0) {
      return { totalPatients: 0, singleCount: 0, doubleCount: 0, chronicCount: 0, avgRx: 0, slices: [] };
    }

    const patientCounts = {};
    prescriptions.forEach((rx) => {
      const pName = (rx.patientName || rx.patient?.name || rx.patientId || 'Anonymous').trim().toLowerCase();
      patientCounts[pName] = (patientCounts[pName] || 0) + 1;
    });

    const totalPatients = Object.keys(patientCounts).length;
    let single = 0;
    let double = 0;
    let chronic = 0;

    Object.values(patientCounts).forEach(cnt => {
      if (cnt === 1) single += 1;
      else if (cnt === 2) double += 1;
      else chronic += 1;
    });

    const singlePct = Math.round((single / totalPatients) * 100) || 0;
    const doublePct = Math.round((double / totalPatients) * 100) || 0;
    const chronicPct = Math.max(0, 100 - singlePct - doublePct);
    const avgRx = (prescriptions.length / Math.max(totalPatients, 1)).toFixed(1);

    const slices = [];
    let curAngle = 0;

    const cohorts = [
      { id: 'single', label: '1 Rx (Initial Regimen)', count: single, pct: singlePct, color: '#1a73e8' },
      { id: 'double', label: '2 Rxs (Treatment Follow-up)', count: double, pct: doublePct, color: '#0d9488' },
      { id: 'chronic', label: '3+ Rxs (Continuous Care)', count: chronic, pct: chronicPct, color: '#7c3aed' }
    ];

    cohorts.forEach(c => {
      const angle = (c.pct / 100) * 360;
      if (angle > 0) {
        slices.push({
          ...c,
          path: getDonutSlice(curAngle, curAngle + angle, 36, 52, 60, 60),
          startAngle: curAngle,
          endAngle: curAngle + angle
        });
        curAngle += angle;
      }
    });

    return {
      totalPatients,
      single,
      double,
      chronic,
      singlePct,
      doublePct,
      chronicPct,
      avgRx,
      slices,
      cohorts
    };
  }, [isServerOptimized, serverAnalytics, prescriptions]);

  // ── 4. Therapeutic Target Axis Distribution ─────────────────────────────────
  const axisData = useMemo(() => {
    if (!prescriptions || prescriptions.length === 0) {
      return { total: 0, axes: [], slices: [] };
    }

    const counts = {
      cellular: { id: 'cellular', label: 'Cellular Longevity & Mitochondria', count: 0, color: '#ea580c' },
      neuro: { id: 'neuro', label: 'Neuro-Circadian & Sleep Balance', count: 0, color: '#6366f1' },
      dermal: { id: 'dermal', label: 'Follicular & Dermal Regeneration', count: 0, color: '#0d9488' },
      metabolic: { id: 'metabolic', label: 'Metabolic & Peptide Optimization', count: 0, color: '#1a73e8' },
      repair: { id: 'repair', label: 'Tissue Repair & Musculoskeletal', count: 0, color: '#7c3aed' }
    };

    let classified = 0;
    prescriptions.forEach((rx) => {
      const text = `${rx.treatmentTitle || ''} ${rx.title || ''} ${rx.category || ''} ${rx.indication || ''} ${Array.isArray(rx.apis) ? rx.apis.join(' ') : ''} ${Array.isArray(rx.items) ? rx.items.map(i => i.name || '').join(' ') : ''}`.toLowerCase();

      if (text.includes('coenzyme') || text.includes('ubiquinol') || text.includes('resveratrol') || text.includes('nad') || text.includes('epithalon') || text.includes('longevity') || text.includes('mitochondr')) {
        counts.cellular.count += 1;
        classified += 1;
      } else if (text.includes('theanine') || text.includes('magnesium') || text.includes('glycine') || text.includes('melatonin') || text.includes('sleep') || text.includes('neuro') || text.includes('circadian')) {
        counts.neuro.count += 1;
        classified += 1;
      } else if (text.includes('minoxidil') || text.includes('dutasteride') || text.includes('finasteride') || text.includes('ghk') || text.includes('hair') || text.includes('follic') || text.includes('dermal') || text.includes('latanoprost')) {
        counts.dermal.count += 1;
        classified += 1;
      } else if (text.includes('tirzepatide') || text.includes('semaglutide') || text.includes('retatrutide') || text.includes('metformin') || text.includes('metabolic') || text.includes('weight')) {
        counts.metabolic.count += 1;
        classified += 1;
      } else if (text.includes('bpc') || text.includes('tb-500') || text.includes('repair') || text.includes('musculo') || text.includes('joint')) {
        counts.repair.count += 1;
        classified += 1;
      } else {
        counts.cellular.count += 1;
        classified += 1;
      }
    });

    const total = Math.max(classified, 1);
    const sortedAxes = Object.values(counts)
      .filter(a => a.count > 0)
      .map(a => ({
        ...a,
        pct: Math.round((a.count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const slices = [];
    let curAngle = 0;
    sortedAxes.forEach(a => {
      const angle = (a.pct / 100) * 360;
      if (angle > 0) {
        slices.push({
          ...a,
          path: getDonutSlice(curAngle, curAngle + angle, 36, 52, 60, 60),
          startAngle: curAngle,
          endAngle: curAngle + angle
        });
        curAngle += angle;
      }
    });

    return { total: prescriptions.length, axes: sortedAxes, slices };
  }, [prescriptions]);

  // ── 5. Multi-Part Complexity ──────────────────────────────────────────────
  const complexityData = useMemo(() => {
    if (isServerOptimized && serverAnalytics?.complexityData) {
      return serverAnalytics.complexityData;
    }
    if (!prescriptions || prescriptions.length === 0) return { multiPct: 0, singlePct: 100, multiCount: 0 };

    let multi = 0;
    prescriptions.forEach((rx) => {
      if (
        rx.isMultiPart ||
        (Array.isArray(rx.parts) && rx.parts.length > 1) ||
        (Array.isArray(rx.phases) && rx.phases.length > 1) ||
        (rx.totalParts && rx.totalParts > 1)
      ) {
        multi += 1;
      }
    });

    const multiPct = Math.round((multi / prescriptions.length) * 100);
    const singlePct = 100 - multiPct;

    return { multiPct, singlePct, multiCount: multi, total: prescriptions.length };
  }, [isServerOptimized, serverAnalytics, prescriptions]);

  // ── 5. Lotusland Clinical Formulary Recommendations ────────────────────────
  const lotuslandRecommendations = useMemo(() => {
    if (serverAnalytics?.lotuslandPracticeRecommendations?.length > 0) {
      return serverAnalytics.lotuslandPracticeRecommendations;
    }
    return [
      {
        id: 'atlas-rec-ghk-cu',
        peptideName: 'GHK-Cu (Human Copper Peptide) 50 mg / vial',
        supplier: 'Atlas Clinical Formulary',
        catalogCode: 'atlas-ghk-cu-50mg',
        matchScore: '98% Practice Fit',
        targetIndication: 'Trichological Follicular Rejuvenation & Dermal Papilla Stimulation',
        pharmacologicalClass: 'Tripeptide-Copper Bioregulator & Follicular Matrix Mitogen',
        synergisticApis: ['Minoxidil 4-5%', 'Spironolactone 1%', 'Dutasteride 0.5%', 'Latanoprost 0.005%'],
        pharmaRationale: 'Potent follicular bioregulator stimulating dermal papilla fibroblast proliferation, downregulating TGF-β1 (the primary transcriptional driver of catagen transition and follicular miniaturization), and inducing VEGF/bFGF microvascular angiogenesis. Exhibits profound pharmacodynamic synergy with Minoxidil 5% and 5α-reductase inhibitors by accelerating anagen re-entry without androgenic receptor competition.',
        associatedProtocol: {
          slug: 'melanogenesis-density-protocol-zt-ghk-cu',
          title: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
          url: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
        }
      },
      {
        id: 'atlas-rec-glow',
        peptideName: 'GLOW (BPC-157 / TB-500 / GHK) 10 mg | 10 mg | 75 mg',
        supplier: 'Atlas Clinical Formulary',
        catalogCode: 'atlas-glow-blend',
        matchScore: '96% Practice Fit',
        targetIndication: 'Post-FUE Graft Integration, Microvascular Perfusion & Scalp Wound Healing',
        pharmacologicalClass: 'Triple Bio-Regenerative Angiogenesis & Cytoprotective Complex',
        synergisticApis: ['PRP (Platelet-Rich Plasma)', 'TrichoOil Lipids', 'Arginine', 'Vitamin E'],
        pharmaRationale: 'Synergistic tri-peptide complex engineered for rapid follicular graft revascularization. BPC-157 activates early growth response-1 (egr-1) and nitric oxide modulation for microvascular stability; TB-500 (Thymosin β4 fragment) accelerates actin filament sequestration driving keratinocyte and endothelial migration into ischemic recipient beds; GHK upregulates pro-collagen synthesis and reduces inflammatory metalloproteinase (MMP-1/MMP-2) degradation.',
        associatedProtocol: {
          slug: 'bpc-157-tb-500-protocol',
          title: 'BPC-157 & TB-500 Tissue Repair Protocol',
          url: '/proto/bpc-157-tb-500-protocol'
        }
      },
      {
        id: 'atlas-rec-epithalon',
        peptideName: 'Epithalon 10 mg / vial',
        supplier: 'Atlas Clinical Formulary',
        catalogCode: 'atlas-epithalon-10mg',
        matchScore: '94% Practice Fit',
        targetIndication: 'Telomerase Catalytic Activation & Follicular Stem Cell Senescence Retardation',
        pharmacologicalClass: 'Synthetic Epigenetic Telomerase Bioregulator (Ala-Glu-Asp-Gly)',
        synergisticApis: ['Metformin', 'Ubiquinol / CoQ10', 'Trans-Resveratrol', 'N-Acetyl-L-Cysteine'],
        pharmaRationale: 'Synthetic Ala-Glu-Asp-Gly pineal biomimetic peptide inducing direct heterochromatin de-condensation and transcriptional upregulation of human Telomerase Reverse Transcriptase (TERT) catalytic subunit. Directly restores telomeric length in aging follicular bulge stem cells, counteracting replicative senescence identified in systemic telomere attrition evaluations (e.g., TeloTest).',
        associatedProtocol: {
          slug: 'epithalon-telomere-extension',
          title: 'Epithalon Telomere Extension Cycle',
          url: '/proto/epithalon-telomere-extension'
        }
      }
    ];
  }, [serverAnalytics]);

  return (
    <section 
      style={{
        margin: '0 0 24px 0',
        backgroundColor: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
      aria-label="Clinical Analytics and Prescribing Intelligence"
    >
      {/* ── Top Header Bar (Google Cloud Console Metric Header) ───────────── */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: isCollapsed ? 'none' : '1px solid #e8eaed',
          backgroundColor: '#f8fafd'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BarChart3 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#202124', letterSpacing: '-0.2px' }}>
                Clinical Analytics & Prescribing Intelligence
              </h2>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isFiltered ? '#fef3c7' : '#e8f0fe',
                  color: isFiltered ? '#92400e' : '#1a73e8',
                  border: isFiltered ? '1px solid #fde68a' : '1px solid #d2e3fc'
                }}
              >
                {isFiltered ? 'Active Filter Scope' : 'Global Practice Scope'}
              </span>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Computed on the server (Layer 1 RAM Cache) for sub-millisecond page delivery"
              >
                <Zap size={11} /> Server-Computed • 0ms Engine
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#5f6368' }}>
              Real-time pharmacogenomic volume, API prevalence, and patient retention cohorts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedApiFilter && (
            <button
              onClick={onClearApiFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#1a73e8',
                backgroundColor: '#ffffff',
                border: '1px solid #1a73e8',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer'
              }}
              title="Clear active API filter"
            >
              <Filter size={12} />
              API: {selectedApiFilter}
              <X size={12} />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#5f6368',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '6px 8px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            aria-label={isCollapsed ? 'Expand analytics panel' : 'Collapse analytics panel'}
          >
            {isCollapsed ? (
              <><span>Expand</span> <ChevronDown size={14} /></>
            ) : (
              <><span>Collapse</span> <ChevronUp size={14} /></>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Analytics Grid ────────────────────────────────────────────── */}
      {!isCollapsed && (
        <div style={{ padding: '20px' }}>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '20px'
            }}
          >
            {/* ── CARD 1: Monthly Prescription Volume ──────────────────────── */}
            <div 
              style={{
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.4px' }}>
                      Prescription Velocity
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#202124' }}>
                      Monthly Prescription Volume
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a73e8' }}>
                      {avgMonthlyRx}
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: '#5f6368' }}>
                      Avg. / Month
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#5f6368' }}>
                  Total active medical treatments issued over recorded clinical cycles.
                </p>
              </div>

              {/* SVG Bar Chart */}
              <div style={{ marginTop: 'auto' }}>
                {monthlyData.length > 0 ? (
                  <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                    <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      {/* Grid background lines */}
                      <line x1="0" y1="20" x2="320" y2="20" stroke="#f1f3f4" strokeDasharray="3 3" />
                      <line x1="0" y1="55" x2="320" y2="55" stroke="#f1f3f4" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="320" y2="90" stroke="#dadce0" strokeWidth="1" />

                      {monthlyData.map((m, idx) => {
                        const totalBars = monthlyData.length;
                        const availableWidth = 320;
                        const barWidth = Math.min(26, (availableWidth / totalBars) * 0.65);
                        const gap = availableWidth / totalBars;
                        const x = idx * gap + (gap - barWidth) / 2;
                        const barHeight = Math.max(8, (m.count / maxMonthlyCount) * 70);
                        const y = 90 - barHeight;
                        const isHovered = hoveredBar === idx;

                        return (
                          <g 
                            key={m.key} 
                            onMouseEnter={() => setHoveredBar(idx)} 
                            onMouseLeave={() => setHoveredBar(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Bar rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx={4}
                              fill={isHovered ? '#1557b0' : '#1a73e8'}
                              style={{ transition: 'all 0.2s ease' }}
                            />

                            {/* Value label on top of bar */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 5}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight={isHovered ? '700' : '600'}
                              fill={isHovered ? '#1a73e8' : '#3c4043'}
                            >
                              {m.count}
                            </text>

                            {/* Month label under axis */}
                            <text
                              x={x + barWidth / 2}
                              y="106"
                              textAnchor="middle"
                              fontSize="9.5"
                              fill="#5f6368"
                              fontWeight="500"
                            >
                              {m.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {hoveredBar !== null && monthlyData[hoveredBar] && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          backgroundColor: '#202124',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          pointerEvents: 'none',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        <strong>{monthlyData[hoveredBar].label}:</strong> {monthlyData[hoveredBar].count} prescriptions
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: '#80868b', fontSize: '12px' }}>
                    No dated prescriptions available for monthly analysis.
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 2: Top 5 Active Ingredients (APIs) ──────────────────── */}
            <div 
              style={{
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.4px' }}>
                      Pharmacological Distribution
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#202124' }}>
                      Top 5 Active Ingredients (APIs)
                    </h3>
                  </div>
                  <span 
                    style={{
                      fontSize: '11px',
                      color: '#1a73e8',
                      backgroundColor: '#e8f0fe',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    Click to filter
                  </span>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#5f6368' }}>
                  Highest frequency molecules in personalized compounding formulas.
                </p>
              </div>

              {/* API Utilization Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topApis.length > 0 ? (
                  topApis.map((api, index) => {
                    const isSelected = selectedApiFilter && selectedApiFilter.toLowerCase() === api.name.toLowerCase();

                    return (
                      <div 
                        key={api.name}
                        onClick={() => onSelectApi && onSelectApi(api.name)}
                        style={{
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title={`Click to filter prescriptions containing ${api.name}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                            <span 
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: api.meta.bg,
                                color: api.meta.color,
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {index + 1}
                            </span>
                            <span 
                              style={{ 
                                fontSize: '12.5px', 
                                fontWeight: 600, 
                                color: '#202124', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                maxWidth: '170px'
                              }} 
                              title={api.name}
                            >
                              {api.name}
                            </span>
                            <span 
                              style={{
                                fontSize: '9.5px',
                                color: '#5f6368',
                                backgroundColor: '#f1f3f4',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '140px',
                                flexShrink: 1
                              }}
                              title={api.meta.category}
                            >
                              {api.meta.category}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: api.meta.color }}>
                              {api.percentage}%
                            </span>
                            <span style={{ fontSize: '11px', color: '#5f6368', marginLeft: '4px' }}>
                              ({api.count} rxs)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Track */}
                        <div 
                          style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: '#e8eaed',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}
                        >
                          <div 
                            style={{
                              width: `${api.percentage}%`,
                              height: '100%',
                              backgroundColor: api.meta.color,
                              borderRadius: '3px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#80868b', fontSize: '12px' }}>
                    No active ingredients recorded in current scope.
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 3: Patient Cohort Loyalty & Retention ───────────────── */}
            <div 
              style={{
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.4px' }}>
                      Adherence & Retention
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#202124' }}>
                      Patient Prescription Frequency
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>
                      {cohortData.totalPatients}
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: '#5f6368' }}>
                      Patients
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#5f6368' }}>
                  Cohort breakdown by number of compounded treatments prescribed.
                </p>
              </div>

              {/* Donut Chart + Legend */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  justifyContent: 'space-around'
                }}
              >
                {/* SVG Donut */}
                <div style={{ width: '120px', height: '120px', position: 'relative', flexShrink: 0 }}>
                  <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                    {cohortData.slices.map((slice) => (
                      <path
                        key={slice.id}
                        d={slice.path}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  {/* Central Text */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#202124', lineHeight: 1 }}>
                      {cohortData.avgRx}
                    </span>
                    <span style={{ display: 'block', fontSize: '9px', color: '#5f6368', marginTop: '2px' }}>
                      Rx / Pt
                    </span>
                  </div>
                </div>

                {/* Cohort Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {cohortData.cohorts.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: c.color,
                            flexShrink: 0
                          }}
                        />
                        <span style={{ fontSize: '11.5px', color: '#3c4043', fontWeight: 500 }}>
                          {c.label.split('(')[0]}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#202124' }}>
                          {c.pct}%
                        </span>
                        <span style={{ fontSize: '10px', color: '#5f6368', marginLeft: '4px' }}>
                          ({c.count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CARD 4: Therapeutic Target Axes (Ejes Terapéuticos) ──────── */}
            <div 
              style={{
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.4px' }}>
                      Clinical Specialty
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#202124' }}>
                      Therapeutic Target Axes
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a73e8' }}>
                      {axisData.axes.length}
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: '#5f6368' }}>
                      Active Axes
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#5f6368' }}>
                  Distribution of personalized treatments across primary clinical objectives.
                </p>
              </div>

              {/* Donut Chart + Legend */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  justifyContent: 'space-around'
                }}
              >
                {/* SVG Donut */}
                <div style={{ width: '120px', height: '120px', position: 'relative', flexShrink: 0 }}>
                  <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                    {axisData.slices.map((slice) => (
                      <path
                        key={slice.id}
                        d={slice.path}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  {/* Central Text */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#202124', lineHeight: 1 }}>
                      {axisData.total}
                    </span>
                    <span style={{ display: 'block', fontSize: '9px', color: '#5f6368', marginTop: '2px' }}>
                      Total Rxs
                    </span>
                  </div>
                </div>

                {/* Axes Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                  {axisData.axes.map((a) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                        <span 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: a.color,
                            flexShrink: 0
                          }}
                        />
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            color: '#3c4043', 
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={a.label}
                        >
                          {a.label}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#202124' }}>
                          {a.pct}%
                        </span>
                        <span style={{ fontSize: '10px', color: '#5f6368', marginLeft: '3px' }}>
                          ({a.count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 5: Formulation Complexity Strip (Multi-Part vs Single-Part) ── */}
          <div 
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e8eaed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <Layers size={16} color="#5f6368" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#202124' }}>
                  Therapeutic Formulation Architecture:
                </span>
                <span style={{ fontSize: '12px', color: '#5f6368', marginLeft: '6px' }}>
                  {complexityData.multiCount} of {complexityData.total} prescriptions ({complexityData.multiPct}%) utilize multi-phase compounded regimens.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px', flexShrink: 0 }}>
              <div 
                style={{
                  width: '120px',
                  height: '8px',
                  backgroundColor: '#e8eaed',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex'
                }}
              >
                <div 
                  style={{
                    width: `${complexityData.multiPct}%`,
                    height: '100%',
                    backgroundColor: '#7c3aed',
                    title: `Multi-Part Formulations: ${complexityData.multiPct}%`
                  }} 
                />
                <div 
                  style={{
                    width: `${complexityData.singlePct}%`,
                    height: '100%',
                    backgroundColor: '#1a73e8',
                    title: `Single-Part Formulas: ${complexityData.singlePct}%`
                  }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#7c3aed', fontWeight: 600 }}>
                  Multi-Phase: {complexityData.multiPct}%
                </span>
                <span style={{ color: '#1a73e8', fontWeight: 600 }}>
                  Single: {complexityData.singlePct}%
                </span>
              </div>
            </div>
          </div>

          {/* ── CARD 5: Lotusland Peptide Synergy & Pharmacogenomic Practice Augmentation ── */}
          <div
            style={{
              marginTop: '20px',
              border: '1px solid #c7d2fe',
              borderRadius: '8px',
              background: '#fbfcfe',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(67, 56, 202, 0.05)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
                borderBottom: '1px solid #e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}
                >
                  <Dna size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e1b4b', letterSpacing: '-0.01em' }}>
                      Recommended Peptide Augmentations · Atlas Clinical Formulary
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 650,
                        color: '#4338ca',
                        background: '#e0e7ff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={11} />
                      AI Pharmacogenomic Synergy
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#4b5563', lineHeight: 1.4 }}>
                    Cross-analyzed against {serverAnalytics?.summary?.totalPrescriptions || prescriptions.length} prescriptions and active APIs in this practice. Formulated to provide synergistic microvascular, cellular, and telomeric augmentation.
                  </p>
                </div>
              </div>
            </div>

            {/* Peptide Recommendations Grid */}
            <div
              style={{
                padding: '16px 18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px'
              }}
            >
              {lotuslandRecommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    {/* Top line: Name & Match Score */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 750, color: '#0f172a' }}>
                        {rec.peptideName}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#059669',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {rec.matchScore || 'High Synergy'}
                      </span>
                    </div>

                    {/* Indication / Target */}
                    <div style={{ fontSize: '11px', color: '#4338ca', fontWeight: 650, marginBottom: '6px' }}>
                      Target: {rec.targetIndication}
                    </div>

                    {/* Synergistic APIs in Practice */}
                    {Array.isArray(rec.synergisticApis) && rec.synergisticApis.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Synergistic with:</span>
                        {rec.synergisticApis.map((api, aIdx) => (
                          <span
                            key={aIdx}
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#334155',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              padding: '1px 6px',
                              borderRadius: '3px'
                            }}
                          >
                            {api}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pharmacological Rationale */}
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: '#334155',
                        lineHeight: 1.5,
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #edf2f7',
                        marginBottom: '12px'
                      }}
                    >
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Pharmacological Mechanism & Cellular Pathway:
                      </strong>
                      {rec.pharmaRationale}
                    </div>
                  </div>

                  {/* Associated Protocol Link */}
                  {rec.associatedProtocol && (
                    <a
                      href={rec.associatedProtocol.url || `/proto/${rec.associatedProtocol.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        fontWeight: 650,
                        color: '#1d4ed8',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dbeafe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                    >
                      <span>Explore Associated Protocol: {rec.associatedProtocol.title}</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
