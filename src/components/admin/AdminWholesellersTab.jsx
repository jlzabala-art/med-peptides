import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSupplierData } from './suppliers/useSupplierData';
import SupplierKPIs from './suppliers/SupplierKPIs';
import SupplierCommandBar from './suppliers/SupplierCommandBar';
import SupplierTableView from './suppliers/SupplierTableView';
import SupplierDirectoryView from './suppliers/SupplierDirectoryView';
import SupplierPagination from './suppliers/SupplierPagination';
import SupplierDetail from './suppliers/SupplierDetail';
import toast from 'react-hot-toast';

export default function AdminWholesellersTab({ isMobile }) {
  const {
    suppliers,
    paginatedData,
    loading,
    kpisLoading,
    serverKpis,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    activeKpiFilter,
    setActiveKpiFilter,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    handleUpdate,
    handleCreate
  } = useSupplierData();

  const [activeView, setActiveView] = useState('table'); // table, directory, comparison, map
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search');
  const openVariantId = searchParams.get('openVariant');

  useEffect(() => {
    if (urlSearch && !searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch, searchTerm, setSearchTerm]);

  useEffect(() => {
    if (urlSearch && paginatedData.length > 0 && !selectedSupplier) {
      const match = paginatedData.find(s => s.companyName === urlSearch || s.name === urlSearch);
      if (match) {
        setSelectedSupplier(match);
      } else if (paginatedData.length === 1) {
        setSelectedSupplier(paginatedData[0]);
      }
    }
  }, [urlSearch, paginatedData, selectedSupplier]);

  if (loading && !suppliers.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading enterprise supplier directory...
      </div>
    );
  }

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedData.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkAction = (action) => {
    toast.success(`Bulk Action [${action}] triggered for ${selectedIds.length} suppliers.`);
    setSelectedIds([]);
  };

  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', backgroundColor: 'var(--background)' }}>
      
      {/* 1. KPIs Layer */}
      <SupplierKPIs 
        kpiStats={serverKpis} 
        activeKpiFilter={activeKpiFilter} 
        setActiveKpiFilter={setActiveKpiFilter} 
        isMobile={isMobile}
      />

      {/* 2. Command Bar Layer */}
      <SupplierCommandBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkAction={handleBulkAction}
      />

      {/* 3. Main Data Layer */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeView === 'table' && (
          <div style={{ display: 'flex', gap: '1rem', height: '100%', alignItems: 'flex-start' }}>
            <div style={{ flex: selectedSupplier ? '0 0 50%' : '1 1 100%', transition: 'all 0.3s ease' }}>
              <SupplierTableView 
                paginatedData={paginatedData}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onRowClick={handleRowClick}
                selectedSupplierId={selectedSupplier?.id}
              />
            </div>
            {selectedSupplier && (
              <div style={{ flex: '0 0 50%', position: 'sticky', top: 0, height: '100%', overflowY: 'auto' }}>
                <SupplierDetail 
                  w={selectedSupplier} 
                  onClose={() => setSelectedSupplier(null)} 
                  onUpdate={handleUpdate} 
                  initialVariantId={openVariantId}
                />
              </div>
            )}
          </div>
        )}
        {activeView === 'directory' && (
          <SupplierDirectoryView 
            paginatedData={paginatedData}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onRowExpand={(w) => {
               // Usually opens a modal or right drawer in directory mode
               toast.success(`Opening profile for ${w.companyName}`);
            }}
          />
        )}
        {(activeView === 'comparison' || activeView === 'map') && (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View In Development</h3>
            <p style={{ color: 'var(--text-muted)' }}>This advanced enterprise view is currently being implemented.</p>
          </div>
        )}
      </div>

      {/* 4. Pagination Layer */}
      {(activeView === 'table' || activeView === 'directory') && (
        <SupplierPagination 
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      )}

    </div>
  );
}