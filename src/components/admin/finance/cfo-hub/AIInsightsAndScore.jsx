import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';




import { Card } from '../../../ui';

export default function AIInsightsAndScore({ data }) {
  // Compute score dynamically if possible, or use a weighted mock
  const netProfit = data?.dashboardData?.profitAndLoss?.net_profit || 85000;
  const score = netProfit > 50000 ? 87 : 72;

  const insights = [
    { icon: TrendingUp, color: 'var(--color-success)', text: 'Profit increased 14% this month.' },
    { icon: Sparkles, color: 'var(--primary)', text: 'Retatrutide protocols generated AED 42,000 profit.' },
    { icon: AlertTriangle, color: 'var(--warning)', text: 'Inventory shortage risk detected in 2 products.' },
    { icon: ShieldAlert, color: 'var(--color-danger)', text: 'Tax payment due in 18 days.' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
      {/* Score Card */}
      <Card style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(26,115,232,0.05) 0%, rgba(26,115,232,0.1) 100%)',
        border: '1px solid rgba(26,115,232,0.2)'
      }}>
        <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', textAlign: 'center' }}>
          Atlas Financial Health Score
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </Card>

      {/* Insights */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
          <Sparkles size={18} />
          AI Executive Insights
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {insights.map((insight, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '0.4rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '50%', color: insight.color, display: 'flex' }}>
                <insight.icon size={16} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.4 }}>
                {insight.text}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}