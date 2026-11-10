'use client';

import { useState } from 'react';
import { History, X, ArrowRight } from 'lucide-react';

const LABELS = {
  prescriptions: 'Prescriptions',
  patients: 'Patients',
  tasks: 'Pending tasks',
  recommendations: 'Recommendations',
  discovery: 'Product discovery',
  lab_results: 'Lab results'
};

const storageKey = (slug) => `atlas_dr_last_anchor_${slug}`;

/** Persist the last visited section (call from an effect in the parent). */
export function rememberDoctorSection(slug, anchor) {
  if (typeof window === 'undefined' || !slug || !LABELS[anchor]) return;
  try {
    window.localStorage.setItem(storageKey(slug), anchor);
  } catch {
    /* storage unavailable — resume is optional */
  }
}

/**
 * Subtle resume suggestion (Google Cloud "Recently visited" pattern).
 * Render client-only (dynamic ssr:false) because it reads localStorage.
 */
export default function DoctorContinueBanner({ slug, onResume }) {
  const [dismissed, setDismissed] = useState(false);
  const [last] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(storageKey(slug));
    } catch {
      return null;
    }
  });

  if (dismissed || !last || !LABELS[last]) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        padding: '6px 12px',
        marginBottom: 14,
        border: '1px solid #d2e3fc',
        background: '#f1f6fe',
        borderRadius: 6,
        fontSize: '0.76rem',
        color: '#202124'
      }}
    >
      <History size={14} color="#1a73e8" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 160 }}>
        Continue where you left off: <strong>{LABELS[last]}</strong>
      </span>
      <button
        type="button"
        onClick={() => onResume(last)}
        style={{
          height: 30,
          padding: '0 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          border: 'none',
          borderRadius: 4,
          background: '#1a73e8',
          color: '#fff',
          fontSize: '0.74rem',
          fontWeight: 650,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(26,115,232,0.2)'
        }}
      >
        <span>Resume</span>
        <ArrowRight size={12} />
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        style={{
          height: 30,
          width: 30,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: '#5f6368',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
