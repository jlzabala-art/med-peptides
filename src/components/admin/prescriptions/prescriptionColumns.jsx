import React, { useState } from 'react';
import {
  Stethoscope, Download, Copy, Trash2, Loader2, Sparkles, FileText,
  Tag, Package, RotateCcw, MessageCircle, Eye, RefreshCw, Merge,
  ClipboardCheck, Syringe, Send, Receipt, Share2, Briefcase
} from '@/lib/icons';
import { openPrescriptionAI } from '../../../utils/openModuleAI';

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

// ── 1-Click Workspace Toggle Button (SSOT Integration) ─────────────────────────
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
      title={isInWorkspace ? 'Remove from active workspace' : 'Add to active workspace'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: isInWorkspace ? 700 : 500,
        backgroundColor: isInWorkspace ? '#e0f2fe' : '#ffffff',
        color: isInWorkspace ? '#0369a1' : '#475569',
        border: isInWorkspace ? '1px solid #7dd3fc' : '1px solid #cbd5e1',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!isInWorkspace) {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.borderColor = '#94a3b8';
        }
      }}
      onMouseLeave={(e) => {
        if (!isInWorkspace) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }
      }}
    >
      <Briefcase size={12} color={isInWorkspace ? '#0284c7' : '#64748b'} />
      <span>{isInWorkspace ? 'In Workspace' : '+ Workspace'}</span>
    </button>
  );
}

