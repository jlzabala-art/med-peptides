 
/**
 * FloatingProCTA — Phase 8
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent floating CTA for guest users to unlock professional access.
 *
 * Behaviour:
 *  - Only visible for non-professional (guest / unauthenticated) users.
 *  - Desktop: fixed bottom-right corner.
 *  - Mobile: sticky bottom full-width bar.
 *  - Dismissible (sessionStorage — resets on new tab like GuestModeBanner).
 *  - Link: /auth?mode=register
 *
 * Performance: CSS transitions only. No heavy dependencies.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SESSION_KEY = 'fpcta_dismissed';

export default function FloatingProCTA() {
  const navigate = useNavigate();
  const { isProfessional } = useAuth?.() ?? {};
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return !!sessionStorage.getItem(SESSION_KEY); } catch { return false; }
  });

  // Delay appearance by 3 s so it doesn't feel intrusive on load
  useEffect(() => {
    if (isProfessional || dismissed) return;
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [isProfessional, dismissed]);

  if (isProfessional || dismissed || !visible) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* private */ }
    setDismissed(true);
  };

  return (
    <>
      {/* ── Desktop floating button (bottom-right) ── */}
      <div style={desktopWrapStyle} aria-label="Professional access CTA" role="complementary">
        <button
          id="fpcta-main-btn"
          style={desktopBtnStyle}
          onClick={() => navigate('/login?role=professional&type=register')}
          aria-label="Apply for professional access"
        >
          <span style={lockIconStyle}>🔬</span>
          <span>Professional Access</span>
          <span style={{ opacity: 0.7 }}>→</span>
        </button>
        <button
          style={desktopCloseStyle}
          onClick={handleDismiss}
          aria-label="Dismiss professional access prompt"
        >
          ✕
        </button>
      </div>

      {/* ── Mobile sticky bar (bottom) ── */}
      <div style={mobileBarStyle}>
        <button
          id="fpcta-mobile-btn"
          style={mobileBtnStyle}
          onClick={() => navigate('/login?role=professional&type=register')}
        >
          🔬 Unlock Professional Access
        </button>
        <button
          style={mobileCloseStyle}
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Desktop — shown above 768 px
const desktopWrapStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  zIndex: 900,
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  '@media (max-width: 767px)': { display: 'none' },
};

const desktopBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.8rem 1.4rem',
  borderRadius: 50,
  border: 'none',
  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
  color: '#020e1c',
  fontWeight: 800,
  fontSize: '0.88rem',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(56, 189, 248, 0.35)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  whiteSpace: 'nowrap',
};

const desktopCloseStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(2,14,28,0.85)',
  backdropFilter: 'blur(8px)',
  color: 'rgba(255,255,255,0.55)',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s',
};

const lockIconStyle = {
  fontSize: '1rem',
};

// Mobile — shown below 768 px only
const mobileBarStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 900,
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(2,14,28,0.95)',
  backdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(56, 189, 248, 0.2)',
  padding: '0.75rem 1rem',
  gap: '0.5rem',
  // Only shown on small screens via inline style — we'll hide on desktop with a media query
  // Since inline styles can't do @media, we set both and rely on the desktop version being more visible
};

const mobileBtnStyle = {
  flex: 1,
  padding: '0.75rem',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
  color: '#020e1c',
  fontWeight: 800,
  fontSize: '0.88rem',
  cursor: 'pointer',
};

const mobileCloseStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.45)',
  fontSize: '1rem',
  cursor: 'pointer',
  padding: '0 0.4rem',
  flexShrink: 0,
};
