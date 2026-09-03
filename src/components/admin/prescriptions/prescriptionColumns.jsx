import React, { useState } from 'react';
import { Stethoscope, Edit3, Download, Copy, Trash2, Loader2, Sparkles, FileText } from '@/lib/icons';
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
  const { onEdit, onRefresh, onRefill } = options;
  return [
    {
      key: 'patient',
      header: 'Patient & Doctor',
      width: '35%',
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
          </div>
        );
      },
    },
    {
      key: 'source',
      header: 'Source & Items',
      width: '15%',
      render: (rx) => {
        const sourceMap = {
          fagron:    { label: 'Fagron',    color: '#db2777', bg: '#fdf2f8' },
          document:  { label: 'Doc Upload',color: '#2563eb', bg: '#eff6ff' },
          protocol:  { label: 'Protocol',  color: '#0d9488', bg: '#f0fdfa' },
          items:     { label: 'Items',     color: '#7c3aed', bg: '#f5f3ff' },
          ai_report: { label: 'AI Report', color: '#4f46e5', bg: '#eef2ff' },
          manual:    { label: 'Manual',    color: '#475569', bg: '#f8fafc' },
        };
        const rawSource = (rx.source || 'manual').toLowerCase().trim();
        const meta = sourceMap[rawSource] || sourceMap.manual;
        
        if (rx._isSessionGroup) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {rx.treatmentProgram && (
                <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: '#fdf2f8', color: '#db2777', fontSize: '0.72rem', fontWeight: 700, width: 'fit-content', marginBottom: '2px' }}>
                  {rx.treatmentProgram}
                </span>
              )}
              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: meta.bg, color: meta.color, fontSize: '0.72rem', fontWeight: 700, width: 'fit-content' }}>
                {meta.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{rx._sessionCount} formulations</span>
            </div>
          );
        }

        const apiCount = (rx.items || rx.compounds || []).length;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {rx.treatmentProgram && (
              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: '#fdf2f8', color: '#db2777', fontSize: '0.72rem', fontWeight: 700, width: 'fit-content', marginBottom: '2px' }}>
                {rx.treatmentProgram}
              </span>
            )}
            <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: meta.bg, color: meta.color, fontSize: '0.72rem', fontWeight: 700, width: 'fit-content' }}>
              {meta.label}
            </span>
            {rx.treatmentType ? (
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>{rx.treatmentType} ({apiCount} items)</span>
            ) : (
              apiCount > 0
                ? <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{apiCount} item{apiCount !== 1 ? 's' : ''}</span>
                : <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>No items</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
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
      width: '20%',
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

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', fontSize: '0.8rem' }}>
            <div style={{ color: '#334155', fontWeight: 600 }}>{date}</div>
            {followUp && followUp !== '—' && (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>→ F/U:</span> {followUp}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Actions',
      width: '15%',
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
              type: 'edit',
              label: 'Edit Prescription',
              onClick: () => onEdit && onEdit(rx)
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
            },
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
              <AppActionGroup maxVisible={3} actions={actions} />
            </div>
          );
        },
      }
  ];
};
