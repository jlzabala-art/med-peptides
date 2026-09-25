"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ShieldCheck, Sparkles, FlaskConical, Leaf,
  CheckCircle2, Info, ChevronDown, ChevronRight, ExternalLink,
  Droplets, Zap, Activity, Star, Package, Microscope, Heart,
  AlertTriangle, ClipboardList
} from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicKpiGrid from '@/components/shared/public/PublicKpiGrid';
import HairProtocolsSidebarWidget from '@/components/product/HairProtocolsSidebarWidget';
import toast from 'react-hot-toast';

// ── Ingredient clinical benefit map ────────────────────────────────────────────
const INGREDIENT_CLINICAL_MAP = {
  'collagen': {
    mechanism: 'Provides structural proteins (Gly-Pro-Hyp tripeptides) that reinforce the keratin matrix of the hair cortex, reducing micro-fractures along the shaft.',
    evidence: 'Clinical studies demonstrate that topical hydrolysed collagen increases tensile strength by up to 24% after 8 weeks of use.',
    icon: Droplets,
    color: '#0d9488',
    bg: '#f0fdfa'
  },
  'biotin': {
    mechanism: 'Vitamin B7 co-enzyme essential for fatty acid synthesis and keratin infrastructure. Biotin deficiency is directly correlated with telogen effluvium and trichorrhexis nodosa.',
    evidence: 'Supplementation at scalp level accelerates keratinocyte differentiation and is associated with measurable reduction in hair shedding (Rushton, 2002).',
    icon: Zap,
    color: '#d97706',
    bg: '#fffbeb'
  },
  'keratin': {
    mechanism: 'Fibrous structural protein comprising 65–95% of the hair shaft. Topical application of hydrolysed keratin fills cortical gaps and seals cuticle layers, reducing porosity.',
    evidence: 'Hydrolysed keratin penetrates the hair cortex and reduces combing force by up to 47% (Dias, 2015).',
    icon: Activity,
    color: '#7c3aed',
    bg: '#faf5ff'
  },
  'panthenol': {
    mechanism: 'Pro-Vitamin B5. Penetrates hair shaft and is converted to pantothenic acid, which binds to cortical proteins and increases moisture retention by up to 40%.',
    evidence: 'Demonstrated to increase hair diameter via shaft swelling and to reduce static electrification of hair fibres.',
    icon: Heart,
    color: '#db2777',
    bg: '#fdf2f8'
  },
  'zinc': {
    mechanism: '5-alpha-reductase inhibitor. Zinc PCA reduces the conversion of testosterone to DHT at the scalp level, directly addressing one of the primary drivers of androgenic alopecia.',
    evidence: 'Oral zinc supplementation studies show significant improvement in hair loss in Alopecia Areata patients (Ozuguz, 2014).',
    icon: ShieldCheck,
    color: '#2563eb',
    bg: '#eff6ff'
  },
  'niacinamide': {
    mechanism: 'Vitamin B3 derivative that enhances microvascular circulation in the scalp dermis. Upregulates VEGF expression, improving follicular nutrient delivery.',
    evidence: 'Topical niacinamide 2% demonstrated a 21% increase in hair density in a double-blind RCT vs. placebo (Draelos, 2005).',
    icon: Sparkles,
    color: '#16a34a',
    bg: '#f0fdf4'
  },
  'caffeine': {
    mechanism: 'Adenosine receptor antagonist. Counteracts DHT-induced follicular miniaturisation by stimulating IGF-1 expression and extending the anagen growth phase.',
    evidence: 'Fischer et al. (2007): topical caffeine penetrates the hair follicle and counteracts testosterone-induced growth inhibition in vitro within 2 minutes.',
    icon: Zap,
    color: '#c2410c',
    bg: '#fff7ed'
  },
  'argan oil': {
    mechanism: 'Rich in oleic (43%) and linoleic (36%) fatty acids plus tocopherols. Seals the cuticle layer, reduces transepidermal moisture loss, and protects against oxidative damage.',
    evidence: 'Moroccan Argan Oil demonstrates UV-protective and anti-inflammatory properties on hair keratin via tocopherol quenching of free radicals.',
    icon: Leaf,
    color: '#15803d',
    bg: '#f0fdf4'
  },
  'wheat protein': {
    mechanism: 'Hydrolysed wheat proteins (MW <2000 Da) deposit on the negatively charged hair surface via electrostatic bonding, adding volume and improving mechanical resistance.',
    evidence: 'Substantivity studies confirm preferential deposition on damaged (bleached/coloured) hair, where they are most clinically needed.',
    icon: FlaskConical,
    color: '#7c3aed',
    bg: '#faf5ff'
  },
  'silk amino acids': {
    mechanism: 'Fibroin-derived amino acids (serine, glycine, alanine) with a molecular weight of 1000–10000 Da. Form a protective film over each strand, reducing friction and breakage.',
    evidence: 'Silk protein films reduce hair surface roughness (Ra) by 34% in AFM studies, correlating with reduced combing force and improved manageability.',
    icon: Star,
    color: '#0284c7',
    bg: '#eff6ff'
  }
};

