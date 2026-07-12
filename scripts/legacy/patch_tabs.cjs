const fs = require('fs');
const file = 'src/components/ui/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{\/\* Tab Content \*\/\}\n[\s\S]+?<\/div>/, 
`{/* Tab Content */}
      {activeContent !== undefined && activeContent !== null && (
        <div style={{ flex: 1, paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeContent}
        </div>
      )}`);

fs.writeFileSync(file, content);
console.log('patched tabs');
