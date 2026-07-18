'use client';
import { useRouter } from 'next/navigation';
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * AdminProtocolsTab.jsx
 * Full admin view: list all protocols, edit metadata + phases.
 * v2: Drawer detail view, bulk selection, Algolia search.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { createProtocol, deleteProtocol } from '../../../repositories/protocolRepository';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';

import { getPaginatedProtocols, updateProtocolFull } from '../../../services/protocolStorage';
import { RefreshCw, ChevronDown, ChevronRight, Trash2, Save, Check, Plus, X, AlertTriangle, FlaskConical, Package, Clock, User, GripVertical, Edit3, ExternalLink, Pause, Play, Archive, Activity, Search, CheckSquare, Square, ArchiveRestore, ClipboardList } from '@/lib/icons';
import { useToast } from '../../../hooks/useToast';
import CustomProtocolBuilder from '../../../components/admin/CustomProtocolBuilder';
import StandardDrawer from '../../../components/ui/StandardDrawer';
import BulkActionsBar from '../../../components/ui/BulkActionsBar';
import { TextField, Select } from '../../../components/ui';
import { useDataTable } from '../../../hooks/ui/useDataTable';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { useProducts } from '../../../hooks/admin/useProducts';
import ProtocolHubDashboard from '../../../components/admin/protocols/ProtocolHubDashboard';
import SmartProductPicker from '../../../components/shared/SmartProductPicker';
import DataTable from '../../../components/ui/DataTable';
import DataTableSkeleton from '../../../components/ui/skeletons/DataTableSkeleton';
import ProtocolFiltersBar from '../../../components/admin/protocols/ProtocolFiltersBar';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import GlobalSearchBar from '../../../components/ui/GlobalSearchBar';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

const STATUS_STYLE = {
  draft: { bg: 'var(--status-draft-bg)', color: 'var(--status-draft-color)' },
  active: { bg: 'var(--status-active-bg)', color: 'var(--status-active-color)' },
  archived: { bg: 'var(--status-archived-bg)', color: 'var(--status-archived-color)' },
};

import PhaseEditor from './PhaseEditor';
import SupplementsEditor from './SupplementsEditor';
import PathwayBuilder from './PathwayBuilder';


const STATUS_META = {
  draft: { icon: <Edit3 size={14} />, label: 'Draft', bg: 'var(--status-draft-bg, #f1f5f9)', color: 'var(--status-draft-color, #475569)' },
  active: { icon: <Play size={14} />, label: 'Active', bg: 'var(--status-active-bg, #ecfdf5)', color: 'var(--status-active-color, #059669)' },
  archived: { icon: <Archive size={14} />, label: 'Archived', bg: 'var(--status-archived-bg, #f3f4f6)', color: 'var(--status-archived-color, #6b7280)' },
};

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.draft;
}

