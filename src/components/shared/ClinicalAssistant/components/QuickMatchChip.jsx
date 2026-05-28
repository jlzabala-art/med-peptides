/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';

export default function QuickMatchChip({ quickMatch, onDismiss, onAdd, isLoading, isTyping }) {
  if (!quickMatch || isLoading || isTyping) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      style={{
        padding: '0.75rem 1rem',
        background: '#f0f9ff',
        borderTop: '1px solid #bae6fd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ background: 'white', color: '#0ea5e9', padding: '6px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
          <FlaskConical size={14} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
          Ready to synthesize {quickMatch.name}?
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={onDismiss}
          style={{ padding: '0.4rem 0.8rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
        >
          Dismiss
        </button>
        <button 
          onClick={onAdd}
          style={{ padding: '0.4rem 0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Add to Research
        </button>
      </div>
    </motion.div>
  );
}
