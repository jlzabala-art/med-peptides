import React from 'react';

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
    <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Financial Dashboard</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Select an invoice from the left to view details, or review overall financial health below.</p>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right' }}>Total Exposure</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right' }}>Overdue</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Avg Delay</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock Data */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>Global Pharma Solutions</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>€125,000</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>€45,000</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#f59e0b' }}>+12 days</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}><span style={{ padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>HIGH</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>MediLife Clinics</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>€80,000</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#64748b' }}>€0</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#10b981' }}>-2 days</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}><span style={{ padding: '0.2rem 0.5rem', background: '#d1fae5', color: '#065f46', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>LOW</span></td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>Longevity Hub EU</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>€42,500</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>€12,000</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#f59e0b' }}>+5 days</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}><span style={{ padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>MEDIUM</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
