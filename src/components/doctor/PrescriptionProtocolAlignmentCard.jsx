"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, CheckCircle2, ArrowUpRight, ShieldCheck, Layers, Info } from 'lucide-react';
import { resolvePrescriptionProtocolAlignment } from '@/utils/protocolAlignmentResolver';

export default function PrescriptionProtocolAlignmentCard({ rx, doctor }) {
  const alignment = resolvePrescriptionProtocolAlignment(rx, doctor);

  if (!alignment.hasProtocolMatch) {
    return null; // Don't clutter if it's purely custom non-peptide formulation
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${alignment.borderColor || '#e2e8f0'}`,
        borderRadius: '8px',
        padding: '14px 18px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Top Header: Title, Reference Code, Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: alignment.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: alignment.badgeColor
            }}
          >
            <BookOpen size={14} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Atlas Protocol Cross-Reference:
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 650, color: '#003666' }}>
                {alignment.protocolName}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}
              >
                [{alignment.protocolCode}]
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
              Standard Reference Cycle: {alignment.defaultCycle} · Route: {alignment.standardRoute}
            </div>
          </div>
        </div>

        {/* Alignment Status Pill */}
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            background: alignment.badgeBg,
            color: alignment.badgeColor,
            border: `1px solid ${alignment.borderColor}`,
            padding: '3px 10px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {alignment.status === 'exact_match' ? (
            <CheckCircle2 size={12} color="#16a34a" />
          ) : (
            <Sparkles size={12} color={alignment.badgeColor} />
          )}
          <span>{alignment.statusBadge}</span>
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '10px',
          background: '#f8fafc',
          padding: '10px 14px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '0.76rem'
        }}
      >
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Prescribed by Dr. {doctor?.name || 'Physician'}
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
            {alignment.prescribedApi} — {alignment.prescribedDose}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Atlas Base Pharmacopeia Reference
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 650, color: '#334155', marginTop: '2px' }}>
            {alignment.standardDose}
          </div>
        </div>
      </div>

      {/* Clinical Rationale Note */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#334155',
          lineHeight: 1.45,
          background: alignment.badgeBg,
          border: `1px solid ${alignment.borderColor}`,
          borderRadius: '6px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}
      >
        <Info size={14} style={{ color: alignment.badgeColor, flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: alignment.badgeColor }}>Clinical Assessment: </strong>
          <span>{alignment.calibrationNote}</span>
          {alignment.adjuncts && alignment.adjuncts.length > 0 && (
            <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#475569' }}>
              <strong>Physician Synergistic Adjuncts:</strong>{' '}
              {alignment.adjuncts.map((a) => `${a.name} (${a.dose || 'adjunct'})`).join(', ')}.
            </div>
          )}
        </div>
      </div>

      {/* Action Strip: View Reference Protocol with Active Calibrations Applied */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '2px' }}>
        <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} color="#16a34a" />
          <span>Physician sovereign prescription · All calibrations recognized in system</span>
        </span>

        <a
          href={alignment.protocolUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.72rem',
            fontWeight: 650,
            color: '#1a73e8',
            background: '#ffffff',
            border: '1px solid #dadce0',
            padding: '5px 12px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1a73e8';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#dadce0';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <span>View Protocol with Applied Calibrations</span>
          <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}
