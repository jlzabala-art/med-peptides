import React from 'react';
import { BrainCircuit, TestTube, ArrowUpRight } from '@/lib/icons';
import AILabInsights from '../AILabInsights';

export default function ProtocolLabs({ protocol, onUpdate }) {
  
  // Example dummy calculation or KPI extraction
  const requiredBiomarkers = protocol?.biomarkers?.length || 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={24} color="var(--primary)" /> Laboratory & Biomarkers
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Track pre-treatment baselines and analyze critical post-treatment biomarker shifts using our AI-driven insight engine.
          </p>
        </div>
      </div>

      {/* Premium Mini KPIs for Labs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #bae6fd', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.1)' }}>
          <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Monitored Biomarkers</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#075985', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TestTube size={24} /> {requiredBiomarkers} Key Panels
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f5d0fe', boxShadow: '0 4px 15px rgba(192, 38, 211, 0.1)' }}>
          <div style={{ color: '#c026d3', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expected Improvement</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#86198f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpRight size={24} /> Optimal
          </div>
        </div>
      </div>

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <AILabInsights protocol={protocol} onUpdate={onUpdate} />
        </div>
      </div>
      
    </div>
  );
}
