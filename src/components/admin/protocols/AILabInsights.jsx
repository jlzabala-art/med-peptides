import React, { useState } from 'react';
import { BrainCircuit, FlaskConical, Plus, Trash2, Activity } from 'lucide-react';

export default function AILabInsights({ protocol, onUpdate }) {
  const aiInsights = protocol?.aiInsights || {
    rationale: '',
    expectedOutcomes: '',
    contraindications: '',
  };

  const labMonitoring = protocol?.labMonitoring || [];

  const handleInsightChange = (field, value) => {
    onUpdate({
      aiInsights: {
        ...aiInsights,
        [field]: value
      }
    });
  };

  const handleAddLab = () => {
    onUpdate({
      labMonitoring: [
        ...labMonitoring,
        { id: Date.now().toString(), week: 'Baseline', type: 'Required', tests: '' }
      ]
    });
  };

  const handleUpdateLab = (id, field, value) => {
    onUpdate({
      labMonitoring: labMonitoring.map(lab => 
        lab.id === id ? { ...lab, [field]: value } : lab
      )
    });
  };

  const handleRemoveLab = (id) => {
    onUpdate({
      labMonitoring: labMonitoring.filter(lab => lab.id !== id)
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem', display: 'flex', gap: '2rem' }}>
      
      {/* AI Insights Section */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
            <BrainCircuit size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>AI Clinical Insights</h3>
        </div>

        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Why this protocol? (Clinical Rationale)
            </label>
            <textarea 
              value={aiInsights.rationale}
              onChange={(e) => handleInsightChange('rationale', e.target.value)}
              placeholder="AI-generated rationale..."
              style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Expected Outcomes
            </label>
            <textarea 
              value={aiInsights.expectedOutcomes}
              onChange={(e) => handleInsightChange('expectedOutcomes', e.target.value)}
              placeholder="What to expect..."
              style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Contraindications & Interactions
            </label>
            <textarea 
              value={aiInsights.contraindications}
              onChange={(e) => handleInsightChange('contraindications', e.target.value)}
              placeholder="Warnings and conflicts..."
              style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Lab Monitoring Section */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--info-light, #e0f2fe)', padding: '0.5rem', borderRadius: '8px', color: 'var(--info, #0284c7)' }}>
              <FlaskConical size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Lab Monitoring</h3>
          </div>
          <button 
            onClick={handleAddLab}
            className="btn btn-outline" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={14} /> Add Lab
          </button>
        </div>

        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {labMonitoring.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Activity size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ margin: 0 }}>No lab monitoring schedule defined.</p>
            </div>
          ) : (
            labMonitoring.map(lab => (
              <div key={lab.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    value={lab.week} 
                    onChange={(e) => handleUpdateLab(lab.id, 'week', e.target.value)}
                    placeholder="e.g. Baseline, Week 4"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '0.5rem', fontSize: '0.85rem' }}
                  />
                  <select 
                    value={lab.type} 
                    onChange={(e) => handleUpdateLab(lab.id, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  >
                    <option value="Required">Required</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <textarea 
                    value={lab.tests} 
                    onChange={(e) => handleUpdateLab(lab.id, 'tests', e.target.value)}
                    placeholder="CBC, CMP, IGF-1..."
                    style={{ width: '100%', minHeight: '75px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
                <button 
                  onClick={() => handleRemoveLab(lab.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
