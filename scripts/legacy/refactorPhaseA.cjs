const fs = require('fs');

// 1. Refactor AdminLeadsTab.jsx
let leadsContent = fs.readFileSync('src/components/admin/AdminLeadsTab.jsx', 'utf8');

// Add import
leadsContent = leadsContent.replace(
  "import { useToast } from '../../hooks/useToast';",
  "import { useToast } from '../../hooks/useToast';\nimport { useLeads } from '../../hooks/admin/useLeads';"
);

// Replace fetchLeads and state
const oldLeadsState = /const \[leads, setLeads\] = useState\(\[\]\);\n\s+const \[loading, setLoading\] = useState\(true\);\n\s+const \[catalogProducts, setCatalogProducts\] = useState\(\[\]\);/;

const newLeadsState = `const { leads: paginatedLeads, loading: loadingLeads, hasMore, loadMore, fetchLeads: refreshLeads, totalCount } = useLeads({ pageSize: 50 });
  const [agencyRfqs, setAgencyRfqs] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  
  const loading = loadingLeads || loadingMetadata;

  const leads = useMemo(() => {
    const combined = [...(paginatedLeads || []), ...agencyRfqs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return combined.map(l => {
        let st = l.status;
        if(st === 'completed') st = 'won';
        if(st === 'draft') st = 'pricing';
        if(st === 'contacted') st = 'qualified';
        return { 
          ...l, 
          status: st,
          country: l.country || (l.type === 'rfq' ? 'Spain' : 'UAE'),
          leadType: l.leadType || (l.type === 'rfq' ? 'Compounding Pharmacy' : 'Distributor'),
          assignedOwner: l.assignedOwner || 'Jose'
        };
      });
  }, [paginatedLeads, agencyRfqs]);
`;
leadsContent = leadsContent.replace(oldLeadsState, newLeadsState);

// Replace fetchLeads
const oldFetchLeads = /async function fetchLeads\(\) \{[\s\S]*?\}\s+function handleStatusChange/m;
const newFetchLeads = `async function fetchMetadata() {
    setLoadingMetadata(true);
    try {
      const [rfqsSnap, productsSnap] = await Promise.all([
        getDocs(query(collection(db, 'agency_rfqs'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'products'))
      ]);

      const allProducts = productsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setCatalogProducts(allProducts);
      const rfqs = rfqsSnap.docs.map(d => {
        const data = d.data();
        let isoCreatedAt = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') isoCreatedAt = data.createdAt.toDate().toISOString();
          else if (data.createdAt.seconds) isoCreatedAt = new Date(data.createdAt.seconds * 1000).toISOString();
        }
        return {
          id: d.id,
          name: data.clientName || 'Magenta Compounding Pharmacy',
          email: 'sourcing@magenta.es',
          phone: '+34 932 400 120',
          message: \`RFQ from \${data.supplierName || 'Supplier'}\\nItems: \${data.items?.length || 0}\`,
          status: data.status?.toLowerCase() || 'new',
          createdAt: isoCreatedAt,
          type: 'rfq',
          originalData: data,
          country: 'Spain',
          leadType: 'Compounding Pharmacy',
          assignedOwner: 'Jose'
        };
      });
      setAgencyRfqs(rfqs);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      toast.error('Failed to load RFQs and products.');
    } finally {
      setLoadingMetadata(false);
    }
  }

  const handleStatusChange`;
leadsContent = leadsContent.replace(oldFetchLeads, newFetchLeads);

// Fix useEffect
leadsContent = leadsContent.replace(
  "useEffect(() => {\n    fetchLeads();\n  }, []);",
  "useEffect(() => {\n    fetchMetadata();\n  }, []);"
);

// We need to fix setLeads calls inside handleStatusChange and handleUpdateRFQItems because 'leads' is now a useMemo.
// For CRM status updates, since it's now controlled by hook, we should just call refreshLeads() instead of mutating state locally, or we'd need a local override state. For now, calling refreshLeads() is easier and robust.
leadsContent = leadsContent.replace(
  /setLeads\(prev => prev.map\(l => l.id === leadId \? \{ \.\.\.l, status: newStatus \} : l\)\);/g,
  "refreshLeads();\n      setAgencyRfqs(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));"
);

