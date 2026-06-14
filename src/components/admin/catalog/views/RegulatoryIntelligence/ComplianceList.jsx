import React, { useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

const StatusChip = ({ label, status }) => {
  const isValid = status === 'Active' || status === 'Valid';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 600,
        backgroundColor: isValid ? '#ecfdf5' : '#fef2f2',
        color: isValid ? '#065f46' : '#991b1b',
        border: `1px solid ${isValid ? '#a7f3d0' : '#fecaca'}`,
      }}
    >
      {label} {isValid ? '✓' : '✕'}
    </div>
  );
};

export function ComplianceList({ profiles, onSelectProfile }) {
  const [expandedProducts, setExpandedProducts] = useState({});

  // Group by Product -> Variant -> Profiles
  const grouped = profiles.reduce((acc, profile) => {
    if (!acc[profile.productName]) acc[profile.productName] = {};
    if (!acc[profile.productName][profile.variantName])
      acc[profile.productName][profile.variantName] = [];
    acc[profile.productName][profile.variantName].push(profile);
    return acc;
  }, {});

  const toggleProduct = (productName) => {
    setExpandedProducts((prev) => ({ ...prev, [productName]: !prev[productName] }));
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical':
        return '#9f1239';
      case 'High':
        return '#be123c';
      case 'Medium':
        return '#b45309';
      default:
        return '#047857';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {Object.entries(grouped).map(([productName, variants]) => {
        const isExpanded = expandedProducts[productName];
        return (
          <div key={productName} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div
              onClick={() => toggleProduct(productName)}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: isExpanded ? '#f9fafb' : '#fff',
                transition: 'background-color 0.2s',
              }}
            >
              {isExpanded ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
              <h3
                style={{ margin: '0 0 0 8px', fontSize: '1rem', fontWeight: 600, color: '#111827' }}
              >
                {productName}
              </h3>
              <span
                style={{
                  marginLeft: '12px',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {Object.values(variants).flat().length} Profiles
              </span>
            </div>

            {isExpanded && (
              <div style={{ padding: '0 16px 16px 44px' }}>
                {Object.entries(variants).map(([variantName, variantProfiles]) => (
                  <div key={variantName} style={{ marginTop: '16px' }}>
                    <h4
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: '#9ca3af', marginRight: '6px' }}>↳</span> {variantName}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {variantProfiles.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectProfile(p)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#9ca3af')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        >
                          <div style={{ flex: '1', minWidth: '200px' }}>
                            <div
                              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}
                            >
                              {p.supplier}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              Market: <strong>{p.market}</strong>
                            </div>
                          </div>

                          <div style={{ flex: '2', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <StatusChip label="REG" status={p.status.registration} />
                            <StatusChip label="COA" status={p.status.coa} />
                            <StatusChip label="GMP" status={p.status.gmp} />
                            <StatusChip label="IMP" status={p.status.importPermit} />
                            <StatusChip label="CPP" status={p.status.cpp} />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: getRiskColor(p.riskLevel),
                              }}
                            >
                              Risk: {p.riskLevel}
                            </span>
                            <span
                              style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 500 }}
                            >
                              View Profile →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
