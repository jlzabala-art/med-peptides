import React from 'react';
import { Layers, Search, FileText, FileBarChart, PiggyBank, ArrowRight } from 'lucide-react';

const capabilities = [
  {
    title: 'Protocol Builder',
    icon: Layers,
    desc: 'AI-assisted logic generation for experimental scheduling and multi-phase titration.',
    tag: 'AI-Powered',
    tagColor: '#6366f1',
    tagBg: '#eef2ff',
  },
  {
    title: 'Batch Tracking',
    icon: Search,
    desc: 'End-to-end visibility of synthesis and QA lifecycle from origin to vial.',
    tag: 'Real-Time',
    tagColor: '#0ea5e9',
    tagBg: '#f0f9ff',
  },
  {
    title: 'Documentation',
    icon: FileText,
    desc: 'Immediate access to SDS, safety data sheets, and regulatory compliance files.',
    tag: 'Compliant',
    tagColor: '#10b981',
    tagBg: '#f0fdf4',
  },
  {
    title: 'Analytical Reports',
    icon: FileBarChart,
    desc: 'HPLC & MS purity verification certificates linked to every individual vial.',
    tag: 'Traceable',
    tagColor: '#f59e0b',
    tagBg: '#fffbeb',
  },
  {
    title: 'Institutional Tier',
    icon: PiggyBank,
    desc: 'Automated scaled pricing for verified research facilities and procurement teams.',
    tag: 'Volume Pricing',
    tagColor: '#ec4899',
    tagBg: '#fdf2f8',
  },
];

export default function PlatformCapabilities() {
  return (
    <section
      style={{
        backgroundColor: '#f8fafc',
        padding: 'clamp(4rem, 8vw, 7rem) 0',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4.5rem)', padding: '0 1rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#00A3E0', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.2em', fontSize: '0.7rem', marginBottom: '1rem',
          }}>
            What We Offer
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0f172a',
            fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem',
          }}>
            Platform Capabilities
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Built for clinical researchers and institutional buyers requiring absolute precision.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          padding: '0 1rem',
        }}>
          {capabilities.map((cap, i) => (
            <CapCard key={i} cap={cap} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapCard({ cap }) {
  const Icon = cap.icon;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'white',
        border: '1px solid ' + (hovered ? '#00A3E0' : '#e2e8f0'),
        borderRadius: '20px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 40px rgba(0,163,224,0.09)' : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'default',
      }}
    >
      {/* Icon + Tag row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '14px',
          backgroundColor: hovered ? '#e0f4fd' : '#f1f9fe',
          color: '#00A3E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.25s',
          flexShrink: 0,
        }}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: cap.tagColor,
          backgroundColor: cap.tagBg, padding: '3px 10px', borderRadius: '20px',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {cap.tag}
        </span>
      </div>

      {/* Text */}
      <div>
        <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
          {cap.title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.65 }}>
          {cap.desc}
        </p>
      </div>

      {/* Learn more hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.8rem', fontWeight: 700, color: hovered ? '#00A3E0' : '#cbd5e1',
        transition: 'color 0.25s', marginTop: 'auto',
      }}>
        Learn more <ArrowRight size={14} />
      </div>
    </div>
  );
}