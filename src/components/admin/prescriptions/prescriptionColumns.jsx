import React, { useState } from 'react';
import {
  Stethoscope, Download, Copy, Trash2, Loader2, Sparkles, FileText,
  Tag, Package, RotateCcw, MessageCircle, Eye, RefreshCw, Merge,
  ClipboardCheck, Syringe, Send, Receipt, Share2, Briefcase, Building2, Bookmark, Link2, Check
} from '@/lib/icons';
import { openPrescriptionAI } from '../../../utils/openModuleAI';

// Helper to calculate Zoho matching statistics (matched, total, percentage) for all APIs in a prescription
export function getRxZohoMatchingStats(rx) {
  if (!rx) return { total: 0, matched: 0, percent: 0, isAllMatched: false, hasNoApis: true };
  const members = rx._sessionMembers || [rx];
  const items = [];

  for (const m of members) {
    if (Array.isArray(m.items) && m.items.length > 0) {
      items.push(...m.items);
    } else if (Array.isArray(m.parts) && m.parts.length > 0) {
      for (const p of m.parts) {
        if (Array.isArray(p.apis) && p.apis.length > 0) items.push(...p.apis);
        else if (Array.isArray(p.items) && p.items.length > 0) items.push(...p.items);
        else if (Array.isArray(p.prescriptionLines) && p.prescriptionLines.length > 0) items.push(...p.prescriptionLines);
      }
    } else if (Array.isArray(m.compounds) && m.compounds.length > 0) {
      items.push(...m.compounds);
    } else if (Array.isArray(m.prescriptionLines) && m.prescriptionLines.length > 0) {
      items.push(...m.prescriptionLines);
    } else if (Array.isArray(m.apis) && m.apis.length > 0) {
      items.push(...m.apis);
    }
  }

  // Filter valid items representing compound formulations or medicines
  const validItems = items.filter(it => Boolean(it && (it.name || it.drugName || it.productName || it.activeIngredient || it.title || it.zoho_item_id)));

  if (validItems.length === 0) {
    return { total: 0, matched: 0, percent: 0, isAllMatched: false, hasNoApis: true };
  }

  const isMatched = (it) => Boolean(
    it && (it.zoho_item_id || it.zoho_sku || it.zohoItemId || it.zohoSku || it.linkedItem?.item_id || it.linkedItem?.zoho_item_id)
  );

  const matchedCount = validItems.filter(isMatched).length;
  const total = validItems.length;
  const percent = total > 0 ? Math.round((matchedCount / total) * 100) : 0;

  return {
    total,
    matched: matchedCount,
    percent,
    isAllMatched: total > 0 && matchedCount === total,
    hasNoApis: false
  };
}

// Helper to determine if all compounded APIs in a prescription are matched/synced with Zoho
export function checkAllApisZohoMatched(rx) {
  const stats = getRxZohoMatchingStats(rx);
  return stats.isAllMatched;
}

// Compact percentage matching badge placed directly under the Status badge in the table
export function ZohoMatchingBadge({ rx, onOpenMatcher }) {
  const stats = getRxZohoMatchingStats(rx);

  if (stats.hasNoApis || stats.total === 0) {
    return null;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onOpenMatcher) {
      onOpenMatcher(rx);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('OPEN_ZOHO_API_MATCHER', { detail: { rx } }));
    }
  };

  const isFull = stats.isAllMatched || stats.percent === 100;
  const isPartial = stats.percent > 0 && !isFull;

  // Semantic GCP-inspired color palette
  const bg = isFull ? '#f0fdf4' : (isPartial ? '#fffbeb' : '#fef2f2');
  const border = isFull ? '#bbf7d0' : (isPartial ? '#fde68a' : '#fecaca');
  const color = isFull ? '#15803d' : (isPartial ? '#b45309' : '#dc2626');
  const dotColor = isFull ? '#16a34a' : (isPartial ? '#d97706' : '#ef4444');

  const tooltip = isFull
    ? `Zoho Books: 100% sincronizado (${stats.matched}/${stats.total} APIs vinculados). Clic para abrir el gestor.`
    : isPartial
      ? `Zoho Books: ${stats.percent}% sincronizado (${stats.matched}/${stats.total} APIs vinculados). Clic para vincular los pendientes.`
      : `Zoho Books: 0% sincronizado (0/${stats.total} APIs vinculados). Clic para vincular con Zoho.`;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.66rem',
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
        padding: '1px 6px',
        borderRadius: '4px',
        lineHeight: 1.25,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        marginTop: '3px',
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0
        }}
      />
      <span style={{ fontWeight: 800 }}>Zoho {stats.percent}%</span>
      <span style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.85 }}>({stats.matched}/{stats.total})</span>
    </button>
  );
}