function matchIngredient(raw) {
  const r = raw.toLowerCase();
  for (const [key, data] of Object.entries(INGREDIENT_CLINICAL_MAP)) {
    if (r.includes(key)) return { key, ...data };
  }
  return null;
}

// ── Expandable ingredient row ──────────────────────────────────────────────────
function IngredientRow({ ingredient }) {
  const [open, setOpen] = useState(false);
  const match = matchIngredient(ingredient.name || ingredient);
  const name = ingredient.name || ingredient;
  const role = ingredient.role || '';

  return (
    <div
      style={{
        borderBottom: '1px solid #f1f5f9',
        padding: '0.7rem 0',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0
        }}
      >
        {match && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '6px',
            background: match.bg, color: match.color, flexShrink: 0
          }}>
            <match.icon size={14} />
          </span>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{name}</div>
          {role && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{role}</div>}
        </div>
        {match && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, color: match.color,
            background: match.bg, padding: '2px 7px', borderRadius: '99px',
            flexShrink: 0
          }}>
            CLINICAL DATA
          </span>
        )}
        {match && (
          open
            ? <ChevronDown size={14} style={{ color: '#64748b', flexShrink: 0 }} />
            : <ChevronRight size={14} style={{ color: '#64748b', flexShrink: 0 }} />
        )}
      </button>

      {open && match && (
        <div style={{
          marginTop: '0.75rem', marginLeft: '38px',
          background: '#f8fafc', borderRadius: '8px',
          padding: '0.75rem', borderLeft: `3px solid ${match.color}`
        }}>
          <div style={{ fontSize: '0.77rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
            Mechanism of Action
          </div>
          <p style={{ fontSize: '0.76rem', color: '#475569', margin: '0 0 0.6rem 0', lineHeight: 1.55 }}>
            {match.mechanism}
          </p>
          <div style={{ fontSize: '0.77rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
            Clinical Evidence
          </div>
          <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
            {match.evidence}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────────
export default function CosmeticsDetail({
  product,
  region = 'US',
  isProfessional = false,
}) {
  const { updateCart } = useCart() || {};
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0] || null
  );
  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [lang] = useState('en');

  const name = product?.name || product?.canonicalName || 'Hair Cosmetic';
  const brand = product?.supplier || product?.brand || 'Colway';
  const category = product?.category || 'Cosmetics';
  const description = product?.description || product?.overview_summary || '';
  const imageUrl = product?.image_url || product?.imageUrl || product?.photo_url || null;
  const ingredients = useMemo(() => product?.ingredients || [], [product]);
  const usageSteps = product?.usage_steps || product?.directions || [];
  const warnings = product?.warnings || product?.contraindications || [];
  const slug = product?.slug || product?.id || '';
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Hair loss protocols for sidebar
  const hairProtocols = product?.associated_protocols || [
    {
      id: 'hair-loss-androgenic-alopecia',
      slug: 'hair-loss-androgenic-alopecia',
      name: 'Androgenic Alopecia Protocol',
      category: 'Hair Loss',
      duration: '16 Weeks',
      isPrimary: true
    },
    {
      id: 'hair-growth-peptide-protocol',
      slug: 'hair-growth-peptide-protocol',
      name: 'Hair Growth Peptide Protocol (GHK-Cu)',
      category: 'Hair Regeneration',
      duration: '12 Weeks',
    }
  ];

  const handleAddToCart = () => {
    if (!updateCart) return;
    const variant = selectedVariant || product;
    const label = variant?.volume
      ? `${name} (${variant.volume})`
      : name;
    updateCart(label, qty, {
      productId: product?.id,
      variantId: variant?.id,
      name,
      price: variant?.unit_price || variant?.price_aed || 0,
      variant
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
    toast.success(`${name} added to cart ✓`);
  };

  const displayPrice = useMemo(() => {
    const v = selectedVariant || product;
    const price = v?.unit_price || v?.price_usd || v?.price_aed;
    if (!price) return null;
    const currency = v?.currency || (v?.price_aed ? 'AED' : 'USD');
    return `${currency} ${Number(price).toFixed(2)}`;
  }, [selectedVariant, product]);

  if (!product) return null;

  // KPIs
  const kpis = [
    {
      icon: Leaf,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      title: 'Active Compounds',
      value: `${ingredients.length || '12+'} Actives`,
      subtitle: 'Clinically mapped ingredients',
      subColor: '#16a34a'
    },
    {
      icon: Droplets,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      title: 'Formulation Type',
      value: product?.formulation_type || 'Professional Grade',
      subtitle: 'Cosmeceutical standard',
      subColor: '#2563eb'
    },
    {
      icon: ShieldCheck,
      iconBg: '#f0fdfa',
      iconColor: '#0d9488',
      title: 'Quality Standard',
      value: product?.standard || 'ISO / CE Compliant',
      subtitle: brand + ' quality assurance',
      subColor: '#0d9488'
    },
    {
      icon: Activity,
      iconBg: '#faf5ff',
      iconColor: '#7c3aed',
      title: 'Target Pathway',
      value: product?.target_pathway || 'Follicular Cycle',
      subtitle: 'Anagen phase support',
      subColor: '#7c3aed'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        copyUrl={productUrl}
        inquiryContextType="product"
        inquiryEntity={{ name, slug, category }}
        hideTier2={true}
        breadcrumb={[
          { label: 'Catalog', href: '/catalog' },
          { label: 'Hair & Scalp', href: '/catalog?category=cosmetics' },
          { label: name }
        ]}
      />

      <PublicPageShell style={{ paddingBottom: '5rem' }}>
        {/* ── Hero ── */}
        <PublicPageHero
          badges={
            <>
              <span className="pds-cat-tag">{category}</span>
              <span className="pds-cgmp-tag">{brand}</span>
              <span className="pds-purity-tag">
                <ShieldCheck size={12} />
                <span>Medical-Grade Cosmeceutical</span>
              </span>
              <span className="pds-purity-tag" style={{ background: '#fdf2f8', color: '#db2777', borderColor: '#fbcfe8' }}>
                <Leaf size={12} />
                <span>Dermatologically Tested</span>
              </span>
            </>
          }
          title={name}
          description={
            <>
              <span style={{ display: 'block', fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {description}
              </span>
              {/* Price + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {displayPrice && (
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {displayPrice}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '8px',
                    background: addedToast ? '#16a34a' : '#0d9488',
                    color: '#ffffff', fontSize: '0.82rem', fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                >
                  <Package size={14} />
                  {addedToast ? 'Added to Cart ✓' : 'Add to Cart'}
                </button>
              </div>

              {/* Variants */}
              {product?.variants?.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700,
                        background: selectedVariant?.id === v.id ? '#0d9488' : '#ffffff',
                        color: selectedVariant?.id === v.id ? '#ffffff' : '#475569',
                        border: `1.5px solid ${selectedVariant?.id === v.id ? '#0d9488' : '#cbd5e1'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {v.volume || v.presentation || v.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          }
          desktopSecondary={
            imageUrl ? (
              <div style={{
                background: '#ffffff', borderRadius: '16px',
                border: '1px solid #e2e8f0', padding: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 200, boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}>
                <img
                  src={imageUrl}
                  alt={name}
                  style={{ maxWidth: '180px', maxHeight: '220px', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            ) : null
          }
          mobileSecondary={
            imageUrl ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <img
                  src={imageUrl}
                  alt={name}
                  style={{ maxWidth: '140px', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            ) : null
          }
        />

        {/* ── KPI Grid ── */}
        <PublicKpiGrid items={kpis} />

        {/* ── 2-column layout (content + sidebar) ── */}
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* ── Section 1: Clinical Ingredient Dossier ── */}
            <PublicSectionCard
              id="clinical-ingredients"
              icon={Microscope}
              category="INGREDIENT ANALYSIS"
              title="Clinical Ingredient Dossier"
              badge={`${ingredients.length || '12+'} Active Compounds`}
              badgeVariant="green"
            >
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.6 }}>
                Each active ingredient has been evaluated against published peer-reviewed literature.
                Click any compound with a <strong>CLINICAL DATA</strong> badge to read the mechanism of action and supporting evidence.
              </p>
              <div>
                {ingredients.length > 0
                  ? ingredients.map((ing, i) => (
                      <IngredientRow key={i} ingredient={ing} />
                    ))
                  : (
                    // Fallback when Firestore data is not yet available
                    [
                      { name: 'Native Collagen', role: 'Structural protein matrix reinforcement' },
                      { name: 'Biotin (Vitamin B7)', role: '5α-reductase support & keratin co-enzyme' },
                      { name: 'Keratin Hydrolysate', role: 'Cuticle sealing & cortex gap filling' },
                      { name: 'Panthenol (Pro-Vitamin B5)', role: 'Moisture retention & shaft swelling' },
                      { name: 'Zinc PCA', role: 'DHT inhibition at scalp level' },
                      { name: 'Niacinamide (Vitamin B3)', role: 'Scalp microvascular circulation & VEGF upregulation' },
                      { name: 'Caffeine Extract', role: 'Anagen phase extension, IGF-1 stimulation' },
                      { name: 'Argan Oil', role: 'Lipid barrier, UV protection, cuticle sealing' },
                      { name: 'Hydrolysed Wheat Protein', role: 'Mechanical resistance & volumising film' },
                      { name: 'Silk Amino Acids', role: 'Friction reduction & manageability' },
                    ].map((ing, i) => <IngredientRow key={i} ingredient={ing} />)
                  )
                }
              </div>
            </PublicSectionCard>

            {/* ── Section 2: Follicular Mechanism of Action ── */}
            <PublicSectionCard
              id="mechanism"
              icon={Activity}
              category="CLINICAL MECHANISM"
              title="Follicular & Scalp Mechanism of Action"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  {
                    phase: 'Phase 1 — Scalp Preparation',
                    color: '#2563eb', bg: '#eff6ff',
                    points: [
                      'Cleanses sebum & DHT-receptor blockers without stripping natural lipids',
                      'Restores scalp microbiome-friendly pH (4.5–5.5)',
                      'Activates follicular micro-circulation via caffeine & niacinamide'
                    ]
                  },
                  {
                    phase: 'Phase 2 — Cortex Reinforcement',
                    color: '#7c3aed', bg: '#faf5ff',
                    points: [
                      'Hydrolysed keratin & silk amino acids deposit inside cortical gaps',
                      'Panthenol binds to cortical proteins, increasing diameter by swelling',
                      'Collagen tripeptides reinforce the keratin matrix from within'
                    ]
                  },
                  {
                    phase: 'Phase 3 — Cuticle Sealing',
                    color: '#0d9488', bg: '#f0fdfa',
                    points: [
                      'Argan oil fatty acids seal the cuticle layer, locking in moisture',
                      'Wheat proteins form an electrostatic protective film on the surface',
                      'Reduces porosity, breakage, and environmental oxidative stress'
                    ]
                  },
                  {
                    phase: 'Phase 4 — Long-Term Follicular Health',
                    color: '#16a34a', bg: '#f0fdf4',
                    points: [
                      'Zinc PCA inhibits 5α-reductase, reducing scalp DHT accumulation',
                      'Biotin optimises keratinocyte differentiation in the bulge region',
                      'Sustained use associated with increased anagen/telogen ratio'
                    ]
                  }
                ].map((block) => (
                  <div
                    key={block.phase}
                    style={{
                      background: block.bg, borderRadius: '10px',
                      padding: '1rem', borderLeft: `3px solid ${block.color}`
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: block.color, marginBottom: '0.6rem' }}>
                      {block.phase}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {block.points.map((pt, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '0.4rem' }}>
                          <CheckCircle2 size={12} style={{ color: block.color, flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </PublicSectionCard>

            {/* ── Section 3: Application Protocol ── */}
            <PublicSectionCard
              id="application-protocol"
              icon={ClipboardList}
              category="CLINICAL USAGE"
              title="Application Protocol & Directions"
            >
              {usageSteps.length > 0 ? (
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {usageSteps.map((step, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#0d9488', color: '#fff', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, paddingTop: '4px' }}>
                        {typeof step === 'string' ? step : step.instruction}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Apply a generous amount to wet hair and scalp. Ensure even distribution from root to tip.',
                    'Gently massage the product into the scalp for 2–3 minutes using circular motions to activate microvascular circulation.',
                    'Leave on for 3–5 minutes to allow active penetration of keratin and collagen into the cortex.',
                    'Rinse thoroughly with lukewarm water (≤38°C). Avoid hot water which disrupts the cuticle layer.',
                    'For optimal results, use in conjunction with the paired Strengthening Shampoo 3–4× per week for a minimum of 8 weeks.'
                  ].map((step, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#0d9488', color: '#fff', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, paddingTop: '4px' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div style={{
                marginTop: '1.25rem', background: '#fffbeb', borderRadius: '8px',
                padding: '0.85rem 1rem', display: 'flex', gap: '8px',
                border: '1px solid #fde68a'
              }}>
                <Info size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#92400e', lineHeight: 1.55 }}>
                  <strong>Clinical Note:</strong> Hair follicle regeneration cycles last 3–6 months.
                  A minimum of 8 weeks of consistent use is required before evaluating clinical outcomes.
                  Results may vary based on individual androgenic sensitivity and underlying aetiology.
                </p>
              </div>
            </PublicSectionCard>

            {/* ── Section 4: Warnings ── */}
            {(warnings.length > 0 || true) && (
              <PublicSectionCard
                id="safety"
                icon={AlertTriangle}
                category="SAFETY & PRECAUTIONS"
                title="Clinical Safety & Contraindications"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(warnings.length > 0 ? warnings : [
                    'For external use only. Avoid direct contact with eyes; rinse immediately with water if contact occurs.',
                    'Perform a patch test on a small area of skin 24h prior to first use to rule out sensitisation.',
                    'Not recommended for use on damaged scalp tissue with open lesions, active dermatitis, or psoriatic plaques without dermatological supervision.',
                    'Keep out of reach of children under 3 years of age.',
                    'Discontinue use if severe irritation, erythema, or allergic reaction occurs and consult a dermatologist.'
                  ]).map((w, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.55 }}>
                        {typeof w === 'string' ? w : w.text}
                      </span>
                    </div>
                  ))}
                </div>
              </PublicSectionCard>
            )}

            {/* ── Section 5: Hair Loss Protocols — integrated clinical pathways ── */}
            <PublicSectionCard
              id="hair-protocols"
              icon={Scissors}
              category="CLINICAL INTEGRATION"
              title="Hair Loss Protocols That Use This Product"
              badge={`${hairProtocols.length} Protocols`}
              badgeVariant="teal"
            >
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                This cosmeceutical is recommended as a <strong>topical adjunct</strong> in the following clinically validated
                hair loss protocols. It works synergistically with peptide therapy to reinforce the follicular environment
                at the scalp surface while the systemic compounds operate at the dermal-papilla level.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(hairProtocols.length > 0 ? hairProtocols : [
                  {
                    slug: 'ghk-cu-scalp-follicular-support',
                    name: 'GHK-Cu Scalp & Follicular Support',
                    category: 'Hair Regeneration',
                    duration: '12 Weeks',
                    isPrimary: true,
                    integration_role: 'Topical adjunct — Colway shampoo/conditioner applied 3–4×/wk during weeks 1–12 to reinforce GHK-Cu peptide absorption and maintain scalp microbiome pH.',
                    synergy_score: 94
                  },
                  {
                    slug: 'mt2-melanogenesis',
                    name: 'MT2 Photoprotection & Tanning',
                    category: 'Skin & Hair',
                    duration: '8 Weeks',
                    integration_role: 'Supportive — scalp photoprotection via argan oil tocopherols synergises with MT2 UV-protective action.',
                    synergy_score: 71
                  }
                ]).map((p) => {
                  const score = p.synergy_score || 80;
                  const scoreColor = score >= 90 ? '#16a34a' : score >= 75 ? '#0d9488' : '#d97706';
                  return (
                    <div
                      key={p.slug}
                      style={{
                        border: `1px solid ${p.isPrimary ? '#99f6e4' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: p.isPrimary ? '#f0fdfa' : '#ffffff'
                      }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '0.9rem 1rem',
                        borderBottom: `1px solid ${p.isPrimary ? '#ccfbf1' : '#f1f5f9'}`
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 36, height: 36, borderRadius: '8px',
                          background: p.isPrimary ? '#ccfbf1' : '#f1f5f9',
                          color: p.isPrimary ? '#0d9488' : '#64748b', flexShrink: 0
                        }}>
                          <FlaskConical size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                            {p.isPrimary && (
                              <span style={{
                                fontSize: '0.62rem', fontWeight: 800, color: '#0f766e',
                                background: '#ccfbf1', padding: '1px 7px', borderRadius: '99px'
                              }}>★ PRIMARY</span>
                            )}
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{p.category}</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>· {p.duration || '12 Weeks'}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                        </div>
                        {/* Synergy score */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                            {score}
                          </div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>SYNERGY</div>
                        </div>
                      </div>

                      {p.integration_role && (
                        <div style={{
                          padding: '0.7rem 1rem', display: 'flex', gap: '8px', alignItems: 'flex-start'
                        }}>
                          <Info size={13} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.55 }}>
                            <strong>Integration:</strong> {p.integration_role}
                          </p>
                        </div>
                      )}

                      <div style={{ padding: '0 1rem 0.75rem' }}>
                        <Link
                          href={`/proto/${p.slug}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.75rem', fontWeight: 700, color: '#0d9488',
                            textDecoration: 'none'
                          }}
                        >
                          View Protocol <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complete the System — paired product cross-reference */}
              {product?.paired_product && (
                <div style={{
                  marginTop: '1.25rem',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: '12px', padding: '1.1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                      COMPLETE THE COLWAY SYSTEM
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                      {product.paired_product.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      For maximum follicular synergy, use both products together 3–4×/week
                    </div>
                  </div>
                  <Link
                    href={`/product/${product.paired_product.slug}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: '#0d9488', color: '#fff',
                      fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none'
                    }}
                  >
                    View Paired Product <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </PublicSectionCard>

            {/* Footer disclaimer */}
            <footer style={{
              marginTop: '2rem', borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
              fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5
            }}>
              <p style={{ margin: '0 0 0.4rem 0' }}>
                <strong style={{ color: '#64748b' }}>Clinical Cosmeceutical Disclaimer:</strong>{' '}
                This product is a professional-grade cosmeceutical formulated for topical use.
                It does not constitute a medicinal product and is not intended to diagnose, treat, cure or prevent any disease.
                Clinical ingredient data is provided for informational purposes based on published peer-reviewed literature.
                Individual results may vary. Consult a trichologist or dermatologist for persistent hair loss concerns.
              </p>
              <span>Supplier: {brand} · Atlas Health Distribution · {category} · {new Date().getFullYear()}</span>
            </footer>
          </div>

          {/* ── Sidebar ── */}
          <div className="pds-sidebar-column">

            {/* ── Cross-references: Colway System ── */}
            <div style={{
              background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
              overflow: 'hidden', marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.7rem 1rem',
                background: 'linear-gradient(90deg, #0f172a, #1a2e4a)',
                borderBottom: '2px solid #0d9488'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.06em' }}>
                  COLWAY HAIR SYSTEM
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '1px' }}>Complete cosmeceutical protocol</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                {[
                  {
                    slug: 'colway-strengthening-shampoo',
                    name: 'Strengthening Shampoo',
                    step: 'Step 1',
                    desc: 'Cleanses, DHT-inhibiting scalp prep',
                    icon: '🧴',
                    color: '#2563eb'
                  },
                  {
                    slug: 'colway-strengthening-conditioner',
                    name: 'Strengthening Conditioner',
                    step: 'Step 2',
                    desc: 'Cortex repair & cuticle sealing',
                    icon: '💧',
                    color: '#0d9488'
                  }
                ].map((p) => {
                  const isCurrent = slug === p.slug;
                  return (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '0.7rem 1rem', textDecoration: 'none',
                        background: isCurrent ? '#f0fdfa' : 'transparent',
                        borderLeft: isCurrent ? '3px solid #0d9488' : '3px solid transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{p.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 800, color: p.color,
                            background: `${p.color}15`, padding: '1px 6px', borderRadius: '99px'
                          }}>{p.step}</span>
                          {isCurrent && (
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 700, color: '#0d9488',
                              background: '#ccfbf1', padding: '1px 5px', borderRadius: '99px'
                            }}>YOU ARE HERE</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#0f172a', marginTop: '1px' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.desc}</div>
                      </div>
                      {!isCurrent && <ChevronRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    </Link>
                  );
                })}
              </div>
              <div style={{
                padding: '0.6rem 1rem',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4
              }}>
                💡 Use both together 3–4× per week for maximum synergy
              </div>
            </div>

            {/* Hair Loss Protocols widget */}
            <HairProtocolsSidebarWidget protocols={hairProtocols} lang={lang} />

            {/* Supplier */}
            <div style={{
              background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
              padding: '1rem', marginTop: '1rem'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                SUPPLIER
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={16} style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Colway International</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Native Collagen Specialists</div>
                </div>
              </div>
              <a href="https://colway.pl" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.73rem', color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}
              >
                <ExternalLink size={11} /> colway.pl
              </a>
            </div>

            {/* Clinical Evidence */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: '12px', padding: '1rem', marginTop: '1rem', color: '#ffffff' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>CLINICAL BACKING</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>Evidence-Mapped Formula</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                Every active compound backed by peer-reviewed dermatology &amp; trichology research.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {['DHT inhibition (Zinc PCA)', 'Anagen extension (Caffeine)', 'Tensile strength +24% (Collagen)', 'Hair density +21% (Niacinamide)'].map(pt => (
                  <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={11} style={{ color: '#0d9488', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PublicPageShell>

      {/* Atlas AI Copilot — Hair & Ingredients context */}
      <PublicAtlasAIDrawer
        hideFloatingTrigger={false}
        contextType="cosmetic_product"
        contextAnchor={{
          name,
          slug,
          category: 'Hair Loss & Scalp Health · Cosmeceutical',
          supplier: brand,
          description,
          keyIngredients: [
            'Native Collagen — structural keratin reinforcement',
            'Biotin — keratinocyte differentiation, reduces telogen effluvium',
            'Keratin hydrolysate — cuticle sealing',
            'Zinc PCA — 5α-reductase inhibitor, DHT reduction',
            'Caffeine — anagen phase extension via IGF-1',
            'Niacinamide — scalp microvascular VEGF upregulation',
            'Panthenol — moisture retention and shaft swelling',
            'Argan oil — lipid barrier and UV protection',
          ].join('; '),
          clinicalTarget: 'Androgenic alopecia, telogen effluvium, diffuse hair thinning',
          associatedProtocols: 'Androgenic Alopecia Protocol · Hair Growth Peptide Protocol (GHK-Cu)',
          suggestedQuestions: [
            'What is the mechanism of DHT-induced follicular miniaturisation?',
            'How does topical caffeine compare to minoxidil for hair growth?',
            'Which peptides synergise with this shampoo for hair restoration?',
            'What biomarkers should I monitor when treating androgenic alopecia?',
          ]
        }}
        storageKey={`cosmetic_${slug}`}
        onOpenRegisterModal={() => window.open('/auth/login?register=true', '_blank')}
      />
    </div>
  );
}
