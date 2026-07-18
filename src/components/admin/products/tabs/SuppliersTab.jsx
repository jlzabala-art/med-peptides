import React from 'react';
import { Card } from '../../../ui';
import DataTable from '../../../ui/DataTable';
import EmptyState from '../../../ui/EmptyState';
import { Building } from '@/lib/icons';

export default function SuppliersTab({ product, form }) {
    const variants = product?.variants || [];
    const uniqueSuppliersMap = {};
    variants.forEach(v => {
      if (v.supplier && !uniqueSuppliersMap[v.supplier]) {
        uniqueSuppliersMap[v.supplier] = {
          name: v.supplier,
          leadTime: v.supplierLeadTime || form.supplierLeadTime || 'N/A',
          moq: v.moq || form.moq || 'N/A',
          variantsCount: 1
        };
      } else if (v.supplier) {
        uniqueSuppliersMap[v.supplier].variantsCount += 1;
      }
    });
    const suppliers = Object.values(uniqueSuppliersMap).map((s, i) => ({ ...s, _idx: i }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Suppliers (Derived from Variants)</h3>
          </div>
          {suppliers.length === 0 ? (
            <EmptyState icon={Building} title="No suppliers found" subtitle="No suppliers found in the variants." />
          ) : (
            <DataTable
              data={suppliers}
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
                  render: () => (
                    <button style={{ padding: '0.3rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}>
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
