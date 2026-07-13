"use client";

import React, { useState, useEffect } from 'react';
import { serverAutoDraftQuotationFromPrescription } from '../../../app/actions/transactionActions';
import { generateClinicalProtocol, getProtocolFilename } from '../../../services/pdfService';
import { checkInteractionsAction, matchProtocolAction } from '../../../actions/aiActions';
import { X, Edit, CheckCircle, Download, FileText, Send, User, Stethoscope, Activity, Clock, Calendar, Pill, FlaskConical, MoreHorizontal, ChevronDown, Upload, FileCheck, AlertCircle, Check, ArrowUpRight, Wand2, RefreshCw } from '@/lib/icons';
import StandardDrawer from '../../../components/ui/StandardDrawer';
import StandardDrawerTabs from '../../../components/common/StandardDrawerTabs';
import DocumentPreviewModal from '../../../components/ui/DocumentPreviewModal';

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

import OverviewTab from '../../../components/prescriptions/tabs/OverviewTab';
import ItemsTab from '../../../components/prescriptions/tabs/ItemsTab';
import FollowUpTab from '../../../components/prescriptions/tabs/FollowUpTab';
import DocumentsTab from '../../../components/prescriptions/tabs/DocumentsTab';
import TimelineTab from '../../../components/prescriptions/tabs/TimelineTab';

const TABS = ['Overview', 'Items', 'Follow-Up', 'Documents', 'Timeline'];

export default function PrescriptionDetailModal({
  rx,
  products = [],
  onClose,
  onProtocolClick,
  onProductClick,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [protocolMatch, setProtocolMatch] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

  useEffect(() => {
    if (rx && rx.items && rx.items.length > 0) {
      setIsMatching(true);
      matchProtocolAction(rx.items).then(res => {
        setProtocolMatch(res);
      }).catch(err => {
        console.error("Protocol Match Error:", err);
      }).finally(() => {
        setIsMatching(false);
      });
    }
  }, [rx]);

  const handleRefill = async () => {
    try {
      setIsRefilling(true);
      const res = await serverDuplicatePrescriptionAction(rx.id, 'admin');
      if (res.success) {
        alert('Refill draft created successfully!');
        // Close modal or trigger a reload. We'll just alert and let user find it in drafts.
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create refill: ' + err.message);
    } finally {
      setIsRefilling(false);
    }
  };

  const handleAutoDraft = async () => {
    try {
      setIsDrafting(true);
      const res = await serverAutoDraftQuotationFromPrescription({ rxId: rx.id, createdByAdminUid: 'admin' });
      alert(`Draft Quotation created: ${res.quoteId}\nTotal: $${res.total.toFixed(2)}`);
      // Optionally trigger the open wizard with the draft id
      // window.dispatchEvent(new CustomEvent('open-quotation-wizard', { detail: { source: 'prescription', id: rx.id, existingQuoteId: res.id } }));
    } catch (err) {
      console.error(err);
      alert('Failed to auto-draft quotation: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const patient = rx.patient?.name || rx.patientName || 'Patient';
      const asProtocol = {
        protocol_title: `Prescription: ${patient}`,
        metadata: {
          scientificName: `Clinical Prescription`,
          description: `Personalized prescription for ${patient}. Issued: ${rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : (rx.dateIssued || 'N/A')}`
        },
        phases: [{
          phase_title: 'Primary Treatment',
          start_week: 1,
          end_week: parseInt(rx.duration) || 4,
          drugs_used: (rx.items || []).map(i => ({
            product_title: i.name || i.product_title || 'Medication',
            product_slug: i.product_slug || i.name || '',
            weekly_dose: i.dosage || i.dose || i.quantity || '',
            dosing_frequency: i.frequency || '',
            route: i.route || 'SC',
            vial_strength_used: i.strength || '',
            description: i.instructions || ''
          }))
        }]
      };
      
      const user = { name: patient };
      await generateClinicalProtocol(asProtocol, { user });
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF: ' + err.message);
    }
  };

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
            disabled={isDrafting}
            onClick={handleAutoDraft}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: isDrafting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginRight: '0.5rem',
              opacity: isDrafting ? 0.7 : 1
            }}
          >
            <Wand2 size={13} /> {isDrafting ? 'Drafting...' : 'Zero-Click Quote'}
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
            onClick={handleExportPDF}
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

          {rx.fileUrl && (
            <button
              onClick={() => setPreviewPdfUrl(rx.fileUrl)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid #3b82f6',
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileText size={13} /> View Original PDF
            </button>
          )}
          
          <button
            onClick={handleRefill}
            disabled={isRefilling}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #10b981',
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: isRefilling ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: isRefilling ? 0.7 : 1,
            }}
          >
            <RefreshCw size={13} className={isRefilling ? "animate-spin" : ""} />
            {isRefilling ? 'Refilling...' : '1-Click Refill'}
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
                  onClick={() =>
                    onProtocolClick &&
                    rx.protocolId &&
                    onProtocolClick({ id: rx.protocolId, name: protocol })
                  }
                  style={{
                    fontSize: '0.9rem',
                    color: '#6366f1',
                    fontWeight: 600,
                    marginTop: '0.2rem',
                    cursor: onProtocolClick && rx.protocolId ? 'pointer' : 'default',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: onProtocolClick && rx.protocolId ? '0.1rem 0.3rem' : '0',
                    borderRadius: '4px',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (onProtocolClick && rx.protocolId)
                      e.currentTarget.style.background = '#eef2ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                  }}
                  title={onProtocolClick && rx.protocolId ? 'View protocol details' : ''}
                >
                  {protocol}
                  {onProtocolClick && rx.protocolId && (
                    <span style={{ fontSize: '0.7rem', color: '#a5b4fc' }}>↗</span>
                  )}
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
          {activeTab === 'Items' && (
            <ItemsTab rx={rx} products={products} onProductClick={onProductClick} protocolMatch={protocolMatch} isMatching={isMatching} />
          )}
          {activeTab === 'Follow-Up' && <FollowUpTab rx={rx} />}
          {activeTab === 'Documents' && <DocumentsTab rx={rx} />}
          {activeTab === 'Timeline' && <TimelineTab rx={rx} />}
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        fileUrl={previewPdfUrl}
      />
    </StandardDrawer>
  );
}
