import React from 'react';
import { Target, Activity, Clock, Layers, Package, Syringe, DollarSign, FlaskConical, AlertTriangle, Stethoscope, User, ShieldAlert, ThumbsUp, UserCheck, BrainCircuit, FileText, FileSpreadsheet, Copy, Eye } from '@/lib/icons';

export default function ProtocolExecutiveSummary({ protocol, onUpdate }) {
  // Safe fallbacks and calculations
  const phasesCount = protocol?.phases?.length || 0;
  const productsCount = protocol?.phases?.reduce((acc, phase) => acc + (phase.items?.length || 0), 0) || 0;
  const duration = protocol?.phases?.reduce((acc, phase) => acc + (phase.durationWeeks || 0), 0) || 0;
  
  const summary = protocol?.executiveSummary || {};
  const evidenceLevel = summary.evidenceLevel || 'Clinical Consensus';
  const injections = summary.totalInjections || (duration * 4);
  const cost = summary.estimatedCost || (productsCount * 150);
  const vials = summary.totalVials || productsCount;
  const difficulty = summary.difficultyLevel || 'Moderate';
  
  // New fields from requirements
  const goal = summary.goal || protocol?.protocol_name || 'Optimization';
  const indication = summary.indication || 'Anti-Aging / Longevity';
  const targetPatient = summary.targetPatient || 'Adults 35+ with low energy';
  const contraindications = summary.contraindications || 'Pregnancy, Active Cancer';
  const adherence = summary.estimatedAdherence || '85% (High)';
  const estimatedVisits = summary.estimatedVisits || 3;
  const requiredLabs = summary.requiredLabs || 2;
  const aiConfidence = summary.aiConfidence || '94%';

  const MetricCard = ({ icon, label, value, color }) => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem'
    }}>
      <div style={{
        background: `var(--${color}-light, rgba(0,0,0,0.05))`,
        color: `var(--${color}, #333)`,
        padding: '0.75rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner / Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Executive Summary</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            High-level overview of protocol objectives, requirements, and metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <FileText size={16} /> Generate Prescription
          </button>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <FileSpreadsheet size={16} /> Generate Quotation
          </button>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <Copy size={16} /> Duplicate Protocol
          </button>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <Eye size={16} /> Preview Patient View
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem'
      }}>
        <MetricCard icon={<Target size={22} />} label="Protocol Goal" value={goal} color="primary" />
        <MetricCard icon={<Stethoscope size={22} />} label="Clinical Indication" value={indication} color="info" />
        <MetricCard icon={<Activity size={22} />} label="Evidence Level" value={evidenceLevel} color="success" />
        <MetricCard icon={<Clock size={22} />} label="Est. Duration" value={`${duration} Weeks`} color="warning" />
        <MetricCard icon={<User size={22} />} label="Target Patient" value={targetPatient} color="primary" />
        <MetricCard icon={<ShieldAlert size={22} />} label="Contraindications" value={contraindications} color="danger" />
        <MetricCard icon={<AlertTriangle size={22} />} label="Difficulty" value={difficulty} color="warning" />
        <MetricCard icon={<ThumbsUp size={22} />} label="Est. Adherence" value={adherence} color="success" />
        
        <MetricCard icon={<Package size={22} />} label="Required Products" value={productsCount} color="info" />
        <MetricCard icon={<Syringe size={22} />} label="Number of Injections" value={injections} color="danger" />
        <MetricCard icon={<UserCheck size={22} />} label="Estimated Visits" value={estimatedVisits} color="primary" />
        <MetricCard icon={<FlaskConical size={22} />} label="Required Labs" value={requiredLabs} color="success" />
        <MetricCard icon={<DollarSign size={22} />} label="Estimated Cost" value={`AED ${cost}`} color="warning" />
        <MetricCard icon={<BrainCircuit size={22} />} label="AI Confidence" value={aiConfidence} color="primary" />
      </div>

      {/* Clinical Overview Paragraph */}
      <div style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        padding: '1.5rem' 
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Clinical Rationale & Overview</h4>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
          {protocol.overview_summary || 'No detailed overview provided for this protocol. Please add clinical rationale and objectives. This section should detail the pathophysiological target of the therapy, expected mechanisms of action, and rationale for the chosen peptide sequences and dosages.'}
        </p>
      </div>

    </div>
  );
}
