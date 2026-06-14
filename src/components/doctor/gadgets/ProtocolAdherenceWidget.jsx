import ActivitySquare from "lucide-react/dist/esm/icons/activity-square";
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


export default function ProtocolAdherenceWidget() {
  const data = [
    { name: 'Fully Adherent', value: 65, color: 'var(--color-success)' }, // green
    { name: 'Partial', value: 25, color: '#f59e0b' },      // yellow
    { name: 'Non-Adherent', value: 10, color: 'var(--color-danger)' }  // red
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ActivitySquare size={18} color="var(--color-success)" /> Protocol Adherence
      </h3>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>84%</span>
          <br/>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Avg</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
        {data.map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}