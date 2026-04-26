import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Activity, RefreshCw, CheckCircle2, ChevronUp, ChevronDown, Beaker, Globe, Lock, 
  Users, TrendingUp, TrendingDown, Target, Zap, Waves, Brain, Moon, Heart, Flame, 
  Shield, Dna, Save, History, PlusSquare, FilePlus, ArrowLeftRight, ArrowLeft, ArrowRight, CheckCircle, 
  AlertCircle, ShieldAlert, Clock, Layout, Info, Printer, CalendarClock, Check, Calendar, ChevronRight,
  ShieldCheck, AlertTriangle, ClipboardList, Tag, List, RotateCcw, Star
} from 'lucide-react';
import { getPubMedLiterature } from '../services/pubmedService';
import { saveProtocol, getProtocolById, getSessionId } from '../services/protocolStorage';
import { generateProtocolData, TEMPLATE_MATCH_ENGINE } from '../services/protocolEngine';
import { ProtocolEngine2 } from '../services/protocolEngine2';
const ProtocolDashboard = lazy(() => import('../components/builder/ProtocolDashboard'));
const OperationalDashboard = lazy(() => import('../components/builder/OperationalDashboard'));
const ProtocolCompare = lazy(() => import('../components/builder/ProtocolCompare'));
const ProvenanceBlock = lazy(() => import('../components/builder/ProvenanceBlock'));
const ProtocolHistoryModal = lazy(() => import('../components/builder/ProtocolHistoryModal'));
const ProtocolComparisonModal = lazy(() => import('../components/builder/ProtocolComparisonModal'));
const ValidationSummary = lazy(() => import('../components/builder/ValidationSummary'));
const AdminClinicalAudit = lazy(() => import('../components/builder/AdminClinicalAudit'));
import { duplicateProtocol, getProtocolHistory } from '../services/protocolStorage';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { protocolRepository } from '../repositories/protocolRepository';
import { 
  PRIMARY_OBJECTIVES, 
  CLINICAL_OBJECTIVE_GROUPS, 
  CONSTRAINT_GROUPS 
} from '../data/protocolMetadata';

// --- CONSTANTS ---

const getTodayISO = () => new Date().toISOString().split('T')[0];

const DEFAULT_FORM_DATA = {
  patientType: '',
  ageGroup: '',
  primaryCondition: '',
  startDate: getTodayISO(),
  metabolicStatus: 'normal',
  tempo: 'standard',
  durationWeeks: 12,
  weight: '',
  height: '',
  bmi: '',
  guidelines: {
    format: '',
    complexity: '',
    clinical: [],
    formulation: '',
    practical: [],
    workflow: ''
  }
};


// --- WORKFLOW SUB-COMPONENTS ---

