"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSupplierData } from './suppliers/useSupplierData';
import SupplierKPIs from './suppliers/SupplierKPIs';
import SupplierPagination from './suppliers/SupplierPagination';
import SupplierDetail from './suppliers/SupplierDetail';
import SupplierImportWorkflow from './suppliers/SupplierImportWorkflow';
import PageHeader from '../ui/PageHeader';
import DataModule from '../ui/DataModule';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import { useDrawer } from '../../context/DrawerContext';
import StandardDrawer from '../ui/StandardDrawer';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import Modal from '../ui/Modal';
import { getSupplierColumns } from './suppliers/supplierColumns';
import AccountManagerSelect from '../ui/AccountManagerSelect';
import Building2 from "lucide-react/dist/esm/icons/building-2";
import { CheckCircle, XCircle, Users, CheckSquare, Mail, Download, Archive, RefreshCw } from '@/lib/icons';
import toast from 'react-hot-toast';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import notifier from '../../services/NotificationService';
import { DataTableSkeleton } from '../ui';
import { useCategories } from '../../hooks/admin/useCategories';
import MobileSupplierCard from '../shared/mobile/MobileSupplierCard';
import MobileActionSheet from '../ui/MobileActionSheet';
import { Eye, Mail as MailIcon } from '@/lib/icons';

