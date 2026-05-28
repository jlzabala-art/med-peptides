import React from 'react';
import { Bell, Package, AlertCircle, ShieldAlert, CheckCircle2, FlaskConical } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/header.css'; // Reuses existing dropdown-panel styles

export default function NotificationsPanel({ onClose }) {
  const { activeRole } = useAuth();

  // Mock notifications tailored to the active role
  const getNotifications = () => {
    switch (activeRole) {
      case 'admin':
        return [
          { id: 1, type: 'alert', title: 'Low Stock Alert', desc: 'BPC-157 inventory is below 15 units.', time: '10 min ago', icon: <AlertCircle size={16} color="var(--color-danger)" /> },
          { id: 2, type: 'auth', title: 'Pending Approval', desc: 'Dr. Sarah Jenkins submitted verification documents.', time: '1 hour ago', icon: <ShieldAlert size={16} color="#f59e0b" /> },
          { id: 3, type: 'order', title: 'New Wholesale Order', desc: 'Order #WO-492 needs review.', time: '2 hours ago', icon: <Package size={16} color="var(--color-success)" /> }
        ];
      case 'doctor':
      case 'clinic':
        return [
          { id: 1, type: 'lab', title: 'Lab Results Ready', desc: 'New bloodwork panel for patient J. Doe.', time: '30 min ago', icon: <FlaskConical size={16} color="#06b6d4" /> },
          { id: 2, type: 'system', title: 'Protocol Updated', desc: 'The Longevity Protocol V2 has been published.', time: '1 day ago', icon: <CheckCircle2 size={16} color="var(--color-success)" /> }
        ];
      case 'patient':
        return [
          { id: 1, type: 'order', title: 'Order Shipped', desc: 'Your recent order #RP-1002 is on the way.', time: '2 hours ago', icon: <Package size={16} color="var(--color-primary)" /> },
          { id: 2, type: 'system', title: 'Refill Reminder', desc: 'Time to request a refill for your protocol.', time: '1 day ago', icon: <Bell size={16} color="#f59e0b" /> }
        ];
      default:
        return [
          { id: 1, type: 'system', title: 'Welcome to RegenPept', desc: 'Explore our catalog of peptides and protocols.', time: 'Just now', icon: <Bell size={16} color="var(--color-primary)" /> }
        ];
    }
  };

  const notifications = getNotifications();

  return (
    <>
      <div className="dropdown-overlay" aria-hidden="true" onClick={onClose} />
      
      <div 
        role="dialog" 
        className="dropdown-panel" 
        style={{ right: '-10px', width: '320px', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
        </div>
        
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {notifications.map(notif => (
            <div key={notif.id} style={{ 
              padding: '1rem', 
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-soft)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                backgroundColor: 'rgba(0, 113, 189, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              }}>
                {notif.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notif.title}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {notif.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--background)' }}>
          <button style={{ 
            background: 'none', border: 'none', color: 'var(--text-main)', 
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' 
          }}>
            View All Activity
          </button>
        </div>
      </div>
    </>
  );
}
