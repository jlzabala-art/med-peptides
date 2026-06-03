/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ProtocolHeaderCharts from './ProtocolHeaderCharts';

const ProtocolGraphGroup = ({ protocol, phaseBlocks, compounds, dominantUnit, isIntensityMode }) => {
  const [activeTab, setActiveTab] = useState('peptides');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Split compounds into peptides and supplements
  const peptideCompounds = compounds.filter(c => {
    const cleanId = c.name.toLowerCase().replace('prd_', '').replace(/[^a-z0-9]/g, '');
    // Simple heuristic: if it's in the registry as a supplement, or doesn't have stability info
    // In a real app, we'd have a 'type' field in the registry.
    return !['vitamin-d3', 'magnesium-threonate', 'berberine', 'omega-3', 'nac', 'coq10'].includes(cleanId);
  });

  const supplementCompounds = compounds.filter(c => !peptideCompounds.includes(c));

  const renderPeptides = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'rgba(34, 211, 238, 0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Peptide Kinetics</h4>
        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary, #6b7280)', fontFamily: 'monospace' }}>Dose Escalation / Clearance</span>
      </div>
      <ProtocolHeaderCharts 
        protocol={protocol}
        overrideCompounds={peptideCompounds}
        compact={true}
      />
    </div>
  );

  const renderSupplements = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'rgba(52, 211, 153, 0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Supplement Support</h4>
        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary, #6b7280)', fontFamily: 'monospace' }}>Daily Foundation</span>
      </div>
      {supplementCompounds.length > 0 ? (
        <ProtocolHeaderCharts 
          protocol={protocol}
          overrideCompounds={supplementCompounds}
          compact={true}
        />
      ) : (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.75rem', padding: '2rem', border: '1px dashed rgba(30, 41, 59, 0.8)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-tertiary, #6b7280)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>No supplementary compounds defined for this protocol.</p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem', border: '1px solid rgba(30, 41, 59, 0.8)', padding: '1rem' }}>
          <details open style={{ display: 'block' }}>
            <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary, #e2e8f0)', fontWeight: 'bold', padding: '0.5rem 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary, #22d3ee)', boxShadow: '0 0 8px rgba(34,211,238,0.5)' }}></span>
                Peptides
              </span>
              <span style={{ color: 'var(--color-text-tertiary, #6b7280)' }}>▼</span>
            </summary>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(30, 41, 59, 0.5)' }}>
              {renderPeptides()}
            </div>
          </details>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem', border: '1px solid rgba(30, 41, 59, 0.8)', padding: '1rem' }}>
          <details style={{ display: 'block' }}>
            <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary, #e2e8f0)', fontWeight: 'bold', padding: '0.5rem 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-success, #34d399)', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }}></span>
                Supplements
              </span>
              <span style={{ color: 'var(--color-text-tertiary, #6b7280)' }}>▼</span>
            </summary>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(30, 41, 59, 0.5)' }}>
              {renderSupplements()}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '1.5rem', border: '1px solid rgba(30, 41, 59, 0.8)', padding: '1.5rem', backdropFilter: 'blur(24px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', backgroundColor: 'rgba(2, 6, 23, 0.5)', borderRadius: '1rem', border: '1px solid rgba(30, 41, 59, 0.8)', marginBottom: '2rem', width: 'fit-content', margin: '0 auto 2rem auto' }}>
        <button
          onClick={() => setActiveTab('peptides')}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            background: activeTab === 'peptides' ? 'var(--color-primary, #22d3ee)' : 'transparent',
            color: activeTab === 'peptides' ? 'var(--color-bg-primary, #020617)' : 'var(--color-text-tertiary, #6b7280)',
            boxShadow: activeTab === 'peptides' ? '0 0 20px rgba(34,211,238,0.3)' : 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Peptides
        </button>
        <button
          onClick={() => setActiveTab('supplements')}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            background: activeTab === 'supplements' ? 'var(--color-success, #10b981)' : 'transparent',
            color: activeTab === 'supplements' ? 'var(--color-bg-primary, #020617)' : 'var(--color-text-tertiary, #6b7280)',
            boxShadow: activeTab === 'supplements' ? '0 0 20px rgba(52,211,153,0.3)' : 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Supplements
        </button>
      </div>

      <div style={{ minHeight: '300px', transition: 'all 0.3s' }}>
        {activeTab === 'peptides' ? renderPeptides() : renderSupplements()}
      </div>
    </div>
  );
};

export default ProtocolGraphGroup;
