const fs = require('fs');
const file = 'src/components/admin/AdminHomeLayoutTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// import Tabs from ui
content = content.replace(/import \{[\s\S]+?\} from '\.\.\/\.\.\/hooks\/useHomeLayout';/, 
`$&
import { Tabs } from '../ui';`);

const audienceTabsRegex = /\{\/\* Audience tabs \*\/\}[\s\S]+?\{\/\* Section list \*\/\}/;

content = content.replace(audienceTabsRegex, 
`{/* Audience tabs replaced with Tabs component */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0 1.5rem' }}>
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={ALL_ROLES.map(role => ({
              id: role,
              label: ROLE_METADATA[role].label,
              icon: ROLE_METADATA[role].icon,
              content: null // Content is rendered outside to avoid remounting issues if needed, or we can just wrap it
            }))}
          />
        </div>
        {/* Section list */}`);

// We need to remove the flex:1 wrapper from Tabs if content is null, but actually it's easier to just map the content inside.

fs.writeFileSync(file, content);
console.log('patched');
