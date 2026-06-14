import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Info, TrendingUp } from 'lucide-react';

const PharmacokineticsSimulator = ({ selectedItems = [] }) => {
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    // Simulate PK logic
    if (!selectedItems || selectedItems.length === 0) {
      setSimulation(null);
      return;
    }

    const hasGH = selectedItems.some(i => i.name.includes('CJC') || i.name.includes('Ipamorelin') || i.name.includes('Tesamorelin'));
    const hasMultipleGH = selectedItems.filter(i => i.name.includes('CJC') || i.name.includes('Ipamorelin') || i.name.includes('Tesamorelin')).length > 1;
    const hasHealing = selectedItems.some(i => i.name.includes('BPC') || i.name.includes('TB'));

    let warnings = [];
    let insights = [];

    if (hasMultipleGH) {
      warnings.push("Riesgo de saturación pituitaria detectado. Estás combinando múltiples secretagogos (GHRH + GHRP). Considera ciclar 5 días ON / 2 días OFF para evitar la desensibilización del receptor.");
    }
    if (hasGH && hasHealing) {
      insights.push("Sinergia óptima detectada: La elevación de IGF-1 inducida por el secretagogo amplificará la angiogénesis del BPC/TB.");
    }

    // Mock chart data (blood plasma levels over 24h)
    const points = Array.from({ length: 24 }).map((_, i) => {
      let val = 0;
      if (hasGH) val += Math.sin((i / 24) * Math.PI) * 100;
      if (hasHealing) val += Math.cos((i / 24) * Math.PI) * 50 + 50;
      return Math.max(0, val);
    });

    setSimulation({ warnings, insights, points });
  }, [selectedItems]);

  if (!simulation) return null;

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginTop: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#3b82f6' }}>
          <Activity size={20} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          AI PK Simulator (Pharmacokinetics)
        </h3>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Análisis predictivo de vida media y saturación de receptores basado en los compuestos del carrito actual.
      </p>

      {/* Simulated Chart */}
      <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '4px', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        {simulation.points.map((val, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'linear-gradient(to top, #3b82f6, #93c5fd)',
            height: `${val}%`,
            borderRadius: '4px 4px 0 0',
            minHeight: '2px',
            opacity: 0.8
          }} title={`Hora ${i}: Nivel ${Math.round(val)}`} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
        <span>0h (Inyección)</span>
        <span>12h</span>
        <span>24h</span>
      </div>

      {/* Alerts & Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {simulation.warnings.map((warn, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#991b1b', lineHeight: 1.5 }}>{warn}</span>
          </div>
        ))}
        {simulation.insights.map((insight, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <TrendingUp size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacokineticsSimulator;
