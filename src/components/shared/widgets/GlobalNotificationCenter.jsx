import Bell from "lucide-react/dist/esm/icons/bell";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Database from "lucide-react/dist/esm/icons/database";
import X from "lucide-react/dist/esm/icons/x";
import Settings from "lucide-react/dist/esm/icons/settings";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState, useRef, useEffect } from 'react';







import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'critical',
    title: 'BPC-157 UAE Registration Expired',
    message: 'Product is now hidden in UAE. Upload renewed CoA.',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: '#fef2f2',
    action: '/admin/pricing-visibility'
  },
  {
    id: 2,
    type: 'warning',
    title: '3 Zoho Books Conflicts',
    message: 'SKU mapping errors detected during the last sync.',
    time: '4 hours ago',
    icon: Database,
    color: '#f59e0b',
    bg: '#fffbeb',
    action: '/admin/pricing-visibility'
  },
  {
    id: 3,
    type: 'info',
    title: '15 Prescriptions Pending',
    message: 'New prescriptions require AI validation review.',
    time: '1 day ago',
    icon: Clock,
    color: '#0071bd',
    bg: '#eff6ff',
    action: '/admin/prescriptions'
  }
];

export default function GlobalNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.length;
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background 0.2s',
          color: '#64748b'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '2px solid white'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '360px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Action Center</h3>
            <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
              <Settings size={16} />
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontWeight: 500 }}>All caught up!</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>No pending actions required.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div 
                    key={notif.id}
                    onClick={() => handleAction(notif.action)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: notif.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={18} color={notif.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{notif.title}</h4>
                        <button 
                          onClick={(e) => removeNotification(e, notif.id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>{notif.message}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{notif.time}</span>
                        <span style={{ fontSize: '12px', color: '#0071bd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Resolve <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', textAlign: 'center', background: '#f8fafc' }}>
              <button 
                onClick={() => setNotifications([])}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}