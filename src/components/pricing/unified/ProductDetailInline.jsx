'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

/**
 * ProductDetailInline
 * ─────────────────────────────────────────────────────────────────────────────
 * Master-Detail inline drawer for SKU inspection in DataTable (Golden Rule #4).
 * Adheres strictly to Google Cloud Console UX design and English typography.
 */
export default function ProductDetailInline({ row, group }) {
  const brand = row.brand || row.manufacturer || group?.supplier || 'Atlas Health Services';
  const purity = row.purity || row.technology || (group?.id === 'peptides' ? 'HPLC ≥99.0%' : 'GMP / ISO Certified');
  const dosage = row.dosage || row.volume || row.fill_volume || 'Standard Presentation';
  const indication = row.indication || row.description || row.goal || row.clinicalSummary || 'Official biomedical formulation with analytical traceability and batch quality control.';
  const storage = row.storage || (group?.id === 'peptides' ? 'Store at 2°C – 8°C (Refrigerated). Protect from light.' : 'Store at controlled room temperature (15°C – 25°C).');

  return (
    <div style={{
      padding: '16px 20px',
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid #003666',
      borderRadius: '6px',
      margin: '6px 0',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* Col 1: Therapeutic Profile */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Therapeutic Indication &amp; Profile
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
            {row.name || row.canonicalName || row.id}
          </div>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
            {indication}
          </p>
        </div>

        {/* Col 2: Technical Specifications */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Technical Specifications
          </div>
          <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Concentration / Volume:</strong> {dosage}</div>
            <div><strong>Purity / Grade:</strong> {purity}</div>
            <div><strong>Laboratory / Brand:</strong> {brand}</div>
            <div><strong>Storage Conditions:</strong> {storage}</div>
          </div>
        </div>

        {/* Col 3: Quality Compliance & Direct Product Dossier Link */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderLeft: '1px solid #e2e8f0',
          paddingLeft: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Quality &amp; Compliance
            </div>
            <div style={{ marginTop: '5px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ CE-IVD / Analytical Grade
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                CoA Available
              </span>
            </div>
          </div>

          <Link
            href={`/product/${encodeURIComponent(row.id || row.canonicalName || '')}`}
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#003666',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: '12px',
              boxShadow: '0 1px 3px rgba(0,54,102,0.2)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>View Product Dossier</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
