const fs = require('fs');
const file = 'src/components/admin/AdminWholesellersTab.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import \{ StatusChip \} from '\.\.\/ui';\nimport \{ Tabs, StatusChip \} from '\.\.\/ui';/, "import { Tabs, StatusChip } from '../ui';");
fs.writeFileSync(file, content);