export default function ProtocolsTable({ role = 'admin', initialProtocols = [], globalMetrics = null, isSubTab = false }) {
  const { toast } = useToast();
  const router = useRouter();
  const [protocols, setProtocols] = useState(initialProtocols);
  const [loading, setLoading] = useState(initialProtocols.length ? false : true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [error, setError] = useState(null);
  const [edits, setEdits] = useState({}); // id → { protocol_name, status, therapeutic_category, phases }
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [deleting, setDeleting] = useState(null);

  const handleBulkAssignCategory = (category) => {
    // Placeholder for bulk assign logic
    toast.info(`Bulk assigning category: ${category}`);
    setShowBulkCategoryPicker(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [drawerProtocol, setDrawerProtocol] = useState(null);
  const [linkedProduct, setLinkedProduct] = useState(null); // secondary: product detail drawer
  const { products: catalogProducts } = useProducts();

  const [showPathwayWizard, setShowPathwayWizard] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [activeChip, setActiveChip] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkCategoryPicker, setShowBulkCategoryPicker] = useState(false);

  // ── Algolia Search ───────────────────────────────────────────────────────────
  const { hits: algoliaHits, isAlgoliaActive } = useAlgoliaSearch(
    'protocols',
    searchQuery,
    {},
    300
  );

  // Merge: when Algolia returns hits, map them; otherwise use local data
  const chipFilteredProtocols = protocols.filter((p) => {
    let matches = true;
    if (activeChip === 'active') matches = p.status === 'active';
    else if (activeChip === 'drafts') matches = p.status === 'draft';
    else if (activeChip === 'archived') matches = p.status === 'archived';
    
    if (filterCategory !== 'all' && p.therapeutic_category !== filterCategory) matches = false;
    if (filterStatus !== 'all' && p.status !== filterStatus) matches = false;

    return matches;
  });

  const displayedProtocols =
    isAlgoliaActive && searchQuery.trim()
      ? algoliaHits
          .map((h) => protocols.find((p) => p.id === h.objectID) || { ...h, id: h.objectID })
          .filter(Boolean)
          .filter(p => {
             if (filterCategory !== 'all' && p.therapeutic_category !== filterCategory) return false;
             if (filterStatus !== 'all' && p.status !== filterStatus) return false;
             return true;
          })
      : chipFilteredProtocols;

  // ── Bulk selection via useDataTable ─────────────────────────────────────────
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleRowSelection,
    selectAll,
    clearSelection,
    isAllCurrentPageSelected,
    isIndeterminate,
    toggleSelectAllCurrentPage,
    selectedItems,
    paginatedData: paginatedProtocols,
    totalCount,
  } = useDataTable(displayedProtocols, { idField: 'id' });

  // Fetch initial protocols
  const fetchProtocols = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        protocols: data,
        lastDoc: last,
        hasMore: more,
      } = await getPaginatedProtocols(null, 100, {});
      setProtocols(data);
      // Inject data context for Atlas AI
      const activeProtocols = data.filter((p) => p.status === 'active');
      window.dispatchEvent(
        new CustomEvent('admin-context-update', {
          detail: {
            page: 'protocols',
            totalProtocols: data.length,
            activeCount: activeProtocols.length,
            categories: [...new Set(data.map((p) => p.therapeutic_category).filter(Boolean))],
            recentActive: activeProtocols.slice(0, 5).map((p) => ({
              title: p.protocol_name,
              category: p.therapeutic_category,
              phases: p.phases?.length || 0,
            })),
            summary: `Clinical Protocols: ${data.length} total protocols. ${activeProtocols.length} active.`,
          },
        })
      );
      setLastDoc(last);
      setHasMore(more);
    } catch (err) {
      setError('Failed to load protocols: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const {
        protocols: data,
        lastDoc: last,
        hasMore: more,
      } = await getPaginatedProtocols(lastDoc, 100, {});
      setProtocols((prev) => [...prev, ...data]);
      setLastDoc(last);
      setHasMore(more);
    } catch (err) {
      setError('Failed to load more protocols: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  // Fetch all protocols
  useEffect(() => {
    if (initialProtocols.length > 0) return; // Skip initial fetch if we have server data
    fetchProtocols();
  }, []);

  // Edit helpers
  const getEdit = (p) => {
    if (!p)
      return {
        protocol_name: '',
        therapeutic_category: '',
        status: 'draft',
        complexity_level: 'moderate',
        phases: [],
      };
    let comp = (p.complexity_level ?? p.metadata?.complexity_level ?? 'moderate').toLowerCase();
    if (comp === 'simple' || comp === 'minimal') comp = 'moderate';

    return (
      edits[p.id] ?? {
        protocol_name: p.protocol_name ?? '',
        therapeutic_category: p.therapeutic_category ?? '',
        status: p.status ?? 'draft',
        complexity_level: comp,
        phases: JSON.parse(JSON.stringify(p.phases ?? [])),
        supplements: JSON.parse(JSON.stringify(p.supplements ?? [])),
      }
    );
  };

  const setEditField = (id, field, value) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEdit(protocols.find((p) => p.id === id)), ...prev[id], [field]: value },
    }));

  const setEditPhases = (id, phases) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEdit(protocols.find((p) => p.id === id)), ...prev[id], phases },
    }));

  const setEditSupplements = (id, supplements) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEdit(protocols.find((p) => p.id === id)), ...prev[id], supplements },
    }));

  // Save
  async function handleSave(id) {
    const patch = edits[id];
    if (!patch) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await updateProtocolFull(id, patch);
      setProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(
        () =>
          setSaved((prev) => {
            const n = { ...prev };
            delete n[id];
            return n;
          }),
        2000
      );
      setEdits((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  // Delete
  async function handleDelete(id) {
    if (!window.confirm('Permanently delete this protocol? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteProtocol(id);
      setProtocols((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  }

  // Create new pathway from wizard
  const handleCreatePathway = async (protocolData) => {
    setShowPathwayWizard(false);
    try {
      const docRefId = await createProtocol({
        ...protocolData,
        created_at: new Date(),
        updated_at: new Date(),
        version_number: 1,
        visibility: 'public',
        authorId: 'system',
      });
      toast.success('Pathway created successfully!');
      fetchProtocols();
    } catch (err) {
      toast.error('Failed to create pathway: ' + err.message);
    }
  };

  const handleGenerateAIPathway = (formData) => {
    setShowPathwayWizard(false);
    toast.info('Atlas AI generation started. Check the AI Logs tab for progress.');
    // In a real app, this would trigger a backend Cloud Function or an event for the AI agent to pick up.
    // We can simulate creating a draft for now:
    handleCreatePathway({
      protocol_name: formData.title + ' (Atlas AI Draft)',
      therapeutic_category: formData.category,
      complexity_level: formData.complexity,
      status: 'draft',
      overview_summary: 'Draft generated by Atlas AI based on: ' + formData.description,
      phases: [{ label: 'Phase 1: Atlas AI Pending', durationWeeks: 4, items: [] }],
    });
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filtered Protocols
  // (now handled by useDataTable + displayedProtocols above)

  // Styles
  const inputStyle = {
    padding: '0.4rem 0.65rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
  };

  if (loading)
    return <DataTableSkeleton rows={10} columns={5} />;

  // Define DataTable columns
  const columns = [
    {
      key: 'protocol_name',
      label: 'Protocol Name',
      sortable: true,
      render: (p) => {
        const e = getEdit(p);
        const isDirty = !!edits[p.id];
        if (isDirty) {
          return (
            <input
              value={e.protocol_name}
              onChange={(ev) => setEditField(p.id, 'protocol_name', ev.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #1a73e8', borderRadius: '4px', fontSize: '0.85rem', width: '100%', minWidth: '180px' }}
              onClick={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <div style={{ fontWeight: 600, color: '#202124' }}>
            {e.protocol_name || 'Unnamed Protocol'}
            <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '2px', fontWeight: 400 }}>
              v{p.version_number ?? 1} • {formatDate(p.created_at)}
            </div>
          </div>
        );
      }
    },
    {
      key: 'therapeutic_category',
      label: 'Category',
      sortable: true,
      render: (p) => {
        const e = getEdit(p);
        const isDirty = !!edits[p.id];
        if (isDirty) {
          return (
            <input
              value={e.therapeutic_category}
              onChange={(ev) => setEditField(p.id, 'therapeutic_category', ev.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #1a73e8', borderRadius: '4px', fontSize: '0.85rem', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            />
          );
        }
        return e.therapeutic_category || '—';
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (p) => {
        const e = getEdit(p);
        const meta = getStatusMeta(e.status);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '20px', background: meta.bg, color: meta.color, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {meta.emoji} {meta.label}
          </span>
        );
      }
    },
    {
      key: 'phases',
      label: 'Phases',
      render: (p) => {
        const e = getEdit(p);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#334155' }}>
            <FlaskConical size={14} /> {(e.phases ?? []).length}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => {
        const e = getEdit(p);
        return (
          <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
            <button onClick={(ev) => { ev.stopPropagation(); router.push(`/admin/protocols/${p.id}/edit`); }} className="admin-tooltip-target" data-tooltip="Edit Protocol" style={{ background: 'transparent', border: 'none', color: '#1a73e8', cursor: 'pointer', padding: '4px' }}><Edit3 size={16} /></button>
            <button onClick={(ev) => { ev.stopPropagation(); router.push(`/prescriptions/new?source=Protocol&protocol=${p.id}`); }} className="admin-tooltip-target" data-tooltip="Generate Prescription" style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }}><ClipboardList size={16} /></button>
            <button onClick={(ev) => { ev.stopPropagation(); setEditField(p.id, 'status', e.status === 'active' ? 'draft' : 'active'); handleSave(p.id); }} className="admin-tooltip-target" data-tooltip={e.status === 'active' ? 'Deactivate' : 'Activate'} style={{ background: 'transparent', border: 'none', color: e.status === 'active' ? '#b06000' : '#137333', cursor: 'pointer', padding: '4px' }}>{e.status === 'active' ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={(ev) => { ev.stopPropagation(); setEditField(p.id, 'status', 'archived'); handleSave(p.id); }} className="admin-tooltip-target" data-tooltip="Archive" style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}><Archive size={16} /></button>
            <button onClick={(ev) => { ev.stopPropagation(); handleDelete(p.id); }} className="admin-tooltip-target" data-tooltip="Delete" disabled={!!deleting} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px', opacity: deleting === p.id ? 0.5 : 1 }}><Trash2 size={16} /></button>
          </div>
        );
      }
    }
  ];

  if (error)
  // Render detail in Master-Detail instead of full screen drawer

  return (
    <div style={{ paddingBottom: '2rem', minHeight: '100%' }}>
      

      {/* Header */}
      {!isSubTab && (
        <AdminPageHeader
          title="Protocols & Pathways"
          subtitle="Manage clinical pathways, kits, and treatment templates"
          icon={ClipboardList}
          rightContent={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={fetchProtocols}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                onClick={() => setShowPathwayWizard(true)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Create Pathway
              </button>
              <button
                onClick={() => router.push('/admin/protocols/new/edit')}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              >
                <Package size={16} /> Build Custom Kit
              </button>
            </div>
          }
        />
      )}


      {/* Unified GlobalSearchBar */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search protocols by name, category, goals, tags… (Algolia)"
          resultCount={!loading && !isAlgoliaActive ? displayedProtocols.length : undefined}
          namespace="admin-protocols"
          size="lg"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <UniformKPIs data={protocols} globalMetrics={globalMetrics} />
      </div>

      {/* Bulk Category Picker modal */}
      {showBulkCategoryPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: 360, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Assign Category to {selectedCount} Protocol(s)</h3>
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

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ProtocolFiltersBar
          activeChip={activeChip}
          setActiveChip={setActiveChip}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

      {paginatedProtocols.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          {searchQuery ? `No protocols matching "${searchQuery}"` : 'No protocols saved yet.'}
        </div>
      )}

        {/* Protocol Table */}
        <DataTable
          columns={columns}
          data={paginatedProtocols}
          keyField="id"
          selectedIds={selectedIds}
          onSelectionChange={(ids) => {
            // handle selection if needed
          }}
          expandableRender={(row) => (
            <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <ProtocolHubDashboard
                protocol={row}
                onClose={() => {}}
                onSave={async (updates) => {
                  try {
                    await updateProtocolFull(row.id, updates);
                    toast.success('Protocol updated successfully');
                    fetchProtocols();
                  } catch (err) {
                    toast.error('Failed to update protocol: ' + err.message);
                  }
                }}
              />
            </div>
          )}
        />

        {/* Pagination Load More */}
        {hasMore && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              background: '#f8f9fa',
            }}
          >
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: 'var(--color-bg-surface)',
                color: '#1a73e8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loadingMore ? 0.7 : 1,
              }}
            >
              {loadingMore ? (
                <RefreshCw size={14} className="admin-pill-status-dot--pulse" />
              ) : (
                <ChevronDown size={14} />
              )}
              {loadingMore ? 'Loading...' : 'Load More Protocols'}
            </button>
          </div>
        )}
      </div>



      {/* ── Linked Product Secondary Drawer ─────────────────────────────────── */}
      {linkedProduct && (
        <StandardDrawer
          isOpen={true}
          onClose={() => setLinkedProduct(null)}
          title={linkedProduct.name || linkedProduct.displayName || 'Product Details'}
          subtitle={linkedProduct.category || ''}
          fullWorkspace={true}
        >
          <div
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {linkedProduct.description && (
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {linkedProduct.description}
              </p>
            )}
            {[
              { label: 'SKU / Ref', value: linkedProduct.sku || linkedProduct.ref || '—' },
              { label: 'Category', value: linkedProduct.category || '—' },
              { label: 'Default Dosage', value: linkedProduct.defaultDosage || '—' },
              { label: 'Unit', value: linkedProduct.unit || '—' },
              {
                label: 'Active',
                value:
                  linkedProduct.isActive !== undefined
                    ? linkedProduct.isActive
                      ? 'Yes'
                      : 'No'
                    : '—',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.6rem 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    width: 110,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </StandardDrawer>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          opacity: 0.8,
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Widget: AdminProtocolsTab | Props: none
      </div>
    </div>
  );
}
