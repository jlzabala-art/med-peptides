/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * SupplementDetailPage — Phase 2: premium hero + full layout
 * Route: /supplements/:slug
 */
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { getSupplementWithVariants, getActiveSupplements } from '../repositories/supplementRepository';
import { trackRecentView } from '../utils/recentViews';
import { resolveAndFormatPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';
import { Clock, Zap, ShoppingCart, Bot } from 'lucide-react';
import { DetailSkeleton } from '../components/shared/SkeletonLoader';
import ProtocolTOC from "../components/protocol/ProtocolTOC";
import { motion, AnimatePresence } from 'framer-motion';

/* ── name → slug helper (for related links) ──────────────────────────────── */
function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/* ── Smart Protocol Slug Resolver for Supplements ────────────────────────── */
function resolveProtocolSlug(p) {
  const name = (p || '').toLowerCase();
  
  if (name.includes('sleep') || name.includes('circadian') || name.includes('insomnia')) {
    return 'sleep-circadian-6w';
  }
  if (name.includes('stress') || name.includes('hpa') || name.includes('resilience')) {
    return 'focus-resilience-8w';
  }
  if (name.includes('recovery') || name.includes('injury') || name.includes('repair') || name.includes('athletic')) {
    return 'injury-recovery-8w';
  }
  if (name.includes('energy') || name.includes('mitochondrial') || name.includes('bioenergetic')) {
    return 'mitochondrial-energy-10w';
  }
  if (name.includes('cognitive') || name.includes('focus') || name.includes('neuro') || name.includes('brain')) {
    return 'cognitive-support-6w';
  }
  if (name.includes('longevity') || name.includes('aging') || name.includes('anti-aging')) {
    return 'longevity-foundation-12w';
  }
  if (name.includes('weight') || name.includes('metabolic') || name.includes('fat') || name.includes('diet') || name.includes('sugar')) {
    return 'weight-management-structured-12w';
  }
  if (name.includes('hormonal') || name.includes('endocrine') || name.includes('gh-axis') || name.includes('growth hormone')) {
    return 'hormonal-support-12w';
  }
  if (name.includes('skin') || name.includes('aesthetics') || name.includes('collagen')) {
    return 'skin-rejuvenation-12w';
  }
  if (name.includes('immune') || name.includes('inflammation') || name.includes('thymic')) {
    return 'immune-modulation-8w';
  }
  
  return 'collection';
}

/* ─── category → gradient map ───────────────────────────────────────────────── */
const CATEGORY_GRADIENT = {
  'Adaptogens & Botanicals': 'linear-gradient(135deg, #1a4a2e 0%, #0d2d1a 60%, #0a1f12 100%)',
  'Amino Acids & Derivatives': 'linear-gradient(135deg, #1e3a5f 0%, #0f2540 60%, #0a1a30 100%)',
  'Antioxidants & Cell Defense': 'linear-gradient(135deg, #4a1a4a 0%, #2d0d2d 60%, #1a0a1a 100%)',
  'Cognitive & Nootropic': 'linear-gradient(135deg, #1a2a4a 0%, #0d1a30 60%, #0a1220 100%)',
  'Energy & Mitochondrial': 'linear-gradient(135deg, #4a2a0a 0%, #2d1a06 60%, #1a0f04 100%)',
  'Hormonal & Endocrine': 'linear-gradient(135deg, #2a1a4a 0%, #1a0d30 60%, #100a20 100%)',
  'Sleep & Recovery': 'linear-gradient(135deg, #0a2a3a 0%, #061a26 60%, #041218 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #0f1f3a 0%, #091530 60%, #060e20 100%)';

const CATEGORY_ACCENT = {
  'Adaptogens & Botanicals': '#4ade80',
  'Amino Acids & Derivatives': '#60a5fa',
  'Antioxidants & Cell Defense': '#c084fc',
  'Cognitive & Nootropic': '#818cf8',
  'Energy & Mitochondrial': '#fb923c',
  'Hormonal & Endocrine': '#a78bfa',
  'Sleep & Recovery': '#38bdf8',
};
const DEFAULT_ACCENT = '#60a5fa';

/* ─── category → icon map ───────────────────────────────────────────────────── */
const CATEGORY_ICON = {
  'Adaptogens & Botanicals':    '🌿',
  'Amino Acids & Derivatives':  '⚗️',
  'Antioxidants & Cell Defense':'🛡️',
  'Cognitive & Nootropic':      '🧠',
  'Energy & Mitochondrial':     '⚡',
  'Hormonal & Endocrine':       '🔬',
  'Sleep & Recovery':           '🌙',
};

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function SupplementDetailPage({ onAddToCart, region }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tier } = usePricingTier();

  const [supplement, setSupplement] = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const isTesting = useMemo(() => {
    if (!supplement) return false;
    return supplement.productType === 'testing' || supplement.type === 'testing' || supplement.category === 'Longevity Diagnostics';
  }, [supplement]);

  const rawVariants = useMemo(() => {
    if (!supplement) return [];
    return Array.isArray(supplement.variants) && supplement.variants.length ? supplement.variants : [supplement];
  }, [supplement]);

  // Deduplicate variants client-side by dosage & quantity to prevent any DB duplicates from showing up
  const variants = useMemo(() => {
    if (!supplement) return [];
    const seen = new Set();
    const result = [];
    for (const v of rawVariants) {
      const key = `${v.dosage || ''}-${v.quantity || ''}`.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(v);
      }
    }
    return result.length ? result : [supplement];
  }, [rawVariants, supplement]);

  const activeVar = useMemo(() => {
    return variants[selectedVariant] || variants[0] || null;
  }, [variants, selectedVariant]);

  // Normalize pricing: handle both nested pricing.retail.perUnit and flat legacy fields (priceUSD / perVialPriceUSD)
  const normalisedVar = useMemo(() => {
    if (!activeVar) return null;

    const base = {
      ...activeVar,
      name: supplement?.name,
      productType: 'supplement',
      isSupplement: true
    };

    if (base.pricing?.retail?.perUnit != null) return base;

    const flatPrice = base.priceUSD ?? base.perVialPriceUSD ?? base.perUnit ?? null;
    const flatKit   = base.kitPriceUSD ?? base.pricing?.retail?.kit ?? null;

    return {
      ...base,
      pricing: {
        ...base.pricing,
        retail: {
          perUnit: flatPrice,
          kit: flatKit,
          currency: base.pricing?.retail?.currency ?? base.currency ?? 'USD'
        }
      }
    };
  }, [activeVar, supplement]);

  const priceDisplay = useMemo(() => {
    if (!normalisedVar) return {};
    return resolveAndFormatPrice(normalisedVar, { tier, countryCode: region })?.display ?? {};
  }, [normalisedVar, tier, region]);

  const pageMetaConfig = useMemo(() => {
    if (!supplement) {
      return {
        title: 'Loading Supplement',
        description: 'Discover premium research-grade supplements on Atlas Health.',
        path: `/supplements/${slug}`,
      };
    }

    const title = supplement.name;
    const description = supplement.description || supplement.desc || `Sourced with high purity, our research-grade ${supplement.name} supports scientific studies in the category of ${supplement.category}.`;
    const canonicalPath = `/supplements/${slug}`;

    return {
      title,
      description,
      path: canonicalPath,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: supplement.name,
        description: description,
        category: supplement.category,
        brand: {
          '@type': 'Brand',
          name: 'Atlas Health'
        },
        offers: {
          '@type': 'Offer',
          url: `https://Atlas Health-app-27a3a.web.app${canonicalPath}`,
          priceCurrency: 'USD',
          price: supplement.variants?.[0]?.pricing?.retail?.perUnit || supplement.pricing?.retail?.perUnit || '0.00',
          availability: 'https://schema.org/InStock',
        }
      }
    };
  }, [supplement, slug]);

  usePageMeta(pageMetaConfig);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Try the slug as-is, then strip trailing numeric index (legacy URL pattern)
    const candidateSlugs = [slug, slug.replace(/-\d+$/, '')].filter(Boolean);
    const [primary, fallback] = [...new Set(candidateSlugs)];

    getSupplementWithVariants(primary)
      .then(async (data) => {
        if (cancelled) return;
        let resolved = data;
        if (!resolved && fallback && fallback !== primary) {
          resolved = await getSupplementWithVariants(fallback);
        }
        setSupplement(resolved);

        // Track this visit so it appears in Recently Explored
        if (resolved) {
          trackRecentView({ type: 'supplement', slug, name: resolved.name });
        }

        // Load related supplements (same category)
        if (resolved) {
          const all = await getActiveSupplements();
          const rel = all
            .filter(s => s.category === resolved.category && s.name !== resolved.name)
            .slice(0, 4)
            .map(s => ({ name: s.name, slug: nameToSlug(s.name), objective: s.objective || s.desc?.slice(0,60), tags: s.tags }));
          if (!cancelled) setRelated(rel);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message ?? 'Failed to load supplement'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading || !supplement) {
    return (
      <div className="bg-background min-h-screen pt-24">
        <DetailSkeleton />
      </div>
    );
  }

  /* 404 / error */
  if (error || !supplement) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-border)', fontFamily: 'Inter, system-ui, sans-serif', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔬</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Supplement not found</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Could not find <code style={{ background: 'var(--color-text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{slug}</code></p>
        <button
          onClick={() => navigate('/collection/supplements')}
          style={{ marginTop: '1rem', background: 'var(--color-primary-hover)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
        >
          ← Back to Supplements
        </button>
      </div>
    );
  }


  const gradient     = CATEGORY_GRADIENT[supplement.category] || DEFAULT_GRADIENT;
  const accent       = CATEGORY_ACCENT[supplement.category]   || DEFAULT_ACCENT;


  return (
    <div className="sdp-main-wrapper" style={{ minHeight: '100vh', background: 'var(--background, #F4F8FB)', fontFamily: "'Inter', sans-serif", color: 'var(--text-main, #0D1B2E)' }}>

      {/* ── Hero ── */}
      <div style={{ background: gradient, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '380px', height: '380px', borderRadius: '50%', background: accent, opacity: 0.09, filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '5%', width: '260px', height: '260px', borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(55px)' }} />
        {/* Extra orb — top left */}
        <div style={{ position: 'absolute', top: '20%', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: accent, opacity: 0.04, filter: 'blur(50px)' }} />
        
        {/* Floating background icons */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '2rem' }}>{CATEGORY_ICON[supplement.category] || '🧬'}</div>
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '1.5rem', transform: 'rotate(15deg)' }}>🧪</div>
          <div style={{ position: 'absolute', top: '40%', right: '5%', fontSize: '1.8rem', transform: 'rotate(-10deg)' }}>🔬</div>
        </div>

        <div className="sdp-container">
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.78rem', color: 'rgba(0,54,102,0.45)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '2rem', fontWeight: 600 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
            <span>›</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/collection/supplements')}>Supplements</span>
            <span>›</span>
            <span style={{ color: 'var(--primary)' }}>{supplement.name}</span>
          </nav>

          {/* ── Two-column hero grid ── */}
          <div className="sdp-hero-grid">
            {/* ── LEFT: Identity text ── */}
            <div>
              {/* Category badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}40`, borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.72rem', fontWeight: 600, color: accent, marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                🌿 {supplement.category}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 850, color: 'var(--primary)', margin: '0 0 0.75rem', letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: "'Outfit', sans-serif" }}>
                {supplement.name}
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', fontWeight: 500, lineHeight: 1.55 }}>
                {supplement.objective}
              </p>
            </div>

            {/* ── RIGHT: Scientific Identity Card ── */}
            <div style={{
              background: 'rgba(255,255,255,0.035)',
              border: `1px solid ${accent}30`,
              borderRadius: '20px',
              padding: '1.5rem',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 0 40px ${accent}10, inset 0 1px 0 rgba(255,255,255,0.06)`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Card inner glow */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(30px)' }} />

              {/* Icon + type header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: `${accent}18`,
                  border: `1.5px solid ${accent}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                  boxShadow: `0 0 16px ${accent}25`,
                  flexShrink: 0,
                }}>
                  {CATEGORY_ICON[supplement.category] || '🧬'}
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
                    Scientific Identity
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.1rem' }}>
                    {supplement.category}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: `linear-gradient(90deg, ${accent}30, transparent)`, marginBottom: '1rem' }} />

              {/* Biological pathways (from tags — first 3) */}
              {supplement.tags?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.45rem' }}>
                    Biological Pathways
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {supplement.tags.slice(0, 4).map(t => (
                      <span key={t} style={{ background: `${accent}12`, border: `1px solid ${accent}28`, borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: accent, fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Research areas (from clinical_benefits — first 3) */}
              {supplement.clinical_benefits?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.45rem' }}>
                    Research Areas
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {supplement.clinical_benefits.slice(0, 3).map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: accent, fontSize: '0.7rem', flexShrink: 0 }}>◈</span>
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />

              {/* Format + Verification row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Format</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-border)' }}>
                    {supplement.delivery_format || 'Oral / Capsule'}
                  </div>
                </div>
                <div style={{ background: `${accent}0a`, border: `1px solid ${accent}20`, borderRadius: '10px', padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Status</div>
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('clinical_ai_messages_v2');
                        sessionStorage.removeItem('clinical_ai_messages');
                      } catch (e) {
                        // Ignore localStorage errors
                      }
                      window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                        detail: {
                          action: 'ask_about_entity',
                          entityName: supplement.name || '',
                          section: 'SupplementDetailPage.Hero',
                          autoSend: true
                        }
                      }));
                    }}
                    style={{ fontSize: '0.78rem', fontWeight: 700, color: accent, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    ✓ Research Grade
                  </button>
                </div>
              </div>
            </div>

            {/* ── ClinicalAI contextual button ── */}
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('clinical_ai_messages_v2');
                  sessionStorage.removeItem('clinical_ai_messages');
                } catch (e) {
                  // Ignore localStorage errors
                }
                window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                  detail: {
                    query: `Provide a detailed clinical study profile for ${supplement.name || ''}, including its primary mechanism of action, key research applications, and standard clinical dosages.`,
                    autoSend: true,
                    context: {
                      source: 'supplement_page',
                      intent: 'supplement',
                      classification: 'supplement_query'
                    }
                  }
                }));
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `${accent}18`;
                e.currentTarget.style.borderColor = `${accent}55`;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${accent}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = `${accent}08`;
                e.currentTarget.style.borderColor = `${accent}30`;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: `1.5px solid ${accent}30`,
                backgroundColor: `${accent}08`,
                color: accent,
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.18s ease',
                letterSpacing: '0.01em',
                fontFamily: 'inherit',
              }}
            >
              {/* Live pulse dot */}
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: accent,
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${accent}40`,
                animation: 'ca-dot-ping 1.8s ease-in-out infinite',
              }} />
              Ask ClinicalAI about {supplement.name}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Wave separator */}
        <svg viewBox="0 0 1440 50" style={{ display: 'block', width: '100%', marginTop: '-1px' }} preserveAspectRatio="none">
          <path d="M0,50 C360,5 1080,5 1440,50 L1440,50 L0,50 Z" fill="var(--background)" />
        </svg>
      </div>

      {/* ── Body ── */}
      <div className="sdp-body">
        
        {/* Sticky left index */}
        <div className="sdp-toc-container">
          <ProtocolTOC
            sections={[
              { id: 'overview', label: 'Overview' },
              { id: 'ingredients', label: 'Key Ingredients' },
              { id: 'formats', label: 'Formats & Pricing' },
              { id: 'clinical_profile', label: 'Clinical Profile' },
              { id: 'protocols', label: 'Stack Synergies' }
            ]}
            activeSection="overview"
          />
        </div>

        {/* Right content column */}
        <div className="sdp-content-col">

        {/* Description card */}
        <div id="overview" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', lineHeight: 1.8, color: 'var(--text-main)', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(0,54,102,0.03)' }}>
          {supplement.desc}
        </div>

        {/* ── ClinicAI Interactive Research Assistant Widget ── */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1b2e 0%, #070e17 100%)',
          border: '1px solid rgba(0, 102, 204, 0.25)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 54, 102, 0.15)',
          color: 'var(--color-bg-app)'
        }}>
          {/* Neon accent glow */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 102, 204, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexDirection: 'row', flexWrap: 'wrap' }} className="sdp-ai-widget-header">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(0, 102, 204, 0.15)',
              border: '1.5px solid rgba(0, 102, 204, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 0 20px rgba(0, 102, 204, 0.25)',
              flexShrink: 0
            }}>
              <Bot size={28} strokeWidth={2.2} color="#00a3ff" />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00a3ff', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'rgba(0, 163, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  ClinicAI Integrated
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'inline-block', transform: 'scale(1)', opacity: 1 }} />
                  Expert System Live
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>
                Interactive Research Assistant
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                Explore clinical applications, safety thresholds, and stack synergies for {supplement.name} with our institutional AI.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(0, 102, 204, 0.2), transparent)', margin: '1.5rem 0' }} />

          {/* Quick Query Chips */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Select a research inquiry
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                {
                  icon: '🩺',
                  label: `Dosing Protocols & Safety Guidelines`,
                  query: `What are the recommended dosing timelines, cycle guidelines, and safety thresholds for ${supplement.name}?`
                },
                {
                  icon: '⚡',
                  label: `Synergistic Stack Combinations`,
                  query: `Which compounds synergize best with ${supplement.name} to maximize clinical efficacy, and in what ratios?`
                },
                {
                  icon: '🧬',
                  label: `Molecular Mechanism & Pathways`,
                  query: `Explain the biological mechanisms of action and molecular pathways affected by ${supplement.name}.`
                }
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    try {
                      localStorage.removeItem('clinical_ai_messages_v2');
                    } catch (e) {
                      // Ignore localStorage errors
                    }
                    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                      detail: {
                        query: q.query,
                        section: 'SupplementDetailPage.FAQWidget',
                        autoSend: true
                      }
                    }));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    padding: '0.85rem 1.1rem',
                    color: 'var(--color-border)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: 'inherit',
                    width: '100%'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 102, 204, 0.4)';
                    e.currentTarget.style.transform = 'translateX(6px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{q.icon}</span>
                  <span style={{ flex: 1 }}>{q.label}</span>
                  <span style={{ color: '#00a3ff', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 800 }}><Bot size={16} strokeWidth={2.2} /></span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Key Ingredients Section ── */}
        <div id="ingredients" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
            Key Ingredients & Science
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {supplement.ingredients ? supplement.ingredients.map((ing, i) => (
              <div key={i} style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: `${accent}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: accent }}>
                  {ing.icon || '🌿'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{ing.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{ing.amount || 'Standardized Extract'}</div>
                </div>
              </div>
            )) : (
              <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: `${accent}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: accent }}>
                  {CATEGORY_ICON[supplement.category] || '🌿'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{supplement.name} Extract</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Concentrated Botanical Material</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Premium Purchase Panel ── */}
        {supplement.variants.length > 0 && (
          <div id="formats" className="sdp-purchase-panel" style={{ background: 'var(--color-bg-surface)', border: `1px solid ${accent}40`, borderRadius: '24px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 30px ${accent}08` }}>
            {/* Subtle accent glow */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: accent, opacity: 0.05, filter: 'blur(30px)' }} />

            {/* Section label */}
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              Select Format
            </div>

            {/* Variant chips — improved */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {supplement.variants.map((v, i) => {
                const isActive = i === selectedVariant;
                const label = [v.dosage, v.quantity].filter(Boolean).join(' / ');
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i)}
                    style={{
                      background: isActive ? `${accent}12` : 'var(--section-alt, #EEF4FA)',
                      border: isActive ? `2px solid ${accent}` : '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '0.75rem 1.25rem',
                      cursor: 'pointer',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? `0 4px 12px ${accent}20` : 'none',
                    }}
                  >
                    {label || `Option ${i + 1}`}
                  </button>
                );
              })}
            </div>

            {/* Selected variant summary */}
            {activeVar && (
              <div style={{ background: 'var(--section-alt, #EEF4FA)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: accent, fontSize: '1rem' }}>◈</span>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>Selected</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-border)' }}>
                    {[activeVar.dosage, activeVar.quantity].filter(Boolean).join(' / ')}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>Format</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
                    {supplement.delivery_format || 'Oral / Capsule'}
                  </div>
                </div>
              </div>
            )}

            {/* Price + CTA row */}
            <div className="sdp-purchase-row">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 700 }}>
                  Price per unit
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 850, color: 'var(--primary)', lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>
                  {priceDisplay.perUnit ?? '—'}
                </div>
                {priceDisplay.kit && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
                    Kit of 10: <span style={{ color: accent, fontWeight: 700 }}>{priceDisplay.kit}</span>
                  </div>
                )}
              </div>


              <button
                className="sdp-desktop-only-btn"
                onClick={() => onAddToCart(normalisedVar, 1)}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}35`; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                  color: 'var(--color-bg-surface)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '1rem 2.25rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  fontFamily: 'inherit',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Add to Order →
              </button>
            </div>

            {/* Trust micro-blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
              {[
                { icon: '✔', label: 'Third-party tested' },
                { icon: '✔', label: 'Batch verified' },
                { icon: '✔', label: 'Research-grade sourcing' },
                { icon: '✔', label: 'Global fulfillment' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: accent, fontWeight: 700 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Benefits ── */}
        {supplement.clinical_benefits?.length > 0 && (
          <div id="clinical_profile" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,54,102,0.02)' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              Clinical Benefits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {supplement.clinical_benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--section-alt, #EEF4FA)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem 1.1rem' }}>
                  <span style={{ color: accent, fontSize: '1rem', fontWeight: 900 }}>✓</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Research Guidelines (Dosage & Timing) ── */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', marginBottom: '1.5rem', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Clock size={20} color={accent} />
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Research Guidelines
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Ideal Timing</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{supplement.timing || 'Morning or Pre-Workout'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Standard Dosage</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{supplement.standard_dosage || '1-2 capsules daily'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Research Notes</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>{supplement.notes || 'Consume with water. May be stacked with synergists.'}</div>
            </div>
          </div>
        </div>

        {/* ── Mechanisms ── */}
        {supplement.mechanisms?.length > 0 && (
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,54,102,0.02)' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              Mechanisms of Action
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {supplement.mechanisms.map((m, i) => (
                <span key={i} style={{ background: 'var(--section-alt, #EEF4FA)', border: `1px solid var(--border)`, borderRadius: '999px', padding: '0.45rem 1rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Ecosystem: Clinical Protocols ── */}
        {supplement.protocols?.length > 0 && (
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 54, 102, 0.03)'
          }}>
            {/* Subtle glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle, ${accent}0a 0%, transparent 70%)`, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🧬</span>
              <div>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                  Clinical Protocols
                </h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Integrated programs containing {supplement.name}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="sdp-protocols-list">
              {supplement.protocols.map((p, i) => (
                <div
                  key={i}
                  className="sdp-protocol-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 2px 8px rgba(0,54,102,0.01)',
                    transition: 'all 0.22s ease',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                      color: 'var(--color-bg-surface)',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: `0 4px 10px ${accent}25`
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 850, lineHeight: 1.3, display: 'block', fontFamily: "'Outfit', sans-serif" }}>
                        {p}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Click to view complete program & dosage timelines
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }} className="sdp-protocol-actions">
                    <button
                      onClick={() => {
                        const targetSlug = resolveProtocolSlug(p);
                        if (targetSlug === 'collection') {
                          navigate('/collection/protocols');
                        } else {
                          navigate(`/protocol/${targetSlug}`);
                        }
                      }}
                      style={{
                        background: 'var(--section-alt, #EEF4FA)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '0.55rem 1.1rem',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'var(--color-bg-surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--section-alt, #EEF4FA)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >
                      View Protocol Plan
                    </button>
                    <button
                      onClick={() => {
                        try {
                          localStorage.removeItem('clinical_ai_messages_v2');
                        } catch (e) {
                          // Ignore localStorage errors
                        }
                        
                        const targetSlug = resolveProtocolSlug(p);
                        const realProtocolTitles = {
                          'sleep-circadian-6w': 'DSIP & Epithalon Circadian Sleep Protocol',
                          'focus-resilience-8w': 'Semax & Pinealon Neuro-Executive Protocol',
                          'injury-recovery-8w': 'BPC-157 & TB-500 Tissue Repair Protocol',
                          'mitochondrial-energy-10w': 'MOTS-c Mitochondrial Energy Protocol',
                          'cognitive-support-6w': 'Semax & Selank Neurocognitive Protocol',
                          'longevity-foundation-12w': 'MOTS-c Longevity Foundation Protocol',
                          'weight-management-structured-12w': 'Tirzepatide + MOTS-c Metabolic Protocol',
                          'hormonal-support-12w': 'CJC-1295 / Ipamorelin GH Optimization Protocol',
                          'skin-rejuvenation-12w': 'GHK-Cu Collagen Rejuvenation Protocol',
                          'immune-modulation-8w': 'Thymosin Alpha-1 & TB-500 Immune Modulation Protocol'
                        };
                        const realTitle = realProtocolTitles[targetSlug];
                        const queryText = realTitle 
                          ? `Explain how ${supplement.name} can be stacked inside the "${realTitle}" (${p}) to optimize clinical outcomes, and what standard timing/dosages are recommended.`
                          : `Explain how ${supplement.name} is utilized in the ${p} protocol and its dosing frequency.`;

                        window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                          detail: {
                            query: queryText,
                            section: 'SupplementDetailPage.Protocol',
                            autoSend: true
                          }
                        }));
                      }}
                      style={{
                        background: `${accent}0a`,
                        border: `1.5px solid ${accent}30`,
                        borderRadius: '10px',
                        padding: '0.55rem 1.1rem',
                        color: accent,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = 'var(--color-bg-surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${accent}0a`; e.currentTarget.style.color = accent; }}
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ecosystem: Commonly Combined With ── */}
        {supplement.commonly_combined_with?.length > 0 && (
          <div id="protocols" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,54,102,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--secondary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <Zap size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                  Stack Synergies
                </h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Frequently combined in clinical research stacks</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {supplement.commonly_combined_with.map((c, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/supplements/${nameToSlug(c)}`)}
                  style={{ 
                    background: 'var(--section-alt, #EEF4FA)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    padding: '1rem', 
                    fontSize: '0.88rem', 
                    color: 'var(--primary)', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    fontFamily: 'inherit', 
                    transition: 'all 0.18s ease', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: accent, border: '1px solid var(--border)' }}>+</div>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Related supplements ── */}
        <RelatedSupplements related={related} accent={accent} navigate={navigate} />

        {/* ── Back CTA ── */}
        <button
          onClick={() => navigate('/collection/supplements')}
          style={{ background: 'transparent', border: '1px solid #334155', color: 'var(--color-text-tertiary)', borderRadius: '10px', padding: '0.65rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = 'var(--color-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-text-primary)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
        >
          ← Back to Supplements
        </button>
        </div>{/* /sdp-content-col */}
      </div>{/* /sdp-body */}

      {/* ── Floating Action Bar (Desktop & Mobile) ─────────── */}
      <div className="pd-floating-bar">
        <div className="pd-floating-price-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {activeVar ? [activeVar.dosage, activeVar.quantity].filter(Boolean).join(' / ') : 'Select Format'}
            </span>
            <span className="pd-floating-price">
              {priceDisplay.perUnit ?? '—'}
            </span>
          </div>
        </div>
        
        <button
          disabled={!priceDisplay.perUnit}
          onClick={() => onAddToCart(normalisedVar, 1)}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '99px',
            border: 'none',
            backgroundColor: priceDisplay.perUnit ? accent : 'var(--border)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: priceDisplay.perUnit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: priceDisplay.perUnit ? `0 4px 14px ${accent}40` : 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <ShoppingCart size={18} />
          Add to Order
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Container padding adjustments */
        .sdp-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 0;
        }
        @media (max-width: 768px) {
          .sdp-container {
            padding: 1rem 1rem 0;
          }
        }

        /* Two-column hero grid */
        .sdp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2.5rem;
          align-items: start;
          padding-bottom: 2.5rem;
        }
        @media (max-width: 768px) {
          .sdp-hero-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding-bottom: 1.5rem;
          }
        }

        /* Body content padding */
        .sdp-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 4rem;
          align-items: start;
        }
        .sdp-toc-container {
          position: sticky;
          top: 100px;
          display: block;
        }
        @media (max-width: 992px) {
          .sdp-body {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 1.25rem 1rem 4rem;
          }
          .sdp-toc-container { display: none; }
        }

        /* Purchase Panel Padding */
        @media (max-width: 768px) {
          .sdp-purchase-panel {
            padding: 1.25rem 1.5rem !important;
          }
        }

        /* Purchase row flex layout */
        .sdp-purchase-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 480px) {
          .sdp-purchase-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
          }
          .sdp-purchase-row button {
            width: 100%;
            text-align: center;
            padding: 1rem 1.5rem;
          }
        }

        /* Protocol stacking on mobile */
        @media (max-width: 580px) {
          .sdp-protocol-card {
            flex-direction: column;
            align-items: stretch !important;
          }
          .sdp-protocol-actions {
            display: flex;
            gap: 0.5rem;
            width: 100%;
          }
          .sdp-protocol-actions button {
            flex: 1;
            text-align: center;
            padding: 0.65rem 0.5rem !important;
            font-size: 0.72rem !important;
          }
        }

        /* AI Widget stacking details */
        @media (max-width: 580px) {
          .sdp-ai-widget-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
        }

        /* Floating Action Bar */
        .pd-floating-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 99px;
          padding: 0.6rem 0.6rem 0.6rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        .pd-floating-price-col {
          display: flex;
          align-items: center;
        }
        .pd-floating-price {
          font-size: 1.25rem;
          font-weight: 850;
          color: var(--primary);
          font-family: 'Outfit', sans-serif;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .pd-floating-bar {
            bottom: calc(56px + env(safe-area-inset-bottom));
            width: 100%;
            border-radius: 20px 20px 0 0;
            padding: 1.25rem 1.5rem;
            flex-direction: column;
            justify-content: space-between;
          }
          .sdp-desktop-only-btn { display: none !important; }
          .sdp-main-wrapper { padding-bottom: 120px !important; }
        }
      ` }} />
    </div>
  );
}

/* ─── RelatedSupplements sub-component ─────────────────────────────────────── */
function RelatedSupplements({ related, accent, navigate }) {
  if (!related || !related.length) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
        You may also like
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {related.map(r => (
          <button
            key={r.slug}
            onClick={() => navigate(`/supplements/${r.slug}`)}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              boxShadow: '0 2px 10px rgba(0,54,102,0.02)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,54,102,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,54,102,0.02)'; }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>{r.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>{r.objective}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
              {r.tags?.slice(0, 2).map(t => (
                <span key={t} style={{ display: 'inline-block', background: 'var(--section-alt, #EEF4FA)', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.25rem 0.65rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
