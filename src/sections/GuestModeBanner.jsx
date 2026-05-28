 
/**
 * GuestModeBanner — Phase 2
 * ─────────────────────────────────────────────────────────────────────────────
 * Small pill-style indicator shown near the top of GuestHome.
 * Communicates to the visitor that they are in "Guest" mode.
 *
 * Behaviour:
 *  - Visible when user is NOT professional (guest or unauthenticated).
 *  - Hidden automatically for professional users.
 *  - Dismissible via a close button (sessionStorage — resets on new tab).
 *
 * Design: compact banner, does not dominate the layout.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SESSION_KEY = 'gmb_dismissed';

export default function GuestModeBanner() {
  const navigate = useNavigate();
  const { isProfessional } = useAuth?.() ?? {};

  const [dismissed, setDismissed] = useState(() => {
    try { return !!sessionStorage.getItem(SESSION_KEY); } catch { return false; }
  });

  // Don't render for professionals or if dismissed
  if (isProfessional || dismissed) return null;

  const handleDismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* private */ }
    setDismissed(true);
  };

  return (
    <div style={rootStyle} role="status" aria-live="polite">
      <div style={innerStyle}>
        {/* Left: mode pill + text */}
        <div style={leftStyle}>
          <span style={pillStyle}>Guest</span>
          <span style={labelStyle}>
            Browsing Mode: <strong style={{ color: 'var(--text)' }}>Guest</strong>
            <span style={dimStyle}> — Limited pricing shown</span>
          </span>
        </div>

        {/* Right: CTA + dismiss */}
        <div style={rightStyle}>
          <button
            id="gmb-unlock-btn"
            style={ctaStyle}
            onClick={() => navigate('/login?role=professional&type=register')}
          >
            Unlock Professional Access →
          </button>
          <button
            style={closeStyle}
            onClick={handleDismiss}
            aria-label="Dismiss guest mode banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const rootStyle = {
  width: '100%',
  background: 'rgba(56, 189, 248, 0.06)',
  borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
  padding: '0.55rem 1rem',
};

const innerStyle = {
  maxWidth: 1100,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const leftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  flexWrap: 'wrap',
};

const pillStyle = {
  display: 'inline-block',
  padding: '0.15rem 0.6rem',
  borderRadius: 999,
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  background: 'rgba(56, 189, 248, 0.15)',
  color: '#38bdf8',
  border: '1px solid rgba(56, 189, 248, 0.3)',
};

const labelStyle = {
  fontSize: '0.82rem',
  color: 'var(--text-muted)',
};

const dimStyle = {
  opacity: 0.65,
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const ctaStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#38bdf8',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: 6,
  whiteSpace: 'nowrap',
  transition: 'opacity 0.15s',
};

const closeStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '0.8rem',
  padding: '0.2rem 0.4rem',
  borderRadius: 4,
  lineHeight: 1,
  opacity: 0.6,
  transition: 'opacity 0.15s',
};
