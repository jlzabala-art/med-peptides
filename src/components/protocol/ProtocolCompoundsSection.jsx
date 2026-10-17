"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, FileText, ArrowRight, Copy, Check, ShieldCheck } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolCompoundsSection({ items = [], lang = 'en', hasVials = true, isColwayOrCosmetic = false }) {
  const isEs = lang === 'es';
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!items || items.length === 0) return null;

  const isNonPeptide = isColwayOrCosmetic || !hasVials;

  const handleCopyAllCompounds = async () => {
    const listText = items.map((it, idx) => {
      const name = it.name || it.product_name || 'Compound';
      const dose = it.dosage || it.dose || (it.quantity ? `${it.quantity} ${it.unit || (isNonPeptide ? 'Units' : 'Vials')}` : 'Standard Dose');
      const route = it.route || (isNonPeptide ? 'Topical / Oral' : 'Subcutaneous (SubQ)');
      const timing = it.timing || it.schedule || 'Per titration schedule';
      return `${idx + 1}. ${name} — ${dose}\n   • Route: ${route}\n   • Cadence: ${timing}`;
    }).join('\n\n');

    const heading = isNonPeptide
      ? (isEs ? 'FÓRMULAS & PRODUCTOS ACTIVOS DEL PROTOCOLO' : 'ACTIVE THERAPEUTIC FORMULATIONS & PRODUCTS')
      : (isEs ? 'FÓRMULAS & PÉPTIDOS ACTIVOS DEL PROTOCOLO' : 'ACTIVE THERAPEUTIC PEPTIDES & COMPOUNDS');

    const text = `*${heading}*\n\n${listText}\n\n_${isNonPeptide ? 'Atlas Clinical Standards · Dermocosmetic & Nutricosmetic Regimen' : 'Atlas Analytical Standards · Med-Peptides SSOT'}_`;

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
      category={isEs ? 'FORMULACIONES ACTIVAS & PRODUCTOS' : 'THERAPEUTIC FORMULATIONS & PRODUCTS'}
      badge={`${items.length} ${isEs ? 'Formulaciones Activas' : 'Active Formulations'}`}
      badgeVariant="cyan"
      title={isNonPeptide
        ? (isEs ? 'Formulaciones & Principios Activos Incluidos' : 'Included Formulations & Active Ingredients')
        : (isEs ? 'Péptidos & Compuestos Activos Incluidos' : 'Included Therapeutic Compounds')}
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
          <span>{copiedAll ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Fórmulas' : 'Copy Formulations')}</span>
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
            {isNonPeptide
              ? (isEs
                ? 'Especificaciones dermocosméticas y nutracéuticas registradas en el portal europeo CPNP'
                : 'Dermocosmetic and nutricosmetic specifications registered under European CPNP standards')
              : (isEs
                ? 'Especificaciones farmacéuticas y moleculares de alta pureza (>99% HPLC)'
                : 'Analytical and molecular pharmaceutical specifications (>99% HPLC purity)')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            {isNonPeptide ? 'CPNP / EU Compliant' : 'CE-IVDR Certified'}
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
            SSOT Specification
          </span>
        </div>
      </div>

      {/* ── Responsive Compounds List (100% Full-Width Rows, Avoids Grid Orphan Cards) ── */}
      <div
        className="proto-compounds-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%'
        }}
      >
        {items.map((item, idx) => {
          const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
          const itemName = item.name || item.product_name || item.title || 'Compound';
          const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || (isEs ? 'Viales' : 'Vials')}` : null);
          const isCopied = copiedIndex === idx;

          const formatVal = item.format || (isNonPeptide ? (isEs ? 'Fórmula Dermocosmética / Oral' : 'Dermocosmetic / Oral System') : (isEs ? 'Vial Liofilizado Estéril (Polvo)' : 'Lyophilized Sterile API'));
          const routeVal = item.route || (isNonPeptide ? (isEs ? 'Tópica / Cutánea' : 'Topical / Dermal') : (isEs ? 'Subcutánea (SubQ)' : 'Subcutaneous (SubQ)'));
          const timingVal = item.timing || item.schedule || (isEs ? 'Titulación por fases' : 'Phased titration');

          const targetSupplier = item.supplierId || item.supplier || (item.isCosmetic ? 'supplier-colway' : 'supplier-lotusland');
          const targetFormat = (item.format || (item.isCosmetic ? 'topical' : 'vial')).toLowerCase();
          const targetDose = item.selected_strength || item.dosage || item.dose || null;
          const itemUrlParams = new URLSearchParams();
          if (targetSupplier) itemUrlParams.set('supplier', targetSupplier);
          if (targetFormat) itemUrlParams.set('format', targetFormat);
          if (targetDose) itemUrlParams.set('dose', targetDose);
          const fullItemUrl = itemSlug ? `/p/${itemSlug}${itemUrlParams.toString() ? `?${itemUrlParams.toString()}` : ''}` : null;

          return (
            <div
              key={idx}
              className="proto-compound-row"
              style={{
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0284c7',
                borderRadius: '8px',
                padding: '0.85rem 1.15rem',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Left: Icon + Title + Dosage Badge (+ Indications if any) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px', minWidth: '240px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  flexShrink: 0
                }}>
                  <FlaskConical size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.96rem', fontWeight: 800 }}>
                      {itemName}
                    </strong>
                    {itemDosage && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0d9488',
                        background: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {itemDosage}
                      </span>
                    )}
                  </div>
                  {item.indications && (
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.35 }}>
                      {item.indications}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Specifications Ledger (Format, Route, Timing) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                flex: '2 1 340px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '3px 8px',
                  borderRadius: '5px'
                }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{isEs ? 'Formato:' : 'Format:'}</span>
                  <strong style={{ color: '#1e293b' }}>{formatVal}</strong>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '3px 8px',
                  borderRadius: '5px'
                }}>
                  <span style={{ color: '#0369a1', fontWeight: 600 }}>{isEs ? 'Vía:' : 'Route:'}</span>
                  <strong style={{ color: '#0284c7' }}>{routeVal}</strong>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  background: '#faf5ff',
                  border: '1px solid #f3e8ff',
                  padding: '3px 8px',
                  borderRadius: '5px'
                }}>
                  <span style={{ color: '#7e22ce', fontWeight: 600 }}>{isEs ? 'Pauta:' : 'Timing:'}</span>
                  <strong style={{ color: '#6b21a8' }}>{timingVal}</strong>
                </div>
              </div>

              {/* Right: Actions (Monograph Link + Copy Specs) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0
              }}>
                {fullItemUrl ? (
                  <Link
                    href={fullItemUrl}
                    target="_blank"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <FileText size={13} />
                    <span>{isEs ? 'Ficha Técnica' : 'Monograph'}</span>
                    <ArrowRight size={11} />
                  </Link>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
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
                    padding: '4px 9px',
                    borderRadius: '5px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  title={isEs ? 'Copiar especificación del compuesto' : 'Copy compound specs'}
                >
                  {isCopied ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
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
