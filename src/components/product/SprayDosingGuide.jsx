"use client";

import React, { useState, useMemo } from 'react';
import { Droplets } from 'lucide-react';

export default function SprayDosingGuide({ product, selectedVariant }) {
  const [desiredDose, setDesiredDose] = useState(500); // mcg

  const vialMg = useMemo(() => {
    const dosage = selectedVariant?.dosage || selectedVariant?.strength || product?.dosage || '10mg';
    return parseFloat(dosage.replace(/[^0-9.]/g, '')) || 10;
  }, [selectedVariant, product]);

  const volumeMl = useMemo(() => {
    const presentation = selectedVariant?.presentation || selectedVariant?.format || '';
    const match = presentation.match(/(\d+(?:\.\d+)?)ml/i);
    return match ? parseFloat(match[1]) : 15; // default spray bottle usually 15ml
  }, [selectedVariant]);

  const results = useMemo(() => {
    const totalMcg = vialMg * 1000;
    const mcgPerMl = totalMcg / volumeMl;
    // Assume a standard nasal spray pump delivers 0.1ml per spray
    const volumePerSpray = 0.1;
    const mcgPerSpray = mcgPerMl * volumePerSpray;
    const spraysForDose = desiredDose / mcgPerSpray;

    return {
      totalMcg,
      mcgPerMl,
      mcgPerSpray,
      spraysForDose: Math.round(spraysForDose),
    };
  }, [vialMg, volumeMl, desiredDose]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 163, 224, 0.08)', borderRadius: '10px', color: 'var(--secondary)' }}>
          <Droplets size={22} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>Nasal Spray Dosing</h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calculate the number of sprays for your target dose</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--section-alt, #EEF4FA)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-muted)' }}>Bottle Content:</span>
          <span style={{ color: 'var(--primary)' }}>{vialMg} mg in {volumeMl} ml</span>
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Administer</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {results.spraysForDose} <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.8 }}>sprays</span>
          </div>
          <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
            ({results.mcgPerSpray.toFixed(1)} mcg per spray)
          </span>
        </div>
      </div>
    </div>
  );
}
