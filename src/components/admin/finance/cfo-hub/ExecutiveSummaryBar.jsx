import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Package, Receipt, FileText } from '@/lib/icons';
import { formatAEDtoDual } from '../../../../utils/currencies';

export default function ExecutiveSummaryBar({ data, totalBalance = 0 }) {
  const pnl = data?.dashboardData?.profitAndLoss || {};
  const trends = data?.dashboardData?.trends || {};

  const revenue = Number(pnl?.total_income || 0);
  const netProfit = Number(pnl?.net_profit || 0);
  const expenses = Number(pnl?.total_expense || (revenue > netProfit ? revenue - netProfit : 0));
  const grossMargin = revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0;
  const ar = Number(data?.dashboardData?.receivables || 0);
  const ap = Number(data?.dashboardData?.payables || 0);
  const inventoryValue = Number(data?.dashboardData?.inventoryValue || data?.inventoryValue || 0);
  const taxLiability = Number(data?.dashboardData?.taxLiability || data?.taxLiability || 0);

  const kpis = [
    { label: 'Revenue (MTD)', value: formatAEDtoDual(revenue), trend: trends.revenue || (revenue > 0 ? 'Active' : '0%'), isPositive: revenue >= 0, icon: DollarSign },
    { label: 'Net Profit', value: formatAEDtoDual(netProfit), trend: trends.netProfit || (netProfit > 0 ? 'Profitable' : '0%'), isPositive: netProfit >= 0, icon: TrendingUp },
    { label: 'Gross Margin', value: `${grossMargin}%`, trend: trends.margin || (grossMargin > 0 ? 'Healthy' : '0%'), isPositive: grossMargin >= 20, icon: ArrowUpRight },
    { label: 'Cash Position', value: formatAEDtoDual(totalBalance), trend: trends.cash || (totalBalance > 0 ? 'Liquid' : '0%'), isPositive: totalBalance >= 0, icon: DollarSign },
    { label: 'A/R', value: formatAEDtoDual(ar), trend: trends.ar || (ar > 0 ? `${formatAEDtoDual(ar)} open` : '0%'), isPositive: true, icon: Receipt },
    { label: 'A/P', value: formatAEDtoDual(ap), trend: trends.ap || (ap > 0 ? `${formatAEDtoDual(ap)} due` : '0%'), isPositive: ap === 0, icon: FileText },
    { label: 'Inventory Value', value: formatAEDtoDual(inventoryValue), trend: trends.inventory || (inventoryValue > 0 ? 'In Stock' : '0%'), isPositive: true, icon: Package },
    { label: 'Tax Liability', value: formatAEDtoDual(taxLiability), trend: trends.tax || (taxLiability > 0 ? 'Estimated' : '0%'), isPositive: taxLiability === 0, icon: TrendingDown },
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