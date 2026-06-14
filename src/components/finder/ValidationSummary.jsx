import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Info from "lucide-react/dist/esm/icons/info";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import X from "lucide-react/dist/esm/icons/x";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React, { useState, useMemo } from 'react';










const CLINICAL_EXPLANATIONS = {
  'Completeness Check': {
    explanation: 'Verifies all required clinical fields (Demographic, Age, Objective, Start Date) are fully populated.',
    why: 'Protocols without foundational context cannot be safely titrated or scheduled.',
    impact: 'Incorrect demographic data leads to miscalculated metabolism & dosage windows.',
    fixStep: 1,
    actionLabel: 'Fix Inputs'
  },
  'Safety Constraints': {
    explanation: 'Scans for absolute contraindications based on the patient demographic and clinical objectives.',
    why: 'Contraindicated pathways pose acute risks for specific patient groups (e.g. Geriatric or Athlete).',
    impact: 'High risk of acute adverse reaction or systemic physiological stress.',
    hideFix: true,
    actionLabel: 'Adjust Protocol'
  },
  'Dosage Safety': {
    explanation: 'Verifies escalation steps do not exceed established Maximum Tolerated Dose (MTD) limits.',
    why: 'Over-escalation causes immediate systemic stress and high side-effect incidence.',
    impact: 'Potential for gastrointestinal distress and receptor desensitization.',
    fixStep: 2,
    actionLabel: 'Check Titration'
  },
  'Duration Limits': {
    explanation: 'Confirms total protocol length aligns with duration standards to prevent receptor desensitization.',
    why: 'Excessive duration leads to physiological adaptation and diminishing therapeutic returns.',
    impact: 'Reduced efficacy and potential for long-term HPTA suppression.',
    fixStep: 2,
    actionLabel: 'Adjust Timeline'
  },
  'Interaction Check': {
    explanation: 'Evaluates compound synergy and potential antagonistic interactions in multi-agent schedules.',
    why: 'Unintended interactions can drastically alter half-lives and compound clinical endpoints.',
    impact: 'Unpredictable efficacy and increased metabolite toxicity risk.',
    hideFix: true,
    actionLabel: 'Review Compounds'
  }
};

const getGenericExplanation = (title) => ({
  explanation: `Automated assessment of ${title.toLowerCase()} against medical guidelines.`,
  why: 'Prevents protocol divergence from established clinical standards.',
  impact: 'Standard safety parameters might be exceeded.',
  actionLabel: 'Review Parameters'
});

