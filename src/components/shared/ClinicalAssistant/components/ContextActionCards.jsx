import React from 'react';
import { motion } from 'framer-motion';

export default function ContextActionCards({ cards = [], onActionClick }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.5)' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
        Screen Actions (AI)
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onActionClick(card.id, card.label, card.prompt)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `var(--color-${card.color}-400, #94a3b8)`;
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {Icon && <Icon size={14} color={`var(--color-${card.color}-500, #3b82f6)`} />}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', lineHeight: 1.1 }}>{card.label}</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{card.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
