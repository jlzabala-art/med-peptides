"use client";

import React from 'react';
import { X, HelpCircle, ArrowRight } from 'lucide-react';

const HELP_TOPICS = {
  overview: {
    title: 'Practice Overview',
    what: 'Your clinical command center showing recent prescriptions, pending actions, and quick practice stats.',
    actions: [
      'Click "+ New Prescription" to create a compounded or catalog order.',
      'Click any metric or recent patient to jump directly to their filtered records.'
    ]
  },
  patients: {
    title: 'Patients Directory',
    what: 'All deduplicated patients linked to your clinic.',
    actions: [
      'Click a row to expand associated prescriptions and proposals.',
      'Use "Renew" to clone the latest regimen in 1 click, or "Dossier" to filter their prescriptions and set Active Patient Context.'
    ]
  },
  prescriptions: {
    title: 'Prescriptions & Proposals',
    what: 'Full list of active compounded formulas, refills, and pending treatment proposals.',
    actions: [
      'Use the search bar (⌘K) or status chips to filter by patient, Rx code, or API.',
      'Click any prescription to open its digital clinical dossier, QR code, or pharmacy labels.'
    ]
  },
  recommendations: {
    title: 'Specialty Blueprints & Rx Synergies',
    what: 'Evidence-based clinical protocols matched to your medical specialty and active patient prescriptions.',
    actions: [
      'Click "View Formula & Synergies" to inspect exact compounded APIs and in-stock catalog co-therapies.',
      'Click "Prescribe Protocol" to load the complete regimen directly into the Rx Formulary.'
    ]
  },
  dna_analysis: {
    title: 'DNA & Genomic Analysis',
    what: 'Pharmacogenomic and nutrigenomic panels (Fagron TrichoTest™, TeloTest™, NutriGen™, 24Genomics).',
    actions: [
      'Click a patient row to expand the 5 clinical genomic axes and copy a WhatsApp brief.',
      'Use "Portal ↗" for the interactive patient DNA portal, or "Rx →" to jump straight to the linked prescription.'
    ]
  },
  lab_results: {
    title: 'Lab Diagnostics (DBS & Blood)',
    what: 'Capillary dried blood spot (DBS) and serum biomarker panels.',
    actions: [
      'Review out-of-range biomarkers and correlate them with compounded titration protocols.'
    ]
  },
  analytics: {
    title: 'Practice Analytics',
    what: 'Prescribing velocity, top active ingredients (APIs), and patient retention cohorts.',
    actions: [
      'Click any bar or ingredient to filter your Prescriptions tab by that molecule or timeframe.'
    ]
  }
};

export default function DoctorQuickHelpDrawer({ isOpen, onClose, activeAnchor = 'overview' }) {
  if (!isOpen) return null;

  const topic = HELP_TOPICS[activeAnchor] || HELP_TOPICS.overview;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Guide"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          maxWidth: '92vw',
          height: '100%',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #dadce0',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.12)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8eaed', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a73e8', fontWeight: 700, fontSize: '0.95rem' }}>
            <HelpCircle size={18} />
            <span>Quick Guide · {topic.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            style={{
              background: '#f1f3f4',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#5f6368'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ background: '#f8f9fa', border: '1px solid #e8eaed', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            What this screen does
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#202124', lineHeight: 1.5 }}>
            {topic.what}
          </p>
        </div>

        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Key Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topic.actions.map((act, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.80rem',
                  color: '#3c4043',
                  lineHeight: 1.45,
                  padding: '8px 10px',
                  border: '1px solid #e8eaed',
                  borderRadius: '6px'
                }}
              >
                <ArrowRight size={14} style={{ color: '#1a73e8', flexShrink: 0, marginTop: '2px' }} />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
