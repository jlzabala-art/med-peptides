'use client';

import React from 'react';
import { X, CheckCircle2, AlertCircle, Droplets, Clock, Sparkles, Layers, ShieldCheck, ArrowRight, Plus } from 'lucide-react';

export default function ClinicalProtocolDrawer({
  isOpen,
  onClose,
  protocol,
  onAddProtocol,
  formatPrice,
  currency = 'USD',
  currencySymbol = '$',
  isDistributor = false
}) {
  if (!isOpen || !protocol) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.25rem' }}>{protocol.icon}</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: protocol.accentBg || '#f0f9ff',
                color: protocol.accent || '#0284c7',
                border: `1px solid ${protocol.accent || '#0284c7'}40`,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {protocol.categoryName || 'Synergistic Protocol'}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                ≥99.0% HPLC
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {protocol.name}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {protocol.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Key Formulations Included */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Formulations Included in Cycle
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {protocol.peptides?.map((pep, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 750, fontSize: '0.90rem', color: '#0f172a' }}>
                      {pep.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {pep.dosage} · 10R Borosilicate Lyophilized Vial · {pep.role}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a', fontSize: '0.90rem' }}>
                      {pep.unitPrice ? formatPrice(pep.unitPrice) : 'Included'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 650 }}>
                      10-Pack: {pep.pack10Price ? formatPrice(pep.pack10Price) : 'Vol. Discount'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biological Mechanism & Synergy */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles size={16} color={protocol.accent || '#0284c7'} />
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                Biological Mechanism & Synergy Rationale
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.55 }}>
              {protocol.mechanism}
            </p>
          </div>

          {/* Posology & Administration Schedule */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Clock size={16} color="#16a34a" />
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                Recommended Clinical Posology & Cycle Schedule
              </h4>
            </div>
            <div style={{ fontSize: '0.80rem', color: '#14532d', lineHeight: 1.55 }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Cycle Length:</strong> {protocol.cycleDuration || '6 to 8 Consecutive Weeks'}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Administration:</strong> {protocol.administration || 'Subcutaneous (SQ) injection'}
              </div>
              <div>
                <strong>Dosing Frequency:</strong> {protocol.posology}
              </div>
            </div>
          </div>

          {/* Reconstitution & Cold Storage */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Droplets size={16} color="#0284c7" />
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>
                Reconstitution & Cold Chain Handling
              </h4>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.5 }}>
              Reconstitute each lyophilized vial with <strong>{protocol.bacWater || '2.0 mL'}</strong> of Bacteriostatic 0.9% Benzyl Alcohol Water. Swirl gently without shaking. Store reconstituted solution refrigerated at <strong>2°C – 8°C</strong>. Stable for 30–45 days after reconstitution.
            </div>
          </div>

          {/* Clinical Expected Outcomes */}
          {protocol.outcomes && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                Observed Clinical Endpoints
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                {protocol.outcomes.map((out, oIdx) => (
                  <li key={oIdx} style={{ marginBottom: '3px' }}>{out}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => {
              onAddProtocol(protocol, false);
              onClose();
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 750,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            <span>Add Single Cycle Formulations to Proforma</span>
          </button>

          <button
            onClick={() => {
              onAddProtocol(protocol, true);
              onClose();
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #047857',
              background: '#ecfdf5',
              color: '#047857',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            <span>Add Box of 10 Packs (Clinical Volume Tier)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
