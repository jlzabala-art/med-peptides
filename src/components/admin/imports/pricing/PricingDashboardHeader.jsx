import Building from "lucide-react/dist/esm/icons/building";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Clock from "lucide-react/dist/esm/icons/clock";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import React from 'react';








export default function PricingDashboardHeader() {
  const kpis = [
    { label: "Suppliers", value: "12", icon: Building, color: "#3b82f6" },
    { label: "Products Compared", value: "2,840", icon: PackageSearch, color: "#8b5cf6" },
    { label: "Price Increases", value: "145", icon: TrendingUp, color: "#ef4444" },
    { label: "Price Reductions", value: "92", icon: TrendingDown, color: "#10b981" },
    { label: "Potential Savings", value: "$18,450", icon: DollarSign, color: "#10b981" },
    { label: "Pending Reviews", value: "12", icon: Clock, color: "#f59e0b" },
    { label: "Zoho Sync", value: "Synced", icon: RefreshCw, color: "#10b981" },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          PRICE IMPORT CENTER
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '16px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon size={16} color={kpi.color} />
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {kpi.label}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}