'use client';
import React from 'react';
import { ChevronUp, ChevronDown, Layers, LayoutTemplate, Plus, Download, BookOpen, Box, Check } from '@/lib/icons';
import CatalogTableView from '../../admin/catalog/views/CatalogTableView';

export default function CenterPanel({
  catalogCart,
  catalogMeta,
  ownerType,
  activeAccordionOpen,
  setActiveAccordionOpen,
  publishedAccordionOpen,
  setPublishedAccordionOpen,
  matrixViewType,
  setMatrixViewType,
  tableProducts,
  loading,
  currentPage,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  handleSelectionChange,
  pastCatalogs,
  loadPastCatalog,
  router
}) {
    // Styles
    const accordionContainerStyle = {
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      margin: '0 32px 16px 32px',
      overflow: 'hidden',
    };

    const accordionHeaderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: '#ffffff',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 0.2s',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    };

    const accordionBodyStyle = {
      padding: '24px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #f1f5f9',
    };

    const badgeStyle = {
      fontSize: '0.75rem',
      background: '#eff6ff',
      color: '#1e40af',
      padding: '2px 8px',
      borderRadius: '12px',
      fontWeight: 600,
    };

    const addProductButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      background: '#fff',
      color: '#3b82f6',
      border: '1px solid #bfdbfe',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s',
    };

    const targetProductsPath = ownerType === 'admin' ? '/admin/products' : '/wholesaler/catalogs';

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#f8fafc',
          overflowY: 'auto',
          paddingTop: '24px',
        }}
      >
        {/* Progress Bar (Visual Only) */}
        <div style={{ padding: '0 32px', marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: catalogCart.length > 0 ? '#10b981' : '#cbd5e1',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: catalogCart.length > 0 ? '#d1fae5' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {catalogCart.length > 0 && <Check size={12} color="#10b981" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Products</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: catalogMeta.title ? '#10b981' : '#cbd5e1',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: catalogMeta.title ? '#d1fae5' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {catalogMeta.title && <Check size={12} color="#10b981" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Identity</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: catalogMeta.goals?.length > 0 ? '#10b981' : '#cbd5e1',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: catalogMeta.goals?.length > 0 ? '#d1fae5' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {catalogMeta.goals?.length > 0 && <Check size={12} color="#10b981" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Setup</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              ></div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ready to Publish</span>
            </div>
          </div>
        </div>

        {/* Accordion 1: Borrador de Catálogo en Curso (Active Catalog) */}
        <div style={accordionContainerStyle}>
          <div
            onClick={() => setActiveAccordionOpen(!activeAccordionOpen)}
            style={{
              ...accordionHeaderStyle,
              borderRadius: activeAccordionOpen ? '12px 12px 0 0' : '12px',
              borderBottom: activeAccordionOpen ? 'none' : '1px solid #e2e8f0',
              backgroundColor: '#fff',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeAccordionOpen ? (
                <ChevronUp size={18} color="#475569" />
              ) : (
                <ChevronDown size={18} color="#475569" />
              )}
              <Layers size={18} color="#3b82f6" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                Borrador de Catálogo en Curso
              </span>
              <span style={badgeStyle}>{tableVariants.length} variants</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {catalogCart.length > 0 ? 'Configurando precios y productos' : 'Catálogo vacío'}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {activeAccordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={accordionBodyStyle}>
                  {/* Inner actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div
                        className="hierarchy-toggle"
                        style={{
                          display: 'flex',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          padding: '4px',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMatrixViewType('grouped');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor:
                              matrixViewType === 'grouped' ? '#ffffff' : 'transparent',
                            boxShadow:
                              matrixViewType === 'grouped' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            color: matrixViewType === 'grouped' ? '#0f172a' : '#64748b',
                            transition: 'all 0.2s',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          <Layers size={16} /> Grouped
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMatrixViewType('flat');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: matrixViewType === 'flat' ? '#ffffff' : 'transparent',
                            boxShadow:
                              matrixViewType === 'flat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            color: matrixViewType === 'flat' ? '#0f172a' : '#64748b',
                            transition: 'all 0.2s',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          <LayoutTemplate size={16} /> Flat Variants
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(targetProductsPath);
                      }}
                      style={addProductButtonStyle}
                    >
                      <Plus size={16} /> Add Products
                    </button>
                  </div>

                  {/* Inner table */}
                  {loadingCart ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                      Loading products...
                    </div>
                  ) : tableVariants.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                      <Box size={48} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
                      <p>Your catalog is currently empty.</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(targetProductsPath);
                        }}
                        style={{
                          padding: '8px 24px',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginTop: '16px',
                          fontWeight: 600,
                        }}
                      >
                        Browse Items
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CatalogTableView
                        products={matrixViewType === 'grouped' ? tableProducts : []}
                        variants={matrixViewType === 'flat' ? tableVariants : tableVariants}
                        loading={loadingCart}
                        currentPage={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPageChange={setRowsPerPage}
                        onRowClick={(item) => {}}
                        onAction={(action, item) => {}}
                        matrixViewType={matrixViewType}
                        selectedIds={catalogCart}
                        onSelectionChange={handleSelectionChange}
                      />
                      {/* Simple Pagination Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 24px',
                          backgroundColor: '#fff',
                          borderTop: '1px solid #e2e8f0',
                          marginTop: '12px',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {page}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: page === 1 ? '#f8fafc' : '#fff',
                              color: page === 1 ? '#94a3b8' : '#475569',
                              cursor: page === 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Previous
                          </button>
                          <button
                            disabled={
                              page * rowsPerPage >=
                              (matrixViewType === 'grouped'
                                ? tableProducts.length
                                : tableVariants.length)
                            }
                            onClick={() => setPage((p) => p + 1)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor:
                                page * rowsPerPage >=
                                (matrixViewType === 'grouped'
                                  ? tableProducts.length
                                  : tableVariants.length)
                                  ? '#f8fafc'
                                  : '#fff',
                              color:
                                page * rowsPerPage >=
                                (matrixViewType === 'grouped'
                                  ? tableProducts.length
                                  : tableVariants.length)
                                  ? '#94a3b8'
                                  : '#475569',
                              cursor:
                                page * rowsPerPage >=
                                (matrixViewType === 'grouped'
                                  ? tableProducts.length
                                  : tableVariants.length)
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Catálogos Publicados (Published Catalogs) */}
        <div style={accordionContainerStyle}>
          <div
            onClick={() => setPublishedAccordionOpen(!publishedAccordionOpen)}
            style={{
              ...accordionHeaderStyle,
              borderRadius: publishedAccordionOpen ? '12px 12px 0 0' : '12px',
              borderBottom: publishedAccordionOpen ? 'none' : '1px solid #e2e8f0',
              backgroundColor: '#fff',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {publishedAccordionOpen ? (
                <ChevronUp size={18} color="#475569" />
              ) : (
                <ChevronDown size={18} color="#475569" />
              )}
              <BookOpen size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                Catálogos ya Publicados
              </span>
              <span style={{ ...badgeStyle, background: '#d1fae5', color: '#065f46' }}>
                {pastCatalogs.length} publicados
              </span>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {publishedAccordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={accordionBodyStyle}>
                  {pastCatalogs.length === 0 ? (
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        padding: '24px 0',
                      }}
                    >
                      No historical catalogs found.
                    </p>
                  ) : (
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr
                            style={{
                              background: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              textAlign: 'left',
                            }}
                          >
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Title
                            </th>
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Date
                            </th>
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Audience
                            </th>
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Items
                            </th>
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Available Formats
                            </th>
                            <th
                              style={{
                                padding: '12px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pastCatalogs.map((pc) => (
                            <tr key={pc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '0.9rem',
                                  color: '#0f172a',
                                  fontWeight: 500,
                                }}
                              >
                                {pc.title}
                              </td>
                              <td
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '0.9rem',
                                  color: '#475569',
                                }}
                              >
                                {pc.date || '-'}
                              </td>
                              <td
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '0.9rem',
                                  color: '#475569',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {pc.targetAudience || 'General'}
                              </td>
                              <td
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '0.9rem',
                                  color: '#475569',
                                }}
                              >
                                {pc.selectedProducts?.length || 0}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#e0e7ff',
                                      color: '#4f46e5',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    PDF
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#dcfce7',
                                      color: '#16a34a',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Web
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#fef3c7',
                                      color: '#d97706',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Excel
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadPastCatalog(pc);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#f1f5f9',
                                    color: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Download
                                    size={12}
                                    style={{ display: 'inline', marginRight: '4px' }}
                                  />{' '}
                                  Load Data
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
}
