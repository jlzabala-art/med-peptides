"use client";

import React from 'react';
import { Tag } from '@/lib/icons';
import { RotateCcw } from 'lucide-react';

/**
 * PatientActionBannerCard
 * 
 * Interactive refill or quotation banner specifically tailored for patient view.
 */
export default function PatientActionBannerCard({
  isPatientView = false,
  isDispensed = false,
  isEs = false,
  rxId,
  resolvedPrice,
  onOpenInquiry
}) {
  if (!isPatientView) return null;

  return (
    <div 
      className="rx-card patient-action-banner-card"
      style={{
        background: isDispensed 
          ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' 
          : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
        borderRadius: '12px',
        border: isDispensed ? '1.5px solid #86efac' : '1.5px solid #93c5fd',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 260 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            background: isDispensed ? '#15803d' : '#1d4ed8',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isDispensed ? '0 2px 8px rgba(21, 128, 61, 0.25)' : '0 2px 8px rgba(29, 78, 216, 0.25)'
          }}>
            {isDispensed ? <RotateCcw size={22} /> : <Tag size={22} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isDispensed ? '#dcfce7' : '#dbeafe',
                color: isDispensed ? '#166534' : '#1e40af',
                border: isDispensed ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
              }}>
                {isDispensed 
                  ? (isEs ? 'Tratamiento Suministrado Previamente' : 'Previously Supplied Treatment')
                  : (isEs ? 'Prescripción Lista para Cotización' : 'Prescription Ready for Quotation')}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
                Ref: {rxId}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {isDispensed 
                ? (isEs ? '¿Se está terminando su medicación? Solicite su renovación' : 'Is your treatment running out? Request your refill')
                : (isEs ? 'Solicitar Cotización de Formulación Magistral' : 'Request Official Compounding Quotation')}
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, maxWidth: 620 }}>
              {isDispensed
                ? (isEs 
                    ? 'Su fórmula magistral personalizada fue elaborada y suministrada con anterioridad. Puede solicitar la renovación directa con el laboratorio para garantizar la continuidad ininterrumpida de su tratamiento.' 
                    : 'Your customized compounded formula was previously dispensed. You can request a seamless renewal directly with the laboratory to maintain treatment continuity.')
                : (isEs
                    ? 'Consulte el presupuesto oficial para la preparación en laboratorio especializado de su pauta médica personalizada con envío directo a su domicilio o clínica.'
                    : 'Request the formal compounding quotation for the preparation and direct delivery of your physician-prescribed clinical formula.')}
            </p>
          </div>
        </div>

        {/* Previous Price Box (Dispensed) and Action trigger */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          gap: '0.75rem',
          background: '#ffffff',
          padding: '0.85rem 1.15rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          alignSelf: 'stretch',
          justifyContent: 'center',
          minWidth: 200
        }}>
          {isDispensed && resolvedPrice?.formatted && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Precio Suministrado Anteriormente' : 'Previously Supplied Price'}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {resolvedPrice.formatted}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                ✓ {isEs ? 'Formulación e IVA incluidos' : 'Compounding & VAT included'}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onOpenInquiry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              background: isDispensed ? '#15803d' : '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              width: '100%',
              boxShadow: isDispensed ? '0 2px 8px rgba(21, 128, 61, 0.3)' : '0 2px 8px rgba(29, 78, 216, 0.3)',
              transition: 'transform 0.15s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isDispensed ? <RotateCcw size={16} /> : <Tag size={16} />}
            <span>
              {isDispensed 
                ? (isEs ? 'Renovar Prescripción' : 'Renew Prescription') 
                : (isEs ? 'Pedir Cotización' : 'Request Quotation')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
