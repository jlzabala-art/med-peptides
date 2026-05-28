/* eslint-disable no-unused-vars */
/**
 * GuestWelcomeBack.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Personalized welcome-back banner for returning guest users.
 * Shown INSTEAD of the default GuestModeBanner when prefs exist.
 *
 * Features:
 * - Greets user with their research goal + level
 * - Shows focus area badges
 * - CTA → opens ClinicalAI pre-seeded with their goal query
 * - Edit button → clears cookie and re-shows the preference widget
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, Bot } from 'lucide-react';
import useGuestPreferences, { GOAL_META, LEVEL_META, PREFERENCE_OPTIONS } from '../hooks/useGuestPreferences';

export default function GuestWelcomeBack() {
  const { prefs, goalMeta, levelMeta, clearPrefs, isReturning, hasCompleted } = useGuestPreferences();

  if (!isReturning || !hasCompleted) return null;

  const areaLabels = (prefs?.preferences || [])
    .map(id => PREFERENCE_OPTIONS.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const handleOpenAI = () => {
    const query = goalMeta?.aiPrompt || `Tell me about ${goalMeta?.label} research`;
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query, autoSend: true },
      })
    );
  };

  const goalColor = goalMeta?.color || '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
      style={{
        width: '100%',
        background: `linear-gradient(135deg, ${goalColor}10 0%, rgba(99,102,241,0.06) 100%)`,
        borderBottom: `1px solid ${goalColor}25`,
        padding: '0.75rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${goalColor}20`,
              border: `1.5px solid ${goalColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}
          >
            {goalMeta?.icon}
          </div>

          <div>
            <div style={{
              fontSize: '0.82rem', fontWeight: 800,
              color: 'var(--text, #0f172a)',
              letterSpacing: '-0.01em',
            }}>
              Welcome back — <span style={{ color: goalColor }}>{goalMeta?.label}</span> researcher
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              marginTop: '0.2rem', flexWrap: 'wrap',
            }}>
              {/* Level badge */}
              {levelMeta && (
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'rgba(100,116,139,0.9)',
                  padding: '0.1rem 0.5rem',
                  background: 'rgba(100,116,139,0.08)',
                  border: '1px solid rgba(100,116,139,0.15)',
                  borderRadius: 100,
                }}>
                  {levelMeta.icon} {levelMeta.label}
                </span>
              )}
              {/* Area badges */}
              {areaLabels.map(area => (
                <span
                  key={area.id}
                  style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    color: `${goalColor}cc`,
                    padding: '0.1rem 0.5rem',
                    background: `${goalColor}10`,
                    border: `1px solid ${goalColor}22`,
                    borderRadius: 100,
                  }}
                >
                  {area.icon} {area.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Edit preferences */}
          <motion.button
            onClick={clearPrefs}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            title="Reset my preferences"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              border: '1px solid rgba(100,116,139,0.2)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 600,
              color: 'rgba(100,116,139,0.8)',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={11} /> Edit
          </motion.button>

          {/* Open ClinicalAI with goal query */}
          <motion.button
            onClick={handleOpenAI}
            whileHover={{ scale: 1.04, boxShadow: `0 4px 16px ${goalColor}35` }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 1rem',
              borderRadius: 8,
              border: 'none',
              background: `linear-gradient(135deg, ${goalColor}, ${goalColor}cc)`,
              cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 800,
              color: 'white',
              transition: 'all 0.2s',
              boxShadow: `0 2px 10px ${goalColor}30`,
            }}
          >
            <Bot size={13} strokeWidth={2.5} />
            Ask ClinicalAI
            <ChevronRight size={12} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
