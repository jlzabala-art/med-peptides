'use client';

import React from 'react';
import { Sparkles, Zap, User, FileText, Activity, ShieldCheck } from '@/lib/icons';

/**
 * AIContextBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional context badge for all AI-powered modules in Atlas Health.
 * Standardizes:
 *  - AI Model tag (Gemini 2.5 Flash / Active Intelligence)
 *  - Active Context pill (showing the user what data is in the AI prompt)
 *  - Role-based theme accenting
 *  - Fully responsive on Mobile and Desktop
 * 
 * @param {string} title - Main AI feature title (e.g. "Clinical Scribe Copilot")
 * @param {string} subtitle - Secondary description or clinical intent
 * @param {string} contextPill - Explicit context label (e.g. "Patient: Carlos Méndez (48yo)")
 * @param {string} model - AI engine model tag (defaults to "Gemini 2.5 Flash")
 * @param {string} accentColor - Primary color accent (defaults to "#0d9488" for clinical)
 * @param {React.ReactNode} actions - Optional action buttons on header right
 */
export default function AIContextBadge({
  title = 'Atlas AI Intelligence',
  subtitle = null,
  contextPill = null,
  model = 'Gemini 2.5 Flash',
  accentColor = 'var(--color-primary, #0d9488)',
  actions = null
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      width: '100%'
    }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Icon + Title + Model Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${accentColor} 0%, #3b82f6 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                {title}
              </h3>
              {model && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(13, 148, 136, 0.1)',
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em'
                }}>
                  <Zap size={10} />
                  {model}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.76rem', color: 'var(--text-muted, #64748b)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Action buttons if any */}
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Context Awareness Pill (Golden Standard UX) */}
      {contextPill && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          color: '#334155',
          fontWeight: 600,
          alignSelf: 'flex-start',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }} />
          <span style={{ color: '#64748b', fontWeight: 500 }}>Active Context:</span>
          <span>{contextPill}</span>
        </div>
      )}
    </div>
  );
}
