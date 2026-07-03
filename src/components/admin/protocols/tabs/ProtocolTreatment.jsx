import React, { useState } from 'react';
import { Plus, Settings, Activity, Clock, ShieldCheck, Target } from '@/lib/icons';
import ProtocolTimeline from '../ProtocolTimeline';
import ClinicalProgressTracker from '../ClinicalProgressTracker';

export default function ProtocolTreatment({ protocol, onUpdate }) {
  const [isEditingPhases, setIsEditingPhases] = useState(false);
  const phases = protocol?.phases || [];

  const handleAddPhase = () => {
    const newPhase = {
      label: `Phase ${phases.length + 1}`,
      durationWeeks: 4,
      objective: 'New phase objective',
      items: []
    };
    onUpdate({ phases: [...phases, newPhase] });
  };

  const handleUpdatePhase = (index, field, value) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = { ...updatedPhases[index], [field]: value };
    onUpdate({ phases: updatedPhases });
  };

  const handleRemovePhase = (index) => {
    const updatedPhases = phases.filter((_, i) => i !== index);
    onUpdate({ phases: updatedPhases });
  };

  const totalWeeks = phases.reduce((acc, phase) => acc + (phase.durationWeeks || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="var(--primary)" /> Treatment Plan
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Visual timeline of the protocol phases, durations, and clinical milestones required to achieve the patient's therapeutic objectives.
          </p>
        </div>
        <button 
          onClick={() => setIsEditingPhases(!isEditingPhases)}
          className={isEditingPhases ? "gcp-btn-primary" : "gcp-btn-secondary"} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.6rem 1.2rem',
            transition: 'all 0.3s ease', fontWeight: 600
          }}
        >
          {isEditingPhases ? <ShieldCheck size={18} /> : <Settings size={18} />} 
          {isEditingPhases ? 'Finish Editing' : 'Manage Phases'}
        </button>
      </div>

      {/* Mini KPIs for Treatment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #bae6fd' }}>
          <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Duration</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#075985', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={24} /> {totalWeeks} Weeks
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
          <div style={{ color: '#6d28d9', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Protocol Phases</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={24} /> {phases.length} Phases
          </div>
        </div>
      </div>

      {/* Editor Panel (Glassmorphism) */}
      {isEditingPhases && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          borderRadius: '20px', 
          padding: '2rem', 
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
          <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Phase Structure Editor</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {phases.map((phase, idx) => (
              <div key={idx} style={{ 
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.8)', padding: '1.25rem', borderRadius: '12px', 
                border: '1px solid var(--border)', transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }} className="hover-card-subtle">
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phase Label</label>
                  <input 
                    type="text" 
                    value={phase.label || ''} 
                    onChange={(e) => handleUpdatePhase(idx, 'label', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Duration (Weeks)</label>
                  <input 
                    type="number" 
                    value={phase.durationWeeks || 0} 
                    onChange={(e) => handleUpdatePhase(idx, 'durationWeeks', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ flex: '2 1 300px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phase Objective</label>
                  <input 
                    type="text" 
                    value={phase.objective || ''} 
                    onChange={(e) => handleUpdatePhase(idx, 'objective', e.target.value)}
                    placeholder="e.g. Loading phase to saturate receptors..."
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <button 
                  onClick={() => handleRemovePhase(idx)}
                  style={{ 
                    marginTop: '1.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', 
                    border: 'none', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddPhase}
              className="gcp-btn-secondary"
              style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '24px', fontWeight: 600 }}
            >
              <Plus size={18} /> Add New Phase
            </button>
          </div>
        </div>
      )}

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <ProtocolTimeline protocol={protocol} />
        <ClinicalProgressTracker protocol={protocol} />
      </div>
      
    </div>
  );
}
