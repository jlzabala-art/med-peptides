import React from 'react';
import { Clock, User } from 'lucide-react';
import { StatusChip } from '../ui';

/**
 * ERPActivityTimeline
 * Renders a vertical timeline of status changes and activity events.
 *
 * @param {Array} events - Array of { status, changedAt, changedBy, note }
 * @param {string} currentStatus - Current document status (highlighted at top)
 */
export default function ERPActivityTimeline({ events = [], currentStatus }) {
  // Sort newest first
  const sorted = [...events].sort((a, b) => {
    const ta = a.changedAt?.toDate ? a.changedAt.toDate() : new Date(a.changedAt || 0);
    const tb = b.changedAt?.toDate ? b.changedAt.toDate() : new Date(b.changedAt || 0);
    return tb - ta;
  });

  if (sorted.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((event, idx) => {
        const date = event.changedAt?.toDate
          ? event.changedAt.toDate()
          : new Date(event.changedAt || 0);

        const isFirst = idx === 0;

        return (
          <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '1rem' }}>
            {/* Timeline line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '20px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: isFirst ? '#2563eb' : '#cbd5e1',
                border: isFirst ? '2px solid #bfdbfe' : '2px solid #e2e8f0',
                marginTop: '3px', flexShrink: 0,
              }} />
              {idx < sorted.length - 1 && (
                <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', marginTop: '4px', minHeight: '24px' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <StatusChip status={event.status} size="sm" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={10} />
                  {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' '}
                  {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.changedBy && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={10} />
                  {event.changedBy}
                </div>
              )}
              {event.note && (
                <div style={{ marginTop: '4px', fontSize: '0.82rem', color: '#475569', backgroundColor: '#f8fafc', borderLeft: '3px solid #e2e8f0', paddingLeft: '0.5rem', borderRadius: '0 4px 4px 0' }}>
                  {event.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
