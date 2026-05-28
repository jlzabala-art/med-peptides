import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClinicalThroughputChart({ data }) {
  const chartData = data || [
    { name: 'Mon', consultations: 4, protocols: 2 },
    { name: 'Tue', consultations: 6, protocols: 3 },
    { name: 'Wed', consultations: 5, protocols: 5 },
    { name: 'Thu', consultations: 8, protocols: 6 },
    { name: 'Fri', consultations: 3, protocols: 2 },
    { name: 'Sat', consultations: 2, protocols: 1 },
    { name: 'Sun', consultations: 1, protocols: 0 },
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--primary)" /> Clinical Throughput
        </h3>
        <select style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'var(--color-bg-app)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', outline: 'none' }}>
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>
      
      <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c6ff7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProtocols" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 600, fontSize: '0.85rem' }} 
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="consultations" name="Consultations" stroke="#7c6ff7" strokeWidth={3} fillOpacity={1} fill="url(#colorConsults)" />
            <Area type="monotone" dataKey="protocols" name="Protocols Issued" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorProtocols)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
