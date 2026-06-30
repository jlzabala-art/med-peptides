import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Plus from "lucide-react/dist/esm/icons/plus";
import User from "lucide-react/dist/esm/icons/user";
import Building from "lucide-react/dist/esm/icons/building";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Activity from "lucide-react/dist/esm/icons/activity";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Copy from "lucide-react/dist/esm/icons/copy";
import Search from "lucide-react/dist/esm/icons/search";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { RX_STATUS_META, RX_TYPE, RX_STATUS, rxEvent } from '../../config/prescriptionConfig';
import DoctorPrescriptionBuilder from './DoctorPrescriptionBuilder';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import PrescriptionDetailModal from '../prescriptions/PrescriptionDetailModal';

// ── Kit logistics milestones (unchanged) ─────────────────────────────────────
const KIT_STEPS = [
  { key: 'kit_dispatched',       label: 'Kit Dispatched',   icon: '📦' },
  { key: 'sample_ready',         label: 'Sample Ready',     icon: '🧪' },
  { key: 'collection_label_sent',label: 'Label Generated',  icon: '🏷️' },
  { key: 'in_transit',           label: 'In Transit',       icon: '🚚' },
  { key: 'processing',           label: 'Analysing',        icon: '🔬' },
  { key: 'results_available',    label: 'Results Ready',    icon: '📋' },
];

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:                  { label: 'Draft',              emoji: '📝', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  sent:                   { label: 'Sent',               emoji: '📨', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  viewed_by_patient:      { label: 'Viewed',             emoji: '👁️', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  assigned_to_wholesaler: { label: 'Awaiting Review',   emoji: '🟡', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  added_to_bulk:          { label: 'In Bulk Order',     emoji: '🟣', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  ordered:                { label: 'Ordered',           emoji: '✅', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  fulfilled:              { label: 'Fulfilled',          emoji: '🔵', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  expired:                { label: 'Expired',            emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  cancelled:              { label: 'Cancelled',          emoji: '❌', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
};

function getStatusMeta(status) {
  return STATUS_CONFIG[status] || RX_STATUS_META[status] || { label: status || 'Unknown', emoji: '⚪', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };
}

// ── Compact Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.28rem 0.65rem', borderRadius: '20px',
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.border}`,
      fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ── Patient Avatar ────────────────────────────────────────────────────────────
function PatientAvatar({ name, isCorp = false, size = 44 }) {
  if (isCorp) {
    return (
      <div style={{ width: size, height: size, borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Building size={size * 0.45} color="#0284c7" />
      </div>
    );
  }
  const initials = (name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 60%, 88%)`, color: `hsl(${hue}, 50%, 35%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.34,
    }}>
      {initials}
    </div>
  );
}

// ── Compact KPI Summary Bar ───────────────────────────────────────────────────
function ClinicalSummaryBar({ stats }) {
  const items = [
    { label: 'Total',    value: stats.total,  color: '#3b82f6', dot: '#93c5fd' },
    { label: 'Drafts',   value: stats.draft,  color: '#6b7280', dot: '#d1d5db' },
    { label: 'Active',   value: stats.active, color: '#10b981', dot: '#6ee7b7' },
    { label: 'Fulfilled',value: stats.done,   color: '#6366f1', dot: '#a5b4fc' },
  ];
  return (
    <div style={{ display: 'flex', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto', flexShrink: 0 }}>
      {items.map((s, i) => (
        <div key={i} style={{ flex: '1 1 0', minWidth: 90, padding: '0.8rem 1rem', borderRight: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: s.color, lineHeight: 1.15, marginTop: '0.1rem' }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Clinical Prescription Card ────────────────────────────────────────────────
function RxCard({ rx, onView, onCopy, onCancel, isPending, t }) {
  const isCorp     = rx.type === RX_TYPE.CLINIC_SUPPLY;
  const patName    = isCorp ? (t ? t('doctor.prescriptions_list.clinic_supply') : 'Clinic Supply') : (rx.patient?.name || 'Unknown Patient');
  const date       = rx.createdAt?.toDate ? rx.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const isFinal    = ['fulfilled', 'cancelled', 'expired'].includes(rx.status);
  const isDraft    = rx.status === RX_STATUS.DRAFT;
  const items      = rx.items || [];
  const itemsSummary = items.slice(0, 2).map(i => i.name).filter(Boolean).join(', ');
  const moreItems  = items.length > 2 ? `+${items.length - 2} more` : null;

  return (
    <div
      style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '1.1rem 1.25rem', cursor: 'pointer', transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onClick={() => onView(rx)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top row: avatar + name + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <PatientAvatar name={patName} isCorp={isCorp} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patName}</div>
            {rx.patient?.email && !isCorp && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.patient.email}</div>
            )}
          </div>
        </div>
        <StatusBadge status={rx.status} />
      </div>

      {/* Clinical details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {rx.diagnosis && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Stethoscope size={12} color="#10b981" />
            <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>Diagnosis</span>
            <span style={{ color: '#334155', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.diagnosis}</span>
          </div>
        )}
        {items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <FlaskConical size={12} color="#8b5cf6" />
            <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>Items</span>
            <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {itemsSummary}{moreItems && <span style={{ color: '#94a3b8' }}> {moreItems}</span>}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <Calendar size={12} color="#f59e0b" />
          <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>Date</span>
          <span style={{ color: '#334155' }}>{date}</span>
        </div>
        {isCorp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Building size={12} color="#0284c7" />
            <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>Type</span>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>Clinic Supply</span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            title="Copy prescription"
            onClick={() => onCopy(rx)}
            style={{ padding: '5px 8px', background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <Copy size={12} /> Copy
          </button>
          {!isFinal && !isDraft && (
            <button
              title="Cancel"
              onClick={() => onCancel(rx)}
              disabled={isPending}
              style={{ padding: '5px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
            >
              <XCircle size={12} /> Cancel
            </button>
          )}
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}
          onClick={() => onView(rx)}
        >
          View <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DoctorPrescriptionsTab({ doctorId, doctorMeta, patients = [], initialBuilderOpen = false, hideHistory = false, onSavedRedirect }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [builderData, setBuilderData]   = useState(initialBuilderOpen ? {} : null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all');
  const [search, setSearch]             = useState('');
  const [selectedRx, setSelectedRx]     = useState(null);

  // ── Data fetching (unchanged logic) ────────────────────────────────────────
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const tA = a.createdAt?.seconds ?? (a.createdAt?.toDate ? a.createdAt.toDate().getTime() / 1000 : 0);
        const tB = b.createdAt?.seconds ?? (b.createdAt?.toDate ? b.createdAt.toDate().getTime() / 1000 : 0);
        return tB - tA;
      });
      return docs;
    },
    enabled: !!doctorId,
  });

  const updateRxMutation = useMutation({
    mutationFn: async ({ id, updates }) => { await updateDoc(doc(db, 'prescriptions', id), updates); },
    onSuccess: () => queryClient.invalidateQueries(['prescriptions', doctorId]),
  });

  const doCancel = (rx) => {
    if (!window.confirm(t('doctor.prescriptions_list.cancel_confirm'))) return;
    updateRxMutation.mutate({
      id: rx.id,
      updates: {
        status: RX_STATUS.CANCELLED,
        updatedAt: serverTimestamp(),
        timeline: [...(rx.timeline || []), { ...rxEvent('cancelled', doctorId, 'doctor'), timestamp: new Date().toISOString() }],
      },
    });
  };

  const doCopy = (rx) => {
    setBuilderData({ items: rx.items || [], patient: rx.patient || null, type: rx.type || 'patient', diagnosis: rx.diagnosis || '', clinicalNotes: rx.clinicalNotes || '', delivery: rx.delivery || { method: 'direct_patient' } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Filtering (unchanged logic) ─────────────────────────────────────────────
  const filtered = prescriptions.filter(rx => {
    if (filterStatus !== 'all' && rx.status !== filterStatus) return false;
    if (filterType !== 'all' && rx.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (rx.patient?.name  || '').toLowerCase().includes(q) ||
        (rx.patient?.email || '').toLowerCase().includes(q) ||
        (rx.diagnosis      || '').toLowerCase().includes(q) ||
        (rx.items || []).some(i => i.name?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = {
    total:  prescriptions.length,
    draft:  prescriptions.filter(r => r.status === 'draft').length,
    active: prescriptions.filter(r => ['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'added_to_bulk'].includes(r.status)).length,
    done:   prescriptions.filter(r => r.status === 'fulfilled').length,
  };

  // ── hideHistory mode (unchanged) ────────────────────────────────────────────
  if (hideHistory) {
    return (
      <Card>
        <DoctorPrescriptionBuilder
          doctorId={doctorId} doctorMeta={doctorMeta} patients={patients}
          prefilledData={builderData || {}}
          onSaved={(isDraft) => { if (onSavedRedirect) onSavedRedirect(); else if (isDraft) setBuilderData(null); queryClient.invalidateQueries(['prescriptions', doctorId]); }}
        />
      </Card>
    );
  }

  const statusFilters = [
    { key: 'all',       label: 'All' },
    { key: 'draft',     label: '📝 Draft' },
    { key: 'sent',      label: '📨 Sent' },
    { key: 'fulfilled', label: '🔵 Fulfilled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={16} color="white" />
            </div>
            {t('doctor.prescriptions_list.rx_history')}
          </h2>
          <p style={{ color: '#64748b', margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
            {stats.total} registered · {stats.draft} drafts · {stats.active} active
          </p>
        </div>
        <button
          onClick={() => setBuilderData(builderData !== null ? null : {})}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
        >
          <Plus size={16} /> {builderData !== null ? t('doctor.prescriptions_list.hide_form') : t('doctor.prescriptions_list.new_rx')}
        </button>
      </div>

      {/* Compact KPIs */}
      <ClinicalSummaryBar stats={stats} />

      {/* Builder (expanded inline) */}
      {builderData !== null && (
        <Card>
          <DoctorPrescriptionBuilder
            doctorId={doctorId} doctorMeta={doctorMeta} patients={patients}
            prefilledData={builderData}
            onSaved={(isDraft) => { if (onSavedRedirect) onSavedRedirect(); else if (isDraft) setBuilderData(null); queryClient.invalidateQueries(['prescriptions', doctorId]); }}
          />
        </Card>
      )}

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', background: filterStatus === f.key ? '#e0e7ff' : 'transparent', color: filterStatus === f.key ? '#6366f1' : '#64748b', fontWeight: filterStatus === f.key ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
        >
          <option value="all">{t('doctor.prescriptions_list.all_types')}</option>
          <option value="patient">{t('doctor.prescriptions_list.for_patient')}</option>
          <option value="clinic_supply">{t('doctor.prescriptions_list.clinic_supply_opt')}</option>
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140 }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('doctor.prescriptions_list.filter_placeholder')}
            style={{ width: '100%', padding: '0.42rem 0.75rem 0.42rem 2rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
          />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <Spinner text="Loading prescriptions..." />
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', gap: '1rem', color: '#94a3b8' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={26} color="#cbd5e1" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: '#475569', margin: '0 0 0.25rem', fontSize: '1rem' }}>{t('doctor.prescriptions_list.no_rx_found')}</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Create your first prescription using the button above.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {filtered.map(rx => (
            <RxCard
              key={rx.id}
              rx={rx}
              onView={setSelectedRx}
              onCopy={doCopy}
              onCancel={doCancel}
              isPending={updateRxMutation.isPending}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRx && (
        <PrescriptionDetailModal rx={selectedRx} onClose={() => setSelectedRx(null)} />
      )}
    </div>
  );
}