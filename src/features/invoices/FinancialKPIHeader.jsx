import React from 'react';
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import OperationalKPICard from '../../components/shared/widgets/OperationalKPICard';

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
    <div style={{ padding: '1.5rem', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'stretch', gap: '2rem', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #1e293b' }}>
      
      {/* Title */}
      <div style={{ flexShrink: 0, paddingRight: '1rem', borderRight: '1px solid #334155', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#38bdf8" />
          Financial Intel
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <OperationalKPICard 
          title="Revenue (MTD)" 
          value={fmtCurrency(totalRevenue)} 
          icon={DollarSign} 
          trend="+12.5%" 
          severity="info" 
          darkTheme 
        />
        
        <OperationalKPICard 
          title="Outstanding" 
          value={fmtCurrency(outstanding)} 
          icon={AlertCircle} 
          severity="warning" 
          actionLabel="View Aging"
          onClick={() => {}}
          darkTheme 
        />

        <OperationalKPICard 
          title="Overdue" 
          value={fmtCurrency(overdue)} 
          icon={AlertCircle} 
          severity={overdue > 0 ? "critical" : "success"} 
          trend={overdue > 0 ? "Action Required" : "Healthy"}
          actionLabel="Resolve"
          onClick={() => {}}
          darkTheme 
        />
        
        <OperationalKPICard 
          title="Exp. 7 Days" 
          value={fmtCurrency(exp7Days)} 
          icon={CalendarDays} 
          severity="success" 
          darkTheme 
        />

        <OperationalKPICard 
          title="DSO" 
          value={`${dso} Days`} 
          severity={dso > 45 ? 'critical' : 'success'} 
          trend="-2 days" 
          darkTheme 
        />
      </div>

    </div>
  );
}