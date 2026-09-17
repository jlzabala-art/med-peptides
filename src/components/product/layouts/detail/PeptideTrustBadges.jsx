import React from 'react';
import { ShieldCheck, FlaskConical, Truck, Beaker, FileText } from '@/lib/icons';

/**
 * PeptideTrustBadges
 * Displays HPLC, purity >= 99%, lab testing and transit badges + CoA action button.
 */
export default function PeptideTrustBadges({ presentationClass = 'vial', onOpenCoa }) {
  const isVial = presentationClass === 'vial';
  const badges = isVial
    ? [
        { icon: <ShieldCheck size={14} />, label: '≥ 99% Purity' },
        { icon: <FlaskConical size={14} />, label: 'HPLC & MS' },
        { icon: <Truck size={14} />, label: 'Secure Transit' },
      ]
    : [
        { icon: <ShieldCheck size={14} />, label: 'Verified Quality' },
        { icon: <Beaker size={14} />, label: 'Lab Tested' },
        { icon: <Truck size={14} />, label: 'Secure Transit' },
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Trust badges row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {badges.map((badge, i) => (
          <div key={i} className="pd-trust-card" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>{badge.icon}</div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* Purity certificate button */}
      {isVial && (
        <button
          type="button"
          className="pd-purity-badge"
          onClick={onOpenCoa}
          style={{
            width: '100%',
            padding: '0.8rem',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            background: 'white',
            color: 'var(--primary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <FileText size={14} />
          <span>Certificate of Analysis</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.65rem',
              backgroundColor: 'var(--success)',
              color: 'white',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            Verified
          </span>
        </button>
      )}
    </div>
  );
}
