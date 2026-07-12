const fs = require('fs');
const file = 'src/components/ui/StatusChip.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/case 'accepted':/, 
`case 'accepted':
    case 'active':`);

content = content.replace(/case 'awaiting payment':/, 
`case 'awaiting payment':
    case 'paused':`);

content = content.replace(/case 'rejected':/, 
`case 'rejected':
    case 'revoked':
    case 'inactive':`);

fs.writeFileSync(file, content);
console.log('patched');
