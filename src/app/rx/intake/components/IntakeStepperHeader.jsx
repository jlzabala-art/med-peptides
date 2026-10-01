'use client';

import React from 'react';
import { Upload, ClipboardCheck, Award, CheckCircle2 } from '@/lib/icons';

/**
 * IntakeStepperHeader — Google Cloud UX 3-Phase Stepper Navigation Bar
 * 
 * Phase 1: Ingestion & Multimodal Scan
 * Phase 2: Clinical Verification & Doctor Completion
 * Phase 3: Submit Quotation & Multi-Device Delivery
 */
export default function IntakeStepperHeader({ currentStep = 1, onStepClick, isProcessing = false }) {
  return (
    <div className="gcp-stepper-wrapper">
      <div className="gcp-stepper-container">
        {/* Step 1: Ingestion */}
        <div
          className={`gcp-stepper-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed clickable' : ''}`}
          onClick={() => {
            if (currentStep > 1 && !isProcessing && onStepClick) {
              onStepClick(1);
            }
          }}
        >
          <div className="gcp-stepper-circle">
            {currentStep > 1 ? <CheckCircle2 size={16} /> : <Upload size={14} />}
          </div>
          <div className="gcp-stepper-info">
            <span className="gcp-stepper-title">Phase 1 · Scan & Ingest</span>
            <span className="gcp-stepper-desc">Multimodal AI document upload</span>
          </div>
        </div>

        <div className={`gcp-stepper-divider ${currentStep >= 2 ? 'completed' : ''}`} />

        {/* Step 2: Verification */}
        <div
          className={`gcp-stepper-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed clickable' : ''} ${currentStep < 2 ? 'pending' : ''}`}
          onClick={() => {
            if (currentStep > 2 && !isProcessing && onStepClick) {
              onStepClick(2);
            }
          }}
        >
          <div className="gcp-stepper-circle">
            {currentStep > 2 ? <CheckCircle2 size={16} /> : <ClipboardCheck size={14} />}
          </div>
          <div className="gcp-stepper-info">
            <span className="gcp-stepper-title">Phase 2 · Verify & Complete</span>
            <span className="gcp-stepper-desc">Doctor metadata & posology</span>
          </div>
        </div>

        <div className={`gcp-stepper-divider ${currentStep >= 3 ? 'completed' : ''}`} />

        {/* Step 3: Quotation & Delivery */}
        <div className={`gcp-stepper-step ${currentStep === 3 ? 'active' : ''} ${currentStep < 3 ? 'pending' : ''}`}>
          <div className="gcp-stepper-circle">
            <Award size={14} />
          </div>
          <div className="gcp-stepper-info">
            <span className="gcp-stepper-title">Phase 3 · Quote & Deliver</span>
            <span className="gcp-stepper-desc">Patient QR & prescription registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
