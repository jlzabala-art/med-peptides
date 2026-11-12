import React from 'react';
import {
  FileText,
  Plus,
  Box,
  Check,
  Sparkles,
  Activity,
  Layers,
  Clock,
  Droplets,
  BookOpen,
  Mail
} from 'lucide-react';
import { parsePeptideBlendDisplay } from '@/components/pricing/PeptidePricePdfPreviewModal';
import { getPeptideClinicalSummary } from '@/constants/peptidePharmacology';
import CopyableId from '@/components/ui/CopyableId';

/**
 * Factory function returning the DataTable columns array.
 * (Strict Rule #30: explicit width, no horizontal scroll, Google Cloud UX)
 */
export function getPeptidesColumns({
  cartItems = {},
  handleAddToCart,
  updateItemQuantity,
  formatPrice,
  currency = 'USD',
  isEs = false
}) {
  return [
    {
      key: 'itemNumber',
      label: '#',
      width: '54px',
      minWidth: '50px',
      nowrap: true,
      align: 'center',
      sortable: true,
      render: (val, row) => (
        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.80rem',
          color: '#5f6368',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          letterSpacing: '-0.02em'
        }}>
          {val ?? row?.itemNumber}
        </span>
      )
    },
    {
      key: 'productName',
      label: isEs ? 'Formulación de Péptido & Concentración' : 'Peptide Formulation & Concentration',
      width: '50%',
      align: 'left',
      sortable: true,
      render: (_, row) => {
        const itemInCart = cartItems[row.id];
        const v1x = itemInCart?.quantity1x || 0;
        const v10x = itemInCart?.quantity10x || 0;
        const hasSelection = v1x > 0 || v10x > 0;

        const targetSlug = row.slug || row.productId || '';
        const cleanDoseParam = (row.dosage || '').replace(/\s+/g, '').toLowerCase();
        const publicPageUrl = `/p/${encodeURIComponent(targetSlug)}${cleanDoseParam ? `?dose=${encodeURIComponent(cleanDoseParam)}` : ''}`;
        const blendInfo = parsePeptideBlendDisplay(row.productName, row.dosage);

        return (
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#1a73e8',
                  letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                title={isEs ? `Abrir ficha clínica oficial y estructura 3D de ${row.productName} en nueva pestaña` : `Open official clinical datasheet & 3D structure for ${row.productName} in new tab`}
              >
                {blendInfo.isBlend ? (blendInfo.titleLine || blendInfo.mainTitle || row.productName) : row.productName}
              </a>
              {row.dosage && (
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#1a73e8',
                  background: '#e8f0fe',
                  border: '1px solid #c2e7ff',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap'
                }}>
                  {blendInfo.isBlend ? (blendInfo.dosageMain || blendInfo.primaryDose || row.dosage) : row.dosage}
                </span>
              )}
              {/* Specs Button */}
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
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
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e8f0fe';
                  e.currentTarget.style.borderColor = '#1a73e8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#c2e7ff';
                }}
                title={isEs ? `Abrir monografía clínica oficial, CAS, reconstitución y estructura 3D de ${row.productName} ${row.dosage || ''}` : `Open official clinical monograph, CAS, reconstitution & 3D structure for ${row.productName} ${row.dosage || ''} in new tab`}
              >
                <FileText size={11} />
                <span>{isEs ? 'Ficha ↗' : 'Specs ↗'}</span>
              </a>

              {/* Category Badge Pill */}
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
                <span>{row?.categoryMeta?.label}</span>
              </span>

              {/* FDA Regulatory Status Badge */}
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

              {/* Live Preselected Order Indicator */}
              {hasSelection && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#137333',
                  background: '#e6f4ea',
                  border: '1px solid #ceead6',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Check size={10} />
                  <span>{isEs ? 'En Proforma:' : 'In Proforma:'} {v1x > 0 ? `${v1x} vial${v1x > 1 ? (isEs ? 'es' : 's') : ''}` : ''}{v1x > 0 && v10x > 0 ? ' + ' : ''}{v10x > 0 ? `${v10x} pack${v10x > 1 ? 's' : ''} (×10)` : ''}</span>
                </span>
              )}
            </div>
            {blendInfo.isBlend && blendInfo.compositionLine && (
              <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                {blendInfo.compositionLine}
              </div>
            )}
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{isEs ? 'Vial Liofilizado Estéril (10R)' : 'Sterile Lyophilized Vial (10R)'}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#137333', fontWeight: 600, whiteSpace: 'nowrap' }}>{isEs ? '≥99.0% Pureza HPLC' : '≥99.0% HPLC Purity'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'unitPrice',
      label: isEs ? `Vial Individual (1x) · ${currency}` : `Single Vial (1x) · ${currency}`,
      width: '13%',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'right', alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#202124', fontSize: '0.92rem' }}>
            {formatPrice(val ?? row.unitPrice)}
          </span>
          <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>{isEs ? 'por vial estéril' : 'per sterile vial'}</span>
        </div>
      )
    },
    {
      key: 'pack10Price',
      label: isEs ? `Pack de 10 (Pack ×10) · ${currency}` : `Pack of 10 (Pack ×10) · ${currency}`,
      width: '16%',
      align: 'right',
      sortable: true,
      render: (_, row) => {
        const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
        const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
        const discountPct = Math.max(10, Math.round((1 - (p10 / (row.unitPrice * 10))) * 100));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'right', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#137333', fontSize: '0.92rem' }}>
                {formatPrice(p10)}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                -{discountPct}% Pack
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: '#137333', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
              ({formatPrice(perUnit)} / vial)
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: isEs ? 'Solicitud de Pedido' : 'Order Request',
      width: '162px',
      minWidth: '156px',
      align: 'right',
      render: (_, row) => {
        const inCart1x = cartItems[row.id]?.quantity1x || 0;
        const inCart10x = cartItems[row.id]?.quantity10x || 0;
        return (
          <div
            className="peptide-row-actions-group"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              flexWrap: 'nowrap',
              width: '100%'
            }}
          >
            {inCart1x > 0 && typeof updateItemQuantity === 'function' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#e8f0fe',
                border: '1px solid #1a73e8',
                borderRadius: '5px',
                height: '28px'
              }}>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '1x', -1)}
                  style={{ width: '22px', height: '100%', border: 'none', background: 'transparent', color: '#1a73e8', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Restar 1 vial' : 'Remove 1 vial'}
                >
                  -
                </button>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#1a73e8', padding: '0 4px', fontFamily: 'monospace' }}>
                  {inCart1x}
                </span>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '1x', 1)}
                  style={{ width: '22px', height: '100%', border: 'none', background: 'transparent', color: '#1a73e8', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Sumar 1 vial' : 'Add 1 vial'}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(row, '1x')}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  fontSize: '0.70rem',
                  fontWeight: 650,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                title={isEs ? 'Añadir 1 vial individual a la proforma' : 'Add 1 single vial to proforma'}
              >
                <Plus size={11} />
                <span>1 Vial</span>
              </button>
            )}

            {inCart10x > 0 && typeof updateItemQuantity === 'function' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#dcfce7',
                border: '1px solid #16a34a',
                borderRadius: '5px',
                height: '28px'
              }}>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '10x', -1)}
                  style={{ width: '22px', height: '100%', border: 'none', background: 'transparent', color: '#16a34a', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Restar 1 pack ×10' : 'Remove 1 pack ×10'}
                >
                  -
                </button>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#16a34a', padding: '0 4px', fontFamily: 'monospace' }}>
                  {inCart10x}×10
                </span>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '10x', 1)}
                  style={{ width: '22px', height: '100%', border: 'none', background: 'transparent', color: '#16a34a', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Sumar 1 pack ×10' : 'Add 1 pack ×10'}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(row, '10x')}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  background: '#1a73e8',
                  border: '1px solid #1a73e8',
                  borderRadius: '5px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3.5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(26,115,232,0.18)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1557b0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a73e8'; }}
                title={isEs ? 'Añadir pack de 10 viales con descuento por volumen' : 'Add manufacturer pack of 10 vials (-volume discount)'}
              >
                <Box size={11} />
                <span>+Pack ×10</span>
              </button>
            )}
          </div>
        );
      }
    }
  ];
}

