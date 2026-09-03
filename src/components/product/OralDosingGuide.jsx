"use client";

import React, { useState, useMemo } from 'react';
import { Pill } from 'lucide-react';

export default function OralDosingGuide({ product, selectedVariant }) {
  const [desiredDose, setDesiredDose] = useState(1); // count of pills/capsules

  const mgPerUnit = useMemo(() => {
    const dosage = selectedVariant?.dosage || selectedVariant?.strength || product?.dosage || '5mg';
    return parseFloat(dosage.replace(/[^0-9.]/g, '')) || 5;
  }, [selectedVariant, product]);

  const unitType = useMemo(() => {
    const format = selectedVariant?.format?.toLowerCase() || '';
    if (format.includes('drop')) return 'drops';
    if (format.includes('capsule')) return 'capsules';
    return 'tablets';
  }, [selectedVariant]);

  const results = useMemo(() => {
    const totalMg = mgPerUnit * desiredDose;
    return {
      totalMg: parseFloat(totalMg.toFixed(2)),
    };
  }, [mgPerUnit, desiredDose]);

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
          <Pill size={22} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>Oral Dosing Guide</h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calculate your dose for oral administration</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--section-alt, #EEF4FA)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-muted)' }}>Strength per {unitType.slice(0, -1)}:</span>
          <span style={{ color: 'var(--primary)' }}>{mgPerUnit} mg</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Number of {unitType}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" 
              min="1" max="10" step="1" 
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Total Delivered Dose</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {results.totalMg} <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.8 }}>mg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
