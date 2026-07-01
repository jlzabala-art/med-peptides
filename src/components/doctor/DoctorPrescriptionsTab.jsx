import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import Plus from 'lucide-react/dist/esm/icons/plus';
import User from 'lucide-react/dist/esm/icons/user';
import Building from 'lucide-react/dist/esm/icons/building';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Activity from 'lucide-react/dist/esm/icons/activity';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Search from 'lucide-react/dist/esm/icons/search';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Package from 'lucide-react/dist/esm/icons/package';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FilePlus from 'lucide-react/dist/esm/icons/file-plus';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RX_STATUS_META, RX_TYPE, RX_STATUS, rxEvent } from '../../config/prescriptionConfig';
import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import { useDataTable } from '../../hooks/ui/useDataTable';
import { useSwipeAction } from '../../hooks/ui/useSwipeAction';
import DoctorPrescriptionBuilder from './DoctorPrescriptionBuilder';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import PrescriptionDetailModal from '../prescriptions/PrescriptionDetailModal';

// ── Responsive CSS ────────────────────────────────────────────────────────────
const responsiveStyles = `
  .responsive-table-container {
    width: 100%;
    overflow-x: auto;
  }
  .flexible-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }
  .flexible-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
  }
  .flexible-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .flexible-row {
    transition: all 0.2s ease;
    cursor: pointer;
    background: white;
  }
  .flexible-row:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    .flexible-table thead {
      display: none;
    }
    .flexible-table, .flexible-table tbody, .flexible-table tr, .flexible-table td {
      display: block;
      width: 100%;
    }
    .flexible-row {
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .flexible-table td {
      border-bottom: none;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flexible-table td::before {
      content: attr(data-label);
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-right: 1rem;
    }
    .flexible-table td:first-child {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    
    /* Swipe action container for mobile rows */
    .swipe-container {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      background: #f8fafc; /* Color behind the swiped card */
    }
    .swipe-actions-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem;
      z-index: 1;
    }
    .swipe-actions-layer .left-action {
      color: #dc2626; /* Cancel / Delete red */
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .swipe-actions-layer .right-action {
      color: #6366f1; /* Copy blue */
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    /* Modify flexible-row for swipe support */
    .flexible-row {
      position: relative;
      z-index: 2; /* Sit above the swipe actions layer */
      border: none;
      margin-bottom: 0;
      border-radius: 12px;
    }
  }
  
  .smart-chip {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
  }
  .smart-chip.active {
    background: #0f172a;
    color: white;
    border: 1px solid #0f172a;
  }
  .smart-chip.inactive {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .smart-chip.inactive:hover {
    border-color: #94a3b8;
    color: #334155;
  }
`;

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft: { label: 'Draft', emoji: '📝', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  sent: { label: 'Sent', emoji: '📨', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  viewed_by_patient: {
    label: 'Viewed',
    emoji: '👁️',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  assigned_to_wholesaler: {
    label: 'Awaiting Review',
    emoji: '🟡',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  added_to_bulk: {
    label: 'In Bulk Order',
    emoji: '🟣',
    color: '#7c3aed',
    bg: '#ede9fe',
    border: '#c4b5fd',
  },
  ordered: { label: 'Ordered', emoji: '✅', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  fulfilled: {
    label: 'Fulfilled',
    emoji: '🔵',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  expired: { label: 'Expired', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  cancelled: {
    label: 'Cancelled',
    emoji: '❌',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
  },
};

function getStatusMeta(status) {
  return (
    STATUS_CONFIG[status] ||
    RX_STATUS_META[status] || {
      label: status || 'Unknown',
      emoji: '⚪',
      color: '#6b7280',
      bg: '#f9fafb',
      border: '#e5e7eb',
    }
  );
}

// ── Uniform KPI Summary Bar ───────────────────────────────────────────────────
function UniformKPIs({ data }) {
  const total = data.length;
  const draft = data.filter((d) => d.status === 'draft').length;
  const active = data.filter((d) =>
    ['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'added_to_bulk', 'ordered'].includes(
      d.status
    )
  ).length;
  const fulfilled = data.filter((d) => ['fulfilled'].includes(d.status)).length;

  const expiringSoon = data.filter((d) => {
    if (!['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'ordered'].includes(d.status))
      return false;
    if (d.followUpDate) {
      const followUp = new Date(d.followUpDate);
      const now = new Date();
      const diffDays = (followUp - now) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 14;
    }
    return false;
  }).length;

  const stats = [
    { label: 'Total Prescriptions', value: total, color: '#3b82f6', icon: <FileText size={16} /> },
    { label: 'Drafts', value: draft, color: '#6b7280', icon: <Clock size={16} /> },
    { label: 'Active', value: active, color: '#10b981', icon: <Activity size={16} /> },
    { label: 'Fulfilled', value: fulfilled, color: '#6366f1', icon: <CheckCircle2 size={16} /> },
    {
      label: 'Expiring Soon (< 14d)',
      value: expiringSoon,
      color: '#ef4444',
      icon: <AlertCircle size={16} />,
    },
  ];

  return (
    <div
      className="kpi-scroll-row"
      style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 200px',
            minWidth: 180,
            background: 'white',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <div
              style={{
                color: s.color,
                background: s.color + '15',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              {s.icon}
            </div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {s.label}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Smart Chips ───────────────────────────────────────────────────────────────
function SmartChips({ activeChip, setActiveChip }) {
  const chips = [
    { id: 'all', label: 'All Prescriptions', icon: <Package size={14} /> },
    { id: 'draft', label: 'Drafts', icon: <Clock size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'recent', label: 'Recent (7 Days)', icon: <Calendar size={14} /> },
  ];

  return (
    <div
      className="smart-chips-bar"
      style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          className={`smart-chip ${activeChip === chip.id ? 'active' : 'inactive'}`}
          onClick={() => setActiveChip(chip.id)}
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}

// ── Patient Avatar ────────────────────────────────────────────────────────────
function PatientAvatar({ name, isCorp = false, size = 40 }) {
  if (isCorp) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Building size={size * 0.45} color="#0284c7" />
      </div>
    );
  }
  const initials = (name || '??')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `hsl(${hue}, 60%, 88%)`,
        color: `hsl(${hue}, 50%, 35%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// ── Flexible Table ────────────────────────────────────────────────────────────
function FlexibleTable({ data, onRowClick, t, onCopy, onCancel, isPending }) {
  return (
    <div className="responsive-table-container">
      <table className="flexible-table">
        <thead>
          <tr>
            <th>Patient / Entity</th>
            <th>Protocol / Diagnosis</th>
            <th>Source & Items</th>
            <th>Status</th>
            <th>Dates</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rx) => {
            const isCorp = rx.type === RX_TYPE.CLINIC_SUPPLY;
            const patient = isCorp
              ? t
                ? t('doctor.prescriptions_list.clinic_supply')
                : 'Clinic Supply'
              : rx.patient?.name || rx.patientName || 'Unknown Patient';
            const protocol = rx.protocol || rx.protocolName || '—';
            const diagnosis = rx.diagnosis || '—';
            const source = rx.source || rx.type || 'Manual';
            const apiCount = (rx.items || rx.products || []).length;
            const followUp = rx.followUpDate || rx.followUp || '—';
            const date = rx.createdAt?.toDate
              ? rx.createdAt
                  .toDate()
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : rx.dateIssued || '—';
            const meta = getStatusMeta(rx.status);
            const isFinal = ['fulfilled', 'cancelled', 'expired'].includes(rx.status);
            const isDraft = rx.status === RX_STATUS.DRAFT;

            return (
              <SwipeableRow
                key={rx.id}
                rx={rx}
                onRowClick={onRowClick}
                onCopy={onCopy}
                onCancel={onCancel}
                isFinal={isFinal}
                isDraft={isDraft}
              >
                <td data-label="Patient / Entity">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PatientAvatar name={patient} isCorp={isCorp} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {patient}
                      </div>
                      {rx.patient?.email && !isCorp && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {rx.patient.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td data-label="Protocol">
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    {protocol}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{diagnosis}</div>
                </td>

                <td data-label="Source & APIs">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    <FilePlus size={14} color="#f59e0b" /> {source}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      marginTop: '0.2rem',
                    }}
                  >
                    <FlaskConical size={12} color="#8b5cf6" /> {apiCount} item
                    {apiCount !== 1 ? 's' : ''}
                  </div>
                </td>

                <td data-label="Status">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                </td>

                <td data-label="Dates">
                  <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                    <span style={{ color: '#94a3b8' }}>Issued:</span> {date}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    <span style={{ color: '#94a3b8' }}>Follow-up:</span> {followUp}
                  </div>
                </td>

                <td data-label="Actions" style={{ textAlign: 'right' }}>
                  <div
                    style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      title="Copy"
                      onClick={() => onCopy(rx)}
                      style={{
                        padding: '5px 8px',
                        background: '#e0e7ff',
                        color: '#6366f1',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                    {!isFinal && !isDraft && (
                      <button
                        title="Cancel"
                        onClick={() => onCancel(rx)}
                        disabled={isPending}
                        style={{
                          padding: '5px 8px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    )}
                    <button
                      style={{
                        padding: '5px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => onRowClick(rx)}
                    >
                      <ChevronRight size={18} color="#94a3b8" />
                    </button>
                  </div>
                </td>
              </SwipeableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Swipeable Row Component ───────────────────────────────────────────────────
function SwipeableRow({ rx, children, onRowClick, onCopy, onCancel, isFinal, isDraft }) {
  const { handlers, offset, style, isSwiping } = useSwipeAction({
    onSwipeLeft: () => onCopy(rx),
    onSwipeRight: !isFinal && !isDraft ? () => onCancel(rx) : undefined,
    threshold: 80,
  });

  return (
    <React.Fragment>
      <tr
        className="desktop-only flexible-row"
        onClick={() => onRowClick(rx)}
        style={{ display: 'none' }}
      >
        {children}
      </tr>
      <tr className="mobile-only-row" style={{ display: 'table-row', width: '100%' }}>
        <td colSpan="100%" style={{ padding: 0, border: 'none' }}>
          <div className="swipe-container" {...handlers}>
            <div className="swipe-actions-layer">
              <div className="left-action" style={{ opacity: Math.min(offset / 80, 1) }}>
                {!isFinal && !isDraft && (
                  <>
                    <XCircle size={20} /> Cancel
                  </>
                )}
              </div>
              <div className="right-action" style={{ opacity: Math.min(-offset / 80, 1) }}>
                <>
                  <Copy size={20} /> Copy
                </>
              </div>
            </div>
            <div
              className="flexible-row"
              onClick={() => {
                if (!isSwiping) onRowClick(rx);
              }}
              style={{ ...style, cursor: isSwiping ? 'grabbing' : 'pointer' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ display: 'block' }}>{children}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
      <style>{`
        .mobile-only-row { display: none !important; }
        .desktop-only { display: table-row !important; }
        @media (max-width: 768px) {
          .mobile-only-row { display: table-row !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </React.Fragment>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DoctorPrescriptionsTab({
  doctorId,
  doctorMeta,
  patients = [],
  initialBuilderOpen = false,
  hideHistory = false,
  onSavedRedirect,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [builderData, setBuilderData] = useState(initialBuilderOpen ? {} : null);
  const [activeChip, setActiveChip] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedRx, setSelectedRx] = useState(null);

  // 1. Data Fetching
  const {
    data: prescriptions,
    isLoading,
    updateDoc: updateRx,
    isUpdating,
  } = useFirestoreCollection('prescriptions', {
    whereConditions: doctorId ? [['doctorId', '==', doctorId]] : [],
    orderByFields: [['createdAt', 'desc']],
    enabled: !!doctorId,
  });

  const doCancel = (rx) => {
    if (!window.confirm(t('doctor.prescriptions_list.cancel_confirm'))) return;
    updateRx({
      id: rx.id,
      updates: {
        status: RX_STATUS.CANCELLED,
        timeline: [
          ...(rx.timeline || []),
          { ...rxEvent('cancelled', doctorId, 'doctor'), timestamp: new Date().toISOString() },
        ],
      },
    });
  };

  const doCopy = (rx) => {
    setBuilderData({
      items: rx.items || [],
      patient: rx.patient || null,
      type: rx.type || 'patient',
      diagnosis: rx.diagnosis || '',
      clinicalNotes: rx.clinicalNotes || '',
      delivery: rx.delivery || { method: 'direct_patient' },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Custom Filter Function for Smart Chips and Dropdown
  const customFilter = (rx) => {
    // Smart Chip filtering
    if (activeChip === 'draft' && rx.status !== 'draft') return false;
    if (
      activeChip === 'active' &&
      !['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'added_to_bulk', 'ordered'].includes(
        rx.status
      )
    )
      return false;
    if (activeChip === 'recent') {
      if (rx.createdAt) {
        const createdAtDate = new Date(rx.createdAt);
        const diffDays = (new Date() - createdAtDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else {
        return false;
      }
    }

    if (filterType !== 'all' && rx.type !== filterType) return false;

    return true;
  };

  // 3. DataTable state (Search, Filter, Paginate)
  const {
    paginatedData: filtered,
    search,
    setSearch,
  } = useDataTable(prescriptions, {
    filterFn: customFilter,
    searchFields: ['patient.name', 'patient.email', 'diagnosis', 'items.0.name'],
    initialPageSize: 100,
  });

  if (hideHistory) {
    return (
      <Card>
        <DoctorPrescriptionBuilder
          doctorId={doctorId}
          doctorMeta={doctorMeta}
          patients={patients}
          prefilledData={builderData || {}}
          onSaved={(isDraft) => {
            if (onSavedRedirect) onSavedRedirect();
            else if (isDraft) setBuilderData(null);
            queryClient.invalidateQueries(['prescriptions', doctorId]);
          }}
        />
      </Card>
    );
  }

  return (
    <>
      <style>{responsiveStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClipboardList size={16} color="white" />
              </div>
              {t('doctor.prescriptions_list.rx_history')}
            </h2>
            <p style={{ color: '#64748b', margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
              System of record for all patient prescriptions and recommendations.
            </p>
          </div>
          <button
            onClick={() => setBuilderData(builderData !== null ? null : {})}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
            }}
          >
            <Plus size={16} />{' '}
            {builderData !== null
              ? t('doctor.prescriptions_list.hide_form')
              : t('doctor.prescriptions_list.new_rx')}
          </button>
        </div>

        {!isLoading && <UniformKPIs data={prescriptions} />}

        {builderData !== null && (
          <Card>
            <DoctorPrescriptionBuilder
              doctorId={doctorId}
              doctorMeta={doctorMeta}
              patients={patients}
              prefilledData={builderData}
              onSaved={(isDraft) => {
                if (onSavedRedirect) onSavedRedirect();
                else if (isDraft) setBuilderData(null);
                queryClient.invalidateQueries(['prescriptions', doctorId]);
              }}
            />
          </Card>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <SmartChips activeChip={activeChip} setActiveChip={setActiveChip} />

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flex: '1 1 300px',
              justifyContent: 'flex-end',
            }}
          >
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="all">{t('doctor.prescriptions_list.all_types')}</option>
              <option value="patient">{t('doctor.prescriptions_list.for_patient')}</option>
              <option value="clinic_supply">
                {t('doctor.prescriptions_list.clinic_supply_opt')}
              </option>
            </select>

            <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder={t('doctor.prescriptions_list.filter_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Spinner text="Loading prescriptions..." />
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '5rem 2rem',
              gap: '1rem',
              color: '#94a3b8',
              background: 'white',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClipboardList size={26} color="#cbd5e1" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontWeight: 700,
                  color: '#475569',
                  margin: '0 0 0.25rem',
                  fontSize: '1rem',
                }}
              >
                {t('doctor.prescriptions_list.no_rx_found')}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {search || activeChip !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Create your first prescription using the button above.'}
              </p>
            </div>
          </div>
        ) : (
          <FlexibleTable
            data={filtered}
            onRowClick={setSelectedRx}
            t={t}
            onCopy={doCopy}
            onCancel={doCancel}
            isPending={isUpdating}
          />
        )}

        {/* Detail Modal */}
        {selectedRx && (
          <PrescriptionDetailModal rx={selectedRx} onClose={() => setSelectedRx(null)} />
        )}
      </div>
    </>
  );
}
