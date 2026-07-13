"use client";
import React, { useState, useMemo } from 'react';
import { FileText, FilePlus } from '@/lib/icons';
import PrescriptionDetailModal from '../../features/prescriptions/components/PrescriptionDetailModal';
import ProtocolDrawerContent from '../admin/protocols/ProtocolDrawerContent';
import StandardDrawer from '../ui/StandardDrawer';
import { useFirestorePaginatedCollection } from '../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import AdminPageHeader from '../admin/AdminPageHeader';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import PrescriptionsKPIs from '../admin/prescriptions/PrescriptionsKPIs';
import UniversalOrderBuilder from './order-builder/UniversalOrderBuilder';
import ImportPrescriptionModal from '../../features/prescriptions/components/ImportPrescriptionModal';
import PrescriptionsFiltersBar from '../admin/prescriptions/PrescriptionsFiltersBar';
import { getPrescriptionColumns } from '../admin/prescriptions/prescriptionColumns';
import DataModule from '../ui/DataModule';

export default function UniversalPrescriptionsTable({ doctorId, patientId, readOnly = false, hideHeader = false, title = 'Prescriptions', subtitle = 'System of record for all patient prescriptions and recommendations.' }) {
  const [activeChip, setActiveChip] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkedProtocol, setLinkedProtocol] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Convert chip to whereConditions
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (doctorId) conditions.push(['doctorId', '==', doctorId]);
    if (patientId) conditions.push(['patientId', '==', patientId]);
    
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
  }, [activeChip, doctorId, patientId]);

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

  const columns = useMemo(() => getPrescriptionColumns(), []);

  return (
    <>
      <DataModule
        title={title}
        subtitle={subtitle}
        icon={FileText}
        hideHeader={hideHeader}
        primaryAction={!readOnly ? {
          label: 'New Prescription',
          icon: FilePlus,
          onClick: () => setIsBuilderOpen(true)
        } : null}
        searchPlaceholder="Search by patient, doctor, protocol or ID (Algolia)..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={!loading && !algoliaLoading ? finalData.length : undefined}
        searchLoading={algoliaLoading}
        namespace="admin-prescriptions"
        kpis={<PrescriptionsKPIs />}
        filtersBar={
          <PrescriptionsFiltersBar 
            activeChip={activeChip}
            setActiveChip={setActiveChip}
          />
        }
        data={finalData}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        isFetchingMore={isFetchingMore}
        isSearchActive={isAlgoliaActive}
        columns={columns}
        selectedIds={Array.from(selectedIds)}
        onSelectionChange={(newArr) => {
          setSelectedIds(new Set(newArr));
        }}
        onRowClick={(rx) => setSelectedItem(rx)}
        emptyState={{
          title: "No prescriptions found",
          description: "Try adjusting your filters or search terms.",
          actionLabel: "Create Prescription",
          onAction: () => setIsBuilderOpen(true)
        }}
      >
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '2rem' }}>
            <div style={{ background: 'var(--color-bg-app)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
              <UniversalOrderBuilder 
                mode="prescription"
                onSaved={() => setIsBuilderOpen(false)}
                onCanceled={() => setIsBuilderOpen(false)}
              />
            </div>
          </div>
        )}
      </DataModule>
    </>
  );
}
