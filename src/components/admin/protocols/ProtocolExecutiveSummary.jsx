import React from 'react';
import { Target, Activity, Clock, Layers, Package, Syringe, DollarSign, FlaskConical, AlertTriangle, Stethoscope, User, ShieldAlert, ThumbsUp, UserCheck, BrainCircuit, FileText, FileSpreadsheet, Copy, Eye, Share2 } from '@/lib/icons';
import toast from 'react-hot-toast';

export default function ProtocolExecutiveSummary({ protocol, onUpdate, onCardClick }) {
  // Safe fallbacks and calculations
  const phasesCount = protocol?.phases?.length || 0;
  
  // Extract unique active compounds
  const allItems = protocol?.phases?.reduce((acc, phase) => [...acc, ...(phase.items || [])], []) || [];
  const activeCompounds = [...new Set(allItems.map(i => i.name || i.productName || 'Unknown').filter(n => n !== 'Unknown'))];
  const productsCount = activeCompounds.length;
  const productsString = activeCompounds.length > 0 ? activeCompounds.join(' + ') : 'None';
  
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

  const MetricCard = ({ icon, label, value, color, targetSection }) => (
    <div 
      onClick={() => targetSection && onCardClick && onCardClick(targetSection)}
      className={`detail-metric-card ${targetSection ? 'interactive' : ''}`}
    >
      <div className="detail-metric-icon-box" data-color={color}>
        {icon}
      </div>
      <div className="detail-metric-content">
        <div className="detail-metric-label">
          {label}
        </div>
        <div className="detail-metric-value">
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div className="detail-page-wrapper" style={{ padding: '0.5rem' }}>
      
      {/* Main KPI Grid */}
      <div className="detail-metric-grid">
        <MetricCard icon={<Target size={22} />} label="Protocol Goal" value={goal} color="primary" />
        <MetricCard icon={<Stethoscope size={22} />} label="Clinical Indication" value={indication} color="info" targetSection="patient" />
        <MetricCard icon={<Activity size={22} />} label="Evidence Level" value={evidenceLevel} color="success" />
        <MetricCard icon={<Clock size={22} />} label="Est. Duration" value={`${duration} Weeks`} color="warning" targetSection="treatment" />
        <MetricCard icon={<User size={22} />} label="Target Patient" value={targetPatient} color="primary" targetSection="patient" />
        <MetricCard icon={<ShieldAlert size={22} />} label="Contraindications" value={contraindications} color="danger" targetSection="patient" />
        <MetricCard icon={<AlertTriangle size={22} />} label="Difficulty" value={difficulty} color="warning" />
        <MetricCard icon={<ThumbsUp size={22} />} label="Est. Adherence" value={adherence} color="success" targetSection="monitoring" />
        
        <MetricCard icon={<Package size={22} />} label={`Included Peptides (${productsCount})`} value={productsString} color="info" targetSection="treatment" />
        
        {/* Added Vials Breakdown based on user feedback */}
        <MetricCard icon={<FlaskConical size={22} />} label="Required Vials" value={activeCompounds.map(c => `${c}: ~${Math.ceil(duration / 4)}`).join(' | ') || '0'} color="primary" targetSection="treatment" />
        
        <MetricCard icon={<Syringe size={22} />} label="Number of Injections" value={injections} color="danger" targetSection="dosage" />
        <MetricCard icon={<UserCheck size={22} />} label="Clinical Visits" value={estimatedVisits} color="primary" targetSection="monitoring" />
        <MetricCard icon={<Activity size={22} />} label="Required Labs" value={requiredLabs} color="success" targetSection="labs" />
        <MetricCard icon={<DollarSign size={22} />} label="Estimated Cost" value={`$ ${cost} USD`} color="warning" />
        <MetricCard icon={<BrainCircuit size={22} />} label="AI Confidence" value={aiConfidence} color="primary" />
      </div>

      {/* Clinical Overview Paragraph - Redesigned to be highly visual */}
      <div style={{
        marginTop: '3rem',
        position: 'relative',
        background: 'linear-gradient(145deg, var(--surface) 0%, rgba(255,255,255,0.4) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '2.5rem 3rem',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--primary)', opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--info)', opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' }}></div>

        <div style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', boxShadow: '0 8px 24px -6px rgba(59, 130, 246, 0.5)'
            }}>
              <BrainCircuit size={32} />
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: 'var(--text-main)', 
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              Clinical Rationale & Scientific Overview
            </h4>
            
            <div style={{
              position: 'relative',
              paddingLeft: '1.5rem',
              borderLeft: '4px solid var(--primary)'
            }}>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem', 
                lineHeight: 1.7, 
                fontWeight: 500,
                letterSpacing: '-0.01em'
              }}>
                {protocol.overview_summary || 'No detailed overview provided for this protocol. Please add clinical rationale and objectives. This section should detail the pathophysiological target of the therapy, expected mechanisms of action, and rationale for the chosen peptide sequences and dosages.'}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
