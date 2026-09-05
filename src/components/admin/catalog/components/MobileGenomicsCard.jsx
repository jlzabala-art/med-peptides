"use client";

import React, { useState } from 'react';
import { Eye, Edit3, Dna, ChevronDown, ChevronUp, Copy, Check } from '@/lib/icons';

const PRIORITY_THEME = {
  A: {
    borderLeft: '4px solid #10b981',
    bg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    text: '#15803d',
    dot: '🟢',
    label: 'Priority A (First-line)'
  },
  B: {
    borderLeft: '4px solid #f59e0b',
    bg: '#fffbeb',
    badgeBorder: '#fde68a',
    text: '#b45309',
    dot: '🟡',
    label: 'Priority B (Second-line)'
  },
  C: {
    borderLeft: '4px solid #3b82f6',
    bg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    text: '#1d4ed8',
    dot: '🔵',
    label: 'Priority C (Supportive)'
  }
};

export default function MobileGenomicsCard({
  row,
  onSelectProduct,
  onEditPriority,
  supplierIdToName,
  onRowClick
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!row) return null;

  const programs = Array.isArray(row.programs) ? row.programs : [];
  const hasA = programs.some(p => (p.priority || '').toUpperCase() === 'A');
  const hasB = programs.some(p => (p.priority || '').toUpperCase() === 'B');
  const topPri = hasA ? 'A' : (hasB ? 'B' : 'C');
  const theme = PRIORITY_THEME[topPri] || PRIORITY_THEME.C;

  const isApi = row.category === 'raw_material' || 
                row.category === 'api' || 
                row.productType === 'raw_material' ||
                row.type === 'raw_material';

  const casNumber = row.scientificData?.casNumber || row.casNumber || row.cas;
  const formula = row.scientificData?.molecularFormula || row.molecularFormula || row.formula;
  const supplierName = supplierIdToName?.[row.supplierId] || row.supplierName || row.supplier || 'Fagron Iberia';
  const variantCount = Array.isArray(row.variants) && row.variants.length > 0 ? row.variants.length : (row.variantsCount || 1);

  const routeLabel = row.administration_route || 
                     row.attributes?.route || 
                     (isApi ? 'Topical / Compounding' : 'Topical / Oral');

  const handleCopyCas = (e) => {
    e.stopPropagation();
    if (!casNumber) return;
    navigator.clipboard?.writeText(casNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="mobile-genomics-card"
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        borderLeft: theme.borderLeft,
        marginBottom: '12px',
        padding: '12px 14px',
        boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onClick={() => onRowClick?.(row) || onSelectProduct?.(row)}
    >
      {/* ── Top Header: Title, Badges & Quick Action Buttons ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
              {row.name || row.canonicalName}
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '4px',
              background: isApi ? '#fef3c7' : '#eff6ff',
              color: isApi ? '#92400e' : '#1d4ed8',
              border: `1px solid ${isApi ? '#fde68a' : '#bfdbfe'}`,
              letterSpacing: '0.04em'
            }}>
              {isApi ? 'BULK API' : 'FINISHED'}
            </span>
          </div>

          {/* Subtitle: CAS & Formula */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', marginTop: '3px', flexWrap: 'wrap' }}>
            {casNumber ? (
              <span 
                onClick={handleCopyCas}
                title="Click to copy CAS"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#475569', fontWeight: 500 }}
              >
                CAS: <strong>{casNumber}</strong>
                {copied ? <Check size={11} color="#15803d" /> : <Copy size={11} style={{ opacity: 0.6 }} />}
              </span>
            ) : (
              <span>CAS: Available on Request</span>
            )}
            {formula && (
              <>
                <span>•</span>
                <span style={{ fontFamily: 'monospace', color: '#0369a1', fontWeight: 600 }}>{formula}</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons on upper right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <button
            type="button"
            title="View Product Offers & Pricing"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct?.(row);
            }}
            style={{
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0284c7',
              cursor: 'pointer'
            }}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            title="Edit Genomic Priorities"
            onClick={(e) => {
              e.stopPropagation();
              const firstSlug = programs[0]?.slug || programs[0]?.id;
              onEditPriority?.(row, firstSlug);
            }}
            style={{
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#15803d',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={15} />
          </button>
        </div>
      </div>

      {/* ── Priority Badge Banner ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', backgroundColor: theme.bg, border: `1px solid ${theme.badgeBorder}`, color: theme.text, fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
          <span>{theme.dot}</span>
          <span>{theme.label}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.74rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer'
          }}
        >
          <span>{expanded ? 'Hide Details' : 'Details'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Recommended Genetic Panels ── */}
      <div>
        <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
          Recommended by Genetic Panels ({programs.length})
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {programs.length > 0 ? (
            programs.map((prog, idx) => {
              const pri = (prog.priority || 'C').toUpperCase();
              const pTheme = PRIORITY_THEME[pri] || PRIORITY_THEME.C;
              const name = (prog.name || prog.id || 'Test')
                .replace(/^Fagron Genomics\s*\|\s*/i, '')
                .replace(/Test/i, 'Test™');

              return (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPriority?.(row, prog.slug || prog.id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: pTheme.bg,
                    border: `1px solid ${pTheme.badgeBorder}`,
                    color: pTheme.text,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title={`Edit priority in ${name}`}
                >
                  <Dna size={11} style={{ opacity: 0.8 }} />
                  <span>{name}</span>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    padding: '0 4px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    marginLeft: '2px'
                  }}>
                    {pri}
                  </span>
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>General Genomic Panel</span>
          )}
        </div>
      </div>

      {/* ── 2-Column Info Strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '8px 10px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #f1f5f9',
        fontSize: '0.76rem'
      }}>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Route & Form
          </span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            {routeLabel}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Supply & Formats
          </span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            {supplierName} · {variantCount} Var{variantCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Expandable Section ── */}
      {expanded && (
        <div style={{
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.75rem',
          color: '#475569',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {row.scientificData?.iupacName && (
            <div>
              <strong style={{ color: '#0f172a' }}>IUPAC Name: </strong>
              <span style={{ wordBreak: 'break-all' }}>{row.scientificData.iupacName}</span>
            </div>
          )}
          {row.compoundingRules?.recommendedConcentration && (
            <div>
              <strong style={{ color: '#0f172a' }}>Compounding Concentration: </strong>
              <span>{row.compoundingRules.recommendedConcentration}</span>
            </div>
          )}
          {row.compoundingRules?.optimalPh && (
            <div>
              <strong style={{ color: '#0f172a' }}>Optimal pH Stability: </strong>
              <span>{row.compoundingRules.optimalPh}</span>
            </div>
          )}
          {row.storageConditions && (
            <div>
              <strong style={{ color: '#0f172a' }}>Storage: </strong>
              <span>{row.storageConditions}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
