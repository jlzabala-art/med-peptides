'use client';

import React from 'react';
import { Snowflake, Thermometer } from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import PriceScheduleExpandedActions from '@/components/pricing/shared/PriceScheduleExpandedActions';

/**
 * ProductDetailInline
 * ─────────────────────────────────────────────────────────────────────────────
 * Master-Detail inline drawer for SKU inspection in DataTable (Golden Rule #4).
 * Displays only complementary details not already shown in the main table row.
 */
export default function ProductDetailInline({
  row,
  group,
  effectiveTier = 'wholesale',
  priceFor,
  formatPrice,
}) {
  const brand = row.brand || row.manufacturer || group?.supplier || 'Atlas Health Services';
  const manufacturer = row.manufacturer && row.manufacturer !== brand ? row.manufacturer : null;
  const purity = row.purity || row.technology || (group?.id === 'peptides' ? 'HPLC ≥99.0%' : 'GMP / ISO Certified');
  const indication =
    row.indication ||
    row.description ||
    row.goal ||
    row.clinicalSummary ||
    'Official biomedical formulation with analytical traceability and batch quality control.';

  const isCold = Boolean(row.requiresColdChain) || group?.id === 'peptides';
  const storage =
    row.storage ||
    (isCold
      ? 'Cold Chain Required: Store at 2°C – 8°C (Refrigerated). Do not freeze.'
      : 'Store at controlled room temperature (15°C – 25°C). Protect from light.');

  const dossierSlug = encodeURIComponent(row.slug || row.id || row.canonicalName || '');

  return (
    <div style={{
      padding: '14px 18px',
      backgroundColor: '#f8fafc',
      borderLeft: '3px solid var(--color-primary, #003666)',
      borderTop: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        {/* Col 1: SKU Reference & Therapeutic Profile */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            SKU / Reference
          </div>
          <div style={{ marginTop: '4px', marginBottom: '10px' }}>
            <CopyableId value={row.id} />
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary, #003666)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Therapeutic Indication &amp; Profile
          </div>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '5px', marginBottom: 0, lineHeight: 1.5 }}>
            {indication}
          </p>
        </div>

        {/* Col 2: Technical Specifications */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Technical Specifications
          </div>
          <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div><strong>Technology / Active:</strong> {purity}</div>
            {manufacturer && (
              <div><strong>Manufacturer:</strong> {manufacturer}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              {isCold ? (
                <Snowflake size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <Thermometer size={14} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <span><strong>Storage:</strong> {storage}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Traceability & Dossier */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderLeft: '1px solid #e2e8f0',
          paddingLeft: '16px',
          gap: '10px',
        }}>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Traceability &amp; Compliance
            </div>

            <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ CE-IVD / Analytical Grade
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                CoA Available
              </span>
              {isCold && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 600, color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                  <Snowflake size={11} />
                  <span>2–8°C Cold Chain</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <PriceScheduleExpandedActions
        item={row}
        currency={group?.currency || 'EUR'}
        unitPrice={(() => {
          if (typeof priceFor !== 'function') return null;
          const resolved = priceFor(row);
          return effectiveTier === 'clinic'
            ? (resolved.clinicPrice ?? row.pricing?.clinicPrice ?? resolved.price ?? row.price)
            : (resolved.wholesalePrice ?? row.pricing?.wholesalePrice ?? resolved.price ?? row.price);
        })()}
        formattedPrice={(() => {
          if (typeof priceFor !== 'function' || typeof formatPrice !== 'function') return '';
          const resolved = priceFor(row);
          const amount =
            effectiveTier === 'clinic'
              ? (resolved.clinicPrice ?? row.pricing?.clinicPrice ?? resolved.price ?? row.price)
              : (resolved.wholesalePrice ?? row.pricing?.wholesalePrice ?? resolved.price ?? row.price);
          return amount ? formatPrice(amount, group?.currency || 'EUR') : '';
        })()}
        categoryLabel={group?.label || ''}
        monographUrl={`/p/${dossierSlug}`}
      />
    </div>
  );
}
