const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'src/components/admin/AdminUsersTab.jsx', setter: 'setSearchQuery', param: 'search' },
  { file: 'src/components/admin/AdminVariantsTab.jsx', setter: 'setSearchTerm', param: 'search' },
  { file: 'src/components/admin/AdminLeadsTab.jsx', setter: 'setSearchTerm', param: 'search' },
  { file: 'src/components/admin/AdminInvitationsTab.jsx', setter: 'setSearchQuery', param: 'search' },
  { file: 'src/components/admin/AdminRFQTab.jsx', setter: 'setSearchTerm', param: 'rfqId' },
  { file: 'src/components/admin/AdminBulkOrdersTab.jsx', setter: 'setSearchTerm', param: 'search' },
  { file: 'src/components/admin/SkuMappingTab/AdminSkuMappingTab.jsx', setter: 'setSearchQuery', param: 'search' },
  { file: 'src/components/admin/AdminWholesellersTab.jsx', setter: 'setSearchTerm', param: 'search' },
];

for (const target of targets) {
  const filePath = path.join(__dirname, target.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Not found: ${target.file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already injected
  if (content.includes('const deepLinkSearch = params.get')) {
    console.log(`Already injected in ${target.file}`);
    continue;
  }

  // 1. Add useLocation import if needed
  if (!content.includes('useLocation')) {
    if (content.includes('react-router-dom')) {
      content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];/, (match, p1) => {
        return `import { ${p1}, useLocation } from 'react-router-dom';`;
      });
    } else {
      content = content.replace(
        "import React",
        "import { useLocation } from 'react-router-dom';\nimport React"
      );
    }
  }

  // 2. Find where the setter is defined and insert the useEffect below it
  const searchRegex = new RegExp(`const\\s+\\[[^,]+,\\s*${target.setter}\\]\\s*=\\s*useState\\([^)]*\\);`);
  const match = content.match(searchRegex);
  
  if (match) {
    const injection = `
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('${target.param}');

  useEffect(() => {
    if (deepLinkSearch) {
      ${target.setter}(deepLinkSearch);
    }
  }, [deepLinkSearch]);
`;
    content = content.replace(match[0], match[0] + injection);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected in ${target.file}`);
  } else {
    console.error(`Could not find setter in ${target.file}`);
  }
}
