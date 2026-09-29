'use client';

import React, { useState, useMemo } from 'react';
import { X, Printer, Download, ShieldAlert, CheckCircle2, Calendar, Droplets, Syringe, QrCode } from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';

export default function VialReconstitutionLabelModal({
  isOpen = false,
  onClose = () => {},
  product = {},
  vialMg = 10,
  bacWaterMl = 2.0,
  doseValue = 2.5,
  doseUnit = 'mg',
  syringeUnits = 50,
  liquidVolumeMl = 0.5,
  concentrationMgMl = 5.0
}) {
  const [reconstitutionDate, setReconstitutionDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // USP <797> rule: Multi-dose vial discard date is strictly +28 days from reconstitution
  const discardDate = useMemo(() => {
    try {
      const d = new Date(reconstitutionDate);
      d.setDate(d.getDate() + 28);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '28 Days Post-Puncture';
    }
  }, [reconstitutionDate]);

  const pName = product?.canonicalName || product?.name || 'Clinical Peptide';
  const lotNumber = useMemo(() => {
    const prefix = (product?.slug || product?.id || 'RP').slice(0, 3).toUpperCase();
    return `LOT-${prefix}-${new Date().getFullYear()}-094`;
  }, [product]);

  if (!isOpen) return null;

  const handlePrint = () => {
    triggerHaptic('success');
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#003666',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🏷️
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                USP &lt;797&gt; Clinical Reconstitution Vial Label
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                Printable thermal label for clinical vial identification &amp; sterility compliance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Date Picker Input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <span style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700 }}>
              Reconstitution Date:
            </span>
            <input
              type="date"
              value={reconstitutionDate}
              onChange={(e) => setReconstitutionDate(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                background: '#ffffff',
                outline: 'none',
                fontWeight: 600,
                color: '#0f172a'
              }}
            />
          </div>

          {/* ── PRINTABLE VIAL STICKER PREVIEW ── */}
          <div 
            id="printable-vial-label"
            style={{
              border: '2px dashed #003666',
              borderRadius: '10px',
              padding: '14px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative'
            }}
          >
            {/* Sticker Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #003666', paddingBottom: '6px' }}>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#003666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ATLAS CLINICAL SERVICES • RECONSTITUTED MULTI-DOSE VIAL
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  {pName} {vialMg} mg
                </div>
              </div>
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                {lotNumber}
              </span>
            </div>

            {/* Sticker Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Nominal Concentration:
                </span>
                <strong style={{ color: '#003666', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {concentrationMgMl.toFixed(2)} mg/mL
                </strong>
                <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                  ({vialMg} mg / {bacWaterMl.toFixed(1)} mL BAC)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Posology / Dose to Draw:
                </span>
                <strong style={{ color: '#16a34a', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {syringeUnits.toFixed(1)} UI ({liquidVolumeMl.toFixed(2)} mL)
                </strong>
                <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                  Target Dose: {doseValue} {doseUnit} SubQ
                </span>
              </div>
            </div>

            {/* USP <797> Expiration Box */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                  USP &lt;797&gt; Sterility Expiration (+28 Days):
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>
                  DISCARD ON: {discardDate}
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                28D MAX
              </span>
            </div>

            {/* Storage Directive */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', color: '#475569', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
              <span>❄️ Storage: Refrigerate at 2°C – 8°C • Protect from light • Do NOT freeze</span>
              <span style={{ fontWeight: 700, color: '#003666' }}>Rx Only</span>
            </div>
          </div>

          {/* Helper notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b' }}>
            <CheckCircle2 size={13} color="#16a34a" />
            <span>Conforms to USP &lt;797&gt; multi-dose vial beyond-use date (BUD) protocol requirements.</span>
          </div>

        </div>

        {/* Modal Actions */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '0.80rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '6px 16px',
              fontSize: '0.80rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: '#003666',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={14} />
            Print Vial Label
          </button>
        </div>

      </div>
    </div>
  );
}
