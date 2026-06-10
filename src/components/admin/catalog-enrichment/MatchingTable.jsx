import React from 'react';
import { Card } from '../../ui';
import { AlertCircle, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';

export default function MatchingTable({ auditResults, loading, onRowClick }) {
  
  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'var(--color-success)';
    if (conf >= 60) return '#f59e0b'; // yellow/orange
    if (conf > 0) return '#ef4444'; // red
    return 'var(--text-muted)';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return <span style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Ready</span>;
      case 'Needs Review':
        return <span style={{ padding: '2px 6px', background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Review</span>;
      case 'Error':
      case 'Missing in DB':
        return <span style={{ padding: '2px 6px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Missing</span>;
      default:
        return <span style={{ padding: '2px 6px', background: 'var(--color-bg-hover)', color: 'var(--text-muted)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>{status || 'Unknown'}</span>;
    }
  };

  return (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="gcp-table" style={{ width: '100%', minWidth: '800px', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Requested Product</th>
              <th>Matched Product (DB)</th>
              <th style={{ textAlign: 'center' }}>Match Confidence</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Zoho Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Analyzing Catalog...</p>
                </td>
              </tr>
            ) : auditResults.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No items found in audit.
                </td>
              </tr>
            ) : (
              auditResults.map((res, i) => (
                <tr 
                  key={i} 
                  onClick={() => onRowClick && onRowClick(res)}
                  style={{ 
                    cursor: 'pointer',
                    background: res.confidence === 0 ? '#fffbeb' : 'transparent',
                    borderBottom: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = res.confidence === 0 ? '#fffbeb' : 'transparent'}
                >
                  <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{res.item}</td>
                  <td style={{ color: res.productInfo ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {res.productInfo?.name || <span style={{ fontStyle: 'italic' }}>No Match</span>}
                  </td>
                  
                  {/* Confidence Column */}
                  <td style={{ textAlign: 'center' }}>
                    {res.confidence > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 700, color: getConfidenceColor(res.confidence) }}>{res.confidence}%</span>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
                          <div style={{ width: `${res.confidence}%`, height: '100%', backgroundColor: getConfidenceColor(res.confidence), borderRadius: '2px' }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>0%</span>
                    )}
                  </td>

                  <td>{res.supplier || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                  
                  <td>{res.price ? `$${res.price.toFixed(2)}` : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                  
                  <td>{getStatusBadge(res.zohoStatus)}</td>
                  
                  <td>
                    {res.confidence >= 90 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Synced
                      </span>
                    ) : res.confidence > 0 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontSize: '0.8rem', fontWeight: 600 }}>
                        <HelpCircle size={14} /> Review
                      </span>
                    ) : (
                      <button 
                        className="gcp-btn gcp-btn--primary"
                        onClick={(e) => { e.stopPropagation(); /* trigger manual add */ }}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Create
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
}
