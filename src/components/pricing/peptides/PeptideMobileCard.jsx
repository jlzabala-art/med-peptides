'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Plus,
  Box,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  Droplets,
  Layers,
  ArrowRight,
  Mail,
  FileText
} from 'lucide-react';
import { getPeptideClinicalSummary } from '@/constants/peptidePharmacology';
import { parsePeptideBlendDisplay } from '@/components/pricing/PeptidePricePdfPreviewModal';

/**
 * Dedicated Mobile Card for Peptide Price Schedule
 * (Rule #23: Mobile-First UX Compatibility)
 * Displays each peptide with guaranteed side-by-side pricing tiles (Single Vial vs Pack ×10),
 * 3-action utility toolbar (Posology AI, Specs, Inquire), and interactive Reconstitution Guide.
 */
export default function PeptideMobileCard({
  row,
  handleAddToCart,
  updateItemQuantity,
  cartItems = {},
  formatPrice,
  lang = 'en',
  onOpenSpecs,
  onOpenAi,
  onFilterByPeptide,
  onInquire
}) {
  const [isClinicalExpanded, setIsClinicalExpanded] = useState(false);
  const isEs = lang === 'es';
  const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
  const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
  const discountPct = Math.max(10, Math.round((1 - (p10 / (row.unitPrice * 10))) * 100));

  const cleanDose = (row.dosage || '').replace(/[\s+]/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const slug = row.slug || row.productId || row.id;
  const specsUrl = `/p/${slug}?dose=${cleanDose}`;

  const inCart1x = cartItems[row.id]?.quantity1x || 0;
  const inCart10x = cartItems[row.id]?.quantity10x || 0;
  const hasCart = inCart1x > 0 || inCart10x > 0;

  const clinical = getPeptideClinicalSummary(row.productName, row.therapeuticClass || row.category, lang);
  const blendInfo = parsePeptideBlendDisplay(row.productName, row.dosage);

  return (
    <div style={{
      background: '#ffffff',
      border: hasCart ? '1.5px solid #1a73e8' : '1px solid #dadce0',
      borderRadius: '8px',
      padding: '12px 14px',
      marginBottom: '10px',
      boxShadow: hasCart ? '0 2px 8px rgba(26,115,232,0.18)' : '0 1px 3px rgba(60,64,67,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box'
    }}>
      {/* Top Header: # Item + Compound Name + Dosage + Specs Link + Category + FDA Badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: Item #, Name, Dosage pill & Specs button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {row.itemNumber && (
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#5f6368',
                background: '#f1f3f4',
                border: '1px solid #e8eaed',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                flexShrink: 0
              }}>
                #{row.itemNumber}
              </span>
            )}
            <Link
              href={specsUrl}
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenSpecs && onOpenSpecs(row)}
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#1a73e8',
                textDecoration: 'none',
                wordBreak: 'break-word'
              }}
            >
              {blendInfo.isBlend ? (blendInfo.titleLine || blendInfo.mainTitle || row.productName) : row.productName}
            </Link>
            {row.dosage && (
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                background: '#e8f0fe',
                color: '#1a73e8',
                border: '1px solid #c2e7ff',
                padding: '2px 7px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                {blendInfo.isBlend ? (blendInfo.dosageMain || blendInfo.primaryDose || row.dosage) : row.dosage}
              </span>
            )}
            {/* Specs ↗ Quick Link */}
            <Link
              href={specsUrl}
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenSpecs && onOpenSpecs(row)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#1a73e8',
                background: '#ffffff',
                border: '1px solid #c2e7ff',
                padding: '2px 7px',
                borderRadius: '4px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title={isEs ? `Abrir ficha técnica y estructura 3D de ${row.productName}` : `Open clinical specs & 3D structure for ${row.productName}`}
            >
              <FileText size={11} />
              <span>{isEs ? 'Ficha ↗' : 'Specs ↗'}</span>
            </Link>
          </div>

          {/* Row 2: Category Pill + FDA Regulatory Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {/* Category Badge Pill with Icon & Theme Colors */}
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 650,
              color: row?.categoryMeta?.color || '#0284c7',
              background: row?.categoryMeta?.bg || '#f0f9ff',
              border: `1px solid ${row?.categoryMeta?.border || '#bae6fd'}`,
              padding: '1px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span>{row?.categoryMeta?.icon || '•'}</span>
              <span>{row?.categoryMeta?.label || row.therapeuticClass || (isEs ? 'Péptido Clínico' : 'Clinical Peptide')}</span>
            </span>

            {/* FDA Regulatory Status Badge (100% parity with laptop) */}
            {row.fdaStatus && (
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: row.fdaStatus.colorScheme?.text || '#065f46',
                background: row.fdaStatus.colorScheme?.bg || '#ecfdf5',
                border: `1px solid ${row.fdaStatus.colorScheme?.border || '#6ee7b7'}`,
                padding: '1px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span>{row.fdaStatus.colorScheme?.icon || '🛡️'}</span>
                <span>
                  {isEs
                    ? (row.fdaBucket === 'fda_503a'
                        ? '503A Magistral ✓'
                        : row.fdaBucket === 'fda_approved'
                          ? 'Aprobado FDA ✓'
                          : row.fdaBucket === 'clinical_ind'
                            ? 'Fase Clínica IND'
                            : 'Estándar Analítico')
                    : (row.fdaStatus.shortBadge || '503A')}
                </span>
              </span>
            )}
          </div>

          {/* Row 3: Blend composition breakdown (if blend) */}
          {blendInfo.isBlend && blendInfo.compositionLine && (
            <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '4px' }}>
              {blendInfo.compositionLine}
            </div>
          )}

          {/* Row 4: Pharmaceutical Presentation & Purity Subtitle (100% parity with laptop) */}
          <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{isEs ? 'Vial Liofilizado Estéril (10R)' : 'Sterile Lyophilized Vial (10R)'}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#137333', fontWeight: 650, whiteSpace: 'nowrap' }}>{isEs ? '≥99.0% Pureza HPLC' : '≥99.0% HPLC Purity'}</span>
          </div>
        </div>
      </div>

      {/* In-Cart Active Badge */}
      {hasCart && (
        <div style={{
          background: '#e8f0fe',
          border: '1px solid #c2e7ff',
          borderRadius: '4px',
          padding: '5px 9px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#1a73e8',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Check size={12} />
          <span>{isEs ? 'En Proforma:' : 'In Proforma:'} {inCart1x > 0 ? `${inCart1x} vial${inCart1x > 1 ? (isEs ? 'es' : 's') : ''}` : ''}{inCart1x > 0 && inCart10x > 0 ? ' + ' : ''}{inCart10x > 0 ? `${inCart10x} ${isEs ? 'pack' : 'pack'}${inCart10x > 1 ? 's' : ''} (×10)` : ''}</span>
        </div>
      )}

      {/* 2-Column Action Tiles: Single Vial vs Pack of 10 */}
      <div className="peptide-mobile-tiles-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '8px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        {/* Tile 1: Single Vial */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dadce0',
          borderRadius: '6px',
          padding: '9px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ fontSize: '0.64rem', color: '#5f6368', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEs ? 'Vial Individual (1x)' : 'Single Vial (1x)'}
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#202124', fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap' }}>
              {formatPrice ? formatPrice(row.unitPrice) : `$${row.unitPrice}`}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEs ? 'por vial estéril' : 'per sterile vial'}
            </div>
          </div>

          {inCart1x > 0 && typeof updateItemQuantity === 'function' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '40px',
              background: '#e8f0fe',
              border: '1.5px solid #1a73e8',
              borderRadius: '6px',
              padding: '0 4px',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => updateItemQuantity(row.id, '1x', -1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#ffffff', borderRadius: '4px', color: '#1a73e8', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}
                title={isEs ? 'Restar 1 vial' : 'Remove 1 vial'}
              >
                -
              </button>
              <div style={{ textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: '0.90rem', color: '#1a73e8', fontFamily: 'monospace' }}>
                  {inCart1x}
                </span>
                <span style={{ fontSize: '0.60rem', color: '#1a73e8', display: 'block', lineHeight: 1 }}>
                  {isEs ? 'en carro' : 'in cart'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateItemQuantity(row.id, '1x', 1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#1a73e8', borderRadius: '4px', color: '#ffffff', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}
                title={isEs ? 'Sumar 1 vial' : 'Add 1 vial'}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAddToCart && handleAddToCart(row, '1x')}
              style={{
                width: '100%',
                minHeight: '40px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#ffffff',
                border: '1.5px solid #1a73e8',
                borderRadius: '6px',
                color: '#1a73e8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(26,115,232,0.08)',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
            >
              <Plus size={13} style={{ flexShrink: 0 }} />
              <span>1 Vial</span>
            </button>
          )}
        </div>

        {/* Tile 2: Pack of 10 */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '9px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
              <span style={{ fontSize: '0.64rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {isEs ? 'Pack de 10' : 'Pack of 10'}
              </span>
              <span style={{
                fontSize: '0.58rem',
                fontWeight: 800,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #86efac',
                padding: '1px 3px',
                borderRadius: '3px',
                whiteSpace: 'nowrap'
              }}>
                -{discountPct}%
              </span>
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#15803d', fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap' }}>
              {formatPrice ? formatPrice(p10) : `$${p10.toFixed(2)}`}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#166534', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ({formatPrice ? formatPrice(perUnit) : `$${perUnit.toFixed(2)}`}/vial)
            </div>
          </div>

          {inCart10x > 0 && typeof updateItemQuantity === 'function' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '40px',
              background: '#dcfce7',
              border: '1.5px solid #16a34a',
              borderRadius: '6px',
              padding: '0 4px',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => updateItemQuantity(row.id, '10x', -1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#ffffff', borderRadius: '4px', color: '#16a34a', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}
                title={isEs ? 'Restar 1 pack ×10' : 'Remove 1 pack ×10'}
              >
                -
              </button>
              <div style={{ textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: '0.90rem', color: '#15803d', fontFamily: 'monospace' }}>
                  {inCart10x}×10
                </span>
                <span style={{ fontSize: '0.60rem', color: '#15803d', display: 'block', lineHeight: 1 }}>
                  {isEs ? 'en carro' : 'in cart'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateItemQuantity(row.id, '10x', 1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#16a34a', borderRadius: '4px', color: '#ffffff', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}
                title={isEs ? 'Sumar 1 pack ×10' : 'Add 1 pack ×10'}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAddToCart && handleAddToCart(row, '10x')}
              style={{
                width: '100%',
                minHeight: '40px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: '#1a73e8',
                border: '1.5px solid #1a73e8',
                borderRadius: '6px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 1px 3px rgba(26,115,232,0.25)',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
            >
              <Box size={13} style={{ flexShrink: 0 }} />
              <span>Pack ×10</span>
            </button>
          )}
        </div>
      </div>

      {/* Laptop-Parity Quick Action Strip for Mobile (AI Posology & Direct Inquiry) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '6px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          onClick={() => onOpenAi && onOpenAi(row)}
          style={{
            minHeight: '34px',
            padding: '5px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            color: '#0369a1',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={isEs ? 'Consultar dosificación y posología con Atlas AI' : 'Calculate clinical posology with Atlas AI'}
        >
          <Sparkles size={13} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>{isEs ? 'Posología IA' : 'Posology AI'}</span>
        </button>

        <button
          type="button"
          onClick={() => onInquire && onInquire(row)}
          style={{
            minHeight: '34px',
            padding: '5px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#15803d',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={isEs ? 'Consultar pedido institucional o lote' : 'Inquire about institutional volume or custom batch'}
        >
          <Mail size={13} color="#15803d" style={{ flexShrink: 0 }} />
          <span>{isEs ? 'Consultar Pedido' : 'Inquire'}</span>
        </button>
      </div>

      {/* ── Clinical Pharmacology & Dosing Quick-Ref Inspector ── */}
      <div style={{ marginTop: '2px' }}>
        <button
          type="button"
          onClick={() => setIsClinicalExpanded(!isClinicalExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 10px',
            background: isClinicalExpanded ? '#ffffff' : '#f8fafc',
            border: isClinicalExpanded ? '1px solid #cbd5e1' : '1px solid #dadce0',
            borderBottom: isClinicalExpanded ? 'none' : '1px solid #dadce0',
            borderLeft: isClinicalExpanded ? '3px solid #1a73e8' : '1px solid #dadce0',
            borderRadius: isClinicalExpanded ? '6px 6px 0 0' : '6px',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 750,
            color: isClinicalExpanded ? '#1a73e8' : '#3c4043',
            transition: 'all 0.15s ease',
            boxShadow: isClinicalExpanded ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
          }}
          aria-expanded={isClinicalExpanded}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="#1a73e8" />
            <span>{isEs ? 'Guía Clínica & Posología B2B' : 'Clinical Pharmacology & Dosing Guide'}</span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              background: isClinicalExpanded ? '#e8f0fe' : '#f1f3f4',
              color: isClinicalExpanded ? '#1a73e8' : '#5f6368',
              padding: '1px 5px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              Quick-Ref
            </span>
          </span>
          {isClinicalExpanded ? <ChevronUp size={14} color="#1a73e8" /> : <ChevronDown size={14} color="#5f6368" />}
        </button>

        {isClinicalExpanded && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px rgba(60,64,67,0.08)',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* Meta Chips Ribbon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              padding: '7px 12px',
              background: '#f8f9fa',
              borderBottom: '1px solid #eceff1'
            }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#1a73e8',
                background: '#e8f0fe',
                border: '1px solid #c2e7ff',
                padding: '2px 7px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Activity size={10} />
                <span>{clinical.route || 'SubQ'}</span>
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: '#475569',
                background: '#ffffff',
                border: '1px solid #dadce0',
                padding: '2px 7px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Clock size={10} color="#d97706" />
                <span>{isEs ? 'T1/2:' : 'Half-life:'} {clinical.halfLife}</span>
              </span>
              {clinical.casNumber && (
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  CAS: {clinical.casNumber}
                </span>
              )}
            </div>

            {/* Continuous Spec Body */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {/* Section 1: Reconstitution & Syringe Math Spec Card */}
              <div style={{
                background: '#f8fafd',
                border: '1px solid #d0e2ff',
                borderRadius: '5px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#185abc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Droplets size={11} color="#185abc" />
                  <span>{isEs ? 'Reconstitución & Regla Jeringa (U-100)' : 'Reconstitution & Syringe Math (U-100)'}</span>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#202124', fontWeight: 700 }}>
                  {clinical.recon}
                </div>
                <div style={{
                  fontSize: '0.70rem',
                  color: '#185abc',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: '#e8f0fe',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #c2e7ff',
                  display: 'inline-block',
                  alignSelf: 'flex-start'
                }}>
                  {clinical.syringeCalc}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#3c4043', marginTop: '2px' }}>
                  <strong style={{ color: '#202124' }}>{isEs ? 'Pauta estándar:' : 'Standard posology:'}</strong> {clinical.dose}
                </div>
                {(clinical.vialYield || clinical.stability) && (
                  <div style={{
                    fontSize: '0.67rem',
                    color: '#5f6368',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    borderTop: '1px solid #e1eaf8',
                    paddingTop: '4px',
                    marginTop: '2px'
                  }}>
                    {clinical.vialYield && <span>⏱️ <strong>{isEs ? 'Rendimiento:' : 'Yield:'}</strong> {clinical.vialYield}</span>}
                    {clinical.stability && <span>❄️ <strong>{isEs ? 'Estabilidad:' : 'Storage:'}</strong> {clinical.stability}</span>}
                  </div>
                )}
              </div>

              {/* Section 2: Clinical Indication & Synergies */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <div style={{
                    fontSize: '0.64rem',
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#5f6368',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '2px'
                  }}>
                    <Sparkles size={11} color="#1a73e8" />
                    <span>{isEs ? 'Indicación Clínica & MoA' : 'Clinical Indication & MoA'}</span>
                  </div>
                  <p style={{ margin: 0, color: '#1e293b', fontSize: '0.74rem', lineHeight: 1.45 }}>
                    {clinical.indication}
                  </p>
                </div>

                {clinical.stack && (
                  <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '6px' }}>
                    <div style={{
                      fontSize: '0.64rem',
                      fontWeight: 750,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '2px'
                    }}>
                      <Layers size={11} color="#7c3aed" />
                      <span>{isEs ? 'Stack Clínico Sinergia' : 'Recommended Synergy Stack'}</span>
                    </div>
                    <p style={{ margin: 0, color: '#334155', fontSize: '0.73rem', lineHeight: 1.42 }}>
                      {clinical.stack}
                    </p>
                    {clinical.crossSellName && onFilterByPeptide && (
                      <div style={{ marginTop: '5px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFilterByPeptide(clinical.crossSellName);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f3e8ff',
                            border: '1px solid #d8b4fe',
                            color: '#6b21a8',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <span>+ {isEs ? 'Ver' : 'View'} {clinical.crossSellName} ({isEs ? 'Sinergia' : 'Stack'}) →</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contextual AI Action Strip */}
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid #f1f3f4',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={() => onOpenAi && onOpenAi(row)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '38px',
                  boxShadow: '0 1px 2px rgba(2,132,199,0.08)',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Consultar dosificación y posología con Atlas AI' : 'Calculate clinical posology with Atlas AI'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#0284c7" />
                  <span>{isEs ? 'Calcular Pauta y Reconstitución con Atlas AI' : 'Calculate Posology & Reconstitution with Atlas AI'}</span>
                </div>
                <ArrowRight size={13} color="#0284c7" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

PeptideMobileCard.displayName = 'PeptideMobileCard';
