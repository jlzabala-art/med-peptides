const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminUsersTab.jsx', 'utf8');

// 1. Add useUsers import
content = content.replace(
  "import { useAuth } from '../../context/AuthContext';",
  "import { useAuth } from '../../context/AuthContext';\nimport { useUsers } from '../../hooks/admin/useUsers';\nimport AdminPageHeader from '../ui/AdminPageHeader';\nimport GlobalSearchBar from '../ui/GlobalSearchBar';\nimport DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';"
);

// 2. Remove manual state
const manualStateRegex = /const \[users, setUsers\] = useState\(\[\]\);\s+const \[userOrdersMap, setUserOrdersMap\] = useState\(\{\}\);\s+const \[loadingUserOrders, setLoadingUserOrders\] = useState\(\{\}\);\s+const \[loading, setLoading\] = useState\(true\);/;
const hookReplacement = `const [userOrdersMap, setUserOrdersMap] = useState({});
  const [loadingUserOrders, setLoadingUserOrders] = useState({});
  const { users, loading, hasMore, loadMore, fetchUsers: refreshUsers, totalCount: totalUsersCount } = useUsers({ pageSize: 20 });
`;
content = content.replace(manualStateRegex, hookReplacement);

// 3. Remove pagination state
content = content.replace(/const \[pageSize, setPageSize\] = useState\(20\);\n  const \[currentPage, setCurrentPage\] = useState\(1\);\n  const \[totalPages, setTotalPages\] = useState\(1\);\n  const \[totalUsersCount, setTotalUsersCount\] = useState\(0\);\n  const \[pageCursors, setPageCursors\] = useState\(\{\}\);\n/, '');

// 4. We need to preserve the relationship fetching. Let's do that in a separate useEffect
const fetchUsersRegex = /const fetchUsers = async \(page = 1, size = pageSize, forceRefresh = false, searchQuery = ''\) => \{[\s\S]*?finally \{\s+setLoading\(false\);\s+\}\s+\}/;

const newFetchMetadata = `
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const relSnap = await getDocs(
          query(collection(db, 'doctor_patient_relationships'), where('status', '==', 'active'))
        );
        const relsList = relSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllRelationships(relsList);
        
        const assignedIds = new Set();
        relsList.forEach(data => {
          if (data.patientId) assignedIds.add(data.patientId);
          if (data.doctorId) assignedIds.add(data.doctorId);
        });
        setActiveAssignments(assignedIds);

        const ordersSnap = await getDocs(query(collection(db, 'orders')));
        const buyerIds = new Set();
        const buyerEmails = new Set();
        ordersSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.userId) buyerIds.add(data.userId);
          if (data.paymentOwnerId) buyerIds.add(data.paymentOwnerId);
          if (data.customer?.email) buyerEmails.add(data.customer.email.toLowerCase().trim());
        });
        setPurchasedUserIds(buyerIds);
        setPurchasedEmails(buyerEmails);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);
`;
content = content.replace(fetchUsersRegex, newFetchMetadata);

// Remove useEffect that calls fetchUsers(1) initially
content = content.replace(/useEffect\(\(\) => \{\s+fetchUsers\(1, pageSize, true, searchQuery\);\s+\}, \[roleFilter, showArchived, searchQuery\]\);/, '');

// 5. Replace header with AdminPageHeader and GlobalSearchBar
const headerRegex = /<div\s+className="admin-header"[\s\S]*?<\/div>\s+<\/div>/;
const newHeader = `<AdminPageHeader 
        title="Users & Access" 
        description="Manage system users, roles, and access controls."
        badge={totalUsersCount}
        actionLabel="New User"
        onAction={() => setIsCreateModalOpen(true)}
      />

      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <GlobalSearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by name, email or ID..."
        />
      </div>`;

content = content.replace(headerRegex, newHeader);

// Replace AdminUsersTable call
const tableCallRegex = /<AdminUsersTable\s+users=\{filteredUsersList\}\s+readOnly=\{readOnly\}\s+onRefresh=\{fetchUsers\}\s+defaultRole=\{defaultRole\}\s+\/>/;
const newTableCall = `
      {loading && users.length === 0 ? (
        <DataTableSkeleton columns={5} rows={10} />
      ) : (
        <>
          <AdminUsersTable
            users={filteredUsersList}
            readOnly={readOnly}
            onRefresh={refreshUsers}
            defaultRole={defaultRole}
          />
          {hasMore && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <button className="gcp-btn-secondary" onClick={loadMore}>
                Load More
              </button>
            </div>
          )}
        </>
      )}
`;
content = content.replace(tableCallRegex, newTableCall);

fs.writeFileSync('src/components/admin/AdminUsersTab.jsx', content);
console.log('Update complete.');
