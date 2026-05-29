import React from 'react';
import { useAuth } from '../../context/AuthContext';
import OrdersTab from '../admin/OrdersTab';

export default function ManagerOrdersTab() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div style={{ padding: '0 1rem' }}>
      <OrdersTab accountManagerId={currentUser.uid} readOnly={true} />
    </div>
  );
}
