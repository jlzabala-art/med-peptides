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
  CheckCircle2,
  Package,
  FileText
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
  onOpenDossier,
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

        {/* Dual-Engine Google Cloud Console Material Underline Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            borderBottom: '1px solid #dadce0',
            width: '100%',
            marginBottom: '4px'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={recommendationEngineMode === 'specialty'}
            onClick={() => {
              if (triggerHaptic) triggerHaptic('selection');
              setRecommendationEngineMode('specialty');
            }}
            style={{
              padding: '12px 2px 10px 2px',
              border: 'none',
              borderBottom: recommendationEngineMode === 'specialty' ? '2px solid #1a73e8' : '2px solid transparent',
              background: 'transparent',
              color: recommendationEngineMode === 'specialty' ? '#1a73e8' : '#5f6368',
              fontSize: '0.84rem',
              fontWeight: recommendationEngineMode === 'specialty' ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.15s, border-color 0.15s'
            }}
          >
            <Stethoscope size={15} color={recommendationEngineMode === 'specialty' ? '#1a73e8' : '#5f6368'} />
            <span>1. Atlas Recommendations</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                background: recommendationEngineMode === 'specialty' ? '#e8f0fe' : '#f1f3f4',
                color: recommendationEngineMode === 'specialty' ? '#1a73e8' : '#5f6368'
              }}
            >
              For Your Specialty
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={recommendationEngineMode === 'prescriptions'}
            onClick={() => {
              if (triggerHaptic) triggerHaptic('selection');
              setRecommendationEngineMode('prescriptions');
            }}
            style={{
              padding: '12px 2px 10px 2px',
              border: 'none',
              borderBottom: recommendationEngineMode === 'prescriptions' ? '2px solid #1a73e8' : '2px solid transparent',
              background: 'transparent',
              color: recommendationEngineMode === 'prescriptions' ? '#1a73e8' : '#5f6368',
              fontSize: '0.84rem',
              fontWeight: recommendationEngineMode === 'prescriptions' ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.15s, border-color 0.15s'
            }}
          >
            <Layers size={15} color={recommendationEngineMode === 'prescriptions' ? '#1a73e8' : '#5f6368'} />
            <span>2. Patient Regimen Synergies</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                background: recommendationEngineMode === 'prescriptions' ? '#e8f0fe' : '#f1f3f4',
                color: recommendationEngineMode === 'prescriptions' ? '#1a73e8' : '#5f6368'
              }}
            >
              {allPrescriptions.length} Rx
            </span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ENGINE 1: SPECIALTY PRACTICE BLUEPRINTS
         ══════════════════════════════════════════════════════════════════════════ */}
      {recommendationEngineMode === 'specialty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Specialty Vertical Filter Chips (GCP Standard) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
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
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #1a73e8' : '1px solid #dadce0',
                      background: isSelected ? '#e8f0fe' : '#ffffff',
                      color: isSelected ? '#1a73e8' : '#3c4043',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isSelected ? '0 1px 2px rgba(26,115,232,0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{vert.shortLabel}</span>
                    {isDoctorPrimary && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isSelected ? '#1a73e8' : '#0d9488',
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
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: selectedSpecialtyKey === 'all' ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: selectedSpecialtyKey === 'all' ? '#e8f0fe' : '#ffffff',
                  color: selectedSpecialtyKey === 'all' ? '#1a73e8' : '#3c4043',
                  fontSize: '0.76rem',
                  fontWeight: selectedSpecialtyKey === 'all' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Specialties ({Object.values(SPECIALTY_BLUEPRINTS_CATALOG).flat().length})
              </button>
            </div>
          </div>

          {/* Specialty Blueprints Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {blueprintsForSelectedSpecialty.map((bp) => {
              const synergyItems = [
                bp.peptideSynergy && {
                  type: 'peptide',
                  badge: 'Catalog Bioactive Peptide',
                  icon: '🧬',
                  color: '#4338ca',
                  bg: '#f8faff',
                  border: '#c7d2fe',
                  badgeBg: '#e0e7ff',
                  name: bp.peptideSynergy.name,
                  role: bp.peptideSynergy.role,
                  url: bp.protocolUrl || '/collection/peptides'
                },
                bp.dermocosmeticSynergy && {
                  type: 'colway',
                  badge: 'Catalog Cosmeceuticals (Colway®)',
                  icon: '🛡️',
                  color: '#047857',
                  bg: '#f9fefb',
                  border: '#a7f3d0',
                  badgeBg: '#d1fae5',
                  name: bp.dermocosmeticSynergy.name,
                  role: bp.dermocosmeticSynergy.role,
                  url: '/collection/colway'
                },
                bp.nutraceuticalSynergy && {
                  type: 'nutraceutical',
                  badge: 'Catalog Oral Nutraceutical (UltraPerson™)',
                  icon: '💊',
                  color: '#b45309',
                  bg: '#fffdf5',
                  border: '#fde68a',
                  badgeBg: '#fef3c7',
                  name: bp.nutraceuticalSynergy.name,
                  role: bp.nutraceuticalSynergy.role,
                  url: bp.nutraceuticalSynergy.slug ? `/p/${bp.nutraceuticalSynergy.slug}` : '/collection/ultraman'
                },
                bp.diagnosticSynergy && {
                  type: 'diagnostic',
                  badge: 'Catalog Diagnostic Panel',
                  icon: '🔬',
                  color: '#be185d',
                  bg: '#fdf7f9',
                  border: '#fbcfe8',
                  badgeBg: '#fce7f3',
                  name: bp.diagnosticSynergy.name,
                  role: bp.diagnosticSynergy.role,
                  url: bp.diagnosticSynergy.slug
                    ? `/p/${bp.diagnosticSynergy.slug}`
                    : (bp.diagnosticSynergy.name?.toLowerCase().includes('eterna')
                        ? '/collection/eterna'
                        : bp.diagnosticSynergy.name?.toLowerCase().includes('teletest')
                        ? '/collection/teletest'
                        : '/collection/bloodo')
                }
              ].filter(Boolean);

              return (
                <div
                  key={bp.id}
                  style={{
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    background: '#ffffff',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.08)',
                    transition: 'box-shadow 0.2s ease'
                  }}
                >
                  {/* ── CARD TOP HEADER (GOOGLE CLOUD UX HIERARCHY) ── */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: '#ffffff',
                      borderBottom: '1px solid #e8eaed',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: '1 1 500px', minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#e8f0fe',
                            color: '#1a73e8',
                            border: '1px solid #c2e7ff',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {bp.badge || 'Specialized Clinical Protocol'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#e8f0fe',
                            color: '#1a73e8',
                            border: '1px solid #d2e3fc'
                          }}
                        >
                          {bp.specialtyLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f1f3f4',
                            color: '#3c4043'
                          }}
                        >
                          Target Patient Profile: <strong style={{ color: '#202124' }}>{bp.targetPatients}</strong>
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.12rem', fontWeight: 600, color: '#202124', lineHeight: 1.35 }}>
                        {bp.clinicalProcedure}
                      </h3>

                      <p style={{ margin: 0, fontSize: '0.80rem', color: '#5f6368', lineHeight: 1.5 }}>
                        <strong style={{ color: '#202124' }}>Clinical Rationale:</strong> {bp.clinicalRationale}
                      </p>
                    </div>

                    {/* Top Level Action Bar (Google Cloud Standard Buttons) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', alignSelf: 'center' }}>
                      {onOpenDossier && (
                        <button
                          type="button"
                          onClick={() => {
                            if (triggerHaptic) triggerHaptic('selection');
                            onOpenDossier(bp);
                          }}
                          style={{
                            height: '34px',
                            padding: '0 12px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            background: '#ffffff',
                            color: '#1a73e8',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background 0.15s, border-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafd';
                            e.currentTarget.style.borderColor = '#1a73e8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#dadce0';
                          }}
                          title="Open comprehensive clinical monograph with pharmacokinetics and clinical evidence"
                        >
                          <FileText size={14} />
                          <span>View Clinical Dossier</span>
                        </button>
                      )}

                      {onPrescribeBlueprint && (
                        <button
                          type="button"
                          onClick={() => {
                            if (triggerHaptic) triggerHaptic('selection');
                            const fullProtocolBlueprint = {
                              ...bp,
                              title: `${bp.title || bp.clinicalProcedure} (Comprehensive Protocol)`,
                              compoundingFormula: {
                                ...bp.compoundingFormula,
                                treatmentTitle: `${bp.compoundingFormula?.treatmentTitle || bp.title} + Catalog Synergies`,
                                items: [
                                  ...(bp.compoundingFormula?.items || []),
                                  ...synergyItems.map((item) => ({
                                    name: `[Catalog] ${item.name}`,
                                    concentration: 'Commercial Stock',
                                    role: `${item.badge} · ${item.role}`
                                  }))
                                ]
                              }
                            };
                            onPrescribeBlueprint(fullProtocolBlueprint);
                          }}
                          style={{
                            height: '34px',
                            padding: '0 14px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#1a73e8',
                            color: '#ffffff',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(26,115,232,0.3)',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#1557b0'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
                          title="Load compounded formula and complementary catalog products into the Rx Formulary"
                        >
                          <Layers size={14} />
                          <span>Prescribe Complete Protocol (Compounded + {synergyItems.length} Catalog)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── CARD BODY: 2 CLEARLY DIFFERENTIATED THERAPEUTIC SECTIONS ── */}
                  <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* ════════════════════════════════════════════════════════════════════════
                        SECCIÓN 1: FORMULACIÓN MAGISTRAL PERSONALIZADA (FARMACIA ELABORADORA)
                        ════════════════════════════════════════════════════════════════════════ */}
                    {bp.compoundingFormula && (
                      <div
                        style={{
                          background: '#f8fafd',
                          border: '1px solid #d2e3fc',
                          borderLeft: '4px solid #1a73e8',
                          borderRadius: '8px',
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Section 1 Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: '#e8f0fe',
                                  color: '#1a73e8',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <FlaskConical size={13} />
                                Individualized Compounded Formulation (Compounding Pharmacy)
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: '#ffffff',
                                  border: '1px solid #d2e3fc',
                                  color: '#3c4043'
                                }}
                              >
                                On-Demand Compounding · Titratable Concentrations
                              </span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#1a73e8', lineHeight: 1.3 }}>
                              {bp.compoundingFormula.treatmentTitle}
                            </h4>
                          </div>

                          <div
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: '#003666',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Pill size={13} color="#1a73e8" />
                            <span><strong>Galenic Vehicle:</strong> {bp.compoundingFormula.dispensingForm} ({bp.compoundingFormula.volume})</span>
                          </div>
                        </div>

                        {/* Principios Activos Compuestos (APIs Galénicos) */}
                        <div>
                          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                            Active Compounded APIs & Titratable Concentrations in Rx:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                            {(bp.compoundingFormula.items || []).map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e0e2e6',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '4px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
                                    {item.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: '#1a73e8',
                                      background: '#e8f0fe',
                                      border: '1px solid #c2e7ff',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.concentration}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.70rem', color: '#5f6368', lineHeight: 1.35 }}>
                                  {item.role}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Posología Galénica */}
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e0e2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '0.76rem',
                            color: '#3c4043',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#202124' }}>Recommended Galenic Posology Guideline:</span>
                          <span>{bp.compoundingFormula.posology}</span>
                        </div>

                        {/* BOTÓN DEDICADO ORIENTADO A LA FORMULACIÓN MAGISTRAL */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: '#5f6368', maxWidth: '440px', lineHeight: 1.35 }}>
                            Open the Compounding Formulary to titrate exact concentrations based on patient analytics and order custom preparation from the compounding pharmacy.
                          </div>

                          {onPrescribeBlueprint && (
                            <button
                              type="button"
                              onClick={() => {
                                if (triggerHaptic) triggerHaptic('selection');
                                onPrescribeBlueprint(bp);
                              }}
                              style={{
                                height: '36px',
                                padding: '0 18px',
                                borderRadius: '4px',
                                border: 'none',
                                background: '#1a73e8',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 1px 2px rgba(26,115,232,0.35)',
                                transition: 'background 0.15s, box-shadow 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#1557b0';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(26,115,232,0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#1a73e8';
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(26,115,232,0.35)';
                              }}
                              title="Prescribe official compounding formula in the Rx Formulary"
                            >
                              <FlaskConical size={14} />
                              <span>Prescribe Compounded Formula (Open Formulary)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════════════════
                        SECCIÓN 2: PRODUCTOS COMPLEMENTARIOS DE CATÁLOGO (STOCK DIRECTO)
                        ════════════════════════════════════════════════════════════════════════ */}
                    {synergyItems.length > 0 && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          borderLeft: '4px solid #0d9488',
                          borderRadius: '8px',
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Section 2 Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: '#f0fdfa',
                                  color: '#0d9488',
                                  border: '1px solid #a7f3d0',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Package size={13} />
                                Catalog Products & Diagnostic Tests ({synergyItems.length} In-Stock References)
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: '#f1f3f4',
                                  color: '#3c4043'
                                }}
                              >
                                Direct Dispensing · Registered Products · No Compounding Required
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368', lineHeight: 1.4 }}>
                              Registered commercial co-therapies and in-stock laboratory panels that enhance the clinical response of the compounded formula. Can be prescribed together or individually.
                            </p>
                          </div>

                          {onPrescribeBlueprint && (
                            <button
                              type="button"
                              onClick={() => {
                                if (triggerHaptic) triggerHaptic('selection');
                                const catalogGroupBlueprint = {
                                  ...bp,
                                  title: `${bp.title || bp.clinicalProcedure} (Catalog Synergies Pack)`,
                                  compoundingFormula: {
                                    treatmentTitle: `${bp.clinicalProcedure} — Catalog Pack (${synergyItems.length} Products)`,
                                    dispensingForm: 'Commercial Catalog Pack',
                                    volume: 'In-Stock Units',
                                    posology: 'See individual catalog monographs',
                                    items: synergyItems.map((item) => ({
                                      name: `[Catalog] ${item.name}`,
                                      concentration: 'Commercial Stock',
                                      role: `${item.badge} · ${item.role}`
                                    }))
                                  }
                                };
                                onPrescribeBlueprint(catalogGroupBlueprint);
                              }}
                              style={{
                                height: '30px',
                                padding: '0 12px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0d9488',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0fdfa';
                                e.currentTarget.style.borderColor = '#0d9488';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                              title="Load all complementary catalog products into the Rx Formulary"
                            >
                              <Layers size={13} />
                              <span>Prescribe All Catalog Products ({synergyItems.length})</span>
                            </button>
                          )}
                        </div>

                        {/* Filas de Productos de Catálogo (1 por línea, estilo GCP List Item) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {synergyItems.map((item, itemIdx) => {
                            const itemNumber = String(itemIdx + 1).padStart(2, '0');
                            return (
                              <div
                                key={itemIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  padding: '10px 14px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #e8eaed',
                                  transition: 'border-color 0.15s, box-shadow 0.15s',
                                  flexWrap: 'wrap'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#1a73e8';
                                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(60,64,67,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e8eaed';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                {/* Left: Number + Category Tag + Product Name + Role */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 340px', minWidth: '240px' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '4px',
                                      background: item.badgeBg || '#f1f3f4',
                                      color: item.color || '#202124',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      flexShrink: 0,
                                      marginTop: '2px',
                                      border: `1px solid ${item.border || '#dadce0'}`
                                    }}
                                  >
                                    {itemNumber}
                                  </span>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          fontSize: '0.64rem',
                                          fontWeight: 700,
                                          color: item.color,
                                          background: item.badgeBg,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.03em',
                                          border: `1px solid ${item.border}`
                                        }}
                                      >
                                        {item.icon} {item.badge}
                                      </span>

                                      <span style={{ fontSize: '0.66rem', color: '#137333', background: '#e6f4ea', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                        In-Stock Catalog
                                      </span>

                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          fontSize: '0.86rem',
                                          fontWeight: 600,
                                          color: '#202124',
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                        title={`View catalog monograph and specifications for ${item.name}`}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#1a73e8'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#202124'; }}
                                      >
                                        <span>{item.name}</span>
                                        <ArrowUpRight size={13} style={{ opacity: 0.6 }} />
                                      </a>
                                    </div>

                                    <div style={{ fontSize: '0.72rem', color: '#5f6368', lineHeight: 1.4 }}>
                                      {item.role}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: GCP Action Buttons for Catalog Item */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      height: '30px',
                                      padding: '0 10px',
                                      borderRadius: '4px',
                                      background: '#ffffff',
                                      border: '1px solid #dadce0',
                                      color: '#1a73e8',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'background 0.15s, border-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#f8fafd';
                                      e.currentTarget.style.borderColor = '#1a73e8';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#ffffff';
                                      e.currentTarget.style.borderColor = '#dadce0';
                                    }}
                                  >
                                    <span>Catalog Sheet</span>
                                    <ArrowUpRight size={12} />
                                  </a>

                                  {onPrescribeBlueprint && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (triggerHaptic) triggerHaptic('selection');
                                        const singleItemBlueprint = {
                                          ...bp,
                                          title: `${item.name}`,
                                          compoundingFormula: {
                                            treatmentTitle: `${item.name} (Catalog Product)`,
                                            dispensingForm: item.badge,
                                            volume: 'Standard Packaging',
                                            posology: item.role,
                                            items: [{ name: item.name, concentration: 'Commercial Stock', role: item.role }]
                                          }
                                        };
                                        onPrescribeBlueprint(singleItemBlueprint);
                                      }}
                                      style={{
                                        height: '30px',
                                        padding: '0 12px',
                                        borderRadius: '4px',
                                        background: '#ffffff',
                                        border: '1px solid #dadce0',
                                        color: '#202124',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.15s'
                                      }}
                                      title={`Prescribe only ${item.name} from catalog`}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#e8f0fe';
                                        e.currentTarget.style.borderColor = '#1a73e8';
                                        e.currentTarget.style.color = '#1a73e8';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#ffffff';
                                        e.currentTarget.style.borderColor = '#dadce0';
                                        e.currentTarget.style.color = '#202124';
                                      }}
                                    >
                                      <Pill size={12} />
                                      <span>Prescribe Product</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
