import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Bot from "lucide-react/dist/esm/icons/bot";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Check from "lucide-react/dist/esm/icons/check";
import Activity from "lucide-react/dist/esm/icons/activity";
import Award from "lucide-react/dist/esm/icons/award";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Binary from "lucide-react/dist/esm/icons/binary";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { getSupplementWithVariants, getActiveSupplements } from '../repositories/supplementRepository';
import { trackRecentView } from '../utils/recentViews';
import { resolveAndFormatPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';











import { DetailSkeleton } from '../components/shared/SkeletonLoader';
import ProtocolTOC from '../components/protocol/ProtocolTOC';

function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default function TestingDetailPage({ onAddToCart, region }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tier } = usePricingTier();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSupplementWithVariants(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        if (data) {
          trackRecentView({ type: 'testing', slug, name: data.name });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load testing product');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const priceDisplay = useMemo(() => {
    if (!product) return {};
    return resolveAndFormatPrice(product, { tier, countryCode: region })?.display ?? {};
  }, [product, tier, region]);

  const pageMetaConfig = useMemo(() => {
    if (!product) {
      return {
        title: 'Loading Diagnostic Platform',
        description: 'Premium scientific diagnostics and biological age mapping.',
        path: `/testing/${slug}`,
      };
    }
    const description = product.description || product.desc || `Access comprehensive biological insights with the ${product.name}.`;
    return {
      title: `${product.name} | Advanced Multi-Omics Diagnostics`,
      description,
      path: `/testing/${slug}`,
    };
  }, [product, slug]);

  usePageMeta(pageMetaConfig);

  const handleAddToCart = () => {
    if (!product || !onAddToCart) return;
    onAddToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleConsultAI = () => {
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: {
          query: `I want to understand the clinical details, biomarkers, and analysis process of ${product?.name}.`,
          autoSend: true,
        },
      })
    );
  };

  if (loading) return <DetailSkeleton />;

  if (error || !product) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#F4F8FB', minHeight: '80vh' }}>
        <h2 style={{ fontSize: '2rem', color: '#0D1B2E', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>{error || 'The diagnostic product could not be loaded.'}</p>
        <button onClick={() => navigate('/')} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const accentColor = '#00a3e0';
  const heroGradient = 'linear-gradient(135deg, #020e1c 0%, #082440 60%, #051628 100%)';

  return (
    <div className="sdp-main-wrapper" style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", color: '#0F172A' }}>
      {/* ── HERO SECTION ── */}
      <div style={{ background: heroGradient, color: 'white', position: 'relative', overflow: 'hidden', padding: '3.5rem 0' }}>
        {/* Glow shapes */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: '#00d1ff', opacity: 0.12, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '10%', width: '250px', height: '250px', borderRadius: '50%', background: '#005fcc', opacity: 0.08, filter: 'blur(60px)' }} />

        <div className="sdp-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Breadcrumbs */}
          <nav style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '2rem', fontWeight: 600 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
            <span>›</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/collection/diagnostics')}>Diagnostics</span>
            <span>›</span>
            <span style={{ color: '#00d1ff' }}>{product.name}</span>
          </nav>

          {/* Hero Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 209, 255, 0.1)', border: '1px solid rgba(0, 209, 255, 0.3)', borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, color: '#00d1ff', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🔬 {product.category || 'Longevity Diagnostics'}
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 850, color: '#FFFFFF', margin: '0 0 1rem 0', letterSpacing: '-0.04em', lineHeight: 1.1, fontFamily: "'Outfit', sans-serif" }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.75)', margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
                {product.objective}
              </p>
            </div>

            {/* Diagnostic Meta Card */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '1.5rem', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 209, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d1ff' }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00d1ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Laboratory Quality</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F1F5F9' }}>ISO 15189 Certified</div>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.4, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div><strong>Technology:</strong> High-Throughput Next-Generation Sequencing & Proteomics</div>
                <div><strong>Turnaround Time:</strong> 15-21 Business Days</div>
                <div><strong>Sample Type:</strong> Micro-Blood Card / Dried Blood Spot</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="sdp-container" style={{ maxWidth: '1200px', margin: '2.5rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '4rem', alignItems: 'start' }}>
        {/* LEFT TOC */}
        <div style={{ position: 'sticky', top: '100px', display: 'block' }} className="tdp-toc-container">
          <ProtocolTOC
            sections={[
              { id: 'biomarkers', label: 'Biomarkers & Analysis' },
              { id: 'process', label: 'Interactive Workflow' },
              { id: 'intelligence', label: 'ClinicAI Assistant' }
            ]}
            activeSection="biomarkers"
          />
        </div>

        {/* RIGHT COLUMN: INFORMATION & WORKFLOW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 1. BIOMARKERS SECTION */}
          <div id="biomarkers" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color={accentColor} /> Scientific Depth & Analysis
              </h3>
              <p style={{ fontSize: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                This diagnostic panel maps high-dimensional biology to actionable clinical insights. By analyzing key markers in dried blood spots, it generates a comprehensive system-level report on your rate of biological aging and cardiovascular, metabolic, and systemic health.
              </p>

              {product.features?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Key Features & Biomarkers mapped
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {product.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        <Check size={16} color={accentColor} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Binary size={20} color={accentColor} /> Diagnostic Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Clinical Accuracy</div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                    Verified analytical sensitivity of 99.4% against standard venous assays.
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Multi-Omics Engine</div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                    Integrates genetic risk profiles, clinical biomarker kinetics, and digital health markers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PROCESS SECTION */}
          <div id="process" style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Interactive Workflow Pipeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {/* Steps line */}
              <div style={{ position: 'absolute', left: '17px', top: '10px', bottom: '10px', width: '2px', background: '#E2E8F0', zIndex: 0 }} />

              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Order Diagnostic Kit</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                    We ship the laboratory dried-blood collection kit to your registered address with express tracking.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Sample Collection & Shipment</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                    Follow the simple step-by-step instructions to collect a few drops of capillary blood, place them on the card, and mail it back using the pre-paid container.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Laboratory Sequencing</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                    Our partner clinical laboratory performs multi-omics sequencing and maps the markers to biological systems.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', border: '2px solid #4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  4
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Interactive Reports Dashboard</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                    Receive your system-level age assessment and multi-omics results in your patient portal, with direct clinical explanations.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* CLINIC AI WIDGET */}
          <div id="intelligence" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            borderRadius: '24px',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: '#6366f1', opacity: 0.15, filter: 'blur(35px)' }} />
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                <Bot size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>ClinicAI Research Assistant</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
                  Ask ClinicAI about markers, genetic sequencing methods, wearable integration details, or clinical validations.
                </p>
                <button
                  onClick={handleConsultAI}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none',
                    background: '#818cf8', color: 'white', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.background = '#818cf8'}
                >
                  <Bot size={16} /> Consult ClinicAI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Action Bar (Desktop & Mobile) ─────────── */}
      <div className="pd-floating-bar">
        <div className="pd-floating-price-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Service Pricing
            </span>
            <span className="pd-floating-price">
              {priceDisplay.perUnit ?? '—'}
            </span>
          </div>
        </div>
        <button
          disabled={!priceDisplay.perUnit}
          onClick={handleAddToCart}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '99px',
            border: 'none',
            backgroundColor: justAdded ? 'var(--color-success)' : (priceDisplay.perUnit ? accentColor : 'var(--border)'),
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: priceDisplay.perUnit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: priceDisplay.perUnit ? `0 4px 14px ${accentColor}40` : 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
          {justAdded ? 'Added to Order' : 'Add to Order'}
        </button>
      </div>

      {/* Responsive adjustments block */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 992px) {
          .sdp-container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .tdp-toc-container { display: none !important; }
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
            bottom: 0;
            left: 0;
            right: 0;
            transform: none;
            border-radius: 0;
            padding: 1rem 1.5rem calc(1rem + env(safe-area-inset-bottom));
            justify-content: space-between;
          }
          .sdp-main-wrapper { padding-bottom: 120px !important; }
        }
      ` }} />
    </div>
  );
}