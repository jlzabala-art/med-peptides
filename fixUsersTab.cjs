const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminUsersTab.jsx', 'utf8');

// The new variable is totalUsersCount (aliased from totalCount)
// We need to remove the old state declarations.
content = content.replace(/const \[pageSize, setPageSize\] = useState\(20\);\s*const \[currentPage, setCurrentPage\] = useState\(1\);\s*const \[totalPages, setTotalPages\] = useState\(1\);\s*const \[totalUsersCount, setTotalUsersCount\] = useState\(0\);\s*const \[pageCursors, setPageCursors\] = useState\(\{\}\);.*?\n/, '');

fs.writeFileSync('src/components/admin/AdminUsersTab.jsx', content);
