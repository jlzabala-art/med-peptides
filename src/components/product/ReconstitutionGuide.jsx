/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Beaker, Info, RefreshCw, Calculator, HelpCircle } from 'lucide-react';

export default function ReconstitutionGuide({ product, selectedVariant }) {
  const [diluent, setDiluent] = useState(2); // ml of Bacteriostatic Water
  const [desiredDose, setDesiredDose] = useState(250); // mcg target dose
  const [syringeType, setSyringeType] = useState('1.0ml'); // 0.3ml, 0.5ml, 1.0ml

  const vialMg = useMemo(() => {
    const dosage = selectedVariant?.dosage || selectedVariant?.strength || product?.dosage || '5mg';
    return parseFloat(dosage.replace(/[^0-9.]/g, '')) || 5;
  }, [selectedVariant, product]);

  const syringeConfig = useMemo(() => {
    switch (syringeType) {
      case '0.3ml': return { maxUnits: 30, capacityMl: 0.3, label: '30 U (0.3 ml)' };
      case '0.5ml': return { maxUnits: 50, capacityMl: 0.5, label: '50 U (0.5 ml)' };
      case '1.0ml': 
      default:
        return { maxUnits: 100, capacityMl: 1.0, label: '100 U (1.0 ml) - Standard' };
    }
  }, [syringeType]);

  const results = useMemo(() => {
    const totalMcg = vialMg * 1000;
    const mcgPerMl = totalMcg / diluent;
    
    // Formula: (desiredDose / totalMcg) * diluent * (syringeMaxUnits / syringeCapacityMl)
    // For standard 1.0ml (100u) syringe, it simplifies to (desiredDose / mcgPerMl) * 100
    const unitsForDose = (desiredDose / mcgPerMl) * 100;
    
    // Limit to max units of selected syringe
    const cappedUnits = Math.min(unitsForDose, syringeConfig.maxUnits);
    const volumeMl = (unitsForDose / 100);

    return {
      mcgPerMl,
      unitsForDose: unitsForDose,
      cappedUnits: parseFloat(cappedUnits.toFixed(1)),
      volumeMl: parseFloat(volumeMl.toFixed(3)),
      totalMcg,
      isExceeded: unitsForDose > syringeConfig.maxUnits
    };
  }, [vialMg, diluent, desiredDose, syringeConfig]);

  // Syringe SVG rendering dimensions
  const barrelHeight = 200;
  const barrelWidth = 26;
  const barrelX = 35;
  const barrelY = 20;

  // Calculate plunger and fluid position
  // Plunger is at barrelY (0 units) when units = 0
  // Plunger is at barrelY + barrelHeight (max units) when units = maxUnits
  const fillRatio = Math.min(results.unitsForDose / syringeConfig.maxUnits, 1);
  const fluidHeight = fillRatio * barrelHeight;
  const plungerY = barrelY + fluidHeight;

  return (
    <div className="recon-card" style={{
      padding: '1.75rem',
      backgroundColor: 'white',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-sm)',
      marginTop: '1.5rem',
      color: 'var(--text-main)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 163, 224, 0.08)', borderRadius: '10px', color: 'var(--secondary)' }}>
          <Beaker size={22} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>Calculadora de Reconstitución</h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Simulación visual de jeringa para su dosificación</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Vial specs summary banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--section-alt, #EEF4FA)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-muted)' }}>Contenido del Vial:</span>
          <span style={{ color: 'var(--primary)' }}>{vialMg} mg ({results.totalMcg.toLocaleString()} mcg)</span>
        </div>

        {/* Inputs row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Diluyente (BAC Water)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={diluent} 
                onChange={(e) => setDiluent(parseFloat(e.target.value) || 1)}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
                <span>{diluent} ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({(results.mcgPerMl/1000).toFixed(1)} mg/ml)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Dosis Objetivo (mcg)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="range"
                min="50"
                max="1500"
                step="50"
                value={desiredDose} 
                onChange={(e) => setDesiredDose(parseInt(e.target.value) || 50)}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
                <span>{desiredDose} mcg</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({(desiredDose/1000).toFixed(2)} mg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Syringe selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Capacidad de la Jeringa</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['0.3ml', '0.5ml', '1.0ml'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSyringeType(type)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: syringeType === type ? 'var(--secondary)' : 'var(--border)',
                  backgroundColor: syringeType === type ? 'var(--secondary)' : 'white',
                  color: syringeType === type ? 'white' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {type === '0.3ml' ? '30 U (0.3ml)' : type === '0.5ml' ? '50 U (0.5ml)' : '100 U (1.0ml)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Syringe Visualizer Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '120px 1fr', 
        gap: '1.25rem', 
        alignItems: 'center',
        background: '#FAFBFD',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        padding: '1.25rem'
      }}>
        {/* SVG Syringe Column */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="100" height="250" viewBox="0 0 100 250">
            {/* Needle Connection */}
            <rect x="47" y="5" width="6" height="15" fill="#E2E8F0" stroke="#718096" strokeWidth="1" />
            <line x1="50" y1="5" x2="50" y2="0" stroke="#4A5568" strokeWidth="1.5" />
            
            {/* Syringe Body Background */}
            <rect x={barrelX} y={barrelY} width={barrelWidth} height={barrelHeight} rx="2" fill="#FFFFFF" stroke="#A0AEC0" strokeWidth="2" />
            
            {/* Liquid Fill */}
            <rect x={barrelX + 1} y={barrelY} width={barrelWidth - 2} height={fluidHeight} fill="rgba(0, 209, 255, 0.28)" />
            
            {/* Tick marks on barrel */}
            {Array.from({ length: 11 }).map((_, i) => {
              const tickY = barrelY + (i / 10) * barrelHeight;
              const tickVal = Math.round((i / 10) * syringeConfig.maxUnits);
              const isMajor = i % 2 === 0;
              return (
                <g key={i}>
                  <line 
                    x1={barrelX} 
                    y1={tickY} 
                    x2={barrelX + (isMajor ? 8 : 4)} 
                    y2={tickY} 
                    stroke="#4A5568" 
                    strokeWidth={isMajor ? 1.5 : 1} 
                  />
                  {isMajor && (
                    <text 
                      x={barrelX - 4} 
                      y={tickY + 3} 
                      fontSize="8" 
                      fontWeight="700" 
                      fill="#718096" 
                      textAnchor="end"
                    >
                      {tickVal}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Plunger Head */}
            <rect x={barrelX + 1} y={plungerY} width={barrelWidth - 2} height="8" fill="#4A5568" rx="1" />
            <line x1={barrelX + 1} y1={plungerY + 4} x2={barrelX + barrelWidth - 1} y2={plungerY + 4} stroke="#2D3748" strokeWidth="2" />
            
            {/* Plunger Rod */}
            <rect x="46" y={plungerY + 8} width="8" height="150" fill="#CBD5E0" stroke="#718096" strokeWidth="1" />
            
            {/* Plunger Bottom Thumb Press */}
            <rect x="30" y={plungerY + 115} width="40" height="8" fill="#718096" rx="2" />
          </svg>
        </div>

        {/* Calculations / Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volumen Requerido</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: results.isExceeded ? 'var(--error)' : 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {results.cappedUnits}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Unidades</span>
            </div>
            {results.isExceeded && (
              <span style={{ fontSize: '0.68rem', color: 'var(--error)', fontWeight: 700 }}>
                ⚠️ ¡Excede la capacidad de {syringeConfig.label}!
              </span>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Líquido en jeringa:</span>
              <span style={{ color: 'var(--text-main)' }}>{results.volumeMl} ml</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Concentración:</span>
              <span style={{ color: 'var(--text-main)' }}>{results.mcgPerMl.toLocaleString()} mcg/ml</span>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.35 }}>
            <Info size={12} style={{ flexShrink: 0, marginTop: '0.05rem' }} />
            <span>Extraiga hasta la marca de {results.cappedUnits} unidades. 100 unidades equivalen a 1.0 ml.</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => { setDiluent(2); setDesiredDose(250); setSyringeType('1.0ml'); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={12} /> Restablecer valores
        </button>
      </div>
    </div>
  );
}
