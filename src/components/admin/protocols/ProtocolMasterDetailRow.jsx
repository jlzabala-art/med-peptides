import React from 'react';
import Link from 'next/link';
import { 
  FlaskConical, Clock, Layers, ClipboardList, 
  Copy, Edit3, ArrowRight, Pill, ShieldAlert, CheckCircle2, ChevronRight, Briefcase,
  ExternalLink, Sparkles
} from '@/lib/icons';
import { getGoalLabel } from '../../../config/goals';
import StatusBadge from '../../ui/StatusBadge';
import ClinicalGanttTimeline from '../../protocol/ClinicalGanttTimeline';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useDrawer } from '../../../context/DrawerContext';
import notifier from '../../../services/NotificationService';

export default function ProtocolMasterDetailRow({ 
  protocol, 
  onOpenDrawer, 
  onClone, 
  onCreateRx 
}) {
  const { openDrawer } = useDrawer();
  if (!protocol) return null;

  const phases = protocol.phases || [];
  const goals = (Array.isArray(protocol.goals) && protocol.goals.length > 0)
    ? protocol.goals
    : (Array.isArray(protocol.goalIds) && protocol.goalIds.length > 0)
      ? protocol.goalIds
      : [protocol.primary_goal || 'Regenerative Therapy'];

  const durationWeeks = protocol.protocol_duration_weeks || protocol.duration_weeks || protocol.durationWeeks || 
    phases.reduce((acc, ph) => acc + (ph.durationWeeks || ph.duration_weeks || 0), 0) || 8;

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '1.25rem 1.5rem',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      margin: '0.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* 1. Protocol Overview (Zone A) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.85rem'
      }}>
        {/* Title and Actions Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}>
          {/* Identity & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.01em',
              lineHeight: 1.25
            }}>
              {protocol.name || protocol.title || 'Clinical Protocol Summary'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {protocol.category || protocol.therapeutic_category || 'Regenerative Therapy'}
              </span>
              {goals.length > 0 && <span style={{ color: '#cbd5e1' }}>•</span>}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {goals.map((g, idx) => (
                  <span key={idx} style={{ 
                    background: 'rgba(14, 165, 233, 0.08)', 
                    color: '#0284c7', 
                    fontSize: '0.70rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    border: '1px solid rgba(14, 165, 233, 0.2)'
                  }}>
                    {typeof g === 'string' ? getGoalLabel(g) : (g?.label || 'Clinical Goal')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Hierarchy: Primary (Create Rx), Secondary (Load to Workspace), Tertiary (Full Editor) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onCreateRx && (
              <button
                type="button"
                onClick={() => onCreateRx(protocol)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '36px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: 'var(--color-primary, #003666)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,54,102,0.25)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <ClipboardList size={15} />
                <span>Create Prescription</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const protocolItems = (phases || []).flatMap(phase => 
                  (phase.drugs_used || phase.products || []).map(d => ({
                    productId: d.productId || d.id || d.product_slug,
                    canonicalName: d.product_title || d.name || 'Protocol Medication',
                    dosage: d.weekly_dose || d.dosage || '',
                    quantity: 1,
                    unitPrice: Number(d.price || 150),
                    supplierCost: Number(d.supplierCost || 85),
                    format: d.format || 'Vial',
                  }))
                );
                const itemsToLoad = protocolItems.length > 0 ? protocolItems : [{
                  productId: protocol.id,
                  canonicalName: protocol.name || protocol.title || 'Clinical Protocol Kit',
                  dosage: `${durationWeeks} wks`,
                  quantity: 1,
                  unitPrice: 250,
                  supplierCost: 120,
                  format: 'Kit'
                }];

                const { addItems, activeWorkspaceId } = useWorkspaceStore.getState();
                addItems(itemsToLoad, activeWorkspaceId);
                notifier.success(`Loaded ${itemsToLoad.length} compound(s) from "${protocol.name || protocol.title}" into Workspace!`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '36px',
                padding: '0 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={15} />
              <span>Load to Workspace</span>
            </button>

            {/* Share Public Clinical Guide (Zero Financial Disclosure) */}
            <button
              type="button"
              onClick={() => {
                const slugOrId = protocol.slug || protocol.id;
                const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/proto/${slugOrId}`;
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(publicUrl).then(() => {
                    notifier.success('Public Clinical Protocol link copied to clipboard!');
                  }).catch(() => {});
                }
                if (typeof window !== 'undefined') {
                  window.open(publicUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '36px',
                padding: '0 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Open and copy public clinical guide (strictly clinical, zero financial info)"
            >
              <ExternalLink size={15} />
              <span>Share Clinical Guide</span>
            </button>

            {onOpenDrawer && (
              <button
                type="button"
                onClick={() => onOpenDrawer(protocol)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '36px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Edit3 size={15} />
                <span>Full Clinical Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Single-Row Summary Strip (Duration | Phases | Mode) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          padding: '6px 12px',
          background: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          width: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
            <Clock size={14} color="#0284c7" />
            <span>{durationWeeks} Weeks</span>
          </div>
          <span style={{ color: '#cbd5e1', fontWeight: 300 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
            <Layers size={14} color="#7c3aed" />
            <span>{phases.length || 1} Clinical Phase{phases.length !== 1 ? 's' : ''}</span>
          </div>
          <span style={{ color: '#cbd5e1', fontWeight: 300 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
            <span>{protocol.category || protocol.therapeutic_category || 'Weight Management'}</span>
          </div>
        </div>
      </div>

      {/* 3. Clinical Pharmacology & Rationale */}
      {(protocol.clinical_rationale || protocol.overview_summary || protocol.description) && (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
            <FlaskConical size={14} color="#0284c7" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clinical Pharmacology & Mechanism of Action
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {protocol.clinical_rationale || protocol.overview_summary || protocol.description}
          </p>
        </div>
      )}

      {/* 4. Compounds & Dosing Schedule (Bill of Materials - BOM) */}
      {Array.isArray(protocol.bom) && protocol.bom.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={14} color="#15803d" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Compounds & Clinical Dosing Schedule ({protocol.bom.length})
              </span>
            </div>
            {protocol.dosage_schedule && protocol.dosage_schedule.length > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {protocol.dosage_schedule.length} schedule regimens defined
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '6px 10px', fontWeight: 700, color: '#475569' }}>Active Compound</th>
                  <th style={{ padding: '6px 10px', fontWeight: 700, color: '#475569' }}>Target Dosage</th>
                  <th style={{ padding: '6px 10px', fontWeight: 700, color: '#475569' }}>Administration Frequency</th>
                  <th style={{ padding: '6px 10px', fontWeight: 700, color: '#475569' }}>Treatment Duration</th>
                </tr>
              </thead>
              <tbody>
                {protocol.bom.map((item, idx) => {
                  const compoundName = item.product_name || item.name || item.productId || 'Compound';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (openDrawer) {
                                openDrawer('product', item.productId || compoundName, { name: compoundName, id: item.productId });
                              }
                            }}
                            title="Open interactive product datasheet & pricing"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#0284c7',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{compoundName}</span>
                          </button>
                          <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                            <Link
                              href={`/admin/products?search=${encodeURIComponent(compoundName)}`}
                              title="Search this compound in Catalog Table"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#64748b',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                textDecoration: 'none'
                              }}
                            >
                              <span>Catalog</span>
                              <ExternalLink size={10} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                                  detail: {
                                    message: `Explain the clinical pharmacological role, optimal reconstitution, and dosing kinetics of ${compoundName} within the protocol "${protocol.name || protocol.title}".`,
                                    immediate: true
                                  }
                                }));
                              }}
                              title="Consult AI about this compound"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#7c3aed',
                                background: 'rgba(124, 58, 237, 0.08)',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                                cursor: 'pointer'
                              }}
                            >
                              <Sparkles size={10} />
                              <span>Ask AI</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#15803d', fontWeight: 600 }}>
                        {item.dosage || 'Prescribed Clinical Concentration'}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>
                        {item.frequency || 'Once daily or as directed'}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#64748b' }}>
                        {item.duration || `${durationWeeks} Weeks`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Required Laboratory Biomarkers & Monitoring Cadence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {/* Required Labs */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.75rem 1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
            <CheckCircle2 size={13} color="#0284c7" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Required Laboratory Biomarkers
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {((Array.isArray(protocol.required_labs) && protocol.required_labs.length > 0)
              ? protocol.required_labs
              : ['CBC', 'CMP', 'Lipid Panel', 'Baseline Vitals']
            ).map((lab, i) => (
              <span key={i} style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {lab}
              </span>
            ))}
          </div>
        </div>

        {/* Clinical Monitoring Cadence */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.75rem 1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
            <Clock size={13} color="#7c3aed" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clinical Monitoring Cadence
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
            {protocol.monitoring_cadence || 'Baseline evaluation, Week 4 tolerance check, Week 8 biomarker review, Week 12 consolidation'}
          </p>
          {Array.isArray(protocol.check_in_weeks) && protocol.check_in_weeks.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Checkpoints:</span>
              {protocol.check_in_weeks.map((wk, idx) => (
                <span key={idx} style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  background: '#f1f5f9',
                  color: '#334155',
                  borderRadius: '4px'
                }}>
                  Wk {wk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Clinical Contraindications (Zone B) */}
      {Array.isArray(protocol.contraindications) && protocol.contraindications.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          padding: '0.85rem 1.1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={15} color="#dc2626" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contraindications & Clinical Exclusions ({protocol.contraindications.length})
              </span>
            </div>
            <span style={{ fontSize: '0.70rem', color: '#b91c1c', fontWeight: 600 }}>
              Verify patient baseline biomarkers prior to induction
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {protocol.contraindications.map((contra, idx) => (
              <span key={idx} style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#991b1b',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '4px 10px',
                borderRadius: '6px',
                lineHeight: 1.4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>•</span>
                <span>{typeof contra === 'string' ? contra : (contra.condition || JSON.stringify(contra))}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 7. Interactive Clinical Gantt Timeline */}
      <ClinicalGanttTimeline protocol={protocol} />

      {/* 8. Additional Clinical Notes (if available) */}
      {(protocol.instructions || protocol.clinical_notes || protocol.administration_notes) && (
        <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Administration Guidelines:</strong>
          <span>{protocol.administration_notes || protocol.instructions || protocol.clinical_notes}</span>
        </div>
      )}
    </div>
  );
}
