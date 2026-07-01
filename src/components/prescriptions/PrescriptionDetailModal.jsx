import React, { useState } from 'react';
import {
  X,
  Edit,
  CheckCircle,
  Download,
  FileText,
  Send,
  User,
  Stethoscope,
  Activity,
  Clock,
  Calendar,
  Pill,
  FlaskConical,
  MoreHorizontal,
  ChevronDown,
  Upload,
  FileCheck,
  AlertCircle,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import StandardDrawer from '../ui/StandardDrawer';
import StandardDrawerTabs from '../common/StandardDrawerTabs';
import OverviewTab from './tabs/OverviewTab';

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

function StatusBadge({ status, large = false }) {
  const meta = getStatusMeta(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: large ? '0.45rem 1rem' : '0.3rem 0.7rem',
        borderRadius: '20px',
        background: meta.bg,
        color: meta.color,
        border: `1.5px solid ${meta.border}`,
        fontSize: large ? '0.9rem' : '0.75rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

function PatientAvatar({ name, size = 52 }) {
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
        fontSize: size * 0.34,
        border: `3px solid hsl(${hue}, 40%, 95%)`,
      }}
    >
      {initials}
    </div>
  );
}

// ── Tab Components ────────────────────────────────────────────────────────────

function OverviewTab({ rx }) {
  const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
  const patEmail = rx.patient?.email || rx.patientEmail || null;
  const patPhone = rx.patient?.phone || rx.patientPhone || null;
  const doctor = rx.doctor?.name || rx.doctorName || null;
  const docEmail = rx.doctor?.email || rx.doctorEmail || null;
  const manager = rx.accountManager || null;
  const diagnosis = rx.diagnosis || null;
  const protocol = rx.protocol || rx.protocolName || null;
  const notes = rx.clinicalNotes || rx.notes || null;

  const InfoRow = ({ icon: Icon, label, value, color = '#64748b' }) =>
    value ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.6rem 0',
          borderBottom: '1px solid #f8fafc',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={color} />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
          <div
            style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginTop: '0.1rem' }}
          >
            {value}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      {/* Left: Patient & Team */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Patient
          </div>
          <InfoRow icon={User} label="Name" value={patient} color="#6366f1" />
          <InfoRow icon={ArrowUpRight} label="Email" value={patEmail} color="#3b82f6" />
          <InfoRow icon={ArrowUpRight} label="Phone" value={patPhone} color="#3b82f6" />
        </div>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Care Team
          </div>
          <InfoRow icon={Stethoscope} label="Prescribing Doctor" value={doctor} color="#10b981" />
          <InfoRow icon={ArrowUpRight} label="Doctor Email" value={docEmail} color="#10b981" />
          {manager && (
            <InfoRow icon={User} label="Account Manager" value={manager} color="#f59e0b" />
          )}
        </div>
      </div>

      {/* Right: Clinical Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Clinical Information
          </div>
          {diagnosis ? (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Diagnosis
              </div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  fontWeight: 600,
                }}
              >
                {diagnosis}
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                fontStyle: 'italic',
                marginBottom: '0.75rem',
              }}
            >
              No diagnosis specified
            </div>
          )}
          {protocol && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Protocol
              </div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: '#6366f1',
                  fontWeight: 700,
                }}
              >
                {protocol}
              </div>
            </div>
          )}
        </div>
        {notes && (
          <div
            style={{
              background: '#fffbeb',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #fde68a',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#92400e',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.5rem',
              }}
            >
              Clinical Notes
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#78350f',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemsTab({ rx, products = [] }) {
  const items = rx.items || rx.products || [];

  const getProductDetails = (productId, fallbackName) => {
    if (!productId) return { name: fallbackName || 'Unknown Product' };
    const found = products.find((p) => p.id === productId);
    return found || { name: fallbackName || 'Unknown Product' };
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1rem',
          color: '#94a3b8',
        }}
      >
        <Pill size={40} color="#e2e8f0" />
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#475569', fontWeight: 700 }}>No Items</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No prescription items have been added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Desktop Table */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0',
            background: '#f8fafc',
            padding: '0.7rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {['Product', 'Dose', 'Frequency', 'Duration', 'Units'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '1rem 1.25rem',
              borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none',
              alignItems: 'center',
              gap: '0',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {(() => {
              const product = getProductDetails(item.productId, item.name || item.productName);
              return (
                <React.Fragment>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {product.name}
                      {!item.productId && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '0.65rem',
                            padding: '2px 4px',
                            background: '#fef08a',
                            color: '#854d0e',
                            borderRadius: '4px',
                          }}
                        >
                          Legacy Name
                        </span>
                      )}
                    </div>
                    {item.concentration && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {item.concentration}
                      </div>
                    )}
                    {item.category && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                    {item.dosage || item.dose || item.strength || '—'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {item.frequency || '—'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {item.duration || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>
                      {item.quantity || '—'}
                    </span>
                    {item.unit && (
                      <span
                        style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.25rem' }}
                      >
                        {item.unit}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpTab({ rx }) {
  const reviewInterval = rx.followUpInterval || rx.reviewInterval || null;
  const requiredTests = rx.requiredTests || rx.labTests || [];
  const followUpDate = rx.followUpDate || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Timeline Visual */}
      <div
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '14px',
          padding: '1.5rem',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '0.5rem',
          }}
        >
          Next Clinical Milestone
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {reviewInterval ||
            (followUpDate
              ? new Date(followUpDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Not Scheduled')}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
          {followUpDate
            ? `Scheduled for ${followUpDate}`
            : 'No follow-up date set — add one via the calendar.'}
        </div>
      </div>

      {/* Required Tests */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FlaskConical size={14} color="#6366f1" /> Required Tests
        </div>
        {requiredTests.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
            No required tests specified for this prescription.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {requiredTests.map((test, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.9rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} color="#6366f1" />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  {test}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({ rx }) {
  const documents = rx.documents || rx.attachments || [];

  if (documents.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1.25rem',
          border: '2px dashed #e2e8f0',
          borderRadius: '14px',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Upload size={28} color="#6366f1" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.35rem 0', color: '#334155', fontWeight: 700 }}>
            No Documents Attached
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: 300 }}>
            Upload patient consent forms, lab results, or supporting clinical documents.
          </p>
          <button
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {documents.map((doc, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileCheck size={20} color="#3b82f6" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
              {doc.name || `Document ${i + 1}`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              {doc.type || 'PDF'} · {doc.uploadedAt || 'Unknown date'}
            </div>
          </div>
          <button
            style={{
              padding: '0.4rem',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Download size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function TimelineTab({ rx }) {
  const timeline = [...(rx.timeline || [])].reverse();

  const getEventIcon = (event = '') => {
    if (event.includes('upload') || event.includes('document'))
      return { icon: Upload, color: '#3b82f6', bg: '#eff6ff' };
    if (event.includes('assign') || event.includes('manager'))
      return { icon: User, color: '#f59e0b', bg: '#fffbeb' };
    if (event.includes('update') || event.includes('edit'))
      return { icon: Edit, color: '#10b981', bg: '#ecfdf5' };
    if (event.includes('cancel') || event.includes('expired'))
      return { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' };
    if (event.includes('fulfill') || event.includes('deliver'))
      return { icon: CheckCircle, color: '#059669', bg: '#d1fae5' };
    if (event.includes('sent') || event.includes('send'))
      return { icon: Send, color: '#8b5cf6', bg: '#f5f3ff' };
    return { icon: Clock, color: '#64748b', bg: '#f8fafc' };
  };

  if (timeline.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '4rem 2rem',
          gap: '1rem',
          color: '#94a3b8',
        }}
      >
        <Clock size={36} color="#e2e8f0" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>No Timeline Events</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
            Events will appear here as the prescription progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: '19px',
          top: '28px',
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
          zIndex: 0,
        }}
      />

      {timeline.map((item, i) => {
        const { icon: Icon, color, bg } = getEventIcon(item.event || '');
        const date = item.timestamp
          ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '0.75rem 0',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: bg,
                border: `2px solid ${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={color} />
            </div>
            <div
              style={{
                flex: 1,
                background: 'white',
                border: '1px solid #f1f5f9',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {(item.event || '').replace(/_/g, ' ')}
                </div>
                {date && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                    }}
                  >
                    {date}
                  </span>
                )}
              </div>
              {item.note && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.3rem' }}>
                  {item.note}
                </div>
              )}
              {item.actorRole && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  By {item.actorRole}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Modal Component ──────────────────────────────────────────────────────
const TABS = ['Overview', 'Items', 'Follow-Up', 'Documents', 'Timeline'];

export default function PrescriptionDetailModal({ rx, products = [], onClose }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [moreOpen, setMoreOpen] = useState(false);

  if (!rx) return null;

  const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
  const protocol = rx.protocol || rx.protocolName || null;
  const date = rx.createdAt?.toDate
    ? rx.createdAt
        .toDate()
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : rx.dateIssued || '—';
  const doctor = rx.doctor?.name || rx.doctorName || null;
  const manager = rx.accountManager || null;

  const apiCount = (rx.items || rx.products || []).length;
  const duration = rx.duration || rx.items?.[0]?.duration || '—';
  const followUp = rx.followUpInterval || rx.reviewInterval || '—';
  const reqTests = (rx.requiredTests || rx.labTests || []).length;

  return (
    <StandardDrawer
      isOpen={true}
      onClose={onClose}
      title={`Prescription: ${patient}`}
      subtitle={`ID: ${(rx.id || '').slice(0, 10)}… | Created: ${date}`}
      fullWorkspace={true}
      actions={
        <>
          <button
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Edit size={13} /> Edit
          </button>
          <button
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #10b981',
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle size={13} /> Approve
          </button>
          <button
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={13} /> Export PDF
          </button>
          <button
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #6366f1',
              background: '#eef2ff',
              color: '#6366f1',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowUpRight size={13} /> Generate Quote
          </button>
        </>
      }
    >
      {/* ── Drawer Inner Content ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Row */}
        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}
        >
          {/* Patient Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
            <PatientAvatar name={patient} size={56} />
            <div style={{ minWidth: 0 }}>
              {protocol && (
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: '#6366f1',
                    fontWeight: 600,
                    marginTop: '0.2rem',
                  }}
                >
                  {protocol}
                </div>
              )}
              <div
                style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}
              >
                {doctor && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dr. {doctor}</span>
                )}
                {manager && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Manager: {manager}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <StatusBadge status={rx.status} large />
          </div>
        </div>

        {/* Clinical Summary Strip */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            background: '#f8fafc',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '1rem',
            border: '1px solid #f1f5f9',
          }}
        >
          {[
            { label: 'APIs', value: `${apiCount} item${apiCount !== 1 ? 's' : ''}` },
            { label: 'Duration', value: duration },
            { label: 'Follow-Up', value: followUp },
            {
              label: 'Required Tests',
              value: reqTests > 0 ? `${reqTests} test${reqTests !== 1 ? 's' : ''}` : 'None',
            },
          ].map((s, i, arr) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginTop: '0.1rem',
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <StandardDrawerTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {/* ── Tab Content ────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'Overview' && <OverviewTab rx={rx} />}
          {activeTab === 'Items' && <ItemsTab rx={rx} products={products} />}
          {activeTab === 'Follow-Up' && <FollowUpTab rx={rx} />}
          {activeTab === 'Documents' && <DocumentsTab rx={rx} />}
          {activeTab === 'Timeline' && <TimelineTab rx={rx} />}
        </div>
      </div>
    </StandardDrawer>
  );
}
