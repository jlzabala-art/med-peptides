"use client";

import React from 'react';
import { 
  FlaskConical, 
  Clock, 
  Droplet, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  QrCode, 
  Layers,
  Activity,
  CheckCircle2,
  Syringe
} from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';

/**
 * ContextualRightSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Narrow, Google Cloud Console-compliant contextual right panel.
 * Strictly reflects the CURRENT TASK / ACTIVE TAB:
 * - Overview: Quick facts & available presentations summary
 * - Protocols: Protocol summary, duration, current step, total API required, vials
 * - Preparation: Active vial, concentration, target dose, draw units
 * - Quality: Batch code, HPLC purity, CoA status
 * - References: Regulatory dossiers, PubChem CID, PubMed links
 */
export default function ContextualRightSidebar({
  activeTab = 'overview',
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609',
  protocolContext = null,
  onOpenCoaModal
}) {
  const pageUrl = `https://med-peptides.com/p/${slug}`;

  return (
    <aside
      className="pds-contextual-sidebar"
      aria-label="Contextual Clinical Panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '300px'
      }}
    >
      {/* ── Contextual Panel Card (Changes with activeTab) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          background: '#003666',
          color: '#ffffff',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {activeTab === 'overview' && 'Overview Quick Facts'}
            {activeTab === 'protocols' && 'Active Protocol Context'}
            {activeTab === 'preparation' && 'Active Volumetric Context'}
            {activeTab === 'quality' && 'Quality & Batch Summary'}
            {activeTab === 'references' && 'Reference Citations'}
          </span>
          <span style={{
            fontSize: '0.64rem',
            background: 'rgba(255,255,255,0.16)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>
            Task Info
          </span>
        </div>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* TAB 1: OVERVIEW CONTEXT */}
          {activeTab === 'overview' && (
            <>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Chemical Specifications
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748b' }}>MW:</span>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#0f172a' }}>1025.16 Da</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748b' }}>CAS:</span>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#0f172a' }}>189691-06-3</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Half-Life:</span>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#0284c7' }}>~2.7 Hours</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Route:</span>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: '#166534' }}>SubQ (Subcutaneous)</strong>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Available Formats
                </div>
                <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '2px', fontWeight: 600 }}>
                  5 mg • 10 mg • 20 mg Lyophilized Vials
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PROTOCOLS CONTEXT */}
          {activeTab === 'protocols' && (
            <>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Protocol Focus
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                  {protocolContext?.activeProtocol?.name || 'On-Demand Libido Enhancement'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Duration:</span>
                  <strong style={{ display: 'block', fontSize: '0.80rem', color: '#003666' }}>
                    {protocolContext?.physicianDurationWeeks || protocolContext?.activeProtocol?.durationWeeks || 4} Weeks
                  </strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Workflow:</span>
                  <strong style={{ display: 'block', fontSize: '0.80rem', color: '#0284c7' }}>
                    Step {protocolContext?.currentStep || 1} of 5
                  </strong>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px' }}>
                <span style={{ fontSize: '0.66rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                  Calculated API Requirement
                </span>
                <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#1e3a8a', fontFamily: 'monospace' }}>
                  {protocolContext?.procCalc?.procurementSummary 
                    ? `${protocolContext.procCalc.totalApiRequiredMg} mg (${protocolContext.procCalc.procurementSummary})`
                    : '10.0 mg (1 × 10mg vial)'}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: PREPARATION CONTEXT */}
          {activeTab === 'preparation' && (
            <>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Selected Presentation
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
                  {protocolContext?.selectedVialStrength ? `${protocolContext.selectedVialStrength} mg Lyophilized SubQ Vial` : '10 mg Lyophilized SubQ Vial'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Concentration:</span>
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: '#166534', fontFamily: 'monospace' }}>
                    {protocolContext?.reconCalc?.concentrationMgMl ? `${protocolContext.reconCalc.concentrationMgMl} mg/mL` : '5.0 mg/mL'}
                  </strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Target Dose:</span>
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: '#003666' }}>
                    {protocolContext?.physicianDoseMg || protocolContext?.reconCalc?.targetDoseMg || 1.25} mg
                  </strong>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px' }}>
                <span style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                  U-100 Syringe Draw
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803d', fontFamily: 'monospace' }}>
                  {protocolContext?.reconCalc?.syringeUnitsU100 != null
                    ? `${protocolContext.reconCalc.syringeUnitsU100} Units (${protocolContext.reconCalc.injectionVolumeMl} mL)`
                    : '25 Units (0.25 mL)'}
                </div>
              </div>
            </>
          )}

          {/* TAB 4: QUALITY CONTEXT */}
          {activeTab === 'quality' && (
            <>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active Verified Batch
                </span>
                <code style={{ display: 'block', fontSize: '0.84rem', fontWeight: 850, color: '#003666', marginTop: '2px' }}>
                  {effectiveBatch}
                </code>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', padding: '6px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <ShieldCheck size={14} color="#16a34a" />
                <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 750 }}>HPLC Purity: 99.4% Verified</span>
              </div>

              {onOpenCoaModal && (
                <button
                  type="button"
                  onClick={onOpenCoaModal}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#003666',
                    fontSize: '0.74rem',
                    fontWeight: 750,
                    cursor: 'pointer'
                  }}
                >
                  Inspect Certificate of Analysis ➔
                </button>
              )}
            </>
          )}

          {/* TAB 5: REFERENCES CONTEXT */}
          {activeTab === 'references' && (
            <>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  FDA Reference Application
                </span>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>
                  NDA 210583 (Vyleesi®)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <a
                  href="https://pubchem.ncbi.nlm.nih.gov/compound/9941957"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.74rem', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> PubChem CID: 9941957
                </a>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/?term=bremelanotide"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.74rem', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> PubMed Bremelanotide Index
                </a>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Compact Digital Monograph QR Code ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
          <QrCode size={13} color="#003666" />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
            Digital Monograph QR
          </span>
        </div>

        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Direct digital lookup"
          style={{ display: 'block', lineHeight: 0, padding: '4px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}
        >
          <QRCodeSVG
            value={pageUrl}
            size={110}
            bgColor="#ffffff"
            fgColor="#003666"
            level="M"
          />
        </a>

        <div style={{ fontSize: '0.64rem', color: '#94a3b8', textAlign: 'center', fontFamily: 'monospace' }}>
          med-peptides.com/p/{slug}
        </div>
      </div>
    </aside>
  );
}
