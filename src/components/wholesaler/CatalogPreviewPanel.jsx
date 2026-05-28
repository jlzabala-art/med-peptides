import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, FileText, Check, HelpCircle, Shield, AlertTriangle } from 'lucide-react';

export default function CatalogPreviewPanel({ catalog, products = [], protocols = [], recipientName = '', clinicName = '' }) {
  const [activeFaq, setActiveFaq] = useState(null);

  // Helper to find full product info from id
  const getProductInfo = (id) => {
    return products.find(p => p.id === id || p.slug === id);
  };

  // Helper to find full protocol info from id
  const getProtocolInfo = (id) => {
    return protocols.find(p => p.id === id || p.protocol_id === id || p.protocol_slug === id);
  };

  // Apply custom branding variables if set
  const primaryColor = catalog?.branding?.primaryColor || '#1a73e8'; // Google Blue default
  const secondaryColor = catalog?.branding?.secondaryColor || '#185abc';
  const logoUrl = catalog?.branding?.logoUrl || '';
  const companyName = catalog?.branding?.companyName || 'Med-Peptides Franchise';

  const previewStyle = {
    fontFamily: catalog?.branding?.fontFamily || "'Inter', sans-serif",
    color: '#202124',
    backgroundColor: 'var(--color-bg-app)',
    minHeight: '100%',
    padding: '2rem 1.5rem',
    borderRadius: '8px',
    border: '1px dashed #c2c3c5',
  };

  return (
    <div style={previewStyle}>
      {/* Dynamic Personalization Header Banner */}
      {(recipientName || clinicName) && (
        <div style={{
          backgroundColor: '#e8f0fe',
          borderLeft: `4px solid ${primaryColor}`,
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Shield size={20} color={primaryColor} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#185abc' }}>
              EXCLUSIVELY PREPARED FOR:
            </div>
            <div style={{ fontSize: '0.9rem', color: '#202124', fontWeight: 500 }}>
              {recipientName ? recipientName : 'Clinical Director'} {clinicName ? `· ${clinicName}` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Main branded Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #dadce0',
        marginBottom: '2rem'
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} style={{ maxHeight: '48px', objectFit: 'contain' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-bg-surface)',
              fontWeight: 800
            }}>
              M
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: primaryColor }}>{companyName}</span>
          </div>
        )}
        <div style={{ fontSize: '0.75rem', color: '#5f6368', fontWeight: 500 }}>
          Territory: {catalog?.territory || 'US'}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#202124',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {catalog?.heroTitle || 'Clinical Portfolio'}
        </h1>
        {catalog?.heroSubtitle && (
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 500,
            color: primaryColor,
            marginBottom: '1rem'
          }}>
            {catalog.heroSubtitle}
          </h2>
        )}
        {catalog?.heroDescription && (
          <p style={{
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: '#5f6368',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {catalog.heroDescription}
          </p>
        )}
      </section>

      {/* Dynamic Theme-Based Sections */}
      {catalog?.sections?.map((section, idx) => (
        <section key={idx} style={{ marginBottom: '3rem' }}>
          <div style={{
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#202124' }}>
              {section.title}
            </h3>
            {section.description && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#5f6368' }}>
                {section.description}
              </p>
            )}
          </div>

          {/* Section Products Grid */}
          {section.products?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {section.products.map(prodId => {
                const prod = getProductInfo(prodId);
                if (!prod) return null;
                return (
                  <div key={prodId} style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#f1f3f4',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: primaryColor
                        }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#202124' }}>
                            {prod.displayName || prod.name}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#5f6368',
                            backgroundColor: '#f1f3f4',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {prod.productType || 'peptide'}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        color: '#5f6368',
                        margin: '0 0 1rem 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prod.desc || prod.science?.desc || 'Clinical reference details pending review.'}
                      </p>
                    </div>

                    <div style={{
                      borderTop: '1px solid #f1f3f4',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3c4043' }}>
                        {catalog.pricingVisible ? (
                          <span style={{ color: '#137333', fontSize: '0.95rem', fontWeight: 700 }}>
                            {prod.defaultVariant?.pricing?.retailPrice?.base?.kitUSD 
                              ? `$${prod.defaultVariant.pricing.retailPrice.base.kitUSD}`
                              : 'Contact for Pricing'}
                          </span>
                        ) : (
                          <span style={{ color: '#5f6368', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={12} /> Restricted
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                        {prod.defaultVariant?.route?.replace('_', ' ') || 'Injectable Vial'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section Protocols List */}
          {section.protocols?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {section.protocols.map(protoId => {
                const proto = getProtocolInfo(protoId);
                if (!proto) return null;
                return (
                  <div key={protoId} style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid #dadce0',
                    borderLeft: `4px solid ${primaryColor}`,
                    borderRadius: '4px',
                    padding: '1rem',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.05)'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#202124' }}>
                      Protocol: {proto.name || proto.protocol_id}
                    </h4>
                    <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8rem', color: '#5f6368' }}>
                      {proto.description || proto.goal || 'Clinical protocol guidelines.'}
                    </p>
                    {proto.phases && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {proto.phases.map((phase, pIdx) => (
                          <span key={pIdx} style={{
                            fontSize: '0.7rem',
                            color: primaryColor,
                            backgroundColor: '#e8f0fe',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600
                          }}>
                            {phase.name || `Phase ${pIdx + 1}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* AI Generated FAQ */}
      {catalog?.faq?.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#202124',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <HelpCircle size={18} color={primaryColor} /> Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {catalog.faq.map((faq, fIdx) => (
              <div key={fIdx} style={{
                border: '1px solid #dadce0',
                borderRadius: '4px',
                backgroundColor: 'var(--color-bg-surface)'
              }}>
                <button
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: '#202124',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  <span>{activeFaq === fIdx ? '−' : '+'}</span>
                </button>
                {activeFaq === fIdx && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid #dadce0',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    color: '#5f6368',
                    backgroundColor: '#fafafa'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upsells and Cross-Sells */}
      {((catalog?.upsells?.length > 0) || (catalog?.crossSellRecommendations?.length > 0)) && (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          {catalog?.upsells?.length > 0 && (
            <div style={{
              background: '#e6f4ea',
              border: '1px solid #137333',
              borderRadius: '8px',
              padding: '1.25rem'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#137333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> Clinical Synergies & Boosters
              </h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: '#137333', lineHeight: 1.6 }}>
                {catalog.upsells.map((up, uIdx) => (
                  <li key={uIdx} style={{ marginBottom: '0.5rem' }}>
                    <strong>{up.name}</strong>: {up.benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {catalog?.crossSellRecommendations?.length > 0 && (
            <div style={{
              background: '#fef7e0',
              border: '1px solid #b06000',
              borderRadius: '8px',
              padding: '1.25rem'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#b06000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={16} /> Recommended Combinations
              </h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: '#b06000', lineHeight: 1.6 }}>
                {catalog.crossSellRecommendations.map((cr, cIdx) => (
                  <li key={cIdx} style={{ marginBottom: '0.5rem' }}>
                    <strong>{cr.name}</strong>: {cr.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Clinical Disclaimer */}
      {catalog?.disclaimer && (
        <div style={{
          borderTop: '1px solid #dadce0',
          paddingTop: '1rem',
          fontSize: '0.75rem',
          color: '#5f6368',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          {catalog.disclaimer}
        </div>
      )}
    </div>
  );
}
