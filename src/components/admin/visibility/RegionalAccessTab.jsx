import Globe from "lucide-react/dist/esm/icons/globe";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import React, { useState } from 'react';







const REGIONS = [
  { id: 'gcc', name: 'GCC', countries: ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'] },
  { id: 'eu', name: 'Europe', countries: ['UK', 'Germany', 'France', 'Spain'] },
  { id: 'latam', name: 'LATAM', countries: ['Brazil', 'Mexico', 'Colombia'] }
];

export default function RegionalAccessTab() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  if (selectedCountry) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setSelectedCountry(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>Regions</button>
          <ChevronRight size={16} color="#94a3b8" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCountry}</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Regional Visibility Center: {selectedCountry}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>240</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Products Available</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>18</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Products Restricted</div>
            </div>
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>7</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Pending Registration</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0071bd' }}>Active</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Price Matrix</div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Missing Documentation (Blocking Visibility)</h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { prod: 'Retatrutide 10mg', missing: 'Certificate of Analysis (CoA)' },
              { prod: 'BPC-157 5mg', missing: 'Local Registration Approval' }
            ].map((issue, idx) => (
              <div key={idx} style={{ padding: '16px', borderBottom: idx === 0 ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{issue.prod}</span>
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                  <FileWarning size={16} /> {issue.missing}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Globe size={24} color="#0071bd" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Global Access Map</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {REGIONS.map(region => (
          <div key={region.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#0f172a' }}>
              {region.name}
            </div>
            <div>
              {region.countries.map(country => (
                <div 
                  key={country} 
                  onClick={() => setSelectedCountry(country)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid #e2e8f0', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#64748b" />
                    <span style={{ fontWeight: 600 }}>{country}</span>
                  </div>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}