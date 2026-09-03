import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function VariantsTab({ product }) {
    const variants = product?.variants || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Product Variants</h3>
            <button style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: '#0f172a',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              + Add Variant
            </button>
          </div>
          
          {variants.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              No variants defined for this product yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {variants.map((v, i) => (
                <div key={v.id || i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '4px' }}>
                      {v.name || v.sku || `Variant ${i+1}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '12px' }}>
                      <span>SKU: {v.sku || 'N/A'}</span>
                      <span>Supplier: {v.supplier || 'N/A'}</span>
                      <span>Stock: {v.stock || 0}</span>
                    </div>
                  </div>
                  <button style={{ padding: '0.4rem 0.6rem', border: '1px solid #334155', borderRadius: '4px', backgroundColor: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
}
