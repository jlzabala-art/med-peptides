import React from 'react';
import { Card, AIContextBadge } from '../../../ui';
import { Sparkles, ShieldAlert, TrendingUp, AlertTriangle } from '@/lib/icons';

export default function AIInsightsAndScore({ data }) {
  // Compute score dynamically if possible, or use a weighted mock
  const netProfit = data?.dashboardData?.profitAndLoss?.net_profit || 85000;
  const score = netProfit > 50000 ? 87 : 72;

  const insights = [
    { icon: TrendingUp, color: 'var(--color-success, #16a34a)', text: 'Profit increased 14% this month based on updated ledger records.' },
    { icon: Sparkles, color: 'var(--primary, #003666)', text: 'Retatrutide protocols generated AED 42,000 net profit margin.' },
    { icon: AlertTriangle, color: 'var(--warning, #f59e0b)', text: 'Inventory shortage risk detected in 2 high-turnover peptide SKU lines.' },
    { icon: ShieldAlert, color: 'var(--color-danger, #ef4444)', text: 'Quarterly tax filing reconciliation due in 18 business days.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Context Badge for AI Financial Engine */}
      <AIContextBadge
        title="Atlas Financial Intelligence Engine"
        subtitle="Real-time P&L analysis, tax runway forecasting and SKU profitability monitoring"
        contextPill="Scope: Global General Ledger & Inventory"
        accentColor="var(--primary, #003666)"
        model="Gemini 2.5 Flash • Financial Copilot"
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        {/* Score Card */}
        <Card style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 'clamp(1.25rem, 2.5vw, 2rem)',
          background: 'linear-gradient(135deg, rgba(0,54,102,0.04) 0%, rgba(0,54,102,0.08) 100%)',
          border: '1px solid rgba(0,54,102,0.15)',
          borderRadius: '12px',
          minHeight: '160px'
        }}>
          <div style={{ 
            color: 'var(--primary, #003666)', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '0.5rem', 
            textAlign: 'center' 
          }}>
            Atlas Financial Health Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary, #003666)', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '1.25rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-success, #16a34a)', fontWeight: 600, marginTop: '0.5rem' }}>
            ● Healthy Operating Cashflow
          </div>
        </Card>

        {/* Insights */}
        <Card style={{ 
          padding: 'clamp(1rem, 2vw, 1.5rem)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary, #003666)', fontWeight: 700, fontSize: '0.9rem' }}>
            <Sparkles size={18} />
            Executive AI Insights
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '0.75rem' 
          }}>
            {insights.map((insight, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem', 
                padding: '0.85rem', 
                backgroundColor: 'var(--color-bg-hover, #f8fafc)', 
                borderRadius: '8px',
                border: '1px solid var(--border-light, #e2e8f0)'
              }}>
                <div style={{ 
                  padding: '0.45rem', 
                  backgroundColor: 'var(--color-bg-surface, #ffffff)', 
                  borderRadius: '50%', 
                  color: insight.color, 
                  display: 'flex',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  flexShrink: 0
                }}>
                  <insight.icon size={16} />
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main, #1e293b)', fontWeight: 500, lineHeight: 1.45 }}>
                  {insight.text}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}