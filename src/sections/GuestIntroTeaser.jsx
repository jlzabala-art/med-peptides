/* eslint-disable no-unused-vars */
/**
 * GuestIntroTeaser
 * ─────────────────────────────────────────────────────────────────────────────
 * A dismissible educational teaser shown only to unauthenticated visitors.
 *
 * Logic:
 *  - Reads localStorage "hide_peptide_intro" on mount.
 *  - If truthy → renders nothing (user dismissed it before).
 *  - "Dismiss" button writes the flag and hides the banner immediately.
 *  - "Learn more" button navigates to /what-are-peptides.
 *
 * Design constraints:
 *  - No new font/library dependencies.
 *  - Uses existing CSS design tokens only.
 *  - Lightweight: ~4 KB, zero heavy assets.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, X, Dna, Zap, ShieldCheck } from 'lucide-react';
import './GuestIntroTeaser.css';

const HIGHLIGHTS = [
  { Icon: Dna,         label: 'What they are',      sub: "Short amino-acid chains \u2014 nature\u2019s messengers" },
  { Icon: Zap,         label: 'How they work',       sub: 'Bind receptors and trigger biological signals' },
  { Icon: ShieldCheck, label: 'Research & Safety',   sub: 'Quality sourcing and purity standards explained' },
];

const DISMISS_KEY = 'hide_peptide_intro';

export default function GuestIntroTeaser() {
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState(() => {
    try { return !!localStorage.getItem(DISMISS_KEY); }
    catch { return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* private mode */ }
    setDismissed(true);
  };

  return (
    <>
      <div className="git-inner">

        {/* ── Header row ── */}
        <div className="git-header">
          <span className="git-eyebrow">
            <BookOpen size={13} aria-hidden="true" />
            New to peptides?
          </span>
          <button
            className="git-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss introduction banner"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Headline ── */}
        <h2 className="git-title">
          Understand peptides before you explore the catalog
        </h2>
        <p className="git-sub">
          Peptides are short chains of amino acids that act as biological
          messengers. Our free guide explains what they are, how they work,
          and how to source them safely for research.
        </p>

        {/* ── Highlights ── */}
        <ul className="git-highlights" role="list">
          {HIGHLIGHTS.map(({ Icon, label, sub }) => (
            <li key={label} className="git-highlight">
              <div className="git-highlight__icon" aria-hidden="true">
                <Icon size={18} />
              </div>
              <div>
                <div className="git-highlight__label">{label}</div>
                <div className="git-highlight__sub">{sub}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Actions ── */}
        <div className="git-actions">
          <button
            className="git-btn git-btn--primary"
            onClick={() => navigate('/what-are-peptides')}
          >
            Read the beginner's guide
            <ArrowRight size={15} aria-hidden="true" />
          </button>
          <button
            className="git-btn git-btn--ghost"
            onClick={handleDismiss}
          >
            I already know — skip
          </button>
        </div>

      </div>
    </>
  );
}
