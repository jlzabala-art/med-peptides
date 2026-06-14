import Upload from "lucide-react/dist/esm/icons/upload";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import React, { useState } from 'react';



import AIExtractionPanel from './AIExtractionPanel';
import ProductMatchingCenter from './ProductMatchingCenter';
import ClinicalAlertCenter from './ClinicalAlertCenter';
import IntakeActionCenter from './IntakeActionCenter';

const STEPS = ['Upload', 'Analyze', 'Validate', 'Match', 'Quote'];

export default function PrescriptionMobileWizard({ prescription, onSelect }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!prescription) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <button onClick={() => onSelect({ id: '1', patient: 'John Smith' })} style={{
          background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px',
          padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', cursor: 'pointer'
        }}>
          <Upload size={32} color="#0071bd" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Upload New Prescription</span>
        </button>
        {/* Placeholder list could go here */}
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <div style={{ padding: '24px', textAlign: 'center' }}>Document Uploaded. Ready for Analysis.</div>;
      case 1: return <AIExtractionPanel rx={prescription} />;
      case 2: return <ClinicalAlertCenter />;
      case 3: return <ProductMatchingCenter />;
      case 4: return <IntakeActionCenter />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* Wizard Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Intake Wizard</span>
          <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', color: '#64748b' }}>Close</button>
        </div>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {STEPS.map((step, idx) => (
            <div key={step} style={{ 
              flex: 1, 
              height: '4px', 
              borderRadius: '2px',
              background: idx <= currentStep ? '#0071bd' : '#e2e8f0'
            }} />
          ))}
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#0071bd' }}>
          Step {currentStep + 1}: {STEPS[currentStep]}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {renderStep()}
      </div>

      {/* Wizard Footer Controls */}
      <div style={{ background: '#fff', padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
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
          onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
          disabled={currentStep === STEPS.length - 1}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', border: 'none', background: '#0071bd', color: '#fff', borderRadius: '8px',
            opacity: currentStep === STEPS.length - 1 ? 0.5 : 1
          }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}