leadsContent = leadsContent.replace(
  /setLeads\(prev => prev.map\(l => \{[\s\S]*?return l;\n\s+\}\)\);/g,
  "refreshLeads();\n      setAgencyRfqs(prev => prev.map(l => { if (l.id === rfqId) { return { ...l, message: \`RFQ from \${l.originalData.supplierName || 'Supplier'}\\nItems: \${updatedItems.length}\`, originalData: { ...l.originalData, items: updatedItems } }; } return l; }));"
);

// Add Load More button to AdminLeadsTab
leadsContent = leadsContent.replace(
  /<DataTable\s+data=\{filteredLeads\}\s+columns=\{columns\}\s+keyField="id"\s+onRowClick=\{setSelectedLead\}\s+emptyTitle="No commercial leads matching active filters"\s+\/>/g,
  `<DataTable
                data={filteredLeads}
                columns={columns}
                keyField="id"
                onRowClick={setSelectedLead}
                emptyTitle="No commercial leads matching active filters"
              />
              {hasMore && (
                <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                  <button className="gcp-btn-secondary" onClick={loadMore} disabled={loadingLeads}>
                    {loadingLeads ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}`
);

fs.writeFileSync('src/components/admin/AdminLeadsTab.jsx', leadsContent);

// 2. Refactor AdminBulkOrdersTab.jsx
let bulkContent = fs.readFileSync('src/components/admin/AdminBulkOrdersTab.jsx', 'utf8');

// Add import
bulkContent = bulkContent.replace(
  "import { logAction } from '../../services/auditLogger';",
  "import { logAction } from '../../services/auditLogger';\nimport { useBulkOrders } from '../../hooks/admin/useBulkOrders';\nimport GlobalSearchBar from '../ui/GlobalSearchBar';\nimport DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';"
);

// Replace state and listener
const oldBulkState = /const \[orders, setOrders\] = useState\(\[\]\);\n\s+const \[loading, setLoading\] = useState\(true\);\n\s+const \[filterStatus, setFilter\] = useState\('all'\);/;
const newBulkState = `const { bulkOrders: orders, loading, hasMore, loadMore, fetchBulkOrders: refreshOrders, totalCount } = useBulkOrders({ pageSize: 50 });
  const [filterStatus, setFilter] = useState('all');`;
bulkContent = bulkContent.replace(oldBulkState, newBulkState);

const oldListener = /useEffect\(\(\) => \{\s+const q = query\(collection\(db, 'bulk_orders'\), orderBy\('createdAt', 'desc'\), limit\(100\)\);[\s\S]*?return \(\) => unsub\(\);\s+\}, \[\]\);/;
const newListener = `useEffect(() => {
    if (!orders) return;
    const all = orders;
    setUnread(all.filter((o) => o.status === 'submitted').length);
    const submittedOrders = all.filter(o => o.status === 'submitted');
    const processingOrders = all.filter(o => o.status === 'processing');
    window.dispatchEvent(new CustomEvent('admin-context-update', {
      detail: {
        page: 'bulk-orders',
        totalBulkOrders: all.length,
        submittedCount: submittedOrders.length,
        processingCount: processingOrders.length,
        recentSubmitted: submittedOrders.slice(0, 5).map(o => ({ id: o.id, user: o.userEmail || o.userId, total: o.totalValue, status: o.status })),
        summary: \`Bulk Orders dashboard: \${all.length} bulk orders. \${submittedOrders.length} newly submitted, \${processingOrders.length} processing.\`
      }
    }));
  }, [orders]);`;
bulkContent = bulkContent.replace(oldListener, newListener);

