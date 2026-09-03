'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  X, 
  CheckCircle, 
  Activity, 
  Calendar, 
  Package, 
  FlaskConical, 
  Plus, 
  Briefcase 
} from '@/lib/icons';
import notifier from '@/services/NotificationService';

/**
 * AIProtocolDesignerModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional AI Protocol Stacking Designer Modal.
 * Generates structured, multi-phase clinical protocols based on health objectives.
 */
export default function AIProtocolDesignerModal({
  isOpen,
  onClose,
  onApplyProtocol
}) {
  const [goal, setGoal] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [designedProtocol, setDesignedProtocol] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goal.trim()) {
      notifier.error('Please enter a therapeutic goal or clinical objective.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/ai-design-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGoal: goal,
          durationWeeks: Number(durationWeeks),
          experienceLevel
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to design protocol.');

      setDesignedProtocol(data.data);
      notifier.success('Multi-phase protocol designed with Gemini!');
    } catch (err) {
      console.error('[AIProtocolDesignerModal] Error:', err);
      notifier.error(err.message || 'AI Protocol generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!designedProtocol) return;
    if (onApplyProtocol) {
      onApplyProtocol(designedProtocol);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 163, 224, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                AI Multi-Phase Protocol Architect
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Evidence-based peptide stacking, phase titration & PK supply engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Objective Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Primary Therapeutic Objective or Medical Indication:
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Accelerated Post-Surgical Knee Ligament Healing with Tendon Collagen Synthesis and Minimal Scar Tissue Formation..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Target Duration:
                </label>
                <select
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                >
                  <option value={4}>4 Weeks (Short Sprint)</option>
                  <option value={6}>6 Weeks (Targeted Healing)</option>
                  <option value={8}>8 Weeks (Standard Protocol)</option>
                  <option value={12}>12 Weeks (Full Cycle)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Patient Experience:
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                >
                  <option value="Beginner">Beginner (Gentle Titration)</option>
                  <option value="Intermediate">Intermediate (Standard)</option>
                  <option value="Advanced">Advanced (Synergistic Stacking)</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !goal.trim()}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isLoading || !goal.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !goal.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Sparkles size={16} />
                {isLoading ? 'Designing...' : 'Design Protocol'}
              </button>
            </div>
          </div>

          {/* Designed Protocol Preview */}
          {designedProtocol && (
            <div style={{
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '1.25rem',
              backgroundColor: '#f0f9ff',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                    {designedProtocol.therapeuticCategory} · {designedProtocol.totalDurationWeeks} Weeks
                  </span>
                  <h4 style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', color: '#0369a1', fontWeight: 800 }}>
                    {designedProtocol.protocolName}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                    {designedProtocol.subtitle}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0 0 1rem', lineHeight: 1.45 }}>
                {designedProtocol.overview}
              </p>

              {/* Phases */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {designedProtocol.phases?.map((phase) => (
                  <div key={phase.phaseNumber} style={{
                    padding: '0.9rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        Phase {phase.phaseNumber}: {phase.phaseName} ({phase.durationWeeks} Weeks)
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(0,163,224,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                        {phase.compounds?.length || 0} Compounds
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                      🎯 Objective: {phase.phaseObjective}
                    </div>

                    {/* Compounds table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {phase.compounds?.map((comp, idx) => (
                        <div key={idx} style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}>
                          <div>
                            <strong>{comp.peptideName}</strong> — <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{comp.dosage}</span> ({comp.frequency})
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              ⏱ {comp.timing || 'As directed'} · {comp.rationale}
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                            {comp.estimatedVials} vials
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Supplies and Biomarkers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    📦 Required Accessories:
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                    {designedProtocol.accessoriesNeeded?.map((a, i) => (
                      <div key={i}>• {a.quantity}x {a.name}</div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    🧪 Monitoring Lab Panels:
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                    {designedProtocol.monitoringBiomarkers?.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!designedProtocol}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: designedProtocol ? 'pointer' : 'not-allowed',
              opacity: designedProtocol ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle size={16} /> Transfer to Workspace & Protocol Engine
          </button>
        </div>
      </div>
    </div>
  );
}
