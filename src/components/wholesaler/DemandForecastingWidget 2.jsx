import React, { useState, useEffect } from 'react';
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Box from "lucide-react/dist/esm/icons/box";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";

export default function DemandForecastingWidget() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate AI fetching data based on prescription velocity
  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        {
          id: 'item-1',
          name: 'Semaglutide 0.5mg',
          currentStock: 120,
          velocity: '45/week',
          depletionRisk: 'High',
          daysRemaining: 18,
          suggestion: 'Order +500 units to avoid stockout in 18 days.'
        },
        {
          id: 'item-2',
          name: 'BPC-157 / TB-500',
          currentStock: 450,
          velocity: '110/week',
          depletionRisk: 'Medium',
          daysRemaining: 28,
          suggestion: 'Consider replenishing next month.'
        }
      ]);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '1.25rem', background: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '8px', marginBottom: '1.5rem'
      }}>
        <div className="skeleton" style={{ height: '24px', width: '200px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '60px', width: '100%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '60px', width: '100%' }} />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid #dadce0',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #f1f3f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8f9fa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            padding: '0.4rem', 
            borderRadius: '6px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#202124', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              AI Demand Forecasting <Sparkles size={14} color="#10b981" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>
              Inventory depletion predictions based on clinical prescription velocity
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.map((item) => {
          const isHigh = item.depletionRisk === 'High';
          const riskColor = isHigh ? '#ef4444' : '#f59e0b';
          const bgRisk = isHigh ? '#fef2f2' : '#fffbeb';
          const borderRisk = isHigh ? '#fca5a5' : '#fcd34d';

          return (
            <div key={item.id} style={{
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              padding: '1rem', background: 'var(--color-bg-surface)',
              borderLeft: `4px solid ${riskColor}`,
              border: `1px solid ${borderRisk}`,
              borderLeftWidth: '4px',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Box size={16} color="#5f6368" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#202124' }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                    background: bgRisk, color: riskColor, fontWeight: 700, border: `1px solid ${borderRisk}`
                  }}>
                    {item.depletionRisk} Risk
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5f6368', display: 'flex', gap: '1rem' }}>
                  <span>Stock: <strong>{item.currentStock}</strong></span>
                  <span>Velocity: <strong>{item.velocity}</strong></span>
                  <span style={{ color: riskColor, fontWeight: 600 }}>Depletes in: {item.daysRemaining} days</span>
                </div>
              </div>

              <div style={{ 
                marginTop: '0.5rem', padding: '0.75rem', background: '#f8f9fa', 
                borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
              }}>
                <Sparkles size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>AI Suggestion:</span> {item.suggestion}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
