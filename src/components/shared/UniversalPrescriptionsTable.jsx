"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FileText, FilePlus, ScanText, Stethoscope, Box, Download, RefreshCw } from 'lucide-react';
import PrescriptionDetailModal from '../../features/prescriptions/components/PrescriptionDetailModal';
import ProtocolDrawerContent from '../admin/protocols/ProtocolDrawerContent';
import ProductDetailsDrawer from '../admin/products/ProductDetailsDrawer';
import StandardDrawer from '../ui/StandardDrawer';
import { useFirestorePaginatedCollection } from '../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import PageHeader from '../ui/PageHeader';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import PrescriptionsKPIs from '../admin/prescriptions/PrescriptionsKPIs';
import UniversalOrderBuilder from './order-builder/UniversalOrderBuilder';
import ImportPrescriptionModal from '../../features/prescriptions/components/ImportPrescriptionModal';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { getPrescriptionColumns } from '../admin/prescriptions/prescriptionColumns';
import DataModule from '../ui/DataModule';
import { useAuth } from '../../context/AuthContext';
import PrescriptionIntakeWorkspace from '../../features/prescriptions/components/PrescriptionIntakeWorkspace';
import PrimarySplitButton from '../ui/PrimarySplitButton';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import SourceSelectorModal from '../../features/prescriptions/SourceSelectorModal';
import { useDrawer } from '../../context/DrawerContext';
import { PRESCRIPTION_SOURCES } from '../../schemas/prescriptionSchema';
import BuilderProtocolSearch from './order-builder/BuilderProtocolSearch';
import MobilePrescriptionCard from './mobile/MobilePrescriptionCard';
import MobileActionSheet from '../ui/MobileActionSheet';
import { Eye, Edit3, XCircle } from '@/lib/icons';
import notifier from '../../services/NotificationService';

