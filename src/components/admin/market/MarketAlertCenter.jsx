import Bell from "lucide-react/dist/esm/icons/bell";
import ArrowDownCircle from "lucide-react/dist/esm/icons/arrow-down-circle";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import React from 'react';






export default function MarketAlertCenter() {
  const alerts = [
    { type: 'price_drop', title: 'Price Drop Alert', desc: 'UAE Peptides dropped BPC-157 price by 12%.', icon: ArrowDownCircle, color: '#ef4444', bg: '#fee2e2' },
    { type: 'new_competitor', title: 'New Competitor', desc: 'NovaLabs started offering Tirzepatide in Qatar.', icon: UserPlus, color: '#8b5cf6', bg: '#ede9fe' },
    { type: 'margin_risk', title: 'Margin Risk Alert', desc: 'Semaglutide supplier cost increased. Margin at risk.', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' }
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Bell size={20} color="var(--text-main)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Actionable Alerts</h3>
      </div>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbars">
        {alerts.map((alert, idx) => (
          <div key={idx} style={{ 
            minWidth: '300px', 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: alert.bg, 
            border: `1px solid ${alert.color}30`,
            display: 'flex',
            gap: '1rem'
          }}>
            <alert.icon size={24} color={alert.color} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: alert.color, fontWeight: 700, fontSize: '0.95rem' }}>{alert.title}</h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{alert.desc}</p>
              <button style={{ background: 'white', border: `1px solid ${alert.color}50`, color: alert.color, padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                Review Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}