const fs = require('fs');

// 1. Refactor AdminAccountManagersTab.jsx
let accContent = fs.readFileSync('src/components/admin/AdminAccountManagersTab.jsx', 'utf8');

accContent = accContent.replace(
  "import AppFilterBar from '../ui/AppFilterBar';",
  "import AppFilterBar from '../ui/AppFilterBar';\nimport { useAccountManagers } from '../../hooks/admin/useAccountManagers';\nimport GlobalSearchBar from '../ui/GlobalSearchBar';\nimport DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';\nimport AdminPageHeader from './AdminPageHeader';"
);

// Replace state and fetchData
const oldAccState = /const \[managers, setManagers\] = useState\(\[\]\);\n\s+const \[wholesellers, setWholesellers\] = useState\(\{\}\);\n\s+const \[loading, setLoading\] = useState\(true\);/;
const newAccState = `const { accountManagers: paginatedManagers, loading: loadingManagers, hasMore, loadMore, fetchAccountManagers: refreshManagers, totalCount } = useAccountManagers({ pageSize: 50 });
  const [wholesellers, setWholesellers] = useState({});
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const loading = loadingManagers || loadingMetadata;
  const managers = paginatedManagers || [];`;
accContent = accContent.replace(oldAccState, newAccState);

const oldFetchAcc = /const fetchData = async \(\) => \{[\s\S]*?finally \{\s+setLoading\(false\);\s+\}\s+\};/;
const newFetchAcc = `const fetchData = async () => {
    try {
      setLoadingMetadata(true);
      const wsSnap = await getDocs(collection(db, 'wholesellers'));
      const wsMap = {};
      wsSnap.docs.forEach((d) => {
        wsMap[d.id] = d.data().companyName || d.data().name || 'Unnamed Org';
      });
      setWholesellers(wsMap);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load wholesellers');
    } finally {
      setLoadingMetadata(false);
    }
  };`;
accContent = accContent.replace(oldFetchAcc, newFetchAcc);

// Replace Header with AdminPageHeader and GlobalSearchBar
const oldAccHeader = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var\(--border\)' \}\}>[\s\S]*?<\/div>\n\n\s+<div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat/;
const newAccHeader = `<AdminPageHeader
        title="Account Managers"
        subtitle="Manage commercial representatives, territories, clinics, and assignments."
        icon={Users}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Download size={16} /> <span className="hide-mobile">Export</span>
            </button>
            <button className="btn btn-outline" onClick={() => setIsWizardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Mail size={16} /> <span className="hide-mobile">Invite Manager</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Add Manager
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat`;
accContent = accContent.replace(oldAccHeader, newAccHeader);

// Search/Filter replace with GlobalSearchBar
const oldAccSearch = /{/\* SECTION 3: Search \+ Filters \*/}
\s+<div style=\{\{ display: 'flex', gap: '0.75rem', alignItems: 'center' \}\}>
\s+<div style=\{\{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var\(--surface\)', border: '1px solid var\(--border\)', borderRadius: 'var\(--radius-md\)', padding: '0.5rem 0.75rem' \}\}>
\s+<Search size=\{16\} color="var\(--text-muted\)" \/>
\s+<input 
\s+type="text" 
\s+placeholder="Search by name, email, or territory..." 
\s+value=\{searchTerm\}
\s+onChange=\{\(e\) => setSearchTerm\(e.target.value\)\}
\s+style=\{\{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' \}\}
\s+\/>
\s+<\/div>/;

const newAccSearch = `{/* SECTION 3: Search + Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <GlobalSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email, or territory..."
            resultCount={loading ? undefined : filtered.length}
          />
        </div>`;
accContent = accContent.replace(oldAccSearch, newAccSearch);

// Replace DataTable call
const oldAccTable = /<DataTable\s+data=\{filtered\}\s+columns=\{columns\}\s+keyField="id"\s+loading=\{loading\}\s+selectable=\{true\}\s+selectedRows=\{selectedRows\}\s+onSelectionChange=\{setSelectedRows\}\s+onRowClick=\{\(row\) => setSelectedManager\(row\)\}\s+\/>/g;
const newAccTable = `{loading && (!managers || managers.length === 0) ? (
            <DataTableSkeleton columns={5} rows={8} />
          ) : (
            <>
              <DataTable
                data={filtered}
                columns={columns}
                keyField="id"
                loading={loading}
                selectable={true}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={(row) => setSelectedManager(row)}
              />
              {hasMore && (
                <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                  <button className="gcp-btn-secondary" onClick={loadMore} disabled={loadingManagers}>
                    {loadingManagers ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}`;
accContent = accContent.replace(oldAccTable, newAccTable);

// We need to remove the update state manually because it's now controlled by hook
accContent = accContent.replace(
  /setManagers\(\(prev\) => prev\.map\(\(m\) => \(m\.id === id \? \{ \.\.\.m, \.\.\.data \} : m\)\)\);/g,
  "refreshManagers();"
);
accContent = accContent.replace(
  /setManagers\(prev => prev\.filter\(m => m\.id !== id\)\);/g,
  "refreshManagers();"
);

fs.writeFileSync('src/components/admin/AdminAccountManagersTab.jsx', accContent);
console.log('Account Managers Tab updated');