// Determines whether a prescription contains injectable peptides / biologics.
// Used only to gate the clinical 'Patient administration guide' action.
function hasPeptideItems(rx) {
  const items = rx.items || rx.compounds || rx.products || rx.prescriptionLines || [];
  if (!items.length) return false;
  const PEPTIDE_KEYWORDS = /peptide|bpc|ghk|tb-|igf|nad\+?|selank|semax|epithalon|ipamorelin|cjc|sermorelin|semaglutide|tirzepatide|retatrutide|tesamorelin|dsip|pt-141|thymosin|mots|ss-31|humanin|kisspeptin|dihexa|kpv|mgf|melanotan|oxytocin|hcg|syringe|injection|vial|subcutaneous|sc\b/i;
  return items.some(i => {
    const name = (i.name || i.productName || i.product_title || '').toLowerCase();
    const category = (i.category || '').toLowerCase();
    const route = (i.route || '').toLowerCase();
    return PEPTIDE_KEYWORDS.test(name) || category.includes('peptide') || category.includes('biologic') || route === 'sc' || route === 'im' || route === 'iv';
  });
}

// Determines whether a prescription is fulfilled by Pharmapolis (any known alias).
// Used to gate Pharmapolis A4 sticker and PNG label exports — independent of product type.
const PHARMAPOLIS_ALIASES = /pharmapolis/i;
function isPharmopolisRx(rx) {
  // Check top-level supplier field
  const topSupplier = rx.supplierName || rx.supplier || rx.pharmacy || '';
  if (PHARMAPOLIS_ALIASES.test(topSupplier)) return true;
  // Check individual line items
  const items = rx.items || rx.compounds || rx.products || rx.prescriptionLines || [];
  return items.some(i => PHARMAPOLIS_ALIASES.test(i.supplierName || i.supplier || ''));
}
import CopyableId from '../../ui/CopyableId';
import StatusBadge from '../../ui/StatusBadge';
import { normalizeRxStatus, RX_STATUS_LABELS } from '../../../lib/normalizeRxStatus';
import { serverDuplicatePrescriptionAction } from '../../../actions/prescriptionsActions';
import { toast } from 'react-hot-toast';
import InlineEditableCell from '../../ui/InlineEditableCell';
import AppActionGroup from '../../ui/AppActionGroup';
import { prescriptionRepository } from '../../../repositories/prescriptionRepository';
import notifier from '../../../services/NotificationService';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { classifyPrescription } from '../../../data/prescriptionTypeClassifier';


import RxCompletenessBadge from './RxCompletenessBadge';

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

export const formatDoctorName = (name) => {
  if (!name) return '—';
  let cleaned = name.trim();
  while (cleaned.toLowerCase().startsWith('dr.') || cleaned.toLowerCase().startsWith('dr ')) {
    if (cleaned.toLowerCase().startsWith('dr.')) {
      cleaned = cleaned.substring(3).trim();
    } else {
      cleaned = cleaned.substring(2).trim();
    }
  }
  const lower = cleaned.toLowerCase();
  if (lower.includes('sezgin') || lower.includes('cagatay') || lower.includes('çagatay')) {
    return 'Dr. Çağatay Sezgin, MD, FISHRS';
  }
  if (lower === 'heytham' || lower === 'haytham' || lower.includes('heytham salem') || lower.includes('haytham salem')) {
    return 'Dr. Haytham Salem';
  }
  return `Dr. ${cleaned}`;
};

