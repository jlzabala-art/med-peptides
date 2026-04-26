import React, { useState, useRef, useEffect } from 'react';
import { Search, ShieldCheck, Beaker, Layers, BookOpen, Zap } from 'lucide-react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';

const QUICK_SUGGESTIONS = [
  { label: 'Tirzepatide',       icon: '💉' },
  { label: 'BPC-157',           icon: '🔬' },
  { label: 'Weight Management', icon: '⚖️' },
  { label: 'Sleep Blueprint',    icon: '🌙' },
  { label: 'Reconstitution',    icon: '🧪' },
  { label: 'AOD-9604',          icon: '⚡' },
];

const STATIC_TRUST = [
  { icon: ShieldCheck, label: 'Clinically Validated', key: null },
  { icon: Beaker,      label: '— Peptides',          key: 'peptides' },
  { icon: Layers,      label: '— Protocols',          key: 'protocols' },
  { icon: BookOpen,    label: 'Evidence-Based',      key: null },
];

/**
 * HeroSearch — search-first hero.
 *
 * Search behaviour (Phase 2):
 *  - onFocus    → opens global SearchModal
 *  - onChange   → seeds query into SearchModal, which filters live
 *  - chip click → seeds query and opens modal
 *
 * No secondary search system; wires into the single SearchModal instance
 * managed by App.jsx via onOpenSearch / setSearchQuery.
 */
export default function HeroSearch({ onOpenSearch, searchQuery = '', setSearchQuery }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // ── Real counts from Firestore ───────────────────────────────────────────
  const [counts, setCounts] = useState({ peptides: null, protocols: null });

  useEffect(() => {
    let cancelled = false;
    async function fetchCounts() {
      try {
        const [peptSnap, protoSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'products'), where('status', '==', 'active'))),
          getCountFromServer(query(collection(db, 'protocols'))),
        ]);
        if (!cancelled) {
          setCounts({
            peptides:  peptSnap.data().count,
            protocols: protoSnap.data().count,
          });
        }
      } catch (err) {
        console.warn('Trust bar count fetch failed:', err);
      }
    }
    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  const TRUST_INDICATORS = STATIC_TRUST.map(item => ({
    ...item,
    label: item.key && counts[item.key] !== null
      ? `${counts[item.key]} ${item.key === 'peptides' ? 'Peptides' : 'Protocols'}`
      : item.label,
  }));

  // Open the global search modal, optionally pre-seeding a query
  const triggerSearch = (q = '') => {
    if (setSearchQuery) setSearchQuery(q || searchQuery);
    onOpenSearch?.(q || searchQuery);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery?.(val);
    // Open modal immediately on first keystroke
    onOpenSearch?.(val);
  };

  const handleFocus = () => {
    setFocused(true);
    onOpenSearch?.(searchQuery);
  };

  const handleChip = (label) => {
    setSearchQuery?.(label);
    onOpenSearch?.(label);
    inputRef.current?.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSearch();
  };

  return (
    <section style={{
      background: 'linear-gradient(160deg, #00101F 0%, #001A35 50%, #00243F 100%)',
      minHeight: 'clamp(70vh, 80vh, 900px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(5rem, 8vw, 8rem) 1.25rem 4rem',
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(0,163,224,0.10) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(16,185,129,0.07) 0%, transparent 70%)',
        ].join(','),
      }} />

      {/* Grid noise texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', width: '100%', textAlign: 'center' }}>

        {/* Eyebrow badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
          background: 'rgba(0,163,224,0.12)', border: '1px solid rgba(0,163,224,0.25)',
          borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.75rem',
          color: '#38BFEA', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <Zap size={12} strokeWidth={2.5} />
          Clinical Peptide Intelligence
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1,
          color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em',
        }}>
          Clinical Peptides and Protocols,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00A3E0, #10B981)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Ready to Deploy
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.60)',
          lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem',
        }}>
          Search blueprints, peptides, compounds, or clinical applications.
        </p>

        {/* Search bar — opens global SearchModal on focus/type */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: focused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${focused ? 'rgba(0,163,224,0.55)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '14px', padding: '0.5rem 0.5rem 0.5rem 1.25rem',
            transition: 'all 0.25s ease',
            boxShadow: focused ? '0 0 0 4px rgba(0,163,224,0.12)' : 'none',
          }}>
            <Search size={20} color={focused ? '#00A3E0' : 'rgba(255,255,255,0.35)'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={() => setFocused(false)}
              placeholder="Search peptides, blueprints, compounds, or clinical goals..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#FFFFFF', fontSize: '1rem', padding: '0.6rem 1rem',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #00A3E0, #0087BD)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '0.65rem 1.4rem', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', flexShrink: 0,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', alignSelf: 'center', marginRight: '0.25rem' }}>
            Try:
          </span>
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleChip(s.label)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '999px', padding: '0.35rem 0.85rem',
                color: 'rgba(255,255,255,0.70)', fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,163,224,0.15)';
                e.currentTarget.style.borderColor = 'rgba(0,163,224,0.35)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.70)';
              }}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem',
        }}>
          {TRUST_INDICATORS.map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 500,
            }}>
              <Icon size={15} color='#00A3E0' strokeWidth={2} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