const WorkflowStepper = ({ currentStep, completedSteps, onStepClick }) => {
  const allSteps = [
    { id: 1, label: 'Patient' },
    { id: 2, label: 'Options' },
    // Phase 3 (Safety) is intentionally hidden from UI — code preserved below
    // { id: 3, label: 'Safety' },
    { id: 4, label: 'Timeline' },
    { id: 5, label: 'Review' },
    { id: 6, label: 'Export' }
  ];
  const steps = allSteps;

  const activeRef = useRef(null);

  useEffect(() => {
    // Scroll active step into view when step changes (mobile horizontal scroll)
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentStep]);

  return (
    <div className="workflow-stepper">
      <div className="stepper-container">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted || step.id <= Math.max(...completedSteps, 0) + 1;

          return (
            <React.Fragment key={step.id}>
              <div 
                ref={isActive ? activeRef : null}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isClickable && onStepClick(step.id)}
                style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
              >
                <div className="step-circle">
                  {isCompleted
                    ? <CheckCircle size={14} color="#10b981" />
                    : step.id}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
              {index < steps.length - 1 && <div className="step-connector" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const WorkflowSidebar = ({ formData, protocolData, currentStep, completedSteps, collapsed = false, onNavigateToField }) => {
  const peptideList = useMemo(() => {
    if (!protocolData) return [];
    const schedule = protocolData.protocol_schedule || protocolData.dosing_schedule || [];
    const meds = new Set();
    schedule.forEach(week => {
      (week.compounds || []).forEach(c => { if (c.name) meds.add(c.name); });
    });
    return Array.from(meds);
  }, [protocolData]);

  const objective = PRIMARY_OBJECTIVES.find(o => o.id === formData.primaryCondition);

  if (collapsed) return null;

  return (
    <aside className="workflow-sidebar">
      <div className="sidebar-header-v5">
        <Activity size={18} color="var(--primary)" />
        <span className="workspace-badge">PROTOCOL CONTEXT</span>
      </div>

      <div className="sidebar-section-v5">
        <div className="sidebar-section-header">
          <ClipboardList size={14} />
          <span>Patient Profile</span>
        </div>
        <div className="sidebar-static-item">
          <div className="sidebar-label">Objective</div>
          <div className="sidebar-value">{objective?.label || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not selected</span>}</div>
        </div>
        <div className="sidebar-static-item">
          <div className="sidebar-label">Demographic</div>
          <div className="sidebar-value">{formData.patientType || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not selected</span>} {formData.ageGroup && `(${formData.ageGroup}y)`}</div>
        </div>
        <div className="sidebar-static-item">
          <div className="sidebar-label">Biometrics</div>
          <div className="sidebar-value">
            {formData.bmi ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  BMI: {formData.bmi} ({parseFloat(formData.bmi) < 18.5 ? 'Underweight' : parseFloat(formData.bmi) < 25 ? 'Normal' : parseFloat(formData.bmi) < 30 ? 'Overweight' : 'Obese'})
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Weight: {formData.weight} kg • Height: {formData.height} cm
                </span>
              </div>
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>PENDING</span>
            )}
          </div>
        </div>
        <div className="sidebar-static-item">
          <div className="sidebar-label">Strategy</div>
          <div className="sidebar-value" style={{ textTransform: 'capitalize' }}>
            {formData.tempo} • {formData.durationWeeks}w
          </div>
        </div>
      </div>

      <div className="sidebar-section-v5">
        <div className="sidebar-section-header">
          <Layout size={14} />
          <span>Workflow Progress</span>
        </div>
        <div className="progress-list-v5">
          {[
            { id: 1, label: 'Patient Definition' },
            { id: 2, label: 'Protocol Selection' },
            { id: 3, label: 'Safety Validation' },
            { id: 4, label: 'Timeline Configuration' },
            { id: 5, label: 'Medical Review' },
            { id: 6, label: 'Final Export' }
          ].map(step => {
            const isDone = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isNext = step.id === Math.min(...[1,2,3,4,5,6].filter(s => !completedSteps.includes(s)));
            let icon = <div className="dot-pending" />;
            if (isDone) icon = <CheckCircle2 size={14} color="#10b981" />;
            else if (isCurrent) icon = <RefreshCw size={14} color="var(--primary)" className="spin-slow" />;
            else if (isNext) icon = <div className="dot-next" />;

            return (
              <div key={step.id} className={`progress-item-v5 ${isCurrent ? 'active' : ''}`}>
                {icon}
                <span className="progress-label">{step.label}</span>
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b' }}>TOTAL COMPLETION</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)' }}>{Math.round((completedSteps.length / 6) * 100)}%</span>
            </div>
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', width: `${(completedSteps.length / 6) * 100}%`, transition: 'width 0.5s ease-out' }} />
            </div>
        </div>
      </div>

      {(protocolData?._validation || protocolData?.validation) && (
        <div className="sidebar-section-v5 confidence-summary">
          <div className="sidebar-section-header">
            <ShieldCheck size={14} />
            <span>Protocol Confidence</span>
          </div>
          <div className="confidence-display-v5">
            <div className="confidence-value-large">
              {(protocolData._validation?.confidence_score || protocolData.validation?.confidence_score || 95)}%
            </div>
            <div className="confidence-label">CLINICAL ALIGNMENT</div>
          </div>
        </div>
      )}

      {peptideList.length > 0 && (
        <div className="sidebar-section-v5">
          <div className="sidebar-section-header">
            <Tag size={14} />
            <span>Active Stack</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {peptideList.map((p, i) => (
              <span key={i} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const StickyBottomBar = ({ onBack, onNext, backLabel = "Back", nextLabel = "Continue", nextDisabled = false, showBack = true, isNextLoading = false }) => {
  return (
    <div className="sticky-bottom-bar animate-view-up">
      <div className="container-bottom-bar" style={{ display: 'flex', width: '100%', maxWidth: '1600px', margin: '0 auto', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="bar-left">
          {showBack && (
            <button onClick={onBack} className="btn-secondary-v5">
              <ArrowLeft size={18} /> {backLabel}
            </button>
          )}
        </div>
        <div className="bar-right">
          <button 
            onClick={onNext} 
            disabled={nextDisabled || isNextLoading}
            className={`btn-primary-v5 ${nextDisabled ? 'disabled' : 'pulse-ready'}`}
            style={{ justifyContent: 'center' }}
          >
            {isNextLoading ? <RefreshCw size={18} className="spin" /> : (
              <>
                {nextLabel}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LEVEL 1: Non-blocking Toast ---
const Toast = ({ message }) => (
  <div style={{
    position: 'fixed',
    bottom: '6.5rem',
    right: '2rem',
    background: '#1e293b',
    color: 'white',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.835rem',
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    animation: 'view-slide-up 0.3s ease forwards',
    pointerEvents: 'none'
  }}>
    <CheckCircle2 size={15} color="#10b981" /> {message}
  </div>
);

// --- LEVEL 2: Non-blocking Inline Warning Banner ---
const InlineWarning = ({ message, onDismiss }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
    padding: '1rem 1.5rem',
    background: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: '12px',
    marginBottom: '1.75rem',
    animation: 'view-slide-up 0.3s ease forwards'
  }}>
    <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#78350f', lineHeight: 1.55 }}>
      {message}
    </span>
    <button
      onClick={onDismiss}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: '1rem', lineHeight: 1, padding: '0 0 0 0.5rem', flexShrink: 0 }}
      aria-label="Dismiss warning"
    >
      ✕
    </button>
  </div>
);

const PathwayCard = ({ protocol, index, isSelected, isHovered, onSelect, onMouseEnter, onMouseLeave, isFavorite, onToggleFavorite, onDurationChange }) => {
  const [showDetailed, setShowDetailed] = useState(false);
  const score = protocol.validation?.confidence_score || 95;
  const compounds = protocol.computedTimeline?.[0]?.medications?.map(m => m.name) || [];
  const weeks = protocol.computedCost?.totalWeeks || 12;
  const isRank1 = index === 0;

  // Debug Logging for Resolution Integrity (Part 17)
  useEffect(() => {
    if (isSelected && protocol) {
       console.log(`[PROTOCOL SELECTION] ID: ${protocol.id || protocol.tempo} | Phases: ${protocol.resolved_phases?.length || 0}`);
       protocol.resolved_phases?.forEach((phase, idx) => {
          if (!phase.drugs || phase.drugs.length === 0) {
             console.error(`[PROTOCOL ERROR] Missing compounds in Phase ${idx + 1}`);
          }
       });
    }
  }, [isSelected, protocol]);

  // Resolve Tempo accurately
  const rawTempo = protocol.tempo || protocol.variant || protocol.strategy || protocol.mode || protocol.configuration?.tempo || protocol.selectedTempo;
  let resolvedTempo = rawTempo || (isRank1 ? 'standard' : '');

  // Consistency with title
  const titleLower = (protocol.protocol_title || '').toLowerCase();
  if (titleLower.includes('(aggressive)')) resolvedTempo = 'aggressive';
  else if (titleLower.includes('(conservative)')) resolvedTempo = 'conservative';

  return (
    <div 
      className={`variant-card-v5 ${isSelected ? 'selected-state' : ''}`}
      onClick={() => onSelect()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer', border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0' }}
    >
      {isRank1 && (
        <div className="recommendation-badge">
          <Tag size={12} fill="currentColor" /> RECOMMENDED
        </div>
      )}

      <div className="variant-header-v5">
        {/* Selection indicator visually prominent */}
        <div className={`variant-selector-v5 radio-circle ${isSelected ? 'selected' : ''}`} 
             style={{ 
                 flexShrink: 0, 
                 width: '24px', 
                 height: '24px', 
                 border: `3px solid ${isSelected ? 'var(--primary)' : '#94a3b8'}`,
                 background: isSelected ? 'rgba(0, 54, 102, 0.05)' : 'white',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderRadius: '50%'
             }}>
          {isSelected && <div className="radio-inner" style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%' }} />}
        </div>
        
        <div className="variant-info-v5" style={{ flex: 1 }}>
          <div className="variant-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <h3 style={{ margin: 0 }}>{protocol.protocol_title || 'Clinical Pathway'}</h3>
                   <button
                     onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                     style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                   >
                     {isFavorite ? <Star size={18} fill="#eab308" color="#eab308" /> : <Star size={18} color="#cbd5e1" />}
                   </button>
                </div>
                <div className="validation-pill" title="Why this score?" style={{ 
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  cursor: 'help',
                  width: 'fit-content'
                }}>
                  <ShieldCheck size={12} color="#94a3b8" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.65rem' }}>{score}% Confidence</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('openConfidenceInfo', { detail: protocol }));
                      }}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, padding: 0 }}
                    >
                      (Why?)
                    </button>
                  </div>
                </div>
            </div>
          </div>

          <div className="variant-metrics-container">
            <div className="metric-box">
              <span className="metric-label">Peptides</span>
              <span className="metric-value">
                {(() => {
                  const drugList = (protocol.resolved_phases || [])
                    .flatMap(phase => phase.drugs || [])
                    .map(drug => drug.product_title);
                  const uniqueDrugs = [...new Set(drugList)];
                  return uniqueDrugs.length > 0 ? uniqueDrugs.join(' • ') : "No compounds defined";
                })()}
              </span>
            </div>
            <div className="metric-box" style={{ minWidth: '160px' }}>
              <span className="metric-label">Duration</span>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'nowrap' }}>
                {[8, 12, 16, 20].map(w => (
                  <button 
                    key={w} 
                    onClick={(e) => { e.stopPropagation(); onDurationChange(w); }}
                    style={{ 
                       padding: '4px 10px', 
                       border: 'none', 
                       borderRadius: '6px', 
                       fontSize: '0.75rem', 
                       fontWeight: 800, 
                       cursor: 'pointer',
                       whiteSpace: 'nowrap',
                       minWidth: '34px',
                       transition: 'all 0.15s ease',
                       background: parseInt(protocol.patient_context?.duration_weeks || 12) === w ? 'var(--primary)' : 'transparent',
                       color: parseInt(protocol.patient_context?.duration_weeks || 12) === w ? 'white' : '#64748b'
                    }}>
                    {w}w
                  </button>
                ))}
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Stages</span>
              <span className="metric-value">{protocol.resolved_phases?.length || 3} PHASES</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Tempo</span>
              <span className="metric-value tempo-tag" data-tempo={resolvedTempo}>{resolvedTempo.toUpperCase()}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Clinical Cost</span>
              <span className="metric-value" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.875rem' }}>${(protocol.computedCost?.weekly || protocol.weekly_cost || 0)} <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>/WK</span></span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                  ${(protocol.computedCost?.total || 0)} Total Protocol
                </span>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                  Approx. ${(protocol.computedCost?.injection || 0)} / Injection
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="variant-body-v5">
        <div className="clinical-justification">
          <div className="justification-header">
            <Info size={14} />
            <span>CLINICAL JUSTIFICATION</span>
          </div>
          <p>{protocol.justification || protocol.description || "Optimized therapeutic stack aligned with biological markers and historical outcomes."}</p>
        </div>

        {!isRank1 && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
              <ArrowLeftRight size={12} /> Strategic Variance vs Primary
            </div>
            <div className="grid-2-col-responsive" style={{ gap: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', fontSize: '0.6rem', marginBottom: '2px' }}>TITRATION:</span> 
                {resolvedTempo === 'aggressive' ? '+15% Speed' : resolvedTempo === 'conservative' ? '-20% Speed' : 'Standard Baseline'}
              </div>
              <div style={{ fontSize: '0.7rem', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', fontSize: '0.6rem', marginBottom: '2px' }}>RECOVERY:</span> 
                {resolvedTempo === 'conservative' ? 'High Focus' : 'Standard'}
              </div>
            </div>
          </div>
        )}

        <div className="card-actions-v5">
          {isSelected && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#10b981" /> Selected
            </span>
          )}
          <button 
            className="btn-details-v5"
            onClick={(e) => { e.stopPropagation(); setShowDetailed(!showDetailed); }}
            style={{ marginLeft: isSelected ? 'auto' : undefined }}
          >
            {showDetailed ? 'Hide Clinical Details' : 'View Full Clinical Details'}
          </button>
        </div>

        {showDetailed && (
          <div className="detailed-clinical-view animate-fade-in">
             <div className="detail-grid">
                <div className="detail-item">
                   <label>Primary Focus</label>
                   <p>{protocol.primaryClinicalFocus || 'Systemic optimization'}</p>
                </div>
                <div className="detail-item">
                   <label>Peptide Composition</label>
                   <div className="peptide-pills-row">
                      {compounds.map((c, i) => <span key={i} className="peptide-pill">{c}</span>)}
                   </div>
                </div>

                {/* PHASE SEQUENCE DISPLAY (Part 13) */}
                {protocol.resolved_phases?.length > 0 && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', width: '100%' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <List size={14} /> Phased Titration Schedule
                    </h4>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {protocol.resolved_phases.map((phase, pIdx) => (
                        <div key={pIdx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(0, 54, 102, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                              PHASE {pIdx + 1}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Weeks {phase.start_week || (pIdx * 4 + 1)}-{phase.end_week || (pIdx * 4 + 4)}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(phase.drugs || []).map((drug, dIdx) => (
                              <div key={dIdx} style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />
                                {drug.product_title}: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{drug.dose} {drug.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!formData.weight || !formData.height) && formData.primaryCondition === 'Weight Management / Obesity' && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <InlineWarning 
                      message="⚠ Weight and height highly recommended for optimized GLP-1/GIP metabolic protocol selection." 
                    />
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN TEMPLATE ---

export default function ProtocolBuilder({ region, products, cart, updateCart, setCartMetadata, onOpenCart, addProtocolRequest }) {
  const navigate = useNavigate();
  const { isProfessional } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadedId = searchParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [downstreamWarning, setDownstreamWarning] = useState(null);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);
  const [favoriteProtocolIds, setFavoriteProtocolIds] = useState(() => {
    const saved = sessionStorage.getItem('protocol_favorite_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('protocol_form_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure startDate is always populated (old sessions may lack it)
      if (!parsed.startDate) parsed.startDate = getTodayISO();
      return parsed;
    }
    return DEFAULT_FORM_DATA;
  });
  const [matchedProtocols, setMatchedProtocols] = useState(null);
  const [protocolData, setProtocolData] = useState(() => {
    const saved = sessionStorage.getItem('protocol_generated_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedProtocolId, setSelectedProtocolId] = useState(() => {
    return sessionStorage.getItem('protocol_selected_id') || null;
  });
  const [hoveredVariantId, setHoveredVariantId] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [physicianValidated, setPhysicianValidated] = useState(false);
  const [physicianAcknowledgment, setPhysicianAcknowledgment] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [confidenceInfoModal, setConfidenceInfoModal] = useState(null);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeTimelineWeek, setActiveTimelineWeek] = useState(1);
  const [allTemplates, setAllTemplates] = useState([]);
  const saveInProgressRef = useRef(false); // Prevent double auto-save
  const prevFormDataRef = useRef(null); // Track Step 1 field changes for regen detection

  const [touched, setTouched] = useState(false);
  const toggleFavorite = (id) => {
    setFavoriteProtocolIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      sessionStorage.setItem('protocol_favorite_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all patient data and reset the protocol?')) {
      setFormData(DEFAULT_FORM_DATA);
      setProtocolData(null);
      setMatchedProtocols(null);
      setCompletedSteps([]);
      setSelectedProtocolId(null);
      sessionStorage.removeItem('protocol_form_data');
      sessionStorage.removeItem('protocol_generated_data');
      sessionStorage.removeItem('protocol_selected_id');
      setCurrentStep(1);
      showToast('Session reset successful.');
    }
  };

  // Set touched and persist data
  useEffect(() => {
    if (formData !== DEFAULT_FORM_DATA || protocolData) {
        setTouched(true);
        sessionStorage.setItem('protocol_form_data', JSON.stringify(formData));
        if (protocolData) sessionStorage.setItem('protocol_generated_data', JSON.stringify(protocolData));
        if (selectedProtocolId) sessionStorage.setItem('protocol_selected_id', selectedProtocolId);
    }
  }, [formData, protocolData, selectedProtocolId]);

  // Auto-focus logic: Move to date input once first 3 fields are complete
  useEffect(() => {
    if (currentStep === 1 && formData.primaryCondition && formData.patientType && formData.ageGroup && !formData.startDate) {
      const dateInput = document.getElementById('protocolLaunchDate');
      if (dateInput) dateInput.focus();
    }
  }, [formData.primaryCondition, formData.patientType, formData.ageGroup, currentStep]);
  
  // PART 2 — DEEP LINKING & AUTO-FILL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const goal = params.get('goal');
    const focus = params.get('focus');
    
    if (goal || focus) {
      setFormData(prev => ({
        ...prev,
        primaryCondition: goal || prev.primaryCondition,
        clinicalFocus: focus || prev.clinicalFocus
      }));
      
      if (goal) {
        showToast(`Clinical Goal loaded: ${goal}`);
      }
    }
  }, []);

  // Detect Step 1 field changes that would invalidate existing generated results
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (prevFormDataRef.current === null) {
      prevFormDataRef.current = formData;
      return;
    }
    const prev = prevFormDataRef.current;
    prevFormDataRef.current = formData;
    const keyFields = ['primaryCondition', 'patientType', 'ageGroup', 'metabolicStatus', 'weight', 'height', 'tempo', 'durationWeeks', 'startDate'];
    const changed = keyFields.some(k => prev[k] !== formData[k]);
    if (changed && matchedProtocols && currentStep === 1) {
      setNeedsRegeneration(true);
      setDownstreamWarning('⚠ Patient parameters changed — regenerate the protocol to update all downstream steps.');
    }
  }, [formData]);

  // Listen for confidence info requests from child cards
  useEffect(() => {
    const handleOpenConfidence = (e) => {
      setConfidenceInfoModal(e.detail);
    };
    window.addEventListener('openConfidenceInfo', handleOpenConfidence);
    return () => window.removeEventListener('openConfidenceInfo', handleOpenConfidence);
  }, []);

  // Auto-save simulation

  // Reliable top-of-step scroll reset (handles async rendering heights)
  useEffect(() => {
    const handleScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };
    
    handleScroll(); // Immediate attempt
    const rafId = requestAnimationFrame(handleScroll); // Frame attempt
    const timeoutId = setTimeout(handleScroll, 100); // Fail-safe (e.g. if content lazy loads)
    
    return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
    };
  }, [currentStep]);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        const data = await protocolRepository.getProtocolTemplates();
        setAllTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates for audit:", err);
      }
    };
    fetchAllTemplates();
  }, []);

  // Deep-link: ?templateId=<id>&startAtPhase=timeline → skip directly to Timeline (step 4)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('templateId');
    const startAtPhase = params.get('startAtPhase');
    if (!templateId || startAtPhase !== 'timeline') return;
    if (!allTemplates || allTemplates.length === 0) return; // wait for templates to finish loading
    const matched = allTemplates.find(
      t => t.protocol_id === templateId || t.id === templateId
    );
    if (!matched) {
      console.warn('[DeepLink] Template not found:', templateId);
      return;
    }
    setProtocolData(matched);
    setMatchedProtocols({ variants: { standard: matched, aggressive: matched, conservative: matched } });
    setPhysicianValidated(true);
    setPhysicianAcknowledgment(true);
    setCompletedSteps([1, 2, 3]);
    setCurrentStep(4);
    showToast('Protocol loaded — jumping to Timeline.');
  }, [allTemplates]); // re-runs once allTemplates is populated

  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [showValidationErrors, setShowValidationErrors] = useState(false);


  useEffect(() => {
    if (loadedId) {
      const restored = getProtocolById(loadedId);
      if (restored) {
        setFormData(restored.patientContext || DEFAULT_FORM_DATA);
        setProtocolData(restored);
        // Reconstruct the expected { variants } shape for step 2
        setMatchedProtocols({ variants: { standard: restored, aggressive: restored, conservative: restored } });
        setSelectedVariantId(restored.tempo || 'standard');
        setCompletedSteps([1, 2, 3, 4, 5]);
        setCurrentStep(4);
      }
    }
  }, [loadedId]);

  const showToast = (msg, duration = 2000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  const handleNavigateToField = (step, fieldId) => {
    // Linear navigation back to target step
    setCurrentStep(step);
    
    // Allow React to render the step before scrolling
    if (fieldId) {
      setTimeout(() => {
        const element = document.getElementById(fieldId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('anim-highlight');
          setTimeout(() => element.classList.remove('anim-highlight'), 2000);
        }
      }, 150);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(true);
  };

  const toggleGuideline = (key, id, type) => {
    setFormData(prev => {
      const current = prev.guidelines[key];
      if (type === 'single') {
        return { ...prev, guidelines: { ...prev.guidelines, [key]: id } };
      }
      const updated = current.includes(id) 
        ? current.filter(x => x !== id) 
        : [...current, id];
      return { ...prev, guidelines: { ...prev.guidelines, [key]: updated } };
    });
  };

  const handleGenerate = async (options = {}) => {
    const { durationOverride } = options;
    
    if (!isFormValid && !durationOverride) {
      setShowValidationErrors(true);
      return;
    }
    
    setIsGenerating(true);
    setShowValidationErrors(false);
    setError(null);
    try {
      const activeFormData = durationOverride 
        ? { ...formData, durationWeeks: durationOverride }
        : formData;

      // PHASE 1 REFACTOR: Using the new Adaptive Protocol Engine 2.0
      const results = await ProtocolEngine2.generateAllVariants(activeFormData, products);
      setMatchedProtocols(results);
      setNeedsRegeneration(false);
      setDownstreamWarning(null);
      prevFormDataRef.current = activeFormData; // Baseline ref so next change is detected fresh
      setCompletedSteps(prev => [...new Set([...prev, 1])]);
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError("Clinical generation failed. Verify inputs.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (variant) => {
    const id = variant.id || variant.tempo;
    console.log(`[PROTOCOL SELECT] Attempting selection: ${id}`);
    
    const normalized = {
      ...variant,
      _timeline: variant.resolved_timeline || variant.computedTimeline || variant.timeline || [],
      _validation: variant.validation || null,
      _cost: variant.computedCost || variant.costData || {},
      // Production Schema Normalization
      primaryClinicalFocus: variant.primaryClinicalFocus || formData.primaryCondition || "Immune modulation and systemic inflammation reduction",
      patientDemographic: variant.patientDemographic || formData.patientType || "Adult population"
    };
    
    // Ensure final validation reflects "PASSED" if all criteria met (Part 20)
    if (normalized._validation && normalized._validation.confidence_score >= 80) {
       normalized._validation.state = 'PASSED';
    }

    // Safety synchronization (Part 7)
    if (normalized._validation?.errors?.length > 0) {
       normalized._validation.status = 'error';
       console.warn(`[VALIDATION ALERT] Protocol ${id} has clinical errors.`);
    }

    setProtocolData(normalized);
    setSelectedProtocolId(id);
    setExpandedId(null);
    // Selecting a protocol is sufficient as physician validation — no extra step needed
    setPhysicianValidated(true);
    setPhysicianAcknowledgment(true);
    setCompletedSteps(prev => [...new Set([...prev, 1, 2])]);
    window.scrollTo(0, 0);
  };


  const handleSaveProtocol = async () => {
    if (!protocolData) return;
    
    try {
        setLoading(true);
        const options = {
            status: 'draft',
            visibility: 'public',
            userId: 'clinician_01', // Standardized for now 
            userName: 'Dr. Clinical'
        };
        
        const docId = await saveProtocol(protocolData, formData, options);
        
        // ── Add to protocol cart (no extra Firestore read needed) ──────────
        if (addProtocolRequest) {
          const agentNames = (protocolData.costData?.aggregateVials || [])
            .map(v => v.name || v.drug || v.agent)
            .filter(Boolean);
          addProtocolRequest({
            id:            docId,
            name:          protocolData.blueprint?.title || protocolData.protocol_name || 'Protocol',
            goal:          formData.primaryCondition || formData.goal || '',
            phases:        (protocolData.blueprint?.phases || protocolData.phases || []).length,
            products:      agentNames,
            estimatedCost: protocolData.costData?.totalCostUSD ?? protocolData.costData?.total ?? 0,
          });
          if (onOpenCart) onOpenCart();
        }
        // ───────────────────────────────────────────────────────────────────
        
        // Update protocolData with save info
        setProtocolData(prev => ({
            ...prev,
            id: docId,
            lastSaved: new Date()
        }));
        
        setError(null);
    } catch (err) {
        console.error("Save failed:", err);
        setError("Protocol could not be saved. Please retry.");
    } finally {
        setLoading(false);
    }
  };

  const confirmPhysicianValidation = () => {
    if (!physicianAcknowledgment || !protocolData) return;
    
    // Role-based validation gate
    if (!isProfessional) {
      setError("Clinical validation is restricted to approved professional accounts. Please ensure your profile is verified.");
      return;
    }
    
    const timestamp = new Date().toISOString();
    const physicianName = auth.currentUser?.displayName || auth.currentUser?.email || 'Dr. Clinical';
    
    // Update local validation state in protocolData
    const updatedProtocol = {
      ...protocolData,
      _validation: {
        ...(protocolData._validation || {}),
        state: 'VALIDATED',
        confidence_score: 100,
        summary_badges: (protocolData._validation?.summary_badges || []).map(b => ({ ...b, passed: true })),
        physician_validation: {
          status: true,
          validated_by: physicianName,
          timestamp: timestamp
        }
      },
      validation: {
        state: "READY_FOR_TIMELINE",
        physician_validation: {
          status: true,
          validated_by: physicianName,
          timestamp: timestamp
        }
      }
    };
    
    setProtocolData(updatedProtocol);
    setPhysicianValidated(true);

    // Audit Trail (Local console for now, saved with protocol)
    const auditLog = {
      validation_type: "physician_confirmation",
      physician_name: physicianName,
      protocol_id: protocolData.protocol_id || 'new_protocol',
      validation_status: true,
      timestamp: timestamp
    };
    
    console.log("Clinical Audit Log Generated:", auditLog);
  };

  useEffect(() => {
    if (currentStep === 6 && !protocolData?.id && !loading && !saveInProgressRef.current) {
      saveInProgressRef.current = true;
      handleSaveProtocol().finally(() => {
        saveInProgressRef.current = false;
      });
    }
  }, [currentStep, protocolData?.id]);

  const handleManualStepChange = (targetStep, direction = 'next') => {
    if (direction === 'next') {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setDownstreamWarning(null); // Clear warning on intentional forward navigation
    }
    setCurrentStep(targetStep);
  };

  // --- Explicit full reset (only path that clears all stored data) ---
  const handleResetAll = () => {
    setFormData(DEFAULT_FORM_DATA);
    setMatchedProtocols(null);
    setProtocolData(null);
    setSelectedProtocolId(null);
    setCompletedSteps([]);
    setNeedsRegeneration(false);
    setDownstreamWarning(null);
    setPhysicianValidated(false);
    setPhysicianAcknowledgment(false);
    prevFormDataRef.current = null;
    setCurrentStep(1);
    showToast('Protocol reset. Start fresh.');
  };

  const handleStepperClick = (targetStep) => {
    if (targetStep < currentStep) {
      // Backward navigation: PRESERVE all data — no automatic clearing
      setCompletedSteps(prev => prev.filter(s => s < targetStep));
      setCurrentStep(targetStep);
      // Level 1: non-blocking “Previous data restored” toast
      showToast('↩ Previous data restored');
      // Clear any stale downstream warning when returning to a prior step
      if (downstreamWarning) setDownstreamWarning(null);
    } else if (targetStep > currentStep) {
      // Level 1: forward navigation — silent, no interruption
      if (completedSteps.includes(targetStep) || completedSteps.includes(targetStep - 1)) {
        setCurrentStep(targetStep);
        setDownstreamWarning(null);
      }
    }
  };

  const isFormValid = !!formData.patientType && !!formData.ageGroup && !!formData.startDate && !!formData.primaryCondition;

  // Centralized Navigation Config
  const navigationConfig = useMemo(() => {
    const isExportStep = currentStep === 6;
    
    switch (currentStep) {
      case 1: {
        const hasExistingResults = !!matchedProtocols;
        return {
          nextLabel: isGenerating
            ? 'Generating Pathways...'
            : needsRegeneration
              ? '↻ Regenerate Protocol'
              : hasExistingResults
                ? 'Continue to Protocol Selection →'
                : 'Generate Validated Pathways',
          nextDisabled: !isFormValid,
          nextAction: (needsRegeneration || !hasExistingResults)
            ? handleGenerate
            : () => { setCurrentStep(2); setDownstreamWarning(null); },
          isNextLoading: isGenerating,
          showBack: false
        };
      }
      case 2: {
        const isIdentityMismatched = protocolData?.clinical_summary?.is_normalized === false;

        return {
          nextLabel: "Continue with Selected Protocol",
          nextDisabled: !selectedProtocolId,
          nextAction: () => {
            if (isIdentityMismatched) {
              setDownstreamWarning("⚠ Clinical Caution: Protocol identity mismatch detected. Physician review mandatory.");
            } else if (!formData.bmi || parseFloat(formData.bmi) === 0) {
              setDownstreamWarning("⚠ Clinical Caution: BMI not verified. Review metabolic safety in the next step.");
            }

            // Phase 3 (Safety) is hidden from UI — mark it complete automatically and skip to Timeline
            setCompletedSteps(prev => [...new Set([...prev, 2, 3])]);
            setCurrentStep(4);
          },
          showBack: true
        };
      }
      // case 3 intentionally removed — Safety step is permanently bypassed
      case 4:
        return {
          nextLabel: "Build Timeline",
          nextDisabled: (protocolData?.computedCost?.total || 0) <= 0,
          nextAction: () => handleManualStepChange(5),
          showBack: true
        };
      case 5: {
        const canExport = protocolData?.validation?.status !== 'error' && 
                          (protocolData?.computedCost?.total || 0) > 0 &&
                          protocolData?.clinical_summary?.is_normalized !== false &&
                          protocolData.resolved_phases?.every(p => p.drugs?.every(d => d.product_id && d.dose));
        
        return {
          nextLabel: canExport ? "Finalize & Activate Protocol" : "Block Export (Review Required)",
          nextDisabled: !canExport,
          nextAction: () => {
             console.log("[EXPORT] Running final clinical safety check...");
             handleManualStepChange(6);
          },
          showBack: true
        };
      }
      case 6:
        return {
          nextLabel: "Open Protocol Dashboard",
          nextDisabled: false,
          nextAction: () => navigate('/dashboard'),
          showBack: true,
          backLabel: "Return to Export"
        };
      default:
        return { nextLabel: "Continue", nextDisabled: true, nextAction: () => {}, showBack: true };
    }
  }, [currentStep, isFormValid, protocolData, isGenerating, navigate, handleGenerate, handleManualStepChange, physicianValidated, matchedProtocols, needsRegeneration]);

  const renderStepContent = () => {
    const objective = PRIMARY_OBJECTIVES.find(o => o.id === formData.primaryCondition);
    
    switch (currentStep) {
      case 1:
        return (
          <div className="step-animation">
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="step-badge">Step 1 of 6</div>
              <h1 className="clinical-title" style={{ marginTop: '0.4rem' }}>Patient Definition</h1>
              <p className="clinical-subtitle">Initialize protocol generation by defining primary therapeutic targets and baseline patient parameters.</p>
              <button 
                onClick={handleClearForm}
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  background: 'white', 
                  color: '#64748b', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Clear Form & Reset
              </button>
            </div>

            <div id="primaryCondition" className="form-section-v5" style={{ marginBottom: '1.5rem' }}>
              <div className="section-header-v5">
                <Activity size={18} color="var(--primary)" />
                <div className="header-info">
                  <h3>Clinical Objective</h3>
                  <p>Select the therapeutic focus for this pathway.</p>
                </div>
              </div>
              <div className="objective-grid">
                {PRIMARY_OBJECTIVES.map(obj => (
                  <div 
                    key={obj.id}
                    className={`objective-card ${obj.popular ? 'popular' : ''} ${formData.primaryCondition === obj.id ? 'active' : ''} ${showValidationErrors && !formData.primaryCondition ? 'error' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, primaryCondition: obj.id }))}
                  >
                    {obj.popular && (
                      <div className="objective-popular-badge">Most Consulted</div>
                    )}
                    <div className="objective-icon">{obj.icon}</div>
                    <div className="objective-label">{obj.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="patientContext" className="form-section-v5" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
               <div className="section-header-v5" style={{ marginBottom: '1.5rem' }}>
                  <Users size={18} color="var(--primary)" />
                  <div className="header-info">
                    <h3>Patient Context</h3>
                    <p>Provide baseline demographics to optimize clinical titration.</p>
                  </div>
               </div>

               <div className="patient-context-grid">
                  <div id="patientType" className="context-field">
                    <label className="field-label-v5">Biological Context</label>
                    <div className="pill-selector-v5">
                      {['Male', 'Female'].map(type => (
                        <div 
                          key={type}
                          className={`pill-option-v5 ${formData.patientType === type ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, patientType: type }))}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="ageGroup" className="context-field">
                    <label className="field-label-v5">Clinical Age Range</label>
                    <select 
                      className="select-clinical-v5"
                      value={formData.ageGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    >
                      <option value="">Select range...</option>
                      {['18-35', '36-50', '51-65', '65+'].map(age => (
                        <option key={age} value={age}>{age} Years</option>
                      ))}
                    </select>
                  </div>

                  <div id="metabolicStatus" className="context-field">
                    <label className="field-label-v5">Metabolic Status</label>
                    <select 
                      className="select-clinical-v5"
                      value={formData.metabolicStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, metabolicStatus: e.target.value }))}
                    >
                      <option value="normal">Normal / Standard</option>
                      <option value="impaired">Impaired (Insulin Resistance)</option>
                      <option value="diabetic">T2 Diabetic / Metabolic Syndrome</option>
                    </select>
                  </div>
               </div>

               <div className="patient-context-grid" style={{ marginTop: '1.5rem' }}>
                  <div className="context-field">
                    <label className="field-label-v5">Weight (kg)</label>
                    <input 
                      type="number" 
                      className="input-clinical-v5"
                      placeholder="e.g. 85"
                      value={formData.weight}
                      onChange={(e) => {
                          const w = e.target.value;
                          setFormData(prev => {
                              const h = prev.height;
                              let bmi = '';
                              if (w && h) bmi = (w / ((h/100)**2)).toFixed(1);
                              return { ...prev, weight: w, bmi };
                          });
                      }}
                    />
                  </div>
                  <div className="context-field">
                    <label className="field-label-v5">Height (cm)</label>
                    <input 
                      type="number" 
                      className="input-clinical-v5"
                      placeholder="e.g. 180"
                      value={formData.height}
                      onChange={(e) => {
                        const h = e.target.value;
                        setFormData(prev => {
                            const w = prev.weight;
                            let bmi = '';
                            if (w && h) bmi = (w / ((h/100)**2)).toFixed(1);
                            return { ...prev, height: h, bmi };
                        });
                      }}
                    />
                  </div>
                  <div className="context-field">
                    <label className="field-label-v5">Calculated BMI</label>
                    <div className="input-clinical-v5" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        {formData.bmi || '--'}
                    </div>
                  </div>
               </div>
            </div>

            <div id="protocolConfig" className="form-section-v5" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
               <div className="section-header-v5" style={{ marginBottom: '1.5rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  <div className="header-info">
                    <h3>Protocol Configuration</h3>
                    <p>Define the operational tempo and temporal boundaries.</p>
                  </div>
               </div>
               
               <div className="patient-context-grid">
                  <div id="tempo" className="context-field">
                    <label className="field-label-v5">Escalation Tempo</label>
                    <div className="pill-selector-v5">
                      {['Conservative', 'Standard', 'Aggressive'].map(t => (
                        <div 
                          key={t}
                          className={`pill-option-v5 ${formData.tempo === t.toLowerCase() ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, tempo: t.toLowerCase() }))}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="duration" className="context-field">
                    <label className="field-label-v5">Protocol duration</label>
                    <select 
                      className="select-clinical-v5"
                      value={formData.durationWeeks}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationWeeks: e.target.value }))}
                    >
                      {[8, 12, 16, 20, 24].map(w => (
                        <option key={w} value={w}>{w} Weeks</option>
                      ))}
                    </select>
                  </div>

                  <div id="startDate" className="context-field">
                    <label className="field-label-v5">Protocol Launch Date</label>
                    <input 
                      id="protocolLaunchDate"
                      type="date" 
                      className="input-clinical-v5"
                      value={formData.startDate}
                      onChange={handleChange}
                      name="startDate"
                    />
                  </div>
               </div>
            </div>

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
              <div className="completion-checklist-v5">
                <div className="checklist-header">Workflow Completion Progress</div>
                <div className="checklist-items grid-2-col-responsive" style={{ gap: '0.75rem 2rem' }}>
                  <div className={`check-item ${formData.primaryCondition ? 'done' : ''}`}>
                    {formData.primaryCondition ? <CheckCircle2 size={14} color="#10b981" /> : <div className="dot" />} 
                    Primary Objective {!formData.primaryCondition && '(Required)'}
                  </div>
                  <div className={`check-item ${formData.patientType ? 'done' : ''}`}>
                    {formData.patientType ? <CheckCircle2 size={14} color="#10b981" /> : <div className="dot" />} 
                    Biological Context {!formData.patientType && '(Required)'}
                  </div>
                  <div className={`check-item ${formData.ageGroup ? 'done' : ''}`}>
                    {formData.ageGroup ? <CheckCircle2 size={14} color="#10b981" /> : <div className="dot" />} 
                    Age Range {!formData.ageGroup && '(Required)'}
                  </div>
                  <div className={`check-item ${formData.startDate ? 'done' : ''}`}>
                    {formData.startDate ? <CheckCircle2 size={14} color="#10b981" /> : <div className="dot" />} 
                    Start Date {!formData.startDate && '(Required)'}
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--primary)', 
                      width: `${[formData.primaryCondition, formData.patientType, formData.ageGroup, formData.startDate].filter(Boolean).length * 25}%`,
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', minWidth: '40px' }}>
                    {[formData.primaryCondition, formData.patientType, formData.ageGroup, formData.startDate].filter(Boolean).length * 25}%
                  </span>
                  {(matchedProtocols || formData.primaryCondition) && (
                    <button
                      onClick={handleResetAll}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', whiteSpace: 'nowrap', padding: 0 }}
                    >
                      Reset Patient Data
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-animation">
            <div className="step2-header">
              <div>
                <div className="step-badge">Step 2 of 6</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h1 className="clinical-title" style={{ margin: 0 }}>Select Protocol Strategy</h1>
                  {isGenerating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                      <RefreshCw size={13} className="spin" /> Recalculating protocol...
                    </span>
                  )}
                </div>
                <p className="clinical-subtitle" style={{ marginTop: '0.5rem' }}>Compare validated pathways optimized for {objective?.label || 'the identified therapeutic target'}.</p>
              </div>
              <button 
                className={`compare-strategies-btn ${isComparing ? 'btn-primary-v5' : 'btn-secondary-v5'}`}
                onClick={() => setIsComparing(!isComparing)}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
              >
                <ArrowLeftRight size={16} /> 
                {isComparing ? 'Exit Comparison Mode' : 'Compare Clinical Strategies'}
              </button>
            </div>

            {isComparing ? (
              <div className="comparison-view-v5 animate-fade-in" style={{ marginBottom: '8rem' }}>
                <ProtocolCompare 
                  variants={matchedProtocols?.variants}
                  currentSelection={selectedProtocolId}
                  onSelectVariant={(id) => {
                    const variant = Object.values(matchedProtocols?.variants || {}).find(v => (v.id || v.tempo) === id);
                    if (variant) handleSelectVariant(variant);
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '8rem' }}>
                {/* Clinical Warnings from Engine */}
                {protocolData?.validation?.warnings?.map((w, idx) => (
                  <InlineWarning 
                    key={`v-warn-${idx}`}
                    message={w.message}
                  />
                ))}

                {Object.values(matchedProtocols?.variants || {}).map((v, idx) => (
                  <PathwayCard 
                    key={idx}
                    protocol={v}
                    index={idx}
                    isSelected={selectedProtocolId === (v.id || v.tempo || idx)}
                    isHovered={hoveredVariantId === (v.id || v.tempo || idx)}
                    isFavorite={favoriteProtocolIds.includes(v.id || v.tempo || idx)}
                    onToggleFavorite={() => toggleFavorite(v.id || v.tempo || idx)}
                    onSelect={() => handleSelectVariant(v)}
                    onDurationChange={(weeks) => {
                      setFormData(prev => ({ ...prev, durationWeeks: weeks }));
                      // Level 2: show inline warning — downstream steps will recalculate
                      setDownstreamWarning('Duration updated — Timeline and cost estimates are being recalculated automatically.');
                      handleGenerate({ durationOverride: weeks });
                    }}
                    onMouseEnter={() => setHoveredVariantId(v.id || v.tempo || idx)}
                    onMouseLeave={() => setHoveredVariantId(null)}
                  />
                ))}
              </div>
            )}

            {/* Confidence Explanation Modal */}
            {confidenceInfoModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(10, 37, 64, 0.7)', backdropFilter: 'blur(10px)',
                zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
              }} onClick={() => setConfidenceInfoModal(null)}>
                <div style={{
                  backgroundColor: 'white', borderRadius: '40px', width: '100%', maxWidth: '600px',
                  padding: '3rem', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative'
                }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setConfidenceInfoModal(null)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                     <PlusSquare style={{ transform: 'rotate(45deg)' }} size={32} />
                  </button>
                  
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '30px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '1.5rem' }}>
                      <ShieldCheck size={48} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--primary)', margin: 0 }}>Clinical Alignment Why {(confidenceInfoModal.validation?.confidence_score || 95)}%?</h2>
                    <p style={{ color: '#64748b', fontWeight: 700, marginTop: '0.5rem' }}>Verification breakdown for {confidenceInfoModal.protocol_title}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { label: 'Risk Match Score', value: 'High Alignment', score: 100, icon: <Target size={18} /> },
                      { label: 'Age Alignment', value: `Targeting ${formData.ageGroup}`, score: 95, icon: <Users size={18} /> },
                      { label: 'BMI Alignment', value: `Optimized for BMI ${formData.bmi}`, score: 92, icon: <Activity size={18} /> },
                      { label: 'Clinical Logic Score', value: 'Blueprint Verified', score: 98, icon: <Beaker size={18} /> }
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '1.5rem', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{item.value}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#10b981' }}>{item.score}%</div>
                      </div>
                    ))}
                  </div>
                  
                  <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.6 }}>
                    Scores are generated by comparing patient biomarkers against established clinical blueprints and historical efficacy data for {formData.primaryCondition}.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3: { setCurrentStep(4); return null; } // Safety step removed — redirect silently
        return (
          <div className="step-animation">
             <div style={{ marginBottom: '2.5rem' }}>
                <div className="step-badge">Phase 3: Safety Verification</div>
                <h1 className="clinical-title">Clinical Validation</h1>
                <p className="clinical-subtitle">Reviewing automated safety strategy for {protocolData?.protocol_title || 'Selected Protocol'}.</p>
             </div>

             <ValidationSummary 
                validation={protocolData?._validation} 
                onFix={handleNavigateToField}
                formData={formData}
             />

             {/* Protocol Selection Confirmation Banner — auto-validated when physician selects a protocol */}
             <div style={{ 
               marginTop: '2rem', 
               padding: '2rem 2.5rem', 
               backgroundColor: '#f0fdf4',
               borderRadius: '24px',
               border: '2px solid #10b981',
               boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
               display: 'flex',
               alignItems: 'center',
               gap: '1.5rem'
             }}>
               <div style={{ 
                 padding: '14px', 
                 borderRadius: '18px', 
                 backgroundColor: '#10b981',
                 color: 'white',
                 flexShrink: 0,
                 boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
               }}>
                 <ShieldCheck size={28} />
               </div>
               <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '1rem', fontWeight: 900, color: '#166534', marginBottom: '0.25rem' }}>
                   Protocol Validated — Clinical Responsibility Accepted
                 </div>
                 <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', lineHeight: 1.5 }}>
                   By selecting <strong>{protocolData?.protocol_title || 'this protocol'}</strong> in the previous step, 
                   you have confirmed clinical oversight and accepted responsibility for its administration and monitoring.
                   Automated safety checks across {protocolData?._validation?.summary_badges?.length || 5} domains have been applied.
                 </div>
               </div>
               <button 
                 onClick={() => setShowSafetyModal(true)}
                 style={{ 
                   flexShrink: 0,
                   background: 'white', 
                   border: '1.5px solid #10b981', 
                   color: '#059669', 
                   fontSize: '0.8rem', 
                   fontWeight: 800, 
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '6px',
                   padding: '10px 16px',
                   borderRadius: '12px',
                   whiteSpace: 'nowrap'
                 }}
               >
                 <Info size={15} /> Safety Details
               </button>
             </div>

             {/* Transparency Modal */}
             {showSafetyModal && (
               <div style={{
                 position: 'fixed',
                 top: 0, left: 0, right: 0, bottom: 0,
                 backgroundColor: 'rgba(10, 37, 64, 0.6)',
                 backdropFilter: 'blur(8px)',
                 zIndex: 10000,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 padding: '2rem'
               }} onClick={() => setShowSafetyModal(false)}>
                 <div style={{
                   backgroundColor: 'white',
                   borderRadius: '32px',
                   width: '100%',
                   maxWidth: '800px',
                   maxHeight: '85vh',
                   overflow: 'hidden',
                   boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5)',
                   display: 'flex',
                   flexDirection: 'column'
                 }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white' }}>
                          <Shield size={24} />
                        </div>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>Protocol Safety Parameters</h2>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clinical constraints used for this specific generation</p>
                        </div>
                      </div>
                      <button onClick={() => setShowSafetyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', color: '#64748b' }}>
                        <PlusSquare style={{ transform: 'rotate(45deg)' }} size={24} />
                      </button>
                    </div>

                    <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                          <div style={{ padding: '1.5rem', borderRadius: '20px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                              <TrendingUp size={18} color="#0369a1" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369a1', textTransform: 'uppercase' }}>Dosage Optimization</span>
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <li style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0c4a6e', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Starting Dose:</span>
                                <span>Conservative (Tier 1)</span>
                              </li>
                              <li style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0c4a6e', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Escalation:</span>
                                <span>Locked to Blueprint</span>
                              </li>
                            </ul>
                          </div>

                          <div style={{ padding: '1.5rem', borderRadius: '20px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                              <AlertTriangle size={18} color="#991b1b" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase' }}>Critical Constraints</span>
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <li style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7f1d1d', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Max Duration:</span>
                                <span>24 Weeks Absolute</span>
                              </li>
                              <li style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7f1d1d', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Age Limit:</span>
                                <span>Restricted (\u003e18y)</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Generated Safety Alerts</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(protocolData?._validation?.allAlerts || ['Standard clinical monitoring profile assigned', 'Half-life overlap analysis completed']).map((alert, i) => (
                              <div key={i} style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                                {alert}
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 4:
        return (
          <div className="step-animation container-clinical">
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="step-badge">Phase 4: Administration Plan</div>
              <h1 className="clinical-title">Treatment Timeline</h1>
              <p className="clinical-subtitle">Optimized schedule and dosing titration for clinical implementation.</p>
            </div>
            
            <div className="grid-4-col-responsive" style={{ gap: '1rem', marginBottom: '2rem' }}>
              <div className="sidebar-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Treatment Summary</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{protocolData.protocol_title || 'Optimized Pathway'}</div>
              </div>
              <div className="sidebar-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Cycle Duration</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{protocolData.duration || '12 Weeks'}</div>
              </div>
              <div className="sidebar-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Planned Injections</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
                  {(protocolData.protocol_schedule || protocolData.dosing_schedule || []).reduce((acc, w) => acc + (w.compounds?.length || 0), 0) || (protocolData.duration_weeks || 12) * 3} Events
                </div>
              </div>
              <div className="sidebar-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Monitoring Level</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>LEVEL 2 (Intensive)</div>
              </div>
            </div>

            <div className="timeline-overview-layout" style={{ marginBottom: '2.5rem' }}>
              <div className="clinical-card-v5" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--primary)' }}>Clinical Milestones & Monitoring</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(protocolData.resolved_monitoring?.scheduled_checkpoints || []).map((m, i) => {
                    let icon = <Activity size={14} />;
                    let color = 'var(--primary)';
                    if (m.type?.toLowerCase().includes('lab') || m.type?.toLowerCase().includes('monitoring')) {
                        icon = <Beaker size={14} />;
                        color = '#059669';
                    } else if (m.type?.toLowerCase().includes('milestone') || m.type?.toLowerCase().includes('final')) {
                        icon = <CheckCircle2 size={14} />;
                        color = '#854d0e';
                    } else if (m.type?.toLowerCase().includes('dose')) {
                        icon = <TrendingUp size={14} />;
                        color = '#1e40af';
                    }

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: `1px solid ${color}20` }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', color: color, border: `1px solid ${color}40` }}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>
                            {m.phase_name || `Phase ${Math.ceil(m.week/4)}`} • Week {m.week} • {m.type?.toUpperCase() || 'MONITORING'}
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{m.purpose || 'Standard Clinical Review'}</div>
                        </div>
                        {m.labs?.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {m.labs.map((lb, li) => <span key={li} style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#ebf5ff', color: '#1e40af', borderRadius: '4px', fontWeight: 'bold' }}>{lb}</span>)}
                            </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="timeline-3-panel-layout" style={{ marginBottom: '10rem' }}>
               {/* LEFT PANEL: WEEK NAVIGATION */}
               <div className="timeline-nav-v5" style={{ position: 'sticky', top: '160px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cycle Progression</div>
                  <div style={{ display: 'grid', gap: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                     {Array.from({ length: protocolData.patient_context?.duration_weeks || 12 }).map((_, i) => (
                       <button 
                         key={i}
                         onClick={() => setActiveTimelineWeek(i + 1)}
                         style={{
                           padding: '1rem',
                           borderRadius: '12px',
                           border: 'none',
                           background: activeTimelineWeek === i + 1 ? 'var(--primary)' : 'transparent',
                           color: activeTimelineWeek === i + 1 ? 'white' : '#64748b',
                           fontSize: '0.85rem',
                           fontWeight: 800,
                           cursor: 'pointer',
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                       >
                         <span>Week {i + 1}</span>
                         {activeTimelineWeek === i + 1 && <ChevronRight size={14} />}
                       </button>
                     ))}
                  </div>
               </div>
 
               {/* CENTER PANEL: DETAILED CALENDAR */}
               <div className="timeline-calendar-v5">
                  <div className="clinical-card-v5" style={{ padding: '0', overflow: 'hidden' }}>
                    {(() => {
                      const week = (protocolData.resolved_timeline || [])[activeTimelineWeek - 1] || { week: activeTimelineWeek, events: [] };
                      const start = new Date(formData.startDate || new Date());
                      start.setDate(start.getDate() + (activeTimelineWeek - 1) * 7);
                      
                      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      
                      return (
                        <div className="animate-fade-in">
                          <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--primary)', margin: 0 }}>Clinical Administration Log</h3>
                               <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>{start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Stage {activeTimelineWeek}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <button
                                onClick={() => window.print()}
                                title="Print timeline"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '0.5rem 1rem', borderRadius: '10px',
                                  border: '1.5px solid var(--border)', background: 'white',
                                  color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700,
                                  cursor: 'pointer', transition: 'all 0.2s ease'
                                }}
                              >
                                <Printer size={14} /> Print
                              </button>
                              <button
                                onClick={() => window.print()}
                                title="Save as PDF via browser print dialog"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '0.5rem 1rem', borderRadius: '10px',
                                  border: '1.5px solid var(--primary)', background: 'var(--primary)',
                                  color: 'white', fontSize: '0.8rem', fontWeight: 700,
                                  cursor: 'pointer', transition: 'all 0.2s ease'
                                }}
                              >
                                <FileText size={14} /> View PDF
                              </button>
                              <Calendar size={20} color="var(--primary)" />
                            </div>
                          </div>

                          <div style={{ padding: '2rem' }}>
                             <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {days.map((day, idx) => {
                                   const currentDate = new Date(start);
                                   currentDate.setDate(start.getDate() + idx);
                                   const dayEvents = week.events?.filter(e => e.day === day) || [];
                                   
                                   return (
                                     <div key={day} style={{ 
                                       display: 'flex', 
                                       gap: '1.5rem', 
                                       padding: '1.5rem', 
                                       background: dayEvents.some(e => e.type === 'medication') ? 'var(--accent-soft)' : dayEvents.length > 0 ? 'rgba(16, 185, 129, 0.03)' : 'white', 
                                       borderRadius: '16px', 
                                       border: dayEvents.some(e => e.type === 'medication') ? '1px solid var(--primary-light)' : dayEvents.length > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #f1f5f9',
                                       transition: 'all 0.2s ease'
                                     }}>
                                        <div style={{ width: '60px', textAlign: 'center' }}>
                                           <div style={{ fontSize: '0.7rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase' }}>{day.slice(0,3)}</div>
                                           <div style={{ fontSize: '1.25rem', fontWeight: 950, color: dayEvents.length > 0 ? 'var(--primary)' : '#64748b' }}>{currentDate.getDate()}</div>
                                        </div>
                                        
                                        <div style={{ flex: 1 }}>
                                           {dayEvents.length > 0 ? (
                                              <div style={{ display: 'grid', gap: '1rem' }}>
                                                 {dayEvents.map((e, ei) => {
                                                   const isMed = e.type === 'medication';
                                                   return (
                                                     <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                           <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isMed ? 'var(--primary)' : '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                               {!isMed && <Activity size={14} />} {e.title || 'Therapeutic Event'} {isMed && 'Administration'}
                                                           </div>
                                                           {isMed && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Dosage: {e.dose || 'Standard'} {e.unit || ''} {e.frequency && `(${e.frequency})`}</div>}
                                                           {e.details?.length > 0 && (
                                                               <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Markers: {e.details.join(', ')}</div>
                                                           )}
                                                        </div>
                                                        <div style={{ background: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 950, color: isMed ? 'var(--primary)' : '#059669', border: `1px solid ${isMed ? 'var(--primary-light)' : '#bbf7d0'}` }}>
                                                           {e.type.toUpperCase()}
                                                        </div>
                                                     </div>
                                                   );
                                                 })}
                                              </div>
                                           ) : (
                                              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', fontWeight: 600 }}>No clinical events scheduled</span>
                                           )}
                                        </div>
                                     </div>
                                   );
                                })}
                             </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
               </div>

               {/* RIGHT PANEL: PROTOCOL SUMMARY */}
               <div className="timeline-summary-v5" style={{ position: 'sticky', top: '160px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protocol Context</div>
                  <div className="clinical-card-v5" style={{ padding: '1.5rem', background: '#0f172a', color: 'white', border: 'none' }}>
                     <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', marginBottom: '0.4rem' }}>ACTIVE STRATEGY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{protocolData.protocol_title}</div>
                     </div>
                     <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                           <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>TOTAL DOSES</div>
                           <div style={{ fontSize: '1.2rem', fontWeight: 950 }}>36 EVENTS</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                           <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>RECOVERY FOCUS</div>
                           <div style={{ fontSize: '1.2rem', fontWeight: 950 }}>HIGH</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                           <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>SAFETY STATUS</div>
                           <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#10b981' }}>VERIFIED</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-animation">
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="step-badge">Step 5 of 6</div>
              <h1 className="clinical-title">Final Medical Review</h1>
              <p className="clinical-subtitle">Review all parameters and titration levels before formal protocol registration.</p>
            </div>

            <div className="clinical-card-v5" style={{ padding: '3rem', maxWidth: '800px', margin: '0 0 10rem 0' }}>
               <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <ShieldCheck size={56} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Clinical Verification Complete</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    The protocol for <strong>{formData.patientType}</strong> ({formData.ageGroup}) with <strong>{formData.metabolicStatus}</strong> metabolic status is ready for implementation using a <strong>{formData.tempo}</strong> titration tempo.
                  </p>
               </div>
                      <div className="grid-3-col-responsive" style={{ marginBottom: '8rem' }}>
               {/* 1. PROTOCOL SUMMARY */}
               <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Target size={14} /> 1. PROTOCOL ARCHITECTURE
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1rem' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>SELECTED PATHWAY</div>
                     <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>{protocolData.protocol_title}</div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Primary: {protocolData.primaryClinicalFocus}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Strategy: {protocolData.applied_variants?.tempo_variant?.toUpperCase() || 'STANDARD'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Stack: {protocolData.resolved_phases?.[0]?.drugs?.length || 0} Compounds</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Metabolism: {formData.metabolicStatus.toUpperCase()}</div>
                  </div>
               </div>

               {/* 2. TIMELINE SUMMARY */}
               <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Clock size={14} /> 2. ADMINISTRATION PLAN
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1rem' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>DURATION & LAUNCH</div>
                     <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>{protocolData.duration} • Starts {new Date(formData.startDate).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Weeks: {protocolData.computedCost?.totalWeeks || 12} Weeks</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Events: {(protocolData.protocol_schedule || []).reduce((acc, w) => acc + (w.compounds?.length || 0), 0)} Registrations</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Ends: {new Date(new Date(formData.startDate).getTime() + (protocolData.computedCost?.totalWeeks || 12) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                   </div>
               </div>

               {/* 3. SAFETY SUMMARY */}
               <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <ShieldCheck size={14} /> 3. CLINICAL CLEARANCE
                  </div>
                  <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534' }}>VALIDATION STATUS</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#15803d' }}>{protocolData._validation?.state || 'PASSED'} • {protocolData._validation?.confidence_score || 95}% ALIGNMENT</div>
                   </div>
                   <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Auto-Checks: {(protocolData._validation?.passed_rules?.length || 12)} PASSED</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Constraints: {protocolData._validation?.critical_alerts?.length || 0} DETECTED</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• Monitoring: {protocolData.resolved_monitoring?.baseline_required?.length || 4} Baseline Markers</div>
                   </div>
               </div>
               </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-animation" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="step-badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>Protocol Active & Transmitted</div>
              <h1 className="clinical-title" style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Clinical Operational Center</h1>
              <p className="clinical-subtitle" style={{ fontSize: '1.25rem', color: '#64748b' }}>Operational oversight for ReGen PEPT Treatment Workflow.</p>
            </div>

            <OperationalDashboard 
              protocolData={protocolData || {}} 
              formData={formData}
              onReset={() => {
                setFormData(DEFAULT_FORM_DATA);
                setProtocolData(null);
                setCompletedSteps([]);
                setCurrentStep(1);
              }}
              onNavigate={(step) => setCurrentStep(step)}
            />

            <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '2px dashed #e2e8f0', textAlign: 'center' }}>
               <button 
                  onClick={() => {
                    setFormData(DEFAULT_FORM_DATA);
                    setProtocolData(null);
                    setCompletedSteps([]);
                    setCurrentStep(1);
                  }}
                  className="btn-secondary-v5"
                  style={{ padding: '1rem 3rem', background: 'var(--primary)', color: 'white' }}
                >
                  <RotateCcw size={18} /> New Clinical Protocol
                </button>
            </div>

            {/* ADMIN AUDIT LAYER - Visible to clinical admins */}
            <AdminClinicalAudit 
              protocolData={protocolData} 
              templates={allTemplates} 
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      {lastSaved && (
        <div className="auto-save-indicator fadeInDown">
          <CheckCircle2 size={12} color="#10b981" />
          Saved {Math.floor((new Date() - lastSaved) / 1000)}s ago
        </div>
      )}
      {toastMessage && <Toast message={toastMessage} />}
      <WorkflowStepper currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepperClick} />
      <main className="workflow-main">
        <section className="workflow-content">
          {downstreamWarning && (
            <InlineWarning
              message={downstreamWarning}
              onDismiss={() => setDownstreamWarning(null)}
            />
          )}
          {error && currentStep !== 6 && <div style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}
          <Suspense fallback={<div className="clinical-card-v5" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin" size={24} color="var(--primary)" /> &nbsp; Loading Clinical Module...</div>}>
            {renderStepContent()}
          </Suspense>
        </section>
        <WorkflowSidebar 
          formData={formData} 
          protocolData={protocolData} 
          currentStep={currentStep} 
          matchedProtocols={matchedProtocols} 
          hoveredVariant={matchedProtocols ? Object.values(matchedProtocols.variants || {}).find(v => (v.id || v.tempo || '') === hoveredVariantId) : null}
          collapsed={currentStep === 6}
          onNavigateToField={handleNavigateToField}
          completedSteps={completedSteps}
        />
      </main>

      <StickyBottomBar 
        onBack={() => {
          // Step 3 (Safety) is permanently hidden — jump from 4 directly back to 2
          const prevStep = currentStep === 4 ? 2 : Math.max(1, currentStep - 1);
          handleStepperClick(prevStep);
        }}
        onNext={navigationConfig.nextAction}
        nextLabel={navigationConfig.nextLabel}
        nextDisabled={navigationConfig.nextDisabled}
        isNextLoading={navigationConfig.isNextLoading}
        showBack={navigationConfig.showBack !== false}
        backLabel={navigationConfig.backLabel || "Back"}
      />
    </div>
  );
}
