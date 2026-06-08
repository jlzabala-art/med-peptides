/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '../components/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Info, ChevronRight, Lock
} from 'lucide-react';
import { getProtocolById, updateProtocol } from '../services/protocolStorage';

export default function ProtocolValidation({ products }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const protocolId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [protocol, setProtocol] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);

  const performValidation = (session) => {
    const timeline = session.timelineCache || [];
    const guidelines = session.formData?.guidelines || {};

    const hardConflicts = [];
    const softConflicts = [];
    const warnings = [];
    const recommendedFixes = [];

    // 1. Administration Route Integrity
    const isOralPreference = guidelines.format === 'oral_only' || guidelines.format === 'avoid_injectables';
    timeline.forEach(item => {
      const product = products?.find(p => p.name === item.name);
      if (product) {
        const isInjectable = product.tags?.some(t => t.toLowerCase().includes('injectable'));
        if (isOralPreference && isInjectable) {
          hardConflicts.push(`Incompatible Route: ${item.name} is an injectable agent.`);
          recommendedFixes.push(`Replace ${item.name} with an oral equivalent (e.g. Tesofensine) to match user preference.`);
        }
      }
    });

    // 2. Receptor Saturation Logic (GH Secretagogues)
    const ghAgents = timeline.filter(item =>
      ['Ipamorelin', 'CJC-1295', 'Tesamorelin', 'Sermorelin', 'GHRP-6'].includes(item.name)
    );
    if (ghAgents.length > 2) {
      warnings.push(`Receptor Overload: ${ghAgents.length} GH secretagogues detected. This may lead to receptor desensitization.`);
      recommendedFixes.push("Consolidate GH secretagogues to a single high-affinity peptide like Ipamorelin.");
    }

    // 3. Clinical Sensitivity (Anxiety/Sleep)
    const sleepSensitive = guidelines.clinical?.includes('sleep_sensitive');
    if (sleepSensitive && timeline.some(p => p.name === 'Fragment 176-191')) {
      softConflicts.push("Circadian Impact: Fragment 176-191 may cause mild sleep disruption in sensitive subjects.");
    }

    const status = hardConflicts.length > 0 ? 'blocked' : (warnings.length > 0 || softConflicts.length > 0 ? 'warning' : 'pass');
    const score = status === 'pass' ? 100 - (softConflicts.length * 5) : status === 'warning' ? 85 - (warnings.length * 10) : 40;

    return { status, score, hardConflicts, softConflicts, warnings, recommendedFixes };
  };

  async function loadAndValidate() {
    const data = await getProtocolById(protocolId);
    if (!data) return;

    setProtocol(data);
    const results = performValidation(data);
    setValidationResults(results);

    // Sync results with backend for institutional logging
    await updateProtocol(protocolId, {
      validationStatus: results.status,
      lastValidationAt: new Date().toISOString(),
      safetyScore: results.score,
      protocol_validation_cache: results
    });
  }

  // Simulation of a multi-stage clinical scan for better UX
  useEffect(() => {
    if (protocolId) {
      const stages = [
        'Fetching protocol data...',
        'Checking peptide synergies...',
        'Analyzing route of administration conflicts...',
        'Calculating budget alignment...',
        'Finalizing safety report...'
      ];

      let stageIndex = 0;
      const stageInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          setLoadingStage(stages[stageIndex]);
          stageIndex++;
        }
      }, 600);

      loadAndValidate().then(() => {
        setTimeout(() => {
          clearInterval(stageInterval);
          setLoading(false);
        }, 3000); // Minimum scan time for "perceived value"
      });

      return () => clearInterval(stageInterval);
    }
  }, [protocolId]);

  const handleApprove = async () => {
    if (validationResults.status === 'blocked' && !bypassWarning) return;
    setIsUpdating(true);
    await updateProtocol(protocolId, { approvedAt: new Date().toISOString(), validationStatus: 'approved' });
    navigate(`/protocol-finder/result?id=${protocolId}`);
  };

  if (loading) return (
    <div className="flex-center-full" style={{ minHeight: '100dvh', gap: '2rem' }}>
      <div className="clinical-scanner-container">
        <Loader2 className="animate-spin" size={48} color="var(--secondary)" />
        <div className="scanner-line"></div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p className="loading-text-animate">{loadingStage}</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>Clinical Engine V4.2</span>
      </div>
    </div>
  );

  const { status, score, hardConflicts, softConflicts, warnings, recommendedFixes } = validationResults;

  return (
    <div className="template-root" style={{ paddingBottom: '100px' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        {/* Progress Header */}
        <nav className="protocol-stepper">
          <div className="step-completed"><CheckCircle2 size={14} /> Inputs</div>
          <ChevronRight size={14} className="step-sep" />
          <div className="step-active">Safety Validation</div>
          <ChevronRight size={14} className="step-sep" />
          <div className="step-pending">Results</div>
        </nav>

        {/* Score Visualizer */}
        <section className={`safety-hero status-${status}`}>
          <div className="score-ring">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`circle stroke-${status}`} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="score-text">
              <span className="number">{score}%</span>
              <span className="label">Safety Score</span>
            </div>
          </div>
          <h2 style={{ textTransform: 'capitalize', margin: '1rem 0 0.5rem' }}>{status} Status</h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            {status === 'pass' ? 'Protocol matches clinical guidelines.' : 'Modifications suggested for optimal safety.'}
          </p>
        </section>

        {/* Findings Grid */}
        <div className="findings-container">
          {hardConflicts.length > 0 && (
            <div className="finding-card hard">
              <h4><AlertCircle size={18} /> Critical Conflicts</h4>
              {hardConflicts.map((c, i) => <p key={i}>{c}</p>)}
            </div>
          )}

          {(warnings.length > 0 || softConflicts.length > 0) && (
            <div className="finding-card warn">
              <h4><AlertTriangle size={18} /> Clinical Warnings</h4>
              {[...warnings, ...softConflicts].map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}

          {recommendedFixes.length > 0 && (
            <div className="finding-card optimization">
              <h4><ShieldCheck size={18} /> Suggested Optimizations</h4>
              <ul>{recommendedFixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
          )}
        </div>

        {/* Positive Friction: Mandatory Check for Blocked status */}
        {status === 'blocked' && (
          <label className="bypass-checkbox">
            <Checkbox checked={bypassWarning} onChange={(e) => setBypassWarning(e.target.checked)} />
            <span>I acknowledge the clinical conflicts and wish to proceed under research discretion.</span>
          </label>
        )}
      </div>

      {/* Sticky Mobile Actions */}
      <footer className="sticky-action-bar">
        <div className="container action-grid">
          <button onClick={() => navigate(-1)} className="btn-secondary-clinical">
            <ArrowLeft size={18} /> <span>Edit</span>
          </button>
          <button
            onClick={handleApprove}
            disabled={isUpdating || (status === 'blocked' && !bypassWarning)}
            className={`btn-primary-clinical bg-${status}`}
          >
            {isUpdating ? <Loader2 className="animate-spin" /> : (
              <>{status === 'blocked' ? <Lock size={18} /> : null} Continue to Result</>
            )}
          </button>
        </div>
      </footer>

      <style>{`
        .protocol-stepper { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; font-size: 0.8rem; font-weight: 600; }
        .step-completed { color: var(--success); display: flex; align-items: center; gap: 4px; }
        .step-active { color: var(--secondary); border-bottom: 2px solid var(--secondary); }
        .step-pending { color: #94a3b8; }
        
        .safety-hero { text-align: center; padding: 3rem; border-radius: 24px; color: white; margin-bottom: 2rem; transition: background 0.5s ease; }
        .status-pass { background: linear-gradient(135deg, #059669 0%, #064e3b 100%); }
        .status-warning { background: linear-gradient(135deg, #d97706 0%, #78350f 100%); }
        .status-blocked { background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); }

        .score-ring { position: relative; width: 140px; height: 140px; margin: 0 auto; }
        .score-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; }
        .score-text .number { font-size: 1.8rem; font-weight: 800; }
        .score-text .label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; }

        .circular-chart { display: block; margin: 0 auto; }
        .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 2.8; }
        .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; transition: stroke-dasharray 1s ease; }
        .stroke-pass { stroke: #34d399; }
        .stroke-warning { stroke: #fbbf24; }
        .stroke-blocked { stroke: #f87171; }

        .findings-container { display: grid; gap: 1rem; margin-bottom: 2rem; }
        .finding-card { padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); background: white; }
        .finding-card h4 { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; font-size: 1rem; }
        .finding-card.hard h4 { color: #dc2626; }
        .finding-card.warn h4 { color: #d97706; }
        
        .sticky-action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 1rem; box-shadow: 0 -10px 30px rgba(0,0,0,0.05); z-index: 100; }
        .action-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
        
        .bypass-checkbox { display: flex; gap: 12px; padding: 1.25rem; background: #fff1f2; border-radius: 12px; border: 1px solid #fecaca; color: #991b1b; font-size: 0.85rem; cursor: pointer; align-items: center; }
        
        @media (max-width: 640px) { .action-grid { grid-template-columns: 1fr; } .btn-secondary-clinical { order: 2; } }
      `}</style>
    </div>
  );
}