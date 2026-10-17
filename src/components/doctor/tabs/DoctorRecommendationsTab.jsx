"use client";

import React from 'react';
import { Sparkles, Users, ArrowUpRight, Search, X } from 'lucide-react';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';

/**
 * DoctorRecommendationsTab
 * 
 * Atlas Recommendations & Clinical Synergy Master Formulary
 * Analyzes practice prescriptions across 4 therapeutic categories:
 * 1. Bioactive Peptides (Lotusland Research)
 * 2. Precision Nutraceuticals (UltraPerson by PharmaPolis)
 * 3. Precision Genomics & Pharmacogenetics (ETERNA® Diagnostics)
 * 4. Cuticular Barrier & Native ECM (Colway Clinical Care)
 */
export default function DoctorRecommendationsTab({
  allPrescriptions = [],
  recCategoryFilter = 'all',
  setRecCategoryFilter,
  recSearchQuery = '',
  setRecSearchQuery,
  setQuickRxFilter,
  setStatusFilter,
  setPatientFilter,
  setTemporalFilter,
  setApiFilter,
  setRecFilter,
  setActiveAnchor,
  triggerHaptic
}) {
  // 1. Process all prescriptions with their analyzed recs once
  const analyzedItems = allPrescriptions.map(rx => ({
    rx,
    recs: rx.atlasRecommendations || getPrescriptionAtlasRecommendations(rx)
  }));

  // Category 1: Bioactive Peptides Matches
  const ghkMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-ghk-cu-50mg');
  const glowMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-glow-blend');
  const epithalonMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-epithalon-10mg');
  const cjcMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-cjc-ipam-blend');
  const dsipMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-dsip-5mg');
  const bpcMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-bpc-157-10mg');

  // Category 2: Scalp Barrier & ECM Matches
  const colwayMatches = analyzedItems.filter(item => Boolean(item.recs?.colway));

  // Category 3: Precision Nutraceuticals (UltraPerson by PharmaPolis) Matches
  const ultrapersonEnergyMatches = analyzedItems.filter(item => {
    const slug = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return slug === 'ultraperson-energy-metabolic-vitality' || raw.includes('minoxidil') || raw.includes('coq10') || raw.includes('ubiquinol');
  });
  const ultrapersonLongevityMatches = analyzedItems.filter(item => {
    const slug = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return slug === 'ultraperson-longevity-cellular-renewal' || raw.includes('finasteride') || raw.includes('dutasteride') || raw.includes('resveratrol') || raw.includes('metformin');
  });
  const ultrapersonStressMatches = analyzedItems.filter(item => {
    const slug = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return slug === 'ultraperson-stress-resilience-emotional-balance' || raw.includes('stress') || raw.includes('cortisol') || raw.includes('ashwagandha') || raw.includes('bhrt') || raw.includes('dhea');
  });
  const ultrapersonSleepMatches = analyzedItems.filter(item => {
    const slug = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return slug === 'ultraperson-sleep-quality-restoration' || raw.includes('sleep') || raw.includes('melatonin') || raw.includes('theanine') || raw.includes('gaba');
  });

  // Category 4: ETERNA® Longevity & Pharmacogenomics Saliva/DNA Test Matches
  const eternaMatches = analyzedItems.filter(item => {
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return raw.includes('finasteride') ||
           raw.includes('dutasteride') ||
           raw.includes('minoxidil') ||
           raw.includes('epithalon') ||
           raw.includes('metformin') ||
           raw.includes('spironolactone') ||
           raw.includes('latanoprost') ||
           raw.includes('tricho') ||
           raw.includes('alopecia') ||
           raw.includes('longevity');
  });

  const candidateSolutions = [
    // ─── Bioactive Peptides (Lotusland Research) ───
    {
      id: 'atlas-ghk-cu-50mg',
      category: 'peptide',
      badge: 'BIOACTIVE PEPTIDE SIGNALER',
      title: 'GHK-Cu (Copper Tripeptide-1) 50 mg / vial',
      badgeColor: '#4338ca',
      badgeBg: '#e0e7ff',
      borderColor: '#c7d2fe',
      matchScore: '98% Synergy',
      target: 'Dermal Papilla Proliferation & TGF-β1 Catagen Blockade',
      summary: 'High-affinity follicular bioregulator stimulating dermal papilla fibroblasts, downregulating TGF-β1 miniaturization, and accelerating anagen re-entry in synergy with Minoxidil and antiandrogens.',
      synergisticApis: ['Minoxidil', 'Finasteride', 'Dutasteride', 'Spironolactone', 'Latanoprost', 'TrichoSol'],
      matchingItems: ghkMatches,
      protocolTitle: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
      protocolUrl: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    },
    {
      id: 'atlas-glow-blend',
      category: 'peptide',
      badge: 'TRIPLE REGENERATIVE COMPLEX',
      title: 'GLOW (BPC-157 / TB-500 / GHK) 10 mg | 10 mg | 75 mg',
      badgeColor: '#0369a1',
      badgeBg: '#e0f2fe',
      borderColor: '#bae6fd',
      matchScore: '99% Graft Synergy',
      target: 'Post-FUE Revascularization & Microvascular Graft Take',
      summary: 'Biocompatible tri-peptide complex engineered for accelerated follicular graft revascularization, nitric oxide microvascular stability, and early keratinocyte migration into recipient beds.',
      synergisticApis: ['PRP (Platelet-Rich Plasma)', 'FUE Micro-Grafts', 'TrichoOil Lipids', 'L-Arginine', 'Vitamin E'],
      matchingItems: glowMatches,
      protocolTitle: 'BPC-157 & TB-500 Tissue Repair Protocol',
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'atlas-epithalon-10mg',
      category: 'peptide',
      badge: 'EPIGENETIC TELOMERE REGULATOR',
      title: 'Epithalon (Ala-Glu-Asp-Gly) 10 mg / vial',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      borderColor: '#ddd6fe',
      matchScore: '99% Longevity Synergy',
      target: 'Telomerase Activation & Bulge Stem Cell Longevity',
      summary: 'Pineal biomimetic peptide inducing heterochromatin de-condensation and TERT upregulation, protecting follicular bulge stem cells against premature replicative senescence.',
      synergisticApis: ['Metformin', 'TeloTest™ Genomic Panels', 'CoQ10 / Ubiquinol', 'Trans-Resveratrol', 'NAC'],
      matchingItems: epithalonMatches,
      protocolTitle: 'Epithalon Telomere Extension Cycle',
      protocolUrl: '/proto/epithalon-telomere-extension'
    },
    {
      id: 'atlas-cjc-ipam-blend',
      category: 'peptide',
      badge: 'ENDOCRINE GH AXIS REGULATOR',
      title: 'CJC-1295 (No DAC) & Ipamorelin 5 mg / 5 mg',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      borderColor: '#bae6fd',
      matchScore: '97% Endocrine Synergy',
      target: 'Pulsatile Pituitary GH Axis & Body Composition Bioregulator',
      summary: 'Dual-action secretagogue stimulating physiological, pulsatile growth hormone and IGF-1 secretion without pituitary desensitization, synergizing with BHRT/TRT regimens.',
      synergisticApis: ['Testosterone', 'Estradiol', 'Progesterone', 'DHEA', 'Pentravan'],
      matchingItems: cjcMatches,
      protocolTitle: 'CJC-1295 & Ipamorelin Synergistic HGH Protocol',
      protocolUrl: '/proto/gh-rejuvenation-cjc-ipam'
    },
    {
      id: 'atlas-dsip-5mg',
      category: 'peptide',
      badge: 'NEURO-CIRCADIAN REGULATOR',
      title: 'DSIP (Delta Sleep-Inducing Peptide) 5 mg / vial',
      badgeColor: '#6366f1',
      badgeBg: '#e0e7ff',
      borderColor: '#c7d2fe',
      matchScore: '98% Neuro-Circadian Synergy',
      target: 'Central GABAergic & Pineal Circadian Neuro-Reset',
      summary: 'Nonapeptide crossing the blood-brain barrier to restore physiological slow-wave sleep (SWS) architecture, blunting hypercortisolemia and stabilizing autonomic tone.',
      synergisticApis: ['Melatonin', 'L-Theanine', 'GABA', 'Magnesium Glycinate'],
      matchingItems: dsipMatches,
      protocolTitle: 'DSIP Circadian Sleep Restoration Protocol',
      protocolUrl: '/proto/dsip-circadian-deep-sleep'
    },
    {
      id: 'atlas-bpc-157-10mg',
      category: 'peptide',
      badge: 'CYTOPROTECTIVE TISSUE REGULATOR',
      title: 'BPC-157 (Body Protection Compound) 10 mg / vial',
      badgeColor: '#0369a1',
      badgeBg: '#e0f2fe',
      borderColor: '#bae6fd',
      matchScore: '95% Biological Synergy',
      target: 'Endothelial Nitric Oxide Signaling & Cytoprotection',
      summary: 'Penta-decapeptide accelerating local tissue repair through endothelial nitric oxide synthase (eNOS) upregulation and VEGFR2 phosphorylation, stabilizing cellular extracellular matrices.',
      synergisticApis: ['Arginine', 'Glutamine', 'Zinc Carnosine', 'Hyaluronic Acid'],
      matchingItems: bpcMatches,
      protocolTitle: 'BPC-157 & TB-500 Cellular Repair Protocol',
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },

    // ─── Precision Nutraceuticals (UltraPerson by PharmaPolis) ───
    {
      id: 'ultraperson-energy-metabolic-vitality',
      category: 'supplement',
      badge: 'METABOLIC & MITOCHONDRIAL NUTRACEUTICAL',
      title: 'UltraPerson Energy & Metabolic Vitality (CoQ10 / PQQ / Ginseng)',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      borderColor: '#fde68a',
      matchScore: '99% Metabolic Synergy',
      target: 'Mitochondrial ATP Synthesis & Free Radical Neutralization',
      summary: 'Rate-limiting mitochondrial cofactors (PQQ, Ubiquinol/CoQ10 125mg, Alpha-Lipoic Acid, and Ginseng). Multiplies cellular bioenergetic efficiency and buffers tissue oxidative stress from active therapies.',
      synergisticApis: ['Oral & Topical Minoxidil', 'Metformin', 'CoQ10', 'Antioxidants', 'Alpha-Lipoic Acid'],
      matchingItems: ultrapersonEnergyMatches,
      protocolTitle: 'View UltraPerson Energy Monograph',
      protocolUrl: '/p/ultraperson-energy-metabolic-vitality'
    },
    {
      id: 'ultraperson-longevity-cellular-renewal',
      category: 'supplement',
      badge: 'SIRTUIN ACTIVATOR & SENOLYTIC',
      title: 'UltraPerson Longevity & Cellular Renewal (Sirtuin & Senolytic)',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      borderColor: '#fde68a',
      matchScore: '98% Sirtuin Synergy',
      target: 'SIRT1 Activation & Selective Senescent Cell Clearance (SASP)',
      summary: 'Micronized bioidentical Trans-Resveratrol, Liposomal Fisetin 100mg, and Phytosomal Curcumin. Induces selective autophagy and eliminates senescent cells secreting pro-inflammatory cytokines in the peribulbar and vascular microenvironment.',
      synergisticApis: ['Finasteride', 'Dutasteride', 'Epithalon', 'Metformin', 'Resveratrol'],
      matchingItems: ultrapersonLongevityMatches,
      protocolTitle: 'View UltraPerson Longevity Monograph',
      protocolUrl: '/p/ultraperson-longevity-cellular-renewal'
    },
    {
      id: 'ultraperson-stress-resilience-emotional-balance',
      category: 'supplement',
      badge: 'HPA AXIS & CORTISOL MODULATOR',
      title: 'UltraPerson Stress Resilience & Emotional Balance',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      borderColor: '#fde68a',
      matchScore: '97% Endocrine Balance',
      target: 'HPA Adrenal Axis Homeostasis & Peripheral Cortisol Blockade',
      summary: 'KSM-66 Ashwagandha standardized in withanolides and pure L-Theanine. Normalizes ACTH and serum cortisol spikes, preventing stress-induced telogen effluvium and peripheral hormone receptor inhibition.',
      synergisticApis: ['DHEA', 'BHRT Hormone Therapy', 'L-Theanine', 'Ashwagandha', 'Magnesium'],
      matchingItems: ultrapersonStressMatches,
      protocolTitle: 'View UltraPerson Stress Monograph',
      protocolUrl: '/p/ultraperson-stress-resilience-emotional-balance'
    },
    {
      id: 'ultraperson-sleep-quality-restoration',
      category: 'supplement',
      badge: 'DELTA DEEP SLEEP RESTORER',
      title: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
      badgeColor: '#4f46e5',
      badgeBg: '#e0e7ff',
      borderColor: '#c7d2fe',
      matchScore: '98% Restorative Sleep',
      target: 'GABAergic Allosteric Modulation Without Melatonin Desensitization',
      summary: 'Magnolia bark Honokiol/Magnolol, Apigenin, and Lemon Balm. Extends non-REM stage 3/4 sleep to maximize nocturnal physiological growth hormone release and tissue repair.',
      synergisticApis: ['Melatonin', 'GABA', 'DSIP', 'L-Theanine', 'Magnesium'],
      matchingItems: ultrapersonSleepMatches,
      protocolTitle: 'View UltraPerson Sleep Monograph',
      protocolUrl: '/p/ultraperson-sleep-quality-restoration'
    },

    // ─── Precision Genomics & Pharmacogenetics (ETERNA® Diagnostics) — Temporarily suspended until fully refined ───
    /*
    {
      id: 'eterna-longevity-pharmacogenomics-test',
      category: 'eterna',
      badge: 'PRECISION GENOMICS & PHARMACOGENETICS',
      title: 'ETERNA® Longevity & Pharmacogenomics Saliva/DNA Test Kit',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      borderColor: '#ddd6fe',
      matchScore: '99% Pharmacogenetic Match',
      target: 'CYP Polymorphism Mapping, SULT1A1 Enzyme, AR/SRD5A2 Genes & Telomere Wear',
      summary: 'Non-invasive saliva genetic test (72 key biomarkers). Assesses sulfotransferase (SULT1A1) Minoxidil activation rate, androgen receptor (AR) sensitivity, and hepatic CYP polymorphisms to calibrate exact compounded doses and predict therapeutic response with zero trial-and-error.',
      synergisticApis: ['Topical/Oral Minoxidil', 'Finasteride', 'Dutasteride', 'Epithalon', 'Metformin', 'TeloTest™'],
      matchingItems: eternaMatches,
      protocolTitle: 'Request ETERNA® DX Diagnostic Kit',
      protocolUrl: '/p/eterna-epigenetic-age-test'
    },
    */

    // ─── Barrier & Cuticular ECM (Colway Clinical Care) ───
    {
      id: 'colway-hair-system',
      category: 'colway',
      badge: 'SCALP BARRIER INTEGRITY & NATIVE ECM',
      title: 'Colway Hair Strengthening System (2-Step Routine)',
      badgeColor: '#047857',
      badgeBg: '#d1fae5',
      borderColor: '#a7f3d0',
      matchScore: '99% Barrier Support',
      target: 'Cuticular ECM Preservation & Vehicle Irritation Prevention',
      summary: 'Biologically active native tropocollagen and microcirculatory flavonoids (diosmin) engineered to calm the stratum corneum, seal cuticular scales, and counteract hydroalcoholic vehicle lipid depletion.',
      synergisticApis: ['TrichoSol Vehicle Base', 'Topical Minoxidil', 'Topical 5αR Inhibitors', 'TrichoOil'],
      matchingItems: colwayMatches,
      protocolTitle: 'View Colway Clinical Datasheet (Shampoo & Conditioner)',
      protocolUrl: '/p/colway-strengthening-shampoo'
    }
  ];

  // Priority Order (Descending): Sorted by number of matching patients/prescriptions in practice
  const masterSolutions = candidateSolutions
    .filter(sol => Array.isArray(sol.matchingItems) && sol.matchingItems.length > 0)
    .sort((a, b) => b.matchingItems.length - a.matchingItems.length);

  const filteredSolutions = masterSolutions.filter(sol => {
    if (recCategoryFilter && recCategoryFilter !== 'all') {
      if (recCategoryFilter === 'peptides' && sol.category !== 'peptide') return false;
      if (recCategoryFilter === 'supplements' && sol.category !== 'supplement') return false;
      if (recCategoryFilter === 'eterna' && sol.category !== 'eterna') return false;
      if (recCategoryFilter === 'colway' && sol.category !== 'colway') return false;
    }
    if (recSearchQuery.trim()) {
      const q = recSearchQuery.toLowerCase().trim();
      const matchTitle = (sol.title || '').toLowerCase().includes(q);
      const matchTarget = (sol.target || '').toLowerCase().includes(q);
      const matchBadge = (sol.badge || '').toLowerCase().includes(q);
      const matchSummary = (sol.summary || '').toLowerCase().includes(q);
      const matchApis = sol.synergisticApis.some(api => api.toLowerCase().includes(q));
      const matchPatients = sol.matchingItems.some(item =>
        (item.rx.patientName || '').toLowerCase().includes(q) ||
        (item.rx.code || item.rx.id || '').toLowerCase().includes(q)
      );
      return matchTitle || matchTarget || matchBadge || matchSummary || matchApis || matchPatients;
    }
    return true;
  });

  const totalCoveredRxs = new Set(
    masterSolutions.flatMap(s => s.matchingItems.map(item => item.rx.id || item.rx.code))
  ).size;

  return (
    <section
      id="recommendations"
      className="doctor-recommendations-section"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '110px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
      }}
    >
      {/* Top GCP Header & Practice Metrics */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#202124' }}>
              Atlas Recommendations &amp; Clinical Synergies
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#5f6368', maxWidth: '780px', lineHeight: 1.5 }}>
            Master formulary of bioactive adjuvants, UltraPerson nutraceuticals, ETERNA® genomics, and cuticular ECM barrier care. Consolidated across {masterSolutions.length} core {masterSolutions.length === 1 ? 'synergy' : 'synergies'} prioritized by patient prevalence in your practice.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: '0.74rem',
            background: '#ffffff',
            color: '#3c4043',
            border: '1px solid #dadce0',
            padding: '6px 12px',
            borderRadius: '4px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Users size={14} style={{ color: '#1a73e8' }} />
            <span><strong>{totalCoveredRxs}</strong> of {allPrescriptions.length} prescriptions with synergy</span>
          </div>
          <span style={{ fontSize: '0.74rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '6px 12px', borderRadius: '4px', fontWeight: 600 }}>
            ✓ {masterSolutions.length} Prioritized Master Formulation{masterSolutions.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Google Cloud Unified Search Toolbar (Rule #7 & Golden Standard) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '20px',
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '2px 10px 2px 14px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        transition: 'border-color 0.15s, box-shadow 0.15s'
      }}>
        <Search size={16} style={{ color: '#5f6368', flexShrink: 0, marginRight: '10px' }} />
        <input
          type="text"
          value={recSearchQuery}
          onChange={(e) => setRecSearchQuery(e.target.value)}
          placeholder="Search formulations by clinical target, API synergy, or patient name... (e.g. Minoxidil, GHK-Cu, Sleep, FUE)"
          style={{
            flex: 1,
            height: '38px',
            fontSize: '0.84rem',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#202124'
          }}
        />
        {recSearchQuery && (
          <button
            type="button"
            onClick={() => setRecSearchQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Clear search query"
            aria-label="Clear search query"
          >
            <X size={15} />
          </button>
        )}
        <div style={{
          marginLeft: '8px',
          padding: '3px 8px',
          background: '#f1f3f4',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#5f6368',
          whiteSpace: 'nowrap',
          border: '1px solid #dadce0'
        }}>
          {filteredSolutions.length} {filteredSolutions.length === 1 ? 'Solution Card' : 'Solution Cards'}
        </div>
      </div>

      {/* Solutions Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
        {filteredSolutions.map((sol) => {
          const count = sol.matchingItems.length;
          return (
            <div
              key={sol.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 20px',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Top Sub-Row: Badge, Title, Score, Action Links */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#3c4043',
                      background: '#f1f3f4',
                      border: '1px solid #dadce0',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {sol.badge}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#202124' }}>
                    {sol.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#137333',
                      background: '#e6f4ea',
                      border: '1px solid #ceead6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {sol.matchScore}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (triggerHaptic) triggerHaptic('selection');
                        setQuickRxFilter('all');
                        setStatusFilter('all');
                        setPatientFilter('all');
                        setTemporalFilter('all');
                        setApiFilter(null);
                        const matchedRxIds = sol.matchingItems.map(item => item.rx.id || item.rx.code || item.rx.prescriptionNumber);
                        setRecFilter({ id: sol.id, title: sol.title, rxIds: matchedRxIds });
                        setActiveAnchor('prescriptions');
                        if (typeof window !== 'undefined') {
                          setTimeout(() => {
                            const tableEl = document.getElementById('prescriptions');
                            if (tableEl) {
                              tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }, 50);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#1a73e8',
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Filter prescriptions table by these matched patients"
                    >
                      <span>View patients ({count})</span>
                      <ArrowUpRight size={12} />
                    </button>
                  )}

                  {/* Link to Protocol / Catalog */}
                  <a
                    href={sol.protocolUrl}
                    className="doctor-recommendation-action-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      background: '#1a73e8',
                      border: '1px solid #1a73e8',
                      padding: '5px 14px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'background-color 0.15s ease',
                      boxShadow: '0 1px 2px rgba(26,115,232,0.2)'
                    }}
                  >
                    <span>{sol.protocolTitle}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>

              {/* Middle Sub-Row: Cellular Target & Rationale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '0.76rem', color: '#1a73e8', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  <span style={{ color: '#5f6368', fontWeight: 600 }}>Target:</span> {sol.target}
                </div>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                  {sol.summary}
                </p>
              </div>

              {/* Bottom Sub-Row: Synergistic APIs Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '2px' }}>
                <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 600 }}>
                  Proven synergy with:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {sol.synergisticApis.map((api, aIdx) => (
                    <span
                      key={aIdx}
                      style={{
                        fontSize: '0.70rem',
                        background: '#f1f3f4',
                        color: '#3c4043',
                        border: '1px solid #dadce0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 500
                      }}
                    >
                      {api}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSolutions.length === 0 && (
        <div style={{
          padding: '36px 20px',
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No clinical solutions found matching &ldquo;{recSearchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setRecSearchQuery('');
              setRecCategoryFilter('all');
            }}
            style={{
              marginTop: '8px',
              fontSize: '0.76rem',
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 650
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}
