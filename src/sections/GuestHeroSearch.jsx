import React from 'react';
import { useTranslation } from 'react-i18next';
import HybridHeroInput from '../components/hero/HybridHeroInput';
import TrustRow from '../components/hero/TrustRow';
import '../styles/hero.css';

export default function GuestHeroSearch({
  onOpenSearch,
  onOpenAI,
}) {
  const { t } = useTranslation();
  return (
    <section className="hero-section hero-section--light-grid">
      <div className="hero-section__grid-bg" aria-hidden="true" />
      
      <div className="container guest-hero-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Hero Headings matching mobile design */}
        <div className="guest-hero-headings" style={{ marginBottom: '1.75rem', marginTop: '0.5rem' }}>
          <h1 className="hero-headline-goal" style={{ fontWeight: 900, fontSize: 'clamp(2.3rem, 6vw, 3.8rem)', marginBottom: '0.4rem', letterSpacing: '-0.03em', color: '#00274c', lineHeight: 1.15 }}>
            Optimize by <span style={{ color: '#0ea5e9' }}>Goal</span>
          </h1>
          <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: 'clamp(1.15rem, 3vw, 1.5rem)', margin: '0 0 0.6rem 0', letterSpacing: '-0.01em' }}>
            Peptides, supplements & guided protocols
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.92rem, 2vw, 1.05rem)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5, fontWeight: 450 }}>
            Explore evidence-based pathways for energy, recovery, sleep, cognition, metabolism and healthy aging.
          </p>
        </div>

        {/* Hybrid AI Input */}
        <HybridHeroInput onSearch={onOpenSearch} onOpenAI={onOpenAI} />

        {/* Trust Row */}
        <div style={{ marginTop: '2rem' }}>
          <TrustRow />
        </div>
      </div>
    </section>
  );
}
