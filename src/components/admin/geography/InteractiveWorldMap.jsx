import React, { useState } from 'react';
import { Card } from '../../ui';

export default function InteractiveWorldMap({ markets, onSelectMarket }) {
  const [filter, setFilter] = useState('All');

  const statusColors = {
    'Operational': { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: 'var(--color-success)' },
    'Pending': { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#d97706' },
    'Opportunity': { bg: 'rgba(56,187,248,0.15)', border: 'rgba(56,187,248,0.4)', text: '#0ea5e9' },
    'Distributor Needed': { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#ea580c' },
    'Restricted': { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: 'var(--color-danger)' },
    'Not Configured': { bg: 'var(--color-bg-hover)', border: 'var(--border)', text: 'var(--text-muted)' }
  };

  const filteredMarkets = filter === 'All' ? markets : markets.filter(m => m.status === filter);

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Global Market Map</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setFilter('All')}
            style={{ 
              padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              backgroundColor: filter === 'All' ? 'var(--primary)' : 'var(--color-bg-hover)',
              color: filter === 'All' ? 'white' : 'var(--text-muted)'
            }}>All</button>
          {Object.keys(statusColors).map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                backgroundColor: filter === status ? statusColors[status].bg : 'var(--color-bg-hover)',
                color: filter === status ? statusColors[status].text : 'var(--text-muted)'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {filteredMarkets.map(m => {
            const colors = statusColors[m.status] || statusColors['Not Configured'];
            return (
              <div 
                key={m.id}
                onClick={() => onSelectMarket(m)}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  textAlign: 'center',
                  ':hover': { transform: 'scale(1.05)' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.flag || '🏳️'}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.7rem', color: colors.text, fontWeight: 700, textTransform: 'uppercase' }}>{m.status}</div>
              </div>
            );
          })}
        </div>
        
        {filteredMarkets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No markets found matching the filter.
          </div>
        )}
      </div>
    </Card>
  );
}
