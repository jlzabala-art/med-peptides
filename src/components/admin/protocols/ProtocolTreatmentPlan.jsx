import React, { useState } from 'react';
import ProtocolTimeline from './ProtocolTimeline';
import ClinicalProgressTracker from './ClinicalProgressTracker';
import { Plus, Settings } from 'lucide-react';

export default function ProtocolTreatmentPlan({ protocol, onUpdate }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Treatment Plan</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Visual timeline of the protocol phases and expected clinical milestones.
          </p>
        </div>
        <button 
          onClick={() => setIsEditingPhases(!isEditingPhases)}
          className="gcp-btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.5rem 1rem' }}
        >
          <Settings size={16} /> {isEditingPhases ? 'Done Editing' : 'Manage Phases'}
        </button>
      </div>

      {isEditingPhases && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Phase Structure Editor</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {phases.map((phase, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phase Label</label>
                  <input 
                    type="text" 
                    value={phase.label || ''} 
                    onChange={(e) => handleUpdatePhase(idx, 'label', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weeks</label>
                  <input 
                    type="number" 
                    value={phase.durationWeeks || 0} 
                    onChange={(e) => handleUpdatePhase(idx, 'durationWeeks', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Objective</label>
                  <input 
                    type="text" 
                    value={phase.objective || ''} 
                    onChange={(e) => handleUpdatePhase(idx, 'objective', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  />
                </div>
                <button 
                  onClick={() => handleRemovePhase(idx)}
                  style={{ marginTop: '1.25rem', background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddPhase}
              className="gcp-btn-secondary"
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <Plus size={16} /> Add New Phase
            </button>
          </div>
        </div>
      )}

      {/* Embedded Components */}
      <ProtocolTimeline protocol={protocol} />
      <ClinicalProgressTracker protocol={protocol} />
      
    </div>
  );
}
