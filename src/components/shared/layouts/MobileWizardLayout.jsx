import Upload from "lucide-react/dist/esm/icons/upload";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import React, { useState } from 'react';




/**
 * Generic Mobile Wizard Layout.
 * Step-by-step swipeable cards replacing large data tables on mobile.
 * 
 * @param {boolean} active - Whether a flow is active.
 * @param {string} title - Title of the wizard (e.g., "Pricing Intelligence").
 * @param {Array} steps - Array of objects { label: string, component: ReactNode }
 * @param {Function} onClose - Function to close the wizard.
 * @param {ReactNode} emptyState - What to show when active is false.
 */
export default function MobileWizardLayout({
  active,
  title = "Intelligence Flow",
  steps = [],
  onClose,
  emptyState
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!active) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        {emptyState || (
          <div style={{
            background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px',
            padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '12px'
          }}>
            <Upload size={32} color="#0071bd" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Select Document</span>
          </div>
        )}
      </div>
    );
  }

  const handleBack = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* Wizard Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{title}</span>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b' }}>Close</button>
          )}
        </div>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ 
              flex: 1, 
              height: '4px', 
              borderRadius: '2px',
              background: idx <= currentStep ? '#0071bd' : '#e2e8f0'
            }} />
          ))}
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#0071bd' }}>
          Step {currentStep + 1}: {steps[currentStep]?.label}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {steps[currentStep]?.component}
      </div>

      {/* Wizard Footer Controls */}
      <div style={{ background: '#fff', padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={handleBack}
          disabled={currentStep === 0}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '8px',
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button 
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', border: 'none', background: '#0071bd', color: '#fff', borderRadius: '8px',
            opacity: currentStep === steps.length - 1 ? 0.5 : 1
          }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}