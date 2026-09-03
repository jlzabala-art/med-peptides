"use client";

import React, { useState, useEffect } from 'react';
import { serverAutoDraftQuotationFromPrescription } from '../../../app/actions/transactionActions';
import { generateClinicalProtocol, getProtocolFilename } from '../../../services/pdfService';
import { checkInteractionsAction, matchProtocolAction } from '../../../actions/aiActions';
import { Package, X, Edit, CheckCircle, Download, FileText, Send, User, Stethoscope, Activity, Clock, Calendar, Pill, FlaskConical, MoreHorizontal, ChevronDown, Upload, FileCheck, AlertCircle, Check, ArrowUpRight, Wand2, RefreshCw, DollarSign } from '@/lib/icons';
import HighDensityDrawer from '../../../components/ui/HighDensityDrawer';
import StandardDrawerTabs from '../../../components/common/StandardDrawerTabs';
import DocumentPreviewModal from '../../../components/ui/DocumentPreviewModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;

const formatDoctorName = (name) => {
  if (!name) return '—';
  let cleaned = name.trim();
  // Strip duplicate case-insensitive Dr. or Dr prefixes
  while (cleaned.toLowerCase().startsWith('dr.') || cleaned.toLowerCase().startsWith('dr ')) {
    if (cleaned.toLowerCase().startsWith('dr.')) {
      cleaned = cleaned.substring(3).trim();
    } else {
      cleaned = cleaned.substring(2).trim();
    }
  }
  return `Dr. ${cleaned}`;
};

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
    label: 'pending',
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

