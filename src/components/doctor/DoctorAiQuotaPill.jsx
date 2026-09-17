'use client';

import React from 'react';
import { Sparkles, Zap, AlertTriangle, ShieldCheck } from '@/lib/icons';

/**
 * DoctorAiQuotaPill
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact indicator displaying the physician's monthly AI allowance.
 */
export default function DoctorAiQuotaPill({
  quota,
  onOpenUpgrade,
  compact = false,
  style = {},
}) {
  if (!quota) return null;

  const { isPro, remaining, limit, used, isExceeded } = quota;

  if (isPro) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '0.2rem 0.6rem' : '0.35rem 0.75rem',
          borderRadius: '20px',
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 700,
          backgroundColor: '#f0fdfa',
          color: '#0f766e',
          border: '1px solid #99f6e4',
          userSelect: 'none',
          ...style,
        }}
        title="Your practice has unlimited access to Atlas AI Clinical Scribe & Copilot"
      >
        <Sparkles size={compact ? 12 : 14} color="#0d9488" />
        <span>Pro Plan • Unlimited AI</span>
      </div>
    );
  }

  // Basic tier with limit reached
  if (isExceeded || remaining === 0) {
    return (
      <button
        type="button"
        onClick={onOpenUpgrade}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '0.2rem 0.65rem' : '0.35rem 0.85rem',
          borderRadius: '20px',
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 800,
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          cursor: onOpenUpgrade ? 'pointer' : 'default',
          boxShadow: '0 1px 4px rgba(239, 68, 68, 0.15)',
          transition: 'all 0.15s ease',
          ...style,
        }}
        title="Monthly AI limit reached (5/5). Click to upgrade to Advanced Pro for unlimited access."
      >
        <AlertTriangle size={compact ? 13 : 15} color="#dc2626" />
        <span>Limit Reached ({used}/{limit}) • Upgrade to Pro ⚡</span>
      </button>
    );
  }

  // Basic tier with remaining queries
  const isLow = remaining <= 2;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: compact ? '0.2rem 0.65rem' : '0.35rem 0.8rem',
        borderRadius: '20px',
        fontSize: compact ? '0.72rem' : '0.78rem',
        fontWeight: 700,
        backgroundColor: isLow ? '#fffbeb' : '#f8fafc',
        color: isLow ? '#b45309' : '#475569',
        border: isLow ? '1px solid #fde68a' : '1px solid #e2e8f0',
        userSelect: 'none',
        ...style,
      }}
      title={`Free Basic Tier: ${remaining} of ${limit} clinical AI queries remaining this month`}
    >
      <Zap size={compact ? 12 : 14} color={isLow ? '#d97706' : '#64748b'} />
      <span>
        Basic Plan: <strong>{remaining} of {limit}</strong> AI queries left
      </span>
    </div>
  );
}
