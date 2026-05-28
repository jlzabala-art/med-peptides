/* eslint-disable no-unused-vars */
/**
 * SmartEmptyState — Phase 8
 * Replaces raw 0-value cards with contextual, intelligent messages.
 * Makes the dashboard feel strategic rather than empty.
 */

import { Lightbulb } from 'lucide-react';

export default function SmartEmptyState({ message, hint, icon: Icon = Lightbulb }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1.5rem 1rem',
        gap: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1.5px dashed var(--border)',
        backgroundColor: 'rgba(0,0,0,0.01)',
      }}
    >
      <Icon size={20} style={{ color: 'var(--text-light)', opacity: 0.5 }} />
      <p
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-light)',
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.5,
          maxWidth: '240px',
          fontStyle: 'italic',
        }}
      >
        {message}
      </p>
      {hint && (
        <p
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-light)',
            opacity: 0.6,
            margin: 0,
            lineHeight: 1.4,
            maxWidth: '220px',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
