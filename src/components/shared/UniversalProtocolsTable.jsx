"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useFirestorePaginatedCollection } from '../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../hooks/ui/useDataTable';
import useDataModuleState from '../../hooks/useDataModuleState';
import { useToast } from '../../hooks/useToast';
import notifier from '../../services/NotificationService';
import { updateProtocol, deleteProtocol, createProtocol, cloneProtocol } from '../../repositories/protocolRepository';
import { useDrawer } from '../../context/DrawerContext';
import { useOrderBuilderStore } from '../../stores/orderBuilderStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

import DataModule from '../ui/DataModule';
import StatusChip from '../ui/StatusChip';
import { CLINICAL_GOALS, getGoalLabel } from '../../config/goals';
import CopyableId from '../ui/CopyableId';
import HighDensityDrawer from '../ui/HighDensityDrawer';
import ProductDetailsDrawer from '../admin/products/ProductDetailsDrawer';
import ProtocolHubDashboard from '../admin/protocols/ProtocolHubDashboard';
import UniformKPIs from '../admin/protocols/components/UniformKPIs';
import ProtocolMasterDetailRow from '../admin/protocols/ProtocolMasterDetailRow';
import ProtocolErrorBoundary from '../admin/protocols/ProtocolErrorBoundary';
import CustomProtocolBuilder from '../admin/CustomProtocolBuilder';
import AppActionGroup from '../ui/AppActionGroup';
import AIQuickActionButton from '../ui/AIQuickActionButton';

import { 
  ClipboardList, Plus, Play, Pause, Archive, Edit3, Trash2, FlaskConical, Download, RefreshCw, Briefcase 
} from '@/lib/icons';
import InlineEditableCell from '../ui/InlineEditableCell';
import { calculateClinicalCompleteness, getProtocolDisplayName } from '../../utils/protocolHelpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import MobileProtocolCard from './mobile/MobileProtocolCard';
import MobileActionSheet from '../ui/MobileActionSheet';

