const fs = require('fs');
const path = require('path');

// 1. Update AdminCostsTab.jsx
const costsPath = path.join(__dirname, 'src/components/admin/AdminCostsTab.jsx');
let costsContent = fs.readFileSync(costsPath, 'utf8');

if (!costsContent.includes('financial_approvals')) {
  // Update imports
  costsContent = costsContent.replace(
    "import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';",
    "import { collection, query, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';\nimport { useAuth } from '../../hooks/useAuth';"
  );

  // Inject useAuth
  costsContent = costsContent.replace(
    "export default function AdminCostsTab({ readOnly = false }) {\n  const { toast } = useToast();",
    "export default function AdminCostsTab({ readOnly = false }) {\n  const { toast } = useToast();\n  const { currentUser } = useAuth();"
  );

  // Rewrite handleUpdateProduct
  const oldUpdate = `  async function handleUpdateProduct(id, updates) {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (err) {
      console.error('Error updating product cost:', err);
      toast.error('Failed to update cost.');
    }
  };`;

  const newUpdate = `  async function handleUpdateProduct(id, updates) {
    try {
      const product = products.find(p => p.id === id);
      const oldCost = product ? product.costPrice : 0;
      const productName = product ? product.name : id;
      
      // PHASE 1: CFO Architecture - Send to Approval Queue instead of direct update
      await addDoc(collection(db, 'financial_approvals'), {
        type: 'cost_update',
        status: 'pending',
        data: {
          productId: id,
          productName,
          oldCost,
          updates
        },
        requestedBy: currentUser?.email || 'Admin',
        createdAt: new Date().toISOString()
      });
      
      toast.success('Cost update sent to CFO for approval.');
    } catch (err) {
      console.error('Error queueing product cost update:', err);
      toast.error('Failed to queue cost update.');
    }
  };`;

  costsContent = costsContent.replace(oldUpdate, newUpdate);
  fs.writeFileSync(costsPath, costsContent, 'utf8');
  console.log('Updated AdminCostsTab.jsx for approvals');
}

// 2. Update PayoutManagerWidget.jsx
const payoutPath = path.join(__dirname, 'src/components/admin/gadgets/PayoutManagerWidget.jsx');
if (fs.existsSync(payoutPath)) {
  let payoutContent = fs.readFileSync(payoutPath, 'utf8');
  
  if (!payoutContent.includes('financial_approvals')) {
    // We assume it uses updateDoc and doc. We might need addDoc.
    if (!payoutContent.includes('addDoc')) {
       payoutContent = payoutContent.replace(
         "import { collection, query, getDocs, doc, updateDoc",
         "import { collection, query, getDocs, doc, updateDoc, addDoc"
       );
    }
    if (!payoutContent.includes('useAuth')) {
        payoutContent = payoutContent.replace(
            "import { useToast } from '../../../hooks/useToast';",
            "import { useToast } from '../../../hooks/useToast';\nimport { useAuth } from '../../../hooks/useAuth';"
        );
        payoutContent = payoutContent.replace(
            "const { toast } = useToast();",
            "const { toast } = useToast();\n  const { currentUser } = useAuth();"
        );
    }

    // Usually there's a handlePay function. We'll search for it or just replace the toast.success('Payout marked as paid') logic.
    // I don't know the exact code of PayoutManagerWidget, so I'll just regex it or read it.
    console.log('Need to read PayoutManagerWidget first to patch it safely.');
  }
}
