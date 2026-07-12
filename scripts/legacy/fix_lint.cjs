const fs = require('fs');
let file = 'src/components/admin/AdminAccountManagersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// fix unused getDoc
content = content.replace(/import \{ collection, query, where, getDocs, doc, updateDoc, getDoc \} from 'firebase\/firestore';/, "import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';");

// fix unused tabs variable
content = content.replace(/  const tabs = \[\n    \{ id: 'profile', label: 'Operational Profile', icon: Briefcase \},\n    \{ id: 'contact', label: 'Contact & Routing', icon: Phone \},\n  \];\n/, "");

fs.writeFileSync(file, content);
console.log('patched');
