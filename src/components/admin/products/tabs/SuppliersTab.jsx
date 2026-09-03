"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '../../../ui';
import DataTable from '../../../ui/DataTable';
import EmptyState from '../../../ui/EmptyState';
import { Building, CheckCircle2, Loader } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import * as fb from '../../../../firebase';
const db = fb?.db;

// In-memory cache to avoid re-fetching on every render
let _suppliersCache = null;
let _suppliersCacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function loadSuppliers() {
  const now = Date.now();
  if (_suppliersCache && (now - _suppliersCacheTs) < CACHE_TTL) return _suppliersCache;
  try {
    const q = query(
      collection(db, 'wholesellers'),
      where('productsSupplied', '>', 0),
      orderBy('productsSupplied', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    _suppliersCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    _suppliersCacheTs = now;
    return _suppliersCache;
  } catch {
    return [];
  }
}

export default function SuppliersTab({ product, form = {}, setForm, onSupplierClick }) {
  const [firestoreSuppliers, setFirestoreSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    setLoadingSuppliers(true);
    loadSuppliers()
      .then(list => setFirestoreSuppliers(list))
      .finally(() => setLoadingSuppliers(false));
  }, []);

  const variants = product?.variants || [];
  const uniqueSuppliersMap = {};
  variants.forEach(v => {
    const key = v.supplierId || v.supplier;
    if (!key) return;
    if (!uniqueSuppliersMap[key]) {
      uniqueSuppliersMap[key] = {
        id: key,
        name: v.supplierName || v.supplier || key,
        leadTime: v.supplierLeadTime || form.supplierLeadTime || 'N/A',
        moq: v.moq || form.moq || 'N/A',
        variantsCount: 1
      };
    } else {
      uniqueSuppliersMap[key].variantsCount += 1;
    }
  });
  const variantSupplierRows = Object.values(uniqueSuppliersMap).map((s, i) => ({ ...s, _idx: i }));

  const handleAssignSupplier = (supplierId) => {
    const supplier = firestoreSuppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    const supplierName = supplier.companyName || supplier.name || supplierId;
    if (setForm) {
      setForm(prev => ({
        ...prev,
        supplierId,
        supplier: supplierName,
      }));
      toast.success(`Assigned ${supplierName} as Primary Supplier`);
    }
  };

  // The currently selected supplier ID (prefer supplierId field, fallback to matching by name)
  const currentSupplierId = form.supplierId
    || firestoreSuppliers.find(s => (s.companyName || s.name) === form.supplier)?.id
    || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Primary Supplier Assignment Card */}
      <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
          Primary Supplier Assignment
        </h3>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
              {loadingSuppliers ? 'Loading suppliers…' : 'Current Primary Supplier'}
            </label>
            {loadingSuppliers ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', padding: '0.55rem 0' }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
              </div>
            ) : (
              <select
                value={currentSupplierId}
                onChange={(e) => handleAssignSupplier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  fontWeight: 600
                }}
              >
                <option value="">-- Select Primary Supplier --</option>
                {firestoreSuppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.companyName || s.name} ({s.productsSupplied ?? 0} products)
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentSupplierId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#064e3b', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #059669', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              Active: {form.supplier || currentSupplierId}
            </div>
          )}
        </div>

        {/* Quick Assign Buttons from Firestore */}
        {!loadingSuppliers && firestoreSuppliers.length > 0 && (
          <>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
              Quick Assign ({firestoreSuppliers.length} available):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {firestoreSuppliers.slice(0, 8).map(sup => {
                const isSelected = currentSupplierId === sup.id;
                const label = sup.companyName || sup.name;
                return (
                  <button
                    key={sup.id}
                    onClick={() => handleAssignSupplier(sup.id)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #10b981' : '1px solid #374151',
                      backgroundColor: isSelected ? '#064e3b' : '#1e293b',
                      color: isSelected ? '#34d399' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}{label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Derived Variants Table */}
      <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
            Variant Specific Suppliers
          </h3>
        </div>
        {variantSupplierRows.length === 0 ? (
          <EmptyState icon={Building} title="No variant suppliers" subtitle="All variants use the primary supplier or default configuration." />
        ) : (
          <DataTable
            data={variantSupplierRows}
            keyField="_idx"
            emptyTitle="No suppliers"
            columns={[
              { key: 'name', header: 'Supplier Name', sortKey: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'variantsCount', header: 'Variants Supplied', sortValue: (r) => r.variantsCount, render: (r) => `${r.variantsCount} variant(s)` },
              { key: 'leadTime', header: 'Avg Lead Time', render: (r) => `${r.leadTime} days` },
              { key: 'moq', header: 'Avg MOQ' },
              {
                key: '_actions',
                header: 'Actions',
                align: 'right',
                render: (r) => (
                  <button
                    onClick={() => { if (onSupplierClick) onSupplierClick(r); }}
                    style={{ padding: '0.3rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    View Details
                  </button>
                )
              }
            ]}
          />
        )}
      </Card>
    </div>
  );
}
