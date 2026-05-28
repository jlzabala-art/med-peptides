 
import React from 'react';
import { ShieldCheck, Beaker, FileText, Info } from 'lucide-react';

const EVIDENCE_LEVELS = {
  HIGH: {
    label: 'High Clinical Evidence',
    icon: <ShieldCheck size={12} />,
    color: 'var(--color-success)',
    bg: '#ecfdf5',
    border: '#10b98130',
    desc: 'Based on multiple human clinical trials and peer-reviewed studies.'
  },
  MODERATE: {
    label: 'Moderate Evidence',
    icon: <Beaker size={12} />,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#0ea5e930',
    desc: 'Based on smaller human studies or extensive animal/pre-clinical data.'
  },
  EMERGING: {
    label: 'Emerging Research',
    icon: <FileText size={12} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#8b5cf630',
    desc: 'Based on initial pre-clinical data or ongoing research trials.'
  },
  ANECDOTAL: {
    label: 'Observational Data',
    icon: <Info size={12} />,
    color: '#4b5563',
    bg: '#f3f4f6',
    border: '#6b728030',
    desc: 'Based on observational reports and individual research outcomes.'
  }
};

export default function EvidenceBadge({ level = 'MODERATE', onClick }) {
  const cfg = EVIDENCE_LEVELS[level] || EVIDENCE_LEVELS.MODERATE;

  return (
    <div 
      title={cfg.desc}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '999px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: '0.62rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: onClick ? 'pointer' : 'help',
        marginBottom: '0.6rem',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {cfg.icon}
      {cfg.label}
    </div>
  );
}
