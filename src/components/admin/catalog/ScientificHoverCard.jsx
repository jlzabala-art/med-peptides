"use client";

import React, { useState } from 'react';
import { Dna, ShieldCheck, Info, Sparkles } from '@/lib/icons';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';

export default function ScientificHoverCard({ product, children }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!product) return children;

  const sci = product.scientificData || {};
  const completeness = calculateProductCompleteness(product);
  const { score, color, statusLabel } = completeness;

  const formula = typeof sci.molecularFormula === 'string' ? sci.molecularFormula : (typeof product.molecularFormula === 'string' ? product.molecularFormula : null);
  const weight = (typeof sci.molecularWeight === 'string' || typeof sci.molecularWeight === 'number') ? sci.molecularWeight : ((typeof product.molecularWeight === 'string' || typeof product.molecularWeight === 'number') ? product.molecularWeight : null);
  const cas = typeof sci.casNumber === 'string' ? sci.casNumber : (typeof product.casNumber === 'string' ? product.casNumber : null);
  const cid = typeof sci.pubchemCid === 'string' ? sci.pubchemCid : (typeof product.pubchemCid === 'string' ? product.pubchemCid : null);
  const purity = typeof product.purity === 'string' ? product.purity : '≥ 99% (HPLC Verified)';
  
  const rawMoa = sci.mechanismOfAction || product.mechanismOfAction || product.description || null;
  const mechanism = typeof rawMoa === 'string' 
    ? rawMoa 
    : (rawMoa && typeof rawMoa === 'object' ? (rawMoa.summary || rawMoa.desc || rawMoa.mechanism || '') : '');

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            marginBottom: '8px',
            width: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: '0.8rem',
            color: '#1e293b'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', pb: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Dna size={16} style={{ color: '#0f766e' }} />
              {product.canonicalName || product.name}
            </div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: color,
              backgroundColor: '#f8fafc',
              border: `1px solid ${color}40`,
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {score}% ({statusLabel})
            </span>
          </div>

          {/* Scientific Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.65rem' }}>
            {formula && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Formula:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{formula}</span>
              </div>
            )}
            {weight && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Molecular Weight:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{weight}</span>
              </div>
            )}
            {cas && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>CAS Registry:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{cas}</span>
              </div>
            )}
            {purity && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Purity Standard:</span>
                <span style={{ fontWeight: 700, color: '#0f766e' }}>{purity}</span>
              </div>
            )}
          </div>

          {/* Mechanism of Action */}
          {mechanism && (
            <div style={{
              fontSize: '0.74rem',
              color: '#475569',
              lineHeight: '1.35',
              backgroundColor: '#f8fafc',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              borderLeft: '3px solid #0f766e'
            }}>
              {mechanism.length > 130 ? `${mechanism.slice(0, 130)}...` : mechanism}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
