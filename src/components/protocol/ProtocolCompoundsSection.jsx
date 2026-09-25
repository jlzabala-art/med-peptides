"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, FileText, ArrowRight, Copy, Check, ShieldCheck } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolCompoundsSection({ items = [], lang = 'en' }) {
  const isEs = lang === 'es';
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!items || items.length === 0) return null;

  const handleCopyAllCompounds = async () => {
    const listText = items.map((it, idx) => {
      const name = it.name || it.product_name || 'Compound';
      const dose = it.dosage || it.dose || (it.quantity ? `${it.quantity} ${it.unit || 'Vials'}` : 'Standard Dose');
      const route = it.route || 'Subcutaneous (SubQ)';
      const timing = it.timing || it.schedule || 'Per titration schedule';
      return `${idx + 1}. ${name} — ${dose}\n   • Route: ${route}\n   • Cadence: ${timing}`;
    }).join('\n\n');

    const text = `*${isEs ? 'FÓRMULAS & PÉPTIDOS ACTIVOS DEL PROTOCOLO' : 'ACTIVE THERAPEUTIC PEPTIDES & COMPOUNDS'}*\n\n${listText}\n\n_Atlas Analytical Standards · Med-Peptides SSOT_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      toast.success(isEs ? 'Especificaciones copiadas al portapapeles ✓' : 'Compound specs copied to clipboard ✓');
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopySingleCompound = async (item, idx) => {
    const name = item.name || item.product_name || 'Compound';
    const dose = item.dosage || item.dose || 'Standard Dose';
    const route = item.route || 'Subcutaneous (SubQ)';
    const timing = item.timing || item.schedule || 'Per titration schedule';
    const text = `*${name} (${dose})*\n• Route: ${route}\n• Schedule: ${timing}\n\n_Atlas Clinical Standards_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      toast.success(isEs ? `${name} copiado ✓` : `${name} copied ✓`);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <PublicSectionCard
      id="included-compounds"
      icon={FlaskConical}
      category={isEs ? 'FORMULACIONES ACTIVAS & API' : 'THERAPEUTIC FORMULATIONS & API'}
      badge={`${items.length} ${isEs ? 'Compuestos Activos' : 'Active Compounds'}`}
      badgeVariant="cyan"
      title={isEs ? 'Péptidos & Compuestos Activos Incluidos' : 'Included Therapeutic Compounds'}
      rightAction={
        <button
          type="button"
          onClick={handleCopyAllCompounds}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
          title={isEs ? 'Copiar resumen de compuestos al portapapeles' : 'Copy compound specs to clipboard'}
        >
          {copiedAll ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          <span>{copiedAll ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Fórmulas' : 'Copy API Specs')}</span>
        </button>
      }
    >
      {/* ── Subtitle / Google Cloud Ledger Standards ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#0284c7" />
          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
            {isEs
              ? 'Especificaciones farmacéuticas y moleculares de alta pureza (>99% HPLC)'
              : 'Analytical and molecular pharmaceutical specifications (>99% HPLC purity)'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            CE-IVDR Certified
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
            SSOT Specification
          </span>
        </div>
      </div>

      {/* ── Responsive Compounds Grid (Laptop 3-Col/2-Col, Mobile 1-Col) ── */}
      <div
        className="proto-compounds-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1rem'
        }}
      >
        {items.map((item, idx) => {
          const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
          const itemName = item.name || item.product_name || item.title || 'Compound';
          const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || (isEs ? 'Viales' : 'Vials')}` : null);
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              className="proto-compound-card"
              style={{
                border: '1px solid #e2e8f0',
                borderTop: '3px solid #0284c7',
                borderRadius: '10px',
                padding: '1.20rem',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'box-shadow 0.15s ease, border-color 0.15s ease'
              }}
            >
              <div>
                {/* Header: Title + Dosage Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                      flexShrink: 0
                    }}>
                      <FlaskConical size={14} />
                    </div>
                    <strong style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
                      {itemName}
                    </strong>
                  </div>
                  {itemDosage && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      background: '#f0fdfa',
                      border: '1px solid #ccfbf1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {itemDosage}
                    </span>
                  )}
                </div>

                {/* Key-Value Specifications Ledger */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      {isEs ? 'Formulación:' : 'Formulation:'}
                    </span>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>
                      {item.format || (isEs ? 'Vial Liofilizado Estéril (Polvo)' : 'Lyophilized Sterile API')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      {isEs ? 'Vía de Entrega:' : 'Administration Route:'}
                    </span>
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>
                      {item.route || (isEs ? 'Subcutánea (SubQ)' : 'Subcutaneous (SubQ)')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      {isEs ? 'Cronograma / Cadencia:' : 'Cadence / Timing:'}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '65%' }}>
                      {item.timing || item.schedule || (isEs ? 'Titulación por fases' : 'Phased titration')}
                    </span>
                  </div>
                </div>

                {/* Indications / Mechanism snippet if available */}
                {item.indications && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    margin: '0 0 1rem 0',
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                    borderLeft: '2px solid #cbd5e1',
                    paddingLeft: '8px'
                  }}>
                    {item.indications}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {itemSlug ? (() => {
                  const targetSupplier = item.supplierId || item.supplier || (item.isCosmetic ? 'supplier-colway' : 'supplier-lotusland');
                  const targetFormat = (item.format || (item.isCosmetic ? 'topical' : 'vial')).toLowerCase();
                  const targetDose = item.selected_strength || item.dosage || item.dose || null;
                  const itemUrlParams = new URLSearchParams();
                  if (targetSupplier) itemUrlParams.set('supplier', targetSupplier);
                  if (targetFormat) itemUrlParams.set('format', targetFormat);
                  if (targetDose) itemUrlParams.set('dose', targetDose);
                  const fullItemUrl = `/p/${itemSlug}${itemUrlParams.toString() ? `?${itemUrlParams.toString()}` : ''}`;

                  return (
                    <Link
                      href={fullItemUrl}
                      target="_blank"
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FileText size={13} />
                      <span>{isEs ? 'Ver Ficha Técnica Atlas' : 'View Technical Monograph'}</span>
                      <ArrowRight size={11} />
                    </Link>
                  );
                })() : (
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    {isEs ? 'Formulación Clínica' : 'Clinical Formulation'}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleCopySingleCompound(item, idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title={isEs ? 'Copiar especificación del compuesto' : 'Copy compound specs'}
                >
                  {isCopied ? <Check size={11} style={{ color: '#16a34a' }} /> : <Copy size={11} />}
                  <span>{isCopied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}
