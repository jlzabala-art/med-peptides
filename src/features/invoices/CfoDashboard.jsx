import React, { useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from '@/lib/icons';

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function CfoDashboard({ invoices }) {
  // Mock data for Aging Analysis
  const agingData = [
    { label: 'Current', value: 45000, color: '#10b981' },
    { label: '1-30 Days', value: 12000, color: '#f59e0b' },
    { label: '31-60 Days', value: 5000, color: '#f97316' },
    { label: '61-90 Days', value: 2000, color: '#ef4444' },
    { label: '> 90 Days', value: 800, color: '#991b1b' }
  ];
  const maxAging = Math.max(...agingData.map(d => d.value));

  // Mock data for Revenue Trend (Last 6 Months)
  const trendData = [
    { month: 'Jan', revenue: 120, collections: 110 },
    { month: 'Feb', revenue: 140, collections: 130 },
    { month: 'Mar', revenue: 135, collections: 125 },
    { month: 'Apr', revenue: 160, collections: 140 },
    { month: 'May', revenue: 180, collections: 165 },
    { month: 'Jun', revenue: 210, collections: 190 }
  ];
  const maxTrend = Math.max(...trendData.map(d => d.revenue));

  return (
    <div style={{ padding: 'clamp(0.75rem, 2.5vw, 1.5rem)', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <PageHeader
        title="Financial Health & CFO Dashboard"
        subtitle="Institutional cash flows, invoice aging analysis, and revenue collection trends."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Invoiced YTD"
          value="€945,000"
          icon={DollarSign}
          trend="+18% vs last year"
          trendDirection="up"
        />
        <MetricCard
          title="Cash Collected"
          value="€860,000"
          icon={CheckCircle}
          trend="91% collection efficiency"
          trendDirection="up"
        />
        <MetricCard
          title="Total Exposure"
          value="€64,800"
          icon={TrendingUp}
          trend="Across 5 customer accounts"
          trendDirection="neutral"
        />
        <MetricCard
          title="Critical Overdue"
          value="€2,800"
          icon={AlertCircle}
          trend="> 60 days bucket"
          trendDirection="down"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Invoice Aging Analysis */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Invoice Aging Analysis</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {agingData.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{fmtCurrency(item.value)}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: item.color, width: `${(item.value / maxAging) * 100}%`, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue vs Collections Trend */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Revenue vs Collections (YTD)</h3>
          
          <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
            {trendData.map((data, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100%', width: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '40%', height: `${(data.revenue / maxTrend) * 100}%`, background: '#38bdf8', borderRadius: '2px 2px 0 0', position: 'relative' }} title={`Revenue: €${data.revenue}k`} />
                  <div style={{ width: '40%', height: `${(data.collections / maxTrend) * 100}%`, background: '#10b981', borderRadius: '2px 2px 0 0', position: 'relative' }} title={`Collections: €${data.collections}k`} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{data.month}</div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 10, height: 10, background: '#38bdf8', borderRadius: '2px' }}/> Invoiced Revenue</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '2px' }}/> Cash Collected</div>
          </div>
        </div>

        {/* Customer Payment Performance */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Customer Payment Performance (Top Debtors)</h3>
          <DataTable
            columns={[
              {
                key: 'customer',
                header: 'Customer',
                width: '32%',
                render: (row) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.customer}</span>,
              },
              {
                key: 'exposure',
                header: 'Total Exposure',
                width: '20%',
                render: (row) => <span style={{ fontWeight: 600 }}>€{row.exposure.toLocaleString()}</span>,
              },
              {
                key: 'overdue',
                header: 'Overdue',
                width: '18%',
                render: (row) => <span style={{ color: row.overdue > 0 ? '#ef4444' : '#64748b', fontWeight: 700 }}>€{row.overdue.toLocaleString()}</span>,
              },
              {
                key: 'delay',
                header: 'Avg Delay',
                width: '15%',
                render: (row) => <span style={{ color: row.delayDays > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{row.delay}</span>,
              },
              {
                key: 'risk',
                header: 'Risk Score',
                width: '15%',
                render: (row) => {
                  const statusMap = {
                    HIGH: 'rejected',
                    MEDIUM: 'pending',
                    LOW: 'active',
                  };
                  return <StatusBadge status={statusMap[row.risk] || 'inactive'} label={row.risk} />;
                },
              },
            ]}
            data={[
              { id: '1', customer: 'Global Pharma Solutions', exposure: 125000, overdue: 45000, delay: '+12 days', delayDays: 12, risk: 'HIGH' },
              { id: '2', customer: 'MediLife Clinics', exposure: 80000, overdue: 0, delay: '-2 days', delayDays: -2, risk: 'LOW' },
              { id: '3', customer: 'Longevity Hub EU', exposure: 42500, overdue: 12000, delay: '+5 days', delayDays: 5, risk: 'MEDIUM' },
            ]}
            showStatusFooter={false}
          />
        </div>

      </div>
    </div>
  );
}
