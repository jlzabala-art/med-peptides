const fs = require('fs');
let file = 'src/components/admin/AdminAccountManagersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace select
content = content.replace(
  /<select[\s\S]+?<\/select>/,
  `<Select
                      defaultValue={manager.wholesellerId || ''}
                      onChange={(e) => onUpdate(manager.id, { wholesellerId: e.target.value })}
                      options={[
                        { label: '-- Unassigned --', value: '' },
                        ...orgOptions.map(org => ({ label: org.name, value: org.id }))
                      ]}
                    />`
);

// Replace checkbox with Toggle
content = content.replace(
  /<input\s+type="checkbox"\s+checked=\{!manager\.disabled\}\s+onChange=\{\(e\) => onUpdate\(manager\.id, \{ disabled: !e\.target\.checked \}\)\}\s+style=\{\{ width: '18px', height: '18px' \}\}\s+\/>/,
  `<Toggle checked={!manager.disabled} onChange={(checked) => onUpdate(manager.id, { disabled: !checked })} />`
);
// Wait, the label "Account Active" is right next to it:
content = content.replace(
  /<label[\s\S]+?Account Active\s+<\/span>\s+<\/label>/,
  `<Toggle label="Account Active" checked={!manager.disabled} onChange={(checked) => onUpdate(manager.id, { disabled: !checked })} />`
);

// Replace input text with TextField
content = content.replace(
  /<input\s+type="text"\s+defaultValue=\{manager\.phone \|\| ''\}\s+onBlur=\{\(e\) => onUpdate\(manager\.id, \{ phone: e\.target\.value \}\)\}\s+style=\{\{[^\}]+\}\}\s+\/>/,
  `<TextField defaultValue={manager.phone || ''} onBlur={(e) => onUpdate(manager.id, { phone: e.target.value })} />`
);

// Add imports
if (!content.includes('TextField')) {
  content = content.replace(
    /import \{ Tabs, StatusChip \} from '\.\.\/ui';/,
    "import { Tabs, StatusChip, TextField, Select, Toggle } from '../ui';"
  );
}

fs.writeFileSync(file, content);
