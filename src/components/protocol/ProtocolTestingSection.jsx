import React from 'react';

const ProtocolTestingSection = ({ testingRequirements = [] }) => {
  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', opacity: 0.6, filter: 'grayscale(0.5)', transition: 'all 0.3s ease', cursor: 'help' }}
         onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'grayscale(0)'; }}
         onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.filter = 'grayscale(0.5)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span style={{ padding: '0.375rem', backgroundColor: 'rgba(192, 132, 252, 0.1)', borderRadius: '0.5rem' }}>🔬</span>
          Clinical Testing Section
        </h3>
        <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>Planned Feature</span>
      </div>
      
      {testingRequirements.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {testingRequirements.map((test, idx) => (
            <div key={idx} style={{ backgroundColor: 'rgba(30, 41, 59, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(51, 65, 85, 0.2)' }}>
              <p style={{ color: 'var(--color-text-primary)', fontWeight: '500', fontSize: '0.875rem', margin: 0 }}>{test.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', margin: 0 }}>{test.rationale}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', backgroundColor: 'rgba(30, 41, 59, 0.1)', borderRadius: '0.5rem', border: '1px dashed rgba(51, 65, 85, 0.3)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>No specific diagnostic tests are currently mandated for this protocol.</p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '0.5rem', fontStyle: 'italic', margin: 0 }}>Future updates will include relevant biomarker tracking recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default ProtocolTestingSection;
