import Mail from "lucide-react/dist/esm/icons/mail";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Brain from "lucide-react/dist/esm/icons/brain";
import Zap from "lucide-react/dist/esm/icons/zap";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Moon from "lucide-react/dist/esm/icons/moon";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
/* eslint-disable no-unused-vars */
/**
 * HealthNewsletterSection.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium guest newsletter registration section.
 * Offers weekly AI-personalized health tips in exchange for email.
 *
 * Features:
 * - Pre-fills goal/level from cookie preferences
 * - Calls `newsletterSubscribe` Cloud Function on submit
 * - Shows personalized value prop based on their goal
 * - 3 states: idle → loading → success
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';









import useGuestPreferences, { GOAL_META } from '../hooks/useGuestPreferences';

// ── Cloud Function URL ────────────────────────────────────────────────────────
const SUBSCRIBE_URL = `${import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://europe-west1-med-peptides-app.cloudfunctions.net'}/newsletterSubscribe`;

// ── Goal-specific copy ────────────────────────────────────────────────────────
const GOAL_COPY = {
  recovery:    { headline: 'Your weekly Recovery protocol digest',   examples: ['BPC-157 dosing updates', 'Tissue repair research', 'Recovery stack tips'] },
  longevity:   { headline: 'Your weekly Longevity research digest',  examples: ['Senolytic research',     'NAD+ pathway insights', 'Epigenetic protocols'] },
  cognitive:   { headline: 'Your weekly Cognitive enhancement digest',examples: ['Nootropic stacks',     'Neural peptide research','Focus & clarity tips'] },
  sleep:       { headline: 'Your weekly Sleep optimization digest',  examples: ['DSIP & Selank research', 'Circadian rhythm tips', 'Sleep protocol guides'] },
  metabolic:   { headline: 'Your weekly Metabolic health digest',    examples: ['GLP-1 research updates', 'Insulin sensitivity',   'Body composition tips'] },
  performance: { headline: 'Your weekly Performance research digest',examples: ['Growth hormone stacks', 'Muscle recovery peptides','ATP optimization'] },
  hormonal:    { headline: 'Your weekly Hormonal balance digest',    examples: ['HRT research updates',   'Testosterone protocols', 'Thyroid support tips'] },
  default:     { headline: 'Your weekly Health research digest',     examples: ['Peptide research news',  'Protocol updates',       'Longevity insights'] },
};

// ── Value prop bullets ─────────────────────────────────────────────────────────
const VALUE_BULLETS = [
  { icon: <FlaskConical size={14} />, text: 'Research summaries in plain language' },
  { icon: <Brain size={14} />,        text: 'Personalized to your health goals' },
  { icon: <Zap size={14} />,          text: 'Protocol tips matched to your level' },
];

// ── Email validation ──────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Main component ────────────────────────────────────────────────────────────

export default function HealthNewsletterSection() {
  const { prefs, goalMeta } = useGuestPreferences();
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [errorMsg,setErrorMsg]= useState('');

  const goal = prefs?.goal || 'default';
  const copy = GOAL_COPY[goal] || GOAL_COPY.default;
  const goalColor = goalMeta?.color || '#6366f1';
  const goalIcon  = goalMeta?.icon  || '🧬';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setStatus('loading');

    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          preferences: {
            goal:  prefs?.goal  || null,
            level: prefs?.level || null,
            areas: prefs?.areas || [],
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setStatus('success'); // Already subscribed — still show success
          return;
        }
        throw new Error(data.error || 'Subscription failed');
      }

      setStatus('success');
    } catch (err) {
      console.error('[Newsletter]', err);
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div
      className="container"
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Newsletter subscription"
    >
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '0 0.5rem' }}>

        {/* Header Block using global classes */}
        <div className="section-header" style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: '#1a73e8', borderColor: '#1a73e830', background: '#1a73e815', borderRadius: '4px' }}>
            Weekly Research Digest
          </div>
          <h2 className="section-title" style={{ color: 'white', fontWeight: 650, fontSize: '1.8rem', letterSpacing: '-0.02em', marginTop: '0.75rem' }}>
            {copy.headline}
          </h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Personalized to your research goals — curated by AI, delivered every Monday
          </p>
        </div>

        {/* What you get */}
        <div
          style={{
            display: 'flex', justifyContent: 'center',
            gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap',
          }}
        >
          {copy.examples.map((ex, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', fontWeight: 550,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              <div style={{
                width: 14, height: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Check size={12} color="#1a73e8" strokeWidth={3} />
              </div>
              {ex}
            </div>
          ))}
        </div>

        {/* Form or success */}
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                textAlign: 'center',
                padding: '2rem',
                borderRadius: '4px',
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.2)',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '4px',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Check size={20} color="var(--color-success)" strokeWidth={2.5} />
              </div>
              <h3 style={{ margin: '0 0 0.4rem', color: 'white', fontSize: '1.05rem', fontWeight: 700 }}>
                Subscribed Successfully
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>
                Your email has been registered. You will receive your first personalized digest next Monday.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <div style={{
                display: 'flex', width: '100%', maxWidth: 480,
                gap: '0.5rem', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      border: `1px solid ${errorMsg ? 'var(--color-danger)' : 'var(--color-text-primary)'}`,
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    aria-label="Email address"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '4px', border: 'none',
                    background: status === 'loading' ? 'var(--color-text-primary)' : '#1a73e8',
                    color: 'white',
                    fontWeight: 600, fontSize: '0.875rem',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    boxShadow: 'none',
                  }}
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>

              {errorMsg && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                  {errorMsg}
                </p>
              )}

              <p style={{
                margin: 0, fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
              }}>
                No spam · Unsubscribe anytime · No account required
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Value bullets row */}
        <div
          style={{
            display: 'flex', justifyContent: 'center', gap: '2rem',
            marginTop: '2.5rem', flexWrap: 'wrap',
          }}
        >
          {VALUE_BULLETS.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
              }}
            >
              <span style={{ display: 'inline-flex', color: '#1a73e8' }}>{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}