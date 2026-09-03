'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers, Dna, ArrowUpDown, Info } from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import DataTable from '@/components/ui/DataTable';

const PRIORITY_STYLES = {
  A: { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: 'Priority A (First-line)' },
  B: { bg: '#fef9c3', text: '#a16207', border: '#fde047', label: 'Priority B (Second-line)' },
  C: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', label: 'Priority C (Supportive)' },
};

function PriorityPill({ priority, route, onEdit }) {
  if (!priority) {
    return <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>—</span>;
  }

  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.C;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
      <span
        onClick={onEdit}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          cursor: onEdit ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
        }}
        title="Click to modify priority"
      >
        <span>{priority === 'A' ? '🟢' : priority === 'B' ? '🟡' : '🔵'}</span>
        Priority {priority}
      </span>
      {route && (
        <span style={{ fontSize: '0.68rem', color: '#64748b', marginLeft: '2px' }}>
          {route}
        </span>
      )}
    </div>
  );
}

export default function GenomicsMatrixView({ products = [], onSelectProduct, onEditPriority }) {
  const [search, setSearch] = useState('');
  const [overlapFilter, setOverlapFilter] = useState('all'); // 'all' | 'shared' | 'exclusive'
  const [sortField, setSortField] = useState('name'); // 'name' | 'overlap'

  // Extract and process Fagron Genomics associations across all products
  const matrixData = useMemo(() => {
    return (products || [])
      .map(product => {
        const custom = product.customData || {};
        const telo = custom['fagron-genomics-telotest'];
        const tricho = custom['fagron-genomics-trichotest'];
        const nutri = custom['fagron-genomics-nutrigen'];

        const activePrograms = [];
        if (telo?.priority) activePrograms.push({ program: 'telotest', ...telo });
        if (tricho?.priority) activePrograms.push({ program: 'trichotest', ...tricho });
        if (nutri?.priority) activePrograms.push({ program: 'nutrigen', ...nutri });

        if (activePrograms.length === 0) return null;

        return {
          id: product.id || product.objectID,
          name: product.name,
          casNumber: product.casNumber || product.cas_number || '',
          supplier: product.supplierName || product.supplier || 'Atlas Compounding',
          programCount: activePrograms.length,
          telo,
          tricho,
          nutri,
          rawProduct: product
        };
      })
      .filter(Boolean);
  }, [products]);

  // Filtering
  const filteredData = useMemo(() => {
    return matrixData
      .filter(item => {
        if (overlapFilter === 'shared' && item.programCount < 2) return false;
        if (overlapFilter === 'exclusive' && item.programCount !== 1) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.casNumber?.toLowerCase().includes(q) ||
          item.supplier?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'overlap') return b.programCount - a.programCount;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [matrixData, search, overlapFilter, sortField]);

  // Stats
  const sharedCount = useMemo(() => matrixData.filter(m => m.programCount >= 2).length, [matrixData]);
  const exclusiveCount = useMemo(() => matrixData.filter(m => m.programCount === 1).length, [matrixData]);

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Active Ingredient / API',
      width: '28%',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            onClick={() => onSelectProduct?.(row.rawProduct)}
            style={{ fontWeight: 600, color: '#0f172a', cursor: onSelectProduct ? 'pointer' : 'default', textDecoration: onSelectProduct ? 'underline' : 'none' }}
          >
            {row.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CopyableId value={row.id} />
            {row.casNumber && (
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CAS: {row.casNumber}</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'telo',
      header: '🧬 TeloTest',
      width: '18%',
      render: (val, row) => (
        <PriorityPill
          priority={row.telo?.priority}
          route={row.telo?.route}
          onEdit={onEditPriority ? () => onEditPriority(row.rawProduct, 'fagron-genomics-telotest') : null}
        />
      )
    },
    {
      key: 'tricho',
      header: '🧬 TrichoTest',
      width: '18%',
      render: (val, row) => (
        <PriorityPill
          priority={row.tricho?.priority}
          route={row.tricho?.route}
          onEdit={onEditPriority ? () => onEditPriority(row.rawProduct, 'fagron-genomics-trichotest') : null}
        />
      )
    },
    {
      key: 'nutri',
      header: '🧬 NutriGen',
      width: '18%',
      render: (val, row) => (
        <PriorityPill
          priority={row.nutri?.priority}
          route={row.nutri?.route}
          onEdit={onEditPriority ? () => onEditPriority(row.rawProduct, 'fagron-genomics-nutrigen') : null}
        />
      )
    },
    {
      key: 'overlap',
      header: 'Overlap & Supplier',
      width: '18%',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          {row.programCount >= 3 ? (
            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
              🌐 All 3 Tests
            </span>
          ) : row.programCount === 2 ? (
            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              🎯 2 Tests
            </span>
          ) : (
            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, background: '#f1f5f9', color: '#475569' }}>
              Exclusive (1 Test)
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.supplier}</span>
        </div>
      )
    }
  ], [onSelectProduct, onEditPriority]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ── TOP BANNER & STATS ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px', color: '#1e40af' }}>
            <Dna size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Genomics Active APIs</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{matrixData.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '8px', color: '#3730a3' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Multi-Test Cross Overlap</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3730a3' }}>{sharedCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>APIs</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
            <Info size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Single-Test Specific</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400e' }}>{exclusiveCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>APIs</span></div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH & CHIP FILTERS ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Left: Search & Overlap Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              placeholder="Search active APIs, CAS, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '0.85rem',
                background: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            <button
              onClick={() => setOverlapFilter('all')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: overlapFilter === 'all' ? 600 : 500,
                borderRadius: '6px',
                border: 'none',
                background: overlapFilter === 'all' ? '#ffffff' : 'transparent',
                color: overlapFilter === 'all' ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #64748b)',
                boxShadow: overlapFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              All ({matrixData.length})
            </button>
            <button
              onClick={() => setOverlapFilter('shared')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: overlapFilter === 'shared' ? 600 : 500,
                borderRadius: '6px',
                border: 'none',
                background: overlapFilter === 'shared' ? '#ffffff' : 'transparent',
                color: overlapFilter === 'shared' ? '#2563eb' : 'var(--text-muted, #64748b)',
                boxShadow: overlapFilter === 'shared' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              🎯 Shared in 2+ Tests ({sharedCount})
            </button>
            <button
              onClick={() => setOverlapFilter('exclusive')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: overlapFilter === 'exclusive' ? 600 : 500,
                borderRadius: '6px',
                border: 'none',
                background: overlapFilter === 'exclusive' ? '#ffffff' : 'transparent',
                color: overlapFilter === 'exclusive' ? '#0f172a' : 'var(--text-muted, #64748b)',
                boxShadow: overlapFilter === 'exclusive' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Exclusive ({exclusiveCount})
            </button>
          </div>
        </div>

        {/* Right: Sort controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Sort:</span>
          <button
            onClick={() => setSortField(f => f === 'name' ? 'overlap' : 'name')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowUpDown size={12} />
            {sortField === 'name' ? 'By Name (A-Z)' : 'By Cross-Test Overlap'}
          </button>
        </div>
      </div>

      {/* ── MATRIX DATA TABLE (Golden Rule #3: DataTable Standard) ─────────── */}
      <DataTable
        columns={columns}
        data={filteredData}
        pageSize={50}
        virtualized={false}
      />
    </div>
  );
}
