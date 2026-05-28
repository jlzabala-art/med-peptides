/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { HelpCircle, Lock, BookOpen, GraduationCap, Sparkles, ChevronRight, Search, Info, MessageSquare, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import DiscoverySearchBar from '../components/discovery/DiscoverySearchBar';
import FAQAccordion from '../components/discovery/FAQAccordion';
import RelatedPeptidesRow from '../components/discovery/RelatedPeptidesRow';
import ComparePeptidesBlock from '../components/discovery/ComparePeptidesBlock';
import {
  searchFAQ,
  getFAQByCategory,
  getRelatedPeptides,
  getCompareBlock,
  getVisibleFAQs,
} from '../utils/discoveryEngine';

// Legacy FAQs as fallback / baseline to ensure "everything" is searchable
const LEGACY_FAQS = [
  { question: "Where is Med-Peptides based?", answer: "Med-Peptides is proudly based in the USA. All of our operations, including fulfillment and customer support, are conducted domestically to ensure the highest standards of service and reliability.", categoryId: "general", visibility: "public", active: true },
  { question: "Do you provide third-party testing for your products?", answer: "Absolutely. Quality and transparency are our core values. Every single batch of our peptides undergoes rigorous third-party testing for identity, purity, and concentration. HPLC and Mass Spectrometry (MS) reports are available for all products to verify their quality.", categoryId: "quality_handling", visibility: "public", active: true },
  { question: "What are peptides?", answer: "Peptides are short chains of amino acids linked by peptide bonds. They act as biological signaling molecules and are involved in numerous physiological processes including cellular communication, metabolic regulation, tissue repair, immune modulation, and hormonal signaling.", categoryId: "general", visibility: "public", active: true },
  { question: "What is the typical purity of peptide products?", answer: "High-quality research peptides are typically manufactured with a purity level of ≥98–99%, confirmed by analytical techniques such as HPLC and Mass Spectrometry (MS). Each production batch should be accompanied by a CoA.", categoryId: "quality_handling", visibility: "public", active: true },
  { question: "How are peptides manufactured?", answer: "Most peptides are produced using Solid Phase Peptide Synthesis (SPPS), a well-established technique that allows sequential assembly of amino acids under controlled laboratory conditions.", categoryId: "general", visibility: "public", active: true },
  { question: "How should peptides be stored?", answer: "Lyophilized peptides should generally be stored under controlled temperature conditions. Typical recommendations: Long-term (-20°C to -80°C), Short-term (2-8°C). Protect from light and moisture.", categoryId: "quality_handling", visibility: "public", active: true },
  { question: "What solvent is used for peptide reconstitution?", answer: "Lyophilized peptides may be reconstituted using appropriate sterile solvents like bacteriostatic water or sterile water for injection, depending on the application.", categoryId: "reconstitution", visibility: "public", active: true },
  { question: "What is the stability of peptides after reconstitution?", answer: "Peptide stability depends on factors like sequence, solvent, temperature, and light exposure. Generally, reconstituted peptides should be refrigerated and used within a limited timeframe. Avoid repeated freeze-thaw cycles.", categoryId: "reconstitution", visibility: "public", active: true },
  { question: "Are peptides sterile?", answer: "Unless specifically labeled, research peptides are typically not intended for sterile pharmaceutical applications. For sterile laboratory use, appropriate filtration may be required.", categoryId: "safety", visibility: "public", active: true },
  { question: "What quality control tests are typically performed?", answer: "Standard testing includes HPLC purity analysis, Mass Spectrometry confirmation, sequence verification, and endotoxin analysis in some cases.", categoryId: "quality_handling", visibility: "public", active: true },
  { question: "Are these peptides intended for human or veterinary use?", answer: "Unless specifically approved, these compounds are strictly for laboratory research and in-vitro testing. They are not intended for human or veterinary use, diagnosis, or treatment.", categoryId: "safety", visibility: "public", active: true },
  { question: "Do peptide products include documentation?", answer: "Yes. Reputable suppliers provide documentation including CoA, batch traceability information, and analytical test results.", categoryId: "quality_handling", visibility: "public", active: true },
  { question: "How should peptide handling be performed in the laboratory?", answer: "Peptides should be handled using standard laboratory practices, including PPE, sterile procedures where required, and controlled storage.", categoryId: "quality_handling", visibility: "public", active: true }
];

const CATEGORY_EMOJI = {
  general: '🔬',
  ordering_access: '🔐',
  quality_handling: '⚗️',
  metabolic: '🔥',
  recovery: '💪',
  cognitive: '🧠',
  hormonal: '⚖️',
  sleep: '🌙',
  longevity: '♾️',
  aesthetic: '✨',
  blend: '🧪',
  mitochondrial: '⚡',
  dosage: '📏',
  reconstitution: '💧',
  safety: '🛡️',
};

const LEARNING_PATHS = [
  { id: 'metabolic', title: 'Metabolic Optimization', icon: '🔥', description: 'Understanding GLP-1, GIP, and insulin sensitivity pathways.' },
  { id: 'recovery', title: 'Tissue Repair & Injury', icon: '💪', description: 'BPC-157, TB-500, and collagen synthesis research.' },
  { id: 'cognitive', title: 'Neurobiology & Focus', icon: '🧠', description: 'Semax, Selank, and nootropic peptide signaling.' },
  { id: 'longevity', title: 'Longevity Science', icon: '♾️', description: 'Epitalon, GHK-Cu, and cellular senescence markers.' },
];

// ── Mobile-first responsive styles injected once ────────────────────────────
const FAQ_STYLES = `
  .faq-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2.5rem;
    align-items: start;
  }
  .faq-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .faq-cat-desktop { display: block; }
  .faq-cat-mobile  { display: none; }
  .faq-hero-pad {
    padding: clamp(3rem, 10vw, 6rem) 1.5rem;
  }
  @media (max-width: 1024px) {
    .faq-layout {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .faq-sidebar { order: -1; }
    .faq-cat-desktop { display: none; }
    .faq-cat-mobile  {
      display: flex;
      overflow-x: auto;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .faq-cat-mobile::-webkit-scrollbar { display: none; }
    .faq-cat-mobile button {
      flex-shrink: 0;
      white-space: nowrap;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      font-size: 0.82rem;
      min-height: 40px;
    }
    .faq-ai-promo {
      display: none;
    }
    .faq-learning-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .faq-hero-title {
      font-size: clamp(1.75rem, 7vw, 2.5rem) !important;
    }
    .faq-section-title {
      font-size: 1rem !important;
    }
  }
  @media (max-width: 480px) {
    .faq-learning-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default function FAQDiscoveryView({ onBack, onSelectProduct, products = [], defaultTopic }) {
  const { user, isProfessional } = useAuth();
  const [faqItems, setFaqItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedEngine, setRelatedEngine] = useState([]);
  const [compareBlocks, setCompareBlocks] = useState([]);
  const [landingConfig, setLandingConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(defaultTopic || null);
  const [limit, setLimit] = useState(25);

  // Inject responsive styles once
  useEffect(() => {
    const id = 'faq-mobile-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = FAQ_STYLES;
      document.head.appendChild(tag);
    }
    return () => {}; // leave style in DOM for perf
  }, []);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://med-peptides.com/" },
          { "@type": "ListItem", "position": 2, "name": "Research FAQ", "item": "https://med-peptides.com/faq" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.slice(0, 30).map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": { "@type": "Answer", "text": item.answer }
        }))
      }
    ]
  }), [faqItems]);

  usePageMeta({
    title: "Research FAQ & Peptide Knowledge Base | Med-Peptides",
    description: "Explore our comprehensive research peptide FAQ. Learn about handling, storage, and the science behind high-purity research peptides.",
    canonicalUrl: "https://med-peptides.com/faq",
    structuredData
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [faqSnap, catSnap, engineSnap, compareSnap, configSnap] = await Promise.all([
          getDocs(collection(db, 'peptide_faq')),
          getDocs(collection(db, 'faq_categories')),
          getDocs(collection(db, 'peptide_related_engine')),
          getDocs(collection(db, 'peptide_compare_blocks')),
          getDocs(collection(db, 'faq_landing_config')),
        ]);
        if (cancelled) return;
        
        // Merge Firestore FAQs with Legacy defaults if not already present
        const dbFaqs = faqSnap.docs.map((d) => ({ ...d.data(), faqId: d.id }));
        const mergedFaqs = [...dbFaqs];
        
        LEGACY_FAQS.forEach(legacy => {
          if (!mergedFaqs.some(f => f.question.toLowerCase() === legacy.question.toLowerCase())) {
            mergedFaqs.push({ ...legacy, faqId: `legacy_${legacy.categoryId}_${Math.random().toString(36).substr(2, 5)}` });
          }
        });

        setFaqItems(mergedFaqs);
        setCategories(catSnap.docs.map((d) => d.data()).sort((a, b) => a.order - b.order));
        setRelatedEngine(engineSnap.docs.map((d) => d.data()));
        setCompareBlocks(compareSnap?.docs.map((d) => d.data()) || []);
        const config = configSnap.docs[0]?.data();
        if (config) setLandingConfig(config);
      } catch (err) {
        console.error('FAQ Discovery fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const displayedFaqs = useMemo(() => {
    let base;
    if (searchQuery.trim().length > 0) {
      base = searchFAQ(faqItems, searchQuery, isProfessional);
    } else if (activeCategory) {
      base = getFAQByCategory(faqItems, activeCategory, isProfessional);
    } else {
      base = getVisibleFAQs(faqItems, isProfessional);
    }
    return base;
  }, [faqItems, searchQuery, activeCategory, isProfessional]);

  // Log zero-result inquiries
  useEffect(() => {
    if (searchQuery.trim().length > 2 && displayedFaqs.length === 0 && !loading) {
      const logInquiry = async () => {
        try {
          await addDoc(collection(db, 'search_inquiry_logs'), {
            query: searchQuery,
            timestamp: serverTimestamp(),
            userId: user?.uid || 'guest',
            userEmail: user?.email || 'guest',
            source: 'research_academy'
          });
        } catch (err) {
          console.error('Error logging inquiry:', err);
        }
      };
      
      const timer = setTimeout(logInquiry, 1000); // Debounce logging
      return () => clearTimeout(timer);
    }
  }, [searchQuery, displayedFaqs.length, loading, user]);

  const paginatedFaqs = useMemo(() => displayedFaqs.slice(0, limit), [displayedFaqs, limit]);

  const featuredQuestions = useMemo(() => {
    if (!landingConfig?.featuredQuestions) return [];
    return landingConfig.featuredQuestions
      .map((q) => faqItems.find((f) => f.question === q))
      .filter(Boolean);
  }, [landingConfig, faqItems]);

  if (loading) {
    return (
      <section className="section section-light" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-light)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>Loading Research Academy Engine…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-light" style={{ minHeight: '80vh', background: 'var(--background)', paddingBottom: '5rem' }}>
      {/* Premium Hero Section */}
      <div style={{ 
        background: 'var(--gradient-clinical)', 
        padding: 'clamp(3rem, 10vw, 6rem) 1.5rem', 
        textAlign: 'center', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(0,150,204,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(0,150,204,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.08)', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '999px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--secondary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            <BookOpen size={16} /> Knowledge Hub & Research Academy
          </div>
          <h1 className="faq-hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'white', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            How can we assist your <span style={{ color: 'var(--secondary)' }}>Research</span> today?
          </h1>
          <div style={{ maxWidth: '650px', margin: '0 auto 2.5rem', padding: '0 0.5rem' }}>
            <DiscoverySearchBar onSearch={setSearchQuery} initialValue={searchQuery} />
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1100px', margin: '-2rem auto 0', position: 'relative', zIndex: 2 }}>
        
        {/* Quick Navigation Cards */}
        {!searchQuery && !activeCategory && (
          <div className="faq-learning-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {LEARNING_PATHS.map((path) => (
              <div 
                key={path.id}
                onClick={() => setActiveCategory(path.id)}
                className="card"
                style={{
                  background: 'var(--surface)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-xl)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '2.5rem' }}>{path.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{path.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-sans)' }}>{path.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  Explore Path <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Category Tab Bar */}
        <div className="faq-cat-mobile" role="tablist" aria-label="FAQ categories">
          <button
            role="tab"
            aria-selected={!activeCategory}
            onClick={() => setActiveCategory(null)}
            style={mobileCatBtnStyle(!activeCategory)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              style={mobileCatBtnStyle(activeCategory === cat.id)}
            >
              {CATEGORY_EMOJI[cat.id] || '🔬'} {cat.name}
            </button>
          ))}
        </div>

        <div className="faq-layout">
          
          <div style={{ minWidth: 0 }}>
            {/* Category Breadcrumb/Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 className="faq-section-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {searchQuery ? <Sparkles size={20} color="var(--secondary)" /> : <GraduationCap size={20} color="var(--secondary)" />}
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory ? `${categories.find(c => c.id === activeCategory)?.name || 'Category'} Insights` : 'General Research Intelligence'}
              </h2>
              { (searchQuery || activeCategory) && (
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  Clear All <X size={14} />
                </button>
              )}
            </div>

            {/* Main Accordion List */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {paginatedFaqs.length > 0 ? (
                <>
                  <FAQAccordion
                    faqItems={paginatedFaqs}
                    relatedProducts={products}
                    onProductClick={onSelectProduct}
                    searchQuery={searchQuery}
                  />
                  {displayedFaqs.length > limit && (
                    <div style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      <button 
                        onClick={() => setLimit(prev => prev + 25)}
                        className="btn"
                        style={{ background: 'var(--border-light)', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
                      >
                        Load More Insights ({displayedFaqs.length - limit} remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-light)' }}>
                  <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No matching insights found</h3>
                  <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontFamily: 'var(--font-sans)' }}>Try adjusting your search terms or exploring a specific learning path.</p>
                  <button onClick={() => setSearchQuery('')} className="btn btn-primary">Clear Search</button>
                </div>
              )}
            </div>

            {/* Pro Notice */}
            {!isProfessional && (
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', background: 'var(--secondary-light)', border: '1px solid var(--secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                <Lock size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Professional Access Restricted</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.9, fontFamily: 'var(--font-sans)' }}>Approved clinical researchers get access to advanced handling protocols and institutional pricing data.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="faq-sidebar">
            {/* Categories Menu — Desktop only */}
            <div className="faq-cat-desktop" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={14} /> Knowledge Domains
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveCategory(null)}
                  style={sideCatBtnStyle(!activeCategory)}
                >
                  All Research Data
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                    style={sideCatBtnStyle(activeCategory === cat.id)}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{CATEGORY_EMOJI[cat.id] || '🔬'}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Section */}
            {featuredQuestions.length > 0 && (
              <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={14} color="var(--warning)" /> Trending Topics
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {featuredQuestions.map((faq) => (
                    <button
                      key={faq.faqId}
                      onClick={() => setSearchQuery(faq.question)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all 0.2s',
                        lineHeight: 1.4,
                        fontFamily: 'var(--font-sans)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant Promo — hidden on mobile to not obscure content */}
            <div className="faq-ai-promo" style={{ background: 'var(--gradient-premium)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', color: 'white', boxShadow: 'var(--shadow-md)' }}>
              <MessageSquare size={32} style={{ marginBottom: '1rem', opacity: 0.9 }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Need custom data?</h4>
              <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 1.25rem', opacity: 0.9, lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>Our Clinical AI Assistant can analyze specific research goals and provide tailored insights.</p>
              <button 
                onClick={() => {
                  const aiBtn = document.querySelector('[aria-label="Toggle Clinical Assistant"]');
                  if (aiBtn) aiBtn.click();
                }}
                className="btn" 
                style={{ width: '100%', background: 'white', color: 'var(--primary)', border: 'none', fontWeight: 900, fontSize: '0.85rem' }}
              >
                Launch AI Assistant
              </button>
            </div>
          </aside>
        </div>

        {/* Global Tools Integration */}
        {!searchQuery && !activeCategory && (
          <div style={{ marginTop: '5rem' }}>
            <RelatedPeptidesRow
              peptides={relatedEngine.slice(0, 6)}
              allProducts={products}
              onProductClick={onSelectProduct}
              title="Quick-Start Research Modules"
            />
          </div>
        )}
      </div>
    </section>
  );
}

const sideCatBtnStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: active ? 'var(--secondary-light)' : 'transparent',
  color: active ? 'var(--primary)' : 'var(--text-light)',
  fontSize: '0.9rem',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)'
});

const mobileCatBtnStyle = (active) => ({
  border: 'none',
  borderRadius: '999px',
  padding: '0.55rem 1rem',
  background: active ? 'var(--primary)' : 'var(--border-light)',
  color: active ? 'white' : 'var(--text-muted)',
  fontWeight: active ? 700 : 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '40px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});
