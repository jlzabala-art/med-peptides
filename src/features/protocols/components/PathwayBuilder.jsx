'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, X, Plus } from '@/lib/icons';
import { TextField, Select } from '../../../components/ui';

// ── PathwayBuilder Modal ────────────────────────────────────────────────────────
export default function PathwayBuilder({ onClose, onSave, onGenerateAI }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    complexity: 'moderate',
    description: '',
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const buildTemplate = () => {
    // Generate a starter template based on complexity
    const phases = [];
    if (formData.complexity === 'simple') {
      phases.push({ label: 'Phase 1: Induction', durationWeeks: 4, items: [] });
    } else if (formData.complexity === 'moderate') {
      phases.push({ label: 'Phase 1: Loading', durationWeeks: 4, items: [] });
      phases.push({ label: 'Phase 2: Maintenance', durationWeeks: 8, items: [] });
    } else {
      phases.push({ label: 'Phase 1: Diagnostics & Priming', durationWeeks: 2, items: [] });
      phases.push({ label: 'Phase 2: Core Therapy', durationWeeks: 8, items: [] });
      phases.push({ label: 'Phase 3: Tapering', durationWeeks: 4, items: [] });
    }

    onSave({
      protocol_name: formData.title || 'New Clinical Pathway',
      therapeutic_category: formData.category,
      complexity_level: formData.complexity,
      status: 'draft',
      overview_summary: formData.description,
      phases,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="admin-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.25rem',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FlaskConical size={20} color="#3b82f6" /> Clinical Pathway Builder
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.5rem',
                  }}
                >
                  Pathway Title
                </label>
                <TextField
                  autoFocus
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Advanced Metabolic Reset"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.5rem',
                  }}
                >
                  Therapeutic Category
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  options={[
                    { label: 'Select Category...', value: '' },
                    'Longevity',
                    'Weight Loss',
                    'Muscle Hypertrophy',
                    'Cognitive Enhancement',
                    'Injury Recovery'
                  ]}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.5rem',
                  }}
                >
                  Complexity Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {['simple', 'moderate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFormData((p) => ({ ...p, complexity: lvl }))}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border:
                          formData.complexity === lvl ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: formData.complexity === lvl ? '#eff6ff' : 'white',
                        color: formData.complexity === lvl ? '#1e40af' : '#64748b',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.5rem',
                  }}
                >
                  Clinical Overview (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the intended outcome..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <Package size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
                Ready to Build Pathway
              </h4>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  maxWidth: '400px',
                  margin: '0 auto 2rem',
                }}
              >
                You can manually assemble the phases, or let Atlas AI generate a draft clinical
                pathway based on your parameters.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={buildTemplate}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  Create Manual Pathway
                </button>
                <button
                  onClick={() => onGenerateAI(formData)}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'white',
                    color: '#0f172a',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FlaskConical size={18} /> Generate with Atlas AI
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={step === 1 ? onClose : handlePrev}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 && (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!formData.title || !formData.category)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: step === 1 && (!formData.title || !formData.category) ? 0.5 : 1,
              }}
            >
              Next Step
            </button>
          )}
        </div>
      </motion.div>

    </div>
  );
}
