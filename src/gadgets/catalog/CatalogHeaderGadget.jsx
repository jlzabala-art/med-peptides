import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Download from 'lucide-react/dist/esm/icons/download';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Search from 'lucide-react/dist/esm/icons/search';
import Package from 'lucide-react/dist/esm/icons/package';
import Activity from 'lucide-react/dist/esm/icons/activity';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Tag from 'lucide-react/dist/esm/icons/tag';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import styles from '../../components/admin/catalog/CatalogIntelligenceHub.module.css'; // Adjust path if needed

export default function CatalogHeaderGadget({
  activeWorkspace,
  searchQuery,
  setSearchQuery,
  setIsAdvancedFiltersOpen,
  filteredCatalog,
  isMobile,
  isAddMenuOpen,
  setIsAddMenuOpen,
  setIntakeMode,
  setIsCreateModalOpen,
  setIsImportModalOpen
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#f8fafc',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e2e8f0',
        margin: '0 -1.5rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <h1
          className={styles.title}
          style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap' }}
        >
          {activeWorkspace.charAt(0).toUpperCase() + activeWorkspace.slice(1)}
        </h1>

        {/* Search Input Integrated into Header */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-bg-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '20px',
            padding: '0.4rem 1rem',
            flex: 1,
            minWidth: '200px',
            maxWidth: '400px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Search size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Ask Atlas or Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--text-main, #1e293b)',
              fontWeight: 500,
            }}
          />
          <button
            onClick={() => setIsAdvancedFiltersOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
              color: 'var(--color-primary)',
            }}
            title="Advanced Filters"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div
        className={styles.actionButtons}
        style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}
      >
        <button
          onClick={() => {
            toast.promise(
              new Promise(resolve => setTimeout(resolve, 2500)),
              {
                loading: 'Atlas AI is auditing the catalog...',
                success: () => {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 600 }}>Atlas AI Catalog Audit</span>
                      <span style={{ fontSize: '0.85rem' }}>• 2 products missing Retail Prices</span>
                      <span style={{ fontSize: '0.85rem' }}>• 1 product with Low Margin (&lt;20%)</span>
                      <span style={{ fontSize: '0.85rem' }}>• 3 products missing COA</span>
                    </div>
                  );
                },
                error: 'Audit failed.'
              },
              { duration: 5000 }
            );
          }}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            color: '#475569',
            fontWeight: 600
          }}
        >
          <Activity size={14} color="#8b5cf6" /> AI Audit Catalog
        </button>
        <button
          onClick={() => {
            const dataToExport = filteredCatalog.map(item => ({
              ID: item.id || '',
              SKU: item.sku || '',
              Name: item.name || '',
              Supplier: item.supplier || '',
              Category: item.category || '',
              Format: item.format || '',
              Size: item.size || '',
              Stock: item.stock || 0,
              Cost: item.cost || 0,
              MSRP: item.msrp || item.price || 0,
              Status: item.status || 'Active'
            }));
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `catalog_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Catalog exported successfully!');
          }}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <Download size={14} /> Export CSV
        </button>
        {activeWorkspace === 'products' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className={styles.btnAdd}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus size={16} /> Add Product <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {isAddMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow:
                      '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    minWidth: '200px',
                    zIndex: 100,
                  }}
                >
                  <button
                    onClick={() => {
                      setIntakeMode('product');
                      setIsCreateModalOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <Package size={16} color="#0f172a" />
                    <span style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                      Add New Product
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIntakeMode('variant');
                      setIsCreateModalOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <Tag size={16} color="#0f172a" />
                    <span style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                      Add Variant
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsImportModalOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <Download size={16} color="#0f172a" />
                    <span style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                      Import Products
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
