import React from 'react';
import { User, Activity, ShoppingBag, ClipboardList, Clock, Calendar as CalendarIcon, FileText } from 'lucide-react';
import './CalendarCloud.css';

export default function CalendarContextDrawer({ event, isOpen, onClose }) {
  if (!isOpen || !event) return null;

  const patientName = event.extendedProps?.patientName || event.title.split('-')[0].trim() || 'John Doe';
  const eventType = event.extendedProps?.type || 'prescription';
  
  return (
    <>
      {/* Drawer Overlay */}
      <div 
        className="cal-drawer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000,
          transition: 'opacity 0.3s'
        }}
      />
      
      {/* Drawer Panel */}
      <div 
        className="cal-drawer-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
          backgroundColor: 'var(--cal-bg-surface)', boxShadow: 'var(--cal-shadow-lg)',
          zIndex: 1001, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--cal-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--cal-color-bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cal-color-primary)' }}>
              <User size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cal-color-text-primary)' }}>{patientName}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--cal-color-text-secondary)' }}>Male, 45 yrs</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--cal-color-text-muted)' }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Selected Event Context */}
          <div style={{ backgroundColor: 'var(--cal-bg-panel)', padding: '1rem', borderRadius: 'var(--cal-radius-sm)', border: '1px solid var(--cal-border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--cal-color-text-secondary)', textTransform: 'uppercase' }}>Selected Event</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--cal-color-text-primary)' }}>{event.title}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--cal-color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} /> {event.start ? new Date(event.start).toLocaleString() : 'N/A'}
            </div>
            {event.extendedProps?.dosage && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--cal-color-text-secondary)' }}>
                <strong>Dosage:</strong> {event.extendedProps.dosage} ({event.extendedProps.injectionSite})
              </div>
            )}
          </div>

          {/* Patient Timeline */}
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-primary)' }}>
              <Activity size={18} /> Medication Timeline
            </h4>
            <div style={{ borderLeft: '2px solid var(--cal-border)', marginLeft: '8px', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--cal-color-primary)' }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-text-muted)' }}>Today</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cal-color-text-primary)', fontWeight: 500 }}>BPC-157 Administered</div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-text-muted)' }}>Last Week</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cal-color-text-primary)', fontWeight: 500 }}>Blood Panel Collected</div>
              </div>
            </div>
          </div>

          {/* Active Protocols */}
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-primary)' }}>
              <ClipboardList size={18} /> Active Protocols
            </h4>
            <div style={{ backgroundColor: 'var(--cal-bg-surface)', border: '1px solid var(--cal-border)', borderRadius: 'var(--cal-radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cal-color-primary)' }}>Peptide Protocol Alpha</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cal-color-text-secondary)', marginTop: '0.25rem' }}>Started: Oct 12, 2023 (Week 3 of 12)</div>
            </div>
          </div>

          {/* Upcoming Orders */}
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-primary)' }}>
              <ShoppingBag size={18} /> Upcoming Orders
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--cal-bg-panel)', borderRadius: 'var(--cal-radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Refill: BPC-157 5mg</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-text-muted)' }}>Scheduled for Nov 1</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '12px', fontWeight: 600 }}>Pending</span>
            </div>
          </div>

        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--cal-border)', display: 'flex', gap: '0.5rem' }}>
          <button style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--cal-bg-surface)', border: '1px solid var(--cal-border)', borderRadius: 'var(--cal-radius-sm)', cursor: 'pointer', fontWeight: 500 }}>
            View Full Chart
          </button>
          <button style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--cal-color-primary)', color: 'white', border: 'none', borderRadius: 'var(--cal-radius-sm)', cursor: 'pointer', fontWeight: 500 }}>
            Edit Event
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
