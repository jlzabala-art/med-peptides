import React, { useState, useEffect, useRef } from 'react';
import ClinicalTimeline from './ClinicalTimeline';
import { 
  Pill, Activity, ShieldAlert, CalendarClock, Beaker, FileSignature, 
  CheckCircle2, AlertTriangle, AlertCircle, Loader2, ChevronDown, ChevronUp, 
  Save, FilePlus, Copy, Info, Target, Zap, Clipboard
} from 'lucide-react';
import { generatePatientGuide, generateClinicalProtocol } from '../../services/pdfService';
import { ArtifactPreviewOverlay } from './ProtocolArtifacts';

// Normalize incoming protocol data from any storage format to the shape ProtocolDashboard expects.
// This handles both fresh generations (computedTimeline) and older saved records (timeline / costData).
function normalizeProtocolData(p) {
  if (!p) return null;

  // Timeline: prefer computedTimeline, fall back to timeline
  const timeline = (p.computedTimeline && Array.isArray(p.computedTimeline) && p.computedTimeline.length > 0)
    ? p.computedTimeline
    : (p.timeline && Array.isArray(p.timeline) && p.timeline.length > 0)
      ? p.timeline
      : (p.standard && p.standard.computedTimeline) 
        ? p.standard.computedTimeline
        : [];

  // Cost: prefer computedCost, fall back to costData
  const rawCost = p.computedCost || p.costData || (p.standard && p.standard.computedCost) || {};

  const cost = {
    total:      rawCost.total      || rawCost.totalEstimatedCost    || 0,
    weekly:     rawCost.weekly     || rawCost.costPerWeek           || 0,
    monthly:    rawCost.costPerMonth || Math.round((rawCost.weekly || 0) * 4.33),
    totalWeeks: rawCost.totalWeeks || rawCost.durationWeeks         || p.protocol_duration_weeks || 0,
    aggregate:  rawCost.aggregate  || rawCost.aggregateVials        || [],
    phaseBreakdown: rawCost.phaseBreakdown || []
  };

  // Confidence data guard
  const confidenceData = p.confidenceData || { confidenceScore: p.confidence_score || 0, reasoningSummary: '' };

  const final = { 
    ...p, 
    _timeline: timeline, 
    _cost: cost, 
    _confidenceData: confidenceData,
    _validation: p.validation || (p.standard && p.standard.validation) || null 
  };
  console.log("Normalized Dashboard State:", final);
  return final;
}

