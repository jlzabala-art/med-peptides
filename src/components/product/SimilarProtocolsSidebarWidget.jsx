"use client";

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronRight } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import './SimilarProtocolsSidebarWidget.css';

/**
 * Evidence grade ordering: A > B > C > D/unknown
 */
const EVIDENCE_META = {
  A: { label: 'Grade A', color: '#16a34a', bg: '#f0fdf4', borderColor: '#bbf7d0', rank: 1, description: 'RCT Evidence' },
  B: { label: 'Grade B',  color: '#d97706', bg: '#fffbeb', borderColor: '#fde68a', rank: 2, description: 'Controlled Studies' },
  C: { label: 'Grade C',  color: '#64748b', bg: '#f1f5f9', borderColor: '#e2e8f0', rank: 3, description: 'Observational' },
  D: { label: 'Grade D',  color: '#94a3b8', bg: '#f8fafc', borderColor: '#e2e8f0', rank: 4, description: 'Expert Opinion' },
};

function getEvidenceMeta(grade) {
  if (!grade) return EVIDENCE_META.D;
  const key = String(grade).trim().charAt(0).toUpperCase();
  return EVIDENCE_META[key] || EVIDENCE_META.D;
}

/**
 * SimilarProtocolsSidebarWidget
 * GCP-Console-inspired sidebar widget listing the top-3 protocols sharing the
 * same therapeutic goal, ordered by clinical evidence grade (A > B > C).
 */
export default function SimilarProtocolsSidebarWidget({
  protocols = [],
  lang = 'en',
  currentSlug = ''
}) {
  const isEs = lang === 'es';

  const items = protocols
    .filter(p => (p.slug || p.id || '') !== currentSlug)
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <div className="spw-similar-widget">
      <div className="spw-similar-header">
        <div className="spw-similar-header-left">
          <TrendingUp size={13} className="spw-similar-icon" />
          <span className="spw-similar-title">
            {isEs ? 'PROTOCOLOS SIMILARES' : 'SIMILAR PROTOCOLS'}
          </span>
        </div>
        <span className="spw-similar-subtitle">
          {isEs ? 'Por objetivo' : 'By goal'}
        </span>
      </div>

      <div className="spw-similar-list">
        {items.map((p, idx) => {
          const protoSlug = p.slug || p.id;
          const protoName = p.name || p.title || 'Clinical Protocol';
          const rawGrade = p.evidence_grade || p.metadata?.evidence_grade || null;
          const ev = getEvidenceMeta(rawGrade);
          const duration = p.duration || (p.durationWeeks ? `${p.durationWeeks}w` : null);
          const compoundCount = p.compoundCount || (Array.isArray(p.items) ? p.items.length : null);

          return (
            <Link
              key={p.id || protoSlug}
              href={`/proto/${protoSlug}`}
              onClick={() => triggerHaptic('selection')}
              className={`spw-similar-item${idx === 0 ? ' top-evidence' : ''}`}
              title={`${protoName} — ${ev.description}`}
            >
              <div
                className="spw-similar-grade"
                style={{ background: ev.bg, color: ev.color, borderColor: ev.borderColor }}
                title={`Evidence ${ev.label}`}
              >
                <span className="spw-grade-letter">{ev.label.split(' ')[1]}</span>
              </div>

              <div className="spw-similar-content">
                <div className="spw-similar-name">{protoName}</div>
                <div className="spw-similar-meta">
                  {duration && <span className="spw-meta-chip">{duration}</span>}
                  {compoundCount && <span className="spw-meta-chip">{compoundCount} {isEs ? 'cptos.' : 'cpds.'}</span>}
                  <span className="spw-meta-evidence" style={{ color: ev.color }}>{ev.description}</span>
                </div>
              </div>

              <ChevronRight size={12} className="spw-similar-arrow" />
            </Link>
          );
        })}
      </div>

      <p className="spw-similar-footer-note">
        {isEs ? '↑ Ordenado por evidencia clínica' : '↑ Ranked by clinical evidence'}
      </p>
    </div>
  );
}
