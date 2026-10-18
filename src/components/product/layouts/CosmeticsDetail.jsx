"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Sparkles, FlaskConical, Leaf,
  CheckCircle2, Info, ChevronDown, ChevronRight, ExternalLink,
  Droplets, Zap, Activity, Star, Package, Microscope, Heart,
  AlertTriangle, ClipboardList, Scissors, Beaker, BookOpen,
  TestTube, ListChecks, Thermometer, Clock, BarChart2, BadgeCheck,
  RefreshCcw, Layers, Mail, QrCode, Copy, Check, ZoomIn, X, Search,
  ArrowLeft
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PublicDatasheetTableOfContents from '@/components/product/PublicDatasheetTableOfContents';
import ProductSectionFooterNav from '@/components/product/ProductSectionFooterNav';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicKpiGrid from '@/components/shared/public/PublicKpiGrid';
import HairProtocolsSidebarWidget from '@/components/product/HairProtocolsSidebarWidget';
import CosmeticsSidebarWidget from '@/components/product/CosmeticsSidebarWidget';
import ColwayProtocolInfogram from '@/components/product/ColwayProtocolInfogram';
import ColwayTrichologyStemCellShowcase from '@/components/product/ColwayTrichologyStemCellShowcase';
import ColwayActiveIngredientsShowcase from '@/components/product/ColwayActiveIngredientsShowcase';
import { getColwayProductData } from '@/data/colwayInciRegistry';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import ImageModal from '@/snippets/ImageModal';
import { CollectionBadgePill, CollectionCompanionBanner } from '@/components/product/CollectionBannerWidget';
import toast from 'react-hot-toast';

const INCI_GROUP_META = {
  base:             { label: 'Aqueous Base',        color: '#64748b', bg: '#f1f5f9' },
  surfactant:       { label: 'Surfactant System',   color: '#2563eb', bg: '#eff6ff' },
  conditioning_base:{ label: 'Conditioning Base',   color: '#7c3aed', bg: '#faf5ff' },
  key_active:       { label: 'Key Clinical Active', color: '#0d9488', bg: '#f0fdfa' },
  functional_active:{ label: 'Functional Active',   color: '#16a34a', bg: '#f0fdf4' },
  conditioning:     { label: 'Conditioning',        color: '#0284c7', bg: '#e0f2fe' },
  preservative:     { label: 'Preservation System', color: '#d97706', bg: '#fffbeb' },
  fragrance:        { label: 'Fragrance',            color: '#db2777', bg: '#fdf2f8' },
  functional:       { label: 'Functional Additive',  color: '#64748b', bg: '#f8fafc' },
};

const INGREDIENT_ICONS = {
  key_active: Sparkles, functional_active: Leaf, surfactant: Droplets,
  conditioning_base: Activity, conditioning: Heart, preservative: ShieldCheck,
  fragrance: Star, base: Beaker, functional: TestTube,
};

