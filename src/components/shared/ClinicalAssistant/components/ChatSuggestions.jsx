/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

export default function ChatSuggestions({ suggestions, onSelect, isLoading, isTyping }) {
  if (!suggestions || suggestions.length === 0 || isLoading || isTyping) return null;

  return (
    <div style={{ 
      padding: '0.75rem 1.25rem', 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '0.5rem',
      backgroundColor: 'var(--color-bg-app)',
      borderTop: '1px solid rgba(0,0,0,0.02)'
    }}>
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(s)}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: 'white',
            border: '1.5px solid #e2e8f0',
            color: 'var(--color-text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.02)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}
