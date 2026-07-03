const fs = require('fs');

let content = fs.readFileSync('src/hooks/admin/useAccountManagers.js', 'utf8');
content = content.replace(
  "'account_managers', {",
  "'users', {\n    ...options,\n    additionalConstraints: [\n      ...(options.additionalConstraints || []),\n      ['role', '==', 'account_manager']\n    ],"
);
fs.writeFileSync('src/hooks/admin/useAccountManagers.js', content);
