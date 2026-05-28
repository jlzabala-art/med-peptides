/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, GitCompare, Bot } from 'lucide-react';

/**
 * BeginnerCollections — Phase 2/4 of Rules 5.0
 * ────────────────────────────────────────────
 * Curated discovery collections aimed at beginners.
 * Each collection surfaces 3–4 compounds with WHY language.
 * Reduces overwhelm vs. showing the full catalog.
 *
 * Props:
 *  onItemClick   – (name) => void  – legacy: direct navigation callback
 *  onSeedSearch  – (name) => void  – seeds hero search bar (Phase 4)
 *  onOpenSearch  – (name) => void  – opens search modal (Phase 4 fallback)
 */

/** Mirrors the slug logic in ProductTemplate so navigation always resolves. */
const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

const COLLECTIONS = [
  {
    id: 'recovery-starter',
    title: 'Beginner Recovery Peptides',
    subtitle: 'Simple starting point for tissue repair research',
    color: '#fb7185',
    headerBg: 'linear-gradient(135deg, rgba(251,113,133,0.06) 0%, rgba(244,63,94,0.02) 100%)',
    headerBorder: 'rgba(251,113,133,0.12)',
    glowColor: 'rgba(251,113,133,0.08)',
    icon: '🔬',
    tag: 'Most popular for beginners',
    items: [
      {
        name: 'BPC-157',
        why: 'Commonly the first choice for recovery research — well-documented and straightforward to study.',
        badge: 'Starter Friendly',
        badgeColor: 'var(--color-success)',
      },
      {
        name: 'TB-500',
        why: 'Often explored alongside BPC-157 for its complementary role in tissue remodeling research.',
        badge: 'Often Paired',
        badgeColor: 'var(--color-primary)',
      },
      {
        name: 'GHK-Cu',
        why: 'A gentler entry point into peptide research, especially studied for its role in cellular repair.',
        badge: 'Gentle Start',
        badgeColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'longevity-essentials',
    title: 'Most Popular Longevity Protocols',
    subtitle: 'Explore how researchers approach cellular aging',
    color: 'var(--color-success)',
    headerBg: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.02) 100%)',
    headerBorder: 'rgba(16,185,129,0.12)',
    glowColor: 'rgba(16,185,129,0.08)',
    icon: '🧬',
    tag: 'Trending this month',
    items: [
      {
        name: 'Epithalon',
        why: 'One of the most researched peptides in the longevity field, studied for telomere dynamics.',
        badge: 'Research Classic',
        badgeColor: 'var(--color-success)',
      },
      {
        name: 'NMN',
        why: 'A nicotinamide precursor widely explored for NAD+ pathway support in longevity and cellular energy research.',
        badge: 'Supplement',
        badgeColor: 'var(--color-success)',
      },
      {
        name: 'Sermorelin',
        why: "Researchers explore this GH-releasing peptide as a cornerstone of GH-axis longevity studies.",
        badge: 'GH Axis',
        badgeColor: '#f59e0b',
      },
    ],
  },
  {
    id: 'cognitive-simple',
    title: 'Simple Cognitive Support Options',
    subtitle: 'For researchers exploring brain performance',
    color: '#0ea5e9',
    headerBg: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(2,132,199,0.02) 100%)',
    headerBorder: 'rgba(14,165,233,0.12)',
    glowColor: 'rgba(14,165,233,0.08)',
    icon: '🧠',
    tag: 'Beginner accessible',
    items: [
      {
        name: 'Semax',
        why: 'One of the first nootropic peptides researchers explore — well-characterized cognitive research area.',
        badge: 'First Choice',
        badgeColor: '#0ea5e9',
      },
      {
        name: 'Selank',
        why: 'Studied for anxiolytic properties alongside cognitive effects — a common dual-purpose area.',
        badge: 'Dual Research',
        badgeColor: '#6366f1',
      },
      {
        name: 'Dihexa',
        why: 'Explored in advanced cognitive studies, though researchers recommend starting with Semax first.',
        badge: 'Advanced Step',
        badgeColor: '#ec4899',
      },
    ],
  },
  {
    id: 'metabolic-beginner',
    title: 'Beginner-Friendly Metabolic Peptides',
    subtitle: 'Entry-level metabolic research starting points',
    color: '#8b5cf6',
    headerBg: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(124,58,237,0.02) 100%)',
    headerBorder: 'rgba(139,92,246,0.12)',
    glowColor: 'rgba(139,92,246,0.08)',
    icon: '⚡',
    tag: 'High interest area',
    items: [
      {
        name: 'Semaglutide',
        why: 'The most researched GLP-1 analog — the reference peptide for metabolic research.',
        badge: 'Reference Standard',
        badgeColor: '#8b5cf6',
      },
      {
        name: 'Tirzepatide',
        why: 'Studied as a next-generation dual-agonist, often compared to Semaglutide in research.',
        badge: 'Compare Popular',
        badgeColor: '#f59e0b',
      },
      {
        name: 'Berberine',
        why: 'A plant-derived supplement widely studied for glucose metabolism and metabolic regulation — a common starting supplement in this research area.',
        badge: 'Supplement',
        badgeColor: '#8b5cf6',
      },
    ],
  },
];

