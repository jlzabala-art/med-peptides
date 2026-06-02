import React from 'react';
import { useTranslation } from 'react-i18next';
import CardSearch from '../components/hero/CardSearch';
import CardClinicAI from '../components/hero/CardClinicAI';
import CardPrescription from '../components/hero/CardPrescription';
import TrustRow from '../components/hero/TrustRow';
import '../styles/hero.css';

export default function GuestHeroSearch({
  onOpenSearch,
  onOpenAI,
}) {
  const { t } = useTranslation();
  return (
    <section className="hero-section">
      <div className="hero-section__bg-glow" aria-hidden="true" />
      
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Hero Headings */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 className="hero-headline" style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            {t('hero.title', 'How would you like to start?')}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.5 }}>
            {t('hero.subtitle', 'Explore pathways, receive guidance or analyze prescriptions.')}
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="hero-grid">
          <CardSearch onSearch={onOpenSearch} />
          <CardClinicAI onAsk={onOpenAI} />
          <CardPrescription />
        </div>

        {/* Trust Row */}
        <TrustRow />
      </div>
    </section>
  );
}
