import { Mail } from '@/lib/icons';
import { Sparkles } from '@/lib/icons';
import { Check } from '@/lib/icons';
import { ChevronRight } from '@/lib/icons';
import { Brain } from '@/lib/icons';
import { Zap } from '@/lib/icons';
import { FlaskConical } from '@/lib/icons';
import { Moon } from '@/lib/icons';
import { RefreshCw } from '@/lib/icons';
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
const SUBSCRIBE_URL = `${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || 'https://europe-west1-med-peptides-app.cloudfunctions.net'}/newsletterSubscribe`;

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
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '820px', 
        margin: '0 auto', 
        padding: '1.75rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.04) 0%, rgba(2, 132, 199, 0.06) 100%)',
        border: '1px solid rgba(2, 132, 199, 0.18)',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '999px', 
            background: 'rgba(2, 132, 199, 0.1)', 
            color: '#0284c7', 
            fontSize: '0.72rem', 
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            <Mail size={13} /> Weekly Research Digest
          </div>
          <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
            {copy.headline}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.45 }}>
            Personalized peptide & longevity research delivered directly to your inbox every Monday.
          </p>
        </div>

        {/* Form or success */}
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                textAlign: 'center',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                maxWidth: '440px',
                margin: '0 auto',
              }}
            >
              <h3 style={{ margin: '0 0 0.25rem', color: '#15803d', fontSize: '0.95rem', fontWeight: 800 }}>
                ✓ Subscribed Successfully
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                You will receive your first personalized digest next Monday.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                alignItems: 'center',
              }}
            >
              <div style={{
                display: 'flex', width: '100%', maxWidth: 440,
                gap: '0.5rem', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '999px',
                      border: `1.5px solid ${errorMsg ? 'var(--color-danger)' : 'rgba(0, 54, 102, 0.15)'}`,
                      background: 'var(--surface)',
                      color: 'var(--text-main)',
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
                    padding: '0.65rem 1.4rem',
                    borderRadius: '999px', border: 'none',
                    background: 'var(--primary, #003666)',
                    color: 'white',
                    fontWeight: 700, fontSize: '0.875rem',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0, 54, 102, 0.15)',
                    transition: 'all 0.2s'
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
                margin: 0, fontSize: '0.72rem',
                color: 'var(--text-muted)',
                opacity: 0.8
              }}>
                No spam · Unsubscribe anytime · Free weekly access
              </p>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}