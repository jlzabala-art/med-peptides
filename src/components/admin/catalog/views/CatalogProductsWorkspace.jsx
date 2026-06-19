import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import List from 'lucide-react/dist/esm/icons/list';
import Download from 'lucide-react/dist/esm/icons/download';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Box from 'lucide-react/dist/esm/icons/box';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import LayoutTemplate from 'lucide-react/dist/esm/icons/layout-template';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Tag from 'lucide-react/dist/esm/icons/tag';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCatalogBuilderStore } from '../../../../stores/useCatalogBuilderStore';

import CatalogTableView from './CatalogTableView';
import CatalogCardsView from './CatalogCardsView';
import CatalogOverviewDashboard from './CatalogOverviewDashboard';
import CatalogCommandBar from './CatalogCommandBar';
import CatalogBulkActionsBar from './CatalogBulkActionsBar';
import { useCatalogFilters } from '../useCatalogFilters';

const CatalogProductsWorkspace = ({
  products = [],
  variants = [],
  loading = false,
  searchQuery = '',
  setSearchQuery,
  activeDisplayMode = 'table',
  onDisplayModeChange,
  isMobile,
  hasMore,
  currentPage,
  nextPage,
  prevPage,
  onAction,
}) => {
  const location = useLocation();
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [matrixViewType, setMatrixViewType] = useState('grouped'); // 'grouped' | 'flat'
  const activeCatalogSelectedIds = useCatalogBuilderStore((state) => state.selectedProducts);
  const activeCatalogCartData = useCatalogBuilderStore((state) => state.cartProductsData);
  const isDraftActive = useCatalogBuilderStore((state) => state.isDraftActive);

  const [selectedIds, setSelectedIds] = useState(() => {
    if (location.state?.catalogCart) return location.state.catalogCart;
    if (isDraftActive) return activeCatalogSelectedIds;
    return [];
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    if (location.state?.catalogCartData) return location.state.catalogCartData;
    if (isDraftActive) return activeCatalogCartData;
    return [];
  });

  const handleSelectionChange = (newIds) => {
    setSelectedIds(newIds);
    setSelectedItems(prev => {
      const keeping = prev.filter(p => newIds.includes(p.id));
      const toAddIds = newIds.filter(id => !keeping.some(p => p.id === id));
      const newItems = variants.filter(v => toAddIds.includes(v.id));
      // If we are in 'grouped' mode, some selections might be parent products, so check products array too
      const missingIds = toAddIds.filter(id => !newItems.some(n => n.id === id));
      const newParentItems = products.filter(p => missingIds.includes(p.id));
      return [...keeping, ...newItems, ...newParentItems];
    });
  };

  // Filter states (quick filters from CatalogCommandBar)
  const [quickFilters, setQuickFilters] = useState([]);

  const handleBulkAction = (action) => {
    setShowBulkActions(false);
    if (onAction) onAction(action);
  };

  return (
    <div
      className="catalog-products-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Toolbar */}
      <div
        className="workspace-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Display Mode Segmented Control */}
          <div
            className="display-mode-control"
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => onDisplayModeChange('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeDisplayMode === 'table' ? '#ffffff' : 'transparent',
                boxShadow: activeDisplayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: activeDisplayMode === 'table' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s ease-in-out',
              }}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => onDisplayModeChange('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeDisplayMode === 'cards' ? '#ffffff' : 'transparent',
                boxShadow: activeDisplayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: activeDisplayMode === 'cards' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s ease-in-out',
              }}
              title="Cards View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

          {/* Hierarchy Toggle (Grouped vs Flat) */}
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
              onClick={() => setMatrixViewType('grouped')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: matrixViewType === 'grouped' ? '#ffffff' : 'transparent',
                boxShadow: matrixViewType === 'grouped' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: matrixViewType === 'grouped' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              title="Grouped by Product"
            >
              <Layers size={16} /> Grouped
            </button>
            <button
              onClick={() => setMatrixViewType('flat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: matrixViewType === 'flat' ? '#ffffff' : 'transparent',
                boxShadow: matrixViewType === 'flat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: matrixViewType === 'flat' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              title="Flat Variants"
            >
              <LayoutTemplate size={16} /> Flat Variants
            </button>
          </div>
        </div>
        <div
          className="toolbar-right"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
        </div>
      </div>


      {/* Bulk Actions Bar (Sticky above the grid) */}
      <CatalogBulkActionsBar
        selectedIds={selectedIds}
        variants={variants}
        filteredIds={variants.map(v => v.id)}
        onClearSelection={() => {
          setSelectedIds([]);
          setSelectedItems([]);
        }}
        onAction={(action) => {
          if (onAction) onAction(action, selectedIds, variants.map(v => v.id), selectedItems);
        }}
      />

      {/* Main Content Area */}
      <div className="workspace-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {(!loading && products.length === 0) ? (
          <div
            className="empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              padding: '40px 20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: '24px',
                borderRadius: '50%',
                marginBottom: '24px',
              }}
            >
              <Box size={48} color="#94a3b8" />
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                color: '#0f172a',
                margin: '0 0 12px 0',
                fontWeight: '600',
              }}
            >
              No Products Here Yet
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                backgroundColor: '#eff6ff',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                maxWidth: '500px',
                textAlign: 'left',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
              }}
            >
              <Box size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ margin: 0, color: '#2563eb', lineHeight: '1.5' }}>
                  No products found with the selected filters. Try changing your filters or importing new products.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="products-view"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeDisplayMode === 'table' ? (
                <CatalogTableView
                  products={matrixViewType === 'grouped' ? products : []}
                  variants={matrixViewType === 'flat' ? variants : variants}
                  loading={loading}
                  currentPage={currentPage}
                  rowsPerPage={20}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                  onRowClick={(item) => onAction && onAction('edit', item)}
                  onAction={onAction}
                  matrixViewType={matrixViewType}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                />
              ) : (
                <CatalogCardsView
                  items={products}
                  loading={loading}
                  onAction={onAction}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                />
              )}
            </div>

            {/* Simple Pagination Bar (Only show if table mode, cards has load more) */}
            {activeDisplayMode === 'table' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 24px',
                  backgroundColor: '#fff',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Page {currentPage}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={prevPage}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: currentPage === 1 ? '#f8fafc' : '#fff',
                      color: currentPage === 1 ? '#94a3b8' : '#475569',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={!hasMore}
                    onClick={nextPage}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: !hasMore ? '#f8fafc' : '#fff',
                      color: !hasMore ? '#94a3b8' : '#475569',
                      cursor: !hasMore ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper styles and functions for dropdown
const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  color: '#475569',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  fontWeight: '500',
};

const handleHover = (e) => (e.currentTarget.style.backgroundColor = '#f1f5f9');
const handleLeave = (e) => (e.currentTarget.style.backgroundColor = 'transparent');

export default CatalogProductsWorkspace;
