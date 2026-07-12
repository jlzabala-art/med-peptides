import React from 'react';
import { BrainCircuit, FlaskConical, AlertTriangle, CheckCircle, Info, TestTube } from '@/lib/icons';

export default function AILabInsights({ protocol }) {
  const rationale = protocol?.overview_summary || protocol?.clinical_rationale || 'No clinical rationale provided for this protocol.';
  const expectedOutcomes = protocol?.expected_outcomes || protocol?.metadata?.expected_outcomes || 'No expected outcomes specified.';
  const contraindications = protocol?.contraindications || (protocol?.eligibility_rules?.contraindications || []).join(', ') || 'No contraindications or interactions documented.';
  
  const rawLabs = protocol?.required_labs || protocol?.monitoring_plan?.baseline_required || [];
  const labMonitoring = rawLabs.map((l, i) => ({
    id: String(i),
    week: l.timing || l.time_point || 'Baseline',
    type: l.type || 'Required',
    tests: typeof l === 'string' ? l : (l.name || l.test || l.panel || ''),
  }));

  const allProducts = protocol?.phases?.flatMap((phase) => phase.items) || [];
  const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.productId, p])).values());

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* AI Insights Section */}
      <div style={{ flex: '1 1 500px' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary-light, #e0e7ff)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary, #4f46e5)' }}>
            <BrainCircuit size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Clinical Insights</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Rationale */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <Info size={18} color="var(--primary, #3b82f6)" /> Why this protocol? (Rationale)
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {rationale}
            </p>
          </div>

          {/* Expected Outcomes */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <CheckCircle size={18} color="var(--success, #10b981)" /> Expected Outcomes
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {expectedOutcomes}
            </p>
          </div>

          {/* Contraindications */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <AlertTriangle size={18} color="var(--error, #ef4444)" /> Contraindications & Interactions
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {contraindications}
            </p>
          </div>
        </div>
      </div>

      {/* Peptides & Lab Monitoring Section */}
      <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Included Peptides */}
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
              <FlaskConical size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Included Peptides</h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {uniqueProducts.length > 0 ? uniqueProducts.map(p => (
              <div key={p.productId} style={{ 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '0.75rem 1.25rem', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: 'var(--primary)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                {p.productName}
              </div>
            )) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No peptides found in the phases.</p>
            )}
          </div>
        </div>

        {/* Lab Monitoring Schedule */}
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#f59e0b' }}>
              <TestTube size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Lab Monitoring Schedule</h3>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            {labMonitoring.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No lab monitoring scheduled.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background-alt, #f8fafc)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timing</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel / Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {labMonitoring.map((lab, index) => (
                    <tr key={index} style={{ borderBottom: index < labMonitoring.length - 1 ? '1px solid var(--border-light, #f1f5f9)' : 'none' }}>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{lab.week}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '6px', 
                          background: lab.type === 'Required' ? '#fee2e2' : lab.type === 'Recommended' ? '#fef3c7' : '#f3f4f6', 
                          color: lab.type === 'Required' ? '#991b1b' : lab.type === 'Recommended' ? '#92400e' : '#374151',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase'
                        }}>
                          {lab.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{lab.tests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
