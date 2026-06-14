import React from 'react';
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function FinancialKPIHeader({ invoices }) {
  // Mock calculations based on invoices
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid').reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  
  // Real calculations would require due dates, assume 30% of outstanding is due in 7 days, 60% in 30 days
  const exp7Days = outstanding * 0.3;
  const exp30Days = outstanding * 0.6;
  
  // DSO (Days Sales Outstanding) Mock
  const dso = 42; 
  
  const avgValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  return (
    <div style={{ padding: '1rem 1.5rem', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
      
      {/* Title */}
      <div style={{ flexShrink: 0, paddingRight: '1rem', borderRight: '1px solid #334155' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#38bdf8" />
          Financial Intel
        </div>
      </div>

      {/* KPIs */}
      <KPICard title="Revenue (MTD)" value={fmtCurrency(totalRevenue)} icon={<DollarSign size={16} color="#38bdf8" />} trend="+12.5%" />
      <div style={{ width: '1px', height: '32px', background: '#334155', flexShrink: 0 }} />
      
      <KPICard title="Outstanding" value={fmtCurrency(outstanding)} icon={<AlertCircle size={16} color="#fbbf24" />} color="#fbbf24" />
      <KPICard title="Overdue" value={fmtCurrency(overdue)} icon={<AlertCircle size={16} color="#ef4444" />} color="#ef4444" trend={overdue > 0 ? "Action Required" : "Healthy"} />
      
      <div style={{ width: '1px', height: '32px', background: '#334155', flexShrink: 0 }} />
      
      <KPICard title="Exp. 7 Days" value={fmtCurrency(exp7Days)} icon={<CalendarDays size={16} color="#10b981" />} color="#10b981" />
      <KPICard title="Exp. 30 Days" value={fmtCurrency(exp30Days)} />
      
      <div style={{ width: '1px', height: '32px', background: '#334155', flexShrink: 0 }} />

      <KPICard title="DSO" value={`${dso} Days`} color={dso > 45 ? '#ef4444' : '#10b981'} trend="-2 days" />
      <KPICard title="Avg Invoice" value={fmtCurrency(avgValue)} />

    </div>
  );
}

function KPICard({ title, value, icon, color = '#fff', trend }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, minWidth: '120px' }}>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {icon} {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: color }}>
          {value}
        </div>
        {trend && (
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: trend.startsWith('-') || trend === 'Healthy' ? '#10b981' : (trend === 'Action Required' ? '#ef4444' : '#38bdf8') }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}