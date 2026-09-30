"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Copy, 
  Check, 
  Microscope 
} from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';

export default function QualityBatchTab({
  product = {},
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609',
  onOpenCoaModal
}) {
  const [copiedBatch, setCopiedBatch] = useState(false);

  const batchId = effectiveBatch || product.batchNumber || 'AS-LOT-PT05-2609';
  const purity = product.purityPercentage || '99.4%';
  const identity = 'LC-MS Confirmed (Single Quadrupole & ESI-TOF)';
  const molecularMass = product.molecularWeight || '1025.16 Da';
  const molecularFormula = product.molecularFormula || 'C50H68N14O10';
  const casNumber = product.casNumber || product.cas || '189691-06-3';
  const labName = product.supplierName || 'Lotusland Analytical Services';

  const handleCopyBatch = () => {
    triggerHaptic('light');
    navigator.clipboard?.writeText(batchId);
    setCopiedBatch(true);
    toast.success('Batch number copied ✓');
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const handleDownloadCoa = () => {
    triggerHaptic('light');
    const coaUrl = `/api/coa/${encodeURIComponent(slug)}?batch=${encodeURIComponent(batchId)}&download=1`;
    window.open(coaUrl, '_blank');
    toast.success('Downloading Certificate of Analysis (CoA) PDF...');
  };

  const batchHistory = [
    { batch: 'AS-LOT-PT05-2609', date: 'September 2026', purity: '99.4%', status: 'Active Release' },
    { batch: 'AS-LOT-PT05-2606', date: 'June 2026', purity: '99.6%', status: 'Archived' },
    { batch: 'AS-LOT-PT05-2603', date: 'March 2026', purity: '99.3%', status: 'Archived' }
  ];

  const batchColumns = [
    {
      header: 'Batch ID',
      field: 'batch',
      width: '35%',
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#003666' }}>
          {item.batch}
        </span>
      )
    },
    {
      header: 'Release Date',
      field: 'date',
      width: '25%',
      render: (item) => <span style={{ color: '#64748b' }}>{item.date}</span>
    },
    {
      header: 'HPLC Purity',
      field: 'purity',
      width: '20%',
      render: (item) => <span style={{ fontWeight: 800, color: '#166534' }}>{item.purity}</span>
    },
    {
      header: 'Release Status',
      field: 'status',
      width: '20%',
      render: (item) => (
        <span style={{
          background: item.status === 'Active Release' ? '#ecfdf5' : '#f1f5f9',
          color: item.status === 'Active Release' ? '#065f46' : '#64748b',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.68rem',
          fontWeight: 700
        }}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="pds-tab-content pds-quality-tab" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── 1. Current Verified Batch Card ── */}
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
              Current Verified Batch Dossier
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              Analytical quality control release data certified by independent HPLC/MS laboratory testing.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} color="#059669" /> QC Released
            </span>
          </div>
        </div>

        {/* Analytical Parameters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Current Batch Code */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Verified Batch Code
              </span>
              <button
                type="button"
                onClick={handleCopyBatch}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                title="Copy batch code"
              >
                {copiedBatch ? <Check size={12} color="#16a34a" /> : <Copy size={12} color="#64748b" />}
              </button>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#003666', marginTop: '2px', fontFamily: 'monospace' }}>
              {batchId}
            </div>
          </div>

          {/* Chromatographic Purity */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
              RP-HPLC Purity
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {purity}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#166534' }}>USP & EP Specification: &ge; 98.0%</span>
          </div>

          {/* Mass Spectrometry Identity */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Identity (LC-MS)
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Confirmed
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{identity}</span>
          </div>

          {/* Molecular Mass */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Molecular Mass (MW)
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', marginTop: '2px', fontFamily: 'monospace' }}>
              {molecularMass}
            </div>
          </div>

          {/* Chemical Formula */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Molecular Formula
            </span>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0284c7', marginTop: '2px', fontFamily: 'monospace' }}>
              {molecularFormula}
            </div>
          </div>

          {/* CAS Registry Number */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              CAS Number
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', marginTop: '2px', fontFamily: 'monospace' }}>
              {casNumber}
            </div>
          </div>
        </div>

        {/* Certificate of Analysis Action Strip */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> Official Certificate of Analysis (CoA)
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#1e3a8a' }}>
              Certified analytical report by {labName} including complete HPLC chromatograms, mass spectrometer spectra, and endotoxin assays.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenCoaModal && (
              <button
                type="button"
                onClick={onOpenCoaModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #93c5fd',
                  color: '#1e40af',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={13} /> View CoA Document
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadCoa}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              <Download size={13} /> Download CoA (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Analytical Methods & Testing Standards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Analytical Methodology
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Reverse-Phase HPLC (RP-HPLC):</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                C18 stationary phase, 4.6 × 250 mm, 5 μm column. Gradient elution with 0.1% TFA in water/acetonitrile at 220 nm UV detection.
              </p>
            </div>

            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Electrospray Ionization MS (ESI-MS):</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                Positive ion mode verification matching theoretical exact mass 1025.16 Da [M+H]+ and [M+2H]2+ multiply-charged species.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Bacterial Endotoxin Testing (LAL Assay):</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                Turbidimetric kinetic assay confirming bacterial endotoxin levels strictly below 0.5 EU/mg.
              </p>
            </div>
          </div>
        </div>

        {/* Batch Traceability History */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Batch Release History
          </h3>

          <DataTable
            columns={batchColumns}
            data={batchHistory.map((item) => ({ ...item, id: item.batch }))}
            keyField="id"
            hideExpandColumn
          />
        </div>
      </section>
    </div>
  );
}
