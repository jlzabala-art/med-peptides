import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare, Building2, Download, FileText } from '@/lib/icons';

export default function CatalogPreviewAndShareModal({
  showPreviewModal,
  setShowPreviewModal,
  previewBlobUrl,
  setPreviewBlobUrl,
  catalogMeta,
  publishOptions,
  generatingPreview,
  cartProducts,
  catalogCart,
  activeShareTab,
  setActiveShareTab,
  shareEmail,
  setShareEmail,
  shareEmailSubject,
  setShareEmailSubject,
  shareEmailBody,
  setShareEmailBody,
  saveCatalog,
  sharePhone,
  setSharePhone,
  shareWhatsAppText,
  setShareWhatsAppText,
  shareBiginEmail,
  setShareBiginEmail,
  shareBiginStage,
  setShareBiginStage,
  shareBiginNotes,
  setShareBiginNotes,
  biginSyncing,
  setBiginSyncing,
  toast
}) {
  return (
    <>
      {/* Preview & Share Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPreviewModal(false);
                if (previewBlobUrl) {
                  URL.revokeObjectURL(previewBlobUrl);
                  setPreviewBlobUrl(null);
                }
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#0f172a',
                zIndex: 10000,
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              style={{
                position: 'fixed',
                top: '5%',
                left: '5%',
                right: '5%',
                bottom: '5%',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                    Preview & Share: {catalogMeta.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Verify content layouts and select a delivery channel.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    if (previewBlobUrl) {
                      URL.revokeObjectURL(previewBlobUrl);
                      setPreviewBlobUrl(null);
                    }
                  }}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#475569',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Body */}
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel: Preview (2/3) */}
                <div
                  style={{
                    flex: 2,
                    background: '#f1f5f9',
                    borderRight: '1px solid #e2e8f0',
                    padding: '24px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  {publishOptions.format === 'pdf' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {generatingPreview ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                          <div
                            style={{
                              border: '4px solid #e2e8f0',
                              borderTop: '4px solid #2563eb',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              animation: 'spin 1s linear infinite',
                              margin: '0 auto 12px auto',
                            }}
                          />
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            Compiling PDF preview...
                          </p>
                        </div>
                      ) : previewBlobUrl ? (
                        <iframe
                          src={previewBlobUrl}
                          title="PDF Catalog Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          }}
                        />
                      ) : (
                        <div style={{ margin: 'auto', color: '#dc2626' }}>
                          Failed to compile preview PDF.
                        </div>
                      )}
                    </div>
                  )}

                  {publishOptions.format === 'landing_page' && (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '800px',
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        padding: '32px',
                        fontFamily: "'Inter', sans-serif",
                        color: '#202124',
                      }}
                    >
                      <div
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '12px',
                          marginBottom: '24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                            }}
                          >
                            AH
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2563eb' }}>
                            Atlas Health
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            backgroundColor: '#f1f5f9',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          Web Page Preview ({publishOptions.pdfTemplate})
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1
                          style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 8px 0',
                          }}
                        >
                          {catalogMeta.title || 'Clinical Curation'}
                        </h1>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#475569',
                            maxWidth: '540px',
                          }}
                        >
                          {catalogMeta.description || 'Access compiled medical catalogs.'}
                        </p>
                      </div>

                      {/* Sections & Products list mockup */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            publishOptions.pdfTemplate === 'clinical'
                              ? '1fr'
                              : publishOptions.pdfTemplate === 'minimal'
                                ? 'repeat(auto-fill, minmax(180px, 1fr))'
                                : 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '16px',
                        }}
                      >
                        {cartProducts
                          .filter(
                            (p) => catalogCart.includes(p.id) || catalogCart.includes(p.productId)
                          )
                          .map((prod) => {
                            const pName = prod.displayName || prod.name || '—';
                            const showPrices = publishOptions.showPrices;
                            const priceVal =
                              prod.defaultVariant?.pricing?.retailPrice?.base?.kitUSD ??
                              prod.price ??
                              prod.msrp;
                            const formattedPrice = priceVal
                              ? `$${priceVal.toFixed(2)}`
                              : 'Request Pricing';

                            if (publishOptions.pdfTemplate === 'minimal') {
                              return (
                                <div
                                  key={prod.id}
                                  style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    textAlign: 'center',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      backgroundColor: '#f1f5f9',
                                      borderRadius: '4px',
                                      margin: '0 auto 8px auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#94a3b8',
                                      fontSize: '0.65rem',
                                    }}
                                  >
                                    No Image
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      color: '#0f172a',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {pName}
                                  </div>
                                  {showPrices && (
                                    <div
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                        color: '#16a34a',
                                        marginTop: '6px',
                                      }}
                                    >
                                      {formattedPrice}{' '}
                                      <span
                                        style={{
                                          fontSize: '0.55rem',
                                          color: '#64748b',
                                          fontWeight: 400,
                                        }}
                                      >
                                        ex-works
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (publishOptions.pdfTemplate === 'standard') {
                              return (
                                <div
                                  key={prod.id}
                                  style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'start',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      backgroundColor: '#eff6ff',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#2563eb',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <FileText size={18} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div
                                      style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#0f172a',
                                      }}
                                    >
                                      {pName}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '0.72rem',
                                        color: '#64748b',
                                        display: 'block',
                                        margin: '2px 0',
                                      }}
                                    >
                                      SKU: {prod.sku || 'N/A'}
                                    </div>
                                    <p
                                      style={{
                                        margin: '4px 0',
                                        fontSize: '0.75rem',
                                        color: '#475569',
                                        lineHeight: 1.4,
                                        height: '40px',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {prod.desc || 'Details under review.'}
                                    </p>
                                    {showPrices && (
                                      <div
                                        style={{
                                          fontSize: '0.8rem',
                                          fontWeight: 800,
                                          color: '#16a34a',
                                          marginTop: '4px',
                                        }}
                                      >
                                        {formattedPrice}{' '}
                                        <span
                                          style={{
                                            fontSize: '0.55rem',
                                            color: '#64748b',
                                            fontWeight: 400,
                                          }}
                                        >
                                          ex-works
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // Clinical Layout Preview
                            return (
                              <div
                                key={prod.id}
                                style={{
                                  border: '1px solid #cbd5e1',
                                  borderTop: '4px solid #2563eb',
                                  borderRadius: '8px',
                                  padding: '20px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                                  <div
                                    style={{
                                      width: '70px',
                                      height: '70px',
                                      backgroundColor: '#eff6ff',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#2563eb',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <FileText size={24} />
                                  </div>
                                  <div>
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        color: '#0f172a',
                                      }}
                                    >
                                      {pName}
                                    </h4>
                                    <div
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: '80px 1fr',
                                        gap: '2px 8px',
                                        fontSize: '0.75rem',
                                        color: '#475569',
                                        marginTop: '6px',
                                      }}
                                    >
                                      <strong>SKU:</strong> <span>{prod.sku || 'N/A'}</span>
                                      <strong>Route:</strong>{' '}
                                      <span>
                                        {prod.defaultVariant?.route?.replace(/_/g, ' ') ||
                                          'Subcutaneous'}
                                      </span>
                                    </div>
                                  </div>
                                  {showPrices && (
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                      <div
                                        style={{
                                          fontSize: '0.95rem',
                                          fontWeight: 800,
                                          color: '#16a34a',
                                        }}
                                      >
                                        {formattedPrice}
                                      </div>
                                      <div style={{ fontSize: '0.55rem', color: '#64748b' }}>
                                        ex-works
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.78rem',
                                    background: '#f8fafc',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    borderLeft: '3px solid #2563eb',
                                    color: '#334155',
                                  }}
                                >
                                  <strong>📋 Clinical Summary (AI Consensus):</strong>
                                  <p style={{ margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                    Generates compound details with mechanisms of action and PubMed
                                    references upon publication.
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {publishOptions.format === 'excel' && (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '800px',
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        padding: '24px',
                        overflowX: 'auto',
                      }}
                    >
                      <div
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '12px',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                          Excel Spreadsheet Grid Preview
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#15803d',
                            backgroundColor: '#dcfce7',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          Minimalist Format Only
                        </span>
                      </div>

                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.8rem',
                          textAlign: 'left',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: '#f1f5f9',
                              borderBottom: '2px solid #cbd5e1',
                            }}
                          >
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              SKU
                            </th>
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              Product Name
                            </th>
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              Format / Route
                            </th>
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              Strength / Size
                            </th>
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              Supplier
                            </th>
                            <th style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                              Price (Ex-Works)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts
                            .filter(
                              (p) => catalogCart.includes(p.id) || catalogCart.includes(p.productId)
                            )
                            .map((prod, idx) => {
                              const pName = prod.displayName || prod.name || '—';
                              const priceKey =
                                publishOptions.priceLevel === 'MSRP'
                                  ? 'msrp'
                                  : publishOptions.priceLevel === 'wholesale'
                                    ? 'price'
                                    : 'cost';
                              const priceVal = prod[priceKey] ?? prod.msrp ?? prod.price;
                              const formattedPrice =
                                publishOptions.showPrices && priceVal
                                  ? `€ ${parseFloat(priceVal).toFixed(2)}`
                                  : 'Request Pricing';

                              return (
                                <tr
                                  key={prod.id}
                                  style={{
                                    borderBottom: '1px solid #e2e8f0',
                                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: '10px',
                                      color: '#0f172a',
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {prod.sku || prod.variantSku || '—'}
                                  </td>
                                  <td
                                    style={{ padding: '10px', fontWeight: 500, color: '#0f172a' }}
                                  >
                                    {pName}
                                  </td>
                                  <td style={{ padding: '10px', color: '#475569' }}>
                                    {prod.defaultVariant?.route?.replace(/_/g, ' ') || 'Vial'}
                                  </td>
                                  <td style={{ padding: '10px', color: '#475569' }}>
                                    {prod.defaultVariant?.size || prod.strength || '—'}
                                  </td>
                                  <td style={{ padding: '10px', color: '#475569' }}>
                                    {prod.supplier || 'Atlas Health'}
                                  </td>
                                  <td
                                    style={{ padding: '10px', color: '#16a34a', fontWeight: 600 }}
                                  >
                                    {formattedPrice}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Panel: Sharing channels (1/3) */}
                <div
                  style={{
                    flex: 1,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    overflowY: 'auto',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Select Share Channel
                  </h4>

                  {/* Channel Tab Selector */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                    {[
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      { id: 'bigin', label: 'Zoho Bigin', icon: Building2 },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeShareTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveShareTab(tab.id)}
                          style={{
                            flex: 1,
                            padding: '10px 4px',
                            background: 'none',
                            border: 'none',
                            borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                            color: isActive ? '#2563eb' : '#64748b',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeShareTab === 'email' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Client Email
                          </label>
                          <input
                            type="email"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="client@clinic.com"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Subject
                          </label>
                          <input
                            type="text"
                            value={shareEmailSubject}
                            onChange={(e) => setShareEmailSubject(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Message Body
                          </label>
                          <textarea
                            value={shareEmailBody}
                            onChange={(e) => setShareEmailBody(e.target.value)}
                            rows={6}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              resize: 'none',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!shareEmail) {
                              toast.error('Recipient email is required');
                              return;
                            }
                            saveCatalog({
                              channel: 'email',
                              recipient: shareEmail,
                              subject: shareEmailSubject,
                              body: shareEmailBody,
                            });
                          }}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Mail size={16} />
                          Publish & Send Email
                        </button>
                      </div>
                    )}

                    {activeShareTab === 'whatsapp' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Client Phone (with country code)
                          </label>
                          <input
                            type="text"
                            value={sharePhone}
                            onChange={(e) => setSharePhone(e.target.value)}
                            placeholder="e.g. +34600123456"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Prefilled Text
                          </label>
                          <textarea
                            value={shareWhatsAppText}
                            onChange={(e) => setShareWhatsAppText(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              resize: 'none',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!sharePhone) {
                              toast.error('Client phone number is required');
                              return;
                            }
                            saveCatalog({
                              channel: 'whatsapp',
                              phone: sharePhone,
                              text: shareWhatsAppText,
                            });
                          }}
                          style={{
                            backgroundColor: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <MessageSquare size={16} />
                          Publish & Share on WhatsApp
                        </button>
                      </div>
                    )}

                    {activeShareTab === 'bigin' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Zoho Bigin Contact Email
                          </label>
                          <input
                            type="email"
                            value={shareBiginEmail}
                            onChange={(e) => setShareBiginEmail(e.target.value)}
                            placeholder="contact@bigin.com"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Pipeline Stage
                          </label>
                          <select
                            value={shareBiginStage}
                            onChange={(e) => setShareBiginStage(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              background: '#fff',
                            }}
                          >
                            <option value="qualification">Qualification</option>
                            <option value="proposition">Proposal / Negotiation</option>
                            <option value="delivered">Catalog Delivered</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                              marginBottom: '6px',
                            }}
                          >
                            Notes / Context
                          </label>
                          <textarea
                            value={shareBiginNotes}
                            onChange={(e) => setShareBiginNotes(e.target.value)}
                            placeholder="Catalog created and sent during call..."
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              resize: 'none',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!shareBiginEmail) {
                              toast.error('Bigin contact email is required');
                              return;
                            }
                            setBiginSyncing(true);
                            setTimeout(() => {
                              setBiginSyncing(false);
                              saveCatalog({
                                channel: 'bigin',
                                contactEmail: shareBiginEmail,
                                notes: shareBiginNotes,
                                stage: shareBiginStage,
                              });
                            }, 1500);
                          }}
                          disabled={biginSyncing}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: biginSyncing ? 'not-allowed' : 'pointer',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Building2 size={16} />
                          {biginSyncing ? 'Syncing with Bigin...' : 'Publish & Sync with Bigin'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Standard Publish Button (No share) */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '16px',
                      marginTop: 'auto',
                    }}
                  >
                    <button
                      onClick={() => saveCatalog(null)}
                      style={{
                        width: '100%',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Download size={14} />
                      Publish & Download Only
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
