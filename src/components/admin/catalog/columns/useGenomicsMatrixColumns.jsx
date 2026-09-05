import React, { useMemo } from 'react';
import AppEntityCell from '../../../ui/AppEntityCell';
import ScientificHoverCard from '../ScientificHoverCard';
import AppActionGroup from '../../../ui/AppActionGroup';
import StatusBadge from '../../../ui/StatusBadge';
import { Sparkles, Dna, Eye, Edit3, Layers, FlaskConical, PackageCheck } from '@/lib/icons';

const PRIORITY_CONFIG = {
  A: { bg: '#dcfce7', text: '#15803d', border: '#86efac', dot: '🟢', label: 'Priority A (First-line)' },
  B: { bg: '#fef9c3', text: '#a16207', border: '#fde047', dot: '🟡', label: 'Priority B (Second-line)' },
  C: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', dot: '🔵', label: 'Priority C (Supportive)' },
};

export function useGenomicsMatrixColumns({
  onSelectProduct,
  onEditPriority,
  supplierIdToName = {}
}) {
  return useMemo(() => [
    // 1. Active Compound & Molecular Identity
    {
      key: 'product',
      header: 'Active Compound / Product',
      width: '32%',
      mobilePriority: 1,
      render: (row) => {
        const isApi = (row.productType || row.primaryType || row.category || '').includes('raw') || row.category === 'raw_material';
        const casNumber = row.casNumber || row.molecular?.casNumber || row.scientificData?.casNumber || '';
        const formula = row.molecularFormula || row.molecular?.molecularFormula || row.scientificData?.molecularFormula || '';

        return (
          <AppEntityCell
            title={
              <ScientificHoverCard product={row}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {row.canonicalName || row.name}
                  </span>
                  {isApi ? (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      letterSpacing: '0.04em'
                    }}>
                      BULK API
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      letterSpacing: '0.04em'
                    }}>
                      FINISHED
                    </span>
                  )}
                </div>
              </ScientificHoverCard>
            }
            subtitle={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                {casNumber && <span>CAS: <strong style={{ color: '#334155' }}>{casNumber}</strong></span>}
                {casNumber && formula && <span>•</span>}
                {formula && <span style={{ fontFamily: 'monospace', color: '#0369a1' }}>{formula}</span>}
              </div>
            }
          />
        );
      }
    },

    // 2. Associated Genetic Tests & Panels (Chips)
    {
      key: 'genomic_tests',
      header: 'Genetic Panels',
      width: '30%',
      mobilePriority: 2,
      render: (row) => {
        const programs = Array.isArray(row.programs) ? row.programs : [];
        if (programs.length === 0) {
          return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>;
        }

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            {programs.map((prog, idx) => {
              const pri = (prog.priority || 'C').toUpperCase();
              const cfg = PRIORITY_CONFIG[pri] || PRIORITY_CONFIG.C;
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
                    padding: '2px 7px',
                    borderRadius: '6px',
                    backgroundColor: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.text,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`Click to edit priority in ${name}`}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Dna size={11} style={{ opacity: 0.8 }} />
                  <span>{name}</span>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: '0 4px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    marginLeft: '2px'
                  }}>
                    {pri}
                  </span>
                </span>
              );
            })}
          </div>
        );
      }
    },

    // 3. Overall Clinical Priority
    {
      key: 'priority',
      header: 'Clinical Priority',
      width: '14%',
      mobilePriority: 1,
      render: (row) => {
        const programs = Array.isArray(row.programs) ? row.programs : [];
        const hasA = programs.some(p => (p.priority || '').toUpperCase() === 'A');
        const hasB = programs.some(p => (p.priority || '').toUpperCase() === 'B');
        const topPri = hasA ? 'A' : (hasB ? 'B' : 'C');
        const cfg = PRIORITY_CONFIG[topPri] || PRIORITY_CONFIG.C;

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.text,
              fontSize: '0.75rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <span>{cfg.dot}</span>
              <span>Priority {topPri}</span>
            </span>
          </div>
        );
      }
    },

    // 4. Administration Route
    {
      key: 'applicationRoute',
      header: 'Route / Form',
      width: '12%',
      render: (row) => {
        const programs = Array.isArray(row.programs) ? row.programs : [];
        const routes = Array.from(new Set(programs.map(p => p.applicationRoute).filter(Boolean)));
        const routeStr = routes.length > 0 ? routes.join(', ') : (row.applicationRoute || 'Topical / Oral');

        return (
          <span style={{
            fontSize: '0.76rem',
            color: '#334155',
            fontWeight: 500,
            display: 'inline-block',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {routeStr}
          </span>
        );
      }
    },

    // 5. Supply Source & Variants
    {
      key: 'supply',
      header: 'Supply & Formats',
      width: '12%',
      render: (row) => {
        const supplierName = supplierIdToName[row.supplierId] || supplierIdToName[row.supplier] || row.supplierName || 'Fagron Iberia';
        const varCount = (Array.isArray(row.variants) && row.variants.length > 0) ? row.variants.length : (row.variantsCount || 1);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1e293b' }}>
              {supplierName}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {varCount} {varCount === 1 ? 'Variant' : 'Variants'}
            </span>
          </div>
        );
      }
    },

    // 6. Action Buttons
    {
      key: 'actions',
      header: 'Actions',
      width: '90px',
      align: 'right',
      isAction: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct?.(row);
            }}
            className="gcp-icon-btn"
            title="View Offers & Pricing"
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              color: '#0284c7'
            }}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const firstProg = (row.programs && row.programs[0]) ? (row.programs[0].slug || row.programs[0].id) : null;
              onEditPriority?.(row, firstProg);
            }}
            className="gcp-icon-btn"
            title="Edit Genomic Priority"
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              color: '#15803d'
            }}
          >
            <Edit3 size={15} />
          </button>
        </div>
      )
    }
  ], [onSelectProduct, onEditPriority, supplierIdToName]);
}
