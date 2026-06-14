import Cloud from "lucide-react/dist/esm/icons/cloud";
import Zap from "lucide-react/dist/esm/icons/zap";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';
import { Card } from '../../../ui';







export default function StrategicIntelligencePanel() {
  const alerts = [
    { type: 'danger', text: 'Margin dropped 4% on BPC-157.' },
    { type: 'warning', text: 'Supplier Lotusland cost increased 2%.' },
    { type: 'danger', text: 'Corporate Tax payment due in 18 days.' }
  ];

  const aiOptimizations = [
    { text: 'Switch supplier for BPC-157', impact: 'AED 18,500/year', action: 'Review' },
    { text: 'Increase Retatrutide price by 5%', impact: 'AED 42,000/year', action: 'Apply' },
    { text: 'Bundle NAD+ with Recovery Protocol', impact: 'AED 12,000/year', action: 'Create' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '350px', flexShrink: 0 }}>
      {/* Financial Alerts */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-surface)' }}>
          <ShieldAlert size={16} color="var(--color-danger)" />
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Live Financial Alerts</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {alerts.map((alert, i) => (
            <div key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: alert.type === 'danger' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)' }}>
              {alert.type === 'danger' ? <AlertTriangle size={16} color="var(--color-danger)" /> : <AlertTriangle size={16} color="#d97706" />}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{alert.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Optimization Center */}
      <Card style={{ padding: '1rem', backgroundColor: 'rgba(26,115,232,0.05)', border: '1px solid rgba(26,115,232,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>
          <Zap size={16} />
          AI Optimization Center
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {aiOptimizations.map((opt, i) => (
            <div key={i} style={{ backgroundColor: 'var(--color-bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{opt.text}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={12}/> {opt.impact}</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{opt.action}</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sales to Profit Funnel (Mock) */}
      <Card style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="var(--primary)" /> Sales to Profit Funnel
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>1. Leads</span>
            <span style={{ fontWeight: 600 }}>450</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', marginLeft: '0.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>2. Quotes</span>
            <span style={{ fontWeight: 600 }}>180</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', marginLeft: '1rem', borderLeft: '2px solid var(--primary)', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>3. Orders</span>
            <span style={{ fontWeight: 600 }}>92</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', marginLeft: '1.5rem', borderLeft: '2px solid var(--color-success)', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>4. Profit</span>
            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>AED 85,000</span>
          </div>
        </div>
      </Card>

      {/* Zoho Intelligence Hub Summary */}
      <Card style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cloud size={16} color="var(--primary)" /> Zoho Intelligence Sync
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Books</div>
            <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>Synced</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Inventory</div>
            <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>Synced</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)' }}>CRM</div>
            <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>Synced</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Bigin</div>
            <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>Synced</div>
          </div>
        </div>
      </Card>

    </div>
  );
}