export default function ProtocolDashboard({ protocolData, onRegenerate }) {
  const dosingContainerRef = useRef(null);
  const weekRefs = useRef({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeTab, setActiveTab] = useState('dosing');
  const [exportStatus, setExportStatus] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [scrollFromTimeline, setScrollFromTimeline] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);
  const [expandedDetailIdx, setExpandedDetailIdx] = useState(null);
  const [isImproveScoreExpanded, setIsImproveScoreExpanded] = useState(false);
  const [hoveredDomain, setHoveredDomain] = useState(null);

  useEffect(() => {
    if (exportStatus && (exportStatus.type === 'success' || exportStatus.type === 'error' || exportStatus.type === 'warning')) {
      const timer = setTimeout(() => setExportStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [exportStatus]);

  // Sync scroll to week when activeWeek changes via Timeline sidebar
  useEffect(() => {
    if (activeTab === 'dosing' && weekRefs.current[activeWeek] && scrollFromTimeline) {
      weekRefs.current[activeWeek].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
      setScrollFromTimeline(false);
    }
  }, [activeWeek, activeTab, scrollFromTimeline]);

  // Scroll synchronization logic (detect week from scroll)
  useEffect(() => {
    if (activeTab !== 'dosing') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const wk = parseInt(entry.target.getAttribute('data-week'));
          if (wk && !scrollFromTimeline) {
            setActiveWeek(wk);
          }
        }
      });
    }, {
      root: dosingContainerRef.current,
      threshold: 0.6,
      rootMargin: '-10% 0px -60% 0px'
    });

    Object.values(weekRefs.current).forEach(node => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [activeTab, scrollFromTimeline]);

  useEffect(() => {
    // Robust scroll to top on entry
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      if (dosingContainerRef.current) dosingContainerRef.current.scrollTop = 0;
    };
    
    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 150);
    
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  if (!protocolData) return null;

  const normalized = normalizeProtocolData(protocolData);
  const timeline = normalized._timeline;
  const cost = normalized._cost;
  const duration = cost.totalWeeks;
  const currentWeekData = timeline.find(w => w.week === activeWeek);
  
  const status = protocolData.status || 'draft';
  const version = protocolData.version_number || 1;
  const history = protocolData.history || [];

  const getStatusStyle = (s) => {
      switch(s) {
          case 'approved': return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
          case 'reviewed': return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
          case 'archived': return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
          default: return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
      }
  };
  const statusStyle = getStatusStyle(status);
  
  // Mobile check
  const isMobile = window.innerWidth <= 768;

  const handleExport = async (type) => {
    // Validation
    if (!protocolData.protocol_title && !protocolData.blueprint?.title) {
        setExportStatus({ message: "Protocol data incomplete. Missing title.", type: 'error' });
        return;
    }
    if (!protocolData.phases && !protocolData.blueprint?.phases) {
        setExportStatus({ message: "Protocol data incomplete. Missing phase structure.", type: 'error' });
        return;
    }

    const label = type === 'patient' ? "Patient Guide" : "Clinical Protocol";
    setExportStatus({ message: `Generating ${label}...`, type: 'info' });

    try {
        // Small delay to allow UI to render status
        await new Promise(r => setTimeout(r, 100));
        
        if (type === 'patient') {
            await generatePatientGuide(protocolData, protocolData.patientContext);
        } else {
            await generateClinicalProtocol(protocolData, protocolData.patientContext);
        }
        
        setExportStatus({ message: `${label} generated successfully.`, type: 'success' });
    } catch (err) {
        console.error("Export failure:", err);
        setExportStatus({ message: "Protocol export failed. Please try again.", type: 'error' });
    }
  };

  const renderDosingTab = () => {
    if (!timeline || timeline.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No administration data available.</div>;

    return (
      <div 
        ref={dosingContainerRef}
        style={{ 
          height: '650px', 
          overflowY: 'auto', 
          paddingRight: '1rem',
          scrollBehavior: 'smooth',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          paddingBottom: '20rem' // Allow centering last weeks
        }}
      >
        {timeline.map((wk, idx) => {
          const isActive = activeWeek === wk.week;
          const pName = (wk.phase || '').toLowerCase();
          const isEscalation = pName.includes('escalation');
          const isInitiation = pName.includes('initiation');
          const isMaintenance = pName.includes('maintenance');
          
          // Semantic color system: Blue(Active/Init), Amber(Esc), Green(Logistics/Main)
          const phaseColor = isEscalation ? '#f59e0b' : (isInitiation ? 'var(--primary)' : '#10b981');
          const activeAccent = 'var(--primary)'; // Blue for selection focus
          
          const totalInjections = wk.medications.reduce((acc, med) => {
              const freqMap = { 'Daily': 7, '3x weekly': 3, '2x weekly': 2, 'Weekly': 1 };
              const freqVal = freqMap[med.frequency] || (Array.isArray(med.days) ? med.days.length : 1);
              return acc + freqVal;
          }, 0);

          return (
            <div 
              key={idx} 
              ref={el => weekRefs.current[wk.week] = el}
              data-week={wk.week}
              style={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isActive ? 1 : 0.5,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                padding: '2rem',
                borderRadius: '24px',
                backgroundColor: isActive ? '#f8fafc' : 'white',
                border: isActive ? `1.5px solid var(--primary-soft)` : '1px solid var(--border)',
                borderLeft: isActive ? `8px solid ${phaseColor}` : '1px solid var(--border)',
                boxShadow: isActive ? '0 20px 40px -10px rgba(0, 0, 0, 0.1)' : 'none',
                position: 'relative'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '2rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 950,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
                  Viewing Week {wk.week}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '14px', 
                        backgroundColor: isActive ? 'var(--primary-soft)' : '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'all 0.3s'
                    }}>
                        <CalendarClock size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                            Week {wk.week}
                        </h3>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {wk.dateLabel || 'Dates TBD'}
                        </div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 950, 
                          color: 'white', 
                          backgroundColor: phaseColor,
                          padding: '2px 10px',
                          borderRadius: '4px',
                          textTransform: 'uppercase', 
                          letterSpacing: '0.08em',
                          display: 'inline-block',
                          boxShadow: `0 2px 8px ${phaseColor}40`
                        }}>
                            {wk.phase || 'Maintenance'} Phase
                        </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '0.6rem 1rem', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 900, 
                        border: '1.5px solid var(--border)',
                        color: 'var(--text-muted)',
                        backgroundColor: '#f8fafc'
                    }}>
                        {totalInjections} INJECTIONS
                    </div>
                  </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {wk.medications.map((med, mIdx) => (
                  <div key={mIdx} style={{ 
                    padding: '1.5rem', 
                    border: '1.2px solid var(--border)', 
                    borderRadius: '18px', 
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 10px rgba(0, 0, 0, 0.03)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '10px', 
                                backgroundColor: 'var(--primary-soft)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <Pill size={18} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                                    {med.name}
                                </h4>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                    {med.strength || 'Standard Concentration'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dosage:</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                {med.dosage}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Schedule:</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{med.frequency}</span>
                          </div>
                          {med.days && med.days.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {med.days.map(day => (
                                    <span key={day} style={{ 
                                      fontSize: '0.7rem', 
                                      fontWeight: 900, 
                                      backgroundColor: 'var(--primary)', 
                                      color: 'white', 
                                      width: '24px', 
                                      height: '24px', 
                                      borderRadius: '50%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                                    }}>
                                        {day.substring(0, 1)}
                                    </span>
                                ))}
                            </div>
                          )}
                        </div>
                    </div>
                    <div style={{ opacity: 0.1, transform: 'rotate(-15deg)', marginLeft: '1rem' }}>
                        <Beaker size={56} color="var(--primary)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonitoringTab = () => {
    const schedule = protocolData.monitoringSchedule || [];
    if (schedule.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No specific labs required for this protocol.</div>;
    
    return (
      <div className="anim-fade-in">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="#0284c7" /> Required Lab Monitoring
        </h3>
        
        {schedule.map((mon, idx) => (
          <div key={idx} style={{ padding: '1.5rem', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: '12px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ backgroundColor: '#0284c7', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>Week {mon.week}</span>
              <span style={{ fontWeight: 600, color: '#0369a1' }}>Follow-up Check</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0c4a6e', fontSize: '0.95rem' }}>
              {mon.labs.map((lab, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{lab}</li>)}
            </ul>
            {mon.note && (
              <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#0284c7', fontStyle: 'italic' }}>* {mon.note}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSafetyTab = () => {
    const validation = normalized._validation;
    const score = (validation && validation.confidence_score !== null) ? validation.confidence_score : 0;
    const vState = validation?.state || 'NOT_EVALUATED';
    
    const isOptimal = score >= 90;
    const isReview = vState === 'REVIEW_REQUIRED' || score < 80;

    const domainTooltips = {
      completeness: "Verifies that all required fields, patient data, and clinical context are fully defined.",
      contraindications: "Cross-checks protocol substances against patient health conditions and risk factors.",
      dosingLogic: "Validates titration curves, accumulation risks, and maximum recommended dosing units.",
      interactions: "Analyzes synergistic or competitive relationships between multiple compounds in the stack.",
      monitoring: "Ensures necessary diagnostic follow-ups and baseline markers are scheduled correctly."
    };

    return (
      <div className="anim-fade-in">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color={isReview ? "#ef4444" : "#ea580c"} /> Safety & Clinical Validation
        </h3>
        
        {/* Overall Confidence & Score Breakdown */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: `1px solid ${isReview ? '#fee2e2' : 'var(--border)'}`, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Automated Safety Score</h4>
              <div style={{ fontWeight: 900, fontSize: '2.5rem', color: isOptimal ? '#10b981' : (isReview ? '#ef4444' : '#f59e0b'), display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                {vState === 'NOT_EVALUATED' ? 'N/A' : score}
                <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.5 }}>/100</span>
              </div>
            </div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '30px', 
              fontWeight: 800, 
              fontSize: '0.75rem', 
              backgroundColor: isOptimal ? 'rgba(16, 185, 129, 0.1)' : (isReview ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'), 
              color: isOptimal ? '#059669' : (isReview ? '#b91c1c' : '#b45309'),
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {vState.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Domain Breakdown */}
          {validation?.domainScores && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              {Object.entries(validation.domainScores).map(([domain, dScore]) => (
                <div key={domain} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {domain.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div 
                      onMouseEnter={() => setHoveredDomain(domain)}
                      onMouseLeave={() => setHoveredDomain(null)}
                      style={{ cursor: 'help', color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                      <Info size={14} />
                    </div>
                  </div>
                  
                  {/* Tooltip Popup */}
                  {hoveredDomain === domain && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      zIndex: 100,
                      width: '200px',
                      backgroundColor: '#1e293b',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      lineHeight: 1.4,
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      marginBottom: '0.5rem',
                      pointerEvents: 'none',
                      animation: 'anim-fade-in 0.2s ease-out'
                    }}>
                      {domainTooltips[domain]}
                      <div style={{ position: 'absolute', top: '100%', left: '10px', border: '6px solid transparent', borderTopColor: '#1e293b' }} />
                    </div>
                  )}

                  <div style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${dScore}%`, 
                      height: '100%', 
                      backgroundColor: dScore >= 90 ? '#10b981' : (dScore >= 70 ? '#f59e0b' : '#ef4444'),
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>{dScore}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Improvement Suggestions */}
        {validation?.recommendations && validation.recommendations.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setIsImproveScoreExpanded(!isImproveScoreExpanded)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'rgba(0,163,224,0.05)',
                border: '1px solid rgba(0,163,224,0.15)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target size={20} color="var(--primary)" />
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Improve Clinical Score</span>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', padding: '1px 8px', borderRadius: '10px' }}>
                  {validation.recommendations.length} Actions
                </span>
              </div>
              {isImproveScoreExpanded ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--primary)" />}
            </button>
            
            {isImproveScoreExpanded && (
              <div style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid var(--border)', borderTop: 'none', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {validation.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 500 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Issue Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validation?.details && validation.details.length > 0 ? (
            validation.details.map((detail, idx) => {
              const isExpanded = expandedDetailIdx === idx;
              const isWarning = detail.status === 'FLAG_RAISED';
              return (
                <div key={idx} style={{ 
                  border: `1px solid ${isWarning ? '#fee2e2' : 'var(--border)'}`, 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  backgroundColor: isWarning ? '#fffcfc' : 'white'
                }}>
                  <div 
                    onClick={() => setExpandedDetailIdx(isExpanded ? null : idx)}
                    style={{ 
                      padding: '1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {isWarning ? <AlertTriangle size={18} color="#ef4444" /> : <Info size={18} color="var(--primary)" />}
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isWarning ? '#991b1b' : 'var(--text-main)' }}>
                        {detail.section}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isWarning ? '#ef4444' : 'var(--text-muted)' }}>
                        VIEW DETAILS
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Issue Description</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{detail.logic}</div>
                        </div>
                        {detail.error && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Detected Problem</div>
                            <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 600 }}>{detail.error}</div>
                          </div>
                        )}
                        {detail.fix && (
                          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Recommended Fix</div>
                            <div style={{ fontSize: '0.9rem', color: '#065f46', fontWeight: 700 }}>• {detail.fix}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={24} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Clinical Rules Compliance Passed</strong>
                <span style={{ fontSize: '0.85rem' }}>All dosing, accumulation, and monitoring safety guards satisfied.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummaryTab = () => {
    const { total, weekly, totalWeeks: durationVal, aggregate, phaseBreakdown } = cost;
    if (!total && !durationVal) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No economic data available.</div>;

    const monthlyCost = Math.round(weekly * 4.33);

    return (
      <div className="anim-fade-in">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Economic & Supply Summary</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Avg Weekly</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>${weekly}</div>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Avg Monthly</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--secondary)' }}>${monthlyCost}</div>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Total Duration</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{durationVal} wk</div>
          </div>
        </div>

        {phaseBreakdown && phaseBreakdown.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phase Investment</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {phaseBreakdown.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 600 }}>{p.title} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>({p.weeks} weeks)</span></div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>${p.cost}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supply Inventory</h4>
        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'white' }}>
          {aggregate.map((vial, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx < aggregate.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vial.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{vial.mgPerVial}mg spec</span>
              </div>
              <div style={{ fontWeight: 800 }}>{vial.totalVials} units</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0.5rem 0', marginTop: '0.75rem', borderTop: '2px solid var(--border)' }}>
            <span style={{ fontWeight: 900, color: 'var(--text-main)' }}>ESTIMATED PROGRAM TOTAL</span>
            <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>${total}</span>
          </div>
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            margin: '0.5rem 0 0 0',
            lineHeight: 1.4,
            fontWeight: 600,
            textAlign: 'right',
            opacity: 0.8
          }}>
            Final logistics and tax calculations are applied at checkout.
          </p>
        </div>
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const docs = [
      { name: 'Patient Administration Guide', type: 'patient', icon: <Beaker size={20} /> },
      { name: 'Physician Monitoring Checklist', type: 'physician', icon: <Activity size={20} /> },
      { name: 'Structured JSON Definition', type: 'json', icon: <Target size={20} /> },
      { name: 'Dosing Calendar Sync (ICS)', type: 'ics', icon: <CalendarClock size={20} /> }
    ];

    return (
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 900 }}>Artifact Construction Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {docs.map(doc => (
            <div key={doc.type} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '12px' }}>
               <div style={{ padding: '1rem', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '12px' }}>{doc.icon}</div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.25rem' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status: READY FOR PREVIEW</div>
               </div>
               <button 
                 onClick={() => setPreviewType(doc.type)}
                 style={{ padding: '0.5rem 1rem', background: 'white', border: '1.5px solid var(--border)', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
               >
                 PREVIEW
               </button>
            </div>
          ))}
        </div>
        
        {previewType && (
          <ArtifactPreviewOverlay 
            type={previewType} 
            data={normalized} 
            onClose={() => setPreviewType(null)} 
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', 
      gap: '2rem',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* LEFT PANEL - Timeline */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        borderRight: isMobile ? 'none' : '1px solid var(--border)',
        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : '350px'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>Clinical Timeline</h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interactive administration map</p>
            </div>
            {protocolData.protocol_is_physician_authored && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>MD AUTHORED</div>
            )}
          </div>

          {/* PROTOCOL OVERVIEW SUMMARY BLOCK */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid var(--border)', 
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>{duration} Weeks</div>
            </div>
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Compounds</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {[...new Set(timeline.flatMap(w => w.medications.map(m => m.name)))].length} Stack
                </div>
            </div>
            <div style={{ borderRight: '1px solid var(--border)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monitoring</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>Every 4w</div>
            </div>
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frequency</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>Variable</div>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Jump to Week</label>
            <select 
                value={activeWeek}
                onChange={(e) => {
                  setActiveWeek(parseInt(e.target.value));
                  setScrollFromTimeline(true);
                }}
                className="premium-input"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
            >
                {timeline.map(w => (
                    <option key={w.week} value={w.week}>
                      Week {w.week}: {w.dateLabel} ({w.phase || 'Maintenance'})
                    </option>
                ))}
            </select>
          </div>
        </div>
        
        <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: isMobile ? '300px' : '650px' }}>
          <ClinicalTimeline 
            timeline={timeline} 
            activeWeek={activeWeek} 
            onWeekSelect={(wk) => {
              setActiveWeek(wk);
              setScrollFromTimeline(true);
            }} 
          />
        </div>
      </div>

      {/* RIGHT PANEL - Details */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'dosing', label: 'Dosing', icon: Pill },
            { id: 'monitoring', label: 'Labs & Monitoring', icon: Activity },
            { id: 'safety', label: 'Safety Checks', icon: ShieldAlert },
            { id: 'summary', label: 'Economics', icon: FileSignature },
            { id: 'documents', label: 'Artifacts', icon: Clipboard }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto', minHeight: '400px' }}>
          {activeTab === 'dosing' && renderDosingTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
          {activeTab === 'safety' && renderSafetyTab()}
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
        </div>

        {/* EXPORT REPORTS BLOCK */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f8fafc',
          borderTop: '1px solid var(--border)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Export Reports</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Download the patient-facing guide or clinician-facing protocol report.</p>
          </div>

          {/* Status Message */}
          {exportStatus && (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor: exportStatus.type === 'error' ? '#fef2f2' : (exportStatus.type === 'success' ? '#f0fdf4' : '#f0f9ff'),
                color: exportStatus.type === 'error' ? '#b91c1c' : (exportStatus.type === 'success' ? '#166534' : '#0369a1'),
                border: `1px solid ${exportStatus.type === 'error' ? '#fecaca' : (exportStatus.type === 'success' ? '#bbf7d0' : '#bae6fd')}`
            }}>
                {exportStatus.type === 'info' && <Loader2 size={18} className="spin" />}
                {exportStatus.type === 'success' && <CheckCircle2 size={18} />}
                {exportStatus.type === 'error' && <AlertCircle size={18} />}
                {exportStatus.message}
            </div>
          )}

          {/* Utility Actions row above navigation */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1.5px solid #e2e8f0'
          }}>
                <button 
                    onClick={() => protocolData.onSave && protocolData.onSave()} 
                    disabled={!protocolData}
                    className="btn" 
                    style={{ 
                      padding: '1.25rem 2rem', 
                      backgroundColor: 'var(--primary)', 
                      border: 'none', 
                      color: 'white', 
                      fontWeight: 900, 
                      transition: 'all 0.2s', 
                      boxShadow: '0 8px 16px rgba(0,54,102,0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      justifyContent: 'center', 
                      borderRadius: '12px',
                      opacity: protocolData ? 1 : 0.5,
                      cursor: protocolData ? 'pointer' : 'not-allowed'
                    }}
                >
                    <Save size={20} /> SAVE PROTOCOL
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleExport('clinical')} 
                    disabled={!!exportStatus && exportStatus.type === 'info'}
                    className="btn" 
                    style={{ padding: '0.85rem 1.5rem', backgroundColor: 'white', border: '1.5px solid #cbd5e1', color: 'var(--primary)', fontWeight: 800, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', borderRadius: '10px' }}
                  >
                      <FileSignature size={18} /> Clinical Protocol
                  </button>
                  <button 
                    onClick={() => handleExport('patient')} 
                    disabled={!!exportStatus && exportStatus.type === 'info'}
                    className="btn" 
                    style={{ padding: '0.85rem 1.5rem', backgroundColor: 'white', border: '1.5px solid #cbd5e1', color: 'var(--primary)', fontWeight: 800, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', borderRadius: '10px' }}
                  >
                      <Beaker size={18} /> Patient Guide
                  </button>
                </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => onRegenerate && onRegenerate('back')} 
                className="btn-outline" 
                style={{ padding: '1rem 2rem', border: '1.5px solid var(--border)', fontWeight: 800, borderRadius: '10px' }}
              >
                Back to Safety
              </button>
              
              <button 
                onClick={() => onRegenerate && onRegenerate('next')} 
                className="btn" 
                style={{ padding: '1rem 3rem', background: 'var(--primary)', color: 'white', fontWeight: 900, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Review Final →
              </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.5rem', opacity: 0.7 }}>
              {protocolData.lastSaved && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CalendarClock size={14} /> Last Saved: {protocolData.lastSaved.toLocaleTimeString()}
                  </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
