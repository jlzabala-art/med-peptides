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
        gap: 10,
        padding: '10px 14px',
        marginBottom: 16,
        border: '1px solid #d2e3fc',
        background: '#f1f6fe',
        borderRadius: 8,
        fontSize: 13,
        color: '#202124'
      }}
    >
      <History size={16} color="#003666" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 180 }}>
        Continue where you left off: <strong>{LABELS[last]}</strong>
      </span>
      <button
        type="button"
        onClick={() => onResume(last)}
        style={{
          minHeight: 44,
          padding: '0 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          border: 'none',
          borderRadius: 6,
          background: '#003666',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Resume <ArrowRight size={14} />
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        style={{
          minHeight: 44,
          minWidth: 44,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: '#5f6368'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
