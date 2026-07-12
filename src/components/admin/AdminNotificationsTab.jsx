'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell, Package, AlertCircle, ShieldAlert, CheckCircle2,
  FlaskConical, FileText, Check, Trash2, Filter, RefreshCw,
  ArrowRight, Clock, ChevronRight, Inbox
} from '@/lib/icons';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(date) {
  if (!date) return 'Just now';
  const ts = date?.toDate ? date.toDate() : new Date(date);
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return ts.toLocaleDateString();
}

function formatFullTime(date) {
  if (!date) return '';
  const ts = date?.toDate ? date.toDate() : new Date(date);
  return ts.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const TYPE_CONFIG = {
  alert:    { icon: AlertCircle,   color: '#ef4444', bg: '#fef2f2', label: 'Alert' },
  error:    { icon: AlertCircle,   color: '#ef4444', bg: '#fef2f2', label: 'Error' },
  warning:  { icon: ShieldAlert,   color: '#f59e0b', bg: '#fffbeb', label: 'Warning' },
  order:    { icon: Package,       color: '#10b981', bg: '#f0fdf4', label: 'Order' },
  lab:      { icon: FlaskConical,  color: '#06b6d4', bg: '#ecfeff', label: 'Lab' },
  system:   { icon: CheckCircle2,  color: '#6366f1', bg: '#eef2ff', label: 'System' },
  document: { icon: FileText,      color: '#003666', bg: '#eff6ff', label: 'Document' },
  default:  { icon: Bell,          color: '#64748b', bg: '#f8fafc', label: 'General' },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const FILTER_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'unread',   label: 'Unread' },
  { id: 'alert',    label: 'Alerts' },
  { id: 'order',    label: 'Orders' },
  { id: 'lab',      label: 'Lab' },
  { id: 'system',   label: 'System' },
];

// ── Notification Card ─────────────────────────────────────────────────────────

function NotificationCard({ notif, onMarkRead, onNavigate }) {
  const cfg = getConfig(notif.type);
  const Icon = cfg.icon;
  const hasLink = !!notif.link;

  return (
    <div
      onClick={() => {
        if (!notif.read) onMarkRead(notif.id);
        if (hasLink) onNavigate(notif.link);
      }}
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-light, #f1f5f9)',
        cursor: hasLink || !notif.read ? 'pointer' : 'default',
        backgroundColor: notif.read ? 'transparent' : `${cfg.color}08`,
        borderLeft: notif.read ? '3px solid transparent' : `3px solid ${cfg.color}`,
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : `${cfg.color}08`}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        backgroundColor: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={cfg.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{
            fontSize: '0.88rem', fontWeight: notif.read ? 500 : 700,
            color: '#1e293b', lineHeight: 1.3,
          }}>
            {notif.title}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {formatTimeAgo(notif.createdAt)}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
          {notif.desc || notif.message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: cfg.color,
            backgroundColor: cfg.bg, padding: '2px 7px', borderRadius: 20,
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {formatFullTime(notif.createdAt)}
          </span>
          {hasLink && (
            <span style={{ fontSize: '0.7rem', color: '#003666', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
              View detail <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div style={{
          width: 9, height: 9, borderRadius: '50%',
          backgroundColor: cfg.color, alignSelf: 'center', flexShrink: 0,
        }} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminNotificationsTab() {
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'unread') return !n.read;
      return n.type === activeFilter || (activeFilter === 'alert' && (n.type === 'warning' || n.priority === 'high'));
    });
  }, [notifications, activeFilter]);

  // Count per filter tab
  const counts = useMemo(() => {
    const c = { all: notifications.length, unread: unreadCount };
    FILTER_TABS.slice(2).forEach(tab => {
      c[tab.id] = notifications.filter(n =>
        n.type === tab.id || (tab.id === 'alert' && (n.type === 'warning' || n.type === 'error' || n.priority === 'high'))
      ).length;
    });
    return c;
  }, [notifications, unreadCount]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
            Notifications
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: 8,
              background: '#003666', color: 'white', border: 'none',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1rem',
        borderBottom: '1px solid #e2e8f0', paddingBottom: '0',
        overflowX: 'auto',
      }}>
        {FILTER_TABS.map(tab => {
          const count = counts[tab.id] || 0;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '0.6rem 1rem', borderRadius: 0, border: 'none',
                borderBottom: isActive ? '2px solid #003666' : '2px solid transparent',
                background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                color: isActive ? '#003666' : '#64748b',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, minWidth: 18,
                  height: 18, borderRadius: 9, padding: '0 5px',
                  backgroundColor: isActive ? '#003666' : '#e2e8f0',
                  color: isActive ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{
        backgroundColor: 'white', borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Inbox size={24} color="#94a3b8" />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              No notifications
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {activeFilter === 'unread' ? 'All caught up — nothing unread.' : 'Nothing here yet.'}
            </div>
          </div>
        ) : (
          filtered.map(notif => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onMarkRead={markAsRead}
              onNavigate={(link) => router.push(link)}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
