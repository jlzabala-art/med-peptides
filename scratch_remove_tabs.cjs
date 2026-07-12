const fs = require('fs');
const path = './src/components/prescriptions/PrescriptionDetailModal.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('function OverviewTab({ rx }) {'));
const endIdx = lines.findIndex(l => l.includes("const TABS = ['Overview', 'Items', 'Follow-Up', 'Documents', 'Timeline'];"));

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = [
        ...lines.slice(0, startIdx),
        "import OverviewTab from './tabs/OverviewTab';",
        "import ItemsTab from './tabs/ItemsTab';",
        "import FollowUpTab from './tabs/FollowUpTab';",
        "import DocumentsTab from './tabs/DocumentsTab';",
        "import TimelineTab from './tabs/TimelineTab';",
        "",
        ...lines.slice(endIdx)
    ].join('\n');
    fs.writeFileSync(path, newContent);
    console.log("Successfully removed inline tabs and added imports.");
} else {
    console.log("Could not find boundaries", startIdx, endIdx);
}
