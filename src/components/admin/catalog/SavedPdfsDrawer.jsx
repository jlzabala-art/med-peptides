'use client';
import React from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import CatalogTrackingTable from './CatalogTrackingTable';

export default function SavedPdfsDrawer({ isOpen, onClose }) {
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="1060px"
      title="Catalog & Quotation Tracking (CRM)"
      subtitle="Audit history, client distributions, account managers & commercial follow-ups"
    >
      <div style={{ padding: '0.25rem 0 1.5rem 0' }}>
        <CatalogTrackingTable />
      </div>
    </StandardDrawer>
  );
}

