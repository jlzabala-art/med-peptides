"use client";

import React from 'react';
import { Sparkles, Shield, Activity, Zap, Heart, Check } from '@/lib/icons';

export const CLINICAL_REGIMENS = [
  {
    id: 'reg-glp1-metabolic',
    name: 'GLP-1 Metabolic Titration',
    tagline: 'Semaglutide 5mg + Companion Diluent',
    badge: 'Metabolic & Weight',
    color: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
    icon: Activity,
    compounds: [
      {
        canonicalName: 'Semaglutide 5mg',
        dosage: '0.25mg / week (Titration W1-W4)',
        format: 'Lyophilized Sterile Vial',
        route: 'Subcutaneous (SC)',
        quantity: 1,
        unitPrice: 165,
        reconstitutionMl: 2,
      },
      {
        canonicalName: 'Bacteriostatic Water 30ml',
        dosage: 'Reconstitution Diluent',
        format: 'Sterile Diluent Vial',
        route: 'Diluent',
        quantity: 1,
        unitPrice: 15,
      },
    ],
  },
  {
    id: 'reg-tissue-repair',
    name: 'Tissue Repair & Anti-Inflammatory Duo',
    tagline: 'BPC-157 5mg + TB-500 5mg + Diluent',
    badge: 'Soft Tissue & Joint',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    icon: Shield,
    compounds: [
      {
        canonicalName: 'BPC-157 5mg',
        dosage: '250mcg BID (SC)',
        format: 'Lyophilized Sterile Vial',
        route: 'Subcutaneous (SC)',
        quantity: 1,
        unitPrice: 65,
        reconstitutionMl: 2.5,
      },
      {
        canonicalName: 'TB-500 5mg (Thymosin Beta-4)',
        dosage: '2.5mg 2x/week (SC)',
        format: 'Lyophilized Sterile Vial',
        route: 'Subcutaneous (SC)',
        quantity: 1,
        unitPrice: 75,
        reconstitutionMl: 2,
      },
      {
        canonicalName: 'Bacteriostatic Water 30ml',
        dosage: 'Reconstitution Diluent',
        format: 'Sterile Diluent Vial',
        route: 'Diluent',
        quantity: 1,
        unitPrice: 15,
      },
    ],
  },
  {
    id: 'reg-nad-longevity',
    name: 'Cellular Longevity & NAD+ Restoration',
    tagline: 'NAD+ 500mg Lyophilized + Diluent',
    badge: 'Mitochondrial Energy',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#e9d5ff',
    icon: Zap,
    compounds: [
      {
        canonicalName: 'NAD+ (Nicotinamide Adenine Dinucleotide) 500mg',
        dosage: '50mg - 100mg 2x/week (SC/IM)',
        format: 'Lyophilized Sterile Vial',
        route: 'Subcutaneous or IM',
        quantity: 1,
        unitPrice: 110,
        reconstitutionMl: 5,
      },
      {
        canonicalName: 'Bacteriostatic Water 30ml',
        dosage: 'Reconstitution Diluent',
        format: 'Sterile Diluent Vial',
        route: 'Diluent',
        quantity: 1,
        unitPrice: 15,
      },
    ],
  },
  {
    id: 'reg-erdmann-tricho',
    name: 'Follicular Biostimulation & Scalp Regimen',
    tagline: 'GHK-Cu 50mg + Zn-Thymulin 10mg + Diluent',
    badge: 'Trichology Signature',
    color: '#c026d3',
    bg: '#fdf4ff',
    border: '#f5d0fe',
    icon: Sparkles,
    compounds: [
      {
        canonicalName: 'GHK-Cu Copper Tripeptide 50mg',
        dosage: '1.5mg daily or topical micro-dose',
        format: 'Lyophilized Sterile Vial',
        route: 'Subcutaneous or Topical',
        quantity: 1,
        unitPrice: 55,
        reconstitutionMl: 3,
      },
      {
        canonicalName: 'Zn-Thymulin 10mg',
        dosage: 'Daily evening scalp solution',
        format: 'Lyophilized Sterile Vial',
        route: 'Topical / SC',
        quantity: 1,
        unitPrice: 65,
        reconstitutionMl: 2,
      },
      {
        canonicalName: 'Bacteriostatic Water 30ml',
        dosage: 'Reconstitution Diluent',
        format: 'Sterile Diluent Vial',
        route: 'Diluent',
        quantity: 1,
        unitPrice: 15,
      },
    ],
  },
];

export default function QuickClinicalRegimens({ onApplyRegimen, isDoctor = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#0d9488" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1-Tap Clinical Regimens
          </span>
        </div>
        <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
          Compound + Diluent Paired
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '8px',
        }}
      >
        {CLINICAL_REGIMENS.map((reg) => {
          const IconComp = reg.icon;
          return (
            <div
              key={reg.id}
              onClick={() => onApplyRegimen?.(reg)}
              style={{
                backgroundColor: reg.bg,
                border: `1.5px solid ${reg.border}`,
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                touchAction: 'manipulation',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                <span
                  style={{
                    backgroundColor: '#ffffff',
                    color: reg.color,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    border: `1px solid ${reg.border}`,
                  }}
                >
                  {reg.badge}
                </span>
                <IconComp size={15} color={reg.color} />
              </div>

              <div>
                <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                  {reg.name}
                </h5>
                <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.2 }}>
                  {reg.tagline}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${reg.border}`, paddingTop: '5px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: reg.color }}>
                  +{reg.compounds.length} items
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a' }}>
                  Add ⚡
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
