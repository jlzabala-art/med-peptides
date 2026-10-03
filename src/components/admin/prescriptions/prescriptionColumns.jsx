import React, { useState } from 'react';
import {
  Stethoscope, Download, Copy, Trash2, Loader2, Sparkles, FileText,
  Tag, Package, RotateCcw, MessageCircle, Eye, RefreshCw, Merge,
  ClipboardCheck, Syringe, Send, Receipt
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

const formatDoctorName = (name) => {
  if (!name) return '—';
  let cleaned = name.trim();
  while (cleaned.toLowerCase().startsWith('dr.') || cleaned.toLowerCase().startsWith('dr ')) {
    if (cleaned.toLowerCase().startsWith('dr.')) {
      cleaned = cleaned.substring(3).trim();
    } else {
      cleaned = cleaned.substring(2).trim();
    }
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

// ── Columns Definition (GCP UX Standard: 4 Consolidated Columns) ──────────────
export const getPrescriptionColumns = (options = {}) => {
  const { onEdit, onRefresh, onRefill, onEnrich, isDoctor, role } = options;
  const canGenerateLabels = !isDoctor && role !== 'doctor';
  return [
    {
      key: 'prescription',
      header: 'Prescription & Patient',
      width: '32%',
      render: (rx) => {
        const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
        const doctor = rx.doctor?.name || rx.doctorName || '—';
        const patientId = rx.patientId || (rx.patient && rx.patient.id) || null;
        const doctorId = rx.doctorId || (rx.doctor && rx.doctor.id) || null;

        const rawSource = (rx.source || 'manual').toLowerCase().trim();
        const isImport = rawSource !== 'manual';

        const isMultiPart = rx._isSessionGroup || rx.rxGroupId || rx.partNumber;
        const multiPartLabel = rx._isSessionGroup 
          ? `Multi-part (${rx._sessionCount || rx._sessionMembers?.length || 'Session'})`
          : rx.partNumber ? `Part ${rx.partNumber}${rx.totalParts ? ` of ${rx.totalParts}` : ''}` : null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <CopyableId value={rx.prescriptionCode || rx.id} />
              {multiPartLabel && (
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}>
                  {multiPartLabel}
                </span>
              )}
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '4px',
                background: isImport ? '#eff6ff' : '#f8fafc',
                color: isImport ? '#1d4ed8' : '#475569',
                border: `1px solid ${isImport ? '#bfdbfe' : '#e2e8f0'}`,
              }}>
                {isImport ? 'Import' : 'Manual'}
              </span>
            </div>

            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
              <span>{patient}</span>
              {patientId && <CopyableId value={patientId} iconOnly={true} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
              <Stethoscope size={12} style={{ flexShrink: 0 }} />
              <span>{formatDoctorName(doctor)}</span>
              {doctorId && <CopyableId value={doctorId} iconOnly={true} />}
            </div>
          </div>
        );
      },
    },
    {
      key: 'treatment',
      header: 'Treatment & Items',
      width: '36%',
      render: (rx) => {
        if (rx._isSessionGroup) {
          const totalItems = rx.items?.length || 0;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>
                Multi-Formulation Session
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {rx._sessionMembers?.length || 1} protocol parts • {totalItems} total compounds
              </div>
            </div>
          );
        }

        const items = rx.items || rx.compounds || rx.products || [];
        const itemNames = items.map(i => i.name || i.productName || i.canonicalName || 'Compound').filter(Boolean);
        const displaySummary = itemNames.slice(0, 2).join(', ');
        const remainingCount = itemNames.length - 2;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.length > 0 ? (
              <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: '1.3' }}>
                <span style={{ fontWeight: 600 }}>{displaySummary}</span>
                {remainingCount > 0 && (
                  <span style={{ color: '#64748b', fontSize: '0.76rem', marginLeft: '4px' }}>
                    +{remainingCount} more
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No medication lines recorded
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <RxCompletenessBadge rx={rx} onEnrich={onEnrich} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status & Date',
      width: '18%',
      render: (rx) => {
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

        const dateStr = formatAnyDate(rx.createdAt)
          || formatAnyDate(rx.dateIssued)
          || formatAnyDate(rx.fagron?.importedAt)
          || formatAnyDate(rx.fagron?.reportDate)
          || '—';

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <StatusBadge status={aggregateStatus} label={RX_STATUS_LABELS[aggregateStatus]} />
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{dateStr}</div>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{dateStr}</div>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      width: '14%',
      align: 'right',
      sortable: false,
      render: (rx) => {
        if (rx._isSessionGroup) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                Expand to manage
              </span>
            </div>
          );
        }
        
        const isPeptideRx = hasPeptideItems(rx);
        const isPharmopolisSupplier = isPharmopolisRx(rx);

        const actions = [
          // ── PRIMARY ─────────────────────────────────────────────────────
          {
            type: 'action',
            label: 'View prescription',
            icon: Eye,
            isPrimary: true,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_PRESCRIPTION_VIEW', { detail: { rx } }));
            }
          },
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <AppActionGroup maxVisible={2} actions={actions} />
            </div>
          );
        },
      }
  ];
};
