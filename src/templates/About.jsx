import React, { useState, useEffect, memo } from 'react';
import { Globe, MapPin, Plus, Minus, Shield, Thermometer, GraduationCap } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

// 1. Sub-componente memoizado para evitar re-renders de la lista
const LocationCard = memo(({ loc, idx, isExpanded, onToggle }) => (
  <div className={`card ${isExpanded ? 'expanded' : ''}`} style={{
    padding: '1.25rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: isExpanded ? '1px solid var(--secondary)' : '1px solid var(--border)'
  }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
      <div style={{
        backgroundColor: 'rgba(0, 163, 224, 0.08)',
        padding: '0.6rem',
        borderRadius: '12px',
        color: 'var(--secondary)'
      }}>
        <MapPin size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>{loc.name}</h3>
      </div>
      <button
        onClick={() => onToggle(idx)}
        aria-label="Toggle Information"
        style={{
          background: 'var(--surface-subtle)',
          border: 'none',
          padding: '0.4rem',
          borderRadius: '50%',
          color: 'var(--secondary)',
          cursor: 'pointer',
          display: 'flex'
        }}
      >
        {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
      </button>
    </div>

    <div style={{
      maxHeight: isExpanded ? '200px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease-in-out, opacity 0.3s',
      opacity: isExpanded ? 1 : 0,
      marginTop: isExpanded ? '1rem' : '0'
    }}>
      <p style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        color: 'var(--text-muted)',
        paddingLeft: '0.5rem',
        borderLeft: '2px solid var(--secondary-light)'
      }}>
        {loc.desc}
      </p>
    </div>
  </div>
));

export default function About() {
  usePageMeta({
    title: 'About Med-Peptides',
    description: 'Learn about Med-Peptides — our global network, institutional standards, and commitment to supplying verified research-grade peptides to professionals worldwide.',
    path: '/about',
  });

  const [expandedIndex, setExpandedIndex] = useState(0); // Primer elemento abierto por defecto

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const locations = [
    { name: 'European Union', desc: 'Central Research Operations & Primary Logistics Hub. Cold-chain certified distribution center for international clinical supply.' },
    { name: 'United States', desc: 'Strategic Regional Logistics supporting North American institutional research coordination.' },
    { name: 'United Kingdom', desc: 'Transatlantic logistics bridge and regional distribution node for academic research hubs.' },
    { name: 'Hong Kong', desc: 'Asia-Pacific Scientific Coordination and international sourcing logistics center.' }
  ];

  return (
    <div className="template-root" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
      <div className="container" style={{ paddingTop: 'clamp(4rem, 10vh, 8rem)', paddingBottom: '4rem' }}>

        {/* Header - Optimized for Mobile Reading */}
        <header style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          <span className="badge" style={{ letterSpacing: '0.05em' }}>GLOBAL INFRASTRUCTURE</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>Logistics Network</h1>
          <p className="subtitle" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Maintaining absolute <strong>Cold-Chain Integrity</strong> and regulatory compliance across three continents for the secure distribution of high-purity research reagents.
          </p>
        </header>

        <div className="grid-2" style={{ gap: '3rem', alignItems: 'flex-start' }}>

          {/* List - Improved Mobile Touch Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {locations.map((loc, idx) => (
              <LocationCard
                key={idx}
                loc={loc}
                idx={idx}
                isExpanded={expandedIndex === idx}
                onToggle={setExpandedIndex}
              />
            ))}
          </div>

          {/* Visualization - Performance Optimized SVG */}
          <div className="desktop-only" style={{ position: 'sticky', top: '120px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              background: 'radial-gradient(circle, rgba(0,163,224,0.05) 0%, transparent 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={320} strokeWidth={0.5} style={{ opacity: 0.1, color: 'var(--primary)' }} />

              {/* Central Dynamic Core */}
              <div style={{
                position: 'absolute',
                width: '60%',
                height: '60%',
                border: '1px dashed var(--secondary)',
                borderRadius: '50%',
                opacity: 0.2,
                animation: 'spin 60s linear infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Institutional Standards - Card Refactor */}
        <section style={{ marginTop: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem' }}>Institutional Standards</h2>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {[
              { title: "Clinical Compliance", icon: <Shield />, desc: "Batch-specific HPLC & MS verification for every compound." },
              { title: "Cold-Chain Logic", icon: <Thermometer />, desc: "Validated temperature-controlled handling for sensitive materials." },
              { title: "Academic Support", icon: <GraduationCap />, desc: "Direct access to Certificates of Analysis (CoA) for researchers." }
            ].map((item, i) => (
              <div key={i} className="card-glass" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  {React.cloneElement(item.icon, { size: 32 })}
                </div>
                <h3 style={{ marginBottom: '1rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}