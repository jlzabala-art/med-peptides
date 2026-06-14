import Search from "lucide-react/dist/esm/icons/search";
import React, { useState, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';

import { useBlogPosts } from '../hooks/useBlogPosts';
import BlogCard from '../components/blog/BlogCard';
import blogHeroImg from '../assets/images/blog_hero_knowledge.png';
import '../styles/blog.css';

// Display label → actual category value in blogData
const CATEGORIES = [
  { label: 'All Topics',             value: 'All' },
  { label: '⚡ Performance',         value: 'Recovery & Repair' },
  { label: '🧠 Brain & Focus',       value: 'Cognitive & Mood' },
  { label: '🔥 Metabolism',          value: 'Metabolic & Weight' },
  { label: '🛡️ Immunity',            value: 'Immune Support' },
  { label: '🌙 Sleep & Recovery',    value: 'Sleep & Circadian' },
  { label: '⚖️ Hormonal Health',     value: 'Hormonal Optimization' },
  { label: '✨ Cellular Renewal',    value: 'Longevity & Anti-Aging' },
];

export default function BlogPage() {
  usePageMeta({
    title: 'Physiological Optimization Academy — Atlas Health',
    description: 'Explore peer-reviewed scientific articles, physiological mechanisms, and clinical insights across our 7 physiological optimization goals.',
    canonical: '/blog',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { posts: blogPosts } = useBlogPosts();

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = searchQuery.trim() === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="blog-view" data-testid="blog-index">
      {/* --- Hero Section --- */}
      <header className="blog-hero">
        <div className="blog-hero__container">
          <div className="blog-hero__content">
            <div className="blog-hero__badge">Atlas Health Knowledge Hub</div>
            <h1 className="blog-hero__title">
              Science You Can <span>Apply</span>
            </h1>
            <p className="blog-hero__desc">
              Peer-reviewed insights on performance, recovery, metabolism, brain health, and cellular biology — written for practitioners and curious minds alike.
            </p>
            {/* Glassmorphic Search Bar */}
            <div className="blog-hero__search-wrapper">
              <Search className="blog-hero__search-icon" size={18} />
              <input
                type="text"
                placeholder="Search topics, compounds or mechanisms..."
                className="blog-hero__search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="blog-hero__image-wrapper">
            <div className="blog-hero__image-container">
              <img 
                src={blogHeroImg} 
                alt="Scientific research library with molecular models and data" 
                className="blog-hero__img" 
                loading="eager"
              />
              <div className="blog-hero__image-overlay"></div>
            </div>
          </div>

        </div>
      </header>

      {/* --- Goal Filter Pills — horizontally scrollable on mobile --- */}
      <nav className="blog-filters" aria-label="Article topics">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`blog-filter-btn ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* --- Blog Post Grid --- */}
      <section className="blog-grid-section">
        {filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="blog-no-results">
            <h3>No articles found</h3>
            <p>Try adjusting your search query or choosing another category.</p>
          </div>
        )}
      </section>

      {/* --- ClinicAI Integration Banner --- */}
      <section className="blog-clinicai-banner-section" style={{ maxWidth: '1200px', margin: '4rem auto 6rem', padding: '0 2rem' }}>
        <div className="blog-clinicai-banner" style={{
          background: 'linear-gradient(135deg, #021123 0%, #003666 100%)',
          borderRadius: '24px',
          padding: '3rem',
          color: 'var(--color-bg-surface)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2.5rem',
          boxShadow: '0 20px 40px rgba(0, 54, 102, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Decorative glowing circles */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(0, 209, 255, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }} />
          <div style={{ flex: '1 1 500px', zIndex: 2 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(0, 209, 255, 0.12)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              color: '#00d1ff',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '6px 12px',
              borderRadius: '50px',
              marginBottom: '1.25rem'
            }}>
              Interactive Clinical Knowledge
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
              Connect with <span style={{ background: 'linear-gradient(135deg, #00d1ff 0%, #0096cc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClinicAI</span> for Instant Synthesis
            </h2>
            <p style={{ color: 'var(--color-border)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
              Ask questions about peptide structures, clinical trials, dosages, or longevity biomarkers. ClinicAI compiles real-time, peer-reviewed medical data instantly.
            </p>
          </div>
          <div style={{ zIndex: 2 }}>
            <button 
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-clinical-ai', {
                    detail: { query: '', autoSend: false },
                  })
                );
              }}
              className="blog-clinicai-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #00d1ff 0%, #0096cc 100%)',
                color: 'var(--color-bg-surface)',
                border: 'none',
                cursor: 'pointer',
                padding: '16px 32px',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(0, 209, 255, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span>Consult ClinicAI Expert</span>
              <i className="bi bi-chat-left-text-fill" style={{ fontSize: '0.9rem' }}></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}