import React from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Clock from 'lucide-react/dist/esm/icons/clock';

export function ComplianceTimeline({ profiles, onSelectProfile }) {
  // Aggregate all expiries
  const events = [];
  profiles.forEach((p) => {
    Object.entries(p.expiryDates).forEach(([docType, dateStr]) => {
      if (!dateStr) return;
      const date = new Date(dateStr);
      const daysUntil = (date - new Date()) / 86400000;

      if (daysUntil >= -30 && daysUntil <= 90) {
        // Show recently expired to next 90 days
        events.push({
          id: `${p.id}-${docType}`,
          profile: p,
          docType: docType.toUpperCase(),
          date,
          daysUntil: Math.ceil(daysUntil),
        });
      }
    });
  });

  events.sort((a, b) => a.date - b.date);

  // Group by timeframe
  const grouped = {
    'Already Expired / Critical': events.filter((e) => e.daysUntil <= 0),
    'Next 30 Days': events.filter((e) => e.daysUntil > 0 && e.daysUntil <= 30),
    'Next 60 Days': events.filter((e) => e.daysUntil > 30 && e.daysUntil <= 60),
    'Next 90 Days': events.filter((e) => e.daysUntil > 60 && e.daysUntil <= 90),
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '24px',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#111827',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Calendar size={20} color="#4f46e5" /> Compliance Renewal Timeline
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {Object.entries(grouped).map(([label, timeEvents]) => {
          if (timeEvents.length === 0) return null;

          const isCritical = label.includes('Critical');

          return (
            <div key={label}>
              <h4
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isCritical ? '#ef4444' : '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '16px',
                  borderBottom: `1px solid ${isCritical ? '#fecaca' : '#e5e7eb'}`,
                  paddingBottom: '8px',
                }}
              >
                {label} ({timeEvents.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {timeEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onSelectProfile(event.profile)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#9ca3af')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor:
                            event.daysUntil <= 0
                              ? '#fee2e2'
                              : event.daysUntil <= 30
                                ? '#ffedd5'
                                : '#e0e7ff',
                          color:
                            event.daysUntil <= 0
                              ? '#ef4444'
                              : event.daysUntil <= 30
                                ? '#f59e0b'
                                : '#4f46e5',
                        }}
                      >
                        {event.daysUntil <= 0 ? <AlertTriangle size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                          {event.docType} Expiry: {event.profile.productName}{' '}
                          {event.profile.variantName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                          {event.profile.supplier} • {event.profile.market}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: event.daysUntil <= 0 ? '#ef4444' : '#111827',
                        }}
                      >
                        {event.date.toLocaleDateString()}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: event.daysUntil <= 0 ? '#ef4444' : '#6b7280',
                        }}
                      >
                        {event.daysUntil <= 0
                          ? `${Math.abs(event.daysUntil)} days ago`
                          : `in ${event.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
