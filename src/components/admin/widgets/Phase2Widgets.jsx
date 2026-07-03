import React from 'react';
import { ExecutiveSummaryStrip, TodayPrioritiesQueue } from './CommandCenterWidgets';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Box from 'lucide-react/dist/esm/icons/box';
import Search from 'lucide-react/dist/esm/icons/search';
import Users from 'lucide-react/dist/esm/icons/users';

export function ExecutiveSummaryWidget() {
  return (
    <div style={{ padding: '0.5rem 0' }}>
      <ExecutiveSummaryStrip 
        metrics={{ revenue: 154200, grossProfit: 46260, cashPosition: 890000, openOrders: 42, pendingApprovals: 3, openRFQs: 12, aiAlerts: 2 }}
        visibleKPIs={['revenue', 'openOrders', 'pendingApprovals', 'openRFQs']}
      />
    </div>
  );
}

export function AIBriefWidget() {
  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid #e2e8f0', 
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0284c7, #3b82f6)', 
          padding: '0.5rem', 
          borderRadius: '8px', 
          color: 'white' 
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Atlas Intelligence Brief</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
            System Optimal. Found <strong style={{color: '#0284c7'}}>3 high-margin RFQ opportunities</strong> today.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="gcp-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}>
          <Search size={14} /> Review RFQs
        </button>
        <button className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}>
          <Box size={14} /> View Inventory
        </button>
        <button className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', background: '#f8fafc', color: '#0f172a', border: '1px dashed #cbd5e1' }}>
          <Sparkles size={14} color="#0284c7" /> Ask Atlas AI
        </button>
      </div>
    </div>
  );
}

export function SourcingHubWidget() {
  const recommendations = [
    { id: 1, title: 'Revenue +18%', action: 'Open', color: '#10b981', icon: <TrendingUp size={16} color="#10b981" /> },
    { id: 2, title: 'Inventory Risk', action: 'Review', color: '#f59e0b', icon: <AlertTriangle size={16} color="#f59e0b" /> },
    { id: 3, title: 'Supplier Delay', action: 'Resolve', color: '#ef4444', icon: <Box size={16} color="#ef4444" /> },
    { id: 4, title: 'Clinic Opportunity', action: 'View', color: '#0284c7', icon: <Users size={16} color="#0284c7" /> },
  ];

  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px',
      padding: '1.25rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#0284c7" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Atlas Sourcing Hub</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Confidence: 94%</span>
          <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Impact: High</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', flex: 1 }}>
        {recommendations.map(s => (
          <div key={s.id} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            padding: '1rem', 
            border: '1px solid #f1f5f9', 
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#f8fafc'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = s.color}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {s.icon}
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{s.title}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: s.color, fontWeight: 600, fontSize: '0.8rem', marginTop: 'auto' }}>
              {s.action} <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PriorityQueueWidget() {
  const queue = [
    { id: 1, priority: 'CRITICAL', title: 'Approve RFQs', impact: 'AED 240k pending', time: '2 min', action: 'Approve', color: '#ef4444', bg: '#fef2f2' },
    { id: 2, priority: 'HIGH', title: 'Inventory Alert', impact: 'Thymulin low stock', time: '5 min', action: 'Review', color: '#f59e0b', bg: '#fffbeb' },
    { id: 3, priority: 'MEDIUM', title: 'Supplier Review', impact: 'Global Pharma SLA', time: '15 min', action: 'Open', color: '#0284c7', bg: '#f0f9ff' },
  ];

  return (
    <div style={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <AlertTriangle size={18} color="#ef4444" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Action Queue</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {queue.map(item => (
          <div key={item.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem',
            border: '1px solid #f1f5f9',
            borderRadius: '8px',
            background: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                fontSize: '0.65rem', fontWeight: 700, color: item.color, background: item.bg, 
                padding: '4px 8px', borderRadius: '4px', minWidth: '65px', textAlign: 'center' 
              }}>
                {item.priority}
              </span>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <span>{item.impact}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
            
            <button className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}>
              {item.action} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