bulkContent = bulkContent.replace(
  /const filtered = orders\.filter/g,
  "const filtered = (orders || []).filter"
);
bulkContent = bulkContent.replace(
  /stats = \{\s+submitted: orders/g,
  "stats = {\n    submitted: (orders || [])"
);
bulkContent = bulkContent.replace(
  /const stats = \{\n\s+submitted: \(orders \|\| \[\]\)\.filter\(\(o\) => o\.status === 'submitted'\)\.length,\n\s+confirmed: orders/g,
  "const stats = {\n    submitted: (orders || []).filter((o) => o.status === 'submitted').length,\n    confirmed: (orders || [])"
);
bulkContent = bulkContent.replace(
  /confirmed: \(orders \|\| \[\]\)\.filter\(\(o\) => o\.status === 'confirmed'\)\.length,\n\s+shipped: orders/g,
  "confirmed: (orders || []).filter((o) => o.status === 'confirmed').length,\n    shipped: (orders || [])"
);
bulkContent = bulkContent.replace(
  /shipped: \(orders \|\| \[\]\)\.filter\(\(o\) => o\.status === 'shipped'\)\.length,\n\s+delivered: orders/g,
  "shipped: (orders || []).filter((o) => o.status === 'shipped').length,\n    delivered: (orders || [])"
);
bulkContent = bulkContent.replace(
  /delivered: \(orders \|\| \[\]\)\.filter\(\(o\) => o\.status === 'delivered'\)\.length,\n\s+total: orders\.length/g,
  "delivered: (orders || []).filter((o) => o.status === 'delivered').length,\n    total: totalCount || (orders || []).length"
);
bulkContent = bulkContent.replace(
  /draft'\)\.length\}\)`\), color:/g,
  "draft').length})`, color:" // Just making sure orders is safe: it's safe because orders fallback to [] above. But let's fix orders.filter
);
bulkContent = bulkContent.replace(
  /orders\.filter\(o => o\.status === 'draft'\)\.length/g,
  "(orders || []).filter(o => o.status === 'draft').length"
);

// Add GlobalSearchBar and Skeleton
const oldTableBlock = /<Card style=\{\{ overflow: 'visible', padding: 0 \}\}>[\s\S]*?<\/Card>/;
const newTableBlock = `<div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search bulk orders by wholesaler..."
          resultCount={loading ? undefined : filtered.length}
        />
      </div>
      
      <Card style={{ overflow: 'visible', padding: 0 }}>
        {loading && (!orders || orders.length === 0) ? (
          <DataTableSkeleton columns={5} rows={8} />
        ) : (
          <>
            <DataTable
              data={filtered}
              columns={columns}
              keyField="id"
              expandableRender={(o) => renderOrderDetails(o, handleUpdate)}
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search by wholesaler name or email..."
              renderCustomFilters={() => (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: \`All (\${stats.total})\`, color: 'var(--color-primary)' },
                    { key: 'draft', label: \`Drafts (\${(orders || []).filter(o => o.status === 'draft').length})\`, color: 'var(--color-text-tertiary)' },
                    { key: 'submitted', label: \`Pending (\${stats.submitted})\`, color: '#6366f1' },
                    { key: 'confirmed', label: \`Confirmed (\${stats.confirmed})\`, color: 'var(--color-success)' },
                    { key: 'shipped', label: \`Shipped (\${stats.shipped})\`, color: '#f59e0b' },
                    { key: 'delivered', label: \`Delivered (\${stats.delivered})\`, color: 'var(--color-success)' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border: \`1px solid \${filterStatus === f.key ? f.color : 'var(--color-border)'}\`,
                        background: filterStatus === f.key ? \`\${f.color}0d\` : 'var(--color-bg-surface)',
                        color: filterStatus === f.key ? f.color : 'var(--color-text-secondary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        transition: 'all 0.12s',
                        fontFamily: 'inherit',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
              emptyTitle="No bulk orders found"
              emptyDescription={filterStatus !== 'all' ? 'No bulk orders found with this status.' : 'No bulk orders from wholesalers yet.'}
            />
            {hasMore && (
              <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <button className="gcp-btn-secondary" onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </Card>`;

bulkContent = bulkContent.replace(oldTableBlock, newTableBlock);

fs.writeFileSync('src/components/admin/AdminBulkOrdersTab.jsx', bulkContent);

console.log('Phase A refactoring complete');