export default function UniversalProtocolsTable({ role = 'admin', isSubTab = false, title = "Protocols & Pathways", subtitle = "Manage clinical pathways, kits, and treatment templates", initialData = null, serverKPIs }) {
  const { toast } = useToast();
  const { openDrawer } = useDrawer();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [linkedProduct, setLinkedProduct] = useState(null);
  const [showPathwayWizard, setShowPathwayWizard] = useState(false);
  const [showBulkCategoryPicker, setShowBulkCategoryPicker] = useState(false);
  const [mobileActionProtocol, setMobileActionProtocol] = useState(null);

  const handleMobileQuickAction = useCallback((action, protocol) => {
    if (action === 'menu') setMobileActionProtocol(protocol);
  }, []);

  const mobileCardPropsForTable = useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);

  // KPI Scope state (Golden Rule #22)
  const [kpiScope, setKpiScope] = useState('filtered');

  // Inline Editing State
  const [deleting, setDeleting] = useState(null);

  const handleProtocolFieldUpdate = async (protocolId, field, value) => {
    try {
      await updateProtocol(protocolId, { [field]: value });
      toast.success(`Protocol updated`);
      refetchProtocols();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update protocol');
    }
  };

  const { getUrlParam, updateUrlParam, updateSearchTerm, searchTerm } = useDataModuleState('admin-protocols');

  // Filters
  const filterStatus = getUrlParam('status', '');
  const filterGoal = getUrlParam('goals', '');
  const filterRange = getUrlParam('range', 'all');
  const filterPeptides = getUrlParam('peptides', '');

  const whereConditions = useMemo(() => {
    const conditions = [];
    if (filterStatus && filterStatus !== 'all') conditions.push(['status', '==', filterStatus]);
    if (filterPeptides === 'true') conditions.push(['has_peptides', '==', true]);
    if (filterPeptides === 'false') conditions.push(['has_peptides', '==', false]);
    return conditions;
  }, [filterStatus, filterPeptides]);

  const { 
    data: rawProtocols, 
    isLoading: loading, 
    isFetchingMore, 
    hasMore, 
    loadMore, 
    metrics,
    refresh: refetchProtocols
  } = useFirestorePaginatedCollection('protocols', {
    whereConditions,
    orderByFields: [],
    pageSize: 100,
    initialData,
    aggregations: serverKPIs ? undefined : {
      totalCount: { type: 'count' },
      activeCount: { type: 'count', conditions: [['status', '==', 'active']] }
    }
  });

  const protocols = useMemo(() => {
    return (rawProtocols || []).map(p => ({
      ...p,
      name: p.name || p.title || p.protocol_name || 'Unnamed Protocol',
      status: p.status || 'active',
      primary_goal: p.primary_goal || p.goal || (Array.isArray(p.goals) && p.goals[0]) || 'Tissue Repair & Recovery',
      goals: (Array.isArray(p.goals) && p.goals.length > 0) ? p.goals : [p.primary_goal || p.goal || 'Tissue Repair & Recovery'],
    }));
  }, [rawProtocols]);

  // Dynamic goals aggregation with live counts
  const dynamicGoalOptions = useMemo(() => {
    const counts = {};
    (protocols || []).forEach(p => {
      const gList = (Array.isArray(p.goals) && p.goals.length > 0)
        ? p.goals
        : [p.primary_goal || 'Tissue Repair & Recovery'];
      gList.forEach(g => {
        if (g && typeof g === 'string') {
          counts[g] = (counts[g] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([goal, count]) => ({
        label: `${goal} (${count})`,
        value: goal,
      }));
  }, [protocols]);

  const totalCount = serverKPIs?.totalCount ?? metrics?.totalCount ?? protocols?.length ?? 0;

  const {
    selectedIds,
    clearSelection,
    selectedItems,
    toggleRowSelection,
  } = useDataTable(protocols, {
    idField: 'id',
    initialPageSize: 50,
  });

  // Algolia Search
  const algoliaFacetFilters = useMemo(() => {
    const filters = [];
    if (filterStatus && filterStatus !== 'all') filters.push(`status:${filterStatus}`);
    if (filterGoal && filterGoal !== 'all') filters.push(`primary_goal:${filterGoal}`);
    if (filterPeptides === 'true') filters.push(`has_peptides:true`);
    if (filterPeptides === 'false') filters.push(`has_peptides:false`);
    return filters;
  }, [filterStatus, filterGoal, filterPeptides]);

  const algoliaNumericFilters = useMemo(() => {
    const filters = [];
    if (filterRange && filterRange !== 'all') {
      const date = new Date();
      if (filterRange === '7d') date.setDate(date.getDate() - 7);
      else if (filterRange === '30d') date.setDate(date.getDate() - 30);
      else if (filterRange === '90d') date.setDate(date.getDate() - 90);
      else if (filterRange === '1y') date.setFullYear(date.getFullYear() - 1);
      filters.push(`created_at >= ${Math.floor(date.getTime() / 1000)}`);
    }
    return filters;
  }, [filterRange]);

  const { 
    hits: algoliaHits, 
    loading: algoliaLoading, 
    isAlgoliaActive 
  } = useAlgoliaSearch({
    collectionName: 'protocols',
    searchQuery: searchTerm,
    facetFilters: algoliaFacetFilters,
    numericFilters: algoliaNumericFilters,
  });

  const locallySearchedProtocols = useMemo(() => {
    let list = protocols;

    // Filter by Goal
    if (filterGoal && filterGoal !== 'all') {
      const gLower = filterGoal.toLowerCase();
      list = list.filter(p => {
        const pGoal = (p.primary_goal || p.goal || '').toLowerCase();
        const pGoals = (p.goals || []).map(g => String(g).toLowerCase());
        return pGoal.includes(gLower) || pGoals.some(g => g.includes(gLower));
      });
    }

    // Filter by Date Range
    if (filterRange && filterRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filterRange === '7d') cutoff.setDate(now.getDate() - 7);
      else if (filterRange === '30d') cutoff.setDate(now.getDate() - 30);
      else if (filterRange === '90d') cutoff.setDate(now.getDate() - 90);
      else if (filterRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);

      list = list.filter(p => {
        const rawDate = p.created_at || p.createdAt || p.updatedAt;
        if (!rawDate) return true; // keep if no date
        const d = rawDate.toDate ? rawDate.toDate() : new Date(rawDate.seconds ? rawDate.seconds * 1000 : rawDate);
        return isNaN(d) || d >= cutoff;
      });
    }

    if (!searchTerm || !searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(p => 
      (p.name && p.name.toLowerCase().includes(lower)) ||
      (p.primary_goal && p.primary_goal.toLowerCase().includes(lower)) ||
      (Array.isArray(p.goals) && p.goals.some(g => String(g).toLowerCase().includes(lower))) ||
      (p.therapeutic_category && p.therapeutic_category.toLowerCase().includes(lower)) ||
      (p.category && p.category.toLowerCase().includes(lower)) ||
      (Array.isArray(p.bom) && p.bom.some(b => (b.product_name || b.name || '').toLowerCase().includes(lower))) ||
      (Array.isArray(p.peptides) && p.peptides.some(pep => String(pep).toLowerCase().includes(lower)))
    );
  }, [protocols, searchTerm, filterGoal, filterRange]);

  const finalFiltered = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return locallySearchedProtocols;
    
    // Golden Rule 33: Optimistic Local Search Fallback (Hybrid)
    if (isAlgoliaActive) {
      const algoliaMapped = algoliaHits
        .map((h) => protocols.find((p) => p.id === h.objectID) || { ...h, id: h.objectID })
        .filter(Boolean);
        
      const combined = [...algoliaMapped];
      const algoliaIds = new Set(algoliaMapped.map(p => p.id));
      
      for (const p of locallySearchedProtocols) {
        if (!algoliaIds.has(p.id)) {
          combined.push(p);
        }
      }
      return combined;
    }
    
    return locallySearchedProtocols;
  }, [isAlgoliaActive, searchTerm, algoliaHits, protocols, locallySearchedProtocols]);

  // ── Direct ID Fast Path (0ms auto-expand when jumping from Product / URL) ──
  useEffect(() => {
    const directQuery = searchParams.get('q') || searchParams.get('id');
    if (!directQuery) return;
    
    // Check if target protocol is already in memory
    const match = protocols.find(p => p.id === directQuery || p.slug === directQuery);
    if (match) {
      const timer = setTimeout(() => setSelectedProtocol(match), 0);
      return () => clearTimeout(timer);
    }

    // Direct Firestore Fast-Path fetch if not in current page
    if (directQuery.length >= 15) {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        getDoc(doc(db, 'protocols', directQuery)).then(snap => {
          if (snap.exists()) {
            const timer = setTimeout(() => setSelectedProtocol({ id: snap.id, ...snap.data() }), 0);
            return () => clearTimeout(timer);
          }
        }).catch(console.error);
      });
    }
  }, [searchParams, protocols]);

  function handleDelete(id) {
    notifier.confirmCritical(
      'Permanently delete this protocol? This cannot be undone.',
      async () => {
        setDeleting(id);
        try {
          const rxRef = collection(db, 'prescriptions');
          const q = query(rxRef, where('protocolId', '==', id));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            const activeRx = snap.docs.filter(d => {
               const st = d.data().status?.toLowerCase();
               return st && !['completed', 'cancelled', 'fulfilled'].includes(st);
            });
            
            if (activeRx.length > 0) {
              toast.error(`Cannot delete protocol. It is currently used in ${activeRx.length} active prescription(s). Please Archive it instead.`);
              setDeleting(null);
              return;
            }
          }

          await deleteProtocol(id);
          refetchProtocols();
          toast.success('Protocol deleted successfully.');
        } catch (err) {
          toast.error('Delete failed: ' + err.message);
        } finally {
          setDeleting(null);
        }
      }
    );
  }

  const handleBulkAssignCategory = async (category) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id => updateProtocol(id, { therapeutic_category: category })));
      clearSelection();
      refetchProtocols();
      setShowBulkCategoryPicker(false);
      toast.success(`Assigned category to ${ids.length} protocol(s).`);
    } catch (err) {
      toast.error('Failed to assign category: ' + err.message);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    let d;
    if (ts.toDate) {
      d = ts.toDate();
    } else if (ts.seconds || ts._seconds) {
      d = new Date((ts.seconds || ts._seconds) * 1000);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  return (
    <>
      <DataModule
      title={!isSubTab ? title : undefined}
      subtitle={!isSubTab ? subtitle : undefined}
      icon={ClipboardList}
      hideHeader={isSubTab}
      actions={
        <div className="protocols-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <AIQuickActionButton
            label="AI Design Pathway"
            onClick={() => setShowPathwayWizard(true)}
            title="Design structured multi-phase clinical pathway with AI"
          />
          <button
            type="button"
            onClick={() => setShowPathwayWizard(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-primary, #003666)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={16} />
            <span>Create Pathway</span>
          </button>
        </div>
      }
      mobileOverflowActions={[
        { label: 'Export CSV', icon: Download, onClick: () => notifier.info("Export to CSV coming soon") },
        { label: 'Refresh', icon: RefreshCw, onClick: () => refetchProtocols() }
      ]}
      searchPlaceholder="Search protocols by name, category, goals, tags…"
      searchTerm={searchTerm}
      onSearchChange={updateSearchTerm}
      resultCount={loading && !algoliaLoading ? undefined : (isAlgoliaActive ? finalFiltered.length : totalCount)}
      searchLoading={algoliaLoading}
      namespace="admin-protocols"
      kpis={
        <UniformKPIs 
          data={finalFiltered} 
          globalMetrics={serverKPIs || metrics} 
          kpiScope={kpiScope}
          onScopeChange={setKpiScope}
          isFiltered={Boolean(searchTerm || filterStatus || filterGoal || (filterRange && filterRange !== 'all') || filterPeptides)}
        />
      }
      expandableRender={(protocol) => (
        <ProtocolErrorBoundary>
          <ProtocolMasterDetailRow
            protocol={protocol}
            onOpenDrawer={setSelectedProtocol}
            onCreateRx={(p) => openDrawer('rx-builder', 'new', {
              initialProtocol: p,
              initialProtocolId: p.id,
              initialProtocolName: p.name || p.title,
              sourceModule: 'protocols-table',
            })}
          />
        </ProtocolErrorBoundary>
      )}
      filterOptions={[
        {
          key: 'peptides',
          label: 'Contains Peptides',
          value: filterPeptides,
          options: [
            { label: 'All Protocols', value: '' },
            { label: 'With Peptides', value: 'true' },
            { label: 'Without Peptides', value: 'false' }
          ],
          onChange: (val) => updateUrlParam('peptides', val)
        },
        {
          key: 'status',
          label: 'Status',
          value: filterStatus,
          options: [
            { label: 'All Statuses', value: '' },
            { label: 'Draft', value: 'draft' },
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
            { label: 'Archived', value: 'archived' }
          ],
          onChange: (val) => updateUrlParam('status', val)
        },
        {
          key: 'goals',
          label: 'Clinical Goal',
          value: filterGoal,
          options: [
            { label: 'All Goals', value: '' },
            ...dynamicGoalOptions
          ],
          onChange: (val) => updateUrlParam('goals', val)
        },
        {
          key: 'range',
          label: 'Created',
          value: filterRange,
          options: [
            { label: 'All Time', value: 'all' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
            { label: 'Last 1 Year', value: '1y' }
          ],
          onChange: (val) => updateUrlParam('range', val)
        }
      ]}
      filters={[
        filterPeptides && filterPeptides !== 'all' && { key: 'peptides', label: 'Peptides', value: filterPeptides === 'true' ? 'Yes' : 'No', onRemove: () => updateUrlParam('peptides', 'all') },
        filterStatus && filterStatus !== 'all' && { key: 'status', label: 'Status', value: filterStatus, onRemove: () => updateUrlParam('status', 'all') },
        filterGoal && filterGoal !== 'all' && { key: 'goals', label: 'Goal', value: filterGoal, onRemove: () => updateUrlParam('goals', 'all') },
        filterRange && filterRange !== 'all' && { key: 'range', label: 'Created', value: filterRange, onRemove: () => updateUrlParam('range', 'all') }
      ].filter(Boolean)}
      data={finalFiltered}
      loading={loading}
      hasMore={hasMore}
      loadMore={loadMore}
      isFetchingMore={isFetchingMore}
      isSearchActive={isAlgoliaActive}
      selectedIds={Array.from(selectedIds)}
      onSelectionChange={(newArr) => {
         clearSelection();
         newArr.forEach(id => toggleRowSelection(id));
      }}
      onRowClick={(row) => setSelectedProtocol(row)}
      mobileCardComponent={MobileProtocolCard}
      mobileCardProps={mobileCardPropsForTable}
      onRefresh={refetchProtocols}
      emptyState={{
        title: searchTerm ? `No protocols matching "${searchTerm}"` : 'No protocols saved yet.',
        description: "Try adjusting your search or filters, or create a new protocol."
      }}
      bulkActions={[
         { label: 'Assign Category', icon: <Archive size={14}/>, onClick: () => setShowBulkCategoryPicker(true) }
      ]}
      columns={[
        {
          key: 'protocol_name',
          header: 'Protocol Name & Category',
          sortable: true,
          width: '50%',
          render: (p) => {
            return (
              <div style={{ fontWeight: 600, color: '#202124' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.95rem' }}>
                    <InlineEditableCell 
                      value={getProtocolDisplayName(p)} 
                      type="text" 
                      onSave={(v) => handleProtocolFieldUpdate(p.id, 'name', v)} 
                    />
                  </span>
                  <CopyableId value={p.id} iconOnly={true} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5f6368', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(() => {
                    const goalsList = (Array.isArray(p.goals) && p.goals.length > 0)
                      ? p.goals
                      : (Array.isArray(p.goalIds) && p.goalIds.length > 0)
                        ? p.goalIds.map(g => getGoalLabel(g))
                        : (p.primary_goal || p.goal)
                          ? [p.primary_goal || p.goal]
                          : [p.therapeutic_category || p.category || 'Regenerative Recovery'];
                    
                    return goalsList.slice(0, 2).map((g, idx) => (
                      <span key={idx} style={{ 
                        background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 500
                      }}>
                        {g}
                      </span>
                    ));
                  })()}
                  <span style={{ color: '#9aa0a6' }}>|</span>
                  <span>v{p.version_number ?? 1} • {formatDate(p.created_at || p.createdAt || p.updatedAt)}</span>
                </div>
              </div>
            );
          }
        },

        {
          key: 'duration',
          header: 'Duration',
          width: '12%',
          render: (p) => {
            const calculatedDuration = p.phases?.reduce((acc, phase) => acc + (phase.durationWeeks || phase.duration_weeks || phase.durationInWeeks || 0), 0) || 0;
            const duration = p.protocol_duration_weeks || p.duration_weeks || p.durationWeeks || calculatedDuration || 0;
            return (
              <InlineEditableCell 
                value={duration || ''} 
                type="number" 
                suffix={duration ? "wks" : ""} 
                stacked={true}
                placeholder="—" 
                onSave={(v) => handleProtocolFieldUpdate(p.id, 'durationWeeks', v)} 
              />
            );
          }
        },

        {
          key: 'status',
          header: 'Status',
          sortable: true,
          width: '8%',
          align: 'center',
          render: (p) => {
            if (p.status === 'paused' || p.status === 'inactive') {
              return <StatusChip status="inactive" customLabel="Paused" variant="dot" />;
            }
            return <StatusChip status={p.status || 'draft'} variant="dot" />;
          }
        },
        {
          key: 'completeness',
          header: 'Clinical Data',
          sortable: true,
          sortValue: (p) => calculateClinicalCompleteness(p).pct,
          width: '12%',
          align: 'center',
          render: (p) => {
            const { pct, color } = calculateClinicalCompleteness(p);
            return (
              <span
                title={`${pct}% Completed`}
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'help'
                }}
              />
            );
          }
        },
        {
          key: 'phases',
          header: 'Phases',
          width: '10%',
          sortable: true,
          sortValue: (p) => (p.phases ?? []).length,
          render: (p) => {
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                <FlaskConical size={14} /> 
                <span>{(p.phases ?? []).length}</span>
              </div>
            );
          }
        },
        {
          key: 'actions',
          header: 'Actions',
          align: 'right',
          width: '140px',
          render: (p) => {
            const handleCloneProtocol = async (protocol, formatOverride) => {
              try {
                const newId = await cloneProtocol(protocol, { targetFormat: formatOverride });
                const editionLabel = formatOverride === 'pen' ? 'Pen Edition (Ready-to-use)' : formatOverride === 'vial' ? 'Vial Edition' : 'Draft';
                notifier.success(`Protocol cloned successfully as ${editionLabel}`);
                refetchProtocols();
                openDrawer('protocol-editor', newId);
              } catch (e) {
                console.error("Clone protocol error:", e);
                notifier.error("Failed to clone protocol: " + e.message);
              }
            };

            const baseActions = [
              {
                type: 'load_workspace',
                label: 'Load into Workspace Hub',
                icon: Briefcase,
                onClick: () => {
                  const protocolItems = (p.phases || []).flatMap(phase => 
                    (phase.drugs_used || phase.products || []).map(d => ({
                      productId: d.productId || d.id || d.product_slug,
                      canonicalName: d.product_title || d.name || 'Protocol Medication',
                      dosage: d.weekly_dose || d.dosage || '',
                      quantity: 1,
                      unitPrice: Number(d.price || 150),
                      supplierCost: Number(d.supplierCost || 85),
                      format: d.format || 'Vial',
                    }))
                  );
                  const itemsToLoad = protocolItems.length > 0 ? protocolItems : [{
                    productId: p.id,
                    canonicalName: p.name || p.title || 'Clinical Protocol Kit',
                    dosage: `${p.duration_weeks || 4} wks`,
                    quantity: 1,
                    unitPrice: 250,
                    supplierCost: 120,
                    format: 'Kit'
                  }];

                  const { addItems, activeWorkspaceId } = useWorkspaceStore.getState();
                  addItems(itemsToLoad, activeWorkspaceId);
                  notifier.success(`Loaded ${itemsToLoad.length} compound(s) from "${p.name || p.title}" into Workspace!`);
                }
              },
              {
                type: 'create_prescription',
                label: 'Generate Prescription',
                icon: ClipboardList,
                onClick: () => openDrawer('rx-builder', 'new', {
                  initialProtocol: p,
                  initialProtocolId: p.id,
                  initialProtocolName: p.name || p.title,
                  sourceModule: 'protocols-table',
                })
              },
              {
                type: 'clone',
                label: 'Clone Protocol (Duplicate)',
                onClick: () => handleCloneProtocol(p)
              },
              {
                type: 'create_quote',
                label: 'Quote Protocol to Client (Clinic / Wholesaler / Patient)',
                tooltip: 'Create Quotation for Client from Protocol Blueprint',
                onClick: () => {
                  const protocolItems = (p.phases || []).flatMap(phase => 
                    (phase.drugs_used || phase.products || []).map(d => ({
                      productId: d.productId || d.id || d.product_slug,
                      name: d.product_title || d.name || 'Protocol Medication',
                      dosage: d.weekly_dose || d.dosage || '',
                      quantity: 1,
                      unitRate: 150,
                      supplierCost: 85
                    }))
                  );
                  window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                    detail: {
                      type: 'protocol',
                      protocolId: p.id,
                      protocolName: p.name || p.title,
                      items: protocolItems
                    }
                  }));
                  notifier.info(`Starting client quotation for protocol ${p.name || p.title}...`);
                }
              },
              {
                type: 'request_rfq',
                label: 'Request Supplier RFQ (Cotizar Suministros Protocolo)',
                tooltip: 'Request quotes for all protocol ingredients & supplies from laboratories',
                onClick: () => {
                  const protocolItems = (p.phases || []).flatMap(phase => 
                    (phase.drugs_used || phase.products || []).map(d => ({
                      productId: d.productId || d.id || d.product_slug,
                      name: d.product_title || d.name || 'Protocol Medication',
                      dosage: d.weekly_dose || d.dosage || '',
                      quantity: 1
                    }))
                  );
                  notifier.success(`Opening Supplier RFQ for protocol ${p.name || p.title} (${protocolItems.length} items)`);
                  if (typeof openDrawer === 'function') {
                    openDrawer({
                      type: 'supplier-rfq',
                      data: {
                        source: 'protocol',
                        protocolId: p.id,
                        protocolName: p.name || p.title,
                        items: protocolItems
                      }
                    });
                  }
                }
              },
              {
                type: 'clone',
                label: 'Clone as Pen Edition (No Reconstitution)',
                onClick: () => handleCloneProtocol(p, 'pen')
              },
              {
                type: (p.status === 'paused' || p.status === 'inactive') ? 'play' : 'pause',
                icon: (p.status === 'paused' || p.status === 'inactive') ? Play : Pause,
                label: (p.status === 'paused' || p.status === 'inactive') ? 'Activate Protocol' : 'Pause Protocol',
                onClick: async () => {
                  const isPausing = !(p.status === 'paused' || p.status === 'inactive');
                  try {
                    await updateProtocol(p.id, {
                      status: isPausing ? 'paused' : 'active'
                    });
                    notifier.success(`Protocol ${p.name || p.title} ${isPausing ? 'paused' : 'activated'}`);
                    refetchProtocols();
                  } catch (e) {
                    notifier.error('Failed to update protocol status');
                    console.error(e);
                  }
                }
              },
              {
                type: 'delete',
                onClick: () => handleDelete(p.id)
              }
            ];

            const actions = searchParams.get('intent') === 'rx_build'
              ? [
                  {
                    type: 'add',
                    icon: Plus,
                    label: 'Add to Rx',
                    onClick: () => {
                      const item = {
                        type: 'protocol',
                        id: p.id,
                        name: p.name || p.title || 'Protocol',
                        price: p.total_price || p.price || 0,
                        quantity: 1,
                      };
                      useOrderBuilderStore.getState().addItem(item);
                      notifier.success(`Added ${p.name || p.title} to Rx Draft`);
                      router.back();
                      openDrawer('rx-builder');
                    }
                  },
                  ...baseActions
                ]
              : baseActions;

            return (
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                {deleting === p.id ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Deleting...</span>
                ) : (
                  <AppActionGroup maxVisible={3} actions={actions} />
                )}
              </div>
            );
          }
        }
      ]}
    >
      {/* Drawers and Modals */}
      {showBulkCategoryPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: 360, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Assign Category to {selectedIds.length} Protocol(s)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
              {['Recovery','Sleep','Metabolism','Longevity','Sexual Health','Cognitive Health','Growth Hormone','Immune Support','Aesthetics','Cardiac Health'].map(cat => (
                <button
                  key={cat}
                  onClick={() => handleBulkAssignCategory(cat)}
                  style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setShowBulkCategoryPicker(false)} style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', border: 'none', borderRadius: '8px', background: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {selectedProtocol && (
        <HighDensityDrawer
          isOpen={true}
          onClose={() => setSelectedProtocol(null)}
        >
          <ProtocolHubDashboard
            protocol={selectedProtocol}
            onClose={() => setSelectedProtocol(null)}
            onProductClick={(product) => setLinkedProduct(product)}
            onChange={(newProtocol) => {
              setSelectedProtocol(newProtocol);
              const queries = queryClient.getQueriesData({ queryKey: ['firestore', 'protocols'] });
              queries.forEach(([queryKey, oldData]) => {
                if (!oldData || !oldData.pages) return;
                queryClient.setQueryData(queryKey, {
                  ...oldData,
                  pages: oldData.pages.map(page => ({
                    ...page,
                    docs: page.docs.map(d => d.id === newProtocol.id ? newProtocol : d)
                  }))
                });
              });
            }}
            onSave={async (updates) => {
              try {
                await updateProtocol(selectedProtocol.id, updates);
                toast.success('Protocol updated successfully');
                setSelectedProtocol(prev => ({ ...prev, ...updates }));
                refetchProtocols();
              } catch (err) {
                toast.error('Failed to update protocol: ' + err.message);
              }
            }}
          />
        </HighDensityDrawer>
      )}

      {linkedProduct && (
        <ProductDetailsDrawer 
          isOpen={!!linkedProduct} 
          product={linkedProduct} 
          onClose={() => setLinkedProduct(null)} 
        />
      )}

      {showPathwayWizard && (
        <CustomProtocolBuilder 
          isOpen={showPathwayWizard} 
          onClose={() => setShowPathwayWizard(false)} 
          onComplete={async (data) => {
             setShowPathwayWizard(false);
             try {
               await createProtocol({
                 ...data,
                 created_at: new Date(),
                 updated_at: new Date(),
                 version_number: 1,
                 visibility: 'public',
                 authorId: 'system'
               });
               toast.success('Protocol created successfully!');
               refetchProtocols();
             } catch (err) {
               toast.error('Failed to create protocol: ' + err.message);
             }
          }} 
        />
      )}
    </DataModule>

    {/* Protocol mobile quick-action sheet */}
    <MobileActionSheet
      isOpen={!!mobileActionProtocol}
      onClose={() => setMobileActionProtocol(null)}
      title={mobileActionProtocol?.name || 'Protocol'}
      items={[
        {
          label: 'View Protocol',
          icon: Edit3,
          onClick: () => setSelectedProtocol(mobileActionProtocol),
        },
        {
          label: mobileActionProtocol?.status === 'active' ? 'Pause Protocol' : 'Activate Protocol',
          icon: mobileActionProtocol?.status === 'active' ? Pause : Play,
          onClick: async () => {
            const newStatus = mobileActionProtocol?.status === 'active' ? 'paused' : 'active';
            try {
              await updateProtocol(mobileActionProtocol.id, { status: newStatus });
              toast.success(`Protocol ${newStatus}.`);
              refetchProtocols();
            } catch (e) {
              toast.error('Update failed.');
            }
          },
        },
        {
          label: 'Archive Protocol',
          icon: Archive,
          variant: 'danger',
          onClick: () => {
            notifier.confirmCritical(
              `Archive "${mobileActionProtocol?.name}"? It will be removed from active pathways.`,
              async () => {
                await updateProtocol(mobileActionProtocol.id, { status: 'archived' });
                toast.success('Protocol archived.');
                refetchProtocols();
              }
            );
          },
        },
      ]}
    />
    </>
  );
}
