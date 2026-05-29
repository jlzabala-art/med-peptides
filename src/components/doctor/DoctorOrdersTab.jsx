import React from 'react';
import OrdersTab from '../admin/OrdersTab';

export default function DoctorOrdersTab({ doctorId }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <OrdersTab 
        doctorId={doctorId}
        readOnly={true} 
      />
    </div>
  );
}
