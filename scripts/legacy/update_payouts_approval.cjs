const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/gadgets/PayoutManagerWidget.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update imports
if (!content.includes('addDoc')) {
  content = content.replace(
    "import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';",
    "import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';"
  );
}

// Modify handleApprove
const oldApprove = `  const handleApprove = (id) => {
    // Demo action
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'processing' } : p)));
  };`;

const newApprove = `  const handleApprove = async (id) => {
    const payout = payouts.find(p => p.id === id);
    if (!payout) return;

    if (payout.amount >= 1000) {
      // Send to CFO Approval Queue
      try {
        await addDoc(collection(db, 'financial_approvals'), {
          type: 'payout_auth',
          status: 'pending',
          data: {
            payoutId: id,
            amount: payout.amount,
            recipientName: payout.doctorName
          },
          requestedBy: activeRole || 'Admin',
          createdAt: new Date().toISOString()
        });
        alert('High-value payout routed to CFO for approval.');
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p)));
      } catch (err) {
        console.error('Error queueing approval', err);
      }
    } else {
      // Normal flow
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'processing' } : p)));
    }
  };`;

if (content.includes('const handleApprove = (id) => {') || content.includes('const handleApprove = (id) => {\n')) {
  content = content.replace(oldApprove, newApprove);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated PayoutManagerWidget.jsx for approvals');
} else {
  console.log('handleApprove logic already updated or not found');
}
