import Calendar from "lucide-react/dist/esm/icons/calendar";
import Clock from "lucide-react/dist/esm/icons/clock";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';




export default function ProtocolTimeline({ phases = [] }) {
  return (
    <div style={{
      margin: '1.25rem 0',
      padding: '1.25rem',
      backgroundColor: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <Calendar size={18} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Protocol Research Timeline</span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '4px',
          top: '0',
          bottom: '0',
          width: '2px',
          backgroundColor: 'var(--color-border)'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {phases.map((phase, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ position: 'relative' }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: '-1.5rem',
                top: '4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: phase.color || 'var(--primary)',
                border: '2px solid white',
                boxShadow: '0 0 0 2px #e2e8f0',
                zIndex: 2
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    color: phase.color || 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {phase.duration || `Phase ${i + 1}`}
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{phase.title}</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{phase.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}