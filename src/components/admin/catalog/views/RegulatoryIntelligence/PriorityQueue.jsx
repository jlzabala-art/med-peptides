import React from 'react';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';

export function PriorityQueue({ queue, onSelectProfile }) {
  const getSeverityColor = (type) => {
    switch (type) {
      case 'Critical':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'High':
        return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} color="#ef4444" />
          Priority Action Queue
        </h3>
      </div>
      <div
        style={{
          padding: '16px',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '400px',
        }}
      >
        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '24px 0' }}>
            No pending actions required.
          </div>
        ) : (
          queue.map((item) => {
            const colors = getSeverityColor(item.type);
            return (
              <div
                key={item.id}
                onClick={() => onSelectProfile(item.profile)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: colors.bg,
                      color: colors.text,
                    }}
                  >
                    {item.type}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={12} /> Action Required
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  {item.profile.productName} {item.profile.variantName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '4px' }}>
                  {item.profile.supplier} • {item.profile.market}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: colors.text,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertCircle size={14} /> {item.issue}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