/**
 * Expandable Master-Detail Clinical Summary Row for Desktop DataTable
 * (Google Cloud Console UX - Golden Rule #4 & #11)
 */
export function renderPeptideClinicalDetail(row, {
  lang = 'en',
  onOpenSpecs,
  onOpenAi,
  onInquire,
  onFilterByPeptide
} = {}) {
  const clinical = getPeptideClinicalSummary(row.productName, row.therapeuticClass || row.category, lang);
  const isEs = lang === 'es';

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderLeft: '3px solid #1a73e8',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.9rem 1.1rem',
      margin: '0'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'stretch'
      }}>
        {/* Left Column (60%): Clinical Science, Target Pathway, MoA & Synergies */}
        <div style={{
          flex: '1 1 440px',
          minWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Primary Indication & Molecular MoA Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}>
            <div>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#1a73e8',
                marginBottom: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Sparkles size={12} color="#1a73e8" />
                <span>{isEs ? 'Indicación Clínica Primaria' : 'Primary Clinical Indication'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.80rem', color: '#1e293b', lineHeight: 1.48 }}>
                {clinical.indication}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '8px' }}>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#059669',
                marginBottom: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Activity size={12} color="#059669" />
                <span>{isEs ? 'Mecanismo de Acción (MoA)' : 'Mechanism of Action (MoA)'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                {clinical.moa}
              </p>
            </div>
          </div>

          {/* Target Pathway & Pharmacokinetics Metric Row */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}>
            <div style={{ minWidth: '130px' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                {isEs ? 'Sistema / Vía Diana' : 'Target System / Pathway'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 650, marginTop: '2px' }}>
                {clinical.targetSystem}
              </div>
            </div>

            {clinical.casNumber && (
              <div style={{ borderLeft: '1px solid #f1f3f4', paddingLeft: '8px' }}>
                <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                  {isEs ? 'Nº CAS' : 'CAS Registry'}
                </div>
                <div style={{ marginTop: '2px' }}>
                  <CopyableId value={clinical.casNumber} />
                </div>
              </div>
            )}

            <div style={{ borderLeft: '1px solid #f1f3f4', paddingLeft: '8px' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={10} color="#d97706" />
                <span>{isEs ? 'Vida Media' : 'Half-life'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>{clinical.halfLife}</span>
                <span style={{ fontSize: '0.64rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  {clinical.route || 'SubQ'}
                </span>
              </div>
            </div>
          </div>

          {/* Synergies & Stacks Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            padding: '8px 12px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}>
            <div style={{
              fontSize: '0.66rem',
              fontWeight: 750,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7c3aed',
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Layers size={12} color="#7c3aed" />
              <span>{isEs ? 'Sinergias & Protocolos Clínicos' : 'Clinical Synergies & Protocol Stacks'}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
              {clinical.synergy}
            </div>
            {clinical.crossSellName && (
              <div style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onFilterByPeptide === 'function') {
                      onFilterByPeptide(clinical.crossSellName);
                    }
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
        </div>

        {/* Right Column (44%): Reconstitution, Dosage & Integrated Action Bar */}
        <div style={{
          flex: '1 1 380px',
          minWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Reconstitution & Syringe Math Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                background: '#f8f9fa',
                borderBottom: '1px solid #dadce0',
                padding: '6px 10px',
                fontSize: '0.66rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Droplets size={12} color="#1a73e8" />
                <span>{isEs ? 'Reconstitución & Regla Jeringa (U-100)' : 'Reconstitution & Syringe Math (U-100)'}</span>
              </div>
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '0.74rem', color: '#202124', fontWeight: 700 }}>
                  {clinical.recon}
                </div>
                <div style={{
                  fontSize: '0.71rem',
                  color: '#185abc',
                  fontFamily: 'monospace',
                  fontWeight: 650,
                  background: '#e8f0fe',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid #c2e7ff'
                }}>
                  {clinical.syringeCalc}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#3c4043' }}>
                  <strong style={{ color: '#202124' }}>{isEs ? 'Pauta estándar:' : 'Standard dose:'}</strong> {clinical.dose}
                </div>
                {clinical.vialYield && (
                  <div style={{ fontSize: '0.69rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid #f1f3f4', paddingTop: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#3c4043' }}>⏱️ {isEs ? 'Rendimiento:' : 'Vial Yield:'}</span>
                    <span>{clinical.vialYield}</span>
                  </div>
                )}
                {clinical.stability && (
                  <div style={{ fontSize: '0.69rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#3c4043' }}>❄️ {isEs ? 'Estabilidad:' : 'Storage:'}</span>
                    <span>{clinical.stability}</span>
                  </div>
                )}
                {clinical.hardware && (
                  <div style={{ fontSize: '0.69rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#3c4043' }}>💉 {isEs ? 'Insumos:' : 'Hardware:'}</span>
                    <span>{clinical.hardware}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Toolbar Footer */}
            <div
              style={{
                borderTop: '1px solid #f1f3f4',
                background: '#f8fafc',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                gap: '6px'
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onOpenAi === 'function') {
                    onOpenAi(row);
                  }
                }}
                style={{
                  flex: '1 1 auto',
                  minHeight: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  padding: '4px 10px',
                  borderRadius: '5px',
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Consultar dosificación y posología con Atlas AI' : 'Calculate clinical posology with Atlas AI'}
              >
                <Sparkles size={12} color="#0284c7" />
                <span>{isEs ? 'Posología IA' : 'Posology AI'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onOpenSpecs === 'function') {
                    onOpenSpecs(row);
                  }
                }}
                style={{
                  flex: '1 1 auto',
                  minHeight: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  color: '#1a73e8',
                  border: '1px solid #c2e7ff',
                  padding: '4px 10px',
                  borderRadius: '5px',
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f0fe';
                  e.currentTarget.style.borderColor = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#c2e7ff';
                }}
              >
                <BookOpen size={12} />
                <span>{isEs ? 'Dossier & Ficha →' : 'Dossier & Specs →'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onInquire === 'function') {
                    onInquire(row);
                  }
                }}
                style={{
                  flex: '0 1 auto',
                  minHeight: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '4px 10px',
                  borderRadius: '5px',
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dcfce7';
                  e.currentTarget.style.borderColor = '#15803d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                }}
              >
                <Mail size={12} />
                <span>{isEs ? 'Consultar' : 'Inquire'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
