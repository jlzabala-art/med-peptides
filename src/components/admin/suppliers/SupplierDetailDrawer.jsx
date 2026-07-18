import React from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import SupplierDetail from './SupplierDetail';

export default function SupplierDetailDrawer({ isOpen, onClose, supplier }) {
  if (!isOpen || !supplier) return null;
  
  return (
    <StandardDrawer
      title="Supplier Details"
      isOpen={isOpen}
      onClose={onClose}
    >
      <SupplierDetail w={supplier} onClose={onClose} />
    </StandardDrawer>
  );
}