// ── Columns Definition (GCP UX Standard: 4 Consolidated Columns) ──────────────
export const getPrescriptionColumns = (options = {}) => {
  const { onEdit, onRefresh, onRefill, onEnrich, isDoctor, role } = options;
  const canGenerateLabels = !isDoctor && role !== 'doctor';
  return [
    {
      key: 'patient',
      header: 'Patient & Doctor',
      width: '31%',
      render: (rx) => {
        const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
        const patientId = rx.patientId || (rx.patient && rx.patient.id) || null;
        const doctor = rx.doctor?.name || rx.doctorName || '—';
        const formattedDoc = formatDoctorName(doctor);
        const clinicName = rx.treatingDoctor?.clinic || rx.clinic || rx.clinicName || (String(doctor).toLowerCase().includes('haytham') || String(doctor).toLowerCase().includes('heytham') ? 'Arthregen Clinic' : null);
        
        let multiPartLabel = null;
        let multiPartTooltip = null;
        if (rx._isSessionGroup) {
          const count = rx._sessionCount || rx._sessionMembers?.length || 2;
          multiPartLabel = `${count} parts`;
          multiPartTooltip = `Multi-part prescription (${count} compounded formulations)`;
        } else if (rx.partNumber && rx.totalParts && rx.totalParts > 1) {
          multiPartLabel = `Part ${rx.partNumber}/${rx.totalParts}`;
          multiPartTooltip = `Formulation part ${rx.partNumber} of ${rx.totalParts}`;
        } else if (rx.partNumber && rx.partNumber > 1) {
          multiPartLabel = `Part ${rx.partNumber}`;
          multiPartTooltip = `Formulation part ${rx.partNumber}`;
        } else if (rx.isMultiPart && rx.totalParts && rx.totalParts > 1) {
          multiPartLabel = `${rx.totalParts} parts`;
          multiPartTooltip = `Multi-part prescription (${rx.totalParts} parts)`;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, overflow: 'hidden' }}>
            {/* Primary line: Patient Name (Strict 1 line, native tooltip, copy icon) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', minWidth: 0 }}>
              <div style={{ 
                minWidth: 0,
                flex: '1 1 auto',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                overflow: 'hidden'
              }}>
                <span 
                  title={patient}
                  style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    fontWeight: 600, 
                    color: '#202124', 
                    fontSize: '0.88rem'
                  }}
                >
                  {patient}
                </span>
                {patientId && <CopyableId value={patientId} iconOnly={true} />}
              </div>
              {multiPartLabel && (
                <span 
                  title={multiPartTooltip}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: '#e6f4ea',
                    color: '#137333',
                    border: '1px solid #ceead6',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {multiPartLabel}
                </span>
              )}
            </div>

            {/* Secondary line: Doctor + Clinic (Strict 1 line, native tooltips) */}
            <div style={{ 
              fontSize: '0.80rem', 
              color: '#5f6368', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              <Stethoscope size={12} color="#5f6368" style={{ flexShrink: 0 }} />
              <span 
                title={formattedDoc}
                style={{ 
                  fontWeight: 500, 
                  color: '#202124',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 1
                }}
              >
                {formattedDoc}
              </span>
              {clinicName && (
                <span 
                  title={clinicName}
                  style={{ 
                    fontSize: '0.70rem', 
                    color: '#5f6368', 
                    background: '#f1f3f4', 
                    padding: '1px 5px', 
                    borderRadius: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '150px',
                    flexShrink: 0
                  }}
                >
                  {clinicName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Program / Type',
      width: '22%',
      render: (rx) => {
        const typeInfo = classifyPrescription(rx);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, overflow: 'hidden' }}>
            <span 
              title={`${typeInfo.label} — ${typeInfo.sublabel}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: typeInfo.badgeBg,
                color: typeInfo.badgeColor,
                border: `1px solid ${typeInfo.badgeBorder}`,
                whiteSpace: 'nowrap',
                width: 'fit-content',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <span>{typeInfo.emoji}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeInfo.label}</span>
            </span>
            <span 
              title={typeInfo.sublabel}
              style={{ 
                fontSize: '0.72rem', 
                color: '#5f6368', 
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {typeInfo.sublabel}
            </span>
          </div>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      width: '12%',
      render: (rx) => {
        const formatAnyDate = (val) => {
          if (!val) return null;
          let d = null;
          if (typeof val.toDate === 'function') d = val.toDate();
          else if (val._seconds || val.seconds) d = new Date((val._seconds || val.seconds) * 1000);
          else if (typeof val === 'number') d = new Date(val);
          else if (typeof val === 'string') {
            const dmy = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (dmy) {
              d = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
            } else {
              d = new Date(val);
            }
          }
          if (d && !isNaN(d.getTime())) {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
          return null;
        };

        const dateStr = formatAnyDate(rx.date)
          || formatAnyDate(rx.dateIssued)
          || formatAnyDate(rx.createdAt)
          || formatAnyDate(rx.createdAt_ts)
          || formatAnyDate(rx.updatedAt)
          || formatAnyDate(rx.fagron?.importedAt)
          || formatAnyDate(rx.fagron?.reportDate)
          || '—';

        return (
          <div 
            title={dateStr}
            style={{ fontSize: '0.8125rem', color: '#5f6368', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {dateStr}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      render: (rx) => {
        if (rx._isSessionGroup) {
          const statuses = (rx._sessionMembers || []).map(m => normalizeRxStatus(m.status) || 'draft');
          let aggregateStatus = 'draft';
          if (statuses.includes('cancelled')) aggregateStatus = 'cancelled';
          else if (statuses.includes('pending')) aggregateStatus = 'pending';
          else if (statuses.includes('processing')) aggregateStatus = 'processing';
          else if (statuses.includes('in_transit')) aggregateStatus = 'in_transit';
          else if (statuses.every(s => s === 'completed')) aggregateStatus = 'completed';
          else if (statuses.every(s => s === 'approved' || s === 'completed')) aggregateStatus = 'approved';
          else aggregateStatus = statuses[0] || 'draft';

          return (
            <StatusBadge status={aggregateStatus} label={RX_STATUS_LABELS[aggregateStatus]} />
          );
        }

        return (
          <InlineEditableCell
            value={normalizeRxStatus(rx.status) || 'draft'}
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
            format={(val) => <StatusBadge status={val} label={RX_STATUS_LABELS[val]} />}
            onSave={async (newStatus) => {
              try {
                await prescriptionRepository.updatePrescription(rx.id, { status: newStatus });
                toast.success('Status updated');
                if (options.onRefresh) options.onRefresh();
              } catch (err) {
                console.error(err);
                toast.error('Failed to update status');
                throw err;
              }
            }}
          />
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      width: '21%',
      align: 'right',
      sortable: false,
      render: (rx) => {
        
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
              const itemsToAdd = rawItems.map((i, idx) => ({
                id: i.id || i.variantId || i.productId || `rx_item_${Date.now()}_${idx}`,
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
                prescriptionId: rx.id, prescriptionCode: rx.prescriptionCode || rx.id,
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
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
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
          // Pharmapolis sticker exports — only relevant for compounding/injectable prescriptions
          ...(isPharmopolisSupplier && canGenerateLabels ? [
            {
              type: 'action',
              label: 'Pharmapolis A4 stickers (PDF)',
              icon: Tag,
              onClick: async () => {
                const toastId = toast.loading('Generating A4 stickers…');
                try {
                  const { generatePharmapolisStickersPDF } = await import('../../../services/pharmapolisLabelService');
                  const patientObj = rx.patient || { name: rx.patientName || 'Patient', dob: rx.patientDob || rx.dob || '—', fileNumber: rx.fileNumber || rx.patientId || rx.id?.slice(0, 8) };
                  await generatePharmapolisStickersPDF(patientObj, [rx]);
                  toast.success('Stickers downloaded', { id: toastId });
                } catch (err) {
                  toast.error('Failed: ' + err.message, { id: toastId });
                }
              }
            },
            {
              type: 'action',
              label: 'Pharmapolis sticker (PNG)',
              icon: Download,
              onClick: async () => {
                const toastId = toast.loading('Generating sticker PNG…');
                try {
                  const { generatePharmapolisStickerPNG } = await import('../../../services/pharmapolisLabelService');
                  const patientObj = rx.patient || { name: rx.patientName || 'Patient', dob: rx.patientDob || rx.dob || '—', fileNumber: rx.fileNumber || rx.patientId || rx.id?.slice(0, 8) };
                  const dataUrl = await generatePharmapolisStickerPNG(patientObj, rx);
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  const slug = (patientObj.name || 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  link.download = `pharmapolis_${slug}_${rx.id?.slice(0, 6)}.png`;
                  document.body.appendChild(link); link.click(); document.body.removeChild(link);
                  toast.success('PNG downloaded', { id: toastId });
                } catch (err) {
                  toast.error('Failed: ' + err.message, { id: toastId });
                }
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', width: '100%', paddingRight: '12px' }}>
              <WorkspaceRxToggleButton rx={rx} />
              <AppActionGroup maxVisible={2} actions={actions} />
            </div>
          );
        },
      }
  ];
};
