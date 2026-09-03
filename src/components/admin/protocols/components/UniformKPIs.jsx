import React from 'react';
import { FlaskConical, Activity, Edit3, Archive, Clock, Dna, Layers, ShieldCheck, Filter } from '@/lib/icons';

export default function UniformKPIs({ 
  data = [], 
  globalMetrics, 
  kpiScope = 'filtered', 
  onScopeChange,
  isFiltered = false 
}) {
  const filteredTotal = data.length;
  const filteredActive = data.filter((d) => d.status === 'active' || !d.status).length;
  const filteredPeptides = data.filter((d) => d.has_peptides || (Array.isArray(d.peptides) && d.peptides.length > 0) || (d.category?.toLowerCase().includes('peptide'))).length;
  const filteredAvgDuration = Math.round(
    data.reduce((acc, d) => acc + (d.protocol_duration_weeks || d.duration_weeks || d.durationWeeks || 8), 0) / (data.length || 1)
  );

  const globalTotal = globalMetrics?.totalCount ?? globalMetrics?.total ?? 77;
  const globalActive = globalMetrics?.activeCount ?? globalMetrics?.active ?? 68;
  const globalPeptides = globalMetrics?.peptideCount ?? 45;
  const globalAvgDuration = globalMetrics?.avgDuration ?? 10;

  const currentTotal = kpiScope === 'global' ? globalTotal : filteredTotal;
  const currentActive = kpiScope === 'global' ? globalActive : filteredActive;
  const currentPeptides = kpiScope === 'global' ? globalPeptides : filteredPeptides;
  const currentAvgDuration = kpiScope === 'global' ? globalAvgDuration : filteredAvgDuration;

  const stats = [
    { 
      label: 'Total Protocols', 
      value: currentTotal, 
      color: 'var(--color-primary, #003666)', 
      icon: <FlaskConical size={18} />,
      subtitle: kpiScope === 'global' ? 'All registered pathways' : 'Pathways in active view'
    },
    { 
      label: 'Active Clinical', 
      value: currentActive, 
      color: '#10b981', 
      icon: <Activity size={18} />,
      subtitle: kpiScope === 'global' ? 'Available for prescription' : 'Active in filter set'
    },
    { 
      label: 'Peptide-Powered', 
      value: currentPeptides, 
      color: '#7c3aed', 
      icon: <Dna size={18} />,
      subtitle: kpiScope === 'global' ? 'Multi-peptide therapeutic' : 'Peptide therapies in view'
    },
    { 
      label: 'Avg Duration', 
      value: `${currentAvgDuration} wks`, 
      color: '#d97706', 
      icon: <Clock size={18} />,
      subtitle: kpiScope === 'global' ? 'Mean treatment cycle' : 'Average cycle length'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
      {/* Scope Switcher Banner (Golden Rule #22) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '9999px',
            background: isFiltered ? 'rgba(2, 132, 199, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            color: isFiltered ? '#0284c7' : '#475569',
            border: `1px solid ${isFiltered ? 'rgba(2, 132, 199, 0.25)' : 'rgba(100, 116, 139, 0.2)'}`
          }}>
            <Filter size={12} />
            {isFiltered ? `Matching Active Filters (${filteredTotal} protocols)` : 'Entire Database View'}
          </span>
        </div>

        {onScopeChange && (
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => onScopeChange('filtered')}
              style={{
                border: 'none',
                background: kpiScope === 'filtered' ? '#ffffff' : 'transparent',
                color: kpiScope === 'filtered' ? 'var(--color-primary, #003666)' : '#64748b',
                fontWeight: kpiScope === 'filtered' ? 700 : 500,
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: kpiScope === 'filtered' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Filtered ({filteredTotal})
            </button>
            <button
              type="button"
              onClick={() => onScopeChange('global')}
              style={{
                border: 'none',
                background: kpiScope === 'global' ? '#ffffff' : 'transparent',
                color: kpiScope === 'global' ? 'var(--color-primary, #003666)' : '#64748b',
                fontWeight: kpiScope === 'global' ? 700 : 500,
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: kpiScope === 'global' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Global DB ({globalTotal})
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="protocols-kpi-grid">
        {stats.map((s, i) => (
          <div
            key={i}
            className="protocols-kpi-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  color: s.color,
                  background: s.color + '15',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {s.value}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.subtitle}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .protocols-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        .protocols-kpi-card {
          background: #ffffff;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          min-width: 0;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .protocols-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          .protocols-kpi-card {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
