import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';




const MOCK_CHANGES = [
  { id: 1, name: 'Retatrutide 10mg', old: 165, new: 152, diff: -7.9, impact: 'Margin Improvement', color: '#10b981' },
  { id: 2, name: 'BPC-157 5mg', old: 34, new: 39, diff: 14.7, impact: 'Margin Risk', color: '#ef4444' },
  { id: 3, name: 'GHK-Cu 50mg', old: 42, new: 43, diff: 2.3, impact: 'Small Increase', color: '#f59e0b' }
];

export default function PriceChangeCenter() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#0f172a" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Price Change Center</span>
        </div>
      </div>

      <div style={{ padding: 0 }}>
        {MOCK_CHANGES.map((item, idx) => (
          <div key={item.id} style={{
            padding: '16px',
            borderBottom: idx < MOCK_CHANGES.length - 1 ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{item.name}</span>
              <span style={{ 
                color: item.color, 
                fontSize: '12px', 
                fontWeight: 600,
                background: `${item.color}15`,
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {item.diff > 0 ? '+' : ''}{item.diff}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ textDecoration: 'line-through' }}>${item.old}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>${item.new}</span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: item.color }}>
                {item.diff > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                {item.impact}
              </span>
            </div>
            {item.diff > 10 && (
              <div style={{ marginTop: '8px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', color: '#991b1b', display: 'flex', gap: '6px' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Impacts <strong>Recovery Protocol</strong> margin. Estimated Monthly Loss: <strong>$4,200</strong>.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}