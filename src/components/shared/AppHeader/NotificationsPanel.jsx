import Bell from "lucide-react/dist/esm/icons/bell";
import Package from "lucide-react/dist/esm/icons/package";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState } from 'react';









import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import '../../../styles/header.css'; 

function formatTimeAgo(date) {
  if (!date) return 'Just now';
  const timestamp = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

const getIconForType = (type) => {
  switch (type) {
    case 'alert':
    case 'error': return <AlertCircle size={16} color="var(--color-danger)" />;
    case 'warning': return <ShieldAlert size={16} color="#f59e0b" />;
    case 'order': return <Package size={16} color="var(--color-success)" />;
    case 'lab': return <FlaskConical size={16} color="#06b6d4" />;
    case 'system': return <CheckCircle2 size={16} color="var(--color-success)" />;
    case 'document': return <FileText size={16} color="var(--color-primary)" />;
    default: return <Bell size={16} color="var(--color-primary)" />;
  }
};

export default function NotificationsPanel({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'alerts') return n.type === 'alert' || n.type === 'warning' || n.priority === 'high';
    return true;
  });

  return (
    <>
      <div className="dropdown-overlay" aria-hidden="true" onClick={onClose} />
      <div 
        role="dialog" 
        className="dropdown-panel" 
        style={{ right: '-10px', width: '340px', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Notifications {unreadCount > 0 && <span style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem', marginLeft: '0.5rem' }}>{unreadCount}</span>}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Check size={12} /> Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1rem', gap: '1rem' }}>
          {['all', 'unread', 'alerts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                fontSize: '0.75rem',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>No notifications</div>
              <div style={{ fontSize: '0.7rem' }}>You're all caught up!</div>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div key={notif.id} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                gap: '0.75rem',
                cursor: 'pointer',
                backgroundColor: notif.read ? 'transparent' : 'var(--primary-light)',
                transition: 'background 0.15s'
              }}
              onClick={() => {
                if (!notif.read) markAsRead(notif.id);
                // Optionally handle navigation via notif.link here if present
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'var(--accent-soft)' : 'var(--primary-light)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'var(--primary-light)'}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  backgroundColor: 'var(--surface-raised)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  {getIconForType(notif.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: notif.read ? 600 : 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: notif.read ? 'var(--text-muted)' : 'var(--primary)', fontWeight: notif.read ? 400 : 700 }}>
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: notif.read ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: 1.4 }}>
                    {notif.desc || notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', alignSelf: 'center' }} />
                )}
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--background)' }}>
          <button 
            onClick={() => {
              // Optionally dispatch custom event to open the centralized Notification Hub
              window.dispatchEvent(new CustomEvent('nav:notifications'));
              onClose();
            }}
            style={{ 
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