export default function ValidationSummary({ validation, onFix, formData }) {
  const [activePopup, setActivePopup] = useState(null);

  // ✅ Destructure first so summary_badges is available for useMemo
  const { state, confidence_score, allAlerts, summary_badges } = validation || {};

  // ✅ All hooks must be at the TOP, before any conditional or non-hook logic
  const { issuesCount, passedCount } = useMemo(() => {
    if (!summary_badges) return { issuesCount: 0, passedCount: 0 };
    return {
      issuesCount: summary_badges.filter(b => !b.passed).length,
      passedCount: summary_badges.filter(b => b.passed).length,
    };
  }, [summary_badges]);

  const isPending = !validation || state === 'NOT_EVALUATED';

  // Calculate Partial Score if validation is missing or pending
  const calculatePartialScore = () => {
    if (!summary_badges || summary_badges.length === 0) return 0;
    const passed = summary_badges.filter(b => b.passed).length;
    return Math.round((passed / summary_badges.length) * 100);
  };

  const currentScore = isPending ? calculatePartialScore() : confidence_score;

  const getStatusColor = (vState) => {
    switch (vState) {
      case 'VALIDATED': return 'var(--color-success)';
      case 'REVIEW_REQUIRED': return '#f59e0b';
      case 'ERROR': return 'var(--color-danger)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const handleOpenInfo = (badge) => {
    const data = CLINICAL_EXPLANATIONS[badge.label] || getGenericExplanation(badge.label);
    setActivePopup({
      ...badge,
      clinicalData: data
    });
  };

  const missingInputs = [];
  if (formData) {
    if (!formData.primaryCondition) missingInputs.push('Primary Clinical Focus');
    if (!formData.patientType) missingInputs.push('Patient Demographic');
    if (!formData.ageGroup) missingInputs.push('Age Range');
    if (!formData.startDate) missingInputs.push('Start Date');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* OVERALL SAFETY STATUS HEADER */}
      <div style={{
        background: issuesCount > 0 ? '#fff1f2' : 'var(--color-success-bg)',
        border: `1px solid ${issuesCount > 0 ? '#fecaca' : '#bbf7d0'}`,
        padding: '1.5rem 2.5rem',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
       }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '16px', 
            backgroundColor: issuesCount > 0 ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'white'
           }}>
            {issuesCount > 0 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: issuesCount > 0 ? '#991b1b' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Status</div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: issuesCount > 0 ? '#7f1d1d' : '#065f46' }}>
              {issuesCount > 0 ? 'ATTENTION REQUIRED' : 'VERIFIED SAFE'}
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: issuesCount > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>{issuesCount}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>ISSUES DETECTED</div>
           </div>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-success)' }}>{passedCount}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>CHECKS PASSED</div>
           </div>
        </div>
      </div>

      {/* SCORE BAR */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem 2rem', 
        borderRadius: '24px', 
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: `${getStatusColor(isPending ? 'NOT_EVALUATED' : state)}15` }}>
            <ShieldCheck color={getStatusColor(isPending ? 'NOT_EVALUATED' : state)} size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>Integrated Logic Analysis</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {summary_badges?.length > 0 ? `Validated across ${summary_badges.length} mandatory clinical domains` : 'Clinical logic evaluation in progress'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Alignment Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: getStatusColor(isPending ? 'REVIEW_REQUIRED' : state) }}>
              {currentScore}%
            </div>
          </div>
          <div style={{ backgroundColor: `${getStatusColor(isPending ? 'NOT_EVALUATED' : state)}15`, color: getStatusColor(isPending ? 'NOT_EVALUATED' : state), padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${getStatusColor(isPending ? 'NOT_EVALUATED' : state)}25` }}>
            {isPending ? 'Incomplete' : state?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* VALIDATION CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
        {(summary_badges || []).map((badge, idx) => {
          const config = CLINICAL_EXPLANATIONS[badge.label] || getGenericExplanation(badge.label);
          const isCompleteness = badge.label === 'Completeness Check';
          const hasIssues = !badge.passed;
          return (
            <div key={idx} style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              border: `2px solid ${hasIssues ? '#fecaca' : 'var(--border)'}`,
              padding: '1.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              transition: 'all 0.2s',
              boxShadow: hasIssues ? '0 10px 15px -3px rgba(239, 68, 68, 0.05)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    marginTop: '4px',
                    padding: '8px', 
                    borderRadius: '10px', 
                    backgroundColor: badge.passed ? 'var(--color-success-bg)' : '#fff1f2' 
                  }}>
                    {badge.passed ? <CheckCircle2 size={18} color="var(--color-success)" /> : <AlertTriangle size={18} color="var(--color-danger)" />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{badge.label}</h4>
                    <button 
                      onClick={() => handleOpenInfo(badge)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        opacity: 0.8
                      }}
                    >
                      <Info size={12} /> View Details
                    </button>
                  </div>
                </div>

                <div style={{ 
                  color: badge.passed ? 'var(--color-success)' : 'var(--color-danger)',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: badge.passed ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {badge.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {badge.passed ? 'Verified safe' : 'Attention required'}
                </div>
              </div>

              {/* WARNING BLOCK */}
              <div style={{ 
                backgroundColor: hasIssues ? '#fff1f2' : 'var(--color-bg-app)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: `1px solid ${hasIssues ? '#fecaca' : 'rgba(0,0,0,0.03)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: hasIssues ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Clinical Consequence
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: hasIssues ? '#b91c1c' : 'var(--text-main)', lineHeight: 1.5 }}>
                    {hasIssues ? (config.impact || config.why) : config.explanation}
                  </div>
                </div>

                {hasIssues && (
                  <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {isCompleteness && missingInputs.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '8px' }}>Missing fields:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {missingInputs.map((item, i) => (
                              <span key={i} style={{ backgroundColor: 'white', color: '#b91c1c', fontSize: '0.65rem', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                • {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {allAlerts?.filter(a => a.toLowerCase().includes(badge.label.split(' ')[0].toLowerCase())).map((alert, i) => (
                        <div key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={14} /> {alert}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => onFix(config.fixStep || 1, missingInputs[0]?.replaceAll(' ', '') || 'patientContext')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--color-danger)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      {config.actionLabel.toUpperCase()}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP OVERLAY */}
      {activePopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setActivePopup(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(0,0,0,0.1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-app)' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Verification Core</div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{activePopup.label}</h4>
              </div>
              <button onClick={() => setActivePopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--color-text-secondary)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Logic Explanation</h5>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>{activePopup.clinicalData.explanation}</p>
              </div>
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Clinical Significance</h5>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-main)' }}>{activePopup.clinicalData.why}</p>
              </div>
              <div style={{ backgroundColor: '#f0f9ff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e0f2fe' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#0369a1', marginBottom: '0.5rem' }}>Clinical Consequence</h5>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{activePopup.clinicalData.impact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}