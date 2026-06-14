import Table from "lucide-react/dist/esm/icons/table";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import Search from "lucide-react/dist/esm/icons/search";
import React from 'react';




export default function BenchmarkingWorkspace({ onProductClick, matches = [], loading = false }) {
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading benchmarking data...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Product Benchmarking Matrix</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.4rem 0.8rem' }}><Search size={14}/> Search</button>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.4rem 0.8rem' }}><Table size={14}/> Matrix</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Product</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Retail</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Wholesale</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Distributor</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Margin %</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Comp Avg</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, idx) => {
              const p = {
                name: match.productName,
                retail: match.myPPMs ? match.myPPMs.retail * match.myMg : 0,
                wholesale: match.myPPMs ? match.myPPMs.wholesaler * match.myMg : 0,
                distributor: match.myPPMs ? match.myPPMs.distributor * match.myMg : 0,
                margin: 'TBD',
                compAvg: match.competitors.length > 0 ? match.competitors.reduce((acc, curr) => acc + curr.price_usd, 0) / match.competitors.length : 0,
                score: 85
              };

              return (
              <tr key={idx} onClick={() => onProductClick(p)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${p.retail?.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${p.wholesale?.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${p.distributor?.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 600 }}>{p.margin}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${p.compAvg?.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ backgroundColor: p.score > 80 ? '#dcfce7' : '#fef3c7', color: p.score > 80 ? '#166534' : '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {p.score}/100
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}