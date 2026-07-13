import React from 'react';
import { Stethoscope, FilePlus, FlaskConical, ChevronRight } from '@/lib/icons';

// ── Status Configuration ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active: { label: 'Active', emoji: '🟢', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  active: { label: 'Active', emoji: '🟢', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  sent: { label: 'Sent', emoji: '📨', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  draft: { label: 'Draft', emoji: '📝', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  fulfilled: {
    label: 'Fulfilled',
    emoji: '🔵',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  Fulfilled: {
    label: 'Fulfilled',
    emoji: '🔵',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  expired: { label: 'Expired', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  Expired: { label: 'Expired', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  cancelled: {
    label: 'Cancelled',
    emoji: '❌',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  assigned_to_wholesaler: {
    label: 'Awaiting Review',
    emoji: '🟡',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  viewed_by_patient: {
    label: 'Viewed by Patient',
    emoji: '👁️',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  added_to_bulk: {
    label: 'In Bulk Order',
    emoji: '🟣',
    color: '#7c3aed',
    bg: '#ede9fe',
    border: '#c4b5fd',
  },
  ordered: { label: 'Ordered', emoji: '✅', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
};

function getStatusMeta(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || 'Unknown',
      emoji: '⚪',
      color: '#6b7280',
      bg: '#f9fafb',
      border: '#e5e7eb',
    }
  );
}

// ── Patient Avatar ────────────────────────────────────────────────────────────
function PatientAvatar({ name, size = 40 }) {
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

// ── Columns Definition ────────────────────────────────────────────────────────
export const getPrescriptionColumns = () => {
  return [
    {
      key: 'patient',
      header: 'Patient & Doctor',
      render: (rx) => {
        const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
        const doctor = rx.doctor?.name || rx.doctorName || '—';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PatientAvatar name={patient} />
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                {patient}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Stethoscope size={12} /> Dr. {doctor}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'protocol',
      header: 'Protocol / Diagnosis',
      render: (rx) => {
        const protocolObj = rx.protocol || rx.protocolName || '—';
        const protocol = typeof protocolObj === 'object' ? (protocolObj.name || protocolObj.id || '—') : protocolObj;
        
        const diagnosisObj = rx.diagnosis || '—';
        const diagnosis = typeof diagnosisObj === 'object' ? (diagnosisObj.primary || diagnosisObj.description || '—') : diagnosisObj;
        return (
          <>
            <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              {protocol}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{diagnosis}</div>
          </>
        );
      },
    },
    {
      key: 'source',
      header: 'Source & Items',
      render: (rx) => {
        const source = rx.source || rx.type || 'Manual';
        const apiCount = (rx.items || rx.products || []).length;
        return (
          <>
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
          </>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (rx) => {
        const meta = getStatusMeta(rx.status);
        return (
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
        );
      },
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (rx) => {
        let followUp = rx.followUpDate || rx.followUp || '—';
        if (typeof followUp === 'object' && followUp !== null) {
          followUp = followUp.afterMonths ? `In ${followUp.afterMonths} months` : 'Scheduled';
        }
          
        const date = rx.createdAt
          ? new Date(rx.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : rx.dateIssued || '—';
        
        return (
          <>
            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
              <span style={{ color: '#94a3b8' }}>Issued:</span> {date}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              <span style={{ color: '#94a3b8' }}>Follow-up:</span> {followUp}
            </div>
          </>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: () => <ChevronRight size={18} color="#94a3b8" />
    }
  ];
};
