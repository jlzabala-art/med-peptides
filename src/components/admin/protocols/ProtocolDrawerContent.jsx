import React, { useState } from 'react';
import { Clock, FlaskConical } from 'lucide-react';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';

function formatDate(ts) {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function ProtocolDrawerContent({ protocol, products = [], onProductClick }) {
  const [activeTab, setActiveTab] = useState('overview');

  const meta = {
    bg:
      protocol.status === 'active'
        ? '#dcfce7'
        : protocol.status === 'archived'
          ? '#f1f5f9'
          : '#fef9c3',
    color:
      protocol.status === 'active'
        ? '#166534'
        : protocol.status === 'archived'
          ? '#64748b'
          : '#854d0e',
    border:
      protocol.status === 'active'
        ? '#bbf7d0'
        : protocol.status === 'archived'
          ? '#e2e8f0'
          : '#fef08a',
    emoji: protocol.status === 'active' ? '🟢' : protocol.status === 'archived' ? '⚪' : '🟡',
    label:
      protocol.status === 'active'
        ? 'Active'
        : protocol.status === 'archived'
          ? 'Archived'
          : 'Draft',
  };

  const getProductDetails = (productId, productName) => {
    if (!productId) return { name: productName || 'Unknown Product' };
    const found = products.find((p) => p.id === productId);
    return found || { name: productName || 'Unknown Product' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <span
          style={{
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {meta.emoji} {meta.label}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Created: {formatDate(protocol.created_at)}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          <FlaskConical size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {(protocol.phases ?? []).length} Phase{(protocol.phases ?? []).length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabs */}
      <StandardDrawerTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Clinical Timeline' },
          { id: 'dosage', label: 'Dosage & Logistics' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {protocol.overview_summary && (
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Overview
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
                  {protocol.overview_summary}
                </p>
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.4rem',
                }}
              >
                Therapeutic Category
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
                {protocol.therapeutic_category || 'Uncategorized'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Protocol Timeline
            </div>
            {(protocol.phases ?? []).length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                No timeline available.
              </p>
            ) : (
              <div
                style={{
                  position: 'relative',
                  paddingLeft: '1.5rem',
                  borderLeft: '2px solid #e2e8f0',
                }}
              >
                {(protocol.phases ?? []).map((phase, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '2rem' }}>
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.9rem',
                        top: '0.2rem',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        border: '2px solid white',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                          {phase.label || `Phase ${idx + 1}`}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Duration:{' '}
                          {phase.durationWeeks ? `${phase.durationWeeks} weeks` : 'Continuous'}
                        </div>
                      </div>
                    </div>

                    {/* Timeline items abstract */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      {(phase.items ?? []).map((item, j) => {
                        const product = getProductDetails(
                          item.productId,
                          item.productName || item.product_name
                        );
                        return (
                          <div
                            key={j}
                            onClick={() =>
                              onProductClick && item.productId && onProductClick(product)
                            }
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: '#f1f5f9',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: '#334155',
                              cursor: onProductClick && item.productId ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) => {
                              if (onProductClick && item.productId)
                                e.currentTarget.style.background = '#e2e8f0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                            }}
                            title={onProductClick && item.productId ? 'View product details' : ''}
                          >
                            {product.name}
                            {onProductClick && item.productId && (
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>↗</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dosage' && (
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Dosage & Protocol Logistics
            </div>
            {(protocol.phases ?? []).length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                No products defined.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(protocol.phases ?? []).map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#0f172a',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {phase.label || `Phase ${idx + 1}`}
                    </div>
                    {(phase.items ?? []).length > 0 ? (
                      <div
                        style={{
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          margin: '0 -0.5rem',
                          padding: '0 0.5rem',
                        }}
                      >
                        <table
                          style={{
                            minWidth: '400px',
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.85rem',
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                borderBottom: '1px solid #e2e8f0',
                                color: '#64748b',
                                textAlign: 'left',
                              }}
                            >
                              <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Product</th>
                              <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Dosage</th>
                              <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Frequency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(phase.items ?? []).map((item, j) => {
                              const product = getProductDetails(
                                item.productId,
                                item.productName || item.product_name
                              );
                              return (
                                <tr
                                  key={j}
                                  style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    cursor:
                                      onProductClick && item.productId ? 'pointer' : 'default',
                                  }}
                                  onClick={() =>
                                    onProductClick && item.productId && onProductClick(product)
                                  }
                                  onMouseEnter={(e) => {
                                    if (onProductClick && item.productId)
                                      e.currentTarget.style.background = '#f8fafc';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '';
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: '0.75rem 0',
                                      color: '#0f172a',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {product.name}
                                    {!item.productId && (
                                      <span
                                        style={{
                                          marginLeft: '6px',
                                          fontSize: '0.65rem',
                                          padding: '2px 4px',
                                          background: '#fef08a',
                                          color: '#854d0e',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        Legacy Name
                                      </span>
                                    )}
                                    {onProductClick && item.productId && (
                                      <span
                                        style={{
                                          marginLeft: '4px',
                                          fontSize: '0.65rem',
                                          color: '#94a3b8',
                                        }}
                                      >
                                        ↗
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.75rem 0', color: '#475569' }}>
                                    {item.dosage || '—'}
                                  </td>
                                  <td style={{ padding: '0.75rem 0', color: '#475569' }}>
                                    {item.frequency || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          fontStyle: 'italic',
                        }}
                      >
                        No products in this phase.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
