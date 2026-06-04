import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Scale, Filter } from 'lucide-react';

export default function ComparativeAnalysisTool() {
  const [periodA, setPeriodA] = useState('Q1');
  const [periodB, setPeriodB] = useState('Q2');

  // MOCK DATA: In a real scenario, this would compute from pnl2026 or Zoho Reports API based on selected periods.
  const dataMap = {
    'Q1': { income: 320000, expenses: 210000, profit: 110000 },
    'Q2': { income: 410000, expenses: 240000, profit: 170000 },
    'Q3': { income: 390000, expenses: 250000, profit: 140000 },
    'Q4': { income: 480000, expenses: 290000, profit: 190000 },
  };

  const a = dataMap[periodA];
  const b = dataMap[periodB];

  const calcVariance = (valA, valB) => {
    if (valA === 0) return 100;
    return (((valB - valA) / valA) * 100).toFixed(1);
  };

  const renderMetricCard = (title, valA, valB, isGoodIfPositive = true) => {
    const variance = calcVariance(valA, valB);
    const isPositive = variance > 0;
    const isFavorable = (isPositive && isGoodIfPositive) || (!isPositive && !isGoodIfPositive);

    return (
      <div style={{ background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', flex: '1 1 200px' }}>
        <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{periodA}</div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${valA.toLocaleString()}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{periodB}</div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${valB.toLocaleString()}</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.25rem', 
            color: isFavorable ? 'var(--success)' : 'var(--error)',
            background: isFavorable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.875rem'
          }}>
            {isPositive ? <ArrowUpRight style={{ width: '16px', height: '16px' }} /> : <ArrowDownRight style={{ width: '16px', height: '16px' }} />}
            {Math.abs(variance)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Variance</span>
        </div>
      </div>
    );
  };

  return (
    <div className="anim-fade-up glass-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale style={{ color: '#8b5cf6' }} />
            Comparative Analysis
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Compare period-over-period financial performance
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-raised)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>
            <Filter style={{ width: '16px', height: '16px', color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <select 
              value={periodA} onChange={e => setPeriodA(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0', cursor: 'pointer', outline: 'none', fontWeight: '600', color: 'var(--text-primary)' }}
            >
              <option value="Q1">Q1 2026</option>
              <option value="Q2">Q2 2026</option>
              <option value="Q3">Q3 2026</option>
              <option value="Q4">Q4 2026</option>
            </select>
            <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>vs</span>
            <select 
              value={periodB} onChange={e => setPeriodB(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0', cursor: 'pointer', outline: 'none', fontWeight: '600', color: 'var(--text-primary)' }}
            >
              <option value="Q1">Q1 2026</option>
              <option value="Q2">Q2 2026</option>
              <option value="Q3">Q3 2026</option>
              <option value="Q4">Q4 2026</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
        {renderMetricCard("Total Income", a.income, b.income, true)}
        {renderMetricCard("Total Expenses", a.expenses, b.expenses, false)}
        {renderMetricCard("Net Profit", a.profit, b.profit, true)}
      </div>
      
    </div>
  );
}
