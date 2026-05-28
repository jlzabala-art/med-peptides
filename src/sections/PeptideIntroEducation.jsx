/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'hide_peptide_intro';

/**
 * Phase 4 — Beginner Education Section
 * "New to Peptides? Start Here"
 * Shown only to guest users. Dismissible via localStorage.
 */
export default function PeptideIntroEducation({ isProfessional = false }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isProfessional) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, [isProfessional]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible || isProfessional) return null;

  return (
    <section style={styles.section} aria-label="Beginner peptide education">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={styles.dismissBtn}
        aria-label="Hide this section"
        title="Hide this section"
      >
        ✕
      </button>

      {/* Accent bar */}
      <div style={styles.accentBar} />

      <div style={styles.inner}>
        {/* Icon + Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary, #4f9cf9)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p style={styles.eyebrow}>STARTING POINT</p>
            <h2 style={styles.title}>New to Peptides? Start Here</h2>
          </div>
        </div>

        {/* Body layout */}
        <div style={styles.body}>
          {/* Explanation */}
          <p style={styles.description}>
            Peptides are short chains of amino acids — biological molecules studied for their role in{' '}
            <strong>metabolism</strong>, <strong>recovery</strong>, and{' '}
            <strong>cellular signaling</strong>. Understanding the basics helps you navigate the
            catalog with confidence.
          </p>

          {/* Bullet highlights */}
          <ul style={styles.bullets}>
            {[
              { icon: '🔬', text: 'Naturally occurring molecules with targeted action' },
              { icon: '📋', text: 'Each compound comes with protocol documentation' },
              { icon: '🧮', text: 'Use our calculator to plan dosing for research' },
            ].map(({ icon, text }) => (
              <li key={text} style={styles.bulletItem}>
                <span style={styles.bulletIcon}>{icon}</span>
                <span style={styles.bulletText}>{text}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div style={styles.ctaGroup}>
            <button
              style={styles.btnPrimary}
              onClick={() => navigate('/what-are-peptides')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={styles.btnIcon}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Learn the Basics
            </button>

            <button
              style={styles.btnSecondary}
              onClick={() => navigate('/reconstitution-guide')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={styles.btnIcon}>
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
              </svg>
              Reconstitution Guide
            </button>

            <button
              style={styles.btnOutline}
              onClick={() => navigate('/protocols?level=beginner')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={styles.btnIcon}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Browse Beginner Protocols
            </button>
          </div>
        </div>

        {/* Dismiss text link */}
        <div style={styles.dismissRow}>
          <button onClick={handleDismiss} style={styles.dismissLink}>
            Hide this section
          </button>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: 'relative',
    background: '#1a1f2e',
    border: '1px solid rgba(79,156,249,0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    margin: '0 auto 2rem',
    maxWidth: '960px',
    padding: '0',
  },
  accentBar: {
    height: '4px',
    background: 'linear-gradient(90deg, var(--primary, #4f9cf9), #7c5cf9)',
    width: '100%',
  },
  inner: {
    padding: '2rem 2.5rem 1.5rem',
  },
  dismissBtn: {
    position: 'absolute',
    top: '14px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted, #6b7280)',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
    zIndex: 2,
    transition: 'color 0.2s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  iconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: 'rgba(79,156,249,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: 'var(--primary, #4f9cf9)',
    fontWeight: 700,
    margin: '0 0 4px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text, #f1f5f9)',
    margin: 0,
    lineHeight: 1.2,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  description: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: 'var(--text-muted, #94a3b8)',
    margin: 0,
    maxWidth: '640px',
  },
  bullets: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  bulletIcon: {
    fontSize: '1.1rem',
    lineHeight: 1,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted, #94a3b8)',
    lineHeight: 1.5,
  },
  ctaGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  btnBase: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s',
    border: 'none',
    textDecoration: 'none',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    background: 'var(--primary, #4f9cf9)',
    color: 'var(--color-bg-surface)',
    border: 'none',
    transition: 'opacity 0.2s',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    background: 'rgba(124,92,249,0.12)',
    color: '#a78bfa',
    border: '1px solid rgba(124,92,249,0.3)',
    transition: 'opacity 0.2s',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--text-muted, #94a3b8)',
    border: '1px solid rgba(148,163,184,0.2)',
    transition: 'opacity 0.2s',
  },
  btnIcon: {
    flexShrink: 0,
  },
  dismissRow: {
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
  },
  dismissLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    transition: 'color 0.2s',
  },
};
