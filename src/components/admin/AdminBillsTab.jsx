import React from 'react';
import { Receipt } from 'lucide-react';
import AdminPageHeader from './AdminPageHeader';
import BillsWidget from '../widgets/purchase/BillsWidget';

export default function AdminBillsTab() {
  return (
    <div>
      <AdminPageHeader
        title="Supplier Bills"
        subtitle="Manage incoming invoices and bills from suppliers."
        icon={Receipt}
      />
      <BillsWidget collectionName="purchaseBills" readOnly={false} compact={false} />
    </div>
  );
}