function InciCard({ ing, index, onCopy }) {
  const [open, setOpen] = useState(false);
  const group = ing.inci_group || 'functional';
  const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
  const IconComp = INGREDIENT_ICONS[group] || FlaskConical;
  const hasClinical = Boolean(ing.clinical_data?.mechanism || ing.clinical_data?.evidence);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      marginBottom: '0.65rem',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}>
      {/* Top Header Row: 1 full-width row with numbering, name, and functional category */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 220px', minWidth: 0 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '6px',
            background: '#f1f5f9',
            color: '#475569',
            fontSize: '0.68rem',
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: 'monospace'
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '6px',
            flexShrink: 0,
            background: meta.bg,
            color: meta.color
          }}>
            <IconComp size={14} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {ing.inci_name}
            </div>
            {ing.common_name && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                {ing.common_name}
              </div>
            )}
          </div>
        </div>

        {/* Right Action & Metadata Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: meta.color,
            background: meta.bg,
            padding: '2px 8px',
            borderRadius: '99px',
            border: `1px solid ${meta.color}35`
          }}>
            {meta.label}
          </span>
          {ing.concentration_range && (
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              color: '#334155',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '2px 8px',
              borderRadius: '99px',
              fontFamily: 'monospace'
            }}>
              {ing.concentration_range}
            </span>
          )}
        </div>
      </div>

      {/* Origin / Provenance */}
      {ing.origin && (
        <div style={{ marginTop: '0.45rem', fontSize: '0.68rem', color: '#64748b' }}>
          <strong style={{ color: '#475569' }}>Origin: </strong>
          {ing.origin}
        </div>
      )}

      {/* Role & Functional Summary */}
      {ing.role && (
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.55 }}>
          {ing.role}
        </p>
      )}

      {/* Expandable Clinical Mechanisms & In-Vivo Evidence */}
      {hasClinical && (
        <div style={{ marginTop: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#1a73e8',
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              minHeight: '36px',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafd';
              e.currentTarget.style.borderColor = '#1a73e8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#dadce0';
            }}
          >
            <Activity size={14} color="#1a73e8" />
            <span>{open ? 'Hide Clinical Mechanism' : 'View Clinical Mechanism & Evidence'}</span>
            {open ? <ChevronDown size={14} color="#5f6368" /> : <ChevronRight size={14} color="#5f6368" />}
          </button>

          {open && (
            <div style={{
              marginTop: '0.65rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              borderLeft: `3px solid ${meta.color}`,
              border: `1px solid ${meta.color}30`
            }}>
              {ing.cas_number && (
                <div style={{ fontSize: '0.67rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>CAS: </span>{ing.cas_number}
                </div>
              )}

              {ing.clinical_data?.mechanism && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: meta.color, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Beaker size={11} /> Molecular Mechanism of Action
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                    {ing.clinical_data.mechanism}
                  </p>
                </div>
              )}
              {ing.clinical_data?.evidence && (
                <div>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: meta.color, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BookOpen size={11} /> Peer-Reviewed Clinical Evidence
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                    {ing.clinical_data.evidence}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationStep({ step, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '14px', position: 'relative' }}>
      {!isLast && <div style={{ position: 'absolute', left: '13px', top: '28px', width: '2px', bottom: '-16px', background: 'linear-gradient(to bottom, #0d9488, #e2e8f0)', borderRadius: '1px' }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, zIndex: 1 }}>{step.step}</div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1.25rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.05em', marginBottom: '2px' }}>{step.phase}</div>
        <p style={{ fontSize: '0.81rem', color: '#334155', margin: '0 0 0.4rem 0', lineHeight: 1.6 }}>{step.instruction}</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          {step.duration && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '99px', border: '1px solid #e2e8f0' }}><Clock size={10} /> {step.duration}</span>}
          {step.temp && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: '99px', border: '1px solid #bfdbfe' }}><Thermometer size={10} /> {step.temp}</span>}
        </div>
        {step.clinical_note && (
          <>
            <button type="button" onClick={() => setOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#0d9488', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Info size={10} /> Clinical note {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </button>
            {open && <div style={{ marginTop: '6px', padding: '0.5rem 0.75rem', background: '#f0fdfa', borderLeft: '3px solid #0d9488', borderRadius: '6px', fontSize: '0.72rem', color: '#134e4a', lineHeight: 1.5 }}>{step.clinical_note}</div>}
          </>
        )}
      </div>
    </div>
  );
}

const FALLBACK_SHAMPOO_APPLICATION = {
  title: 'Professional Application Protocol',
  frequency: '3–4 times per week (or as directed by trichologist)',
  duration_of_use: 'Minimum 8 weeks for clinical assessment; 6–12 months for sustained follicular benefit',
  steps: [
    {
      step: 1,
      phase: 'Pre-Wash Scalp Preparation',
      instruction: 'For optimal active penetration, pre-condition the scalp with lukewarm water (36–38°C) for 60 seconds before product application. This opens follicular ostia and softens sebum.',
      duration: '60 seconds',
      temp: '36–38°C'
    },
    {
      step: 2,
      phase: 'Emulsification & Scalp Distribution',
      instruction: 'Dispense 5–10 mL into palm. Emulsify for 10 seconds until rich lather forms. Apply directly to scalp crown and areas of visible thinning first, distributing outward.',
      duration: '10s emulsification',
      clinical_note: 'Scalp-first application maximises contact time of Zinc PCA and Caffeine with the follicular unit — the primary target of anti-DHT actives.'
    },
    {
      step: 3,
      phase: 'Active Penetration Massage',
      instruction: 'Using fingertip pads (not nails), massage in firm circular motions for 2–3 minutes focusing on the vertex and frontal hairline.',
      duration: '2–3 minutes',
      clinical_note: 'Mechanical massage stimulates dermal papilla microcirculation (VEGF) and increases transdermal absorption of Caffeine by up to 40%.'
    },
    {
      step: 4,
      phase: 'Active Dwell Time',
      instruction: 'Leave lather on scalp for 3–5 minutes without rinsing. This contact window allows Caffeine and Baicalin to bind to cell receptors at the hair bulb.',
      duration: '3–5 minutes',
      clinical_note: 'Fischer et al. (2007): Maximum caffeine follicular penetration occurs within 2 minutes of scalp application. Extended dwell time ensures deep diffusion.'
    },
    {
      step: 5,
      phase: 'Lukewarm Water Rinse',
      instruction: 'Rinse thoroughly with lukewarm water (maximum 38°C). Avoid hot water above 42°C which causes cuticle swelling and lipid leaching.',
      duration: '60–90 seconds',
      temp: 'Max 38°C'
    },
    {
      step: 6,
      phase: 'Follow-Up Conditioning',
      instruction: 'Follow immediately with Colway Strengthening Conditioner applied to mid-lengths and ends to seal cuticular scales and lock in hydration.',
      clinical_note: 'Sequential use creates layered protection: the shampoo targets dermal follicles; the conditioner reconstructs cortical keratin and cuticle scales.'
    }
  ],
  professional_notes: [
    'Recommended as topical adjunct therapy alongside GHK-Cu peptide scalp mesotherapy in androgenetic alopecia protocols.',
    'Compatible with PRP (Platelet-Rich Plasma) scalp treatments — apply 24h post-treatment once microchannels have re-epithelialized.',
    'Colour-treated hair: physiological formulation pH 4.8–5.2 preserves pigment and will not accelerate fading.',
    'Daily use is not necessary: 3–4× weekly maintains optimal follicular stimulation without disrupting the scalp microbiome.'
  ]
};

const FALLBACK_CONDITIONER_APPLICATION = {
  title: 'Professional Application Protocol',
  frequency: '3–4 times per week, always following Colway Strengthening Shampoo',
  duration_of_use: 'Minimum 8 weeks for clinical assessment; 6 months for sustained cortex remodelling',
  steps: [
    {
      step: 1,
      phase: 'Post-Shampoo Hair Preparation',
      instruction: 'After rinsing the shampoo, gently press excess moisture with a microfiber towel or cupped hands. Hair should be damp (~70% moisture retained), never dripping wet.',
      duration: '30 seconds',
      clinical_note: 'Damp hair provides the optimal water-to-oil interface for cationic conditioning agents. Excess water dilutes active concentration and reduces substantivity.'
    },
    {
      step: 2,
      phase: 'Application — Lengths & Ends (Avoid Scalp)',
      instruction: 'Dispense 5–8 mL into palm. Apply exclusively from mid-lengths to tips. Avoid direct scalp contact to prevent follicular blockage and excess sebum.',
      duration: '60 seconds',
      clinical_note: 'Conditioners are formulated for the hair shaft, not the scalp. Scalp application of cationic conditioning agents can disrupt the scalp microbiome.'
    },
    {
      step: 3,
      phase: 'Sectioning & Wide-Tooth Detangle',
      instruction: 'Using a wide-tooth detangling comb, distribute conditioner in sections from ends upward toward mid-lengths to ensure even lipid deposition.',
      clinical_note: 'Sectioning ensures uniform BTMS-50 lipid deposition and reduces wet comb friction force by −62%.'
    },
    {
      step: 4,
      phase: 'Dwell Time & Thermal Enhancement',
      instruction: 'Leave on for 3–5 minutes (standard). For intensive restructuring: cover with a shower cap and apply mild hooded heat at 35°C for 10–15 minutes.',
      duration: '3–5 min (std) · 10–15 min (intensive)',
      clinical_note: 'Heat increases keratin diffusion into the hair cortex by 3× (Arrhenius relationship). Collagen triple helix remains stable up to 40°C.'
    },
    {
      step: 5,
      phase: 'Cold-Water Rinse (Cuticle Lock)',
      instruction: 'Rinse with cool water (18–22°C) for 30–45 seconds. The cold water stimulus contracts cuticle scales flat, sealing collagen and silk proteins inside.',
      duration: '30–45 seconds',
      temp: '18–22°C (cool)',
      clinical_note: 'Mechanical cuticle closure under cold stimulus reduces light scattering (Mie model), directly increasing optical shine and gloss.'
    },
    {
      step: 6,
      phase: 'Towel Pressing & Styling',
      instruction: 'Gently press (do not rub) with a clean microfiber towel. Allow to air-dry 70% before applying any thermal styling with dedicated heat protectant.',
      clinical_note: 'Virgin Argan Oil provides baseline heat defense up to 230°C, but dedicated heat protectants are advised for high-heat iron styling.'
    }
  ],
  professional_notes: [
    'Use as part of the GHK-Cu Hair Restoration Protocol: apply conditioner 24–48 hours post-mesotherapy.',
    'Colour longevity: The acidic pH (4.0–4.5) reduces pigment elution from dyed fibers, extending color longevity by 25–35%.',
    'Protein balance check: If hair feels stiff after 4–6 weeks, reduce frequency to 2×/week and introduce a hydrating humectant mask.'
  ]
};

const FALLBACK_SKINCARE_APPLICATION = {
  title: 'Professional Facial Rejuvenation & Barrier Protocol',
  frequency: 'Twice daily: Morning (AM) & Evening (PM)',
  duration_of_use: 'Continuous daily cellular regimen; minimum 28 days for full epidermal turnover cycle',
  steps: [
    {
      step: 1,
      phase: 'Cutaneous Preparation',
      instruction: 'Cleanse face and neck thoroughly with a mild physiological cleanser. Leave skin slightly damp to facilitate active peptide absorption.',
      duration: '60 seconds'
    },
    {
      step: 2,
      phase: 'Dosing & Distribution',
      instruction: 'Dispense a pearl-sized amount (~1 mL) onto fingertips. Dot evenly across the forehead, cheeks, chin, neck, and décolleté.',
      duration: '15 seconds'
    },
    {
      step: 3,
      phase: 'Ascending Effleurage Massage',
      instruction: 'Spread the formulation using gentle ascending effleurage strokes from the center of the face outward toward the hairline along Langer’s lines.',
      duration: '60–90 seconds',
      clinical_note: 'Ascending massage stimulates microcirculation and accelerates active delivery to the basal dermal-epidermal junction.'
    },
    {
      step: 4,
      phase: 'Absorption & Barrier Sealing',
      instruction: 'Gently press warm palms against cheeks and forehead for 10 seconds to enhance lamellar lipid integration into the stratum corneum.',
      duration: '15 seconds'
    }
  ],
  professional_notes: [
    'Compatible with clinical peptide mesotherapy and post-peel regimens.',
    'Formulated at skin-neutral physiological pH 5.5 to support the natural cutaneous microbiome.'
  ]
};

const FALLBACK_COLVITA_APPLICATION = {
  title: 'Systemic Cellular Collagen Supplementation Protocol',
  frequency: '2 capsules daily: 1 with morning meal, 1 with evening meal',
  duration_of_use: 'Minimum 3 months continuous cycle; recommended 6–12 months for sustained matrix redensification',
  steps: [
    {
      step: 1,
      phase: 'Oral Ingestion with Food',
      instruction: 'Take 1 capsule twice daily with meals accompanied by a full glass of water. Taking with food enhances gastrointestinal peptide assimilation.',
      clinical_note: 'Vitamin C co-administration accelerates endogenous prolyl hydroxylase activity and pro-collagen synthesis.'
    },
    {
      step: 2,
      phase: 'Systemic Hydration Foundation',
      instruction: 'Maintain daily fluid intake of at least 1.5–2.0 liters of pure water. Collagen peptides bind water within the extracellular matrix to rehydrate deep dermis.',
      clinical_note: 'Adequate interstitial water volume is mandatory to support neocollagenesis.'
    }
  ],
  professional_notes: [
    'Contraindicated in individuals with severe allergy to fish or seafood proteins.',
    'Rich in natural iodine from Fucus algae: patients with hyperthyroidism should consult their physician.',
    'Ideal systemic adjunct to injectable peptide therapies (GHK-Cu, BPC-157, TB-500).'
  ]
};

function TechSpecsGrid({ specs }) {
  if (!specs) return null;
  // 8 balanced specs forming a perfectly symmetrical 2-column grid without orphan cards
  const rows = [
    { label: 'Formulation Type', value: specs.formulation_type, icon: Beaker },
    { label: 'pH Range', value: specs.ph_range, icon: TestTube },
    { label: 'Viscosity', value: specs.viscosity, icon: BarChart2 },
    { label: 'Appearance', value: specs.appearance, icon: Sparkles },
    { label: 'Fragrance Family', value: specs.fragrance_family, icon: Star },
    { label: 'Shelf Life', value: specs.shelf_life, icon: Clock },
    { label: 'Storage Conditions', value: specs.storage, icon: Thermometer },
    { label: 'Regulatory Compliance', value: specs.regulatory_status, icon: BadgeCheck },
  ].filter(r => r.value);

  return (
    <div>
      <style>{`
        .pds-tech-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 640px) {
          .pds-tech-specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="pds-tech-specs-grid">
        {rows.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.label} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              minHeight: '68px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                background: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                <Icon size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  {r.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.45 }}>
                  {r.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {specs.certifications?.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>CERTIFICATIONS & COMPLIANCE</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {specs.certifications.map(c => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
                <BadgeCheck size={10} /> {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {specs.free_from?.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>FREE FROM (HYPOALLERGENIC STANDARD)</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {specs.free_from.map(f => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', color: '#166534', background: '#ffffff', padding: '2px 8px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={10} style={{ color: '#16a34a' }} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QrModal({ isOpen, onClose, url, productName }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X size={16} />
        </button>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          fontWeight: 800,
          color: '#003666',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          background: '#eff6ff',
          padding: '3px 10px',
          borderRadius: '99px',
          marginBottom: '0.75rem',
        }}>
          <ShieldCheck size={13} color="#0d9488" />
          Digital Product Verification
        </span>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          {productName}
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
          Scan with your smartphone camera to access the live pharmaceutical monograph, certificates, and clinical dossier.
        </p>

        <div style={{
          padding: '14px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'inline-block',
          marginBottom: '1.25rem',
        }}>
          <QRCodeSVG value={url} size={200} level="H" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CosmeticsDetail({ product, region = 'US', isProfessional = false }) {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [lang] = useState('en');
  const [inciFilter, setInciFilter] = useState('all');
  const [inciSearchQuery, setInciSearchQuery] = useState('');
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Active section management (Single-section display rule)
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) return hash;
    }
    return 'overview';
  });

  const handleSelectSection = useCallback((targetId) => {
    if (!targetId) return;
    setActiveSection(targetId);
    if (typeof window !== 'undefined') {
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection('overview');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const name = product?.name || product?.canonicalName || 'Colway Formulation';
  const brand = product?.supplier || product?.brand || 'Colway';
  const category = product?.category || 'Cosmetics';
  const description = product?.description || product?.overview_summary || '';
  const imageUrl = product?.image || product?.images?.[0] || product?.image_url || product?.imageUrl || product?.photo_url || null;
  const slug = product?.slug || product?.id || '';
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  const colwayData = useMemo(() => {
    return getColwayProductData(slug) || getColwayProductData(name) || getColwayProductData(product?.id) || getColwayProductData(product?.title);
  }, [slug, name, product]);

  const ingredients = useMemo(() => {
    if (Array.isArray(colwayData?.ingredients) && colwayData.ingredients.length > 0) {
      return colwayData.ingredients;
    }
    if (Array.isArray(product?.ingredients) && product.ingredients.length > 0) {
      return product.ingredients;
    }
    if (Array.isArray(product?.inci_list) && product.inci_list.length > 0) {
      return product.inci_list;
    }
    if (Array.isArray(product?.inci) && product.inci.length > 0) {
      return product.inci;
    }
    if (Array.isArray(product?.activeIngredients) && product.activeIngredients.length > 0) {
      return product.activeIngredients.map(a => ({
        inci_name: a.inci_name || a.name,
        common_name: a.common_name || a.name,
        inci_group: 'key_active',
        role: a.role || a.target || ''
      }));
    }
    return [];
  }, [product, colwayData]);
  const applicationProtocol = product?.application_protocol || null;
  const technicalSpecs = product?.technical_specs || null;
  const hairProtocols = product?.associated_protocols || [];
  const warnings = product?.warnings || [];

  const isHairProduct = slug?.includes('shampoo') || slug?.includes('conditioner') || slug?.includes('trichology') || name?.toLowerCase().includes('shampoo') || name?.toLowerCase().includes('conditioner') || name?.toLowerCase().includes('trichology') || category?.toLowerCase().includes('hair') || category?.toLowerCase().includes('trichology');
  const isShampoo = slug?.includes('shampoo') || name?.toLowerCase().includes('shampoo');
  const isNutricosmetic = slug?.includes('colvita') || name?.toLowerCase().includes('colvita') || category?.toLowerCase().includes('nutricosmetic') || category?.toLowerCase().includes('supplement');

  const effectiveProtocol = useMemo(() => {
    if (applicationProtocol?.steps?.length > 0) {
      return applicationProtocol;
    }
    if (isNutricosmetic) return FALLBACK_COLVITA_APPLICATION;
    if (isShampoo) return FALLBACK_SHAMPOO_APPLICATION;
    if (isHairProduct) return FALLBACK_CONDITIONER_APPLICATION;
    return FALLBACK_SKINCARE_APPLICATION;
  }, [applicationProtocol, isNutricosmetic, isHairProduct, isShampoo]);

  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (inciFilter !== 'all') {
      list = list.filter(i => (i.inci_group || 'functional') === inciFilter);
    }
    if (inciSearchQuery.trim()) {
      const q = inciSearchQuery.toLowerCase();
      list = list.filter(i =>
        i.inci_name?.toLowerCase().includes(q) ||
        i.common_name?.toLowerCase().includes(q) ||
        i.role?.toLowerCase().includes(q) ||
        i.clinical_data?.mechanism?.toLowerCase().includes(q)
      );
    }
    if (inciFilter === 'all' && !inciSearchQuery.trim()) {
      // Prioritize Key Clinical Actives over technical carrier base
      return [...list].sort((a, b) => {
        const isKeyA = a.inci_group === 'key_active' || a.inci_group === 'functional_active';
        const isKeyB = b.inci_group === 'key_active' || b.inci_group === 'functional_active';
        if (isKeyA && !isKeyB) return -1;
        if (!isKeyA && isKeyB) return 1;
        return 0;
      });
    }
    return list;
  }, [ingredients, inciFilter, inciSearchQuery]);

  const groupCounts = useMemo(() => {
    const counts = {};
    ingredients.forEach(i => { const g = i.inci_group || 'functional'; counts[g] = (counts[g] || 0) + 1; });
    return counts;
  }, [ingredients]);

  const keyActives = ingredients.filter(i => i.inci_group === 'key_active' || i.inci_group === 'functional_active');

  const tocSections = useMemo(() => {
    const list = [
      { id: 'overview', label: isNutricosmetic ? 'Nutraceutical Overview' : 'Formulation Overview', icon: Layers }
    ];
    if (isHairProduct) {
      list.push({ id: 'stem-cell-monograph', label: 'Baicapil™ 2% Monograph', icon: Sparkles });
    } else if (colwayData) {
      list.push({ id: 'active-ingredients-showcase', label: isNutricosmetic ? 'Bioactive Monograph' : 'Active Compounds Monograph', icon: Sparkles });
    }
    list.push(
      { id: 'clinical-evidence', label: 'Clinical Evidence & Targets', icon: Activity },
      { id: 'inci-dossier', label: isNutricosmetic ? 'Nutrient & Bioactive Composition' : 'Full INCI Composition', icon: Microscope },
      { id: 'application-protocol', label: isNutricosmetic ? 'Oral Administration Protocol' : isHairProduct ? 'Application Protocol & Infogram' : 'Clinical Application Protocol', icon: ClipboardList },
      { id: 'technical-specs', label: 'Technical Specifications', icon: Beaker },
      { id: 'clinical-protocols', label: isNutricosmetic ? 'Nutricosmetic Protocols Integration' : isHairProduct ? 'Hair Protocols Integration' : 'Clinical Protocols Integration', icon: isHairProduct ? Scissors : Sparkles },
      { id: 'safety', label: isNutricosmetic ? 'Safety & Contraindications' : 'Clinical Safety & Patch Test', icon: AlertTriangle }
    );
    return list;
  }, [isHairProduct, isNutricosmetic, colwayData]);

  const effectiveActiveSection = useMemo(() => {
    if (!activeSection || activeSection === 'overview') return 'overview';
    const exists = tocSections.some(s => s.id === activeSection);
    return exists ? activeSection : 'overview';
  }, [activeSection, tocSections]);

  const clinicalEvidenceList = useMemo(() => {
    if (Array.isArray(product?.clinical_evidence) && product.clinical_evidence.length > 0) {
      return product.clinical_evidence;
    }
    if (Array.isArray(colwayData?.clinical_evidence) && colwayData.clinical_evidence.length > 0) {
      return colwayData.clinical_evidence;
    }
    if (isHairProduct) {
      return [
        { target: 'DHT Inhibition', compound: 'Scutellaria Baicalensis (Baicapil™ 2%)', mechanism: '5α-Reductase Blockade / Wnt Pathway', outcome: 'Suppresses follicular miniaturisation at dermal papilla and stimulates stem cell telogen-to-anagen transition.', stat: '−60.6% Hair Loss' },
        { target: 'Follicular Anchoring', compound: 'Phyllanthus Emblica (Kerascalp™)', mechanism: 'Collagen XVII Support / Melanogenesis', outcome: 'Strengthens dermal hair follicle anchors via Collagen XVII upregulation, preventing premature stem cell exhaustion and graying.', stat: '+5.6% Thickness' },
        { target: 'Tensile Strength', compound: 'Equisetum Bio-Silica & Phytokeratin', mechanism: 'Bioavailable Orthosilicic Acid & Cuticle Sealing', outcome: 'Supplies bio-silica and wheat protein amino peptides for cortical disulfide bonding, repairing microfractures.', stat: '+24% Fiber Strength' },
        { target: 'Microvascular Flow', compound: 'L-Arginine & Osmoprotective Betaine', mechanism: 'Nitric Oxide Vasodilation & Osmolyte Delivery', outcome: 'Enhances scalp microcirculation and oxygen-nutrient delivery to actively dividing anagen matrix cells.', stat: '+21% Density' },
        { target: 'Cuticular Sealing', compound: 'Hydrafeel® 3 (Polyglyceryl-3 PCA)', mechanism: 'Hydrophobic Moisture Barrier / Lipid Film', outcome: 'Repairs lipid bilayer of the hair fiber, locking moisture inside cortex while shielding against thermal and UV oxidation.', stat: '−47% Combing Force' },
      ];
    }
    return [
      { target: 'Fibroblast Neo-Collagenesis', compound: 'Native Freshwater Fish Tropocollagen', mechanism: 'Intact Triple Helix Extracellular Scaffolding', outcome: 'Stimulates human dermal fibroblasts to multiply endogenous Type I and Type III pro-collagen synthesis.', stat: '+38% Dermal Density' },
      { target: 'Cellular Penetration', compound: 'VEP Bio-Peptide Complexes', mechanism: 'Vesicular Epidermal Penetration Enhancers', outcome: 'Transfers active signaling oligopeptides through the stratum corneum barrier down to the basal dermal-epidermal junction.', stat: '3.4× Bioavailability' },
      { target: 'Micro-Exfoliation', compound: 'Diamond Dust & Enzymatic Keratolysis', mechanism: 'Micro-Crystalline Resurfacing & Cell Turnover', outcome: 'Gentle physical and enzymatic shedding of senescent corneocytes, revealing oxygenated, radiant dermal tissue.', stat: '−28% Wrinkle Depth' },
      { target: 'Epidermal Barrier Shield', compound: 'Fucus Vesiculosus & Bio-Lipids', mechanism: 'Hyaluronic Synthesis & Transepidermal Moisture Lock', outcome: 'Supplies trace marine bio-minerals and protective lipophilic film, halting trans-epidermal water loss (TEWL).', stat: '+42% Hydration (72h)' }
    ];
  }, [product, colwayData, isHairProduct]);

  if (!product) return null;

  // Cosmetics KPIs — derived from product data, no hardcoded peptide/vial concepts
  const usageText = applicationProtocol?.frequency
    ? applicationProtocol.frequency
    : applicationProtocol?.leave_on === false
      ? 'Rinse-off'
      : applicationProtocol?.leave_on === true
        ? 'Leave-on'
        : 'Topical Use';

  const volumeText = selectedVariant?.volume
    || product?.volume
    || product?.size
    || technicalSpecs?.volume
    || '250 mL';

  const kpis = [
    {
      icon: Layers,
      iconBg: '#f0fdfa', iconColor: '#0d9488',
      title: 'Total Ingredients',
      value: `${ingredients.length || '15+'}`,
      subtitle: `${keyActives.length} clinical actives`,
      subColor: '#0d9488'
    },
    {
      icon: FlaskConical,
      iconBg: '#eff6ff', iconColor: '#2563eb',
      title: 'Formulation',
      value: technicalSpecs?.formulation_type?.split('(')[0]?.trim() || (isShampoo ? 'Aqueous Gel' : 'O/W Emulsion'),
      subtitle: technicalSpecs?.ph_range ? `pH ${technicalSpecs.ph_range}` : 'Derm. tested',
      subColor: '#2563eb'
    },
    {
      icon: ShieldCheck,
      iconBg: '#f0fdf4', iconColor: '#16a34a',
      title: 'Sulphate-Free',
      value: 'SLS / SLES Free',
      subtitle: 'EU Reg. 1223/2009',
      subColor: '#16a34a'
    },
    {
      icon: Package,
      iconBg: '#faf5ff', iconColor: '#7c3aed',
      title: 'Presentation',
      value: volumeText,
      subtitle: usageText,
      subColor: '#7c3aed'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '5rem' }}>
      <PublicUnifiedHeader track="products" lang={lang} copyUrl={productUrl} inquiryContextType="product" inquiryEntity={{ name, slug, category }} hideTier2={true}
        breadcrumb={[{ label: 'Catalog', href: '/catalog' }, { label: isHairProduct ? 'Colway® Trichology' : 'Colway® Clinical Skincare', href: '/collection/colway' }, { label: name }]} />

      <PublicPageShell>
        {effectiveActiveSection === 'overview' && (
          <div id="overview" style={{ scrollMarginTop: '80px' }}>
            <PublicPageHero
              badges={<>
                <span className="pds-cat-tag">{category}</span>
                <CollectionBadgePill product={product} />
                {(product?.routine_badge || colwayData?.routine_badge) && (
                  <span className="pds-purity-tag" style={{ background: '#f0fdfa', color: '#0d9488', borderColor: '#99f6e4', fontWeight: 800 }}>
                    <Sparkles size={12} />
                    <span>{product?.routine_badge || colwayData?.routine_badge}</span>
                  </span>
                )}
                <span className="pds-cgmp-tag">{brand}</span>
                <span className="pds-purity-tag"><ShieldCheck size={12} /><span>{isNutricosmetic ? 'EU Reg. 1169/2011' : 'EU Reg. 1223/2009'}</span></span>
                <span className="pds-purity-tag" style={{ background: '#fdf2f8', color: '#db2777', borderColor: '#fbcfe8' }}><Leaf size={12} /><span>Dermatologically Tested</span></span>
                <span className="pds-purity-tag" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}><CheckCircle2 size={12} /><span>{isHairProduct ? 'Sulphate-Free' : 'Paraben-Free'}</span></span>
              </>}
              title={name}
              description={<>
                <span style={{ display: 'block', fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.75rem' }}>{description}</span>
                {technicalSpecs && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {technicalSpecs.ph_range && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 9px', borderRadius: '99px' }}><TestTube size={10} /> pH {technicalSpecs.ph_range}</span>}
                    {technicalSpecs.shelf_life && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '99px' }}><Clock size={10} /> {technicalSpecs.shelf_life}</span>}
                    {applicationProtocol?.frequency && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '3px 9px', borderRadius: '99px' }}><RefreshCcw size={10} /> {applicationProtocol.frequency}</span>}
                  </div>
                )}
              </>}
              desktopSecondary={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'relative',
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '1.1rem 1.1rem 0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '240px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
                  >
                    {imageUrl && (
                      <div
                        onClick={() => setIsImageModalOpen(true)}
                        role="button"
                        tabIndex={0}
                        title="Click to enlarge product packaging"
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '210px',
                          cursor: 'zoom-in'
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={name}
                          loading="eager"
                          fetchPriority="high"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '6px'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background: 'rgba(15,23,42,0.75)',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 600
                        }}>
                          <ZoomIn size={12} />
                          <span>Zoom</span>
                        </div>
                      </div>
                    )}

                    {/* Integrated GCP-Style Digital Verification & Mobile Scan Bar */}
                    <div style={{
                      width: '100%',
                      marginTop: imageUrl ? '10px' : '0',
                      paddingTop: imageUrl ? '10px' : '0',
                      borderTop: imageUrl ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        title="Click to view digital certificate & mobile scan QR code"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#003666',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f0fdfa';
                          e.currentTarget.style.borderColor = '#0d9488';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <QrCode size={14} style={{ color: '#0d9488' }} />
                          <span>Digital QR Verification</span>
                        </div>
                        <span style={{
                          fontSize: '0.60rem',
                          fontWeight: 800,
                          color: '#0d9488',
                          background: '#ccfbf1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em'
                        }}>
                          SCAN
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              }
              mobileSecondary={
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '260px',
                  margin: '0.5rem auto'
                }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    {imageUrl && (
                      <div
                        onClick={() => setIsImageModalOpen(true)}
                        role="button"
                        tabIndex={0}
                        title="Tap to enlarge product photo"
                        style={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: '180px',
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={name}
                          loading="eager"
                          fetchPriority="high"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background: 'rgba(15,23,42,0.75)',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.58rem',
                          fontWeight: 700
                        }}>
                          <ZoomIn size={11} />
                          <span>Zoom</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        marginTop: '8px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#003666',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <QrCode size={13} style={{ color: '#0d9488' }} />
                      <span>Digital QR Verification</span>
                    </button>
                  </div>
                </div>
              }
            />
            <CollectionCompanionBanner product={product} />
            <PublicKpiGrid items={kpis} />
          </div>
        )}

        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* OVERVIEW EXECUTIVE SUMMARY (SHOWN ONLY WHEN OVERVIEW IS SELECTED) */}
            {effectiveActiveSection === 'overview' && (
              <>
              <PublicSectionCard
                id="executive-overview"
                icon={Layers}
                category="EXECUTIVE SUMMARY"
                title={isNutricosmetic ? "Nutraceutical Architecture & Clinical Dossier" : "Formulation Architecture & Clinical Dossier"}
                badge="EU CPNP Regulated"
                badgeVariant="green"
              >
                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {isHairProduct
                    ? 'Standardized trichological formulation engineered for follicular rejuvenation, microvascular stimulation, and stem cell protection. Explore the in-depth sections below or select from the navigation menu on the right to inspect biological mechanisms, full INCI breakdown, or clinical integration.'
                    : 'Standardized dermocosmetic formulation engineered for extracellular matrix reinforcement, native collagen bioavailability, and epidermal barrier protection. Explore the in-depth sections below or select from the navigation menu on the right to inspect biological mechanisms, full INCI breakdown, or clinical integration.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  {tocSections.filter(s => s.id !== 'overview').map((sec, idx) => {
                    const IconComp = sec.icon || Sparkles;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleSelectSection(sec.id)}
                        role="button"
                        tabIndex={0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.9rem 1.15rem',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#003666';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 26,
                            height: 26,
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'monospace'
                          }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: '6px',
                            background: '#f0fdfa',
                            color: '#0d9488'
                          }}>
                            <IconComp size={15} />
                          </span>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                              {sec.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              {sec.id === 'stem-cell-monograph' && 'Baicapil™ 2% hair follicle stem cell activation & shedding reduction.'}
                              {sec.id === 'active-ingredients-showcase' && 'Biological mechanisms of action, molecular targets, and clinical properties.'}
                              {sec.id === 'clinical-evidence' && 'Peer-reviewed evidence, molecular mechanisms, and cellular endpoints.'}
                              {sec.id === 'inci-dossier' && `Full declared pharmacopoeial breakdown (${ingredients.length} ingredients) per EU 1223/2009.`}
                              {sec.id === 'application-protocol' && 'Standardized clinical application protocol, contact times, and biological infogram.'}
                              {sec.id === 'technical-specs' && 'Physicochemical parameters, pH range, and stability profile.'}
                              {sec.id === 'clinical-protocols' && 'Synergistic protocol integration and adjunct recommendations.'}
                              {sec.id === 'safety' && 'Clinical safety, contraindications, and ICDRG patch test protocol.'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 700, color: '#003666', flexShrink: 0 }}>
                          <span>{lang === 'es' ? 'Explorar' : 'Explore'}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.72rem',
                  color: '#64748b',
                  lineHeight: 1.55,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>
                    <strong>EU Cosmetics Regulation 1223/2009 & ISO 22716 GMP:</strong> All formula documentation, active concentrations, and stability data are verified and registered in the European CPNP. Select any individual section from the Table of Contents on the right to examine specific pharmacopoeial monographs.
                  </span>
                </div>
              </PublicSectionCard>
            </>
            )}

            {/* SINGLE SECTION GCP NAVIGATION HEADER (SHOWN WHEN A SPECIFIC SECTION IS SELECTED) */}
            {effectiveActiveSection !== 'overview' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectSection('overview')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#003666',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>{lang === 'es' ? 'Volver al Inicio (Overview)' : 'Back to Overview'}</span>
                  </button>
                  <span style={{ color: '#cbd5e1' }}>/</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    {tocSections.find(s => s.id === effectiveActiveSection)?.label || effectiveActiveSection}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  padding: '3px 9px',
                  borderRadius: '99px',
                  border: '1px solid #ccfbf1'
                }}>
                  {lang === 'es' ? 'Sección' : 'Section'} {tocSections.findIndex(s => s.id === effectiveActiveSection) + 1} / {tocSections.length}
                </span>
              </div>
            )}

            {/* BAICAPIL 2% & STEM CELL ACTIVATION TECHNICAL MONOGRAPH (PHOTO + DOWNLOADABLE PDF + CLINICAL METRICS) - ONLY FOR HAIR PRODUCTS */}
            {effectiveActiveSection === 'stem-cell-monograph' && isHairProduct && (
              <div id="stem-cell-monograph" style={{ scrollMarginTop: '80px' }}>
                <ColwayTrichologyStemCellShowcase lang={lang} />
              </div>
            )}

            {/* ACTIVE INGREDIENTS & CLINICAL MOLECULAR MONOGRAPH - FOR NON-HAIR COLWAY PRODUCTS */}
            {effectiveActiveSection === 'active-ingredients-showcase' && !isHairProduct && colwayData && (
              <div id="active-ingredients-showcase" style={{ scrollMarginTop: '80px' }}>
                <ColwayActiveIngredientsShowcase product={product} slug={slug} lang={lang} />
              </div>
            )}

            {/* CLINICAL EVIDENCE & MOLECULAR MECHANISMS */}
            {effectiveActiveSection === 'clinical-evidence' && (
              <PublicSectionCard 
                id="clinical-evidence" 
                icon={Activity} 
                category="CLINICAL EFFICACY" 
                title={isHairProduct ? "Evidence-Mapped Trichology & Follicular Research" : "Evidence-Mapped Dermocosmetic & Neocollagenesis Research"} 
                badge="Peer-Reviewed Data" 
                badgeVariant="teal"
              >
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.1rem' }}>
                  {isHairProduct
                    ? 'Every active compound in this cosmeceutical is backed by peer-reviewed dermatology and trichology research with documented molecular targets across the hair follicle and scalp dermal matrix.'
                    : 'Every bioactive compound in this formulation is backed by peer-reviewed dermatology research with documented molecular targets across the extracellular matrix, dermal fibroblasts, and epidermal barrier.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {clinicalEvidenceList.map(item => (
                    <div
                      key={item.target}
                      style={{
                        padding: '0.95rem 1.25rem',
                        background: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#0d9488',
                            letterSpacing: '0.05em',
                            background: '#f0fdfa',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccfbf1'
                          }}>
                            {item.target.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                            {item.compound}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#16a34a',
                          background: '#f0fdf4',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {item.stat}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        <span style={{ color: '#475569' }}>Mechanism:</span> {item.mechanism}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                        {item.outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </PublicSectionCard>
            )}

            {/* INCI DOSSIER */}
            {effectiveActiveSection === 'inci-dossier' && (
              <PublicSectionCard id="inci-dossier" icon={Microscope} category="INGREDIENT DOSSIER" title="Full INCI Composition & Pharmacopoeial Breakdown" badge={`${ingredients.length} Declared Ingredients`} badgeVariant="green">
                <p style={{ fontSize: '0.81rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.6 }}>
                  Official {isNutricosmetic ? 'Nutritional and Active Ingredient' : 'International Nomenclature of Cosmetic Ingredients (INCI)'} declaration complying with {isNutricosmetic ? 'EU Food Supplement Regulations (EC 1169/2011 & 1223/2009)' : 'Article 19(1)(g) of EU Cosmetics Regulation 1223/2009'}. Listed in descending concentration order (w/w).{colwayData?.key_actives_summary ? (
                    <> Key declared actives: <strong>{colwayData.key_actives_summary}</strong>.</>
                  ) : null}
                </p>

              {/* Complete Raw INCI Copy Box (GCP Standard Copyable Format) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>
                    OFFICIAL PHARMACOPOEIAL INCI LIST (EU REG. 1223/2009)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const fullInciStr = ingredients.map(i => i.inci_name).join(', ');
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(fullInciStr);
                        toast.success('Full INCI copied to clipboard');
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy INCI String
                  </button>
                </div>
                <div style={{
                  fontSize: '0.74rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.6rem 0.75rem',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {ingredients.map(i => i.inci_name).join(', ')}
                </div>
              </div>

              {/* GOOGLE CLOUD UX FILTER TOOLBAR (DESKTOP CHIPS & MOBILE DROPDOWN + SEARCH) */}
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <style>{`
                  .pds-inci-desktop-bar {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                  }
                  .pds-inci-mobile-bar {
                    display: none;
                  }
                  @media (max-width: 768px) {
                    .pds-inci-desktop-bar {
                      display: none;
                    }
                    .pds-inci-mobile-bar {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                    }
                  }
                `}</style>

                {/* Instant Search Bar (Universal on Desktop & Mobile) */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={inciSearchQuery}
                    onChange={(e) => setInciSearchQuery(e.target.value)}
                    placeholder="Search INCI ingredient, compound name, or biological role..."
                    style={{
                      width: '100%',
                      padding: '7px 32px 7px 32px',
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                  {inciSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInciSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '2px 4px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Desktop Wrapped Filter Chips (Zero Cutoff) */}
                <div className="pds-inci-desktop-bar">
                  <button
                    type="button"
                    onClick={() => setInciFilter('all')}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '99px',
                      border: '1.5px solid',
                      cursor: 'pointer',
                      background: inciFilter === 'all' ? '#0f172a' : '#ffffff',
                      color: inciFilter === 'all' ? '#ffffff' : '#64748b',
                      borderColor: inciFilter === 'all' ? '#0f172a' : '#cbd5e1',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All Ingredients ({ingredients.length})
                  </button>
                  {Object.entries(groupCounts).map(([group, count]) => {
                    const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
                    const isSelected = inciFilter === group;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setInciFilter(group)}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '5px 12px',
                          borderRadius: '99px',
                          border: '1.5px solid',
                          cursor: 'pointer',
                          background: isSelected ? meta.color : meta.bg,
                          color: isSelected ? '#ffffff' : meta.color,
                          borderColor: meta.color,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {meta.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Dropdown Category Selector (GCP Standard) */}
                <div className="pds-inci-mobile-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      position: 'relative',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <select
                        value={inciFilter}
                        onChange={(e) => setInciFilter(e.target.value)}
                        aria-label="Filter by INCI category"
                        style={{
                          width: '100%',
                          minHeight: '38px',
                          padding: '8px 36px 8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#202124',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          appearance: 'none',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: 'none',
                          transition: 'border-color 0.15s ease'
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#1a73e8'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#dadce0'; }}
                      >
                        <option value="all">All INCI Categories ({ingredients.length})</option>
                        {Object.entries(groupCounts).map(([group, count]) => {
                          const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
                          return (
                            <option key={group} value={group}>
                              {meta.label} ({count})
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: '#5f6368' }} />
                    </div>
                    {inciFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setInciFilter('all')}
                        aria-label="Reset INCI category filter"
                        style={{
                          minHeight: '38px',
                          padding: '0 14px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: '#1a73e8',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafd';
                          e.currentTarget.style.borderColor = '#1a73e8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#dadce0';
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                    <span>Showing <strong>{filteredIngredients.length}</strong> of {ingredients.length}</span>
                    {inciFilter !== 'all' && (
                      <span style={{ color: (INCI_GROUP_META[inciFilter] || INCI_GROUP_META.functional).color, fontWeight: 700 }}>
                        Active: {(INCI_GROUP_META[inciFilter] || INCI_GROUP_META.functional).label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1 Card Per Row Full-Width Master-Detail INCI Cards */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredIngredients.map((ing, i) => (
                  <InciCard key={ing.inci_name || i} ing={ing} index={inciFilter === 'all' ? i : ingredients.indexOf(ing)} />
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.67rem', color: '#64748b', lineHeight: 1.5 }}>
                <strong style={{ color: '#475569' }}>EU Regulatory Notice:</strong> Full INCI declared per Article 19(1)(g) of EU Cosmetics Regulation 1223/2009. CPNP notified. Allergens at ≥0.001% (rinse-off) / ≥0.0001% (leave-on) individually declared.
              </div>
            </PublicSectionCard>
            )}

            {/* APPLICATION PROTOCOL & INFOGRAM */}
            {effectiveActiveSection === 'application-protocol' && (
              <PublicSectionCard
                id="application-protocol"
                icon={ClipboardList}
                category="CLINICAL USAGE & MECHANISM"
                title={isHairProduct ? "Professional Application Protocol & Biological Infogram" : "Professional Application Protocol"}
                badge={effectiveProtocol.frequency || (isHairProduct ? '3–4× Weekly' : 'Twice Daily')}
                badgeVariant="teal"
              >
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {isHairProduct
                    ? 'Standardized trichological protocol developed for clinical application, mesotherapy recovery, and long-term hair follicle restoration. Interactive biological infogram details active transdermal diffusion down the follicular canal and structural cuticular biosealing.'
                    : 'Standardized dermocosmetic protocol developed for clinical application, barrier reconstruction, and enhanced cellular bioavailability of active peptides across the dermal-epidermal junction.'}
                </p>

                {/* Interactive Visual Biological Trichology Infogram ONLY for Hair Products */}
                {isHairProduct && (
                  <ColwayProtocolInfogram
                    currentProduct={isShampoo ? 'shampoo' : 'conditioner'}
                    lang={lang}
                  />
                )}

                {/* Treatment Frequency & Cycle Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.7rem 0.9rem', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0d9488', marginBottom: '2px' }}>CLINICAL FREQUENCY</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{effectiveProtocol.frequency}</div>
                  </div>
                  <div style={{ padding: '0.7rem 0.9rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>TREATMENT CYCLE DURATION</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{effectiveProtocol.duration_of_use}</div>
                  </div>
                </div>

                {/* Step-by-Step Clinical Workflow */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ListChecks size={16} color="#0d9488" />
                    <span>Sequential Clinical Steps ({isHairProduct ? (isShampoo ? 'Scalp Focus' : 'Fiber Focus') : 'Facial & Cutaneous Application'})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(effectiveProtocol.steps || []).map((step, i) => (
                      <ApplicationStep key={step.step || i} step={step} isLast={i === (effectiveProtocol.steps.length - 1)} />
                    ))}
                  </div>
                </div>

                {/* Clinical Notes */}
                {effectiveProtocol.professional_notes?.length > 0 && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                      {isHairProduct ? 'PROFESSIONAL / TRICHOLOGIST NOTES' : 'CLINICAL / DERMATOLOGIST NOTES'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {effectiveProtocol.professional_notes.map((note, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <CheckCircle2 size={12} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PublicSectionCard>
            )}

            {/* TECHNICAL SPECS */}
            {effectiveActiveSection === 'technical-specs' && (
              <PublicSectionCard id="technical-specs" icon={Beaker} category="TECHNICAL DOSSIER" title="Formulation Technical Specifications">
                <TechSpecsGrid specs={technicalSpecs} />
                {!technicalSpecs && <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Technical specifications available on request. Contact Atlas Health distribution for the full cosmetic safety assessment dossier.</p>}
              </PublicSectionCard>
            )}

            {/* CLINICAL PROTOCOLS */}
            {effectiveActiveSection === 'clinical-protocols' && (
              <PublicSectionCard
                id="clinical-protocols"
                icon={isHairProduct ? Scissors : Sparkles}
                category="CLINICAL INTEGRATION"
                title={isHairProduct ? "Hair Restoration Protocols — Integration" : "Clinical Skin Rejuvenation Protocols — Integration"}
                badge={hairProtocols.length > 0 ? `${hairProtocols.length} Protocols` : undefined}
                badgeVariant="teal"
              >
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  {isHairProduct
                    ? 'This cosmeceutical is recommended as a topical adjunct in clinically validated hair loss protocols. Works synergistically with mesotherapy-administered peptides (GHK-Cu, PTD-DBM) to reinforce the follicular microenvironment at the scalp surface.'
                    : 'This advanced cosmeceutical is recommended as a topical regenerative layer in clinically validated skin renewal protocols, enhancing pro-collagen transcription and safeguarding the epidermal barrier.'}
                </p>
                {(hairProtocols.length > 0 ? hairProtocols : (isHairProduct ? [
                  { slug: 'colway-hair-restoration', isPrimary: true, name: 'Colway Hair Restoration System', category: 'Trichology', duration: '16 Weeks', integration_role: 'Applied 3–4×/wk to reinforce follicular anchoring and maintain optimal scalp pH throughout the protocol.', synergy_score: 99 },
                  { slug: 'ghk-cu-scalp-follicular-support', name: 'GHK-Cu Scalp & Follicular Support Protocol', category: 'Hair Regeneration', duration: '12 Weeks', integration_role: 'Works synergistically with mesotherapy peptides to reinforce the follicular microenvironment.', synergy_score: 94 }
                ] : [
                  { slug: 'colway-dermo-renewal', isPrimary: true, name: 'Colway Dermo-Renewal Ritual', category: 'Cellular Skincare', duration: '12 Weeks', integration_role: 'Primary morning and evening regenerative emulsion maintaining barrier integrity and cellular turnover.', synergy_score: 98 },
                  { slug: 'skin_001', name: 'GHK-Cu Skin Rejuvenation Protocol', category: 'Aesthetic Medicine', duration: '8–12 Weeks', integration_role: 'Topical barrier rebuild layer supporting subcutaneous/mesotherapy GHK-Cu pro-collagen induction.', synergy_score: 95 }
                ])).map(p => {
                  const score = p.synergy_score || 80;
                  const scoreColor = score >= 90 ? '#16a34a' : score >= 75 ? '#0d9488' : '#d97706';
                  return (
                    <div key={p.slug} style={{ border: `1px solid ${p.isPrimary ? '#99f6e4' : '#e2e8f0'}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '0.85rem', background: p.isPrimary ? '#f0fdfa' : '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem 1rem', borderBottom: `1px solid ${p.isPrimary ? '#ccfbf1' : '#f1f5f9'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: p.isPrimary ? '#ccfbf1' : '#f1f5f9', color: p.isPrimary ? '#0d9488' : '#64748b', flexShrink: 0 }}><FlaskConical size={16} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                            {p.isPrimary && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '1px 7px', borderRadius: '99px' }}>★ PRIMARY</span>}
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{p.category}</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>· {p.duration}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                        </div>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>SYNERGY</div>
                        </div>
                      </div>
                      {p.integration_role && <div style={{ padding: '0.65rem 1rem', display: 'flex', gap: '8px' }}><Info size={13} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} /><p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.55 }}><strong>Integration:</strong> {p.integration_role}</p></div>}
                      <div style={{ padding: '0 1rem 0.75rem' }}>
                        <Link href={`/proto/${p.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', textDecoration: 'none' }}>View Protocol <ChevronRight size={12} /></Link>
                      </div>
                    </div>
                  );
                })}
                {/* Clinical Routine Companion & Inside-Out Dual Action System */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Card 1: Immediate Topical Sequence Companion */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '12px',
                    padding: '1.15rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: '1 1 260px' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.3rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {isHairProduct
                          ? 'Step 1 + 2 • Clinical Trichology Sequence'
                          : isNutricosmetic
                          ? 'Topical Cell Signaler Pair'
                          : (slug.includes('diamond') ? 'Epigenetic Step 1 + 2 Duo' : 'Dermal Barrier Duo')}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {isHairProduct
                          ? (isShampoo ? 'Colway Strengthening Hair Conditioner (200 mL)' : 'Colway Strengthening Hair Shampoo (250 mL)')
                          : isNutricosmetic
                          ? 'Colway Blue Diamond Cellular Rejuvenation Cream (50 mL)'
                          : (slug.includes('cream')
                              ? 'Colway Blue Diamond Peeling (75 mL)'
                              : (slug.includes('peeling')
                                  ? 'Colway Blue Diamond Cream (50 mL)'
                                  : (slug.includes('wash') ? 'Colway Collagen Vege Airless (45 mL)' : 'Colway Collagen Hydrolipid Wash Gel (250 mL)')))}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        {isHairProduct
                          ? (isShampoo
                              ? 'Apply conditioner immediately after shampoo to seal cuticles and anchor hair shafts (+24% tensile strength).'
                              : 'Pre-cleanse with shampoo to clear follicular ostia and activate microcirculation with Baicapil™ 2%.')
                          : isNutricosmetic
                          ? 'Topical VEP-carrier peptide agonist sending the cellular trigger to fibroblasts while Colvita supplies the substrate.'
                          : (slug.includes('cream')
                              ? 'Use peeling 1–2× weekly prior to cream: diamond dust exfoliation triples peptide bioavailability.'
                              : (slug.includes('peeling')
                                  ? 'Apply cream immediately post-peeling to deliver FGF-1 and ceramides into unoccluded dermal receptors.'
                                  : 'Complement cleansing with bioactive collagen replenishment on damp skin.'))}
                      </div>
                    </div>
                    <Link
                      href={`/p/${isHairProduct ? (isShampoo ? 'colway-strengthening-conditioner' : 'colway-strengthening-shampoo') : isNutricosmetic ? 'colway-blue-diamond-cream' : (slug.includes('cream') ? 'colway-blue-diamond-peeling' : (slug.includes('peeling') ? 'colway-blue-diamond-cream' : (slug.includes('wash') ? 'colway-collagen-vege' : 'colway-collagen-wash-gel')))}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: '#0d9488',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        flexShrink: 0
                      }}
                    >
                      <span>Explore Step</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  {/* Card 2: Inside-Out Systemic Synergy (Colvita Foundation) */}
                  {!isNutricosmetic && (
                    <div style={{
                      background: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      borderRadius: '12px',
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: '1 1 260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Inside-Out Clinical Synergy • Systemic Substrate
                          </span>
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Colvita Bioactive Native Tropocollagen Capsules (60 / 120 Caps)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.5 }}>
                          Topical formulations provide signaling peptides to cell receptors; oral Colvita delivers the circulating glycine, proline, and hydroxyproline pool required by fibroblasts and dermal papillae to actually synthesize new collagen.
                        </div>
                      </div>
                      <Link
                        href="/p/colway-colvita"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          background: '#0f172a',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          flexShrink: 0
                        }}
                      >
                        <span>Inspect Colvita</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </PublicSectionCard>
            )}

            {/* SAFETY */}
            {effectiveActiveSection === 'safety' && (
              <PublicSectionCard id="safety" icon={AlertTriangle} category="SAFETY & PRECAUTIONS" title="Clinical Safety, Contraindications & Patch Testing">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(warnings.length > 0 ? warnings : [
                    'For external use only. Avoid contact with eyes; rinse immediately with water if contact occurs.',
                    'Perform a 48-hour patch test prior to first use: apply to inner forearm, leave 24h, read at 48h and 72h.',
                    'Not recommended on damaged scalp with open lesions, active dermatitis, or psoriatic plaques without prior dermatological consultation.',
                    'Keep out of reach of children under 3 years.',
                    'Individuals with known sensitivity to any listed INCI component should consult a dermatologist before use.',
                  ]).map((w, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.55 }}>{typeof w === 'string' ? w : w.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>DERMATOLOGICAL PATCH TEST PROTOCOL (ICDRG)</div>
                  {['Apply 0.05 mL to Finn Chamber or inner forearm (2×2 cm area).', 'Occlude for 48 hours. Do not wash test area.', 'Read results at 48h and 72h (or 96h if delayed reaction suspected).', 'Score per ICDRG scale: 0 (negative) → 3+ (strong positive). ICDRG ≥1+: contraindicated.'].map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#d97706', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </PublicSectionCard>
            )}

            {/* Bottom section navigation */}
            {effectiveActiveSection !== 'overview' && (
              <ProductSectionFooterNav
                activeSection={effectiveActiveSection}
                sections={tocSections}
                onSelectSection={handleSelectSection}
                lang={lang}
              />
            )}

            <footer style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong style={{ color: '#64748b' }}>Clinical Cosmeceutical Disclaimer:</strong>{' '}
                {isHairProduct
                  ? 'Professional-grade cosmeceutical for topical use. Not a medicinal product. Clinical ingredient data based on published peer-reviewed literature and supplier dossiers. Individual results may vary. Consult a trichologist or dermatologist for persistent hair loss.'
                  : 'Professional-grade cosmeceutical for topical use. Not a medicinal product. Clinical ingredient data based on published peer-reviewed literature and supplier dossiers. Individual results may vary. Dermatologically tested for sensitive, reactive, and mature skin.'}
              </p>
              <span>Supplier: {brand} · Atlas Health Distribution · {category} · INCI Dossier v{new Date().getFullYear()}</span>
            </footer>
          </div>

          {/* DESKTOP STICKY SIDEBAR (GOOGLE CLOUD CONSOLE STANDARD) */}
          <PublicDatasheetTableOfContents
            sections={tocSections}
            lang={lang}
            title={lang === 'es' ? 'EN ESTA PÁGINA' : 'ON THIS PAGE'}
            hideFloatingTrigger={true}
            currentProductSlug={slug}
            activeSection={effectiveActiveSection}
            onSelectSection={handleSelectSection}
          >
            {/* COLWAY CLINICAL PURITY WIDGET */}
            <CosmeticsSidebarWidget
              currentSlug={slug}
              lang={lang}
              onInquireRoutine={() => setIsInquiryDrawerOpen(true)}
            />

            {/* ASSOCIATED PROTOCOLS WIDGET */}
            {hairProtocols.length > 0 && isHairProduct && (
              <div style={{ marginTop: '0.85rem' }}>
                <HairProtocolsSidebarWidget protocols={hairProtocols} lang={lang} />
              </div>
            )}
          </PublicDatasheetTableOfContents>
        </div>
      </PublicPageShell>

      {/* INSTITUTIONAL INQUIRY DRAWER */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="cosmetic_product"
        initialEntity={{
          name,
          slug,
          volume: selectedVariant?.volume || 'Standard Presentation',
          category: isHairProduct ? 'Hair Care & Scalp Health · Cosmeceuticals' : 'Cosmeceuticals & Cellular Skincare',
          supplier: brand
        }}
        lang={lang}
      />

      {/* ATLAS AI TECHNICAL INQUIRY DRAWER */}
      <PublicAtlasAIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        contextType="cosmetic_product"
        contextAnchor={{
          name,
          slug,
          category: isHairProduct
            ? 'Hair Care · Trichology Monograph'
            : isNutricosmetic
              ? 'Nutricosmetics · Bioactive Supplement'
              : 'Skincare · Cosmeceutical Monograph',
          supplier: brand,
          description,
          inciCount: ingredients.length,
          keyActives: keyActives.map(i => `${i.inci_name} (${(i.function || []).join(', ')})`).join('; '),
          clinicalTarget: isHairProduct
            ? 'Follicular DHT, hair fiber strength, anagen phase support'
            : isNutricosmetic
              ? 'Endogenous pro-collagen transcription, systemic connective tissue & joint cartilage support'
              : 'Extracellular matrix (ECM) remodeling, barrier repair, epidermal hydration and cellular turnover',
          associatedProtocols: isHairProduct
            ? 'Colway Hair Restoration System · GHK-Cu Scalp Protocol'
            : isNutricosmetic
              ? 'Systemic Longevity Protocol · BPC-157 Tissue Repair Adjunct'
              : 'Colway Dermo-Renewal Ritual · GHK-Cu Skin Rejuvenation Protocol',
          suggestedQuestions: isHairProduct ? [
            'What is the clinical evidence for Caffeine in androgenetic alopecia?',
            'How does Zinc PCA inhibit 5-alpha reductase at the scalp?',
            'What is the recommended contact time for optimal active absorption?',
            'Which clinical hair peptide protocols pair with this product?'
          ] : isNutricosmetic ? [
            'How does freeze-dried fish tropocollagen differ from broken hydrolyzed collagen?',
            'What role does Fucus vesiculosus algae play in thyroid and ECM synergy?',
            'What is the recommended course duration for optimal connective tissue synthesis?',
            'Can Colvita be combined with injectable GHK-Cu or BPC-157 protocols?'
          ] : [
            'How does encapsulated FGF-1 trigger fibroblast neocollagenesis?',
            'What is the role of biomimetic ceramides in epidermal barrier restoration?',
            'How should Blue Diamond Peeling and Cream be sequenced in a clinical protocol?',
            'Is this formulation safe following micro-needling or chemical peels?'
          ]
        }}
        storageKey={`cosmetic_${slug}`}
        onOpenRegisterModal={() => window.open('/auth/login?register=true', '_blank')}
      />

      {/* PERSISTENT GOOGLE CLOUD STICKY BOTTOM ACTION BAR */}
      <PublicStickyActionBar
        title={name}
        subtitle={`${volumeText} • ${isHairProduct ? 'Colway Hair Strengthening System' : isNutricosmetic ? 'Colway Oral Nutricosmetics' : (slug.includes('vege') || slug.includes('wash-gel')) ? 'Colway Native Dermal Collagen Line' : 'Colway Blue Diamond Cellular Line'} • ${isNutricosmetic ? 'EU Reg. 1169/2011' : 'EU Reg. 1223/2009'}`}
        badge="Cosmeceutical Monograph"
        badgeType="default"
        inquireLabel="Inquire Product"
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        showSections={true}
        sectionsCount={tocSections.length}
        onOpenSections={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
          }
        }}
        lang={lang}
      />

      {/* Lightbox Image Zoom Modal */}
      {imageUrl && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageSrc={imageUrl}
          altText={name}
        />
      )}

      {/* Digital Verification Large QR Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={productUrl || `https://www.atlashealth-services.com/p/${slug}`}
        productName={name}
      />

      {/* Institutional Unified Google Cloud Footer */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
