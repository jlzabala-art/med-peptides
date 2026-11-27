import React from 'react';
import Link from 'next/link';
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
import PriceDisplay from '@/components/pricing/PriceDisplay';
import PriceScheduleExpandedActions from '@/components/pricing/shared/PriceScheduleExpandedActions';

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
  isEs = false,
  isAdmin = false,
  pricingRole = 'guest',
  resolveProduct = null
}) {
  return [
    {
      key: 'itemNumber',
      label: '#',
      width: '42px',
      minWidth: '38px',
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
      width: '36%',
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
      label: isAdmin
        ? (isEs ? `Coste / Whole / Dist · ${currency}` : `Cost / Whole / Dist · ${currency}`)
        : (isEs ? `Vial Individual (1x) · ${currency}` : `Single Vial (1x) · ${currency}`),
      width: isAdmin ? '18%' : '14%',
      align: 'right',
      sortable: true,
      render: (val, row) => {
        const resolved = typeof resolveProduct === 'function' ? resolveProduct(row) : null;
        if (isAdmin && resolved?.showTriple) {
          return (
            <PriceDisplay
              resolved={resolved}
              wholeseller={resolved.wholeseller ?? val ?? row.unitPrice}
              formatPrice={formatPrice}
              isAdmin
              isEs={isEs}
              variant="compact"
            />
          );
        }
        const effectiveUnit = resolved?.primaryPrice ?? val ?? row.unitPrice;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'right', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#202124', fontSize: '0.92rem' }}>
              {formatPrice(effectiveUnit)}
            </span>
            <span style={{ fontSize: '0.64rem', color: '#5f6368' }}>
              {pricingRole === 'guest'
                ? (isEs ? 'por vial estéril' : 'per sterile vial')
                : (resolved?.primaryLabel || (isEs ? 'por vial estéril' : 'per sterile vial'))}
            </span>
          </div>
        );
      }
    },
    {
      key: 'pack10Price',
      label: isEs ? `Pack de 10 (Pack ×10) · ${currency}` : `Pack of 10 (Pack ×10) · ${currency}`,
      width: '18%',
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
      width: '138px',
      minWidth: '128px',
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
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#f8fafc',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              height: '28px',
              flexShrink: 0
            }}
          >
            {inCart1x > 0 && typeof updateItemQuantity === 'function' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#e8f0fe',
                borderRight: '1px solid #cbd5e1',
                height: '100%'
              }}>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '1x', -1)}
                  style={{ width: '20px', height: '100%', border: 'none', background: 'transparent', color: '#1a73e8', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Restar 1 vial' : 'Remove 1 vial'}
                >
                  -
                </button>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1a73e8', padding: '0 3px', fontFamily: 'monospace' }}>
                  {inCart1x}
                </span>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '1x', 1)}
                  style={{ width: '20px', height: '100%', border: 'none', background: 'transparent', color: '#1a73e8', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Sumar 1 vial' : 'Add 1 vial'}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(row, '1x')}
                style={{
                  height: '100%',
                  padding: '0 7px',
                  fontSize: '0.69rem',
                  fontWeight: 650,
                  background: '#ffffff',
                  border: 'none',
                  borderRight: '1px solid #cbd5e1',
                  color: '#1a73e8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                title={isEs ? 'Añadir 1 vial individual a la proforma' : 'Add 1 single vial to proforma'}
              >
                <Plus size={10} />
                <span>1 Vial</span>
              </button>
            )}

            {inCart10x > 0 && typeof updateItemQuantity === 'function' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#dcfce7',
                height: '100%'
              }}>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '10x', -1)}
                  style={{ width: '20px', height: '100%', border: 'none', background: 'transparent', color: '#16a34a', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Restar 1 pack ×10' : 'Remove 1 pack ×10'}
                >
                  -
                </button>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', padding: '0 3px', fontFamily: 'monospace' }}>
                  {inCart10x}×10
                </span>
                <button
                  type="button"
                  onClick={() => updateItemQuantity(row.id, '10x', 1)}
                  style={{ width: '20px', height: '100%', border: 'none', background: 'transparent', color: '#16a34a', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                  title={isEs ? 'Sumar 1 pack ×10' : 'Add 1 pack ×10'}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(row, '10x')}
                style={{
                  height: '100%',
                  padding: '0 8px',
                  fontSize: '0.69rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid #dadce0',
                  color: '#3c4043',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#3c4043'; }}
                title={isEs ? 'Añadir pack de 10 viales con descuento por volumen' : 'Add manufacturer pack of 10 vials (-volume discount)'}
              >
                <Box size={10} />
                <span>Pack ×10</span>
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
  currency = 'USD',
  onOpenSpecs,
  onOpenAi,
  onInquire,
  onFilterByPeptide
} = {}) {
  const clinical = getPeptideClinicalSummary(row.productName, row.therapeuticClass || row.category, lang);
  const isEs = lang === 'es';
  const normName = String(row.productName || '').toLowerCase();
  const isPelletSynergyCandidate = /bpc-157|cjc|ipamorelin|sermorelin|tesamorelin|epitalon|ghk-cu|nad\+|mots-c|pt-141|kisspeptin|gonadorelin|hcg|aod/.test(normName)
    || /longevity|hormone|endocrine|gh|regenerative|repair|metabolic/i.test(String(row.therapeuticClass || row.category || ''));
  const pelletParams = new URLSearchParams();
  if (isEs) pelletParams.set('lang', 'es');
  if (currency) pelletParams.set('currency', currency);
  const pelletHref = `/pricing/pellets${pelletParams.toString() ? `?${pelletParams.toString()}` : ''}`;

  return (
    <div
      className="pep-expanded-gcp-panel"
      style={{
        backgroundColor: '#f8fafc',
        borderLeft: '3px solid #1a73e8',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 1rem',
        margin: '0',
      }}
    >
      <style>{`
        .pep-expanded-gcp-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }
        .pep-expanded-kv-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #e8eaed;
        }
        @media (max-width: 768px) {
          .pep-expanded-gcp-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
          }
          .pep-expanded-kv-strip {
            grid-template-columns: minmax(0, 1fr);
            gap: 6px;
          }
        }
      `}</style>

      <div className="pep-expanded-gcp-grid">
        {/* Left Column: Clinical Indication, MoA, Key-Value Specs & Synergies */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} color="#5f6368" />
                <span>{isEs ? 'Indicación Clínica Primaria' : 'Primary Clinical Indication'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.80rem', color: '#202124', lineHeight: 1.45 }}>
                {clinical.indication}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #e8eaed', paddingTop: '8px' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={12} color="#5f6368" />
                <span>{isEs ? 'Mecanismo de Acción (MoA)' : 'Mechanism of Action (MoA)'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.77rem', color: '#3c4043', lineHeight: 1.42 }}>
                {clinical.moa}
              </p>
            </div>
          </div>

          {/* Compact GCP Key-Value Strip */}
          <div className="pep-expanded-kv-strip">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.04em' }}>
                {isEs ? 'Vía Diana' : 'Target Pathway'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#202124', fontWeight: 600, marginTop: '2px', lineHeight: 1.3 }}>
                {clinical.targetSystem}
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.04em' }}>
                {isEs ? 'Nº CAS' : 'CAS Registry'}
              </div>
              <div style={{ marginTop: '2px' }}>
                {clinical.casNumber ? <CopyableId value={clinical.casNumber} /> : <span style={{ fontSize: '0.74rem', color: '#5f6368' }}>—</span>}
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', color: '#5f6368', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={10} color="#5f6368" />
                <span>{isEs ? 'Vida Media' : 'Half-life'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#202124', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span>{clinical.halfLife}</span>
                <span style={{ fontSize: '0.63rem', background: '#f1f3f4', color: '#3c4043', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  {clinical.route || 'SubQ'}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Monochrome Synergies */}
          <div style={{ borderTop: '1px solid #e8eaed', paddingTop: '8px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={12} color="#5f6368" />
              <span>{isEs ? 'Sinergias Clínicas' : 'Clinical Synergies'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3c4043', lineHeight: 1.4 }}>
              {clinical.synergy}
            </div>
            {(clinical.crossSellName || isPelletSynergyCandidate) && (
              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {clinical.crossSellName && (
                  <button
                    type="button"
                    className="gcp-btn-secondary"
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
                      padding: '3px 9px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>+ {isEs ? 'Ver' : 'View'} {clinical.crossSellName} ({isEs ? 'Sinergia' : 'Stack'}) →</span>
                  </button>
                )}
                {isPelletSynergyCandidate && (
                  <Link
                    href={pelletHref}
                    className="gcp-btn-secondary"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>+ {isEs ? 'Ver Pellets Hormonales BHRT' : 'Explore BHRT Hormone Pellets'} →</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reconstitution & Syringe Math (U-100) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '5px', paddingBottom: '6px', borderBottom: '1px solid #e8eaed' }}>
              <Droplets size={12} color="#5f6368" />
              <span>{isEs ? 'Reconstitución & Regla Jeringa (U-100)' : 'Reconstitution & Syringe Math (U-100)'}</span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#202124', fontWeight: 700 }}>
              {clinical.recon}
            </div>

            <div
              style={{
                fontSize: '0.74rem',
                color: '#1967d2',
                fontFamily: 'monospace',
                fontWeight: 700,
                background: '#e8f0fe',
                padding: '6px 9px',
                borderRadius: '6px',
                border: '1px solid #d2e3fc',
              }}
            >
              {clinical.syringeCalc}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#3c4043', lineHeight: 1.4 }}>
              <strong style={{ color: '#202124' }}>{isEs ? 'Pauta estándar:' : 'Standard dose:'}</strong> {clinical.dose}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #e8eaed', paddingTop: '6px', marginTop: '2px' }}>
              {clinical.vialYield && (
                <div style={{ fontSize: '0.72rem', color: '#5f6368', display: 'flex', gap: '6px' }}>
                  <strong style={{ color: '#3c4043', minWidth: '72px' }}>{isEs ? 'Rendimiento:' : 'Vial Yield:'}</strong>
                  <span>{clinical.vialYield}</span>
                </div>
              )}
              {clinical.stability && (
                <div style={{ fontSize: '0.72rem', color: '#5f6368', display: 'flex', gap: '6px' }}>
                  <strong style={{ color: '#3c4043', minWidth: '72px' }}>{isEs ? 'Estabilidad:' : 'Storage:'}</strong>
                  <span>{clinical.stability}</span>
                </div>
              )}
              {clinical.hardware && (
                <div style={{ fontSize: '0.72rem', color: '#5f6368', display: 'flex', gap: '6px' }}>
                  <strong style={{ color: '#3c4043', minWidth: '72px' }}>{isEs ? 'Insumos:' : 'Hardware:'}</strong>
                  <span>{clinical.hardware}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified GCP Action Bar Footer (Full Width) */}
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
        <PriceScheduleExpandedActions
          item={{
            ...row,
            name: row.productName || row.name,
            packSize: row.dosage || 'Lyophilized Vial',
            sku: row.sku || row.id,
          }}
          currency={currency}
          unitPrice={Number(row.clinicPrice ?? row.price_1x ?? row.price ?? 0)}
          categoryLabel={row.therapeuticClass || row.category || 'Peptide Vials'}
          onQuickView={typeof onOpenSpecs === 'function' ? () => onOpenSpecs(row) : null}
          onOpenCalculator={() => {
            if (typeof window !== 'undefined') {
              const slug = String(row.productName || row.name || 'bpc-157')
                .split('(')[0]
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              const strengthToken = String(row.dosage || '10mg').replace(/\s+/g, '');
              window.location.href = `/calculator?peptide=${encodeURIComponent(slug)}&format=vial&strength=${encodeURIComponent(strengthToken)}${isEs ? '&lang=es' : ''}`;
            }
          }}
        />
      </div>
    </div>
  );
}
