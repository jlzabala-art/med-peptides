import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function ContextActionCards({ cards = [], onActionClick }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div style={{
      padding: '0.6rem 0.9rem',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      backgroundColor: 'rgba(248, 250, 252, 0.75)',
      backdropFilter: 'blur(8px)',
      flexShrink: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '0.45rem'
      }}>
        <Zap size={11} color="#3b82f6" />
        <span>Quick Context Actions</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: cards.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.45rem'
      }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id || i}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.15 }}
              onClick={() => onActionClick(card.id, card.label, card.prompt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                minHeight: '38px',
                width: '100%',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `var(--color-${card.color}-400, #3b82f6)`;
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {Icon && (
                <div style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: `var(--color-${card.color}-50, #eff6ff)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={13} color={`var(--color-${card.color}-600, #2563eb)`} />
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {card.label}
                </div>
                {card.desc && (
                  <div style={{
                    fontSize: '0.62rem',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.15
                  }}>
                    {card.desc}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
