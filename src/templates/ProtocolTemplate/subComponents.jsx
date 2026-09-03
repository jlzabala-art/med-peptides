"use client";

import { useRouter } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FlaskConical, Info, Box, AlertCircle } from '@/lib/icons';

export function ProtocolSkeleton() {
  return (
    <div className="proto-detail-skeleton">
      <div className="proto-detail-skeleton__hero" />
      <div className="proto-detail-skeleton__body">
        {[1, 2, 3].map((i) => (
          <div key={i} className="proto-detail-skeleton__block" />
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
export function ProtocolNotFound({ slug }) {
  const router = useRouter();
  return (
    <div className="proto-detail-notfound">
      <AlertCircle size={48} color="#f87171" />
      <h2>Protocol Not Found</h2>
      <p>
        No protocol was found for <code>{slug}</code>. It may have been archived
        or the link is incorrect.
      </p>
      <button className="proto-back-btn" onClick={() => router.push('/protocols')}>
        Browse All Protocols
      </button>
    </div>
  );
}

// ── Included Peptide Card ─────────────────────────────────────────────────────
export function IncludedPeptideCard({ peptide, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const color = peptide.color || 'var(--color-primary)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-bg-surface)' : 'rgba(255,255,255,0.7)',
        border: `1.5px solid ${hovered ? color : 'rgba(0,54,102,0.08)'}`,
        borderRadius: '14px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 30px rgba(0,54,102,0.12)' : '0 2px 8px rgba(0,54,102,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        minWidth: '280px',
        flex: '1 1 0',
      }}
    >
      {/* Accent dot + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, flexShrink: 0, marginTop: '5px',
          boxShadow: `0 0 8px ${color}80`,
        }} />
        <span style={{
          fontSize: '0.95rem', fontWeight: 700, color: '#0f172a',
          lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {peptide.name}
        </span>
      </div>

      {/* Role / category */}
      {peptide.role && (
        <p style={{
          fontSize: '0.78rem', color: `${color}CC`, margin: 0,
          fontWeight: 600, lineHeight: 1.4,
        }}>
          {peptide.role}
        </p>
      )}

      {/* Description (truncated) */}
      {peptide.description && (
        <p style={{
          fontSize: '0.78rem', color: 'var(--color-text-secondary)',
          margin: 0, lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {peptide.description}
        </p>
      )}

      {/* Dosage chip (if available) */}
      {peptide.dosage && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: `${color}08`, border: `1px solid ${color}25`,
          borderRadius: '999px', padding: '0.18rem 0.6rem',
          fontSize: '0.72rem', fontWeight: 600, color,
          width: 'fit-content', marginTop: '0.15rem',
        }}>
          {peptide.dosage}{peptide.frequency ? ` · ${peptide.frequency}` : ''}
        </span>
      )}
    </div>
  );
}