export default function AdminSuppliersTabClient({ isMobile, initialData }) {
  const { openDrawer } = useDrawer();
  const {
    suppliers,
    paginatedData,
    loading,
    isSearching,
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
    handleBulkUpdate,
    handleCreate,
    refresh
  } = useSupplierData({ initialData });

  // Firestore `categories` collection — ID-to-label resolution for filter pills + dropdown
  const { allOptions: categoryOptions, getCategoryLabel } = useCategories();

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [mobileActionSupplier, setMobileActionSupplier] = useState(null);

  const handleMobileQuickAction = useCallback((action, supplier) => {
    if (action === 'menu') setMobileActionSupplier(supplier);
  }, []);

  const mobileCardPropsForTable = useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);
  
  // Assign Manager Modal State
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearch = searchParams?.get('search');
  const openVariantId = searchParams?.get('openVariant');

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
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PageHeader
          title="Suppliers"
          subtitle="Laboratories & manufacturers — manage sourcing relationships, GMP docs, and product variants."
        />
        <DataTableSkeleton rows={10} columns={6} showHeader showSearch />
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

  const handleBulkAction = async (action) => {
    if (action === 'Activate B2B') {
      await handleBulkUpdate(selectedIds, { statusB2B: 'active' });
      setSelectedIds([]);
    } else if (action === 'Suspend B2B') {
      await handleBulkUpdate(selectedIds, { statusB2B: 'inactive' });
      setSelectedIds([]);
    } else if (action === 'Activate B2C') {
      await handleBulkUpdate(selectedIds, { statusB2C: 'active' });
      setSelectedIds([]);
    } else if (action === 'Suspend B2C') {
      await handleBulkUpdate(selectedIds, { statusB2C: 'inactive' });
      setSelectedIds([]);
    } else if (action === 'Assign Manager') {
      setSelectedManager('');
      setManagerModalOpen(true);
    } else {
      toast.success(`Bulk Action [${action}] triggered for ${selectedIds.length} suppliers. (Feature in development)`);
      setSelectedIds([]);
    }
  };

  const submitAssignManager = async () => {
    if (!selectedManager) {
      toast.error('Please select an Account Manager');
      return;
    }
    await handleBulkUpdate(selectedIds, { accountManager: selectedManager });
    setManagerModalOpen(false);
    setSelectedIds([]);
  };

  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleDeleteSupplier = (row) => {
    notifier.confirmCritical(`Are you sure you want to remove supplier "${row.name || row.companyName || row.id}" from the platform? This will NOT delete it from Zoho.`, async () => {
      try {
        await deleteDoc(doc(db, 'suppliers', row.id));
        toast.success(`Supplier ${row.name || row.companyName || row.id} removed successfully`);
        if (selectedSupplier?.id === row.id) setSelectedSupplier(null);
        refresh();
      } catch (e) {
        console.error(e);
        toast.error('Failed to remove supplier');
      }
    });
  };

  const supplierExpandableRender = (s) => {
    return (
      <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', borderRadius: '0 0 8px 8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📦 Commercial Terms & MOQ
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              MOQ: {s.moq ? `${s.moq} units` : '1 unit (Flexible)'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Currency: {s.currency || 'USD / EUR'} • Terms: Net 30
            </span>
          </div>
          <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📧 Orders Desk & Dispatch
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {s.contactEmail || s.email || 'orders@laboratory.com'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Lead Time: {s.leadTimeDays ? `${s.leadTimeDays} Days` : '3-5 Business Days'}
            </span>
          </div>
          <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🏆 Quality & Certifications
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#16a34a' }}>
              {s.gmpCertified ? '✅ EU GMP / ISO 9001' : 'Verified Compounding Lab'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Purity Average: {s.avgPurity ? `${s.avgPurity}%` : '≥ 99.2% HPLC'}
            </span>
          </div>
          <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              👤 Internal Relationship Lead
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {s.accountManager || s.manager || 'Sarah Jenkins'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
              {s.productsSupplied || 0} SKUs in Active Catalog
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
            <span>Products Supplied: <strong>{s.productsSupplied || 0} compounds</strong></span>
            <span>•</span>
            <span>Variants: <strong>{s.variantsSupplied || 0} active packages</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedSupplier(s)}
              className="gcp-btn-primary"
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
            >
              View Supplier Dossier & Documents →
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DataModule
        loading={loading || isSearching}
        title="Suppliers"
        subtitle="Laboratories & manufacturers — sourcing relationships, GMP docs, and product variants."
        icon={Building2}
        kpis={<SupplierKPIs kpiStats={serverKpis} isLoading={kpisLoading} activeKpiFilter={activeKpiFilter} setActiveKpiFilter={setActiveKpiFilter} />}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AIQuickActionButton
              label="AI Scan Price List"
              onClick={() => openDrawer('import-price-list')}
              title="Parse supplier price list or catalog PDF with AI"
            />
            <button
              type="button"
              onClick={() => handleCreate()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: 'var(--color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Building2 size={16} />
              <span>Add Supplier</span>
            </button>
          </div>
        }
        mobileOverflowActions={[
          { label: 'Export CSV', icon: Download, onClick: () => notifier.info("Exporting...") },
          { label: 'Refresh', icon: RefreshCw, onClick: () => refresh() }
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by supplier name, product, country, GMP status..."
        resultCount={totalItems}
        namespace="admin-suppliers"
        filters={[
          { key: 'hasProducts', label: 'Has Products', value: filters?.hasProducts ? 'Yes' : 'No', onRemove: () => setFilters(prev => ({ ...prev, hasProducts: !prev.hasProducts })) },
          // One chip per selected supplier — value resolved from ID → human name
          ...(filters?.supplierIds || []).map(sid => ({
            key: `supplier-${sid}`,
            label: 'Supplier',
            value: suppliers.find(s => s.id === sid)?.companyName
                || suppliers.find(s => s.id === sid)?.name
                || sid,
            onRemove: () => setFilters(prev => ({ ...prev, supplierIds: prev.supplierIds.filter(x => x !== sid) }))
          })),
          ...(filters?.status || []).map(val => ({ key: `status-${val}`, label: 'Status', value: val, onRemove: () => setFilters(prev => ({ ...prev, status: prev.status.filter(v => v !== val) })) })),
          ...(filters?.productCategory || []).map(val => ({ key: `pcat-${val}`, label: 'Product Category', value: getCategoryLabel(val), onRemove: () => setFilters(prev => ({ ...prev, productCategory: prev.productCategory.filter(v => v !== val) })) })),
        ].filter(Boolean)}
        filterOptions={[
          {
            key: 'productCategory',
            label: 'Product Category',
            multiSelect: true,
            values: filters?.productCategory || [],
            // Options sourced from Firestore `categories` collection — value=id, label=labelEn
            options: categoryOptions,
            onChange: (vals) => setFilters(prev => ({ ...prev, productCategory: vals }))
          },
          {
            key: 'supplier',
            label: 'Supplier',
            multiSelect: true,
            values: filters?.supplierIds || [],
            // value = supplier ID (e.g. "supplier-bloodo"), label = human name
            options: suppliers
              .filter(s => (s.productsSupplied || 0) > 0 || (s.variantsSupplied || 0) > 0)
              .map(s => ({ label: s.companyName || s.name || s.id, value: s.id }))
              .filter((v, i, arr) => v.value && arr.findIndex(x => x.value === v.value) === i)
              .sort((a, b) => a.label.localeCompare(b.label)),
            onChange: (vals) => setFilters(prev => ({ ...prev, supplierIds: Array.isArray(vals) ? vals : [] }))
          },
          {
            key: 'hasProducts',
            label: 'Has Products',
            multiSelect: false,
            values: [filters?.hasProducts ? 'yes' : 'no'],
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No',  value: 'no' },
            ],
            onChange: (vals) => setFilters(prev => ({ ...prev, hasProducts: vals?.[0] === 'yes' }))
          },
          {
            key: 'status',
            label: 'Status',
            multiSelect: true,
            values: filters?.status || [],
            options: [
              { label: 'Active',   value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            onChange: (vals) => setFilters(prev => ({ ...prev, status: vals }))
          }
        ]}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
          { label: 'Activate B2B', icon: <CheckCircle size={14} />, onClick: () => handleBulkAction('Activate B2B') },
          { label: 'Suspend B2B', icon: <XCircle size={14} />, onClick: () => handleBulkAction('Suspend B2B') },
          { label: 'Activate B2C', icon: <CheckCircle size={14} />, onClick: () => handleBulkAction('Activate B2C') },
          { label: 'Suspend B2C', icon: <XCircle size={14} />, onClick: () => handleBulkAction('Suspend B2C') },
          { label: 'Assign Manager', icon: <Users size={14} />, onClick: () => handleBulkAction('Assign Manager') },
          { label: 'Request Docs', icon: <CheckSquare size={14} />, onClick: () => handleBulkAction('Documents') },
          { label: 'Email', icon: <Mail size={14} />, onClick: () => handleBulkAction('Email') },
          { label: 'Export', icon: <Download size={14} />, onClick: () => handleBulkAction('Export') },
          { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('Archive'), variant: 'danger' }
        ]}
        data={paginatedData}
        columns={getSupplierColumns({
          sortConfig,
          setSortConfig,
          onUpdateField: (id, field, value) => handleUpdate(id, { [field]: value }),
          supplierOptions: suppliers
            .filter(s => (s.productsSupplied || 0) > 0 || (s.variantsSupplied || 0) > 0)
            .map(s => ({ label: s.companyName || s.name || s.id, value: s.id }))
            .filter((v, i, arr) => v.value && arr.findIndex(x => x.value === v.value) === i)
            .sort((a, b) => a.label.localeCompare(b.label)),
          onAction: async (action, supplier) => {
            if (action === 'edit') {
               setSelectedSupplier(supplier);
            } else if (action === 'view-catalog') {
               router.push(`/admin/catalog?supplier=${encodeURIComponent(supplier.id)}`);
            } else if (action === 'email') {
               notifier.success(`Opening email composer for ${supplier.name || supplier.companyName}`);
            } else if (action === 'suspend-b2b') {
               notifier.confirmCritical(`Are you sure you want to suspend B2B for ${supplier.name || supplier.companyName}?`, async () => {
                 await handleUpdate(supplier.id, { statusB2B: 'inactive' });
                 toast.success('B2B Status suspended');
                 refresh();
               });
            } else if (action === 'activate-b2b') {
               await handleUpdate(supplier.id, { statusB2B: 'active' });
               toast.success('B2B Status activated');
               refresh();
            } else if (action === 'suspend-b2c') {
               notifier.confirmCritical(`Are you sure you want to suspend B2C for ${supplier.name || supplier.companyName}?`, async () => {
                 await handleUpdate(supplier.id, { statusB2C: 'inactive' });
                 toast.success('B2C Status suspended');
                 refresh();
               });
            } else if (action === 'activate-b2c') {
               await handleUpdate(supplier.id, { statusB2C: 'active' });
               toast.success('B2C Status activated');
               refresh();
            }
          }
        })}
        keyField="id"
        onRowClick={(d) => setSelectedSupplier(d)}
        mobileCardComponent={MobileSupplierCard}
        mobileCardProps={mobileCardPropsForTable}
        onRefresh={refresh}
        emptyState={{
          title: "No suppliers found",
          subtitle: "Try adjusting your filters or search term."
        }}
      />

      {/* Supplier mobile quick-action sheet */}
      <MobileActionSheet
        isOpen={!!mobileActionSupplier}
        onClose={() => setMobileActionSupplier(null)}
        title={mobileActionSupplier?.companyName || mobileActionSupplier?.name || 'Supplier'}
        items={[
          {
            label: 'View Details',
            icon: Eye,
            onClick: () => setSelectedSupplier(mobileActionSupplier),
          },
          {
            label: 'Send Email',
            icon: MailIcon,
            onClick: () => {
              if (mobileActionSupplier?.email) {
                window.open(`mailto:${mobileActionSupplier.email}`);
              } else {
                notifier.warning('No email on file for this supplier.');
              }
            },
          },
          {
            label: 'Archive Supplier',
            icon: Archive,
            variant: 'danger',
            onClick: () => {
              notifier.confirmCritical(
                `Archive "${mobileActionSupplier?.companyName}"? They will be hidden from active sourcing.`,
                async () => {
                  try {
                    await handleUpdate(mobileActionSupplier.id, { status: 'archived', isActive: false });
                    notifier.success(`"${mobileActionSupplier?.companyName}" archived.`);
                    refresh();
                  } catch (e) {
                    notifier.error('Archive failed: ' + e.message);
                  }
                }
              );
            },
          },
        ]}
      />

      <StandardDrawer
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        width="800px"
        hideHeader={true}
        bodyPadding="0"
      >
        {selectedSupplier && (
          <SupplierDetail 
            w={selectedSupplier} 
            onClose={() => setSelectedSupplier(null)} 
            onUpdate={handleUpdate} 
            initialVariantId={openVariantId}
          />
        )}
      </StandardDrawer>

        <Modal
          isOpen={managerModalOpen}
          onClose={() => setManagerModalOpen(false)}
          title="Assign Account Manager"
          size="sm"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="gcp-btn-secondary" onClick={() => setManagerModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAssignManager}>Assign</button>
            </div>
          }
        >
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select an account manager to assign to {selectedIds.length} selected supplier(s).
            </p>
            <AccountManagerSelect
              label="Account Manager"
              value={selectedManager}
              onChange={setSelectedManager}
              placeholder="Search manager..."
            />
          </div>
        </Modal>
    </>
  );
}