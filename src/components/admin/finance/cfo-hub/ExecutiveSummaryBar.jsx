import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import ArrowDownRight from "lucide-react/dist/esm/icons/arrow-down-right";
import Package from "lucide-react/dist/esm/icons/package";
import Receipt from "lucide-react/dist/esm/icons/receipt";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React from 'react';









export default function ExecutiveSummaryBar({ data, totalBalance }) {
  const pnl = data?.dashboardData?.profitAndLoss || {};
  // Extract or fallback to basic numbers
  const revenue = pnl?.total_income || 248000;
  const netProfit = pnl?.net_profit || 85000;
  const expenses = pnl?.total_expense || (revenue - netProfit);
  const grossMargin = revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 46;
  // Static mock fallbacks for things not natively in current P&L response
  const ar = data?.dashboardData?.receivables || 42000;
  const ap = data?.dashboardData?.payables || 18500;
  const inventoryValue = 125000;
  const taxLiability = 12400;

  const kpis = [
    { label: 'Revenue (MTD)', value: `$${revenue.toLocaleString()}`, trend: '+12.4%', isPositive: true, icon: DollarSign },
    { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, trend: '+8.2%', isPositive: true, icon: TrendingUp },
    { label: 'Gross Margin', value: `${grossMargin}%`, trend: '+2.1%', isPositive: true, icon: ArrowUpRight },
    { label: 'Cash Position', value: `$${totalBalance.toLocaleString()}`, trend: '+5.0%', isPositive: true, icon: DollarSign },
    { label: 'A/R', value: `$${ar.toLocaleString()}`, trend: '-1.2%', isPositive: true, icon: Receipt },
    { label: 'A/P', value: `$${ap.toLocaleString()}`, trend: '+4.5%', isPositive: false, icon: FileText },
    { label: 'Inventory Value', value: `$${inventoryValue.toLocaleString()}`, trend: '+1.1%', isPositive: true, icon: Package },
    { label: 'Tax Liability', value: `$${taxLiability.toLocaleString()}`, trend: '+12.0%', isPositive: false, icon: TrendingDown },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} style={{ 
          minWidth: '160px', 
          backgroundColor: 'var(--color-bg-surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: '1 0 auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</span>
            <kpi.icon size={16} color="var(--text-muted)" opacity={0.5} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {kpi.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: kpi.isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {kpi.trend}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>vs last mo</span>
          </div>
        </div>
      ))}
    </div>
  );
}