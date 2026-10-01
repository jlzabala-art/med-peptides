import React, { useState } from 'react';
import { Stethoscope, Edit3, Download, Copy, Trash2, Loader2, Sparkles, FileText, Tag, Package, RotateCcw, MessageCircle, Eye } from '@/lib/icons';
import { openPrescriptionAI } from '../../../utils/openModuleAI';
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

// ── Columns Definition ────────────────────────────────────────────────────────
export const getPrescriptionColumns = (options = {}) => {
  const { onEdit, onRefresh, onRefill, onEnrich, isDoctor, role } = options;
  const canGenerateLabels = !isDoctor && role !== 'doctor';
  return [
    {
      key: 'patient',
      header: 'Patient & Doctor',
      width: '26%',
      render: (rx) => {
        const patient  = rx.patient?.name || rx.patientName || 'Unknown Patient';
        const doctor   = rx.doctor?.name  || rx.doctorName  || '—';
        const patientId = rx.patientId || (rx.patient && rx.patient.id) || null;
        const doctorId  = rx.doctorId  || (rx.doctor  && rx.doctor.id)  || null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{patient}</span>
              {patientId && <CopyableId value={patientId} iconOnly={true} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: '#64748b' }}>
              <Stethoscope size={12} />
              <span>{formatDoctorName(doctor)}</span>
              {doctorId && <CopyableId value={doctorId} iconOnly={true} />}
            </div>
            {(rx.accountManagerEmail || rx.accountManager?.name || rx.accountManager?.email) && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                color: '#0284c7',
                fontWeight: 700,
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '1px 6px',
                borderRadius: '4px',
                width: 'fit-content',
                marginTop: '1px'
              }}>
                <span>👔 AM: {rx.accountManager?.name || rx.accountManagerName || rx.accountManagerEmail?.split('@')[0]}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'quality',
      header: 'AI Quality',
      width: '12%',
      render: (rx) => {
        if (rx._isSessionGroup) {
          return <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Multi-Rx</span>;
        }
        return (
          <RxCompletenessBadge
            rx={rx}
            onEnrich={onEnrich}
          />
        );
      },
    },
    {
      key: 'source',
      header: 'Source & Items',
      width: '12%',
      render: (rx) => {
        // Determine if this is an AI/Fagron import or a manual entry
        const rawSource = (rx.source || 'manual').toLowerCase().trim();
        const isImport = rawSource !== 'manual';

        const badge = isImport
          ? { label: 'Import', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
          : { label: 'Manual', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };

        const apiCount = (rx.items || rx.compounds || []).length;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '6px',
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              fontSize: '0.72rem',
              fontWeight: 700,
              width: 'fit-content',
              letterSpacing: '0.02em',
            }}>
              {badge.label}
            </span>
            {apiCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {apiCount} item{apiCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '16%',
      // Rule #8: always use <StatusBadge>; normalizeRxStatus maps legacy values
      render: (rx) => {
        if (rx._isSessionGroup) {
          // Determine aggregate status (most restrictive)
          const statuses = rx._sessionMembers.map(m => normalizeRxStatus(m.status) || 'draft');
          let aggregateStatus = 'draft';
          if (statuses.includes('cancelled')) aggregateStatus = 'cancelled';
          else if (statuses.includes('pending')) aggregateStatus = 'pending';
          else if (statuses.includes('processing')) aggregateStatus = 'processing';
          else if (statuses.includes('in_transit')) aggregateStatus = 'in_transit';
          else if (statuses.every(s => s === 'completed')) aggregateStatus = 'completed';
          else if (statuses.every(s => s === 'approved' || s === 'completed')) aggregateStatus = 'approved';
          else aggregateStatus = statuses[0] || 'draft';

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StatusBadge status={aggregateStatus} label={RX_STATUS_LABELS[aggregateStatus]} />
            </div>
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
      key: 'dates',
      header: 'Dates',
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

        const rawFollowUp = rx.followUpDate || rx.followUp;
        let followUp = formatAnyDate(rawFollowUp) || (typeof rawFollowUp === 'string' ? rawFollowUp : null);
        if (typeof rx.followUp === 'object' && rx.followUp !== null && rx.followUp.afterMonths) {
          followUp = `In ${rx.followUp.afterMonths}m`;
        }

        const date = formatAnyDate(rx.createdAt)
          || formatAnyDate(rx.dateIssued)
          || formatAnyDate(rx.fagron?.importedAt)
          || formatAnyDate(rx.fagron?.reportDate)
          || rx.dateIssued
          || '—';

        const alert = rx.refillAlert || {};
        const alertDateStr = rx.refillAlertDate || alert.alertDate;
        const exhaustionDateStr = rx.exhaustionDate || alert.exhaustionDate;
        const alertStatus = rx.refillAlertStatus || alert.status;

        let refillBadge = null;
        if (alertDateStr || exhaustionDateStr) {
          const todayStr = new Date().toISOString().split('T')[0];
          const isExhausted = exhaustionDateStr && todayStr >= exhaustionDateStr;
          const isDue = alertDateStr && todayStr >= alertDateStr;

          if (isExhausted) {
            refillBadge = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '4px', marginTop: '2px', width: 'fit-content' }}>
                🔴 Agotado
              </span>
            );
          } else if (isDue || alertStatus === 'active') {
            refillBadge = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', marginTop: '2px', width: 'fit-content' }}>
                ⚠️ Reposición Debida
              </span>
            );
          } else {
            refillBadge = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 600, color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', marginTop: '2px', width: 'fit-content' }} title={`Alerta preventiva programada 15 días antes: ${alertDateStr}`}>
                ⏰ Refill: {alertDateStr ? formatAnyDate(alertDateStr) : 'Prog.'} (-15d)
              </span>
            );
          }
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', fontSize: '0.8rem' }}>
            <div style={{ color: '#334155', fontWeight: 600 }}>{date}</div>
            {followUp && followUp !== '—' && (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>→ F/U:</span> {followUp}
              </div>
            )}
            {refillBadge}
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      width: '20%',
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
        
        const actions = [
          // ── PRIMARY QUICK ACTION: View Prescription ─────────────────────
          {
            type: 'action',
            label: 'View Prescription',
            icon: Eye,
            isPrimary: true,
            onClick: () => {
              // Dispatches to the parent table's selectedItem state via a custom event
              // so PrescriptionDetailModal opens (same as row click, but from action menu)
              window.dispatchEvent(new CustomEvent('OPEN_PRESCRIPTION_VIEW', { detail: { rx } }));
            }
          },
          // ── AI ENRICHMENT QUICK ACTION ──────────────────────────────────
          {
            type: 'action',
            label: '✨ Enrich with AI (Auto-Repair)',
            icon: Sparkles,
            onClick: () => {
              if (onEnrich) {
                onEnrich(rx);
              } else {
                toast.error('Enrichment handler not configured');
              }
            }
          },
          {
            type: 'clone',
            label: 'Clone / Re-emit Prescription',
              onClick: () => {
                if (onRefill) {
                  onRefill(rx);
                } else {
                  toast.success('Cloning prescription...');
                }
              }
            },
            {
              type: 'sparkles',
              label: 'AI Prescription Review',
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
              type: 'action',
              label: 'Send Items to Active Workspace',
              icon: Package,
              onClick: () => {
                const rawItems = rx.items || rx.compounds || rx.products || [];
                const patientName = rx.patient?.name || rx.patientName || 'Patient';
                const patientId = rx.patientId || rx.patient?.id || '';

                if (!rawItems.length) {
                  toast.error('This prescription has no items to send');
                  return;
                }

                const itemsToAdd = rawItems.map((i, idx) => ({
                  id: i.id || i.variantId || i.productId || `rx_item_${Date.now()}_${idx}`,
                  productId: i.productId || i.id,
                  variantId: i.variantId || i.id,
                  canonicalName: i.name || i.productName || i.product_title || 'Medication',
                  sku: i.sku || '',
                  dosage: i.dosage || i.dose || '',
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
                  patientName,
                  patientId,
                }));

                const { addItems, setTargetEntity, setOperationType, setWorkspaceIntent, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore.getState();

                addItems(itemsToAdd, activeWorkspaceId, { openDrawer: true });
                setTargetEntity({
                  type: 'patient',
                  id: patientId,
                  name: patientName,
                  email: rx.patient?.email || rx.patientEmail || '',
                  phone: rx.patient?.phone || rx.patientPhone || '',
                  fileNumber: rx.patient?.fileNumber || rx.patientFileNumber || rx.patient?.mrn || '',
                }, activeWorkspaceId);
                setOperationType('sell_prescription', activeWorkspaceId);
                setWorkspaceIntent('sell', activeWorkspaceId);
                setDrawerOpen(true);
                toast.success(`${itemsToAdd.length} compounds sent to workspace (${patientName})`);
              }
            },
            // 🔁 Quick Refill / Repetir Prescripción
            {
              type: 'action',
              label: '🔁 Quick Refill (Renew Rx)',
              icon: RotateCcw,
              onClick: () => {
                if (options.onRefill) {
                  options.onRefill(rx);
                  return;
                }
                const rawItems = rx.items || rx.compounds || rx.products || [];
                const patientName = rx.patient?.name || rx.patientName || 'Patient';
                const patientId = rx.patientId || rx.patient?.id || '';

                if (!rawItems.length) {
                  toast.error('This prescription has no items to refill');
                  return;
                }

                const itemsToAdd = rawItems.map((i, idx) => ({
                  id: i.id || i.variantId || i.productId || `rx_refill_${Date.now()}_${idx}`,
                  productId: i.productId || i.id,
                  variantId: i.variantId || i.id,
                  canonicalName: i.name || i.productName || i.product_title || 'Medication',
                  sku: i.sku || '',
                  dosage: i.dosage || i.dose || '',
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
                  patientName,
                  patientId,
                }));

                const { addItems, setTargetEntity, setOperationType, setWorkspaceIntent, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore.getState();

                addItems(itemsToAdd, activeWorkspaceId, { openDrawer: true });
                setTargetEntity({
                  type: 'patient',
                  id: patientId,
                  name: patientName,
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
            // 📋 Guía de Administración para Paciente
            {
              type: 'action',
              label: '📋 Patient Admin & Syringe Guide',
              icon: FileText,
              onClick: () => {
                if (options.onOpenPatientGuide) {
                  options.onOpenPatientGuide(rx);
                } else {
                  window.dispatchEvent(new CustomEvent('OPEN_PATIENT_GUIDE_MODAL', { detail: { rx } }));
                }
              }
            },
            // 📲 WhatsApp al Paciente
            {
              type: 'action',
              label: '📲 Send to Patient via WhatsApp',
              icon: MessageCircle,
              onClick: () => {
                const patientName = rx.patient?.name || rx.patientName || 'Patient';
                const doctorName = rx.doctorName || rx.doctor?.name || 'Physician';
                const patientPhone = (rx.patientPhone || rx.patient?.phone || '').replace(/[^0-9]/g, '');
                const rawItems = rx.items || rx.compounds || rx.products || [];
                const itemNames = rawItems.map(i => i.name || i.productName || 'Compuesto').join(', ');
                
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
                const message = `Estimado/a ${patientName}, el ${doctorName} ha emitido su prescripción personalizada para ${itemNames || 'su tratamiento'}. Puede acceder a los detalles y confirmar la entrega desde su portal: ${origin}/patient/prescriptions. Saludos cordiales.`;
                
                if (patientPhone) {
                  const url = `https://wa.me/${patientPhone}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                  toast.success(`Abriendo WhatsApp para ${patientName}…`);
                } else {
                  navigator.clipboard.writeText(message);
                  toast.success('Mensaje copiado al portapapeles (paciente sin teléfono registrado)');
                }
              }
            },
            ...(!isDoctor ? [{
              type: 'create_quote',
              label: 'Create Quotation from Prescription',
              icon: FileText,
              onClick: () => {
                const patient = rx.patient?.name || rx.patientName || 'Patient';
                window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                  detail: {
                    type: 'prescription',
                    prescriptionId: rx.id,
                    rxId: rx.id,
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
            {
              type: 'download',
              label: 'Download PDF',
              onClick: async () => {
                const toastId = toast.loading('Generating Prescription PDF…');
                try {
                  const { generateClinicalProtocol } = await import('../../../services/pdfService');
                  const patient = rx.patient?.name || rx.patientName || 'Patient';
                  const asProtocol = {
                    protocol_title: `Prescription: ${patient}`,
                    metadata: {
                      scientificName: `Clinical Prescription`,
                      description: `Personalized prescription for ${patient}. Issued: ${rx.createdAt ? (typeof rx.createdAt.toDate === 'function' ? rx.createdAt.toDate().toLocaleDateString() : new Date(rx.createdAt).toLocaleDateString()) : (rx.dateIssued || 'N/A')}`
                    },
                    phases: [{
                      phase_title: 'Primary Treatment',
                      start_week: 1,
                      end_week: parseInt(rx.duration) || 4,
                      drugs_used: (rx.items || rx.compounds || rx.products || []).map(i => ({
                        product_title: i.name || i.productName || i.product_title || 'Medication',
                        product_slug: i.product_slug || i.name || '',
                        weekly_dose: i.dosage || i.dose || i.quantity || '',
                        dosing_frequency: i.frequency || '',
                        route: i.route || 'SC',
                        vial_strength_used: i.strength || '',
                        description: i.instructions || ''
                      }))
                    }]
                  };
                  await generateClinicalProtocol(asProtocol, { user: { name: patient } });
                  toast.success('Prescription PDF downloaded', { id: toastId });
                } catch (err) {
                  console.error('PDF export error:', err);
                  toast.error('Failed to generate PDF: ' + err.message, { id: toastId });
                }
              }
            },
            ...(canGenerateLabels ? [
              {
                type: 'action',
                label: 'Pharmapolis A4 Stickers (PDF)',
                icon: Tag,
                onClick: async () => {
                  const toastId = toast.loading('Generating Pharmapolis A4 Stickers…');
                  try {
                    const { generatePharmapolisStickersPDF } = await import('../../../services/pharmapolisLabelService');
                    const patientObj = rx.patient || {
                      name: rx.patientName || 'Patient',
                      dob: rx.patientDob || rx.dob || '—',
                      fileNumber: rx.fileNumber || rx.patientId || rx.id?.slice(0, 8),
                    };
                    await generatePharmapolisStickersPDF(patientObj, [rx]);
                    toast.success('Pharmapolis A4 Stickers downloaded!', { id: toastId });
                  } catch (err) {
                    console.error('Sticker export error:', err);
                    toast.error('Failed to generate stickers: ' + err.message, { id: toastId });
                  }
                }
              },
              {
                type: 'action',
                label: 'Pharmapolis Sticker (PNG)',
                icon: Download,
                onClick: async () => {
                  const toastId = toast.loading('Generating Sticker PNG…');
                  try {
                    const { generatePharmapolisStickerPNG } = await import('../../../services/pharmapolisLabelService');
                    const patientObj = rx.patient || {
                      name: rx.patientName || 'Patient',
                      dob: rx.patientDob || rx.dob || '—',
                      fileNumber: rx.fileNumber || rx.patientId || rx.id?.slice(0, 8),
                    };
                    const dataUrl = await generatePharmapolisStickerPNG(patientObj, rx);
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    const slug = (patientObj.name || 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    link.download = `pharmapolis_sticker_${slug}_${rx.id?.slice(0, 6)}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Sticker PNG downloaded!', { id: toastId });
                  } catch (err) {
                    console.error('PNG export error:', err);
                    toast.error('Failed to generate PNG: ' + err.message, { id: toastId });
                  }
                }
              }
            ] : []),
            {
              type: 'delete',
              label: 'Delete Prescription',
              onClick: () => {
                const patient = rx.patient?.name || rx.patientName || 'this patient';
                notifier.confirmCritical(
                  `Delete prescription #${rx.id?.slice(0, 6)} for ${patient}? This cannot be undone.`,
                  async () => {
                    const toastId = toast.loading('Deleting prescription\u2026');
                    try {
                      await prescriptionRepository.deletePrescription(rx.id);
                      toast.success('Prescription deleted', { id: toastId });
                      if (onRefresh) onRefresh();
                    } catch (err) {
                      console.error('Delete error:', err);
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
