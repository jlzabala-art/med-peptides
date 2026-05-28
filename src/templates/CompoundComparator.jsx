/* eslint-disable no-unused-vars */
import { useState, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { products } from '../data/products';
import { ArrowRightLeft, ShieldCheck, Zap, Target, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompoundComparator() {
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "name": "Research Peptide Comparison",
    "description": "Side-by-side technical comparison of high-purity research peptides.",
    "url": "https://med-peptides.com/compare"
  }), []);

  usePageMeta({
    title: 'Research Peptide Comparator | Med-Peptides',
    description: 'Compare side-by-side mechanism of action, CAS numbers, and research objectives for high-purity peptides.',
    path: '/compare',
    structuredData
  });

  const uniquePeptides = useMemo(() => {
    const seen = new Set();
    return products.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [p1, setP1] = useState(uniquePeptides[0]);
  const [p2, setP2] = useState(uniquePeptides[1]);

  const ComparisonRow = ({ label, icon: Icon, val1, val2, type = 'text' }) => (
    <div style={s.row}>
      <div style={s.rowLabel}>
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div style={s.rowValue}>{Array.isArray(val1) ? val1.join(', ') : val1}</div>
      <div style={s.rowValue}>{Array.isArray(val2) ? val2.join(', ') : val2}</div>
    </div>
  );

  return (
    <div className="compare-page" style={{ paddingTop: '120px', paddingBottom: '5rem', background: 'var(--color-bg-app)', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={s.badge}>
            <ArrowRightLeft size={14} /> Side-by-Side Analysis
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#001a33', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Peptide <span style={{ color: 'var(--secondary)' }}>Comparator</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Select two research peptides to compare their molecular signaling, primary objectives, and technical specifications.
          </p>
        </div>

        {/* Selection Header */}
        <div style={s.selectorGrid}>
          <div style={s.selectorCard}>
            <label style={s.selectLabel}>Subject Alpha</label>
            <select 
              value={p1?.name} 
              onChange={(e) => setP1(uniquePeptides.find(p => p.name === e.target.value))}
              style={s.select}
            >
              {uniquePeptides.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={s.vsCircle}>VS</div>
          </div>

          <div style={s.selectorCard}>
            <label style={s.selectLabel}>Subject Beta</label>
            <select 
              value={p2?.name} 
              onChange={(e) => setP2(uniquePeptides.find(p => p.name === e.target.value))}
              style={s.select}
            >
              {uniquePeptides.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={s.compareTable}>
          <div style={s.tableHeader}>
            <div style={{ flex: 1 }}>Attribute</div>
            <div style={{ flex: 1.5, color: 'var(--secondary)' }}>{p1?.name}</div>
            <div style={{ flex: 1.5, color: 'var(--secondary)' }}>{p2?.name}</div>
          </div>

          <ComparisonRow label="CAS Number" icon={ShieldCheck} val1={p1?.cas} val2={p2?.cas} />
          <ComparisonRow label="Primary Objective" icon={Target} val1={p1?.objective} val2={p2?.objective} />
          <ComparisonRow label="Mechanisms" icon={Zap} val1={p1?.mechanisms} val2={p2?.mechanisms} />
          <ComparisonRow label="Research Goals" icon={BookOpen} val1={p1?.goals} val2={p2?.goals} />
          {/* Phase 8: canonical read path — typeData.peptide.mechanismOfAction first, then legacy field */}
          <ComparisonRow label="Signaling Summary" icon={BookOpen} val1={p1?.typeData?.peptide?.mechanismOfAction?.summary ?? p1?.mechanismOfAction?.summary} val2={p2?.typeData?.peptide?.mechanismOfAction?.summary ?? p2?.mechanismOfAction?.summary} />
          
          <div style={s.row}>
            <div style={s.rowLabel}>
              <AlertCircle size={16} />
              <span>Safety Note</span>
            </div>
            <div style={{ ...s.rowValue, fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>{p1?.safetyNote}</div>
            <div style={{ ...s.rowValue, fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>{p2?.safetyNote}</div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
           <button style={s.ctaBtn} onClick={() => window.location.href = `/product/${p1?.name.toLowerCase().replace(/\s+/g, '-')}`}>View {p1?.name} Profile</button>
           <button style={s.ctaBtn} onClick={() => window.location.href = `/product/${p2?.name.toLowerCase().replace(/\s+/g, '-')}`}>View {p2?.name} Profile</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0,163,224,0.1)',
    color: 'var(--secondary)',
    padding: '0.4rem 1rem',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1.5rem'
  },
  selectorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 80px 1fr',
    gap: '1rem',
    marginBottom: '3rem'
  },
  selectorCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0'
  },
  selectLabel: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'var(--color-text-tertiary)',
    marginBottom: '0.75rem',
    letterSpacing: '0.1em'
  },
  select: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#001a33',
    outline: 'none',
    cursor: 'pointer'
  },
  vsCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#001a33',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '0.8rem',
    boxShadow: '0 0 0 6px rgba(0,26,51,0.05)'
  },
  compareTable: {
    background: 'white',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,26,51,0.06)',
    border: '1px solid #e2e8f0'
  },
  tableHeader: {
    display: 'flex',
    padding: '2rem',
    background: 'var(--color-bg-app)',
    borderBottom: '1.5px solid #e2e8f0',
    fontSize: '0.8rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-text-secondary)'
  },
  row: {
    display: 'flex',
    padding: '1.75rem 2rem',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'flex-start',
    gap: '2rem'
  },
  rowLabel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#001a33'
  },
  rowValue: {
    flex: 1.5,
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5
  },
  ctaBtn: {
    padding: '0.8rem 1.8rem',
    borderRadius: '99px',
    border: 'none',
    background: '#001a33',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
