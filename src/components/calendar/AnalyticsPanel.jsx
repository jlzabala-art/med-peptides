import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function AnalyticsPanel({ events }) {
  // Basic stats
  const total = events?.length || 0;
  const upcoming = events?.filter(e => new Date(e.start) > new Date()).length || 0;
  const past = total - upcoming;

  // Compute event type distribution
  const typeData = useMemo(() => {
    const map = {};
    events?.forEach(e => {
      const type = e.extendedProps?.type || 'default';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({ name: type, value: count }));
  }, [events]);

  // Compute events per month (last 12 months)
  const monthData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({ month: key, count: 0 });
    }
    events?.forEach(e => {
      const date = new Date(e.start);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const entry = months.find(m => m.month === key);
      if (entry) entry.count += 1;
    });
    return months;
  }, [events]);

  const COLORS = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#6b46c1', '#ed8936'];

  return (
    <div className="analytics-panel glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', color: '#f8fafc', marginBottom: '1.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 600 }}>Calendar Insights</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Events</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{total}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Upcoming</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--event-color-shipping)' }}>{upcoming}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Past</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--event-color-prescription)' }}>{past}</div>
        </div>
      </div>

      {/* Event Type Distribution */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Event Types</h4>
      <PieChart width={300} height={250}>
        <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {typeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ReTooltip />
        <Legend />
      </PieChart>

      {/* Monthly Trend */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Events Over Last 12 Months</h4>
      <LineChart width={600} height={300} data={monthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <ReTooltip />
        <Line type="monotone" dataKey="count" stroke="#3182ce" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
}
