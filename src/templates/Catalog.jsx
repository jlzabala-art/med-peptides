/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Info, MapPin, Globe, X, MessageCircle, Mail, Activity, Zap, Sparkles, Brain, ShieldCheck, Droplets, Beaker, FlaskConical, ChevronDown, Check, Filter, ChevronRight, Search, HelpCircle, BookOpen, ExternalLink, Moon, Bot } from 'lucide-react';
import { trackEvent } from '../hooks/useAnalytics';
import MobileProductCard from '../snippets/MobileProductCard';
import FAQModal from '../components/discovery/FAQModal';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import { getFAQForProduct } from '../utils/discoveryEngine';
import { configService } from '../services/configService';
import { productCategories as _fallbackCategories } from '../data/productConstants';
import { usePageMeta } from '../hooks/usePageMeta';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import { useHeaderContext } from '../context/HeaderContext';

// ── PHASE 4: Lazy Table Row ──────────────────────────────────────────────────
// Renders a skeleton placeholder until the row enters the viewport,
// then mounts the full content. Prevents heavy initial paint for large catalogs.
const LazyTableRow = React.memo(function LazyTableRow({ product: p, onSelectProduct, handleOpenFAQ, handleOpenPubMed }) {
  const rowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    // If already in viewport on mount (e.g. first few rows), reveal immediately
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      { rootMargin: '120px 0px' } // Pre-load 120px before entering view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return (
      <tr ref={rowRef} style={{ height: '72px', borderBottom: '1px solid var(--border)' }}>
        <td colSpan={4} style={{ padding: '1rem' }}>
          <Skeleton height="24px" borderRadius="6px" />
        </td>
      </tr>
    );
  }

  return (
    <tr
      ref={rowRef}
      className="clickable-product-row"
      style={{ borderBottom: '1px solid var(--border)' }}
      onClick={() => onSelectProduct(p.name)}
    >
      <td style={{ padding: '1.25rem 1rem' }}>
        <div className="product-name-cell" style={{ fontWeight: 700, color: 'var(--primary)', transition: 'color 0.2s', fontSize: '1rem' }}>{p.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>CAS: {p.cas || 'Not Listed'}</div>
      </td>
      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.desc}</td>
      <td style={{ padding: '1.25rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {p.allStrengths.map((s, sIdx) => (
            <span key={sIdx} style={{ padding: '0.2rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', border: '1px solid var(--border)' }}>
              {s}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: '1.25rem 1rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('clinical_ai_messages_v2');
                sessionStorage.removeItem('clinical_ai_messages');
              } catch {}
              window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                detail: {
                  action: 'ask_about_entity',
                  entityName: p.name || '',
                  section: 'Catalog.Row',
                  autoSend: true
                }
              }));
            }}
            title="Ask ClinicAI"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(0, 163, 224, 0.2)',
              background: 'rgba(0, 163, 224, 0.05)',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 163, 224, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(0, 163, 224, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 163, 224, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 163, 224, 0.2)';
            }}
          >
            <Bot size={14} /> ClinicAI
          </button>
          <button
            onClick={() => handleOpenPubMed(p)}
            title="Search PubMed Literature"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--secondary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
          >
            <BookOpen size={14} /> PubMed
          </button>
          <button
            onClick={() => {
              trackEvent('purchase_intent', {
                intent_type: 'view_profile',
                peptide_name: p.name
              });
              onSelectProduct(p.name);
            }}
            title="Technical Profile"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            View <ChevronRight size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const Catalog = React.memo(function Catalog({ 
  region, setRegion, 
  isProfessional, 
  cart, setCart, updateCart,
  isCartOpen, setIsCartOpen,
  setPendingQuote,
  onSelectCategory,
  onSelectProduct,
  onOpenSearch,
  initialCategory,
  EXCHANGE_RATES,
  products,
  allFaqs,
}) {
  const { setHeader, clearHeader } = useHeaderContext();
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://Med-Peptides-app-27a3a.web.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Research Catalog",
            "item": "https://Med-Peptides-app-27a3a.web.app/catalog"
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Research Peptide Catalog",
        "description": "Comprehensive catalog of high-purity research peptides for scientific investigation.",
        "itemListElement": (products || []).slice(0, 50).map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://Med-Peptides-app-27a3a.web.app/product/${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}`
        }))
      }
    ]
  }), [products]);

  usePageMeta({
    title: 'High-Purity Research Peptide Catalog | Med-Peptides',
    description: 'Explore our complete catalog of research-grade peptides organized by research pathway — verified purity, multiple formats, and global shipping.',
    canonicalUrl: 'https://Med-Peptides-app-27a3a.web.app/catalog',
    structuredData
  });

  const formatPrice = (val) => val?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const [activeCategory, setActiveCategory] = useState(initialCategory || null);
  const [productCategories, setProductCategories] = useState(_fallbackCategories);

  // Load product categories from Firestore (with fallback)
  useEffect(() => {
    configService.getProductCategories()
      .then(cats => { if (cats?.length) setProductCategories(cats); })
      .catch(() => {}); // silently use fallback on error
  }, []);

  // Scientific Modal States
  const [activeFAQProduct, setActiveFAQProduct] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [activePubMedProduct, setActivePubMedProduct] = useState(null);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  // Ensure we start from the top of the page on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Support for deep linking from product views
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
      setTimeout(() => {
        const slug = initialCategory.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const el = document.getElementById(`pathway-${slug}`);
        if (el) {
          const isMobile = window.innerWidth <= 768;
          const offset = isMobile ? 80 : 130;
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 500); // Wait for transition and layout
    }
  }, [initialCategory]);

  const handleOpenFAQ = useCallback(async (product) => {
    setActiveFAQProduct(product);
    setFaqItems([]);
    setFaqLoading(true);
    setShowFAQModal(true);
    try {
      const resolved = getFAQForProduct(product.name, allFaqs || [], product.id, isProfessional, 8);
      setFaqItems(resolved);
    } catch (err) {
      console.error('FAQ fetch error:', err);
    } finally {
      setFaqLoading(false);
    }
  }, [allFaqs, isProfessional]);

  const handleOpenPubMed = useCallback((product) => {
    setActivePubMedProduct(product);
    setShowPubMedPanel(true);
  }, []);

  const groupedProducts = useMemo(() => {
    const groups = {};
    products.forEach(p => {
      const cat = p.category;
      if (!groups[cat]) groups[cat] = {};

      const familyName = p.displayName || p.name;
      if (!groups[cat][familyName]) {
        // Derive allStrengths from variants subcollection (new Firestore model).
        // Fall back to legacy flat fields for backwards compatibility.
        const rawStrengths = p.variants?.length
          ? p.variants.map(v => v.strength || v.dosage).filter(Boolean)
          : [p.strength || p.dosage].filter(Boolean);

        groups[cat][familyName] = {
          ...p,
          allStrengths: [...new Set(rawStrengths)],
        };
      }
    });

    // Convert back to category -> list format
    const result = {};
    Object.keys(groups).forEach(cat => {
      result[cat] = Object.values(groups[cat]);
    });
    return result;
  }, [products]);

  // Inject Quick Navigation into the Global Header
  useEffect(() => {
    const headerQuickNav = (
      <nav className="header-quick-nav" aria-label="Quick category navigation" style={{
        display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        <style>{`.header-quick-nav::-webkit-scrollbar { display: none; }`}</style>
        {productCategories.map((category) => {
          const hasProducts = (groupedProducts[category] || []).length > 0;
          if (!hasProducts && !isProfessional) return null;

          const QIcon = {
            "Recovery & Repair":       Activity,
            "Cognitive & Mood":        Brain,
            "Sleep & Circadian":       Moon,
            "Metabolic & Weight":      Zap,
            "Longevity & Anti-Aging":  Sparkles,
            "Hormonal Optimization":   Droplets,
            "Immune Support":          ShieldCheck,
            "Research Supplies":       Beaker,
            "Other Research Peptides": FlaskConical
          }[category] || FlaskConical;

          const isActive = activeCategory === category;
          const shortLabel = category.split(' ')[0]; // first word as label

          const handleQuickNav = () => {
            const slug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const el = document.getElementById(`pathway-${slug}`);
            setActiveCategory(category);
            if (el) {
              const isMobile = window.innerWidth <= 768;
              const offset = isMobile ? 80 : 100;
              const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          };

          return (
            <button
              key={category}
              className={`quick-nav-pill ${isActive ? 'active-pill' : ''}`}
              onClick={handleQuickNav}
              aria-label={category}
              title={category}
            >
              <QIcon size={14} />
              {shortLabel}
            </button>
          );
        })}
      </nav>
    );

    setHeader(headerQuickNav);
    return () => clearHeader();
  }, [productCategories, groupedProducts, isProfessional, activeCategory, setHeader, clearHeader]);

  const breadcrumbItems = useMemo(() => [
        { label: 'Catalog' }
    ], []);

  return (
    <section id="products" className="section section-light template-root" style={{ paddingTop: 'clamp(2rem, 5vw, 4rem)' }}>
      <div className="container" style={{ position: 'relative' }}>
        
        <div style={{ 
           filter: !region ? 'blur(12px) grayscale(50%)' : 'none', 
           opacity: !region ? 0.4 : 1, 
           pointerEvents: !region ? 'none' : 'auto', 
           transition: 'all 0.6s ease'
        }}>

        <Breadcrumbs items={breadcrumbItems} />

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'left', fontFamily: 'var(--font-heading)' }}>
            Research Pathways
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a pathway to explore specialized research reagents.</p>
        </div>


        
        <style dangerouslySetInnerHTML={{ __html: `
          .accordion-container {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .accordion-item {
            background: white;
            border-radius: 1.25rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid var(--border);
            overflow: hidden;
            scroll-margin-top: 130px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          .accordion-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
            border-color: var(--primary-light);
          }
          .accordion-item.active {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: var(--primary);
          }
          .accordion-header {
            padding: 1.25rem 1.75rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            position: relative;
            background: linear-gradient(to right, white, #fcfdfe);
          }
          .accordion-item.active .accordion-header {
            background: linear-gradient(135deg, var(--primary), #0081b1);
            color: white;
          }
          .accordion-title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 1.25rem;
            font-family: var(--font-heading);
            letter-spacing: -0.01em;
          }
          .icon-box {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: rgba(0, 163, 224, 0.08);
            color: var(--primary);
            transition: all 0.3s ease;
          }
          .accordion-item.active .icon-box {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .count-pill {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            background: rgba(15, 23, 42, 0.05);
            color: var(--text-main);
            transition: all 0.3s ease;
          }
          .accordion-item.active .count-pill {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }
          .accordion-content {
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          }
          
          /* Inter-view Navigation Enhancements */
          .clickable-product-row {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .clickable-product-row:hover {
            background-color: rgba(0, 163, 224, 0.02) !important;
          }
          .clickable-product-row:hover .product-name-cell {
            color: var(--secondary) !important;
            text-decoration: underline;
          }

          /* ── PHASE 2: Quick Nav ──────────────────────────────────── */
          .quick-nav {
            position: sticky;
            top: 64px;
            z-index: 40;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 0.5rem 1rem;
            display: none;
            overflow-x: auto;
            gap: 0.5rem;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .quick-nav::-webkit-scrollbar { display: none; }
          .quick-nav-pill {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            padding: 0.4rem 0.75rem;
            border-radius: 999px;
            border: 1.5px solid var(--border);
            background: white;
            color: var(--text-muted);
            font-size: 0.65rem;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .quick-nav-pill:active {
            transform: scale(0.94);
          }
          .quick-nav-pill.active-pill {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 163, 224, 0.35);
          }
          .quick-nav-pill svg {
            flex-shrink: 0;
          }

          /* Laptop Styles */
          @media (min-width: 1025px) {
            .accordion-title {
              font-size: 1.2rem;
            }
            .accordion-header {
              padding: 1.5rem 2.5rem;
            }
            .icon-box {
              width: 48px;
              height: 48px;
            }
          }

          /* Mobile Styles */
          @media (max-width: 768px) {
            .quick-nav { display: none; } /* removed from mobile – saves screen space */
            .accordion-header {
              padding: 1rem 1.25rem;
            }
            .accordion-title {
              font-size: 1rem;
              gap: 1rem;
            }
            .icon-box {
              width: 38px;
              height: 38px;
            }
          }

          /* PHASE 3: Mobile card grid — 2 columns when space allows */
          .mobile-card-grid {
            padding: 1rem;
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          @media (min-width: 480px) {
            .mobile-card-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          /* PHASE 4: Lazy row skeleton animation */
          @keyframes shimmer {
            0% { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .lazy-row-skeleton {
            height: 24px;
            border-radius: 6px;
            background: linear-gradient(
              90deg,
              #f0f4f8 25%,
              #e2e8f0 50%,
              #f0f4f8 75%
            );
            background-size: 600px 100%;
            animation: shimmer 1.4s infinite linear;
          }
        ` }} />

        {/* ── PHASE 2: Sticky Quick Navigation (moved to header) ──────── */}


        <div className="accordion-container">
          {productCategories.map((category, idx) => {
            const isOpen = activeCategory === category;
            const categoryProducts = groupedProducts[category] || [];
            if (categoryProducts.length === 0 && !isProfessional) return null;

            const IconComp = {
              "Recovery & Repair":       Activity,
              "Cognitive & Mood":        Brain,
              "Sleep & Circadian":       Moon,
              "Metabolic & Weight":      Zap,
              "Longevity & Anti-Aging":  Sparkles,
              "Hormonal Optimization":   Droplets,
              "Immune Support":          ShieldCheck,
              "Research Supplies":       Beaker,
              "Other Research Peptides": FlaskConical
            }[category] || FlaskConical;

            const slug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');

            return (
              <div 
                key={idx} 
                id={`pathway-${slug}`}
                className={`accordion-item ${isOpen ? 'active' : ''}`}
              >
                <div 
                  className="accordion-header"
                  onClick={(e) => {
                    const newCategory = isOpen ? null : category;
                    setActiveCategory(newCategory);
                    
                    if (newCategory) {
                      const item = e.currentTarget.closest('.accordion-item');
                      setTimeout(() => {
                        const isMobile = window.innerWidth <= 768;
                        const offset = isMobile ? 80 : 130; 
                        const top = item.getBoundingClientRect().top + window.pageYOffset - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                      }, 400);
                    } else {
                      // If closing, scroll back to the start of the catalog
                      const el = document.getElementById('products');
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
                        window.scrollTo({ top, behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  <div className="accordion-title">
                    <div className="icon-box">
                      <IconComp size={20} />
                    </div>
                    <span>{category}</span>
                    <span className="count-pill">
                      {groupedProducts[category]?.length || 0}
                    </span>
                  </div>
                  <ChevronDown style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }} size={20} />
                </div>

                {/* PHASE 1: Conditional rendering — content only mounts when isOpen === true */}
                {isOpen && (
                  <div className="accordion-content">
                    <div style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
                      {/* Desktop View */}
                      <div className="desktop-only" style={{ padding: '1rem 2rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Research Peptide</th>
                              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', width: '35%' }}>Description</th>
                              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Available Format</th>
                              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Scientific Tools</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* PHASE 4: Lazy rendering — rows only mount full content when visible */}
                            {categoryProducts.map((p, pIdx) => (
                              <LazyTableRow
                                key={pIdx}
                                product={p}
                                onSelectProduct={onSelectProduct}
                                handleOpenFAQ={handleOpenFAQ}
                                handleOpenPubMed={handleOpenPubMed}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="mobile-only mobile-card-grid">
                        {categoryProducts.map((p, pIdx) => (
                          <MobileProductCard 
                            key={pIdx} 
                            product={p} 
                            onSelectProduct={onSelectProduct}
                            isProfessional={isProfessional}
                            products={products}
                            cart={cart}
                            onAddToCart={updateCart}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQModal removed per user request (ClinicAI handles FAQs) */}

        <PubMedPreviewPanel 
          isOpen={showPubMedPanel}
          onClose={() => setShowPubMedPanel(false)}
          product={activePubMedProduct}
        />

        </div>
      </div>
    </section>
  );
});

export default Catalog;


