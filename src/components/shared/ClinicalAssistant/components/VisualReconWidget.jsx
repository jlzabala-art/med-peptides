import Droplets from "lucide-react/dist/esm/icons/droplets";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import Pipette from "lucide-react/dist/esm/icons/pipette";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Snowflake from "lucide-react/dist/esm/icons/snowflake";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';








export default function VisualReconWidget({ 
  peptideName = "Peptide", 
  vialMg = 5, 
  waterMl = 2, 
  dosageMcg = 250,
  language = 'en'
}) {
  const [currentVialMg, setCurrentVialMg] = useState(vialMg);
  const [currentWaterMl, setCurrentWaterMl] = useState(waterMl);
  const [currentDosageMcg, setCurrentDosageMcg] = useState(dosageMcg);
  const [units, setUnits] = useState(0);
  const isSpanish = language === 'es' || (typeof window !== 'undefined' && window.location.pathname.includes('/es'));

  useEffect(() => {
    // Reset state if props change
    setCurrentVialMg(vialMg);
    setCurrentWaterMl(waterMl);
    setCurrentDosageMcg(dosageMcg);
  }, [vialMg, waterMl, dosageMcg]);

  useEffect(() => {
    const calculatedUnits = (currentDosageMcg * currentWaterMl) / (currentVialMg * 10);
    setUnits(Math.round(calculatedUnits * 10) / 10);
  }, [currentVialMg, currentWaterMl, currentDosageMcg]);

  const syringeFillPercentage = Math.min((units / 100) * 100, 100);

  const steps = [
    { 
      icon: <Snowflake size={14} />, 
      label: isSpanish ? 'Prep' : 'Prep',
      desc: isSpanish ? 'Vial a temp. ambiente' : 'Vial at room temp'
    },
    { 
      icon: <Pipette size={14} />, 
      label: isSpanish ? 'Mix' : 'Mix',
      desc: isSpanish ? 'Inyectar BAC lento' : 'Inject BAC slowly'
    },
    { 
      icon: <CheckCircle2 size={14} />, 
      label: isSpanish ? 'Store' : 'Store',
      desc: isSpanish ? 'Refrigerar siempre' : 'Always refrigerate'
    }
  ];

  const stepperBtnStyle = {
    border: '1px solid #cbd5e1',
    background: 'white',
    color: 'var(--color-text-secondary)',
    borderRadius: '6px',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s'
  };

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1.25rem',
      backgroundColor: 'var(--color-bg-app)',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.4rem', backgroundColor: 'rgba(0,75,135,0.1)', borderRadius: '8px' }}>
            <Beaker size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {isSpanish ? 'Guía Visual de Reconstitución' : 'Visual Reconstitution Guide'}
          </span>
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(0,75,135,0.05)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
          {peptideName}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isSpanish ? 'AJUSTAR CALCULADORA' : 'ADJUST CALCULATOR'}
          </div>
          {/* Vial Mg control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{isSpanish ? 'Vial' : 'Vial'}: <strong>{currentVialMg}mg</strong></div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setCurrentVialMg(prev => Math.max(1, prev - 1))} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >-</button>
              <button 
                onClick={() => setCurrentVialMg(prev => prev + 1)} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >+</button>
            </div>
          </div>

          {/* BAC Water control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{isSpanish ? 'Agua BAC' : 'BAC Water'}: <strong>{currentWaterMl}ml</strong></div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setCurrentWaterMl(prev => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >-</button>
              <button 
                onClick={() => setCurrentWaterMl(prev => Math.round((prev + 0.5) * 10) / 10)} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >+</button>
            </div>
          </div>

          {/* Dosage Mcg control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{isSpanish ? 'Dosis' : 'Target'}: <strong>{currentDosageMcg}mcg</strong></div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setCurrentDosageMcg(prev => Math.max(50, prev - 50))} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >-</button>
              <button 
                onClick={() => setCurrentDosageMcg(prev => prev + 50)} 
                style={stepperBtnStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >+</button>
            </div>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          height: '100%'
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{units}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginTop: '0.2rem', textAlign: 'center' }}>
            {isSpanish ? 'Unidades IU' : 'IU Units'}
          </div>
        </div>
      </div>

      {/* Syringe Graphic */}
      <div style={{ position: 'relative', marginTop: '0.5rem' }}>
        <div style={{ position: 'relative', height: '36px', width: '100%', backgroundColor: 'var(--color-bg-surface)', borderRadius: '6px', border: '2px solid #cbd5e1', overflow: 'hidden' }}>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(tick => (
            <div key={tick} style={{ 
              position: 'absolute', 
              left: `${tick}%`, 
              top: 0, bottom: 0, 
              width: '1px', 
              backgroundColor: '#f1f5f9',
              zIndex: 1
            }} />
          ))}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${syringeFillPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: 'rgba(0,75,135,0.15)',
              borderRight: '3px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '6px'
            }}
          >
            <Droplets size={12} color="var(--primary)" opacity={0.6} />
          </motion.div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', padding: '0 4px' }}>
          <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>0 IU</span>
          <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>50 IU</span>
          <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>100 IU</span>
        </div>
      </div>

      {/* Steps Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
              {step.icon}
              <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>{step.label}</span>
            </div>
            <span style={{ fontSize: '0.55rem', color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>{step.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '0.2rem', 
        padding: '0.6rem', 
        backgroundColor: 'rgba(0,0,0,0.02)', 
        borderRadius: '10px',
        border: '1px dashed #e2e8f0'
      }}>
        <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--color-text-tertiary)', lineHeight: 1.4, textAlign: 'center' }}>
          {isSpanish 
            ? '* Calculado para jeringa estándar de 100 unidades (1ml). Verifique siempre antes de investigar.' 
            : '* Calculated for standard 100-unit (1ml) insulin syringe. Always double-check before research.'}
        </p>
      </div>
    </div>
  );
}