const CLINICAL_COMPOUND_PROMPTS = {
  'BPC-157':
    'I want to research BPC-157 (Body Protection Compound 157). ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to tissue repair, tendon healing, and gut barrier integrity. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on BPC-157:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized BPC-157 powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing BPC-157 with [TB-500](/product/tb-500) creates high-performance tissue recovery synergy.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'TB-500':
    'I want to research TB-500 (Thymosin Beta-4 fraction). ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to systemic tissue remodeling, blood vessel growth, and cellular healing. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on TB-500:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized TB-500 powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing TB-500 with [BPC-157](/product/bpc-157) creates high-performance tissue recovery synergy.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'GHK-Cu':
    'I want to research GHK-Cu (Copper Peptide). ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to collagen synthesis, dermal restoration, and glowing cellular health. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on GHK-Cu:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized GHK-Cu powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🌟 **Beauty & Skin Sinergies**: Explore how pairing GHK-Cu with topical creams or supplements like [NMN](/supplements/nmn) enhances tissue quality.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Epithalon':
    'I want to research Epithalon (Epitalon). ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to telomere biology, pineal gland optimization, and biological aging. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Epithalon:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Epithalon powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🌟 **Longevity Sinergies**: Explore how pairing Epithalon with secretagogues like [Sermorelin](/product/sermorelin) supports healthy aging.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'NMN':
    'I want to research NMN (Nicotinamide Mononucleotide). ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to NAD+ restoration, mitochondrial energy, and cellular vitality. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on NMN:\n\n' +
    '*   📋 **Suggested Research Protocols**: Common oral daily dosing schedules and absorption standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing NMN with longevity activators like [Resveratrol](/supplements/resveratrol) or [Berberina](/supplements/berberine) accelerates cellular defense.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Sermorelin':
    'I want to research Sermorelin. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to GH secretagogues, pituary gland stimulation, and deep biological recovery. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Sermorelin:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Sermorelin powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing Sermorelin with secretagogues like [Ipamorelin](/product/ipamorelin) elevates growth hormone pathways naturally.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Semax':
    'I want to research Semax. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to nootropics, BDNF levels, cognitive focus, and neuroprotection. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Semax:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Semax powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing Semax with [Selank](/product/selank) creates high-performance cognitive and focus balance.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Selank':
    'I want to research Selank. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to neurotransmitter balance, anxiolytic research, and calm mental clarity. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Selank:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Selank powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing Selank with [Semax](/product/semax) creates high-performance cognitive and focus balance.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Dihexa':
    'I want to research Dihexa. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to synaptic plasticity, nootropic research, and advanced neurological repair. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Dihexa:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Dihexa powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common duration, cycle lengths, and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Semaglutide':
    'I want to research Semaglutide. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to GLP-1 agonists, appetite control pathways, and metabolic health. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Semaglutide:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Semaglutide powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common weekly titration schedules and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how comparing Semaglutide with [Tirzepatide](/product/tirzepatide) reveals different metabolic dynamics.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Tirzepatide':
    'I want to research Tirzepatide. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to dual GIP/GLP-1 receptor agonists and high-performance metabolic health. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Tirzepatide:\n\n' +
    '*   🧪 **Reconstitution & Preparation**: Standard methods for mixing liofilized Tirzepatide powder with sterile diluents.\n' +
    '*   📋 **Suggested Research Protocols**: Common weekly titration schedules and administration standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how comparing Tirzepatide with [Semaglutide](/product/semaglutide) reveals different metabolic dynamics.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!',
    
  'Berberine':
    'I want to research Berberine. ' +
    'Please act as a very warm, friendly, and welcoming clinical assistant. ' +
    'START with a simple, inspiring, and non-technical introduction to natural AMPK pathways, insulin sensitivity, and glucose metabolism. ' +
    'Then, present a beautifully structured list of options (using clear, distinct icons) for how I can continue my research journey on Berberine:\n\n' +
    '*   📋 **Suggested Research Protocols**: Common oral daily dosing schedules and absorption standards in literature.\n' +
    '*   ⚖️ **Safety & Guidelines**: Side effects, storage best practices, and precaution protocols.\n' +
    '*   🤝 **Synergistic Pairings**: Explore how pairing Berberine with [Tirzepatide](/product/tirzepatide) or [Semaglutide](/product/semaglutide) provides metabolic synergy.\n\n' +
    'Keep the tone encouraging, supportive, and very simple at the beginning!'
};

