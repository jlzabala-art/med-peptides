import { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Lock } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
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
};

export default function FAQDiscoveryView({ onBack, onSelectProduct, products = [] }) {
  const { isProfessional } = useAuth();
  const [faqItems, setFaqItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedEngine, setRelatedEngine] = useState([]);
  const [compareBlocks, setCompareBlocks] = useState([]);
  const [landingConfig, setLandingConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch all discovery data
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
        setFaqItems(faqSnap.docs.map((d) => ({ ...d.data(), faqId: d.id })));
        setCategories(catSnap.docs.map((d) => d.data()).sort((a, b) => a.order - b.order));
        setRelatedEngine(engineSnap.docs.map((d) => d.data()));
        setCompareBlocks(compareSnap.docs.map((d) => d.data()));
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

  // Computed displayed FAQs
  const displayedFaqs = useMemo(() => {
    if (searchQuery.trim().length > 1) {
      return searchFAQ(faqItems, searchQuery, isProfessional);
    }
    if (activeCategory) {
      return getFAQByCategory(faqItems, activeCategory, isProfessional);
    }
    return getVisibleFAQs(faqItems, isProfessional).slice(0, 20);
  }, [faqItems, searchQuery, activeCategory, isProfessional]);

  // Featured questions from landing config
  const featuredQuestions = useMemo(() => {
    if (!landingConfig?.featuredQuestions) return [];
    return landingConfig.featuredQuestions
      .map((q) => faqItems.find((f) => f.question === q))
      .filter(Boolean);
  }, [landingConfig, faqItems]);

  // Global compare block (show first one for landing context)
  const globalCompare = compareBlocks[0] || null;

  // Related peptides for the landing — pull from first discovered families
  const landingRelated = useMemo(() => {
    if (!relatedEngine.length) return [];
    const first = relatedEngine.find((e) => e.visibility === 'public') || relatedEngine[0];
    return getRelatedPeptides(first?.peptideName, relatedEngine, [], isProfessional, 6);
  }, [relatedEngine, isProfessional]);

  if (loading) {
    return (
      <section className="section section-light template-root" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading discovery engine…</p>
        </div>
      </section>
    );
  }

  const pageTitle = landingConfig?.pageTitle || 'Peptide FAQ & Discovery';
  const pageSubtitle = landingConfig?.pageSubtitle || 'Search by peptide, question, or goal.';

  return (
    <section className="section section-light template-root" style={{ minHeight: '80vh', paddingTop: 'clamp(2rem, 8vw, 5rem)', paddingBottom: '4rem' }}>
      {/* SEO-friendly hero */}
      <div style={{ background: 'var(--primary)', padding: 'clamp(2.5rem, 6vw, 5rem) 1.5rem', textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.12)', padding: '0.75rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <HelpCircle size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {pageTitle}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            {pageSubtitle}
          </p>
          {/* Search bar */}
          <DiscoverySearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Featured Questions */}
        {!searchQuery && !activeCategory && featuredQuestions.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              ⭐ Featured Questions
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {featuredQuestions.map((faq) => (
                <button
                  key={faq.faqId}
                  onClick={() => setSearchQuery(faq.question)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '999px',
                    border: '1.5px solid var(--primary)',
                    background: 'white',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        {!searchQuery && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={catBtnStyle(!activeCategory)}
              onMouseEnter={(e) => { if (activeCategory) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
              onMouseLeave={(e) => { if (activeCategory) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={catBtnStyle(activeCategory === cat.id)}
                onMouseEnter={(e) => { if (activeCategory !== cat.id) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
                onMouseLeave={(e) => { if (activeCategory !== cat.id) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
              >
                {CATEGORY_EMOJI[cat.id] || '📌'} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Professional notice */}
        {!isProfessional && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(0,43,77,0.05)', border: '1.5px solid rgba(0,43,77,0.12)',
            borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem', marginBottom: '1.75rem',
            fontSize: '0.85rem', color: 'var(--text-muted)',
          }}>
            <Lock size={16} style={{ flexShrink: 0, color: 'var(--primary)' }} />
            <span>Some advanced FAQ items and pricing details are visible to approved professionals only.</span>
          </div>
        )}

        {/* FAQ Accordion */}
        {displayedFaqs.length > 0 ? (
          <FAQAccordion
            faqItems={displayedFaqs}
            relatedProducts={products}
            onProductClick={(product) => { onSelectProduct?.(product); }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No results found for "{searchQuery}". Try a different search term or category.</p>
          </div>
        )}

        {/* Related Peptides Row */}
        {landingRelated.length > 0 && !searchQuery && (
          <RelatedPeptidesRow
            peptides={landingRelated}
            allProducts={products}
            onProductClick={(p) => onSelectProduct?.(p)}
            title="Discover Peptides by Goal"
          />
        )}

        {/* Compare Block */}
        {globalCompare && !searchQuery && (
          <ComparePeptidesBlock
            block={globalCompare}
            allProducts={products}
            onProductClick={(p) => onSelectProduct?.(p)}
          />
        )}

        {/* CTA Footer */}
        <div style={{
          marginTop: '3.5rem', padding: '2rem 2.5rem',
          background: 'var(--primary)', color: 'white',
          borderRadius: 'var(--radius-lg)', textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', color: 'white', fontSize: '1.3rem' }}>Still have questions?</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.85, lineHeight: 1.7 }}>Our laboratory team provides detailed specifications and batch-specific data for approved professionals.</p>
          <button
            onClick={onBack}
            style={{
              background: 'white', color: 'var(--primary)',
              border: 'none', borderRadius: '999px',
              padding: '0.7rem 2rem', fontWeight: 700,
              fontSize: '0.9rem', cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Contact Laboratory Support
          </button>
        </div>
      </div>
    </section>
  );
}

const catBtnStyle = (active) => ({
  padding: '0.4rem 0.95rem',
  borderRadius: '999px',
  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--primary)' : 'white',
  color: active ? 'white' : 'var(--text-muted)',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
});
