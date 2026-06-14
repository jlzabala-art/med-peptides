import React, { useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Bot from 'lucide-react/dist/esm/icons/bot';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';

export function ComplianceDrawer({ profile, onClose }) {
  const [activeTab, setActiveTab] = useState('documents');

  if (!profile) return null;

  const renderStatus = (status) => {
    const isValid = status === 'Active' || status === 'Valid';
    return (
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '9999px',
          backgroundColor: isValid ? '#ecfdf5' : '#fef2f2',
          color: isValid ? '#065f46' : '#991b1b',
        }}
      >
        {status}
      </span>
    );
  };

  const docs = [
    {
      name: 'Registration Certificate',
      status: profile.status.registration,
      date: profile.expiryDates.registration,
    },
    {
      name: 'Certificate of Analysis (COA)',
      status: profile.status.coa,
      date: profile.expiryDates.coa,
    },
    { name: 'GMP Certificate', status: profile.status.gmp, date: profile.expiryDates.gmp },
    {
      name: 'Import Permit',
      status: profile.status.importPermit,
      date: profile.expiryDates.importPermit,
    },
    { name: 'CPP', status: profile.status.cpp, date: profile.expiryDates.cpp },
    { name: 'Stability Data', status: profile.status.stability, date: null },
    { name: 'MSDS', status: profile.status.msds, date: null },
    { name: 'TDS', status: profile.status.tds, date: null },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '450px',
        maxWidth: '100vw',
        backgroundColor: '#fff',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {/* Header */}
      <div
        style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              Compliance Profile
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {profile.productName} {profile.variantName}
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
              {profile.supplier} • {profile.market}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor:
                profile.riskLevel === 'Critical'
                  ? '#fee2e2'
                  : profile.riskLevel === 'High'
                    ? '#ffedd5'
                    : profile.riskLevel === 'Medium'
                      ? '#fef3c7'
                      : '#d1fae5',
              color:
                profile.riskLevel === 'Critical'
                  ? '#991b1b'
                  : profile.riskLevel === 'High'
                    ? '#9a3412'
                    : profile.riskLevel === 'Medium'
                      ? '#92400e'
                      : '#065f46',
            }}
          >
            {profile.riskLevel} Risk
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        {['documents', 'tracking', 'ai_summary'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: activeTab === tab ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
            }}
          >
            {tab === 'documents'
              ? 'Documents'
              : tab === 'tracking'
                ? 'Expiry Tracking'
                : 'AI Summary'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f9fafb' }}>
        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {docs.map((doc) => (
              <div
                key={doc.name}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#6b7280" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                      {doc.name}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {renderStatus(doc.status)}
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <UploadCloud size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {docs
              .filter((d) => d.date)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((doc) => {
                const isExpired = new Date(doc.date) < new Date();
                const isExpiringSoon =
                  !isExpired && (new Date(doc.date) - new Date()) / 86400000 <= 30;
                return (
                  <div
                    key={doc.name}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}
                  >
                    <div
                      style={{
                        width: '2px',
                        backgroundColor: '#e5e7eb',
                        alignSelf: 'stretch',
                        margin: '0 8px',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '-25px',
                          top: '20px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: isExpired
                            ? '#ef4444'
                            : isExpiringSoon
                              ? '#f59e0b'
                              : '#10b981',
                          border: '2px solid #fff',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '4px',
                        }}
                      >
                        <Clock size={12} /> {new Date(doc.date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                        {doc.name} Expiry
                      </div>
                      {(isExpired || isExpiringSoon) && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: isExpired ? '#ef4444' : '#f59e0b',
                            marginTop: '4px',
                          }}
                        >
                          {isExpired ? 'Already Expired' : 'Action required soon'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {activeTab === 'ai_summary' && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <Bot size={20} color="#4f46e5" />
              <span style={{ fontWeight: 600, color: '#111827' }}>Compliance Analysis</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
              This profile is considered <strong>{profile.riskLevel} Risk</strong> for the{' '}
              {profile.market} market.
              {profile.riskFactors.length > 0 ? (
                <>
                  {' '}
                  Key risk factors include:{' '}
                  <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                    {profile.riskFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </>
              ) : (
                ' All critical documents are valid and up to date.'
              )}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
              <strong>Recommendation:</strong>{' '}
              {profile.riskLevel === 'Critical' || profile.riskLevel === 'High'
                ? 'Halt shipments immediately and contact the supplier to procure missing documentation.'
                : 'Monitor upcoming expiries and begin renewal processes 60 days in advance.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
