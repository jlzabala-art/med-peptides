/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Zap } from 'lucide-react';

export default function StackSynergyWidget({ synergyScore = 85, compounds = [] }) {
  const getLevelColor = (score) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 75) return '#0284c7';
    return '#f59e0b';
  };

  const color = getLevelColor(synergyScore);

  return (
    <div style={{
      margin: '0.75rem 0',
      padding: '1rem',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: `1px solid ${color}20`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share2 size={16} color={color} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Stack Synergy Meter</span>
        </div>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 900,
          color: 'white',
          backgroundColor: color,
          padding: '0.2rem 0.5rem',
          borderRadius: '6px'
        }}>
          {synergyScore}%
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${synergyScore}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: color }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {compounds.map((c, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '8px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--color-text-secondary)'
          }}>
            <Zap size={10} color={color} />
            {c}
          </div>
        ))}
      </div>
      
      <p style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', marginTop: '0.8rem', fontStyle: 'italic', lineHeight: 1.4 }}>
        This score represents the theoretical research synergy between the identified compounds for the specified goal.
      </p>
    </div>
  );
}
