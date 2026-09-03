"use client";

import React, { useState } from 'react';
import { Target, ArrowRight, Package, Clock, Activity, Zap, CheckCircle2, Sparkles } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../../ui/EmptyState';
import { openProtocolAI } from '../../../utils/openModuleAI';

export default function ProtocolTimeline({ protocol, onProductClick, onEnrichTreatment }) {
  const phases = protocol?.phases || [];
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedPhase, setSelectedPhase] = useState(0); // Default to first phase
  const [aiQueryFired, setAiQueryFired] = useState(false);

  const protocolName = protocol?.name || protocol?.title || 'this protocol';

  // If no phases exist
  if (phases.length === 0) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <EmptyState
          icon={Activity}
          title="No Phases Defined"
          subtitle="Add phases to construct the visual patient journey."
        />
      </div>
    );
  }

  const calculatedTotalWeeks = phases.reduce((acc, p) => acc + (p.durationWeeks || p.duration_weeks || p.durationInWeeks || 0), 0);
  void (protocol?.protocol_duration_weeks || protocol?.duration_weeks || calculatedTotalWeeks || 1); // total for reference

    // Modern gradients for phases
  const getPhaseStyle = (index) => {
    const styles = [
      { from: '#3b82f6', to: '#2563eb', shadow: 'rgba(59, 130, 246, 0.4)' },
      { from: '#10b981', to: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
      { from: '#8b5cf6', to: '#7c3aed', shadow: 'rgba(139, 92, 246, 0.4)' },
      { from: '#f59e0b', to: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' },
      { from: '#ef4444', to: '#dc2626', shadow: 'rgba(239, 68, 68, 0.4)' }
    ];
    return styles[index % styles.length];
  };

  const handleAskAI = (phase, idx) => {
    const phaseLabel = phase.label || `Phase ${idx + 1}`;
    const compounds = (phase.items || phase.medications || [])
      .map(i => i.name).filter(Boolean).join(', ') || 'the prescribed compounds';
    const query = `Analyze ${phaseLabel} of the "${protocolName}" protocol. This phase lasts ${phase.durationWeeks || '?'} weeks and uses: ${compounds}. What are the key clinical objectives, expected outcomes, and safety considerations?`;
    
    // We pass the full protocol context so RULE 2 (Protocol Mode) has complete data.
    openProtocolAI({
      ...protocol,
      activePhase: phaseLabel,
      compounds,
    }, {
      autoGenerate: false, // Wait for the specific query
      displayText: `Analyze ${phaseLabel}`,
    });

    // Small delay so context sets before send fires
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ATLAS_PREFILL_QUERY', { detail: { query, autoSend: true } }));
    }, 100);
    
    setAiQueryFired(true);
    setTimeout(() => setAiQueryFired(false), 3000);
  };

  // Pre-compute cumulative week ranges — purely functional, no mutation inside render
  const phaseWeekRanges = phases.reduce((acc, p) => {
    const dur = p.durationWeeks || p.duration_weeks || p.durationInWeeks || 0;
    const prev = acc.length > 0 ? acc[acc.length - 1].end : 0;
    return [...acc, { start: prev, end: prev + dur, dur }];
  }, []);

  return (
    <div style={{ margin: '0 auto', paddingBottom: '2rem', width: '100%' }}>
      {/* Redundant title removed */}

      {/* Graphical Timeline Track */}
      {phases.length > 1 && (
        <div style={{ 
          position: 'relative', 
          padding: '3rem 2rem', 
          background: 'var(--surface)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px -12px rgba(0,0,0,0.05)',
          marginBottom: '2rem',
          overflowX: 'auto'
        }}>
        {/* Background track line - only show if there's more than 1 phase */}
        {phases.length > 1 && (
          <div style={{ position: 'absolute', top: '50%', left: '4rem', right: '4rem', height: '6px', background: 'var(--bg-main)', borderRadius: '3px', transform: 'translateY(-50%)' }}></div>
        )}

        <div style={{ minWidth: `${Math.max(600, phases.length * 250)}px`, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: phases.length > 1 ? 'space-between' : 'center' }}>
          
          {phases.map((phase, idx) => {
            const isSelected = selectedPhase === idx;
            const style = getPhaseStyle(idx);
            const { start: startWeek, end: endWeek, dur: phaseDur } = phaseWeekRanges[idx];

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                onClick={() => setSelectedPhase(idx)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  zIndex: isSelected ? 10 : 1,
                  flex: phaseDur || 1
                }}
              >
                {/* Active connection line overlay - only draw if not the last phase */}
                {isSelected && idx < phases.length - 1 && (
                  <motion.div
                    layoutId="activeTrack"
                    style={{ position: 'absolute', top: '50%', left: '0', right: '-100%', height: '6px', background: `linear-gradient(90deg, ${style.from}, transparent)`, borderRadius: '3px', transform: 'translateY(-50%)', zIndex: -1 }}
                  />
                )}

                {/* Week Label (Top) */}
                <div style={{ 
                  position: 'absolute', top: '-45px', 
                  fontSize: '0.8rem', fontWeight: 800, 
                  color: isSelected ? style.from : 'var(--text-muted)',
                  background: isSelected ? `${style.from}1a` : 'var(--bg-main)',
                  padding: '4px 10px', borderRadius: '99px', border: `1px solid ${isSelected ? style.from : 'var(--border)'}`,
                  transition: 'all 0.3s'
                }}>
                  Wk {startWeek === 0 ? 1 : startWeek} - {endWeek}
                </div>

                {/* Node */}
                <motion.div 
                  animate={{ 
                    scale: isSelected ? 1.2 : 1,
                    boxShadow: isSelected ? `0 0 0 6px ${style.from}33, 0 8px 20px ${style.shadow}` : '0 4px 10px rgba(0,0,0,0.05)'
                  }}
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: isSelected ? `linear-gradient(135deg, ${style.from}, ${style.to})` : 'var(--surface)',
                    border: isSelected ? 'none' : '3px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    zIndex: 2
                  }}
                >
                  {isSelected ? <Zap size={20} /> : <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{idx + 1}</span>}
                </motion.div>

                {/* Phase Title (Bottom) */}
                <div style={{ 
                  position: 'absolute', bottom: '-45px',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.9rem',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  textAlign: 'center',
                  maxWidth: '180px',
                  lineHeight: '1.2',
                  transition: 'all 0.3s'
                }}>
                  {phase.label || `Phase ${idx + 1}`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      )}

      {/* Selected Phase Detail Card */}
      <AnimatePresence mode="wait">
        {selectedPhase !== null && (
          <motion.div 
            key={selectedPhase}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '24px', 
              padding: '2rem',
              boxShadow: '0 12px 40px -12px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative background blur */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: getPhaseStyle(selectedPhase).from, opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${getPhaseStyle(selectedPhase).from}, ${getPhaseStyle(selectedPhase).to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', boxShadow: `0 8px 24px -6px ${getPhaseStyle(selectedPhase).shadow}`
                }}>
                  <Target size={28} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                    {phases[selectedPhase].label || `Phase ${selectedPhase + 1}`}
                  </h4>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.2rem' }}>
                    Duration: {phases[selectedPhase].durationWeeks} weeks
                  </div>
                </div>
              </div>

              {/* Ask AI about this phase */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); handleAskAI(phases[selectedPhase], selectedPhase); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: `1px solid ${getPhaseStyle(selectedPhase).from}40`,
                  background: `linear-gradient(135deg, ${getPhaseStyle(selectedPhase).from}15, ${getPhaseStyle(selectedPhase).to}0a)`,
                  color: getPhaseStyle(selectedPhase).from,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: aiQueryFired ? `0 0 0 3px ${getPhaseStyle(selectedPhase).from}30` : 'none'
                }}
                title={`Ask AI Atlas to analyze ${phases[selectedPhase].label || `Phase ${selectedPhase + 1}`}`}
              >
                <Sparkles size={15} />
                <span>{aiQueryFired ? 'Sent to AI ✓' : 'Ask AI Atlas'}</span>
              </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', position: 'relative', zIndex: 2 }}>
              
              {/* Clinical Objectives */}
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px' }}>
                <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={18} color={getPhaseStyle(selectedPhase).from} /> Phase Objectives
                </h5>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {phases[selectedPhase].objective || (
                    <span style={{ display: 'block' }}>
                      No specific clinical objectives defined for this phase.
                      {onEnrichTreatment && (
                        <button
                          onClick={() => {
                            setIsGenerating(true);
                            onEnrichTreatment();
                            setTimeout(() => setIsGenerating(false), 3000);
                          }}
                          disabled={isGenerating}
                          className="gcp-btn-secondary"
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            opacity: isGenerating ? 0.7 : 1
                          }}
                        >
                          {isGenerating ? 'Working...' : '✨ Generate Objectives via AI'}
                        </button>
                      )}
                    </span>
                  )}
                </p>

                {phases[selectedPhase].doseChanges && (
                  <div style={{ marginTop: '1.5rem', background: `${getPhaseStyle(selectedPhase).from}15`, color: getPhaseStyle(selectedPhase).from, padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <ArrowRight size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Dose Escalation Notice</strong> 
                      {phases[selectedPhase].doseChanges}
                    </div>
                  </div>
                )}
              </div>

              {/* Included Products */}
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px' }}>
                <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <Package size={18} color={getPhaseStyle(selectedPhase).from} /> Prescribed Therapy
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!(phases[selectedPhase].items || phases[selectedPhase].medications)?.length ? (
                    <EmptyState
                      icon={Package}
                      title="No Compounds"
                      subtitle="No active compounds registered for this phase."
                      compact={true}
                    />
                  ) : (
                    (phases[selectedPhase].items || phases[selectedPhase].medications).map((item, i) => (
                      <div key={i} style={{ 
                        background: 'var(--surface)', border: '1px solid var(--border)', 
                        padding: '1rem', borderRadius: '12px',
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}>
                        <div 
                          style={{ 
                            fontWeight: 700, 
                            fontSize: '1rem', 
                            color: onProductClick ? 'var(--primary)' : 'var(--text-main)', 
                            cursor: onProductClick ? 'pointer' : 'default',
                            textDecoration: onProductClick ? 'underline' : 'none',
                            textUnderlineOffset: '2px'
                          }}
                          onClick={() => {
                            if (onProductClick && (item.product_id || item.id)) {
                              onProductClick({ id: item.product_id || item.id, name: item.name });
                            }
                          }}
                        >
                          {item.name || 'Unknown Product'}
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>Dosage</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.doseMg || '0.5'} mg</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>Frequency</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.frequencyPerWeek || '5'}x / week</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
