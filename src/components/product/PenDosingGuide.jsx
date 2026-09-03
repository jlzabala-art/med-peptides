"use client";

import React, { useState, useMemo } from 'react';
import { Settings2, Info } from 'lucide-react';

export default function PenDosingGuide({ product, selectedVariant }) {
  const [desiredDose, setDesiredDose] = useState(250); // mcg

  const penConfig = selectedVariant?.penConfig || {
    cartridgeType: 'single_cartridge',
    chamberCount: 1,
    totalVolumeMl: 3.0,
    dosingSpecs: { clicksPerMl: 100, unitsPerClick: 0.01, reconstitutionRequired: false }
  };

  const isNoCartridgeDevice = penConfig.cartridgeIncluded === false || penConfig.cartridgeType === 'no_cartridge' || selectedVariant?.format === 'reusable_pen_device';
  const isDoubleCartridge = penConfig.cartridgeType === 'double_cartridge' || penConfig.chamberCount === 2;

  const vialMg = useMemo(() => {
    const dosage = selectedVariant?.dosage || selectedVariant?.strength || product?.dosage || '5mg';
    return parseFloat(dosage.replace(/[^0-9.]/g, '')) || 5;
  }, [selectedVariant, product]);

  const volumeMl = useMemo(() => {
    if (penConfig?.totalVolumeMl) return penConfig.totalVolumeMl;
    // Usually prefilled pens are 3ml
    const presentation = selectedVariant?.presentation || selectedVariant?.format || '';
    const match = presentation.match(/(\d+(?:\.\d+)?)ml/i);
    return match ? parseFloat(match[1]) : 3;
  }, [selectedVariant, penConfig]);

  const results = useMemo(() => {
    const totalMcg = vialMg * 1000;
    const mcgPerMl = totalMcg / volumeMl;
    const clicksPerMl = penConfig?.dosingSpecs?.clicksPerMl || 100;
    const mcgPerUnit = mcgPerMl / clicksPerMl;
    const unitsForDose = desiredDose / mcgPerUnit;

    return {
      totalMcg,
      mcgPerMl,
      mcgPerUnit,
      unitsForDose: parseFloat(unitsForDose.toFixed(1)),
    };
  }, [vialMg, volumeMl, desiredDose, penConfig]);

  return (
    <div className="recon-card" style={{
      padding: '1.75rem',
      backgroundColor: 'white',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-sm)',
      marginTop: '1.5rem',
      color: 'var(--text-main)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 163, 224, 0.08)', borderRadius: '10px', color: 'var(--secondary)' }}>
            <Settings2 size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>Pen Dialing Guide</h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isNoCartridgeDevice ? 'Reusable precision injector device specifications' : 'Calculate units (clicks) for your prefilled pen'}
            </p>
          </div>
        </div>
        {isNoCartridgeDevice ? (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            Device Only (No Cartridge)
          </span>
        ) : isDoubleCartridge ? (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
            Dual-Chamber
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
            Single Cartridge
          </span>
        )}
      </div>

      {isNoCartridgeDevice ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Info size={16} /> Reusable Mechanical Injector
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            This injector device does not contain medication. It is engineered to accept standard <strong>{isDoubleCartridge ? 'Dual-Chamber (Double Cartridge)' : '3.0ml / 1.5ml'}</strong> peptide refill cartridges with 0.01ml micro-increments (100 clicks per ml).
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--section-alt, #EEF4FA)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Pen Format & Content:</span>
            <span style={{ color: 'var(--primary)' }}>
              {isDoubleCartridge ? 'Dual-Chamber Pen' : 'Single Cartridge'} • {vialMg} mg in {volumeMl} ml
            </span>
          </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Target Dose (mcg)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" 
              min="50" max="2500" step="50" 
              value={desiredDose} 
              onChange={(e) => setDesiredDose(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <div style={{ 
              background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', 
              padding: '0.5rem 0.75rem', fontWeight: 700, minWidth: '80px', textAlign: 'center', color: 'var(--primary)' 
            }}>
              {desiredDose}
            </div>
          </div>
        </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.95), rgba(0, 163, 224, 0.95))',
            borderRadius: '16px',
            padding: '1.25rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0, 163, 224, 0.2)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Dial the pen to</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              {results.unitsForDose} <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.8 }}>units</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              {`(${results.mcgPerUnit.toFixed(1)} mcg per micro-click)`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
