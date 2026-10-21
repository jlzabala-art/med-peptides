"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Users,
  ArrowUpRight,
  Search,
  X,
  Stethoscope,
  Globe,
  RefreshCw,
  Pill,
  FlaskConical,
  ShieldCheck,
  MessageCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';
import {
  SPECIALTY_VERTICALS,
  SPECIALTY_BLUEPRINTS_CATALOG,
  resolveDoctorSpecialtyIntelligence
} from '@/services/specialtyBlueprintsEngine';

/**
 * DoctorRecommendationsTab
 *
 * Dual-Engine Clinical Intelligence & Synergy Workspace:
 *  1. "Specialty Practice Blueprints" (Specialty & Web Footprint Engine):
 *     Tailored to the physician's clinical specialty and online clinical procedures
 *     (Trichology, Dermatology, Plastic & Aesthetic Surgery, Orthopedics, Longevity).
 *     Ideal for both Zero-Rx onboarding doctors and active prescribers expanding lines.
 *  2. "Patient Regimen Synergies" (Active Prescription Engine):
 *     Analyzes existing prescriptions across Bioactive Peptides, UltraPerson Nutraceuticals,
 *     ETERNA® Genomics, and Colway Cuticular ECM Care.
 */
export default function DoctorRecommendationsTab({
  doctor = {},
  slug = '',
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
  onPrescribeBlueprint,
  onRequestSampleWhatsApp,
  onProfileEnriched,
  triggerHaptic
}) {
  const hasPrescriptions = Array.isArray(allPrescriptions) && allPrescriptions.length > 0;

  // Resolve specialty intelligence from doctor profile + prescriptions
  const specialtyIntel = useMemo(
    () => resolveDoctorSpecialtyIntelligence(doctor, allPrescriptions),
    [doctor, allPrescriptions]
  );

  // Mode: 'specialty' (Specialty Practice Blueprints) vs 'prescriptions' (Patient Regimen Synergies)
  // Defaults to 'specialty' when doctor has 0 prescriptions so the portal is immediately compelling!
  const [recommendationEngineMode, setRecommendationEngineMode] = useState(
    hasPrescriptions ? 'specialty' : 'specialty'
  );
  const [selectedSpecialtyKey, setSelectedSpecialtyKey] = useState(
    specialtyIntel.specialtyCategory || 'trichology'
  );
  const [isEnrichingWebProfile, setIsEnrichingWebProfile] = useState(false);
  const [localWebProfile, setLocalWebProfile] = useState(null);

  useEffect(() => {
    if (specialtyIntel.specialtyCategory) {
      setSelectedSpecialtyKey(specialtyIntel.specialtyCategory);
    }
  }, [specialtyIntel.specialtyCategory]);

  const activeWebProfile = localWebProfile || specialtyIntel.webPracticeProfile;

  const handleRefreshWebFootprint = async () => {
    if (isEnrichingWebProfile) return;
    if (triggerHaptic) triggerHaptic('selection');
    setIsEnrichingWebProfile(true);
    try {
      const targetSlug = slug || doctor?.opaqueCode || doctor?.id || 'doctor';
      const res = await fetch(`/api/doctor/${encodeURIComponent(targetSlug)}/enrich-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor })
      });
      const json = await res.json();
      if (json?.success && json.webPracticeProfile) {
        setLocalWebProfile(json.webPracticeProfile);
        if (json.specialtyCategory) {
          setSelectedSpecialtyKey(json.specialtyCategory);
        }
        if (onProfileEnriched) {
          onProfileEnriched(json);
        }
      }
    } catch (err) {
      console.warn('[DoctorRecommendationsTab] Web footprint refresh notice:', err?.message);
    } finally {
      setIsEnrichingWebProfile(false);
    }
  };

  // ── ENGINE 1: Specialty Practice Blueprints Filtering ──────────────────────
  const blueprintsForSelectedSpecialty = useMemo(() => {
    const list =
      selectedSpecialtyKey === 'all'
        ? Object.values(SPECIALTY_BLUEPRINTS_CATALOG).flat()
        : SPECIALTY_BLUEPRINTS_CATALOG[selectedSpecialtyKey] || SPECIALTY_BLUEPRINTS_CATALOG.trichology;

    if (!recSearchQuery.trim()) return list;
    const q = recSearchQuery.toLowerCase().trim();
    return list.filter((bp) => {
      const hay = `${bp.clinicalProcedure} ${bp.specialtyLabel} ${bp.clinicalRationale} ${bp.compoundingFormula?.treatmentTitle || ''} ${(bp.compoundingFormula?.items || []).map((i) => i.name).join(' ')} ${bp.peptideSynergy?.name || ''} ${bp.dermocosmeticSynergy?.name || ''} ${bp.nutraceuticalSynergy?.name || ''} ${bp.diagnosticSynergy?.name || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [selectedSpecialtyKey, recSearchQuery]);

  // ── ENGINE 2: Patient Regimen Synergies (Existing Prescriptions) ───────────
  const analyzedItems = useMemo(
    () =>
      allPrescriptions.map((rx) => ({
        rx,
        recs: rx.atlasRecommendations || getPrescriptionAtlasRecommendations(rx)
      })),
    [allPrescriptions]
  );

  const ghkMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-ghk-cu-50mg');
  const glowMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-glow-blend');
  const epithalonMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-epithalon-10mg');
  const cjcMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-cjc-ipam-blend');
  const dsipMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-dsip-5mg');
  const bpcMatches = analyzedItems.filter((item) => item.recs?.peptide?.catalogCode === 'atlas-bpc-157-10mg');
  const colwayMatches = analyzedItems.filter((item) => Boolean(item.recs?.colway));

  const ultrapersonEnergyMatches = analyzedItems.filter((item) => {
    const s = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return s === 'ultraperson-energy-metabolic-vitality' || raw.includes('minoxidil') || raw.includes('coq10') || raw.includes('ubiquinol');
  });
  const ultrapersonLongevityMatches = analyzedItems.filter((item) => {
    const s = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return s === 'ultraperson-longevity-cellular-renewal' || raw.includes('finasteride') || raw.includes('dutasteride') || raw.includes('resveratrol') || raw.includes('metformin');
  });
  const ultrapersonStressMatches = analyzedItems.filter((item) => {
    const s = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return s === 'ultraperson-stress-resilience-emotional-balance' || raw.includes('stress') || raw.includes('cortisol') || raw.includes('ashwagandha') || raw.includes('bhrt') || raw.includes('dhea');
  });
  const ultrapersonSleepMatches = analyzedItems.filter((item) => {
    const s = item.recs?.supplement?.catalogSlug;
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return s === 'ultraperson-sleep-quality-restoration' || raw.includes('sleep') || raw.includes('melatonin') || raw.includes('theanine') || raw.includes('gaba');
  });
  const eternaMatches = analyzedItems.filter((item) => {
    const raw = (item.rx?.rawText || JSON.stringify(item.rx) || '').toLowerCase();
    return (
      raw.includes('finasteride') ||
      raw.includes('dutasteride') ||
      raw.includes('minoxidil') ||
      raw.includes('epithalon') ||
      raw.includes('metformin') ||
      raw.includes('spironolactone') ||
      raw.includes('latanoprost') ||
      raw.includes('tricho') ||
      raw.includes('alopecia') ||
      raw.includes('longevity')
    );
  });

  const candidateSolutions = [
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
      summary:
        'High-affinity follicular bioregulator stimulating dermal papilla fibroblasts, downregulating TGF-β1 miniaturization, and accelerating anagen re-entry in synergy with Minoxidil and antiandrogens.',
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
      summary:
        'Biocompatible tri-peptide complex engineered for accelerated follicular graft revascularization, nitric oxide microvascular stability, and early keratinocyte migration into recipient beds.',
      synergisticApis: ['PRP (Platelet-Rich Plasma)', 'FUE Micro-Grafts', 'TrichoOil Lipids', 'L-Arginine', 'Vitamin E'],
      matchingItems: glowMatches,
      protocolTitle: 'BPC-157 & TB-500 Tissue Repair Protocol',
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'atlas-epithalon-10mg',
      category: 'peptide',
      badge: 'EPIGENETIC BIOREGULATOR',
      title: 'Epithalon (Ala-Glu-Asp-Gly) 10 mg / vial',
      badgeColor: '#6d28d9',
      badgeBg: '#ede9fe',
      borderColor: '#ddd6fe',
      matchScore: '95% Synergy',
      target: 'Telomerase (TERT) Activation & Stem Cell Senescence Rescue',
      summary:
        'Pineal tetrapeptide inducing transcriptional upregulation of Telomerase Reverse Transcriptase (TERT), preserving telomeric length in aging follicular bulge stem cells and counteracting cellular senescence.',
      synergisticApis: ['Metformin', 'Ubiquinol (CoQ10)', 'Trans-Resveratrol', 'NAC', 'Astaxanthin'],
      matchingItems: epithalonMatches,
      protocolTitle: 'Epithalon Telomere & Longevity Protocol',
      protocolUrl: '/proto/lxv-neuro-restoration-12w'
    },
    {
      id: 'atlas-cjc-ipam-blend',
      category: 'peptide',
      badge: 'ENDOCRINE SECRETAGOGUE',
      title: 'CJC-1295 / Ipamorelin (5 mg / 5 mg) Lyophilized Blend',
      badgeColor: '#0f766e',
      badgeBg: '#ccfbf1',
      borderColor: '#99f6e4',
      matchScore: '94% Synergy',
      target: 'Pulsatile GH / IGF-1 Axis & Dermal Collagen Matrix Synthesis',
      summary:
        'Selective GHRH analog and ghrelin mimetic restoring physiological nocturnal growth hormone pulsatility and hepatic/local IGF-1 signaling without cortisol or prolactin spillover.',
      synergisticApis: ['Testosterone (BHRT)', 'DHEA', 'Estradiol', 'Progesterone', 'Pentravan® Base'],
      matchingItems: cjcMatches,
      protocolTitle: 'Endocrine & Anabolic Recovery Protocol',
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'atlas-dsip-5mg',
      category: 'peptide',
      badge: 'NEURO-CIRCADIAN PEPTIDE',
      title: 'DSIP (Delta Sleep-Inducing Peptide) 5 mg / vial',
      badgeColor: '#3730a3',
      badgeBg: '#e0e7ff',
      borderColor: '#c7d2fe',
      matchScore: '96% Synergy',
      target: 'HPA-Axis Cortisol Attenuation & Slow-Wave Sleep Architecture',
      summary:
        'Neuromodulatory nonapeptide normalizing slow-wave delta sleep architecture and buffering stress-induced CRH/cortisol surges that trigger premature telogen effluvium.',
      synergisticApis: ['Melatonin', 'L-Theanine', 'GABA', 'Ashwagandha', 'Magnesium Bisglycinate'],
      matchingItems: dsipMatches,
      protocolTitle: 'DSIP & BPC-157 CNS Restorative Protocol',
      protocolUrl: '/proto/dsip-bpc-157-cns-rest-protocol'
    },
    {
      id: 'atlas-bpc-157-10mg',
      category: 'peptide',
      badge: 'CYTOPROTECTIVE PENTADECAPEPTIDE',
      title: 'BPC-157 (Body Protection Compound) 10 mg / vial',
      badgeColor: '#047857',
      badgeBg: '#d1fae5',
      borderColor: '#a7f3d0',
      matchScore: '97% Synergy',
      target: 'Tendon/Tissue Angiogenesis, eNOS Upregulation & Gut-Skin Axis',
      summary:
        'Accelerates fibroblast migration, VEGFR2 expression, and nitric oxide microvascular healing across surgical wounds, tendons, and inflammatory dermatoses.',
      synergisticApis: ['Diltiazem', 'Ketoprofen', 'Pentoxifylline', 'Topical Analgesics', 'PRP'],
      matchingItems: bpcMatches,
      protocolTitle: 'BPC-157 & TB-500 Tissue Repair Protocol',
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'ultraperson-longevity-cellular-renewal',
      category: 'nutraceutical',
      badge: 'PRECISION NUTRACEUTICAL (ULTRAPERSON™)',
      title: 'UltraPerson™ Longevity & Cellular Renewal (NAD+ / Resveratrol / Senolytics)',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      borderColor: '#fde68a',
      matchScore: '96% Oral Synergy',
      target: 'Sirtuin (SIRT1/SIRT3) Activation & Follicular Stem Cell Bioenergetics',
      summary:
        'Clinical-grade oral nutraceutical formulated by PharmaPolis to sustain intracellular NAD+ pools, combat senescent SASP cytokines, and support long-term 5α-reductase and longevity regimens.',
      synergisticApis: ['Finasteride', 'Dutasteride', 'Metformin', 'Trans-Resveratrol', 'Minoxidil'],
      matchingItems: ultrapersonLongevityMatches,
      protocolTitle: 'Explore UltraPerson™ Longevity Specification',
      protocolUrl: '/p/ultraperson-longevity-cellular-renewal'
    },
    {
      id: 'ultraperson-energy-metabolic-vitality',
      category: 'nutraceutical',
      badge: 'PRECISION NUTRACEUTICAL (ULTRAPERSON™)',
      title: 'UltraPerson™ Energy & Metabolic Vitality (Ubiquinol CoQ10 + PQQ + L-Carnitine)',
      badgeColor: '#c2410c',
      badgeBg: '#ffedd5',
      borderColor: '#fed7aa',
      matchScore: '95% Oral Synergy',
      target: 'Mitochondrial ATP Synthesis & Dermal Papilla Cytochrome Oxidase',
      summary:
        'Addresses mitochondrial fatigue and systemic CoQ10 depletion, providing essential electron transport co-factors for metabolically demanding hair follicle matrix cells.',
      synergisticApis: ['Minoxidil', 'Coenzyme Q10', 'L-Carnitine', 'Caffeine', 'Vitamin B12'],
      matchingItems: ultrapersonEnergyMatches,
      protocolTitle: 'Explore UltraPerson™ Energy Specification',
      protocolUrl: '/p/ultraperson-energy-metabolic-vitality'
    },
    {
      id: 'ultraperson-stress-resilience',
      category: 'nutraceutical',
      badge: 'PRECISION NUTRACEUTICAL (ULTRAPERSON™)',
      title: 'UltraPerson™ Stress Resilience & Cortisol Modulation',
      badgeColor: '#92400e',
      badgeBg: '#fef3c7',
      borderColor: '#fde68a',
      matchScore: '93% Oral Synergy',
      target: 'Neurogenic Scalp Inflammation & Cortisol-Induced Catagen Shift',
      summary:
        'Standardized adaptogenic and neuro-nutrient complex designed to buffer high-cortisol states that degrade perifollicular proteoglycans and trigger diffuse telogen shedding.',
      synergisticApis: ['Ashwagandha', 'Spironolactone', 'DHEA', 'Melatonin', 'Topical Anti-Androgens'],
      matchingItems: ultrapersonStressMatches,
      protocolTitle: 'Explore UltraPerson™ Stress Specification',
      protocolUrl: '/p/ultraperson-stress-resilience-emotional-balance'
    },
    {
      id: 'ultraperson-sleep-restoration',
      category: 'nutraceutical',
      badge: 'PRECISION NUTRACEUTICAL (ULTRAPERSON™)',
      title: 'UltraPerson™ Sleep Quality & Circadian Restoration',
      badgeColor: '#1e40af',
      badgeBg: '#dbeafe',
      borderColor: '#bfdbfe',
      matchScore: '94% Oral Synergy',
      target: 'Circadian Clock Gene (BMAL1/PER1) Synchronization & Nocturnal Repair',
      summary:
        'Optimizes deep restorative sleep stages and peripheral circadian clock genes inside hair follicles and dermal fibroblasts.',
      synergisticApis: ['Melatonin', 'L-Theanine', 'Glycine', 'Magnesium Bisglycinate', 'GABA'],
      matchingItems: ultrapersonSleepMatches,
      protocolTitle: 'Explore UltraPerson™ Sleep Specification',
      protocolUrl: '/p/ultraperson-sleep-quality-restoration'
    },
    {
      id: 'eterna-pharmacogenomics-dna',
      category: 'genomics',
      badge: 'PRECISION GENOMICS (ETERNA®)',
      title: 'ETERNA® Longevity & Tricho-Pharmacogenomics Saliva DNA Test',
      badgeColor: '#be185d',
      badgeBg: '#fce7f3',
      borderColor: '#fbcfe8',
      matchScore: '99% Precision Fit',
      target: 'SULT1A1 Minoxidil Response, SRD5A2 Sensitivity & Epigenetic Aging',
      summary:
        'Non-invasive buccal/saliva genomic assay analyzing sulfotransferase (SULT1A1) activity, 5α-reductase polymorphisms, prostaglandin receptors, and methylation longevity pathways to eliminate trial-and-error prescribing.',
      synergisticApis: ['Minoxidil', 'Finasteride', 'Dutasteride', 'Latanoprost', 'Spironolactone', 'Epithalon'],
      matchingItems: eternaMatches,
      protocolTitle: 'Explore ETERNA® Genomic Panel',
      protocolUrl: '/p/omega-ratio-test'
    },
    {
      id: 'colway-native-collagen-ecm',
      category: 'colway',
      badge: 'CUTICULAR BARRIER & NATIVE ECM (COLWAY)',
      title: 'Colway Native Transdermal Tropocollagen + Diosmin Scalp Care',
      badgeColor: '#065f46',
      badgeBg: '#d1fae5',
      borderColor: '#a7f3d0',
      matchScore: '97% Topical Synergy',
      target: 'Perifollicular Extracellular Matrix (ECM) & Stratum Corneum Barrier',
      summary:
        'Bioactive fish-derived triple-helix native tropocollagen and micronized diosmin shampoo/gel system that prevents vehicle-induced scalp irritation, strengthens capillary walls, and anchors hair bulbs.',
      synergisticApis: ['TrichoSol™', 'TrichoOil™', 'Minoxidil', 'Topical Finasteride/Dutasteride', 'Tretinoin'],
      matchingItems: colwayMatches,
      protocolTitle: 'Explore Colway Clinical Dermocosmetics',
      protocolUrl: '/cosmetics'
    }
  ];

  const masterSolutions = candidateSolutions
    .filter((sol) => sol.matchingItems.length > 0)
    .sort((a, b) => b.matchingItems.length - a.matchingItems.length);

  const filteredSolutions = masterSolutions.filter((sol) => {
    if (recCategoryFilter !== 'all' && sol.category !== recCategoryFilter) return false;
    if (!recSearchQuery.trim()) return true;
    const q = recSearchQuery.toLowerCase().trim();
    const matchTitle = sol.title.toLowerCase().includes(q);
    const matchTarget = sol.target.toLowerCase().includes(q);
    const matchSummary = sol.summary.toLowerCase().includes(q);
    const matchApis = sol.synergisticApis.some((a) => a.toLowerCase().includes(q));
    const matchPatients = sol.matchingItems.some((item) =>
      (item.rx?.patientName || '').toLowerCase().includes(q)
    );
    return matchTitle || matchTarget || matchSummary || matchApis || matchPatients;
  });

  const coveredRxSet = new Set();
  masterSolutions.forEach((sol) => {
    sol.matchingItems.forEach((item) => {
      const id = item.rx?.id || item.rx?.code || item.rx?.prescriptionNumber;
      if (id) coveredRxSet.add(id);
    });
  });
  const totalCoveredRxs = coveredRxSet.size;

  return (
    <section
      id="recommendations"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(60,64,67,0.06)'
      }}
    >
      {/* ── Top Executive Header & Dual-Engine Mode Switcher ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '18px',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8'
              }}
            >
              <Sparkles size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 800, color: '#0f172a' }}>
              Atlas Recommendations &amp; Clinical Synergies
            </h2>
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe'
              }}
            >
              Dual Recommendation Engine
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.83rem', color: '#475569', maxWidth: '820px', lineHeight: 1.5 }}>
            Tailored clinical protocols and multi-pillar formulations across{' '}
            <strong>1) Atlas Recommendations</strong> (matched to {doctor?.name || 'your'}&apos;s medical specialty &amp; online clinical procedures) and{' '}
            <strong>2) Patient Regimen Synergies</strong> (matched to active patient prescriptions).
          </p>
        </div>

        {/* Dual-Engine Segmented Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            gap: '4px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (triggerHaptic) triggerHaptic('selection');
              setRecommendationEngineMode('specialty');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '7px',
              border: 'none',
              background: recommendationEngineMode === 'specialty' ? '#003666' : 'transparent',
              color: recommendationEngineMode === 'specialty' ? '#ffffff' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: recommendationEngineMode === 'specialty' ? '0 2px 6px rgba(0,54,102,0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={14} />
            <span>1. Atlas Recommendations</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '1px 7px',
                borderRadius: '999px',
                background: recommendationEngineMode === 'specialty' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                color: recommendationEngineMode === 'specialty' ? '#ffffff' : '#334155'
              }}
            >
              For Your Specialty
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (triggerHaptic) triggerHaptic('selection');
              setRecommendationEngineMode('prescriptions');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '7px',
              border: 'none',
              background: recommendationEngineMode === 'prescriptions' ? '#1a73e8' : 'transparent',
              color: recommendationEngineMode === 'prescriptions' ? '#ffffff' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: recommendationEngineMode === 'prescriptions' ? '0 2px 6px rgba(26,115,232,0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>2. Patient Regimen Synergies</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '1px 7px',
                borderRadius: '999px',
                background: recommendationEngineMode === 'prescriptions' ? 'rgba(255,255,255,0.22)' : '#e2e8f0',
                color: recommendationEngineMode === 'prescriptions' ? '#ffffff' : '#334155'
              }}
            >
              {allPrescriptions.length} Rx
            </span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ENGINE 1: SPECIALTY PRACTICE BLUEPRINTS & WEB FOOTPRINT INTELLIGENCE
         ══════════════════════════════════════════════════════════════════════════ */}
      {recommendationEngineMode === 'specialty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Physician Web Footprint & Clinical Activity Profile Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    color: '#1e40af',
                    background: '#dbeafe',
                    border: '1px solid #93c5fd',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <Globe size={12} /> Physician Web Activity &amp; Specialty Intelligence
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                  {doctor?.name || 'Treating Specialist'} · {activeWebProfile?.specialtyLabel || doctor?.specialty}
                </span>
                {(activeWebProfile?.verifiedSources || []).map((src, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={10} /> {src}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRefreshWebFootprint}
                disabled={isEnrichingWebProfile}
                style={{
                  height: '30px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #93c5fd',
                  background: '#ffffff',
                  color: '#1d4ed8',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: isEnrichingWebProfile ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Re-scan online clinical footprint and procedures using Atlas AI"
              >
                <RefreshCw size={12} className={isEnrichingWebProfile ? 'animate-spin' : ''} />
                <span>{isEnrichingWebProfile ? 'Researching Online Activity...' : 'Refresh Web Footprint with AI'}</span>
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.83rem', color: '#1e293b', lineHeight: 1.55 }}>
              {activeWebProfile?.clinicalFocusSummary}
            </p>

            {/* Detected Clinical Procedures from Internet Footprint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Detected Clinical Procedures &amp; Focus Areas:
              </span>
              {(activeWebProfile?.detectedProcedures || []).map((proc, pIdx) => (
                <span
                  key={pIdx}
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  • {proc}
                </span>
              ))}
            </div>
          </div>

          {/* Specialty Vertical Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Specialty Vertical:
              </span>
              {SPECIALTY_VERTICALS.map((vert) => {
                const isSelected = selectedSpecialtyKey === vert.key;
                const isDoctorPrimary = specialtyIntel.specialtyCategory === vert.key;
                return (
                  <button
                    key={vert.key}
                    type="button"
                    onClick={() => {
                      if (triggerHaptic) triggerHaptic('light');
                      setSelectedSpecialtyKey(vert.key);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      border: isSelected ? `2px solid ${vert.color}` : '1px solid #cbd5e1',
                      background: isSelected ? vert.bg : '#ffffff',
                      color: isSelected ? vert.color : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <span>{vert.shortLabel}</span>
                    {isDoctorPrimary && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: vert.color,
                          color: '#ffffff'
                        }}
                      >
                        YOUR SPECIALTY
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedSpecialtyKey('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: selectedSpecialtyKey === 'all' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                  background: selectedSpecialtyKey === 'all' ? '#f1f5f9' : '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: selectedSpecialtyKey === 'all' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                All Specialties ({Object.values(SPECIALTY_BLUEPRINTS_CATALOG).flat().length})
              </button>
            </div>
          </div>

          {/* Specialty Blueprints Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {blueprintsForSelectedSpecialty.map((bp) => (
              <div
                key={bp.id}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: '#ffffff',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                }}
              >
                {/* Card Top Banner */}
                <div
                  style={{
                    padding: '14px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#003666',
                          color: '#ffffff',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {bp.badge}
                      </span>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd'
                        }}
                      >
                        {bp.specialtyLabel}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        Target: <strong>{bp.targetPatients}</strong>
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.04rem', fontWeight: 800, color: '#0f172a' }}>
                      {bp.clinicalProcedure}
                    </h3>
                  </div>

                  {/* Direct 1-Click Conversion CTAs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {onPrescribeBlueprint && (
                      <button
                        type="button"
                        onClick={() => onPrescribeBlueprint(bp)}
                        style={{
                          height: '34px',
                          padding: '0 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #003666 0%, #1a73e8 100%)',
                          color: '#ffffff',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 5px rgba(26,115,232,0.25)'
                        }}
                        title="Open Prescription Builder pre-populated with this specialty formula"
                      >
                        <Sparkles size={13} />
                        <span>Prescribe This Blueprint (1-Click)</span>
                      </button>
                    )}

                    {onRequestSampleWhatsApp && (
                      <button
                        type="button"
                        onClick={() => onRequestSampleWhatsApp(bp)}
                        style={{
                          height: '34px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          border: '1px solid #16a34a',
                          background: '#f0fdf4',
                          color: '#15803d',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <MessageCircle size={13} />
                        <span>Request Clinic Sample / Dossier</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
                    <strong>Clinical Rationale for Your Specialty:</strong> {bp.clinicalRationale}
                  </p>

                  {/* 1. Primary Magistral Compounding Formulation Box */}
                  {bp.compoundingFormula && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '12px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Pill size={15} color="#003666" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                             Ready-to-Prescribe Magistral Formula: {bp.compoundingFormula.treatmentTitle}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                          Vehicle: {bp.compoundingFormula.dispensingForm} ({bp.compoundingFormula.volume})
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                        {(bp.compoundingFormula.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '7px 10px'
                            }}
                          >
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                              {item.name} <span style={{ color: '#1a73e8' }}>{item.concentration}</span>
                            </div>
                            <div style={{ fontSize: '0.69rem', color: '#64748b', marginTop: '2px' }}>
                              {item.role}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#334155' }}>
                        <strong>Recommended Posology:</strong> {bp.compoundingFormula.posology}
                      </div>
                    </div>
                  )}

                  {/* 2. Four-Pillar Atlas Ecosystem Synergies for this Procedure */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {bp.peptideSynergy && (
                      <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', marginBottom: '3px' }}>
                          🧬 Bioactive Peptide Co-Therapy
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '3px' }}>
                          {bp.peptideSynergy.name}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: '#3730a3', lineHeight: 1.4 }}>
                          {bp.peptideSynergy.role}
                        </div>
                      </div>
                    )}

                    {bp.dermocosmeticSynergy && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: '3px' }}>
                          🛡️ Cuticular &amp; Native ECM Care (Colway)
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#064e3b', marginBottom: '3px' }}>
                          {bp.dermocosmeticSynergy.name}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: '#065f46', lineHeight: 1.4 }}>
                          {bp.dermocosmeticSynergy.role}
                        </div>
                      </div>
                    )}

                    {bp.nutraceuticalSynergy && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: '3px' }}>
                          💊 Oral Nutraceutical (UltraPerson™)
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350f', marginBottom: '3px' }}>
                          {bp.nutraceuticalSynergy.name}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: '#92400e', lineHeight: 1.4 }}>
                          {bp.nutraceuticalSynergy.role}
                        </div>
                      </div>
                    )}

                    {bp.diagnosticSynergy && (
                      <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', marginBottom: '3px' }}>
                          🔬 Molecular / DNA Diagnostic
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#831843', marginBottom: '3px' }}>
                          {bp.diagnosticSynergy.name}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: '#9d174d', lineHeight: 1.4 }}>
                          {bp.diagnosticSynergy.role}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ENGINE 2: PATIENT REGIMEN SYNERGIES (FROM DOCTOR'S ACTIVE PRESCRIPTIONS)
         ══════════════════════════════════════════════════════════════════════════ */}
      {recommendationEngineMode === 'prescriptions' && (
        <div>
          {!hasPrescriptions ? (
            <div
              style={{
                padding: '36px 24px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1'
              }}
            >
              <Stethoscope size={28} style={{ color: '#003666', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                No Patient Prescriptions Recorded Yet for {doctor?.name || 'This Practice'}
              </h3>
              <p style={{ margin: '0 auto 16px auto', fontSize: '0.82rem', color: '#475569', maxWidth: '580px', lineHeight: 1.5 }}>
                Once you submit your first prescription, this view automatically maps your patients&apos; active ingredients to synergistic peptides, nutraceuticals, and diagnostics. In the meantime, explore your curated <strong>Atlas Recommendations</strong>.
              </p>
              <button
                type="button"
                onClick={() => setRecommendationEngineMode('specialty')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#003666',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Explore Atlas Recommendations →
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div
                    style={{
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
                    }}
                  >
                    <Users size={14} style={{ color: '#1a73e8' }} />
                    <span>
                      <strong>{totalCoveredRxs}</strong> of {allPrescriptions.length} prescriptions matched with adjuvant synergy
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '6px 12px', borderRadius: '4px', fontWeight: 600 }}>
                    ✓ {masterSolutions.length} Prioritized Practice Synergies
                  </span>
                </div>
              </div>

              {/* Search Toolbar */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: '20px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '2px 10px 2px 14px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
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
                  >
                    <X size={15} />
                  </button>
                )}
                <div
                  style={{
                    marginLeft: '8px',
                    padding: '3px 8px',
                    background: '#f1f3f4',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#5f6368',
                    whiteSpace: 'nowrap',
                    border: '1px solid #dadce0'
                  }}
                >
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
                                const matchedRxIds = sol.matchingItems.map(
                                  (item) => item.rx.id || item.rx.code || item.rx.prescriptionNumber
                                );
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
                                cursor: 'pointer'
                              }}
                            >
                              <span>View matching prescriptions ({count})</span>
                              <ArrowUpRight size={12} />
                            </button>
                          )}

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
                              gap: '5px'
                            }}
                          >
                            <span>{sol.protocolTitle}</span>
                            <ArrowUpRight size={12} />
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#1a73e8', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                          <span style={{ color: '#5f6368', fontWeight: 600 }}>Target:</span> {sol.target}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                          {sol.summary}
                        </p>
                      </div>

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
            </>
          )}
        </div>
      )}
    </section>
  );
}
