"use client";

import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  FlaskConical, 
  Thermometer, 
  Snowflake, 
  Archive, 
  FileText, 
  Printer, 
  Check, 
  Copy, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Download,
  AlertTriangle,
  QrCode
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import PrecisionSyringeVisualizer from './PrecisionSyringeVisualizer';
import { calculateReconstitution, STANDARD_PRESENTATIONS } from './monographCalculationEngine';

export default function PreparationTab({
  product = {},
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609'
}) {
  const [selectedVialStrength, setSelectedVialStrength] = useState(10);
  const [selectedBacVolume, setSelectedBacVolume] = useState(2.0);
  const [targetDoseMg, setTargetDoseMg] = useState(1.25);
  const [expandedSteps, setExpandedSteps] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false, 6: false });

  // Single authoritative calculation engine
  const recon = useMemo(() => {
    return calculateReconstitution({
      vialStrengthMg: selectedVialStrength,
      bacVolumeMl: selectedBacVolume,
      targetDoseMg
    });
  }, [selectedVialStrength, selectedBacVolume, targetDoseMg]);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyPrepProtocol = () => {
    triggerHaptic('light');
    const text = [
      `RECONSTITUTION & PREPARATION PROTOCOL — ${product.canonicalName || 'PT-141'}`,
      `Vial Strength: ${selectedVialStrength} mg Lyophilized Powder`,
      `Diluent Added: ${selectedBacVolume.toFixed(1)} mL Bacteriostatic 0.9% Benzyl Alcohol Water`,
      `Resulting Concentration: ${recon.concentrationDisplay}`,
      `Target Dose: ${targetDoseMg} mg`,
      `Calculated Draw: ${recon.injectionVolumeDisplay} (${recon.syringeUnitsDisplay} in U-100 syringe)`,
      `Doses per Vial: ${recon.dosesPerVial}`,
      `Storage: 2°C–8°C Refrigerated • Beyond-Use Date: 28 Days`
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    toast.success('Preparation instructions copied ✓');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="pds-tab-content pds-preparation-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── 1. Reconstitution Volumetrics & Configuration Card ── */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.65rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Clinical Reconstitution & Dosing Simulator
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              Select vial potency and diluent to compute exact concentration and draw volume.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyPrepProtocol}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Copied ✓' : 'Copy Prep Guide'}</span>
          </button>
        </div>

        {/* Configuration Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Vial Strength Selector */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
              1. Vial Presentation Strength
            </label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[5, 10, 20].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedVialStrength(s);
                    setSelectedBacVolume(s === 5 ? 1.0 : s === 10 ? 2.0 : 4.0);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: selectedVialStrength === s ? '1.5px solid #003666' : '1px solid #cbd5e1',
                    background: selectedVialStrength === s ? '#003666' : '#ffffff',
                    color: selectedVialStrength === s ? '#ffffff' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: selectedVialStrength === s ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {s} mg
                </button>
              ))}
            </div>
          </div>

          {/* Diluent BAC Volume Selector */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
              2. Diluent (BAC Water 0.9%)
            </label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[1.0, 2.0, 4.0].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedBacVolume(v);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: selectedBacVolume === v ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedBacVolume === v ? '#0284c7' : '#ffffff',
                    color: selectedBacVolume === v ? '#ffffff' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: selectedBacVolume === v ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {v.toFixed(1)} mL
                </button>
              ))}
            </div>
          </div>

          {/* Target Clinical Dose Selector */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
              3. Target Clinical Dose
            </label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[1.0, 1.25, 1.5, 1.75, 2.0].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setTargetDoseMg(d);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: targetDoseMg === d ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                    background: targetDoseMg === d ? '#16a34a' : '#ffffff',
                    color: targetDoseMg === d ? '#ffffff' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: targetDoseMg === d ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {d.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Results Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Concentration</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#166534', fontFamily: 'monospace' }}>
              {recon.concentrationDisplay}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Draw Volume</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#003666', fontFamily: 'monospace' }}>
              {recon.injectionVolumeDisplay}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>U-100 Syringe Units</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
              {recon.syringeUnitsDisplay}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Doses per Vial</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#334155', fontFamily: 'monospace' }}>
              {recon.dosesPerVial} administrations
            </div>
          </div>
        </div>

        {/* Subordinate Precision Syringe Visualizer */}
        <PrecisionSyringeVisualizer
          targetDoseMg={targetDoseMg}
          injectionVolumeMl={recon.injectionVolumeMl}
          syringeUnitsU100={recon.syringeUnitsU100}
        />
      </section>

      {/* ── 2. Handling Stepper & Storage Guidelines ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Stepwise Handling Protocol */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Aseptic Handling Protocol
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              { step: 1, title: 'Disinfect & Verify', summary: `Clean stopper with 70% IPA; verify lot ${effectiveBatch}`, detail: 'Air-dry for 30s. Maintain sterile technique and confirm lot label.' },
              { step: 2, title: 'Reconstitute', summary: `Add ${selectedBacVolume.toFixed(1)} mL Bacteriostatic Water`, detail: 'Direct stream gently against inside vial wall.' },
              { step: 3, title: 'Dissolve gently', summary: 'Swirl smoothly — never shake', detail: 'Avoid foam or bubble formation.' },
              { step: 4, title: 'Draw dose', summary: `Draw ${recon.syringeUnitsU100} U (${recon.injectionVolumeMl} mL) in U-100 syringe`, detail: 'Invert vial vertically, confirm volume alignment.' },
              { step: 5, title: 'Administer', summary: 'SubQ injection at 45–90°', detail: 'Rotate abdomen/thigh sites.' },
              { step: 6, title: 'Store', summary: 'Refrigerate (2°C–8°C)', detail: 'Discard after 28 days of reconstitution.' },
            ].map(item => {
              const isExp = expandedSteps[item.step];
              return (
                <div
                  key={item.step}
                  style={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: isExp ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSteps(prev => ({ ...prev, [item.step]: !prev[item.step] }))}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.step}
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• {item.summary}</span>
                    </div>
                    {isExp ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                  </button>
                  {isExp && (
                    <div style={{ padding: '2px 12px 8px 38px', fontSize: '0.72rem', color: '#475569' }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cold-Chain & Storage Standards */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Cold Chain & Beyond-Use Stability
          </h3>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 800, fontSize: '0.78rem' }}>
              <Snowflake size={14} color="#2563eb" />
              <span>Lyophilized Dry Powder (Unopened)</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#1e3a8a', lineHeight: 1.4 }}>
              Store at <strong>-20°C (Freezer)</strong> for up to 24 months. Stable at room temperature (20°C–25°C) for short-term transit (up to 30 days). Protect from direct light.
            </p>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, fontSize: '0.78rem' }}>
              <Thermometer size={14} color="#16a34a" />
              <span>Reconstituted Solution (In Use)</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#14532d', lineHeight: 1.4 }}>
              Refrigerate at <strong>2°C–8°C (Do not freeze)</strong>. When reconstituted with 0.9% Benzyl Alcohol Bacteriostatic Water, the solution maintains chemical potency for up to <strong>28 days</strong>.
            </p>
          </div>

          {/* Physical Vial Label Links */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.75rem',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Physical Label Dispensing
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <a
                href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=client&download=1`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#1e293b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <Download size={12} /> 38×90mm Label
              </a>
              <a
                href={`/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=client&download=1`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#1e293b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <FileText size={12} /> A4 Sheet (×8)
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