// ── Renew Button (self-contained to isolate loading state per row) ─────────────
function RenewButton({ rx, onRefresh, onRefill }) {
  const [loading, setLoading] = useState(false);

  const handleRenew = async (e) => {
    e.stopPropagation();
    if (onRefill) {
      onRefill(rx);
      return;
    }
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading(`Duplicating Rx #${rx.id?.slice(0, 6)}…`);
    try {
      const result = await serverDuplicatePrescriptionAction(rx.id, 'admin');
      toast.success(`Refill draft created — #${result.id?.slice(0, 6)}`, { id: toastId });
      onRefresh && onRefresh();
    } catch (err) {
      toast.error(`Failed to duplicate: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRenew}
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', padding: '0.2rem', opacity: loading ? 0.5 : 1 }}
      title="Refill in Rx Builder / Duplicate"
    >
      {loading
        ? <Loader2 size={16} color="#64748b" style={{ animation: 'spin 1s linear infinite' }} />
        : <Copy size={16} color="#64748b" />
      }
    </button>
  );
}

// ── 1-Click Workspace Toggle Button (SSOT Integration - GCP Icon Standard) ──
function WorkspaceRxToggleButton({ rx }) {
  const isInWorkspace = useWorkspaceStore((s) => {
    const ws = s.workspaces?.[s.activeWorkspaceId];
    if (!ws) return false;
    const cleanId = String(rx.id || '').trim();
    const pIds = ws.prescriptionIds || (ws.prescriptions || []).map((p) => p.id);
    return pIds.includes(cleanId);
  });
  const togglePrescriptionInWorkspace = useWorkspaceStore((s) => s.togglePrescriptionInWorkspace);

  const handleClick = (e) => {
    e.stopPropagation();
    if (togglePrescriptionInWorkspace) {
      togglePrescriptionInWorkspace(rx);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={isInWorkspace ? 'In workspace (click to remove)' : 'Add to active workspace'}
      aria-label={isInWorkspace ? 'In workspace (click to remove)' : 'Add to active workspace'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        minWidth: '30px',
        minHeight: '30px',
        borderRadius: '4px',
        backgroundColor: isInWorkspace ? '#e8f0fe' : '#ffffff',
        border: isInWorkspace ? '1px solid #d2e3fc' : '1px solid #dadce0',
        color: isInWorkspace ? '#1a73e8' : '#5f6368',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: 0
      }}
      onMouseEnter={(e) => {
        if (!isInWorkspace) {
          e.currentTarget.style.backgroundColor = '#f1f3f4';
          e.currentTarget.style.borderColor = '#dadce0';
          e.currentTarget.style.color = '#202124';
        } else {
          e.currentTarget.style.backgroundColor = '#d2e3fc';
        }
      }}
      onMouseLeave={(e) => {
        if (!isInWorkspace) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#dadce0';
          e.currentTarget.style.color = '#5f6368';
        } else {
          e.currentTarget.style.backgroundColor = '#e8f0fe';
        }
      }}
    >
      <Bookmark
        size={15}
        strokeWidth={1.8}
        fill={isInWorkspace ? '#1a73e8' : 'none'}
        color={isInWorkspace ? '#1a73e8' : '#5f6368'}
      />
    </button>
  );
}

// Robust resolvers that extract genuine properties without destructive or artificial mapping
const resolvePatientName = (record) => {
  if (!record) return '';
  if (typeof record === 'string') return record.trim();
  
  const cand = (record.patient?.name && record.patient.name !== 'Unknown Patient' && record.patient.name !== 'Sin Paciente')
    ? record.patient.name
    : (record.patientName && record.patientName !== 'Unknown Patient' && record.patientName !== 'Sin Paciente')
      ? record.patientName
      : (record.patientInfo?.name || record.patientInfo?.fullName)
        ? (record.patientInfo.name || record.patientInfo.fullName)
        : (record.prescriptionDetails?.patientName)
          ? record.prescriptionDetails.patientName
          : (record.customer?.name || record.customerDetection?.name || record.client?.name || record.clientName)
            ? (record.customer?.name || record.customerDetection?.name || record.client?.name || record.clientName)
            : (record.patient?.fullName || record.fullName)
              ? (record.patient?.fullName || record.fullName)
              : (typeof record.patient === 'string' && record.patient.trim() && record.patient !== 'Unknown Patient')
                ? record.patient
                : '';

  if (cand && String(cand).trim()) return String(cand).trim();

  // If this record is a session/group, inspect its members
  if (Array.isArray(record._sessionMembers) && record._sessionMembers.length > 0) {
    for (const member of record._sessionMembers) {
      const memberName = resolvePatientName(member);
      if (memberName && memberName !== 'Unknown Patient') return memberName;
    }
  }

  // If patient object has code or ID, don't leave completely blank
  if (record.patient?.code && record.patient.code !== 'Anonymous') {
    return `Patient (${record.patient.code})`;
  }

  return 'Unknown Patient';
};

const resolvePatientId = (record) => {
  if (!record || typeof record !== 'object') return null;
  const directId = record.patientId || record.patient?.id || record.patient?.uid || record.patientInfo?.id || record.patient?.code || null;
  if (directId) return directId;
  if (Array.isArray(record._sessionMembers)) {
    for (const m of record._sessionMembers) {
      const mid = m.patientId || m.patient?.id || m.patient?.uid || m.patientInfo?.id;
      if (mid) return mid;
    }
  }
  return null;
};

const resolveDoctorName = (record) => {
  if (!record) return '—';
  if (typeof record === 'string') return record;
  const treatingDoc = typeof record.treatingDoctor === 'string' 
    ? record.treatingDoctor 
    : (record.treatingDoctor?.name || null);

  const doc = (treatingDoc && treatingDoc !== '—')
    ? treatingDoc
    : (record.doctor?.name && record.doctor.name !== '—' && record.doctor.name !== 'Unknown Doctor')
      ? record.doctor.name
      : (record.doctorName && record.doctorName !== '—' && record.doctorName !== 'Unknown Doctor')
        ? record.doctorName
        : (record.prescribingDoctor && record.prescribingDoctor !== '—')
          ? record.prescribingDoctor
          : (record.doctor?.displayName || record.doctorInfo?.name || null);

  if (doc && String(doc).trim()) return String(doc).trim();

  if (Array.isArray(record._sessionMembers)) {
    for (const m of record._sessionMembers) {
      const mDoc = resolveDoctorName(m);
      if (mDoc && mDoc !== '—' && mDoc !== 'Unknown Doctor') return mDoc;
    }
  }

  return '—';
};

const resolveClinicName = (record, docName) => {
  if (!record || typeof record !== 'object') return null;
  const treatingDocClinic = typeof record.treatingDoctor === 'object' ? record.treatingDoctor?.clinic : null;
  const clinic = treatingDocClinic 
    || record.doctor?.clinic 
    || record.clinic 
    || record.clinicName 
    || (docName && (String(docName).toLowerCase().includes('haytham') || String(docName).toLowerCase().includes('heytham')) ? 'Arthregen Clinic' : null);

  if (clinic) return clinic;

  if (Array.isArray(record._sessionMembers)) {
    for (const m of record._sessionMembers) {
      const mClinic = resolveClinicName(m, docName);
      if (mClinic) return mClinic;
    }
  }
  return null;
};

const resolveRxRecord = (val, row) => {
  if (row && typeof row === 'object' && (row.id || row.patient || row.patientName || row.patientInfo || row.doctor || row.doctorName || row.items || row._isSessionGroup)) {
    return row;
  }
  if (val && typeof val === 'object' && (val.id || val.patient || val.patientName || val.patientInfo || val.doctor || val.doctorName || val.items || val._isSessionGroup)) {
    return val;
  }
  if (val && typeof val === 'object' && val.name) {
    return { patient: val };
  }
  return row || val || {};
};

// ── Columns Definition (GCP UX Standard: 4 Consolidated Columns) ──────────────
export const getPrescriptionColumns = (options = {}) => {
  const { onEdit, onRefresh, onRefill, onEnrich, isDoctor, role } = options;
  const canGenerateLabels = !isDoctor && role !== 'doctor';
  return [
    {
      key: 'patient',
      header: 'Patient & Doctor',
      width: '38%',
      render: (val, row) => {
        const rx = resolveRxRecord(val, row);
        const patient = resolvePatientName(rx);
        const patientId = resolvePatientId(rx);
        const doctor = resolveDoctorName(rx);
        const formattedDoc = formatDoctorName(doctor);
        const clinicName = resolveClinicName(rx, doctor);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, padding: '2px 0' }}>
            {/* Primary line: Patient Name (Google Cloud UX: full name visible with natural wrapping) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
              <span 
                title={patient}
                style={{ 
                  fontWeight: 600, 
                  color: '#202124', 
                  fontSize: '0.88rem',
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                  whiteSpace: 'normal'
                }}
              >
                {patient}
              </span>
              {patientId && (
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <CopyableId value={patientId} iconOnly={true} />
                </div>
              )}
            </div>

            {/* Secondary line: Doctor Name (Google Cloud UX: full doctor name visible, wrap allowed) */}
            <div style={{ 
              fontSize: '0.80rem', 
              color: '#3c4043', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px', 
              minWidth: 0,
              lineHeight: 1.35
            }}>
              <Stethoscope size={13} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
              <span 
                title={formattedDoc}
                style={{ 
                  fontWeight: 500, 
                  color: '#202124',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal'
                }}
              >
                {formattedDoc}
              </span>
            </div>

            {/* Tertiary line: Clinic (On its own distinct line, full text visible) */}
            {clinicName && (
              <div style={{ 
                fontSize: '0.73rem', 
                color: '#5f6368', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '5px', 
                minWidth: 0,
                lineHeight: 1.35
              }}>
                <Building2 size={12} style={{ color: '#5f6368', flexShrink: 0, marginTop: '2px' }} />
                <span 
                  title={clinicName}
                  style={{ 
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                  }}
                >
                  {clinicName}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'parts',
      header: 'Parts',
      width: '64px',
      render: (val, row) => {
        const rx = resolveRxRecord(val, row);
        let count = 1;
        if (rx._isSessionGroup) {
          count = rx._sessionCount || rx._sessionMembers?.length || 2;
        } else if (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 1) {
          count = rx.formulationBlocks.length;
        } else if (Array.isArray(rx.parts) && rx.parts.length > 1) {
          count = rx.parts.length;
        } else if (rx.totalParts && rx.totalParts > 1) {
          count = rx.totalParts;
        } else if (rx.isMultiPart) {
          count = rx.totalParts || 2;
        }

        const isMulti = count > 1;

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span 
              title={isMulti ? `Multi-part prescription: ${count} compounded formulations` : 'Single formulation (1 part)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '24px',
                height: '22px',
                padding: '0 6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '4px',
                background: isMulti ? '#e8f0fe' : '#f1f3f4',
                color: isMulti ? '#1a73e8' : '#5f6368',
                border: isMulti ? '1px solid #d2e3fc' : '1px solid #dadce0',
                whiteSpace: 'nowrap'
              }}
            >
              {count}
            </span>
          </div>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      width: '90px',
      render: (val, row) => {
        const rx = resolveRxRecord(val, row);
        const parseAnyDate = (v) => {
          if (!v) return null;
          let d = null;
          if (typeof v.toDate === 'function') d = v.toDate();
          else if (v._seconds || v.seconds) d = new Date((v._seconds || v.seconds) * 1000);
          else if (typeof v === 'number') d = new Date(v);
          else if (typeof v === 'string') {
            const dmy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (dmy) {
              d = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
            } else {
              d = new Date(v);
            }
          }
          if (d && !isNaN(d.getTime())) return d;
          return null;
        };

        const resolveDate = (record) => {
          if (!record) return null;
          let d = parseAnyDate(record.date)
            || parseAnyDate(record.dateIssued)
            || parseAnyDate(record.createdAt)
            || parseAnyDate(record.createdAt_ts)
            || parseAnyDate(record.resultDate)
            || parseAnyDate(record.receivedInLabDate)
            || parseAnyDate(record.collectionDate)
            || parseAnyDate(record.analysisDate)
            || parseAnyDate(record.protocolDate)
            || parseAnyDate(record.updatedAt)
            || parseAnyDate(record.fagron?.importedAt)
            || parseAnyDate(record.fagron?.reportDate);

          if (!d && Array.isArray(record._sessionMembers)) {
            for (const m of record._sessionMembers) {
              d = resolveDate(m);
              if (d) break;
            }
          }
          return d;
        };

        const dObj = resolveDate(rx) || (typeof val === 'string' || typeof val === 'number' ? parseAnyDate(val) : null);

        if (!dObj) {
          return <span style={{ color: '#9aa0a6', fontSize: '0.78rem' }}>—</span>;
        }

        const fullDateStr = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayMonth = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const year = dObj.getFullYear();

        return (
          <div 
            title={fullDateStr}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              lineHeight: 1.25,
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124' }}>
              {dayMonth}
            </span>
            <span style={{ fontSize: '0.70rem', color: '#70757a', fontWeight: 500 }}>
              {year}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      render: (val, row) => {
        const rx = resolveRxRecord(val, row);
        if (rx._isSessionGroup) {
          const statuses = (rx._sessionMembers || []).map(m => normalizeRxStatus(m.status) || 'draft');
          let aggregateStatus;
          if (statuses.includes('cancelled')) aggregateStatus = 'cancelled';
          else if (statuses.includes('pending')) aggregateStatus = 'pending';
          else if (statuses.includes('processing')) aggregateStatus = 'processing';
          else if (statuses.includes('in_transit')) aggregateStatus = 'in_transit';
          else if (statuses.every(s => s === 'completed')) aggregateStatus = 'completed';
          else if (statuses.every(s => s === 'approved' || s === 'completed')) aggregateStatus = 'approved';
          else aggregateStatus = statuses[0] || 'draft';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <StatusBadge status={aggregateStatus} label={RX_STATUS_LABELS[aggregateStatus]} />
              <ZohoMatchingBadge rx={rx} onOpenMatcher={options?.onOpenZohoMatcher} />
            </div>
          );
        }

        const currentStatus = normalizeRxStatus(rx.status) || (typeof val === 'string' ? normalizeRxStatus(val) : null) || 'draft';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <InlineEditableCell
              value={currentStatus}
              type="select"
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Processing', value: 'processing' },
                { label: 'In Transit', value: 'in_transit' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
              ]}
              format={(statusVal) => <StatusBadge status={statusVal} label={RX_STATUS_LABELS[statusVal]} />}
              onSave={async (newStatus) => {
                try {
                  const targetId = rx.id || (typeof row === 'object' ? row.id : null);
                  if (!targetId) throw new Error('No prescription ID for status update');
                  await prescriptionRepository.updatePrescription(targetId, { status: newStatus });
                  toast.success('Status updated');
                  if (options.onRefresh) options.onRefresh();
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to update status');
                  throw err;
                }
              }}
            />
            <ZohoMatchingBadge rx={rx} onOpenMatcher={options?.onOpenZohoMatcher} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '180px',
      minWidth: '180px',
      isAction: true,
      align: 'right',
      sortable: false,
      render: (val, row) => {
        const rx = resolveRxRecord(val, row);
        
        const isPeptideRx = hasPeptideItems(rx);
        const isPharmopolisSupplier = isPharmopolisRx(rx);

        const actions = [
          // ── QUICK ACTION 1: View (Directly Visible) ─────────────────────
          {
            type: 'action',
            label: 'View details',
            icon: Eye,
            isPrimary: true,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_PRESCRIPTION_VIEW', { detail: { rx } }));
            }
          },
          // ── QUICK ACTION 2: Share Public Page (Directly Visible) ─────────
          {
            type: 'action',
            label: 'Share public page',
            icon: Share2,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_SHARE_PUBLIC_PAGE', { detail: { rx } }));
            }
          },
          // ── QUICK ACTION 3: Pharmapolis Labels (Directly Visible & Public Module Parity) ───
          {
            type: 'action',
            label: 'Pharmapolis Labels',
            icon: Tag,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_PHARMAPOLIS_LABELS', { detail: { rx } }));
            }
          },
          // ── OVERFLOW ACTIONS (in ··· menu) ──────────────────────────────
          {
            type: 'action',
            label: 'Enrich with AI',
            icon: Sparkles,
            onClick: () => {
              if (onEnrich) onEnrich(rx);
              else toast.error('Enrichment handler not configured');
            }
          },
          // ── CLINICAL ────────────────────────────────────────────────────
          {
            type: 'action',
            label: 'AI prescription review',
            icon: ClipboardCheck,
            onClick: () => {
              openPrescriptionAI({
                id: rx.id,
                status: rx.status,
                createdAt: rx.createdAt || rx.dateIssued,
                patientName: rx.patient?.name || rx.patientName,
                patientAge: rx.patient?.age || rx.patientAge,
                patientWeight: rx.patient?.weight,
                patientGoals: rx.patient?.goals || rx.goals,
                patientConditions: rx.patient?.conditions,
                patientAllergies: rx.patient?.allergies,
                patient: rx.patient,
                doctorName: rx.doctor?.name || rx.doctorName,
                doctorSpecialty: rx.doctor?.specialty,
                doctor: rx.doctor,
                protocolId: rx.protocolId,
                protocol: rx.protocol,
                items: rx.items || rx.compounds || rx.products || [],
                instructions: rx.instructions || rx.generalNotes,
                clinicalNotes: rx.clinicalNotes,
                source: rx.source,
              }, {
                autoGenerate: false,
                displayText: `Rx Review: ${rx.patient?.name || rx.patientName || rx.id}`,
              });
            }
          },
          {
            type: 'clone',
            label: 'Clone / re-emit prescription',
            onClick: () => {
              if (onRefill) onRefill(rx);
              else toast.success('Cloning prescription...');
            }
          },
          {
            type: 'action',
            label: 'Quick refill',
            icon: RotateCcw,
            onClick: () => {
              if (options.onRefill) { options.onRefill(rx); return; }
              const rawItems = rx.items || rx.compounds || rx.products || [];
              const patientName = rx.patient?.name || rx.patientName || 'Patient';
              const patientId = rx.patientId || rx.patient?.id || '';
              if (!rawItems.length) { toast.error('No items to refill'); return; }
              const itemsToAdd = rawItems.map((i, idx) => ({
                id: i.id || i.variantId || i.productId || `rx_refill_${Date.now()}_${idx}`,
                productId: i.productId || i.id, variantId: i.variantId || i.id,
                canonicalName: i.name || i.productName || i.product_title || 'Medication',
                sku: i.sku || '', dosage: i.dosage || i.dose || '',
                format: i.format || i.dosage_form || 'Vial',
                quantity: parseInt(i.quantity, 10) || 1,
                unitPrice: parseFloat(i.unitPrice || i.rate || i.price || 0),
                price: parseFloat(i.unitPrice || i.rate || i.price || 0),
                unitRate: parseFloat(i.unitPrice || i.rate || i.price || 0),
                supplierCost: parseFloat(i.supplierCost || 0),
                supplierName: rx.supplierName || 'Pharmapolis Ltd',
                category: i.category || 'Prescription Biologics',
                prescriptionId: rx.id,
                prescriptionCode: rx.prescriptionCode || rx.id,
                patientName, patientId,
              }));
              const { addItems, setTargetEntity, setOperationType, setWorkspaceIntent, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore.getState();
              addItems(itemsToAdd, activeWorkspaceId, { openDrawer: true });
              setTargetEntity({ type: 'patient', id: patientId, name: patientName,
                email: rx.patient?.email || rx.patientEmail || '',
                phone: rx.patient?.phone || rx.patientPhone || '',
                fileNumber: rx.patient?.fileNumber || rx.patientFileNumber || rx.patient?.mrn || '',
              }, activeWorkspaceId);
              setOperationType('sell_prescription', activeWorkspaceId);
              setWorkspaceIntent('prescribe', activeWorkspaceId);
              setDrawerOpen(true);
              toast.success(`Refill loaded into workspace for ${patientName}`);
            }
          },
          // ── PEPTIDE-SPECIFIC (only shown when injectable items detected) ─
          ...(isPeptideRx && !isDoctor ? [{
            type: 'action',
            label: 'Patient administration guide',
            icon: Syringe,
            onClick: () => {
              if (options.onOpenPatientGuide) options.onOpenPatientGuide(rx);
              else window.dispatchEvent(new CustomEvent('OPEN_PATIENT_GUIDE_MODAL', { detail: { rx } }));
            }
          }] : []),
          // ── PROCUREMENT & COMMUNICATION ─────────────────────────────────
          {
            type: 'action',
            label: 'Send items to workspace',
            icon: Package,
            onClick: () => {
              const rawItems = rx.items || rx.compounds || rx.products || [];
              const patientName = rx.patient?.name || rx.patientName || 'Patient';
              const patientId = rx.patientId || rx.patient?.id || '';
              if (!rawItems.length) { toast.error('No items in this prescription'); return; }
              const partNum = rx.partNumber ?? null;
              const totalParts = rx.totalParts ?? null;
              const phaseName = rx.phaseName || rx.formula || (partNum ? `Part ${partNum}${totalParts ? ` of ${totalParts}` : ''}` : '');
              const formula = rx.formula || '';
              const rxCode = rx.prescriptionCode || rx.rxCode || rx.code || rx.id;
              const rxGroupId = rx.rxGroupId || rx.sessionId || rx.id;

              const itemsToAdd = rawItems.map((i, idx) => {
                const baseId = i.id || i.variantId || i.productId || `item_${idx}`;
                return {
                  id: `rx_${rx.id}_p${partNum || 1}_${baseId}`,
                  productId: i.productId || i.id, variantId: i.variantId || i.id,
                  canonicalName: i.name || i.productName || i.product_title || 'Medication',
                  sku: i.sku || '', dosage: i.dosage || i.dose || '',
                  format: i.format || i.dosage_form || 'Vial',
                  quantity: parseInt(i.quantity, 10) || 1,
                  unitPrice: parseFloat(i.unitPrice || i.rate || i.price || 0),
                  price: parseFloat(i.unitPrice || i.rate || i.price || 0),
                  unitRate: parseFloat(i.unitPrice || i.rate || i.price || 0),
                  supplierCost: parseFloat(i.supplierCost || 0),
                  supplierName: rx.supplierName || 'Pharmapolis Ltd',
                  category: i.category || 'Prescription Biologics',
                  prescriptionId: rx.id, prescriptionCode: rxCode,
                  rxGroupId,
                  partNumber: partNum,
                  totalParts,
                  partName: phaseName,
                  phaseName,
                  formula,
                  patientName, patientId,
                };
              });
              const { addItems, setTargetEntity, setOperationType, setWorkspaceIntent, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore.getState();
              addItems(itemsToAdd, activeWorkspaceId, { openDrawer: true });
              setTargetEntity({ type: 'patient', id: patientId, name: patientName,
                email: rx.patient?.email || rx.patientEmail || '',
                phone: rx.patient?.phone || rx.patientPhone || '',
                fileNumber: rx.patient?.fileNumber || rx.patientFileNumber || rx.patient?.mrn || '',
              }, activeWorkspaceId);
              setOperationType('sell_prescription', activeWorkspaceId);
              setWorkspaceIntent('sell', activeWorkspaceId);
              setDrawerOpen(true);
              toast.success(`${itemsToAdd.length} items sent to workspace`);
            }
          },
          {
            type: 'action',
            label: 'Send to patient via WhatsApp',
            icon: MessageCircle,
            onClick: () => {
              const patientName = rx.patient?.name || rx.patientName || 'Patient';
              const doctorName = rx.doctorName || rx.doctor?.name || 'Physician';
              const patientPhone = (rx.patientPhone || rx.patient?.phone || '').replace(/[^0-9]/g, '');
              const rawItems = rx.items || rx.compounds || rx.products || [];
              const itemNames = rawItems.map(i => i.name || i.productName || 'Compound').join(', ');
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
              const message = `Dear ${patientName}, ${doctorName} has issued your personalised prescription for ${itemNames || 'your treatment'}. Access details at: ${origin}/patient/prescriptions`;
              if (patientPhone) {
                window.open(`https://wa.me/${patientPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                toast.success(`Opening WhatsApp for ${patientName}`);
              } else {
                navigator.clipboard.writeText(message);
                toast.success('Message copied — no phone number on file');
              }
            }
          },
          ...(!isDoctor ? [{
            type: 'create_quote',
            label: 'Create quotation from prescription',
            icon: Receipt,
            onClick: () => {
              const patient = rx.patient?.name || rx.patientName || 'Patient';
              window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                detail: {
                  type: 'prescription', prescriptionId: rx.id, rxId: rx.id,
                  patientId: rx.patientId || rx.patient?.id,
                  patientName: patient,
                  doctorId: rx.doctorId || rx.doctor?.id,
                  doctorName: rx.doctor?.name || rx.doctorName || '',
                  items: (rx.items || rx.compounds || rx.products || []).map(i => ({
                    productId: i.productId || i.id,
                    name: i.name || i.productName || i.product_title || 'Medication',
                    dosage: i.dosage || i.dose || '',
                    quantity: parseInt(i.quantity) || 1,
                    unitRate: parseFloat(i.unitPrice || i.rate || i.price || 150),
                    supplierCost: parseFloat(i.supplierCost || (i.unitPrice ? i.unitPrice * 0.55 : 85))
                  }))
                }
              }));
            }
          }] : []),
          ...(!isDoctor ? [{
            type: 'action',
            label: 'Vincular APIs con Zoho Books',
            icon: Link2,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_ZOHO_API_MATCHER', { detail: { rx } }));
            }
          }] : []),
          // ── EXPORTS ─────────────────────────────────────────────────────
          {
            type: 'download',
            label: 'Download PDF',
            onClick: async () => {
              const toastId = toast.loading('Generating prescription PDF…');
              try {
                const { generateClinicalProtocol } = await import('../../../services/pdfService');
                const patient = rx.patient?.name || rx.patientName || 'Patient';
                const asProtocol = {
                  protocol_title: `Prescription: ${patient}`,
                  metadata: { scientificName: 'Clinical Prescription', description: `Personalised prescription for ${patient}. Issued: ${rx.createdAt ? (typeof rx.createdAt.toDate === 'function' ? rx.createdAt.toDate().toLocaleDateString() : new Date(rx.createdAt).toLocaleDateString()) : (rx.dateIssued || 'N/A')}` },
                  phases: [{ phase_title: 'Primary Treatment', start_week: 1, end_week: parseInt(rx.duration) || 4,
                    drugs_used: (rx.items || rx.compounds || rx.products || []).map(i => ({
                      product_title: i.name || i.productName || i.product_title || 'Medication',
                      product_slug: i.product_slug || i.name || '',
                      weekly_dose: i.dosage || i.dose || i.quantity || '',
                      dosing_frequency: i.frequency || '', route: i.route || 'SC',
                      vial_strength_used: i.strength || '', description: i.instructions || ''
                    }))
                  }]
                };
                await generateClinicalProtocol(asProtocol, { user: { name: patient } });
                toast.success('PDF downloaded', { id: toastId });
              } catch (err) {
                toast.error('Failed to generate PDF: ' + err.message, { id: toastId });
              }
            }
          },
          // Pharmapolis labels & vector sticker studio (public module parity)
          ...(isPharmopolisSupplier && canGenerateLabels ? [
            {
              type: 'action',
              label: 'Pharmapolis Labels & Stickers',
              icon: Tag,
              onClick: () => {
                window.dispatchEvent(new CustomEvent('OPEN_PHARMAPOLIS_LABELS', { detail: { rx } }));
              }
            }
          ] : []),
          // ── DESTRUCTIVE ─────────────────────────────────────────────────
          {
            type: 'delete',
            label: 'Delete prescription',
            onClick: () => {
              const patient = rx.patient?.name || rx.patientName || 'this patient';
              notifier.confirmCritical(
                `Delete prescription #${rx.id?.slice(0, 6)} for ${patient}? This cannot be undone.`,
                async () => {
                  const toastId = toast.loading('Deleting…');
                  try {
                    await prescriptionRepository.deletePrescription(rx.id);
                    toast.success('Prescription deleted', { id: toastId });
                    if (onRefresh) onRefresh();
                  } catch (err) {
                    toast.error('Failed to delete: ' + err.message, { id: toastId });
                  }
                }
              );
            }
          }
        ];

          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              width: '100%',
              minWidth: '150px',
              flexShrink: 0
            }}>
              <WorkspaceRxToggleButton rx={rx} />
              <AppActionGroup maxVisible={2} actions={actions} />
            </div>
          );
        },
      }
  ];
};
