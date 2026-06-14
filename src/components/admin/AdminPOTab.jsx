import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React from 'react';

import AdminPageHeader from './AdminPageHeader';
import POWidget from '../widgets/purchase/POWidget';

export default function AdminPOTab() {
  return (
    <div>
      <AdminPageHeader
        title="Purchase Orders"
        subtitle="Manage official orders sent to suppliers."
        icon={ShoppingCart}
      />
      <POWidget collectionName="purchaseOrders" readOnly={false} compact={false} />
    </div>
  );
}