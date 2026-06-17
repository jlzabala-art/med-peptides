import React from 'react';
import { Mail, Phone, MapPin, Building, Activity, Star } from 'lucide-react';
import { StatusChip } from '../../ui';

export default function SupplierDirectoryView({ 
  paginatedData, 
  selectedIds, 
  onToggleSelect, 
  onRowExpand 
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {paginatedData.length === 0 ? (
        <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No suppliers found in directory.
        </div>
      ) : (
        paginatedData.map(w => {
          const type = w.type || (w.isZohoMaster ? 'Manufacturer' : 'Distributor');
          const isSelected = selectedIds.includes(w.id);
          const health = w.healthScore || 90;

          return (
            <div 
              key={w.id} 
              className="glass-card-premium hover-lift"
              style={{ 
                padding: '1.25rem', 
                position: 'relative',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                cursor: 'pointer'
              }}
              onClick={() => onRowExpand(w)}
            >
              <div 
                style={{ position: 'absolute', top: '12px', right: '12px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => onToggleSelect(w.id)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingRight: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                    {w.companyName || w.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusChip status={w.status} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                      {type}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <MapPin size={14} /> <span>{w.country || 'International'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Mail size={14} /> <span>{w.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Activity size={14} /> <span>Health Score: <strong style={{ color: health < 80 ? '#ef4444' : '#10b981' }}>{health}/100</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={12} fill={idx < (w.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                </div>
                <button 
                  className="btn btn-outline"
                  onClick={(e) => { e.stopPropagation(); onRowExpand(w); }}
                  style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
