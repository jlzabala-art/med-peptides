import React, { useState } from 'react';
import { Activity, ShieldCheck, ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';

export default function CatalogIntelligenceDrawer({ catalogCart, allProducts }) {
  // Mock intelligence calculation
  const getHealthScore = () => {
    if (catalogCart.length === 0) return 0;
    if (catalogCart.length > 10) return 98;
    if (catalogCart.length > 5) return 85;
    return 65;
  };

  const getRiskLevel = () => {
    if (catalogCart.length === 0) return 'N/A';
    if (catalogCart.length > 10) return 'Low';
    if (catalogCart.length > 5) return 'Medium';
    return 'High (Low diversity)';
  };

  const healthScore = getHealthScore();
  const riskLevel = getRiskLevel();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#faf5ff' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} /> Catalog Intelligence
        </h3>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* KPIs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Products</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{catalogCart.length}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Suppliers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{catalogCart.length > 0 ? 1 : 0}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Warehouses</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{catalogCart.length > 0 ? 1 : 0}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Source Risk</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: riskLevel === 'Low' ? '#10b981' : '#ef4444' }}>{riskLevel}</div>
              </div>
            </div>

            {/* Health Score */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Catalog Quality</span>
                <Activity size={16} color={healthScore > 80 ? '#10b981' : '#f59e0b'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{healthScore}%</span>
              </div>
              <div style={{ marginTop: '16px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${healthScore}%`, height: '100%', background: healthScore > 80 ? '#10b981' : '#f59e0b', transition: 'width 0.5s' }}></div>
              </div>
            </div>

          </div>
    </div>
  );
}
