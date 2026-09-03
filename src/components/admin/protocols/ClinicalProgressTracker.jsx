import React from 'react';
import { StatusChip } from '../../ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, TrendingUp, Activity, CheckCircle } from '@/lib/icons';

export default function ClinicalProgressTracker({ protocol, onEnrichMonitoring }) {
  const biomarkerData = protocol?.clinical_biomarker_data;
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  if (!biomarkerData) {
    return (
      <div style={{ background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Activity size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#334155' }}>Clinical Target Pending</h3>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>The primary biomarker trajectory for this protocol is currently pending clinical enrichment via Atlas AI.</p>
        
        {onEnrichMonitoring && (
          <button
            onClick={() => {
              setIsGenerating(true);
              onEnrichMonitoring();
              // Reset the loading state after a few seconds in case it finishes quickly
              setTimeout(() => setIsGenerating(false), 3000);
            }}
            disabled={isGenerating}
            className="gcp-btn-primary"
            style={{ 
              marginTop: '1.5rem', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            {isGenerating ? 'Working...' : '✨ Generate Trajectory'}
          </button>
        )}
      </div>
    );
  }

  const progressData = biomarkerData.progressData || [];
  const biomarkerName = biomarkerData.biomarker_name || 'Biomarker';
  const targetLabel = biomarkerData.target_label || 'Clinical Target';

  // Calculate actual treatment duration from phases or protocol property
  const activeTreatmentWeeks = protocol?.duration_weeks || protocol?.phases?.reduce((acc, phase) => acc + (phase.durationWeeks || 0), 0) || 6;
  const isExtendedTracking = progressData.length > 0 && progressData[progressData.length - 1].week > activeTreatmentWeeks;

  const milestones = [
    { week: 1, label: 'Adaptation', status: 'completed' },
    { week: Math.round(activeTreatmentWeeks / 2), label: 'Initial Response', status: 'current' },
    { week: activeTreatmentWeeks, label: 'End of Active Phase', status: 'pending' },
    { week: isExtendedTracking ? progressData[progressData.length - 1].week : activeTreatmentWeeks + 4, label: 'Final Target Achieved', status: 'pending' },
  ];

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#0284c7" /> {biomarkerName} Tracking
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Tracking primary biomarkers and symptom resolution across protocol phases.</p>
          {isExtendedTracking && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderLeft: '3px solid #0ea5e9', fontSize: '0.8rem', color: '#475569', borderRadius: '0 4px 4px 0' }}>
              <strong>Clinical Note:</strong> Active treatment is {activeTreatmentWeeks} weeks. Tracking extends to week {progressData[progressData.length - 1].week} to monitor post-treatment tissue remodeling and sustained symptom resolution.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StatusChip status={protocol?.status || 'Active'} />
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} /> {targetLabel}
          </div>
        </div>
      </div>

      {/* Milestones Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '1rem', marginTop: '1rem' }}>
        {/* Progress line background */}
        <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
        {/* Active progress line */}
        <div style={{ position: 'absolute', top: '14px', left: '10%', right: '50%', height: '2px', background: '#0284c7', zIndex: 0 }}></div>
        
        {milestones.map((milestone, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '25%' }}>
            <div style={{ 
              width: '30px', height: '30px', borderRadius: '50%', 
              background: milestone.status === 'completed' ? '#0ea5e9' : milestone.status === 'current' ? 'white' : '#f8fafc',
              border: milestone.status === 'current' ? '3px solid #0ea5e9' : `1px solid ${milestone.status === 'completed' ? '#0ea5e9' : '#cbd5e1'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: milestone.status === 'completed' ? 'white' : '#cbd5e1'
            }}>
              {milestone.status === 'completed' ? <CheckCircle size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: milestone.status === 'current' ? '#0ea5e9' : '#cbd5e1' }}></div>}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: milestone.status === 'pending' ? '#94a3b8' : '#0f172a' }}>{milestone.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Week {milestone.week}
                {milestone.week > activeTreatmentWeeks ? ' (Follow-up)' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div style={{ height: '300px', width: '100%', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} /> Projected Biomarker Trajectory
        </h4>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={progressData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              labelStyle={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}
            />
            <ReferenceLine y={80} label={{ position: 'top', value: 'Clinical Target', fill: '#16a34a', fontSize: 12 }} stroke="#16a34a" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="biomarker" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2 }} name="Improvement Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
