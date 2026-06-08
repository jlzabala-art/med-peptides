const fs = require('fs');
let file = 'src/components/admin/AdminCompetitorsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<input type="text" value=\{newCompName\} onChange=\{e => setNewCompName\(e\.target\.value\)\} placeholder="e\.g\. Acme Peptides" style=\{\{[^\}]+\}\} \/>/,
  '<TextField type="text" value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Acme Peptides" />'
);

content = content.replace(
  /<input type="text" value=\{newCompUrl\} onChange=\{e => setNewCompUrl\(e\.target\.value\)\} placeholder="https:\/\/\.\.\." style=\{\{[^\}]+\}\} \/>/,
  '<TextField type="text" value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="https://..." />'
);

// Add import TextField
if (!content.includes('TextField')) {
  content = content.replace(
    /import \{ Tabs, StatusChip \} from '\.\.\/ui';/,
    "import { Tabs, StatusChip, TextField } from '../ui';"
  );
}

fs.writeFileSync(file, content);
