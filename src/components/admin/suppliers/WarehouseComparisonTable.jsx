'use client';

import React, { useState, useMemo } from 'react';
import { DataTable, StatusBadge, CopyableId } from '../../ui';
import { Building, MapPin, Truck, AlertTriangle, CheckCircle, Search, Filter, Layers, DollarSign, ArrowRight } from '@/lib/icons';

export default function WarehouseComparisonTable({
  supplier = null,
  products = [],
  onSelectWarehouse = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all | both | diff | europe_only
  const [activeWarehouseTab, setActiveWarehouseTab] = useState('compare'); // compare | europe | usa

  // Extract all variants from products that have Lotusland / supplier warehouse offers
  const comparisonRows = useMemo(() => {
    const rows = [];

    products.forEach(p => {
      const pName = p.canonicalName || p.name || 'Product';
      const variants = Array.isArray(p.variants) ? p.variants : [];

      variants.forEach(v => {
        const offers = v.warehouseOffers || {};
        const eurOffer = offers.europe || null;
        const usaOffer = offers.usa || null;

        // If no explicit warehouse offers, synthesize from legacy supplierId
        if (!eurOffer && !usaOffer) {
          const sId = String(v.supplierId || '').toLowerCase();
          if (!sId.includes('lotusland') && !v.id?.toLowerCase().startsWith('lotusland-')) return;
        }

        const dosage = v.dosage || v.dose || v.normalizedDosage || 'Standard';
        const unitsPerKit = Number(v.unitsPerKit || v.unitsPerPack || 10) || 10;

        // Europe Offer specs
        const eurKitCost = eurOffer?.costPerKit ?? (v.supplierKitCostUSD || v.cost_10 || v.pricing?.master?.kit || null);
        const eurUnitCost = eurOffer?.costPerUnit ?? (eurKitCost ? eurKitCost / unitsPerKit : null);
        const eurAvail = eurOffer?.availability || 'available';

        // USA Offer specs
        const isHmg = pName.toLowerCase().includes('hmg') || v.id?.toLowerCase().includes('hmg');
        const isAncillary = pName.toLowerCase().includes('syringe') || pName.toLowerCase().includes('bac') || p.id?.toLowerCase().includes('bac');

        let usaKitCost = usaOffer?.costPerKit;
        let usaUnitCost = usaOffer?.costPerUnit;
        let usaAvail = usaOffer?.availability;

        if (usaKitCost === undefined && usaAvail === undefined) {
          if (isAncillary) {
            usaKitCost = null;
            usaUnitCost = null;
            usaAvail = 'not_listed';
          } else if (isHmg) {
            usaKitCost = 380;
            usaUnitCost = 38;
            usaAvail = 'available';
          } else {
            usaKitCost = eurKitCost;
            usaUnitCost = eurUnitCost;
            usaAvail = eurAvail;
          }
        }

        // Calculate delta
        let deltaAmount = 0;
        let deltaPercent = 0;
        let isDelta = false;

        if (eurKitCost != null && usaKitCost != null) {
          deltaAmount = usaKitCost - eurKitCost;
          if (eurKitCost > 0) {
            deltaPercent = Number(((deltaAmount / eurKitCost) * 100).toFixed(1));
          }
          if (Math.abs(deltaAmount) > 0.01) {
            isDelta = true;
          }
        }

        rows.push({
          id: `${p.id}-${v.id}`,
          productId: p.id,
          variantId: v.id,
          productName: pName,
          dosage,
          unitsPerKit,
          format: v.format || v.presentation || 'Vial',
          eurKitCost,
          eurUnitCost,
          eurAvail,
          usaKitCost,
          usaUnitCost,
          usaAvail: usaAvail || 'available',
          deltaAmount,
          deltaPercent,
          isDelta,
          isAncillary
        });
      });
    });

    return rows;
  }, [products]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return comparisonRows.filter(row => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = row.productName.toLowerCase().includes(q);
        const matchDose = row.dosage.toLowerCase().includes(q);
        if (!matchName && !matchDose) return false;
      }

      // Availability / Delta filter
      if (availabilityFilter === 'diff' && !row.isDelta) return false;
      if (availabilityFilter === 'europe_only' && row.usaAvail !== 'not_listed') return false;
      if (availabilityFilter === 'both' && (row.eurAvail !== 'available' || row.usaAvail !== 'available')) return false;

      return true;
    });
  }, [comparisonRows, searchQuery, availabilityFilter]);

  // Columns definition (Rule #3 & Rule #30: exact widths, no horizontal scrolling)
  const columns = [
    {
      id: 'product',
      header: 'Product / Formulation',
      width: '28%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)', fontSize: '0.85rem' }}>
            {row.productName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              {row.dosage} • {row.unitsPerKit} units/kit
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'europeWarehouse',
      header: 'Europe (RegenPept / Poland Hub)',
      width: '24%',
      render: (row) => {
        if (row.eurAvail === 'not_listed') {
          return <StatusBadge status="inactive">Not listed</StatusBadge>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem', fontFamily: 'monospace' }}>
                ${row.eurKitCost != null ? Number(row.eurKitCost).toLocaleString() : '—'}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>/ kit</span>
              {row.eurUnitCost != null && (
                <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 600 }}>
                  (${Number(row.eurUnitCost).toFixed(2)}/u)
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>
              ✓ Available (2–4d EU Express)
            </span>
          </div>
        );
      }
    },
    {
      id: 'usaWarehouse',
      header: 'USA (PeptideGurus / Arizona Hub)',
      width: '24%',
      render: (row) => {
        if (row.usaAvail === 'not_listed') {
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Not listed in USA
            </span>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem', fontFamily: 'monospace' }}>
                ${row.usaKitCost != null ? Number(row.usaKitCost).toLocaleString() : '—'}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>/ kit</span>
              {row.usaUnitCost != null && (
                <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 600 }}>
                  (${Number(row.usaUnitCost).toFixed(2)}/u)
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>
              ✓ Available (2–3d USPS ~$20)
            </span>
          </div>
        );
      }
    },
    {
      id: 'priceDifference',
      header: 'Variance & Delta',
      width: '24%',
      render: (row) => {
        if (row.usaAvail === 'not_listed') {
          return (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Europe exclusive
            </span>
          );
        }

        if (row.isDelta) {
          const isUsaMoreExpensive = row.deltaAmount > 0;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: isUsaMoreExpensive ? '#b45309' : '#15803d',
                background: isUsaMoreExpensive ? '#fef3c7' : '#dcfce7',
                border: `1px solid ${isUsaMoreExpensive ? '#fde68a' : '#bbf7d0'}`,
                padding: '2px 8px',
                borderRadius: '6px',
                width: 'fit-content'
              }}>
                <AlertTriangle size={12} />
                {isUsaMoreExpensive ? `+` : `-`}${Math.abs(row.deltaAmount)} ({row.deltaPercent > 0 ? `+` : ``}{row.deltaPercent}%) in USA
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Check destination before sourcing
              </span>
            </div>
          );
        }

        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#0369a1',
            background: '#e0f2fe',
            border: '1px solid #bfdbfe',
            padding: '2px 8px',
            borderRadius: '4px',
            width: 'fit-content'
          }}>
            <CheckCircle size={11} color="#0284c7" /> $0 (Price Parity)
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── Warehouse Overview Hub Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        
        {/* Europe Warehouse Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇪🇺</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Europe Warehouse
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  RegenPept Catalogue • Hub: Poland
                </span>
              </div>
            </div>
            <StatusBadge status="active">Active Hub</StatusBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: '#475569' }}>
            <div><strong>Logistics:</strong> Poland (UK/USA options)</div>
            <div><strong>Lead Time:</strong> 2–4 Business Days</div>
            <div><strong>Currency:</strong> USD (Cost Base)</div>
            <div><strong>Shipping:</strong> Destination rate ($78 EU)</div>
          </div>
        </div>

        {/* USA Warehouse Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇺🇸</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  USA Warehouse
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  PeptideGurus Catalogue • Hub: Arizona
                </span>
              </div>
            </div>
            <StatusBadge status="active">Active Hub</StatusBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: '#475569' }}>
            <div><strong>Logistics:</strong> Arizona, USA Domestic</div>
            <div><strong>Lead Time:</strong> 2–3 Business Days</div>
            <div><strong>Carrier:</strong> USPS Priority Flat Rate</div>
            <div><strong>Domestic Shipping:</strong> ~$20.00 USD</div>
          </div>
        </div>

      </div>

      {/* ── Toolbar: Search & Difference Filters ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter product or dosage..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '0.80rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Filter By:</span>
          <button
            type="button"
            onClick={() => setAvailabilityFilter('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: availabilityFilter === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
              background: availabilityFilter === 'all' ? '#003666' : '#ffffff',
              color: availabilityFilter === 'all' ? '#ffffff' : '#334155'
            }}
          >
            All SKUs ({comparisonRows.length})
          </button>

          <button
            type="button"
            onClick={() => setAvailabilityFilter('diff')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: availabilityFilter === 'diff' ? '1px solid #b45309' : '1px solid #cbd5e1',
              background: availabilityFilter === 'diff' ? '#fef3c7' : '#ffffff',
              color: availabilityFilter === 'diff' ? '#92400e' : '#334155'
            }}
          >
            ⚠️ Price Variance (HMG +$260)
          </button>

          <button
            type="button"
            onClick={() => setAvailabilityFilter('europe_only')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: availabilityFilter === 'europe_only' ? '1px solid #0284c7' : '1px solid #cbd5e1',
              background: availabilityFilter === 'europe_only' ? '#e0f2fe' : '#ffffff',
              color: availabilityFilter === 'europe_only' ? '#0369a1' : '#334155'
            }}
          >
            🇪🇺 Europe Ancillaries Only
          </button>
        </div>
      </div>

      {/* ── Comparison Table (Rule #3: Exclusive DataTable usage) ── */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <DataTable
          data={filteredRows}
          columns={columns}
          keyField="id"
          emptyMessage="No products match the selected warehouse filters."
        />
      </div>

    </div>
  );
}
