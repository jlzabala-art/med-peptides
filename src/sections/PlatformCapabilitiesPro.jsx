import Layers from "lucide-react/dist/esm/icons/layers";
import Search from "lucide-react/dist/esm/icons/search";
import FileText from "lucide-react/dist/esm/icons/file-text";
import FileBarChart from "lucide-react/dist/esm/icons/file-bar-chart";
import PiggyBank from "lucide-react/dist/esm/icons/piggy-bank";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';








const capabilities = [
  {
    title: 'ClinicalAI',
    icon: Layers,
    desc: 'Advanced biological intelligence layer for multi-phase titration logic and clinical decision support.',
    stat: '200+ protocols built',
    statColor: '#6366f1',
  },
  {
    title: 'Batch Tracking',
    icon: Search,
    desc: 'Full synthesis-to-delivery chain with QA checkpoints and institution-level audit trails.',
    stat: 'ISO-traceable',
    statColor: '#0ea5e9',
  },
  {
    title: 'Regulatory Documentation',
    icon: FileText,
    desc: 'On-demand SDS, CoA, and compliance bundles aligned with institutional review requirements.',
    stat: 'IRB-compatible',
    statColor: 'var(--color-success)',
  },
  {
    title: 'Analytical Reports',
    icon: FileBarChart,
    desc: 'HPLC & MS purity certificates per batch — downloadable and linked to your account vault.',
    stat: '>99% purity verified',
    statColor: '#f59e0b',
  },
  {
    title: 'Institutional Pricing',
    icon: PiggyBank,
    desc: 'Volume-tiered procurement pricing for licensed facilities — auto-applied on verified accounts.',
    stat: 'Up to 30% discount',
    statColor: '#ec4899',
  },
];

export default function PlatformCapabilitiesPro() {
  return (
    <section
      style={{
        backgroundColor: 'white',
        padding: 'clamp(4rem, 8vw, 7rem) 0',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4.5rem)', padding: '0 1rem' }}>

          {/* Discrete professional badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--color-success-bg)', border: '1px solid #bbf7d0',
            color: 'var(--color-success)', padding: '4px 14px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '1.25rem',
          }}>
            <ShieldCheck size={13} /> Professional Access
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0f172a',
            fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem',
          }}>
            Clinical-Grade Tools
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Exclusive infrastructure for accredited practitioners, institutional researchers, and verified procurement teams.
          </p>
        </div>

        {/* Grid — horizontal list style */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '0 1rem',
        }}>
          {capabilities.map((cap, i) => (
            <ProCapRow key={i} cap={cap} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          maxWidth: '860px', margin: '2.5rem auto 0', padding: '0 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1.25rem 1.75rem',
          backgroundColor: 'var(--color-bg-app)',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
        }}>
          <ShieldCheck size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Access to clinical-grade tools is restricted to verified professionals.
            {' '}<span style={{ color: '#0ea5e9', fontWeight: 700, cursor: 'pointer' }}>Request institutional access →</span>
          </p>
        </div>

      </div>
    </section>
  );
}

function ProCapRow({ cap, index }) {
  const Icon = cap.icon;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.25rem 1.5rem',
        backgroundColor: hovered ? 'var(--color-bg-app)' : 'white',
        border: '1px solid ' + (hovered ? 'var(--color-primary)' : 'var(--color-border)'),
        borderRadius: '16px',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      {/* Step number */}
      <div style={{
        width: 28, height: 28, borderRadius: '8px',
        backgroundColor: hovered ? '#e0f4fd' : '#f1f5f9',
        color: hovered ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 900, flexShrink: 0,
        transition: 'all 0.2s',
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        backgroundColor: hovered ? '#e0f4fd' : '#f1f9fe',
        color: 'var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.2s',
      }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800, margin: '0 0 0.2rem 0' }}>
          {cap.title}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.55 }}>
          {cap.desc}
        </p>
      </div>

      {/* Stat pill */}
      <div style={{ flexShrink: 0 }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, color: cap.statColor,
          backgroundColor: cap.statColor + '14',
          padding: '4px 12px', borderRadius: '20px',
          whiteSpace: 'nowrap',
        }}>
          {cap.stat}
        </span>
      </div>

      <ArrowRight size={16} color={hovered ? 'var(--color-primary)' : 'var(--color-border)'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
    </div>
  );
}