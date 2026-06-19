import React from 'react';
import { ShieldCheck, FileText, TrendingDown, Users, Globe, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplierKPIs({ kpiStats, activeKpiFilter, setActiveKpiFilter, isMobile }) {
  
  const handleAction = (e, action) => {
    e.stopPropagation();
    toast.success(action);
  };

  const kpis = [
    { 
      id: 'all', 
      label: 'Total Sources', 
      val: kpiStats.total, 
      color: 'var(--primary)', 
      bg: 'rgba(59, 130, 246, 0.08)',
      icon: Users,
      actionLabel: 'Add Source',
      actionStr: 'Opening New Source form...'
    },
    { 
      id: 'active', 
      label: 'Active Sources', 
      val: kpiStats.active, 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.08)',
      icon: Building2,
      actionLabel: 'Review',
      actionStr: 'Filtering by Active Sources...'
    },
    { 
      id: 'single_source', 
      label: 'Single Source Risks', 
      val: kpiStats.singleSourceRisks, 
      color: '#ef4444', 
      bg: 'rgba(239, 68, 68, 0.08)',
      icon: ShieldCheck,
      actionLabel: 'View Risks',
      actionStr: 'Filtering items with single source risk...'
    },
    { 
      id: 'expiring_gmp', 
      label: 'Expiring GMP', 
      val: kpiStats.expiringGMP, 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.08)',
      icon: FileText,
      actionLabel: 'Request GMP',
      actionStr: 'Bulk document request initiated for expiring GMPs.'
    },
    { 
      id: 'pending_coa', 
      label: 'Pending COAs', 
      val: kpiStats.pendingCOAs, 
      color: '#a855f7', 
      bg: 'rgba(168, 85, 247, 0.08)',
      icon: TrendingDown,
      actionLabel: 'Chase COAs',
      actionStr: 'Reminders sent for pending COAs.'
    },
    { 
      id: 'countries', 
      label: 'Countries Covered', 
      val: kpiStats.coveredCountriesCount, 
      color: '#06b6d4', 
      bg: 'rgba(6, 182, 212, 0.08)',
      icon: Globe,
      actionLabel: 'View Map',
      actionStr: 'Opening coverage map...'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '0.75rem'
    }}>
      {kpis.map(kpi => {
        const isSelected = activeKpiFilter === kpi.id;
        const Icon = kpi.icon;
        return (
          <div 
            key={kpi.id}
            onClick={() => setActiveKpiFilter(isSelected ? 'all' : kpi.id)}
            style={{
              backgroundColor: 'var(--surface)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: isSelected ? `2px solid ${kpi.color}` : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              transform: isSelected ? 'translateY(-2px)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '110px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Icon size={14} color={kpi.color} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {kpi.label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.val}</span>
                {isSelected && (
                  <span style={{ backgroundColor: kpi.bg, color: kpi.color, fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    Active
                  </span>
                )}
              </div>
            </div>
            
            {/* Actionable Button replacing the basic filter tag */}
            <button
              onClick={(e) => handleAction(e, kpi.actionStr)}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '4px 0',
                background: kpi.bg,
                color: kpi.color,
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => e.target.style.opacity = 0.8}
              onMouseOut={(e) => e.target.style.opacity = 1}
            >
              {kpi.actionLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
