"use client";
import React, { useState, useMemo } from 'react';
import { FileText, FilePlus } from '@/lib/icons';
import PrescriptionDetailModal from '../../prescriptions/PrescriptionDetailModal';
import ProtocolDrawerContent from '../protocols/ProtocolDrawerContent';
import StandardDrawer from '../../ui/StandardDrawer';
import PrescriptionBuilder from './PrescriptionBuilder';
import { useFirestorePaginatedCollection } from '../../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import AdminPageHeader from '../AdminPageHeader';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import PrescriptionsKPIs from './PrescriptionsKPIs';
import PrescriptionsFiltersBar from './PrescriptionsFiltersBar';
import PrescriptionsDataTable from './PrescriptionsDataTable';
import styles from './Prescriptions.module.css';

export default function AdminPrescriptionsTableClient() {
  const [activeChip, setActiveChip] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkedProtocol, setLinkedProtocol] = useState(null);
  const [linkedProduct, setLinkedProduct] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Convert chip to whereConditions
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (activeChip === 'awaiting') {
      conditions.push(['status', 'in', ['assigned_to_wholesaler', 'draft']]);
    } else if (activeChip === 'active') {
      conditions.push(['status', 'in', ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk']]);
    } else if (activeChip === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      conditions.push(['createdAt', '>=', sevenDaysAgo.toISOString()]);
    }
    // Note: 'refills_due' might not be perfectly supported with simple Firestore queries due to derived dates
    // If needed, we fetch active and filter locally, but for now we just fetch active.
    if (activeChip === 'refills_due') {
      conditions.push(['status', 'in', ['Active', 'active']]);
    }
    return conditions;
  }, [activeChip]);

  // 1. Data Fetching (Server-Side Paginated)
  const { 
    data: paginatedPrescriptions, 
    isLoading: loading, 
    hasMore, 
    loadMore,
    isFetchingMore 
  } = useFirestorePaginatedCollection('prescriptions', {
    whereConditions,
    orderByFields: [['createdAt', 'desc']],
    pageSize: 50
  });

  // Local filter for 'refills_due' since it requires client logic
  const displayPrescriptions = useMemo(() => {
    if (activeChip !== 'refills_due') return paginatedPrescriptions;
    return paginatedPrescriptions.filter(p => {
      let durationDays = 30;
      if (p.duration && typeof p.duration === 'string') {
        const match = p.duration.match(/\d+/);
        if (match) durationDays = parseInt(match[0], 10);
      } else if (p.items && p.items.length > 0 && p.items[0].duration) {
        const match = String(p.items[0].duration).match(/\d+/);
        if (match) durationDays = parseInt(match[0], 10);
      }
      if (p.createdAt) {
        const createdDate = new Date(p.createdAt);
        const refillDate = new Date(createdDate.getTime());
        refillDate.setDate(refillDate.getDate() + durationDays);
        const now = new Date();
        const diffDays = (refillDate - now) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= -14;
      }
      return false;
    });
  }, [paginatedPrescriptions, activeChip]);

  // 4. Algolia Integration
  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'prescriptions',
    searchTerm,
    { hitsPerPage: 50 },
    300
  );

  const finalData = isAlgoliaActive && searchTerm.trim() ? algoliaHits : displayPrescriptions;

  // Row Selection logic
  const toggleRowSelection = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const isAllSelected = finalData.length > 0 && selectedIds.size === finalData.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(finalData.map(d => d.id)));
    }
  };

  return (
    <>
      <div style={{ padding: '1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', backgroundColor: '#f8fafc' }}>
        <AdminPageHeader
          title="Prescriptions"
          subtitle="System of record for all patient prescriptions and recommendations."
          icon={FileText}
          actions={
            <button className="gcp-btn-primary" onClick={() => setIsBuilderOpen(true)}>
              <FilePlus size={16} style={{ marginRight: '0.5rem' }} /> New Prescription
            </button>
          }
        />

        <div style={{ width: '100%' }}>
          <GlobalSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by patient, doctor, protocol or ID (Algolia)..."
            resultCount={!loading && !algoliaLoading ? finalData.length : undefined}
            isLoading={algoliaLoading}
            namespace="admin-prescriptions"
            size="lg"
          />
        </div>

        {!loading && <PrescriptionsKPIs />}

        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PrescriptionsFiltersBar 
            activeChip={activeChip}
            setActiveChip={setActiveChip}
          />

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {loading && !isAlgoliaActive ? (
              <DataTableSkeleton columns={6} rows={10} />
            ) : finalData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FileText size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#334155', fontWeight: 700 }}>No prescriptions found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                <PrescriptionsDataTable 
                  data={finalData}
                  onRowClick={(rx) => setSelectedItem(rx)}
                  selectedIds={selectedIds}
                  toggleRowSelection={toggleRowSelection}
                  isAllCurrentPageSelected={isAllSelected}
                  toggleSelectAllCurrentPage={toggleSelectAll}
                />
                
                {!isAlgoliaActive && hasMore && (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <button 
                      onClick={loadMore} 
                      disabled={isFetchingMore}
                      className="gcp-btn-secondary"
                    >
                      {isFetchingMore ? 'Loading more...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Drawers and Modals */}
        {selectedItem && (
          <PrescriptionDetailModal
            prescription={selectedItem}
            onClose={() => setSelectedItem(null)}
            onViewProtocol={(proto) => setLinkedProtocol(proto)}
            onViewProduct={(prod) => setLinkedProduct(prod)}
          />
        )}

        {linkedProtocol && (
          <StandardDrawer
            title="Protocol Summary"
            isOpen={true}
            onClose={() => setLinkedProtocol(null)}
          >
            <ProtocolDrawerContent protocol={linkedProtocol} />
          </StandardDrawer>
        )}

        {isBuilderOpen && (
          <PrescriptionBuilder 
            onClose={() => setIsBuilderOpen(false)}
            onComplete={() => setIsBuilderOpen(false)}
          />
        )}
      </div>
    </>
  );
}