function StatusChip({ status, large = false }) {
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
import { toast } from 'react-hot-toast';

const TABS = ['Overview', 'Items', 'Follow-Up', 'Documents', 'Timeline'];

export default function PrescriptionDetailModal({
  rx: incomingRx,
  products = [],
  onClose,
  onProtocolClick,
  onProductClick,
  onUpdateRx,
  onEdit,
}) {
  const [currentRx, setCurrentRx] = useState(incomingRx);

  useEffect(() => {
    setCurrentRx(incomingRx);
  }, [incomingRx]);

  const rx = currentRx || incomingRx || {};

  const handleUpdateRx = (updatedPayload) => {
    const merged = { ...rx, ...updatedPayload };
    setCurrentRx(merged);
    if (onUpdateRx) onUpdateRx(merged);
  };

  const [activeTab, setActiveTab] = useState('Overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [protocolMatch, setProtocolMatch] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [relatedPrescriptions, setRelatedPrescriptions] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    if (rx && rx.sessionId) {
      const fetchRelated = async () => {
        try {
          setIsLoadingRelated(true);
          const q = query(
            collection(db, 'prescriptions'),
            where('sessionId', '==', rx.sessionId)
          );
          const snapshot = await getDocs(q);
          const related = [];
          snapshot.forEach(doc => {
            if (doc.id !== rx.id) {
              related.push({ id: doc.id, ...doc.data() });
            }
          });
          setRelatedPrescriptions(related);
        } catch (err) {
          console.error("Error fetching related prescriptions:", err);
        } finally {
          setIsLoadingRelated(false);
        }
      };
      fetchRelated();
    } else {
      setRelatedPrescriptions([]);
    }
  }, [rx?.sessionId, rx?.id]);

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
  }, [rx.items]);

  const handleGeneratePaymentLink = async () => {
    try {
      setIsGeneratingLink(true);
      const { generatePaymentLink } = await import('../../../utils/paymentLinks');
      const url = await generatePaymentLink(rx);
      // Simulate saving it back or copying
      navigator.clipboard.writeText(url);
      toast.success('Payment link generated and copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate payment link: ' + err.message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleRefill = async () => {
    try {
      setIsRefilling(true);
      const res = await serverDuplicatePrescriptionAction(rx.id, 'admin');
      if (res.success) {
        toast.success('Refill draft created successfully!');
        // Close modal or trigger a reload. We'll just alert and let user find it in drafts.
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create refill: ' + err.message);
    } finally {
      setIsRefilling(false);
    }
  };

  const handleAutoDraft = async () => {
    try {
      setIsDrafting(true);
      const res = await serverAutoDraftQuotationFromPrescription({ rxId: rx.id, createdByAdminUid: 'admin' });
      toast(`Draft Quotation created: ${res.quoteId}\nTotal: $${res.total.toFixed(2)}`);
      // Optionally trigger the open wizard with the draft id
      // window.dispatchEvent(new CustomEvent('open-quotation-wizard', { detail: { source: 'prescription', id: rx.id, existingQuoteId: res.id } }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to auto-draft quotation: ' + err.message);
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
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  if (!rx) return null;

  const formatAnyDate = (val) => {
    if (!val) return null;
    let d = null;
    if (typeof val.toDate === 'function') {
      d = val.toDate();
    } else if (val._seconds || val.seconds) {
      d = new Date((val._seconds || val.seconds) * 1000);
    } else if (typeof val === 'string' || typeof val === 'number') {
      d = new Date(val);
    }
    if (d && !isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return null;
  };

  const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
  const protocol = rx.protocol || rx.protocolName || null;
  const date = formatAnyDate(rx.createdAt) || formatAnyDate(rx.dateIssued) || formatAnyDate(rx.fagron?.importedAt) || formatAnyDate(rx.fagron?.reportDate) || rx.dateIssued || '—';
  const doctor = rx.doctor?.name || rx.doctorName || null;
  const manager = rx.accountManager || null;

  const apiCount = (rx.items || rx.products || []).length;
  const rawDuration = rx.duration || rx.items?.[0]?.duration;
  const duration = rawDuration ? (typeof rawDuration === 'number' ? `${rawDuration} days` : rawDuration) : '—';
  
  const rawFollowUp = rx.followUpDate || rx.followUp || rx.followUpInterval || rx.reviewInterval;
  const followUp = formatAnyDate(rawFollowUp) || (typeof rawFollowUp === 'string' ? rawFollowUp : '—');
  
  const reqTests = (rx.requiredTests || rx.labTests || []).length;
  const expires = formatAnyDate(rx.expiresAt) || '—';

  const handleApprove = async () => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../firebase');
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        status: 'approved',
        validationStatus: 'Approved',
        updatedAt: new Date()
      });
      toast.success('Prescription approved by pharmacist.');
      if (onUpdateRx) onUpdateRx({ ...rx, status: 'approved', validationStatus: 'Approved' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve prescription: ' + err.message);
    }
  };

  return (
    <HighDensityDrawer
      isOpen={true}
      onClose={onClose}
      width="min(1200px, calc(100vw - 280px))"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* ── Sticky Header Area ── */}
        <div style={{ 
          background: 'var(--surface)', 
          borderBottom: '1px solid var(--border)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Top Row: Title, Subtitle, Actions & Close */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            padding: '1.5rem 1.5rem 1rem 1.5rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* Title & Patient Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
              <PatientAvatar name={patient} size={56} />
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Prescription: {patient}
                  {(rx.version || 1) > 1 && (
                    <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 800 }}>
                      v{rx.version}
                    </span>
                  )}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Created: {date}</span>
                </div>
                {/* Protocol Link */}
                {protocol && (
                  <div
                    onClick={() =>
                      onProtocolClick &&
                      rx.protocolId &&
                      onProtocolClick({ id: rx.protocolId, name: protocol })
                    }
                    style={{
                      fontSize: '0.85rem',
                      color: '#6366f1',
                      fontWeight: 600,
                      marginTop: '0.3rem',
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
                {/* Doctor & Manager Info */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  {doctor && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dr. {doctor}</span>
                  )}
                  {manager && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Manager: {manager}</span>
                  )}
                </div>
                
                {/* Session Group Badges */}
                {rx.sessionId && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                      Session Group: {rx.treatmentProgram || 'Multiple Formulations'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#0f766e', color: '#fff', borderRadius: '4px', fontWeight: 500 }}>
                        {rx.treatmentType || 'Current'}
                      </span>
                      {isLoadingRelated && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Loading related...</span>}
                      {relatedPrescriptions.map(rel => (
                        <button
                          key={rel.id}
                          onClick={() => {
                            if (onClose) onClose(); // Optionally close first if we can't navigate directly
                            // If we can navigate directly:
                            setCurrentRx(rel);
                            setActiveTab('Overview');
                          }}
                          style={{ 
                            fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#e2e8f0', color: '#334155', 
                            borderRadius: '4px', fontWeight: 500, border: 'none', cursor: 'pointer' 
                          }}
                          title={`View ${rel.treatmentType || 'Related Formulation'}`}
                        >
                          {rel.treatmentType || 'Related Formulation'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <StatusChip status={rx.status} large />
                <button 
                  onClick={onClose}
                  style={{ 
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    padding: '0.45rem', 
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-main)')}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  disabled={isDrafting}
                  onClick={handleAutoDraft}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--color-primary, #4f46e5)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: isDrafting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: isDrafting ? 0.7 : 1
                  }}
                >
                  <Wand2 size={13} /> {isDrafting ? 'Drafting...' : 'Zero-Click Quote'}
                </button>
                {['Approved', 'Active'].includes(rx.status) && (
                  <button
                    onClick={() => { window.location.href = `/admin/orders/new?sourceRx=${rx.id}`; }}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#10b981',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Package size={13} /> Convert to Order
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab('items');
                    if (onEdit) onEdit(rx);
                  }}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Edit size={13} /> Modify Formulation
                </button>
                <button
                  onClick={handleApprove}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
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
                {/* More Actions Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: moreOpen ? 'var(--bg-hover)' : 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <MoreHorizontal size={13} /> More
                  </button>
                  {moreOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '180px',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={() => { setMoreOpen(false); handleGeneratePaymentLink(); }}
                        disabled={isGeneratingLink}
                        style={{
                          padding: '0.6rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: isGeneratingLink ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left',
                          opacity: isGeneratingLink ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <DollarSign size={13} /> {isGeneratingLink ? 'Generating...' : 'Payment Link'}
                      </button>

                      <button
                        onClick={() => { setMoreOpen(false); handleExportPDF(); }}
                        style={{
                          padding: '0.6rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Download size={13} /> Export PDF
                      </button>

                      {rx.fileUrl && (
                        <button
                          onClick={() => { setMoreOpen(false); setPreviewPdfUrl(rx.fileUrl); }}
                          style={{
                            padding: '0.6rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <FileText size={13} /> View Original PDF
                        </button>
                      )}

                      <button
                        onClick={() => { setMoreOpen(false); handleRefill(); }}
                        disabled={isRefilling}
                        style={{
                          padding: '0.6rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: isRefilling ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left',
                          opacity: isRefilling ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <RefreshCw size={13} /> {isRefilling ? 'Refilling...' : '1-Click Refill'}
                      </button>

                      <button
                        onClick={() => { setMoreOpen(false); }}
                        style={{
                          padding: '0.6rem 1rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <ArrowUpRight size={13} /> Generate Quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Summary Strip */}
          <div style={{ padding: '0 1.5rem 1rem 1.5rem' }}>
            <div
              style={{
                display: 'flex',
                background: '#f8fafc',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #f1f5f9',
              }}
            >
              {[
                { label: 'APIs', value: `${apiCount} item${apiCount !== 1 ? 's' : ''}` },
                { label: 'Duration', value: duration },
                { label: 'Follow-Up', value: followUp },
                { label: 'Expires', value: expires },
                {
                  label: 'Required Tests',
                  value: reqTests > 0 ? `${reqTests} test${reqTests !== 1 ? 's' : ''}` : 'None',
                },
              ].map((s, i, arr) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
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
          </div>
          
          {/* Tab Navigation (Sticky below header) */}
          <div style={{ padding: '0 1.5rem' }}>
            <StandardDrawerTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
        {/* ── Drawer Inner Content ───────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-app)' }}>
          {activeTab === 'Overview' && <OverviewTab rx={rx} onProtocolClick={onProtocolClick} onUpdateRx={handleUpdateRx} />}
          {activeTab === 'Items' && (
            <ItemsTab rx={rx} products={products} onProductClick={onProductClick} onProtocolClick={onProtocolClick} protocolMatch={protocolMatch} isMatching={isMatching} onUpdateRx={handleUpdateRx} />
          )}
          {activeTab === 'Follow-Up' && <FollowUpTab rx={rx} onUpdateRx={handleUpdateRx} />}
          {activeTab === 'Documents' && <DocumentsTab rx={rx} onUpdateRx={handleUpdateRx} />}
          {activeTab === 'Timeline' && <TimelineTab rx={rx} />}
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        fileUrl={previewPdfUrl}
      />
    </HighDensityDrawer>
  );
}
