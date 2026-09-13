'use client';
import React from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import CatalogTrackingTable from './CatalogTrackingTable';

export default function SavedPdfsDrawer({ isOpen, onClose }) {
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="1080px"
      title="Trazabilidad & Historial de Compartidos (Shares & CRM)"
      subtitle="Auditoría de etiquetas, catálogos, fichas técnicas y cotizaciones compartidas por destinatario y canal"
    >
      <div style={{ padding: '0.25rem 0 1.5rem 0' }}>
        <CatalogTrackingTable />
      </div>
    </StandardDrawer>
  );
}

