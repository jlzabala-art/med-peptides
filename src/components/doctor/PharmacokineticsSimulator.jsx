import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PharmacokineticsSimulator = ({ selectedItems = [] }) => {
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      setSimulation(null);
      return;
    }

    const hasGH = selectedItems.some(i => i.name.includes('CJC') || i.name.includes('Ipamorelin') || i.name.includes('Tesamorelin'));
    const hasMultipleGH = selectedItems.filter(i => i.name.includes('CJC') || i.name.includes('Ipamorelin') || i.name.includes('Tesamorelin')).length > 1;
    const hasHealing = selectedItems.some(i => i.name.includes('BPC') || i.name.includes('TB'));
    const hasSemaglutide = selectedItems.some(i => i.name.includes('Semaglutide') || i.name.includes('Tirzepatide'));

    let warnings = [];
    let insights = [];

    if (hasMultipleGH) {
      warnings.push("Riesgo de saturación pituitaria detectado. Estás combinando múltiples secretagogos (GHRH + GHRP). Considera ciclar 5 días ON / 2 días OFF para evitar la desensibilización del receptor.");
    }
    if (hasGH && hasHealing) {
      insights.push("Sinergia óptima detectada: La elevación de IGF-1 inducida por el secretagogo amplificará la angiogénesis del BPC/TB.");
    }
    if (hasSemaglutide) {
      warnings.push("Vida media prolongada detectada. (T1/2 > 160h). Monitorear de cerca efectos gastrointestinales durante la fase de acumulación.");
    }

    // Generate Chart Data
    const data = [];
    const totalHours = hasSemaglutide ? 168 : 24; // 1 week vs 24 hours
    const interval = hasSemaglutide ? 12 : 1;

    for (let i = 0; i <= totalHours; i += interval) {
      let concentration = 0;
      let threshold = 50;

      if (hasSemaglutide) {
        // Simple accumulation model for long half-life
        concentration += (100 * (1 - Math.exp(-0.01 * i)));
      } else {
        if (hasGH) concentration += (Math.sin((i / 24) * Math.PI) * 100);
        if (hasHealing) concentration += (Math.cos((i / 24) * Math.PI) * 50 + 50);
      }

      data.push({
        time: hasSemaglutide ? `Día ${Math.floor(i/24)}` : `${i}h`,
        concentration: Math.max(0, Math.round(concentration)),
        threshold: threshold
      });
    }

    setSimulation({ warnings, insights, data, hasSemaglutide });
  }, [selectedItems]);

  if (!simulation) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 5px', fontWeight: 600, fontSize: '0.85rem' }}>{label}</p>
          <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.85rem' }}>Concentración: {payload[0].value} ng/mL</p>
        </div>
      );
    }
    return null;
  };

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
          AI Pharmacokinetics Simulator
        </h3>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Proyección de concentración en plasma sanguíneo basada en la combinación de compuestos seleccionada.
      </p>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height: 250, marginBottom: '2rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={simulation.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConcentration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Umbral Terapéutico', fill: '#ef4444', fontSize: 10 }} />
            <Area type="monotone" dataKey="concentration" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConcentration)" />
          </AreaChart>
        </ResponsiveContainer>
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
