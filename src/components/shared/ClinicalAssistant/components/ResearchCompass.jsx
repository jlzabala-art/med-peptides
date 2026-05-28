/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Brain, Clock, Shield, Target } from 'lucide-react';

const RESEARCH_PATHS = [
  { id: 'recovery', label: 'Injury & Recovery', icon: <Zap size={15} />, color: '#f59e0b', prompt: 'I want to research peptides for injury recovery and tissue repair.' },
  { id: 'longevity', label: 'Longevity & Aging', icon: <Clock size={15} />, color: 'var(--color-success)', prompt: 'Tell me about the most studied peptides for longevity and anti-aging research.' },
  { id: 'cognitive', label: 'Cognitive Focus', icon: <Brain size={15} />, color: 'var(--color-primary)', prompt: 'Show me research peptides related to cognitive enhancement and focus.' },
  { id: 'metabolic', label: 'Metabolic Health', icon: <Target size={15} />, color: 'var(--color-danger)', prompt: 'I am researching metabolic health and weight management compounds.' },
  { id: 'immune', label: 'Immune Support', icon: <Shield size={15} />, color: '#8b5cf6', prompt: 'What peptides are relevant to immune system modulation research?' },
  { id: 'performance', label: 'Athletic Research', icon: <Heart size={15} />, color: '#ec4899', prompt: 'Show me compounds commonly used in athletic performance research.' },
];

export default function ResearchCompass({ onSelect }) {
  return (
    <div style={{ marginTop: '0.2rem', marginBottom: '0.2rem' }}>
      <div style={{
        fontSize: '0.6rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-secondary)',
        marginBottom: '0.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
        <div style={{ width: '10px', height: '1.5px', background: 'var(--primary)' }} />
        Select Research Compass Path
      </div>
      
      {/* Main Research Paths */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {RESEARCH_PATHS.map((path, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,75,135,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(path.prompt)}
            style={{
              padding: '0.75rem 0.85rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.4rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: `${path.color}12`,
              color: path.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {path.icon}
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.15
            }}>{path.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Trending Chips */}
      <div style={{ marginTop: '0.8rem' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Trending Research</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['BPC-157', 'TB-500', 'Tirzepatide', 'Longevity', 'Fat Loss', 'Recovery'].map((term, idx) => (
            <motion.button
              key={idx}
              whileHover={{ backgroundColor: 'rgba(0,75,135,0.06)', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(`Tell me about ${term} research`)}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '0.64rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {term}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
