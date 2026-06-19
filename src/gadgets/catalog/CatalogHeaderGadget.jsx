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
  title,
  searchQuery,
  setSearchQuery,
  setIsAdvancedFiltersOpen,
  filteredCatalog,
  isMobile,
  isAddMenuOpen,
  setIsAddMenuOpen,
  setIntakeMode,
  setIsCreateModalOpen,
  setIsImportModalOpen,
  onAction,
  activeFilterCount = 0,
  totalItems = 0
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
          style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          {title || (activeWorkspace.charAt(0).toUpperCase() + activeWorkspace.slice(1))}
          {(totalItems > 0 || filteredCatalog) && (
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', background: '#f1f5f9', padding: '4px 10px', borderRadius: '16px', letterSpacing: '0.5px' }}>
              {activeFilterCount > 0 ? `${filteredCatalog.length} Filtered` : `${totalItems > 0 ? totalItems : filteredCatalog?.length} Items`}
            </span>
          )}
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
            placeholder={
              activeFilterCount > 0
                ? `Searching within ${activeFilterCount} active filter(s)...`
                : "Search..."
            }
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

        {activeWorkspace === 'products' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('open-universal-wizard'));
                }
              }}
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
              <Plus size={16} /> Add Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
