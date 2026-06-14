import React from 'react';
import { useTranslation } from 'react-i18next';
import HybridHeroInput from '../components/hero/HybridHeroInput';
import TrustRow from '../components/hero/TrustRow';
import '../styles/hero.css';

export default function GuestHeroSearch({
  onOpenSearch,
}) {
  const { t } = useTranslation();
  return (
    <section className="hero-section">
      <div className="hero-section__bg-glow" aria-hidden="true" />
      
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2rem 1rem' }}>
        {/* Hero Headings */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', marginTop: '2rem' }}>
          <h1 className="hero-headline" style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            {t('hero.title', 'Optimize your health with AI')}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            {t('hero.subtitle', 'Tell ClinicalAI about your goals, or search directly for compounds and protocols.')}
          </p>
        </div>

        {/* Hybrid AI Input */}
        <HybridHeroInput onSearch={onOpenSearch} />

        {/* Trust Row */}
        <div style={{ marginTop: '4rem' }}>
          <TrustRow />
        </div>
      </div>
    </section>
  );
}
