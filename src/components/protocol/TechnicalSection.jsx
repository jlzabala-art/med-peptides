/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChevronDown, Beaker, ShieldCheck, Zap } from 'lucide-react';

/**
 * TechnicalSection Component
 * 
 * Renders clinical technical data using Tabs on Desktop and Accordions on Mobile.
 * Designed for Peptides and Supplements technical sections.
 */
const TechnicalSection = ({ title, items = [], icon: Icon = Beaker }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-primary, #22d3ee)' }}>
          <Icon size={24} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary, #ffffff)', letterSpacing: '-0.025em', margin: 0 }}>{title}</h2>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item, idx) => (
            <AccordionItem 
              key={item.peptide_id || item.id || idx}
              item={item}
              isOpen={activeIndex === idx}
              onClick={() => setActiveIndex(activeIndex === idx ? -1 : idx)}
            />
          ))}
        </div>
      ) : (
        <div style={{ borderRadius: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            {items.map((item, idx) => (
              <button
                key={item.peptide_id || item.id || idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeIndex === idx ? 'var(--color-primary, #22d3ee)' : 'var(--color-text-secondary, #9ca3af)'
                }}
              >
                {item.name}
                {activeIndex === idx && (
                  <motion.div 
                    layoutId="activeTab"
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: 'var(--color-primary, #22d3ee)' }}
                  />
                )}
              </button>
            ))}
          </div>
          <div style={{ padding: '2rem', minHeight: '300px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TechnicalDetails item={items[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div style={{
      borderRadius: '0.75rem',
      border: isOpen ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s'
    }}>
      <button 
        onClick={onClick}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontWeight: '600', color: isOpen ? 'var(--color-primary, #22d3ee)' : 'var(--color-text-secondary, #e5e7eb)' }}>
          {item.name}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={20} style={{ color: 'var(--color-text-tertiary, #6b7280)' }} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0.5rem 1.25rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <TechnicalDetails item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TechnicalDetails = ({ item }) => {
  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary, #06b6d4)', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
            <Zap size={14} /> Mecanismo de Acción
          </h4>
          <p style={{ color: 'var(--color-text-secondary, #d1d5db)', fontSize: '0.875rem', lineHeight: '1.625', margin: 0 }}>
            {item.rationale || "Información clínica en proceso de actualización por el equipo médico."}
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary, #6b7280)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Vía de Adm.</div>
            <div style={{ color: 'var(--color-info-text, #cffafe)', fontSize: '0.875rem' }}>{item.route_term}</div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary, #6b7280)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Vida Media (Rec)</div>
            <div style={{ color: 'var(--color-info-text, #cffafe)', fontSize: '0.875rem' }}>{item.post_reconstitution_half_life} días</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-success, #10b981)', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
            <ShieldCheck size={14} /> Consideraciones Clinics
          </h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary, #9ca3af)', margin: 0, padding: 0, listStyle: 'none' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-success, #10b981)' }}>•</span>
              Mantener refrigerado entre 2-8°C tras su reconstitución.
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-success, #10b981)' }}>•</span>
              Evitar la exposición directa a la luz solar.
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-success, #10b981)' }}>•</span>
              No agitar el vial; realizar movimientos circulares suaves.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSection;