export default function UniversalPrescriptionsTable({ doctorId, patientId, readOnly = false, hideHeader = false, title = 'Prescriptions', subtitle = 'System of record for all patient prescriptions and recommendations.', serverKPIs, enableAskAtlas = false, initialData }) {
  const { openDrawer } = useDrawer();
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileActionRx, setMobileActionRx] = useState(null);

  const handleMobileQuickAction = useCallback((action, rx) => {
    if (action === 'menu') setMobileActionRx(rx);
  }, []);

  const mobileCardPropsForTable = useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);
  const [linkedProtocol, setLinkedProtocol] = useState(null);
  const [linkedProduct, setLinkedProduct] = useState(null);
  
  // Track the prescription being edited (if any). If 'new', we are creating a new one.
  const [editingRx, setEditingRx] = useState(null);
  // Builder open state (was missing — caused runtime error for 'From Items' and 'Manual' sources)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
  const [isProtocolSearchOpen, setIsProtocolSearchOpen] = useState(false);
  const [initialBuilderItems, setInitialBuilderItems] = useState([]);
  // Protocol context passed from BuilderProtocolSearch to the builder
  const [builderProtocolId, setBuilderProtocolId] = useState(null);
  const [builderProtocolName, setBuilderProtocolName] = useState(null);
  const [builderDoctorId, setBuilderDoctorId] = useState(null);
  const [builderDoctorName, setBuilderDoctorName] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // URL Sync
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const statusFilter = searchParams.get('status') || '';
  const rangeFilter = searchParams.get('range') || 'all';
  const urlDoctorId = searchParams.get('doctorId') || '';
  const urlDoctorName = searchParams.get('doctorName') || '';
  const urlRxId = searchParams.get('id') || '';

  const [loadingUrlItem, setLoadingUrlItem] = useState(false);

  const effectiveDoctorId = doctorId || urlDoctorId;

  const updateUrlParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);
  
  // ── Lazy product loader — only fetches when a detail modal is opened ──────
  // Previously loaded 1000 products eagerly on mount (major perf hit).
  const [products, setProducts] = useState([]);
  const productsLoadedRef = useRef(false);
  const loadProductsLazy = useCallback(async () => {
    if (productsLoadedRef.current) return;
    productsLoadedRef.current = true;
    try {
      const { getActiveProductsPaginated } = await import('../../repositories/productRepository');
      const snap = await getActiveProductsPaginated(200);
      setProducts(snap?.items || []);
    } catch (err) {
      console.warn('[UniversalPrescriptionsTable] lazy product load failed:', err);
      productsLoadedRef.current = false; // Allow retry on next open
    }
  }, []);


  // Convert filters to whereConditions
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (effectiveDoctorId) conditions.push(['doctorId', '==', effectiveDoctorId]);
    if (patientId) conditions.push(['patientId', '==', patientId]);
    
    if (statusFilter) {
      conditions.push(['status', '==', statusFilter]);
    }
    
    if (rangeFilter !== 'all') {
      const date = new Date();
      if (rangeFilter === '7d') date.setDate(date.getDate() - 7);
      else if (rangeFilter === '30d') date.setDate(date.getDate() - 30);
      else if (rangeFilter === '90d') date.setDate(date.getDate() - 90);
      conditions.push(['createdAt', '>=', date]);
    }
    
    return conditions;
  }, [statusFilter, rangeFilter, effectiveDoctorId, patientId]);

  // 1. Data Fetching (Server-Side Paginated)
  // initialData from RSC pre-fetch — table renders immediately with no client round-trip.
  const { 
    data: paginatedPrescriptions, 
    isLoading: loading, 
    hasMore, 
    loadMore,
    isFetchingMore,
    refresh
  } = useFirestorePaginatedCollection('prescriptions', {
    whereConditions,
    orderByFields: [['createdAt', 'desc']],
    pageSize: 50,
    initialData: initialData?.length > 0 ? initialData : undefined,
  });

  const displayPrescriptions = paginatedPrescriptions;

  const algoliaFacetFilters = useMemo(() => {
    const filters = [];
    if (statusFilter) filters.push(`status:${statusFilter}`);
    return filters;
  }, [statusFilter]);

  const algoliaNumericFilters = useMemo(() => {
    const filters = [];
    if (rangeFilter && rangeFilter !== 'all') {
      const date = new Date();
      if (rangeFilter === '7d') date.setDate(date.getDate() - 7);
      else if (rangeFilter === '30d') date.setDate(date.getDate() - 30);
      else if (rangeFilter === '90d') date.setDate(date.getDate() - 90);
      filters.push(`createdAt_ts>=${date.getTime()}`);
    }
    return filters;
  }, [rangeFilter]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'prescriptions',
    searchTerm,
    { 
      hitsPerPage: 50,
      facetFilters: algoliaFacetFilters.length > 0 ? algoliaFacetFilters : undefined,
      numericFilters: algoliaNumericFilters.length > 0 ? algoliaNumericFilters : undefined
    },
    300
  );

  // Sync selectedItem with live data updates
  useEffect(() => {
    if (selectedItem) {
      const activeList = isAlgoliaActive ? algoliaHits : displayPrescriptions;
      const updatedItem = activeList.find(p => p.id === selectedItem.id);
      if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(selectedItem)) {
        setSelectedItem(updatedItem);
      }
    }
  }, [displayPrescriptions, algoliaHits, isAlgoliaActive]);

  // Group data by sessionId with deep search support
  const groupedData = useMemo(() => {
    let rawData = [];
    if (isAlgoliaActive && searchTerm.trim()) {
      rawData = algoliaHits.map(h => ({ ...h, id: h.objectID || h.id }));
    } else if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rawData = (displayPrescriptions || []).filter(rx => {
        const matchesPatient = (rx.patientName || rx.patient?.name || '').toLowerCase().includes(q);
        const matchesDoctor = (rx.doctorName || '').toLowerCase().includes(q);
        const matchesBoxId = (rx.fagron?.boxId || '').toLowerCase().includes(q);
        const matchesProtocol = (rx.protocolName || rx.treatmentProgram || '').toLowerCase().includes(q);
        const matchesId = (rx.id || '').toLowerCase().includes(q);
        const lines = rx.prescriptionLines || rx.items || [];
        const matchesLine = lines.some(l => 
          (l.productName || l.name || '').toLowerCase().includes(q) ||
          (l.activeIngredient || '').toLowerCase().includes(q)
        );
        return matchesPatient || matchesDoctor || matchesBoxId || matchesProtocol || matchesId || matchesLine;
      });
    } else {
      rawData = displayPrescriptions || [];
    }

    if (!rawData || rawData.length === 0) return [];

    const groups = {};
    const result = [];
    
    for (const rx of rawData) {
      if (rx.sessionId) {
        if (!groups[rx.sessionId]) {
          groups[rx.sessionId] = [];
        }
        groups[rx.sessionId].push(rx);
      } else {
        result.push(rx);
      }
    }
    
    for (const sessionId in groups) {
      const members = groups[sessionId];
      if (members.length === 1) {
        result.push(members[0]);
      } else {
        const first = members[0];
        result.push({
          ...first,
          id: `session_group_${sessionId}`,
          _isSessionGroup: true,
          _sessionCount: members.length,
          _sessionMembers: members,
          items: members.flatMap(m => m.prescriptionLines || m.items || []),
          prescriptionLines: members.flatMap(m => m.prescriptionLines || m.items || []),
        });
      }
    }
    
    // Sort result again by createdAt desc since we might have appended groups at the end
    result.sort((a, b) => {
      const ta = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
      const tb = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
      return tb - ta;
    });
    
    return result;
  }, [displayPrescriptions, algoliaHits, isAlgoliaActive, searchTerm]);

  const finalData = groupedData;

  const handleEdit = (rx) => {
    setSelectedItem(null);
    setInitialBuilderItems(rx.items || []);
    setEditingRx(rx);
  };

  const prescriptionExpandableRender = useCallback((row) => {
    if (!row._isSessionGroup) return null;
    
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderTop: '1px dashed #cbd5e1' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569' }}>Formulations in Session</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {row._sessionMembers.map(member => (
            <div 
              key={member.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem', 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => { setSelectedItem(member); loadProductsLazy(); }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                  {member.treatmentType || 'Formulation'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(member.items || []).map(i => i.name).join(', ') || 'No items'}
                </div>
              </div>
              <div>
                <button 
                  style={{
                    padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#475569',
                    border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [loadProductsLazy]);

  // URL-driven prescription loading
  useEffect(() => {
    if (urlRxId && !selectedItem && !loadingUrlItem) {
      // Don't trigger if it's currently editing a new one or another one
      if (editingRx) return;
      
      const existing = displayPrescriptions.find(p => p.id === urlRxId);
      if (existing) {
        setSelectedItem(existing);
      } else {
        setLoadingUrlItem(true);
        getDoc(doc(db, 'prescriptions', urlRxId)).then(snap => {
          if (snap.exists()) {
            setSelectedItem({ id: snap.id, ...snap.data() });
          } else {
            toast.error("Prescription not found");
            updateUrlParam('id', '');
          }
        }).catch(err => {
          console.error("Error fetching direct prescription:", err);
          updateUrlParam('id', '');
        }).finally(() => {
          setLoadingUrlItem(false);
        });
      }
    }
  }, [urlRxId, displayPrescriptions, selectedItem, loadingUrlItem, editingRx, updateUrlParam]);

  const handleRefill = useCallback((rx) => {
    if (!rx) return;
    openDrawer('rx-builder', 'new', {
      initialPatient: rx.patient?.id ? rx.patient : (rx.patientId ? { id: rx.patientId, name: rx.patientName } : null),
      initialDoctor: rx.doctor?.id ? rx.doctor : (rx.doctorId ? { id: rx.doctorId, name: rx.doctorName } : null),
      initialItems: (rx.items || rx.compounds || rx.products || []).map(item => ({
        ...item,
        id: item.id || item.productId || crypto.randomUUID(),
        productId: item.productId || item.id,
        productName: item.productName || item.name || 'Item',
      })),
      initialProtocolId: rx.protocolId || null,
      initialProtocolName: rx.protocolName || null,
    });
  }, [openDrawer]);

  const columns = useMemo(() => getPrescriptionColumns({ onEdit: handleEdit, onRefresh: refresh, onRefill: handleRefill }), [handleEdit, refresh, handleRefill]);

  // Filter definitions for DataModule
  const filterOptions = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: (val) => updateUrlParam('status', val),
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Processing', value: 'processing' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      key: 'range',
      label: 'Date',
      value: rangeFilter,
      onChange: (val) => updateUrlParam('range', val),
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 90 Days', value: '90d' },
      ]
    }
  ], [statusFilter, rangeFilter, updateUrlParam]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (statusFilter) {
      chips.push({ key: 'status', label: 'Status', value: statusFilter, onRemove: () => updateUrlParam('status', '') });
    }
    if (rangeFilter && rangeFilter !== 'all') {
      chips.push({ key: 'range', label: 'Date', value: rangeFilter, onRemove: () => updateUrlParam('range', 'all') });
    }
    if (urlDoctorId) {
      chips.push({ 
        key: 'doctorId', 
        label: 'Doctor', 
        value: urlDoctorName || urlDoctorId, 
        onRemove: () => {
          updateUrlParam('doctorId', '');
          updateUrlParam('doctorName', '');
        } 
      });
    }
    return chips;
  }, [statusFilter, rangeFilter, urlDoctorId, urlDoctorName, updateUrlParam]);

  const handleExportCsv = useCallback(() => {
    const list = (isAlgoliaActive ? algoliaHits : displayPrescriptions) || [];
    if (list.length === 0) {
      notifier.info('No prescriptions to export');
      return;
    }
    const headers = ['ID', 'Patient', 'Doctor', 'Status', 'Date', 'Total'];
    const rows = list.map(rx => [
      rx.id,
      `"${rx.patientName || ''}"`,
      `"${rx.doctorName || rx.physicianName || ''}"`,
      rx.status || '',
      rx.createdAt?.seconds ? new Date(rx.createdAt.seconds * 1000).toISOString() : '',
      rx.total || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prescriptions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [displayPrescriptions, isAlgoliaActive, algoliaHits]);

  return (
    <>
      <DataModule
        title={title}
        subtitle={subtitle}
        icon={FileText}

        mobileOverflowActions={[
          { label: 'Export CSV', icon: Download, onClick: handleExportCsv },
          { label: 'Refresh', icon: RefreshCw, onClick: () => refresh?.() }
        ]}
        actions={!readOnly ? (
          <div className="prescriptions-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <AIQuickActionButton
              label="✨ Import with AI (PDF / Fagron)"
              onClick={() => setIsIntakeOpen(true)}
              title="Import and digitize medical prescription or Fagron Genomics report with Atlas AI"
            />
            <PrimarySplitButton 
              mainAction={{
                label: "New Prescription",
                icon: <FilePlus />,
                onClick: () => {
                  openDrawer('rx-builder', 'new');
                }
              }}
              dropdownActions={[
                {
                  label: "Import PDF / Fagron (AI)",
                  icon: <ScanText />,
                  onClick: () => setIsIntakeOpen(true)
                },
                {
                  label: "From Clinical Protocol",
                  icon: <Stethoscope />,
                  onClick: () => setIsProtocolSearchOpen(true)
                },
                {
                  label: "From Catalog",
                  icon: <Box />,
                  onClick: () => {
                    openDrawer('rx-builder', 'new');
                  }
                }
              ]}
            />
            <style jsx>{`
              @media (max-width: 640px) {
                .prescriptions-header-actions {
                  width: 100%;
                  flex-direction: column;
                  align-items: stretch !important;
                }
                .prescriptions-header-actions > :global(*) {
                  width: 100% !important;
                }
              }
            `}</style>
          </div>
        ) : null}
        searchPlaceholder="Search by patient, doctor, protocol or ID..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        enableAskAtlas={enableAskAtlas}
        askAtlasTopic="Prescription"
        resultCount={!loading && !algoliaLoading ? finalData.length : undefined}
        searchLoading={algoliaLoading}
        kpis={
          <PrescriptionsKPIs 
            serverKPIs={serverKPIs} 
            filteredCount={finalData.length} 
            isFiltered={isAlgoliaActive || (filterStatus && filterStatus.length > 0) || activeChips.length > 0} 
          />
        }
        filters={activeChips}
        data={finalData}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        isFetchingMore={isFetchingMore}
        isSearchActive={isAlgoliaActive}
        columns={columns}
        expandableRender={prescriptionExpandableRender}
        selectedIds={Array.from(selectedIds)}
        onSelectionChange={(newArr) => {
          setSelectedIds(new Set(newArr));
        }}
        onRowClick={(rx, toggleExpand) => { 
          if (rx._isSessionGroup && toggleExpand) {
            toggleExpand();
          } else {
            setSelectedItem(rx); 
            loadProductsLazy(); 
          }
        }}
        mobileCardComponent={MobilePrescriptionCard}
        mobileCardProps={mobileCardPropsForTable}
        onRefresh={refresh}
        emptyState={{
          title: "No prescriptions found",
          description: statusFilter || rangeFilter !== 'all' ? "No results match these filters. Try clearing them." : "Import your first prescription (PDF / Fagron) with AI or create one manually.",
          actionLabel: statusFilter || rangeFilter !== 'all' ? "Clear Filters" : "✨ Import with AI (PDF / Fagron)",
          onAction: () => {
            if (statusFilter || rangeFilter !== 'all') {
              router.replace(pathname);
            } else {
              setIsIntakeOpen(true);
            }
          }
        }}
      >
        {/* Mobile quick-action sheet for prescriptions */}
        <MobileActionSheet
          isOpen={!!mobileActionRx}
          onClose={() => setMobileActionRx(null)}
          title={`Rx #${mobileActionRx?.id?.slice(-6).toUpperCase() || ''}`}
          items={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => { setSelectedItem(mobileActionRx); loadProductsLazy(); },
            },
            {
              label: 'Edit Prescription',
              icon: Edit3,
              onClick: () => openDrawer('rx-builder', mobileActionRx?.id, { existingRx: mobileActionRx }),
            },
            {
              label: 'Cancel Prescription',
              icon: XCircle,
              variant: 'danger',
              onClick: () => {
                notifier?.confirmCritical(
                  `Cancel prescription for ${mobileActionRx?.patientName || 'this patient'}?`,
                  async () => {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const { db } = await import('../../firebase');
                    await updateDoc(doc(db, 'prescriptions', mobileActionRx.id), { status: 'cancelled' });
                    toast.success('Prescription cancelled.');
                    refresh();
                  }
                );
              },
            },
          ]}
        />

        {/* Drawers and Modals */}

        {/* Skeleton Loader for URL-driven item */}
        {loadingUrlItem && !selectedItem && (
          <StandardDrawer
            title="Loading Prescription..."
            isOpen={true}
            onClose={() => {
              setLoadingUrlItem(false);
              updateUrlParam('id', '');
            }}
            width="60vw"
          >
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface-active)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ height: '24px', width: '40%', background: 'var(--surface-active)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: '16px', width: '25%', background: 'var(--surface-active)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
              <div style={{ marginTop: '2rem', flex: 1, background: 'var(--surface-active)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            </div>
          </StandardDrawer>
        )}

        {selectedItem && (
          <PrescriptionDetailModal 
            rx={selectedItem} 
            products={products}
            onClose={() => {
              setSelectedItem(null);
              updateUrlParam('id', '');
            }}
            onProtocolClick={(p) => setLinkedProtocol(p)}
            onProductClick={(prod) => setLinkedProduct(prod)}
            onEdit={handleEdit}
            onUpdateRx={(updatedRx) => {
              setSelectedItem(updatedRx);
              refresh();
            }}
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

        {linkedProduct && (
          <ProductDetailsDrawer
            isOpen={true}
            onClose={() => setLinkedProduct(null)}
            product={linkedProduct}
          />
        )}

        {editingRx && (
          <StandardDrawer
            isOpen={true}
            onClose={() => {
              setEditingRx(null);
              setInitialBuilderItems([]);
              setBuilderProtocolId(null);
              setBuilderProtocolName(null);
              setBuilderDoctorId(null);
              setBuilderDoctorName(null);
            }}
            title={editingRx === 'new' ? 'New Prescription' : `Edit Prescription #${editingRx.id?.slice(0, 6) || ''}`}
            subtitle={builderProtocolName ? `Based on protocol: ${builderProtocolName}` : undefined}
            width="85vw"
          >
            <div style={{ padding: '1rem' }}>
              <UniversalOrderBuilder
                mode="prescription"
                initialItems={initialBuilderItems}
                initialTarget={
                  editingRx !== 'new' && editingRx.patient
                    ? { id: editingRx.patient.id || editingRx.patientId, name: editingRx.patient.name || editingRx.patientName, type: 'patient' }
                    : null
                }
                initialProtocolId={builderProtocolId}
                initialProtocolName={builderProtocolName}
                initialDoctorId={builderDoctorId}
                initialDoctorName={builderDoctorName}
                onSaved={() => {
                  setEditingRx(null);
                  setInitialBuilderItems([]);
                  setBuilderProtocolId(null);
                  setBuilderProtocolName(null);
                  setBuilderDoctorId(null);
                  setBuilderDoctorName(null);
                  refresh();
                }}
                onCanceled={() => {
                  setEditingRx(null);
                  setInitialBuilderItems([]);
                  setBuilderProtocolId(null);
                  setBuilderProtocolName(null);
                  setBuilderDoctorId(null);
                  setBuilderDoctorName(null);
                }}
              />
            </div>
          </StandardDrawer>
        )}

        {isSourceSelectorOpen && (
          <SourceSelectorModal 
            onClose={() => setIsSourceSelectorOpen(false)}
            onSelectSource={(sourceId) => {
              setIsSourceSelectorOpen(false);
              // Clear previous builder context
              setInitialBuilderItems([]);
              setBuilderProtocolId(null);
              setBuilderProtocolName(null);
              setBuilderDoctorId(null);
              setBuilderDoctorName(null);

              if (sourceId === PRESCRIPTION_SOURCES.PROTOCOL) {
                setIsProtocolSearchOpen(true);
              } else if (sourceId === PRESCRIPTION_SOURCES.ITEMS || sourceId === PRESCRIPTION_SOURCES.MANUAL) {
                // Open builder directly with no pre-loaded items
                openDrawer('rx-builder', 'new');
              } else {
                // Import / AI / Fagron flows use the intake workspace
                setIsIntakeOpen(true);
              }
            }}
          />
        )}

        {isProtocolSearchOpen && (
          <StandardDrawer
            isOpen={true}
            onClose={() => setIsProtocolSearchOpen(false)}
            title="Select Base Protocol"
            subtitle="Doses and quantities will be calculated automatically."
          >
            <div style={{ padding: '1rem' }}>
              <BuilderProtocolSearch 
                onSelectProtocol={(protocolData) => {
                  setIsProtocolSearchOpen(false);
                  openDrawer('rx-builder', 'new', { 
                    initialProtocolId: protocolData.protocolId,
                    initialProtocolName: protocolData.protocolName,
                    initialDoctorId: protocolData.doctorId,
                    initialDoctorName: protocolData.doctorName,
                    initialItems: protocolData.prescriptionLines 
                  });
                }} 
              />
            </div>
          </StandardDrawer>
        )}

        {isIntakeOpen && (
          <PrescriptionIntakeWorkspace
            isOpen={true}
            onClose={() => setIsIntakeOpen(false)}
            onSaveSuccess={() => refresh?.()}
          />
        )}
      </DataModule>
    </>
  );
}