function CollectionCard({ collection, isOpen, onToggle, onItemClick, onSeedSearch, onOpenSearch, onOpenAI, navigate }) {

  const seedOrFallback = (query) => {
    if (onSeedSearch) {
      onSeedSearch(query);
    } else if (onOpenSearch) {
      onOpenSearch(query);
    }
  };

  const handleExplore = (itemName) => {
    if (onOpenAI) {
      const richPrompt = CLINICAL_COMPOUND_PROMPTS[itemName] || `I want to explore research options for the research peptide ${itemName}.`;
      onOpenAI(richPrompt, `I want to explore research options for ${itemName}!`);
      return;
    }

    if (onItemClick) {
      onItemClick(itemName);
    } else {
      navigate(`/product/${toSlug(itemName)}`);
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        border: isOpen ? `1px solid ${collection.headerBorder}` : '1px solid var(--border-light)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? `0 8px 30px ${collection.glowColor}` : '0 4px 12px rgba(0, 0, 0, 0.02)',
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.borderColor = collection.headerBorder.replace('0.12', '0.3');
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.borderColor = 'var(--border-light)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Collection Header (Clickable) */}
      <div
        onClick={onToggle}
        style={{
          background: isOpen ? collection.headerBg : 'transparent',
          borderBottom: isOpen ? `1px solid ${collection.headerBorder}` : 'none',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{collection.icon}</span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: collection.color, marginBottom: '0.2rem',
              opacity: 0.9,
            }}>
              {collection.tag}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {collection.title}
            </div>
            {isOpen && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>
                {collection.subtitle}
              </div>
            )}
          </div>
        </div>
        <div style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
          color: collection.color,
          opacity: 0.7,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>

          {/* Items */}
          <div style={{ padding: '0.75rem 0' }}>
            {collection.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem 1.25rem',
                  borderBottom: idx < collection.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-soft)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ flex: '1 1 300px', minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 850, color: 'var(--text-main)', fontSize: '1rem' }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.6rem',
                      borderRadius: 20, background: `${item.badgeColor}08`,
                      color: item.badgeColor, border: `1px solid ${item.badgeColor}20`,
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5,
                    fontWeight: 400,
                  }}>
                    {item.why}
                  </div>
                </div>

                {/* Dual Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, flexWrap: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const richPrompt = CLINICAL_COMPOUND_PROMPTS[item.name] || `I want to explore research options for ${item.name}.`;
                      if (onOpenAI) {
                        onOpenAI(richPrompt, `I want to explore research options for ${item.name}!`);
                      } else {
                        window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                          detail: { query: richPrompt, autoSend: true }
                        }));
                      }
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.72rem', fontWeight: 800, padding: '0.4rem 0.9rem',
                      borderRadius: '20px', background: 'rgba(0, 150, 204, 0.08)',
                      color: 'var(--secondary, #0096cc)', border: '1px solid rgba(0, 150, 204, 0.2)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 150, 204, 0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 150, 204, 0.08)'; }}
                  >
                    <Bot size={12} strokeWidth={2.5} /> Análisis IA
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const slug = toSlug(item.name);
                      if (item.badge === 'Supplement' || item.name.toLowerCase() === 'berberine' || item.name.toLowerCase() === 'nmn') {
                        navigate(`/supplements/${slug}`);
                      } else if (item.name.toLowerCase() === 'eterna-longevity-platform') {
                        navigate(`/testing/${slug}`);
                      } else {
                        navigate(`/product/${slug}`);
                      }
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.72rem', fontWeight: 800, padding: '0.4rem 0.9rem',
                      borderRadius: '20px', background: 'var(--border-light)',
                      color: 'var(--text-main)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--border-light)'; }}
                  >
                    Ver Detalles <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default function BeginnerCollections({ onItemClick, onSeedSearch, onOpenSearch, onOpenAI }) {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(COLLECTIONS[0].id);

  return (
    <>
      <style>{`
        @keyframes sparkleGlow {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.12) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 3px rgba(0, 209, 255, 0.45)); }
        }
        .gls-sparkle-spin {
          animation: sparkleGlow 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* Background decorative — light and subtle */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '20%',
        width: 600, height: 500,
        background: 'radial-gradient(ellipse, rgba(0,150,204,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="section-header">
          <div className="section-eyebrow">
            <Sparkles size={13} />
            CURATED — START HERE
          </div>

          <h2
            id="beginner-collections-heading"
            className="section-title"
          >
            Not Sure Where To Begin?
          </h2>
          <p className="section-subtitle">
            Curated collections — not a catalog dump. Each list includes only the most researched
            peptides for that goal, with clear explanations of why researchers explore them.
          </p>
        </div>

        {/* Collections Accordion */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {COLLECTIONS.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              isOpen={openId === col.id}
              onToggle={() => setOpenId(openId === col.id ? null : col.id)}
              onItemClick={onItemClick}
              onSeedSearch={onSeedSearch}
              onOpenSearch={onOpenSearch}
              onOpenAI={onOpenAI}
              navigate={navigate}
            />
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-light)',
          fontSize: '0.8rem',
          marginTop: '3rem',
          fontWeight: 500,
          opacity: 0.8,
        }}>
          These collections represent common research starting points — not medical recommendations.
        </p>
      </div>
    </>
  );
}

