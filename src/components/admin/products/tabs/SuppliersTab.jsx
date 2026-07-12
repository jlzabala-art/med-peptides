import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function SuppliersTab({ product, form }) {
    const variants = product?.variants || [];
    // Extract unique suppliers from variants
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
    const suppliers = Object.values(uniqueSuppliersMap);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product Suppliers (Derived from Variants)</h3>
          </div>
          
          {suppliers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              No suppliers found in the variants.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Supplier Name</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Variants Supplied</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Avg Lead Time</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Avg MOQ</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.variantsCount} variant(s)</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.leadTime} days</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{s.moq}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button style={{ padding: '0.3rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
}
