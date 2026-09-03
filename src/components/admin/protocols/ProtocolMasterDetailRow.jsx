import React from 'react';
import { 
  FlaskConical, Clock, Layers, ClipboardList, 
  Copy, Edit3, ArrowRight, Pill, ShieldAlert, CheckCircle2, ChevronRight, Briefcase 
} from '@/lib/icons';
import { getGoalLabel } from '../../../config/goals';
import StatusBadge from '../../ui/StatusBadge';
import ClinicalGanttTimeline from '../../protocol/ClinicalGanttTimeline';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import notifier from '../../../services/NotificationService';

export default function ProtocolMasterDetailRow({ 
  protocol, 
  onOpenDrawer, 
  onClone, 
  onCreateRx 
}) {
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
      {/* 1. Header Overview Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
            Clinical Pathway Architecture
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {goals.map((g, idx) => (
              <span key={idx} style={{ 
                background: 'rgba(14, 165, 233, 0.1)', 
                color: '#0284c7', 
                fontSize: '0.72rem', 
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

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={14} />
            <span>Load to Workspace</span>
          </button>

          {onCreateRx && (
            <button
              type="button"
              onClick={() => onCreateRx(protocol)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'var(--color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,54,102,0.2)'
              }}
            >
              <ClipboardList size={14} />
              <span>Create Prescription</span>
            </button>
          )}

          {onOpenDrawer && (
            <button
              type="button"
              onClick={() => onOpenDrawer(protocol)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={14} />
              <span>Full Clinical Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Treatment Duration</span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Clock size={15} color="#0284c7" />
            <span>{durationWeeks} Weeks</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Clinical Phases</span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Layers size={15} color="#7c3aed" />
            <span>{phases.length || 1} Phase{phases.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Therapeutic Mode</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
            {protocol.category || protocol.therapeutic_category || 'Regenerative Medicine'}
          </div>
        </div>
      </div>

      {/* 3. Interactive Clinical Gantt Timeline */}
      <ClinicalGanttTimeline protocol={protocol} />

      {/* 4. Clinical Guidelines & Biomarkers (if available) */}
      {(protocol.instructions || protocol.clinical_notes || protocol.biomarkers?.length > 0) && (
        <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Clinical Monitoring & Notes:</strong>
          <span>{protocol.instructions || protocol.clinical_notes || (protocol.biomarkers ? `Monitored biomarkers: ${protocol.biomarkers.join(', ')}` : '')}</span>
        </div>
      )}
    </div>
  );
}
