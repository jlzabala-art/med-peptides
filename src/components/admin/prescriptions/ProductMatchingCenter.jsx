import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import Check from "lucide-react/dist/esm/icons/check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';





const MOCK_MATCHES = [
  { 
    id: 1, 
    rxName: 'Tirzepatide 15mg', 
    atlasName: 'Tirzepatide 15mg', 
    status: 'available', 
    stock: 42 
  },
  { 
    id: 2, 
    rxName: 'MOTS-C 40mg', 
    atlasName: 'MOTS-C 40mg', 
    status: 'low_stock', 
    stock: 2 
  },
  { 
    id: 3, 
    rxName: 'MK-677', 
    atlasName: null, 
    status: 'unavailable', 
    stock: 0,
    alternatives: ['Tesamorelin', 'Ipamorelin']
  }
];

export default function ProductMatchingCenter() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: '#f8fafc'
      }}>
        <PackageSearch size={18} color="#0071bd" />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Product Matching Center</span>
      </div>

      <div style={{ padding: '0' }}>
        {MOCK_MATCHES.map((match, idx) => (
          <div key={match.id} style={{
            padding: '16px',
            borderBottom: idx < MOCK_MATCHES.length - 1 ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>Rx: {match.rxName}</span>
              {match.status === 'available' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Available</span>}
              {match.status === 'low_stock' && <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>Low Stock</span>}
              {match.status === 'unavailable' && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> Unavailable</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
              <ArrowRight size={16} color="#64748b" />
              {match.atlasName ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{match.atlasName}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Stock: {match.stock}</span>
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>No exact match found</span>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Suggested Alternatives:</span>
                    {match.alternatives.map(alt => (
                      <div key={alt} style={{ fontSize: '13px', color: '#0071bd', fontWeight: 500, cursor: 'pointer' }}>+ {alt}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}