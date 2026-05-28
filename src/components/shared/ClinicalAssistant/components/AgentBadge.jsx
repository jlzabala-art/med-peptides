/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

// ── Agent Registry ────────────────────────────────────────────────────────────
// Maps backend agentName → display config
const AGENT_REGISTRY = {
  AgentRAG: {
    label:  'Research AI',
    icon:   '🔬',
    color:  '#6366f1',
    bg:     'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.18)',
  },
  AgentPersonalization: {
    label:  'Your Guide',
    icon:   '👋',
    color:  'var(--color-success)',
    bg:     'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
  },
  AgentDoctor: {
    label:  'Clinical AI',
    icon:   '🏥',
    color:  '#0ea5e9',
    bg:     'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.18)',
  },
  AgentFinance: {
    label:  'Finance AI',
    icon:   '💰',
    color:  '#f59e0b',
    bg:     'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
  },
  AgentPrescription: {
    label:  'Rx Analyzer',
    icon:   '📋',
    color:  '#14b8a6',
    bg:     'rgba(20,184,166,0.08)',
    border: 'rgba(20,184,166,0.18)',
  },
  AgentSafety: {
    label:  'Compliance',
    icon:   '🛡️',
    color:  'var(--color-text-secondary)',
    bg:     'rgba(100,116,139,0.06)',
    border: 'rgba(100,116,139,0.15)',
  },
  // Default / unknown
  default: {
    label:  'Research AI',
    icon:   '🔬',
    color:  '#6366f1',
    bg:     'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.18)',
  },
};

/**
 * AgentBadge — Small pill that identifies which AI agent produced a message.
 *
 * @param {string}  agentName  - Backend agent identifier (e.g. "AgentRAG")
 * @param {boolean} animated   - Whether to animate in (default: true)
 * @param {'sm'|'md'} size     - Badge size (default: 'sm')
 */
export default function AgentBadge({ agentName, animated = true, size = 'sm' }) {
  if (!agentName) return null;

  const config = AGENT_REGISTRY[agentName] || AGENT_REGISTRY.default;
  const isMd   = size === 'md';

  const badge = (
    <div
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            isMd ? '0.35rem' : '0.25rem',
        padding:        isMd ? '0.25rem 0.6rem' : '0.15rem 0.45rem',
        borderRadius:   '100px',
        border:         `1px solid ${config.border}`,
        backgroundColor: config.bg,
        width:          'fit-content',
      }}
    >
      <span style={{ fontSize: isMd ? '0.75rem' : '0.62rem', lineHeight: 1 }}>
        {config.icon}
      </span>
      <span
        style={{
          fontSize:   isMd ? '0.68rem' : '0.58rem',
          fontWeight: 700,
          color:      config.color,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {config.label}
      </span>
    </div>
  );

  if (!animated) return badge;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'inline-block' }}
    >
      {badge}
    </motion.div>
  );
}

// Export registry for other components
export { AGENT_REGISTRY };
