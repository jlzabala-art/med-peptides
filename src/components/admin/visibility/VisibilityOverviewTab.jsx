import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Database from "lucide-react/dist/esm/icons/database";
import Globe from "lucide-react/dist/esm/icons/globe";
import Brain from "lucide-react/dist/esm/icons/brain";
import React from 'react';









export default function VisibilityOverviewTab() {
  const kpis = [
    { label: "Visible Products", value: "842", icon: Eye, color: "#10b981" },
    { label: "Hidden Products", value: "45", icon: EyeOff, color: "#64748b" },
    { label: "Pending Compliance", value: "12", icon: FileWarning, color: "#f59e0b" },
    { label: "Restricted Products", value: "8", icon: ShieldAlert, color: "#ef4444" },
    { label: "Missing Pricing", value: "3", icon: DollarSign, color: "#ef4444" },
    { label: "Not Synced To Zoho", value: "24", icon: Database, color: "#3b82f6" },
    { label: "Country Restrictions", value: "56", icon: Globe, color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: `${kpi.color}15`, padding: '8px', borderRadius: '8px' }}>
                  <Icon size={20} color={kpi.color} />
                </div>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{kpi.value}</div>
            </div>
          );
        })}

        {/* Health Score Widget */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#94a3b8' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Visibility Health</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>92 <span style={{ fontSize: '16px', color: '#64748b' }}>/ 100</span></div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
            <span>Pricing 100%</span>
            <span>Regulatory 90%</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Top Restricted Countries */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>
            Top Restricted Countries
          </div>
          <div style={{ padding: '0' }}>
            {['KSA', 'Qatar', 'USA', 'Germany'].map((country, idx) => (
              <div key={country} style={{ padding: '16px', borderBottom: idx < 3 ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{country}</span>
                <span style={{ color: '#ef4444', fontWeight: 600, background: '#fef2f2', padding: '4px 8px', borderRadius: '12px', fontSize: '13px' }}>
                  {15 - idx * 3} Restrictions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}