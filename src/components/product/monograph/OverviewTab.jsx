"use client";

import React from 'react';
import { ArrowRight, Target, ShieldCheck, Activity, Clock, Syringe, Info, Sparkles } from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import { STANDARD_PRESENTATIONS } from './monographCalculationEngine';

/**
 * OverviewTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 3: Overview Workspace
 * Answers: "What is this peptide and what presentations are available?"
 * Components:
 * A. Clinical Identity (Generic, Target/Receptor, Pharmacological summary, FDA reference)
 * B. Available Presentations (ONE compact table)
 * C. Key Clinical Considerations (Concise; deep literature deferred to References)
 */
export default function OverviewTab({
  product = {},
  onNavigateToProtocols
}) {
  const isPt141 = (product.slug || product.canonicalName || product.name || '').toLowerCase().includes('pt-141') || (product.slug || '').toLowerCase().includes('pt141');
  const genericName = product.scientificName || product.chemical_name || product.genericName || (isPt141 ? 'Bremelanotide' : (product.canonicalName || product.name || ''));
  const targetReceptor = product.targetSystem || product.mechanism_of_action || (isPt141 ? 'Central Melanocortin MC3R / MC4R Receptors' : 'Target Receptor / Biomolecular Pathway');
  const pharmacologicalSummary = product.overview_summary || product.summary || product.description || 
    (isPt141 ? 'Synthetic cyclic heptapeptide analogue of alpha-melanocyte-stimulating hormone (α-MSH). Acts centrally across the blood-brain barrier to stimulate hypothalamic melanocortin receptors (primarily MC3R and MC4R), promoting dopamine release in the medial preoptic area to restore sexual desire and arousal without vascular dependency.' : 'Authoritative pharmaceutical technical profile and clinical reference data for therapeutic peptides.');

  const fdaRefProduct = product.referenceBrand ? `${product.referenceBrand} ${product.referenceApprovalYear ? `(Approved ${product.referenceApprovalYear})` : ''}` : (isPt141 ? 'Vyleesi® (bremelanotide injection 1.75 mg/0.3 mL, NDA 210583, FDA Approved June 2019)' : null);

  const clinicalConsiderations = [
    {
      label: 'Primary Indication',
      value: 'Hypoactive Sexual Desire Disorder (HSDD) & Non-vascular Erectile Dysfunction',
      icon: Target
    },
    {
      label: 'Administration Route',
      value: 'Subcutaneous injection (lower abdomen or anterolateral thigh)',
      icon: Syringe
    },
    {
      label: 'Pharmacokinetics',
      value: 'Tmax: 45–60 min • Terminal t½: ~2.7 hours • On-demand duration: 8–12 hours',
      icon: Clock
    },
    {
      label: 'Clinical Dosing Window',
      value: 'Administer at least 45 minutes prior to anticipated activity (max 1 dose/24h, max 8 doses/month)',
      icon: Activity
    }
  ];

  const presentationColumns = [
    {
      header: 'Strength',
      field: 'strengthMg',
      width: '18%',
      render: (row) => (
        <span style={{ fontWeight: 850, color: '#003666', fontFamily: 'monospace', fontSize: '0.90rem' }}>
          {row.strengthMg} mg
        </span>
      )
    },
    {
      header: 'Format',
      field: 'format',
      width: '22%',
      render: (row) => <span style={{ color: '#475569', fontWeight: 600 }}>{row.format}</span>
    },
    {
      header: 'Recommended Diluent',
      field: 'recommendedBacMl',
      width: '24%',
      render: (row) => <span style={{ color: '#0284c7', fontWeight: 700 }}>{row.recommendedBacMl.toFixed(1)} mL BAC Water</span>
    },
    {
      header: 'Resulting Concentration',
      field: 'concentrationMgMl',
      width: '22%',
      render: (row) => <span style={{ color: '#166534', fontWeight: 800, fontFamily: 'monospace' }}>{row.concentrationMgMl.toFixed(1)} mg/mL</span>
    },
    {
      header: 'Route',
      field: 'route',
      width: '14%',
      render: (row) => <span style={{ color: '#334155', fontWeight: 600 }}>{row.route}</span>
    }
  ];

  const presentationData = STANDARD_PRESENTATIONS.map((row) => ({
    ...row,
    id: `strength-${row.strengthMg}`
  }));

  return (
    <div className="pds-tab-content pds-overview-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── A. Clinical Identity Card ── */}
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
          marginBottom: '1rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            A. Clinical Identity
          </h2>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            background: '#f1f5f9',
            color: '#475569',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            Authoritative Monograph Record
          </span>
        </div>

        <div className="pds-clinical-identity-grid">
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
              Generic / Non-Proprietary Name
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {genericName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
              Target Receptor Axis
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0284c7' }}>
              {targetReceptor}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
              FDA Reference Formulation
            </div>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#1e40af',
              background: '#eff6ff',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #bfdbfe'
            }}>
              {fdaRefProduct}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Pharmacological Summary
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#334155',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {pharmacologicalSummary}
          </p>
        </div>
      </section>

      {/* ── B. Available Presentations: ONE Compact Table ── */}
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
              B. Available Presentations & Reconstitution Matrix
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              Standard reconstitution parameters targeting standard 5.0 mg/mL clinical concentration.
            </p>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            ISO 11137 Sterile Lyophilized
          </span>
        </div>

        {/* Unified DataTable Component */}
        <DataTable
          columns={presentationColumns}
          data={presentationData}
          keyField="id"
          hideExpandColumn
        />
      </section>

      {/* ── C. Key Clinical Considerations & CTA ── */}
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
          marginBottom: '1rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            C. Key Clinical Considerations
          </h2>
          <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
            Detailed pharmacopeia & literature available under References
          </span>
        </div>

        {/* Balanced 2x2 Grid (Desktop) and 1-Column (Mobile) */}
        <div className="pds-clinical-considerations-grid">
          {clinicalConsiderations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="pds-consideration-card">
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '7px',
                  borderRadius: '6px',
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={16} color="#003666" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a', lineHeight: 1.45 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Workspace Handoff CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#0284c7" />
              <span>Ready to configure treatment protocols?</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: '#475569' }}>
              Switch into the dedicated protocol workspace to select on-demand or multi-week protocols and compute exact vial requirements.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToProtocols}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#003666',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Explore Clinical Protocols</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
