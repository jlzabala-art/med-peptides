import React from 'react';
import { MoreVertical, Mail, Users, FileText, CheckCircle2, Square, CheckSquare } from 'lucide-react';
import StatusChip from '../../../ui/StatusChip';
import SwipeableCard from '../../../ui/SwipeableCard';
import CopyableId from '../../../ui/CopyableId';

export default function MobileDoctorCard({ 
  row: doctor, 
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction 
}) {
  const timer = React.useRef(null);
  const handleTouchStart = React.useCallback(() => {
    timer.current = setTimeout(() => onLongPress?.(), 500);
  }, [onLongPress]);
  const cancelLongPress = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleTap = React.useCallback(() => {
    cancelLongPress();
    if (selectionMode) onToggleSelect?.();
    else onRowClick?.(doctor);
  }, [selectionMode, onToggleSelect, onRowClick, doctor, cancelLongPress]);

  if (!doctor) return null;

  const getDoctorName = (d) => {
    if (d.displayName) return d.displayName;
    const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
    if (name) return `Dr. ${name}`;
    if (d.email) return d.email;
    return 'Unknown Physician';
  };

  const getPatientsCount = (d) => {
    return d.patientCount || (d.patients ? d.patients.length : 0);
  };
  
  const getPrescriptionsCount = (d) => {
    return d.prescriptionCount || (d.prescriptions ? d.prescriptions.length : 0);
  };

  const name = getDoctorName(doctor);
  const statusStr = doctor.isArchived ? 'archived' : (doctor.status || 'active');
  const pts = getPatientsCount(doctor);
  const rxs = getPrescriptionsCount(doctor);

  // Define swipe actions based on status
  const swipeActions = {
    left: [
      {
        icon: <CheckCircle2 size={20} />,
        label: 'Approve',
        color: '#16a34a', // Green
        onClick: () => onQuickAction && onQuickAction('approve', doctor),
      },
    ],
    right: [
      {
        icon: <Users size={20} />,
        label: 'Patients',
        color: '#2563eb', // Blue
        onClick: () => onQuickAction && onQuickAction('patients', doctor),
      }
    ]
  };

  return (
    <SwipeableCard {...swipeActions}>
      <div 
        className={`mobile-record-card${isSelected ? ' mrc-selected' : ''}`}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        style={{ position: 'relative' }}
      >
        {/* Selection checkbox (always visible) */}
        <div
          className="mptc-checkbox-container" // Reusing styling from protocol/patient cards or inline
          onClick={(e) => {
            if (!selectionMode) {
              e.stopPropagation();
              onToggleSelect?.();
            }
          }}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            color: isSelected ? 'var(--color-primary, #003666)' : 'var(--text-muted, #94a3b8)',
          }}
        >
          {isSelected ? <CheckSquare size={20} strokeWidth={2} /> : <Square size={20} strokeWidth={2} />}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', paddingLeft: '2.5rem' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.05rem', 
              fontWeight: 600, 
              color: 'var(--color-primary)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {name}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)',
              marginTop: '0.25rem'
            }}>
              <Mail size={12} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.email}</span>
            </div>
            {doctor.clinicName && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {doctor.specialty ? `${doctor.specialty} • ` : ''}{doctor.clinicName}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {!selectionMode ? (
              <button 
                className="mobile-quick-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onQuickAction) onQuickAction('menu', doctor);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem',
                  margin: '-0.25rem -0.25rem 0 0',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                <MoreVertical size={20} />
              </button>
            ) : <div style={{ width: 24 }} />}
            <StatusChip status={statusStr} />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '0.5rem', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '0.75rem',
          marginTop: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            <Users size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {pts} {pts === 1 ? 'Patient' : 'Patients'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            <FileText size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {rxs} {rxs === 1 ? 'Rx' : 'Rxs'}
            </span>
          </div>
        </div>
      </div>
    </SwipeableCard>
  );
}
