/**
 * RefillReminderBanner.jsx
 *
 * Displays pending refill reminders for any authenticated role.
 * Each card shows product name, patient name (for doctor/wholesaler/admin),
 * days since delivery, and a dismiss button.
 *
 * Props:
 *   role        — 'patient' | 'doctor' | 'wholesaler' | 'admin'
 *   onNavigate  — optional callback(orderId) to navigate to the related order
 *
 * Usage:
 *   <RefillReminderBanner role="doctor" onNavigate={(id) => navigate(`/orders/${id}`)} />
 */
import { useRefillReminders } from '../../hooks/useRefillReminders';
import { Bell, X, RefreshCw } from 'lucide-react';

// Role-specific colours
const ROLE_PALETTE = {
  patient:    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)', icon: '🔔' },
  doctor:     { accent: 'var(--color-primary)', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.2)',  icon: '🩺' },
  wholesaler: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)', icon: '📦' },
  admin:      { accent: 'var(--color-danger)', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   icon: '⚡' },
};

export default function RefillReminderBanner({ role = 'patient', onNavigate }) {
  const { pendingReminders, dismissReminder, loading } = useRefillReminders(role);
  const palette = ROLE_PALETTE[role] || ROLE_PALETTE.patient;

  if (loading || pendingReminders.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Section label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.65rem',
      }}>
        <Bell size={14} color={palette.accent} />
        <span style={{
          fontSize: '0.72rem', fontWeight: 800,
          color: palette.accent, textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {pendingReminders.length} Refill reminder{pendingReminders.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      {pendingReminders.map(r => {
        // Days since delivery
        const deliveredDate = r.deliveredAt?.toDate ? r.deliveredAt.toDate() : null;
        const daysSince = deliveredDate
          ? Math.floor((Date.now() - deliveredDate.getTime()) / 86400000)
          : null;

        return (
          <div
            key={r.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.9rem',
              padding: '0.85rem 1rem', borderRadius: '14px',
              background: palette.bg,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: '0.55rem',
              cursor: onNavigate ? 'pointer' : 'default',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onClick={() => onNavigate?.(r.orderId || r.id)}
            onMouseEnter={e => { if (onNavigate) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
          >
            {/* Icon */}
            <div style={{
              width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
              background: `${palette.accent}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              {palette.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 800, fontSize: '0.83rem', color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {r.productName}
                {r.itemCount > 1 && (
                  <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                    {' '}+{r.itemCount - 1} more item{r.itemCount > 2 ? 's' : ''}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '0.68rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {/* Show patient name to doctor/wholesaler/admin */}
                {role !== 'patient' && r.patientName && (
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    {r.patientName}
                    {' · '}
                  </span>
                )}
                {daysSince !== null
                  ? `Delivered ${daysSince} day${daysSince !== 1 ? 's' : ''} ago — 30-day refill window`
                  : '30-day refill reminder'}
                {role === 'admin' && r.doctorName && (
                  <span style={{ marginLeft: '0.35rem', color: 'var(--color-text-tertiary)' }}>
                    · Dr. {r.doctorName}
                  </span>
                )}
              </div>
            </div>

            {/* Refill action (patient only) */}
            {role === 'patient' && (
              <button
                onClick={e => { e.stopPropagation(); onNavigate?.(r.orderId || r.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none',
                  background: palette.accent, color: 'var(--color-bg-surface)',
                  fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer',
                  fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                <RefreshCw size={11} />
                Refill
              </button>
            )}

            {/* Dismiss (all roles) */}
            <button
              onClick={e => { e.stopPropagation(); dismissReminder(r.id); }}
              title="Dismiss reminder"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-tertiary)', padding: '0.25rem', display: 'flex',
                alignItems: 'center', borderRadius: '6px', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
